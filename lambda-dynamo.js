const https = require('https');

// Production configuration
const GOOGLE_CLIENT_ID = '351616911983-o8247sq5qaaq8ioles657e5t8nt12bll.apps.googleusercontent.com';
const ADMIN_EMAILS = ['harshaan.chugh@gmail.com', 'Pc104861@student.musd.org'];
const TABLE_NAME = 'HoursTable';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

// Try to use either AWS SDK version available in Lambda runtime
let dynamodb = null;
let isSDKv3 = false;

// Check if AWS SDK v3 is available
try {
    const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
    const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
    
    const client = new DynamoDBClient({ region: 'us-west-1' });
    dynamodb = DynamoDBDocumentClient.from(client);
    isSDKv3 = true;
    console.log('Successfully initialized DynamoDB with AWS SDK v3');
} catch (v3Error) {
    console.log('AWS SDK v3 not available, trying v2:', v3Error.message);
    
    // Fallback to AWS SDK v2
    try {
        const AWS = require('aws-sdk');
        dynamodb = new AWS.DynamoDB.DocumentClient({ region: 'us-west-1' });
        isSDKv3 = false;
        console.log('Successfully initialized DynamoDB with AWS SDK v2');
    } catch (v2Error) {
        console.error('Both AWS SDK v3 and v2 failed:', v2Error);
        dynamodb = null;
    }
}

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

// Helper function to execute DynamoDB operations with correct SDK syntax
async function executeDBOperation(operation, params) {
    if (!dynamodb) {
        throw new Error('DynamoDB not initialized');
    }
    
    if (isSDKv3) {
        // AWS SDK v3 - use command pattern
        const { ScanCommand, PutCommand, QueryCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
        let command;
        
        switch (operation) {
            case 'scan':
                command = new ScanCommand(params);
                break;
            case 'put':
                command = new PutCommand(params);
                break;
            case 'query':
                command = new QueryCommand(params);
                break;
            case 'update':
                command = new UpdateCommand(params);
                break;
            default:
                throw new Error(`Unknown operation: ${operation}`);
        }
        
        return await dynamodb.send(command);
    } else {
        // AWS SDK v2 - use method with promise
        return await dynamodb[operation](params).promise();
    }
}

// Simple test to verify DynamoDB connectivity
async function testDynamoDB() {
    if (!dynamodb) {
        throw new Error('DynamoDB not initialized');
    }
    
    try {
        // Try a simple scan to test connectivity
        const result = await executeDBOperation('scan', {
            TableName: TABLE_NAME,
            Limit: 1
        });
        console.log('DynamoDB test successful, items found:', result.Count);
        return true;
    } catch (error) {
        console.error('DynamoDB test failed:', error);
        throw error;
    }
}

exports.handler = async (event) => {
    console.log('Event:', JSON.stringify(event, null, 2));
    console.log('DynamoDB status:', dynamodb ? 'initialized' : 'not available');
    
    const { requestContext, body, headers } = event;
    const { http } = requestContext;
    const { method, path } = http;
    
    // Add specific logging for failing endpoints
    if (path === '/admin/all' || path === '/admin/export' || path === '/admin/approve') {
        console.log('DEBUGGING FAILING ENDPOINT:', { method, path });
        console.log('Headers:', JSON.stringify(headers || {}, null, 2));
        console.log('Full requestContext:', JSON.stringify(requestContext || {}, null, 2));
    }
    
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
                if (!dynamodb) {
                    console.log('DynamoDB not available, returning 0');
                    return {
                        statusCode: 200,
                        headers: corsHeaders,
                        body: JSON.stringify({ totalHours: 0 })
                    };
                }
                
                await testDynamoDB(); // Test connectivity first
                
                const result = await executeDBOperation('scan', {
                    TableName: TABLE_NAME,
                    FilterExpression: '#status = :status',
                    ExpressionAttributeNames: {
                        '#status': 'status'
                    },
                    ExpressionAttributeValues: {
                        ':status': 'approved'
                    }
                });
                
                const approvedHours = (result.Items || [])
                    .reduce((sum, entry) => sum + (entry.hours || 0), 0);
                
                console.log('Total approved hours:', approvedHours, 'from', result.Items?.length || 0, 'approved entries');
                return {
                    statusCode: 200,
                    headers: corsHeaders,
                    body: JSON.stringify({ totalHours: Math.round(approvedHours * 10) / 10 })
                };
            } catch (error) {
                console.error('Error fetching total hours:', error);
                return {
                    statusCode: 200,
                    headers: corsHeaders,
                    body: JSON.stringify({ totalHours: 0 }) // Return 0 instead of error
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
        
        // POST /hours - Create new hour entry
        if (method === 'POST' && path === '/hours') {
            try {
                const data = JSON.parse(body);
                const { start_time, end_time, description } = data;
                
                if (!start_time || !end_time || !description) {
                    return {
                        statusCode: 400,
                        headers: corsHeaders,
                        body: JSON.stringify({ error: 'Missing required fields: start_time, end_time, description' })
                    };
                }
                
                // Calculate hours
                const startDate = new Date(start_time);
                const endDate = new Date(end_time);
                const diffMs = endDate.getTime() - startDate.getTime();
                const hours = diffMs / (1000 * 60 * 60);
                
                if (hours <= 0) {
                    return {
                        statusCode: 400,
                        headers: corsHeaders,
                        body: JSON.stringify({ error: 'End time must be after start time' })
                    };
                }
                
                const newEntry = {
                    user_email: user.email,
                    start_time: start_time,
                    user_name: user.name || 'Unknown',
                    end_time: end_time,
                    hours: parseFloat(hours.toFixed(2)),
                    description: description,
                    status: 'pending',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };
                
                if (!dynamodb) {
                    throw new Error('Database not available');
                }
                
                await testDynamoDB(); // Test connectivity first
                
                await executeDBOperation('put', {
                    TableName: TABLE_NAME,
                    Item: newEntry
                });
                
                console.log('Saved new entry to DynamoDB:', newEntry);
                
                return {
                    statusCode: 201,
                    headers: corsHeaders,
                    body: JSON.stringify({ 
                        message: 'Hours logged successfully!',
                        entry: newEntry
                    })
                };
            } catch (error) {
                console.error('Error saving hours:', error);
                return {
                    statusCode: 500,
                    headers: corsHeaders,
                    body: JSON.stringify({ 
                        error: 'Failed to save hours to database',
                        details: error.message
                    })
                };
            }
        }
        
        // GET /hours - Get user's hours
        if (method === 'GET' && path === '/hours') {
            try {
                if (!dynamodb) {
                    console.log('DynamoDB not available for user hours');
                    return {
                        statusCode: 200,
                        headers: corsHeaders,
                        body: JSON.stringify({ hours: [] })
                    };
                }
                
                await testDynamoDB(); // Test connectivity first
                
                const result = await executeDBOperation('scan', {
                    TableName: TABLE_NAME,
                    FilterExpression: 'user_email = :email',
                    ExpressionAttributeValues: {
                        ':email': user.email
                    }
                });
                
                const userHours = result.Items || [];
                console.log('Found', userHours.length, 'hours for user', user.email);
                return {
                    statusCode: 200,
                    headers: corsHeaders,
                    body: JSON.stringify({ hours: userHours })
                };
            } catch (error) {
                console.error('Error fetching user hours:', error);
                return {
                    statusCode: 200,
                    headers: corsHeaders,
                    body: JSON.stringify({ hours: [] }) // Return empty instead of error
                };
            }
        }
        
        // GET /admin/pending - Admin only
        if (method === 'GET' && path === '/admin/pending') {
            if (!ADMIN_EMAILS.includes(user.email)) {
                return {
                    statusCode: 403,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'Access denied. Admin privileges required.' })
                };
            }
            
            try {
                if (!dynamodb) {
                    return {
                        statusCode: 200,
                        headers: corsHeaders,
                        body: JSON.stringify({ pending_hours: [] })
                    };
                }
                
                await testDynamoDB(); // Test connectivity first
                
                const result = await executeDBOperation('scan', {
                    TableName: TABLE_NAME,
                    FilterExpression: '#status = :status',
                    ExpressionAttributeNames: {
                        '#status': 'status'
                    },
                    ExpressionAttributeValues: {
                        ':status': 'pending'
                    }
                });
                
                const pendingHours = result.Items || [];
                console.log('Found', pendingHours.length, 'pending hours for admin');
                return {
                    statusCode: 200,
                    headers: corsHeaders,
                    body: JSON.stringify({ pending_hours: pendingHours })
                };
            } catch (error) {
                console.error('Error fetching pending hours:', error);
                return {
                    statusCode: 500,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'Failed to fetch pending hours' })
                };
            }
        }
        
        // GET /admin/export - Admin only (export all volunteer data)
        if (method === 'GET' && path === '/admin/export') {
            console.log('Processing /admin/export request');
            if (!ADMIN_EMAILS.includes(user.email)) {
                console.log('Access denied for user:', user.email);
                return {
                    statusCode: 403,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'Access denied. Admin privileges required.' })
                };
            }
            
            console.log('Admin access granted for /admin/export');
            try {
                if (!dynamodb) {
                    return {
                        statusCode: 200,
                        headers: corsHeaders,
                        body: JSON.stringify({ error: 'Database not available' })
                    };
                }
                
                await testDynamoDB(); // Test connectivity first
                
                const result = await executeDBOperation('scan', {
                    TableName: TABLE_NAME
                });
                
                const allEntries = result.Items || [];
                
                // Create CSV content
                const csvHeaders = 'Email,Name,Start Time,End Time,Hours,Description,Status,Created At,Updated At\n';
                const csvRows = allEntries.map(entry => {
                    const formatDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleString() : 'Unknown';
                    return [
                        `"${entry.user_email}"`,
                        `"${entry.user_name || 'Unknown'}"`,
                        `"${formatDate(entry.start_time)}"`,
                        `"${formatDate(entry.end_time)}"`,
                        entry.hours,
                        `"${(entry.description || '').replace(/"/g, '""')}"`, // Escape quotes in description
                        entry.status,
                        `"${formatDate(entry.created_at)}"`,
                        `"${formatDate(entry.updated_at)}"`
                    ].join(',');
                }).join('\n');
                
                const csvContent = csvHeaders + csvRows;
                
                return {
                    statusCode: 200,
                    headers: {
                        ...corsHeaders,
                        'Content-Type': 'text/csv',
                        'Content-Disposition': `attachment; filename="volunteer-hours-${new Date().toISOString().split('T')[0]}.csv"`
                    },
                    body: csvContent
                };
            } catch (error) {
                console.error('Error exporting data:', error);
                return {
                    statusCode: 500,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'Failed to export data' })
                };
            }
        }
        
        // GET /admin/all - Admin only (get all volunteer submissions for web display)
        if (method === 'GET' && path === '/admin/all') {
            console.log('Processing /admin/all request');
            if (!ADMIN_EMAILS.includes(user.email)) {
                console.log('Access denied for user:', user.email);
                return {
                    statusCode: 403,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'Access denied. Admin privileges required.' })
                };
            }
            
            console.log('Admin access granted for /admin/all');
            try {
                if (!dynamodb) {
                    return {
                        statusCode: 200,
                        headers: corsHeaders,
                        body: JSON.stringify({ 
                            entries: [],
                            summary: {
                                totalVolunteers: 0,
                                totalHours: 0,
                                approvedHours: 0,
                                pendingHours: 0,
                                totalEntries: 0
                            }
                        })
                    };
                }
                
                await testDynamoDB(); // Test connectivity first
                
                const result = await executeDBOperation('scan', {
                    TableName: TABLE_NAME
                });
                
                const allEntries = (result.Items || []).sort((a, b) => {
                    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
                    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
                    return bTime - aTime;
                });
                
                // Calculate summary statistics
                const totalVolunteers = new Set(allEntries.map(e => e.user_email)).size;
                const totalHours = allEntries.reduce((sum, e) => sum + (e.hours || 0), 0);
                const approvedHours = allEntries.filter(e => e.status === 'approved').reduce((sum, e) => sum + (e.hours || 0), 0);
                const pendingHours = allEntries.filter(e => e.status === 'pending').reduce((sum, e) => sum + (e.hours || 0), 0);
                
                return {
                    statusCode: 200,
                    headers: corsHeaders,
                    body: JSON.stringify({ 
                        entries: allEntries,
                        summary: {
                            totalVolunteers,
                            totalHours: Math.round(totalHours * 10) / 10,
                            approvedHours: Math.round(approvedHours * 10) / 10,
                            pendingHours: Math.round(pendingHours * 10) / 10,
                            totalEntries: allEntries.length
                        }
                    })
                };
            } catch (error) {
                console.error('Error fetching all submissions:', error);
                return {
                    statusCode: 500,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'Failed to fetch submissions' })
                };
            }
        }
        
        // PATCH /admin/approve - Admin only
        if (method === 'PATCH' && path === '/admin/approve') {
            console.log('Processing /admin/approve request');
            if (!ADMIN_EMAILS.includes(user.email)) {
                console.log('Access denied for user:', user.email);
                return {
                    statusCode: 403,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'Access denied. Admin privileges required.' })
                };
            }
            
            console.log('Admin access granted for /admin/approve');
            try {
                const requestData = JSON.parse(body);
                const { email, start_time, status } = requestData;
                
                console.log('Approval request:', { email, start_time, status });
                
                if (!status || !['approved', 'rejected'].includes(status)) {
                    return {
                        statusCode: 400,
                        headers: corsHeaders,
                        body: JSON.stringify({ error: 'Invalid status. Must be "approved" or "rejected"' })
                    };
                }
                
                if (!dynamodb) {
                    throw new Error('Database not available');
                }
                
                await testDynamoDB(); // Test connectivity first
                
                const updateResult = await executeDBOperation('update', {
                    TableName: TABLE_NAME,
                    Key: {
                        user_email: email,
                        start_time: start_time
                    },
                    UpdateExpression: 'SET #status = :status, updated_at = :updated_at',
                    ExpressionAttributeNames: {
                        '#status': 'status'
                    },
                    ExpressionAttributeValues: {
                        ':status': status,
                        ':updated_at': new Date().toISOString(),
                        ':pending': 'pending'
                    },
                    ConditionExpression: '#status = :pending',
                    ReturnValues: 'ALL_NEW'
                });
                
                return {
                    statusCode: 200,
                    headers: corsHeaders,
                    body: JSON.stringify({ 
                        message: `Hours ${status} successfully`,
                        entry: updateResult.Attributes
                    })
                };
            } catch (error) {
                console.error('Error updating hour status:', error);
                if (error.code === 'ConditionalCheckFailedException') {
                    return {
                        statusCode: 404,
                        headers: corsHeaders,
                        body: JSON.stringify({ 
                            error: 'Hour entry not found or already processed'
                        })
                    };
                }
                return {
                    statusCode: 500,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'Failed to update hour status: ' + error.message })
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