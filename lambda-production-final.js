const https = require('https');

// Production configuration
const GOOGLE_CLIENT_ID = '351616911983-o8247sq5qaaq8ioles657e5t8nt12bll.apps.googleusercontent.com';
const ADMIN_EMAILS = ['harshaan.chugh@gmail.com', 'Pc104861@student.musd.org'];
const TABLE_NAME = 'paintitforward-production-HoursTable';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

// Verify Google OAuth token
async function verifyGoogleToken(token) {
    return new Promise((resolve, reject) => {
        const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`;
        
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const tokenInfo = JSON.parse(data);
                    if (tokenInfo.aud === GOOGLE_CLIENT_ID && tokenInfo.email) {
                        resolve({
                            email: tokenInfo.email,
                            name: tokenInfo.name,
                            verified: tokenInfo.email_verified === 'true'
                        });
                    } else {
                        reject(new Error('Invalid token'));
                    }
                } catch (error) {
                    reject(error);
                }
            });
        }).on('error', reject);
    });
}

exports.handler = async (event) => {
    console.log('Event:', JSON.stringify(event, null, 2));
    
    const { requestContext, body, headers } = event;
    const { http } = requestContext;
    const { method, path } = http;
    
    try {
        // Handle CORS preflight
        if (method === 'OPTIONS') {
            return {
                statusCode: 200,
                headers: corsHeaders,
                body: ''
            };
        }
        
        // GET /hours/total - Public endpoint, no auth required
        if (method === 'GET' && path === '/hours/total') {
            try {
                const AWS = require('aws-sdk');
                const dynamodb = new AWS.DynamoDB.DocumentClient({ region: 'us-west-1' });
                
                const result = await dynamodb.scan({
                    TableName: TABLE_NAME
                }).promise();
                
                const approvedItems = result.Items.filter(item => item.status === 'approved');
                const totalHours = approvedItems.reduce((sum, item) => sum + (parseFloat(item.hours) || 0), 0);
                
                return {
                    statusCode: 200,
                    headers: corsHeaders,
                    body: JSON.stringify({ totalHours: Math.round(totalHours * 10) / 10 })
                };
            } catch (error) {
                console.error('Error fetching total hours:', error);
                // Return 0 if table is empty or any error occurs
                return {
                    statusCode: 200,
                    headers: corsHeaders,
                    body: JSON.stringify({ totalHours: 0 })
                };
            }
        }
        
        // All other endpoints require authentication
        const authHeader = headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return {
                statusCode: 401,
                headers: corsHeaders,
                body: JSON.stringify({ error: 'Missing or invalid authorization header' })
            };
        }
        
        const token = authHeader.split(' ')[1];
        let user;
        
        try {
            user = await verifyGoogleToken(token);
        } catch (error) {
            console.error('Token verification failed:', error);
            return {
                statusCode: 401,
                headers: corsHeaders,
                body: JSON.stringify({ error: 'Invalid authentication token' })
            };
        }
        
        console.log('Authenticated user:', user);
        
        const AWS = require('aws-sdk');
        const dynamodb = new AWS.DynamoDB.DocumentClient({ region: 'us-west-1' });
        
        // POST /hours - Create new hour entry
        if (method === 'POST' && path === '/hours') {
            const data = JSON.parse(body || '{}');
            const { startTime, endTime, hours, description } = data;
            
            if (!startTime || !endTime || !hours) {
                return {
                    statusCode: 400,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'Missing required fields: startTime, endTime, hours' })
                };
            }
            
            const item = {
                email: user.email,
                start_time: startTime,
                end_time: endTime,
                hours: parseFloat(hours),
                description: description || '',
                status: 'pending',
                created_at: new Date().toISOString(),
                user_name: user.name || user.email
            };
            
            try {
                await dynamodb.put({
                    TableName: TABLE_NAME,
                    Item: item
                }).promise();
                
                return {
                    statusCode: 200,
                    headers: corsHeaders,
                    body: JSON.stringify({ 
                        message: 'Hour entry created successfully',
                        item: item
                    })
                };
            } catch (error) {
                console.error('Error creating hour entry:', error);
                return {
                    statusCode: 500,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'Failed to create hour entry' })
                };
            }
        }
        
        // GET /hours - List user's hours
        if (method === 'GET' && path === '/hours') {
            try {
                const result = await dynamodb.query({
                    TableName: TABLE_NAME,
                    KeyConditionExpression: 'email = :email',
                    ExpressionAttributeValues: {
                        ':email': user.email
                    },
                    ScanIndexForward: false // Most recent first
                }).promise();
                
                return {
                    statusCode: 200,
                    headers: corsHeaders,
                    body: JSON.stringify({ hours: result.Items || [] })
                };
            } catch (error) {
                console.error('Error fetching user hours:', error);
                return {
                    statusCode: 200,
                    headers: corsHeaders,
                    body: JSON.stringify({ hours: [] })
                };
            }
        }
        
        // GET /admin/pending - Admin only: List pending hours
        if (method === 'GET' && path === '/admin/pending') {
            if (!ADMIN_EMAILS.includes(user.email)) {
                return {
                    statusCode: 403,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'Access denied. Admin privileges required.' })
                };
            }
            
            try {
                const result = await dynamodb.scan({
                    TableName: TABLE_NAME
                }).promise();
                
                const pendingItems = result.Items.filter(item => item.status === 'pending');
                
                return {
                    statusCode: 200,
                    headers: corsHeaders,
                    body: JSON.stringify({ pending_hours: pendingItems })
                };
            } catch (error) {
                console.error('Error fetching pending hours:', error);
                return {
                    statusCode: 200,
                    headers: corsHeaders,
                    body: JSON.stringify({ pending_hours: [] })
                };
            }
        }
        
        // PATCH /admin/hours/{email}/{start_time} - Admin only: Approve/reject hours
        if (method === 'PATCH' && path.startsWith('/admin/hours/')) {
            if (!ADMIN_EMAILS.includes(user.email)) {
                return {
                    statusCode: 403,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'Access denied. Admin privileges required.' })
                };
            }
            
            const pathParts = path.split('/');
            if (pathParts.length < 5) {
                return {
                    statusCode: 400,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'Invalid path format' })
                };
            }
            
            const targetEmail = decodeURIComponent(pathParts[3]);
            const startTime = decodeURIComponent(pathParts[4]);
            const { status } = JSON.parse(body || '{}');
            
            if (!['approved', 'rejected'].includes(status)) {
                return {
                    statusCode: 400,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'Status must be "approved" or "rejected"' })
                };
            }
            
            try {
                await dynamodb.update({
                    TableName: TABLE_NAME,
                    Key: {
                        email: targetEmail,
                        start_time: startTime
                    },
                    UpdateExpression: 'SET #status = :status, reviewed_by = :reviewer, reviewed_at = :timestamp',
                    ExpressionAttributeNames: {
                        '#status': 'status'
                    },
                    ExpressionAttributeValues: {
                        ':status': status,
                        ':reviewer': user.email,
                        ':timestamp': new Date().toISOString()
                    }
                }).promise();
                
                return {
                    statusCode: 200,
                    headers: corsHeaders,
                    body: JSON.stringify({ message: `Hour entry ${status} successfully` })
                };
            } catch (error) {
                console.error('Error updating hour entry:', error);
                return {
                    statusCode: 500,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'Failed to update hour entry' })
                };
            }
        }
        
        return {
            statusCode: 404,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Endpoint not found' })
        };
        
    } catch (error) {
        console.error('Unexpected error:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ 
                error: 'Internal server error',
                details: error.message
            })
        };
    }
};