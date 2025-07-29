const https = require('https');

// Production configuration
const GOOGLE_CLIENT_ID = '351616911983-o8247sq5qaaq8ioles657e5t8nt12bll.apps.googleusercontent.com';
const ADMIN_EMAILS = ['harshaan.chugh@gmail.com', 'Pc104861@student.musd.org'];

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

// Temporary in-memory storage with some test data
let hoursDatabase = [
    {
        user_email: 'harshaan.chugh@gmail.com',
        user_name: 'Admin User',
        start_time: '2025-07-29T08:00:00.000Z',
        end_time: '2025-07-29T12:00:00.000Z',
        hours: 4,
        description: 'Painted artwork for senior center',
        status: 'approved',
        created_at: '2025-07-29T00:00:00.000Z',
        updated_at: '2025-07-29T00:00:00.000Z'
    }
];

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
            const approvedHours = hoursDatabase
                .filter(entry => entry.status === 'approved')
                .reduce((sum, entry) => sum + (entry.hours || 0), 0);
            
            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({ totalHours: Math.round(approvedHours * 10) / 10 })
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
                    user_name: user.name || 'Unknown',
                    start_time: start_time,
                    end_time: end_time,
                    hours: parseFloat(hours.toFixed(2)),
                    description: description,
                    status: 'pending',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };
                
                hoursDatabase.push(newEntry);
                console.log('Added new entry:', newEntry);
                
                return {
                    statusCode: 201,
                    headers: corsHeaders,
                    body: JSON.stringify({ 
                        message: 'Hours logged successfully!',
                        entry: newEntry
                    })
                };
            } catch (error) {
                console.error('Error processing POST /hours:', error);
                return {
                    statusCode: 500,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'Failed to save hours: ' + error.message })
                };
            }
        }
        
        // GET /hours - Get user's hours
        if (method === 'GET' && path === '/hours') {
            const userHours = hoursDatabase.filter(entry => entry.user_email === user.email);
            console.log('Found', userHours.length, 'hours for user', user.email);
            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({ hours: userHours })
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
            
            const pendingHours = hoursDatabase.filter(entry => entry.status === 'pending');
            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({ pending_hours: pendingHours })
            };
        }
        
        // GET /admin/all - Admin only
        if (method === 'GET' && path === '/admin/all') {
            if (!ADMIN_EMAILS.includes(user.email)) {
                return {
                    statusCode: 403,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'Access denied. Admin privileges required.' })
                };
            }
            
            const allEntries = [...hoursDatabase].sort((a, b) => 
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
            
            const totalVolunteers = new Set(hoursDatabase.map(e => e.user_email)).size;
            const totalHours = hoursDatabase.reduce((sum, e) => sum + (e.hours || 0), 0);
            const approvedHours = hoursDatabase.filter(e => e.status === 'approved').reduce((sum, e) => sum + (e.hours || 0), 0);
            const pendingHours = hoursDatabase.filter(e => e.status === 'pending').reduce((sum, e) => sum + (e.hours || 0), 0);
            
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
                        totalEntries: hoursDatabase.length
                    }
                })
            };
        }
        
        // PATCH /admin/approve - Admin only
        if (method === 'PATCH' && path === '/admin/approve') {
            if (!ADMIN_EMAILS.includes(user.email)) {
                return {
                    statusCode: 403,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'Access denied. Admin privileges required.' })
                };
            }
            
            try {
                const requestData = JSON.parse(body);
                const { email, start_time, status } = requestData;
                
                if (!status || !['approved', 'rejected'].includes(status)) {
                    return {
                        statusCode: 400,
                        headers: corsHeaders,
                        body: JSON.stringify({ error: 'Invalid status. Must be "approved" or "rejected"' })
                    };
                }
                
                const entryIndex = hoursDatabase.findIndex(entry => 
                    entry.user_email === email && entry.start_time === start_time
                );
                
                if (entryIndex === -1) {
                    // Fallback: find any pending entry for this user
                    const fallbackIndex = hoursDatabase.findIndex(entry => 
                        entry.user_email === email && entry.status === 'pending'
                    );
                    
                    if (fallbackIndex !== -1) {
                        hoursDatabase[fallbackIndex].status = status;
                        hoursDatabase[fallbackIndex].updated_at = new Date().toISOString();
                        
                        return {
                            statusCode: 200,
                            headers: corsHeaders,
                            body: JSON.stringify({ 
                                message: `Hours ${status} successfully`,
                                entry: hoursDatabase[fallbackIndex]
                            })
                        };
                    }
                    
                    return {
                        statusCode: 404,
                        headers: corsHeaders,
                        body: JSON.stringify({ error: 'Hour entry not found' })
                    };
                }
                
                hoursDatabase[entryIndex].status = status;
                hoursDatabase[entryIndex].updated_at = new Date().toISOString();
                
                return {
                    statusCode: 200,
                    headers: corsHeaders,
                    body: JSON.stringify({ 
                        message: `Hours ${status} successfully`,
                        entry: hoursDatabase[entryIndex]
                    })
                };
            } catch (error) {
                console.error('Error updating hour status:', error);
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