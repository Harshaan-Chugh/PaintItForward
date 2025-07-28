const https = require('https');
const AWS = require('aws-sdk');

// Initialize DynamoDB client
const dynamodb = new AWS.DynamoDB.DocumentClient({ region: 'us-west-1' });

// Production configuration
const GOOGLE_CLIENT_ID = '351616911983-o8247sq5qaaq8ioles657e5t8nt12bll.apps.googleusercontent.com';
const ADMIN_EMAILS = ['harshaan.chugh@gmail.com', 'Pc104861@student.musd.org'];
const TABLE_NAME = 'HoursTable';

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

// Get total hours from DynamoDB
async function getTotalHours() {
    try {
        // For now, return 0 until we have actual data
        // Later we'll scan the table for approved entries
        return 0;
    } catch (error) {
        console.error('Error getting total hours:', error);
        return 0;
    }
}

// Create new hour entry
async function createHourEntry(user, body) {
    try {
        const data = JSON.parse(body);
        const { hours, description, date } = data;
        
        if (!hours || !description || !date) {
            throw new Error('Missing required fields: hours, description, date');
        }
        
        const startTime = new Date(date).toISOString();
        
        const params = {
            TableName: TABLE_NAME,
            Item: {
                user_email: user.email,
                start_time: startTime,
                hours: parseFloat(hours),
                description: description,
                status: 'pending',
                user_name: user.name,
                created_at: new Date().toISOString()
            }
        };
        
        await dynamodb.put(params).promise();
        
        return {
            message: 'Hour entry created successfully',
            entry: params.Item
        };
    } catch (error) {
        console.error('Error creating hour entry:', error);
        throw error;
    }
}

// Get user's hours
async function getUserHours(userEmail) {
    try {
        const params = {
            TableName: TABLE_NAME,
            KeyConditionExpression: 'user_email = :email',
            ExpressionAttributeValues: {
                ':email': userEmail
            },
            ScanIndexForward: false // Sort by start_time descending
        };
        
        const result = await dynamodb.query(params).promise();
        return result.Items;
    } catch (error) {
        console.error('Error getting user hours:', error);
        return [];
    }
}

// Get pending hours for admin
async function getPendingHours() {
    try {
        const params = {
            TableName: TABLE_NAME,
            IndexName: 'StatusIndex',
            KeyConditionExpression: '#status = :status',
            ExpressionAttributeNames: {
                '#status': 'status'
            },
            ExpressionAttributeValues: {
                ':status': 'pending'
            },
            ScanIndexForward: false
        };
        
        const result = await dynamodb.query(params).promise();
        return result.Items;
    } catch (error) {
        console.error('Error getting pending hours:', error);
        return [];
    }
}

// Update hour entry status
async function updateHourStatus(userEmail, startTime, status) {
    try {
        const params = {
            TableName: TABLE_NAME,
            Key: {
                user_email: userEmail,
                start_time: startTime
            },
            UpdateExpression: 'SET #status = :status, updated_at = :updated_at',
            ExpressionAttributeNames: {
                '#status': 'status'
            },
            ExpressionAttributeValues: {
                ':status': status,
                ':updated_at': new Date().toISOString()
            }
        };
        
        await dynamodb.update(params).promise();
        
        return {
            message: `Hour entry ${status} successfully`
        };
    } catch (error) {
        console.error('Error updating hour status:', error);
        throw error;
    }
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
            const totalHours = await getTotalHours();
            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({ totalHours })
            };
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
        
        // POST /hours - Create new hour entry
        if (method === 'POST' && path === '/hours') {
            try {
                const result = await createHourEntry(user, body);
                return {
                    statusCode: 201,
                    headers: corsHeaders,
                    body: JSON.stringify(result)
                };
            } catch (error) {
                return {
                    statusCode: 400,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: error.message })
                };
            }
        }
        
        // GET /hours - Get user's hours
        if (method === 'GET' && path === '/hours') {
            const hours = await getUserHours(user.email);
            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({ hours })
            };
        }
        
        // Admin endpoints - require admin privileges
        if (!ADMIN_EMAILS.includes(user.email)) {
            return {
                statusCode: 403,
                headers: corsHeaders,
                body: JSON.stringify({ error: 'Access denied. Admin privileges required.' })
            };
        }
        
        // GET /admin/pending - Admin only
        if (method === 'GET' && path === '/admin/pending') {
            const pendingHours = await getPendingHours();
            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({ pending_hours: pendingHours })
            };
        }
        
        // PATCH /admin/hours/{email}/{start_time} - Admin only
        if (method === 'PATCH' && path.startsWith('/admin/hours/')) {
            const pathParts = path.split('/');
            if (pathParts.length !== 5) {
                return {
                    statusCode: 400,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'Invalid path format' })
                };
            }
            
            const userEmail = decodeURIComponent(pathParts[3]);
            const startTime = decodeURIComponent(pathParts[4]);
            
            try {
                const requestBody = JSON.parse(body);
                const { status } = requestBody;
                
                if (!['approved', 'rejected'].includes(status)) {
                    throw new Error('Status must be "approved" or "rejected"');
                }
                
                const result = await updateHourStatus(userEmail, startTime, status);
                return {
                    statusCode: 200,
                    headers: corsHeaders,
                    body: JSON.stringify(result)
                };
            } catch (error) {
                return {
                    statusCode: 400,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: error.message })
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