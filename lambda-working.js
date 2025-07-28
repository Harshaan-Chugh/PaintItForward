const https = require('https');

// Production configuration
const GOOGLE_CLIENT_ID = '351616911983-o8247sq5qaaq8ioles657e5t8nt12bll.apps.googleusercontent.com';
const ADMIN_EMAILS = ['harshaan.chugh@gmail.com', 'Pc104861@student.musd.org'];

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
            // Just return 0 for now to make sure the endpoint works
            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({ totalHours: 0 })
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
        
        // POST /hours - Create new hour entry (just return success for now)
        if (method === 'POST' && path === '/hours') {
            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({ 
                    message: 'Hour entry received (test mode)',
                    user: user.email
                })
            };
        }
        
        // GET /hours - Return empty hours for now
        if (method === 'GET' && path === '/hours') {
            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({ hours: [] })
            };
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
            
            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({ pending_hours: [] })
            };
        }
        
        // PATCH /admin/hours/{email}/{start_time} - Admin only
        if (method === 'PATCH' && path.startsWith('/admin/hours/')) {
            if (!ADMIN_EMAILS.includes(user.email)) {
                return {
                    statusCode: 403,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'Access denied. Admin privileges required.' })
                };
            }
            
            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({ message: 'Update received (test mode)' })
            };
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