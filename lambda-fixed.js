const https = require('https');

// Production configuration
const GOOGLE_CLIENT_ID = '351616911983-o8247sq5qaaq8ioles657e5t8nt12bll.apps.googleusercontent.com';
const ADMIN_EMAILS = ['harshaan.chugh@gmail.com', 'Pc104861@student.musd.org'];

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

// In-memory storage that actually works
let hoursDatabase = [];

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
    console.log('Current database has', hoursDatabase.length, 'entries');
    
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
            console.log('Total approved hours:', approvedHours, 'from', hoursDatabase.length, 'total entries');
            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({ totalHours: Math.round(approvedHours * 10) / 10 }) // Round to 1 decimal
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
                console.log('Raw body received:', body);
                const data = JSON.parse(body);
                console.log('Parsed data:', JSON.stringify(data, null, 2));
                const { start_time, end_time, description } = data;
                console.log('Extracted fields - start_time:', start_time, 'end_time:', end_time, 'description:', description);
                
                if (!start_time || !end_time || !description) {
                    console.log('Missing fields detected!');
                    return {
                        statusCode: 400,
                        headers: corsHeaders,
                        body: JSON.stringify({ 
                            error: 'Missing required fields: start_time, end_time, description',
                            received: { start_time, end_time, description },
                            bodyReceived: body
                        })
                    };
                }
                
                // Calculate hours from start and end time
                const startDate = new Date(start_time);
                const endDate = new Date(end_time);
                const diffMs = endDate.getTime() - startDate.getTime();
                const hours = diffMs / (1000 * 60 * 60); // Convert to hours
                
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
                    updated_at: new Date().toISOString(),
                    id: start_time // Use start_time as ID for easier matching
                };
                
                hoursDatabase.push(newEntry);
                console.log('Added new entry:', newEntry);
                console.log('Database now has', hoursDatabase.length, 'entries');
                
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
            
            // Add some test data if database is empty
            if (hoursDatabase.length === 0) {
                const testStartTime = '2025-07-29T08:00:00.000Z';
                hoursDatabase.push({
                    user_email: user.email,
                    user_name: user.name || 'Test User',
                    start_time: testStartTime,
                    end_time: '2025-07-29T12:00:00.000Z',
                    hours: 4,
                    description: 'Test volunteer work',
                    status: 'pending',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    id: testStartTime // Use start_time as ID for easier matching
                });
                console.log('Added test data to empty database');
            }
            
            const pendingHours = hoursDatabase.filter(entry => entry.status === 'pending');
            console.log('Found', pendingHours.length, 'pending hours for admin');
            console.log('Pending entries:', pendingHours.map(h => ({ email: h.user_email, start_time: h.start_time, id: h.id })));
            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({ pending_hours: pendingHours })
            };
        }
        
        // GET /admin/export - Admin only (export all volunteer data)
        if (method === 'GET' && path === '/admin/export') {
            if (!ADMIN_EMAILS.includes(user.email)) {
                return {
                    statusCode: 403,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'Access denied. Admin privileges required.' })
                };
            }
            
            // Create CSV content
            const csvHeaders = 'Email,Name,Start Time,End Time,Hours,Description,Status,Created At,Updated At\n';
            const csvRows = hoursDatabase.map(entry => {
                const formatDate = (dateStr) => new Date(dateStr).toLocaleString();
                return [
                    `"${entry.user_email}"`,
                    `"${entry.user_name || 'Unknown'}"`,
                    `"${formatDate(entry.start_time)}"`,
                    `"${formatDate(entry.end_time)}"`,
                    entry.hours,
                    `"${entry.description.replace(/"/g, '""')}"`, // Escape quotes in description
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
        }
        
        // GET /admin/all - Admin only (get all volunteer submissions for web display)
        if (method === 'GET' && path === '/admin/all') {
            if (!ADMIN_EMAILS.includes(user.email)) {
                return {
                    statusCode: 403,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'Access denied. Admin privileges required.' })
                };
            }
            
            // Return all entries sorted by created date (newest first)
            const allEntries = [...hoursDatabase].sort((a, b) => 
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
            
            // Calculate summary statistics
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
        
        // PATCH /admin/approve - Admin only (simplified approval)
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
                
                console.log('Approval request:', { email, start_time, status });
                console.log('All pending entries:', hoursDatabase.filter(e => e.status === 'pending'));
                
                if (!status || !['approved', 'rejected'].includes(status)) {
                    return {
                        statusCode: 400,
                        headers: corsHeaders,
                        body: JSON.stringify({ error: 'Invalid status. Must be "approved" or "rejected"' })
                    };
                }
                
                // Find and update the entry
                const entryIndex = hoursDatabase.findIndex(entry => 
                    entry.user_email === email && 
                    entry.start_time === start_time && 
                    entry.status === 'pending'
                );
                
                if (entryIndex === -1) {
                    // If exact match fails, try to find any pending entry for this user
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
                                message: `Hours ${status} successfully (fallback match)`,
                                entry: hoursDatabase[fallbackIndex]
                            })
                        };
                    }
                    
                    return {
                        statusCode: 404,
                        headers: corsHeaders,
                        body: JSON.stringify({ 
                            error: 'Hour entry not found',
                            debug: { email, start_time, pendingCount: hoursDatabase.filter(e => e.status === 'pending').length }
                        })
                    };
                }
                
                // Update the found entry
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
        
        // PATCH /admin/hours/{email}/{start_time} - Admin only (legacy)
        if (method === 'PATCH' && path.startsWith('/admin/hours/')) {
            if (!ADMIN_EMAILS.includes(user.email)) {
                return {
                    statusCode: 403,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'Access denied. Admin privileges required.' })
                };
            }
            
            try {
                // Parse the path to get email and start_time
                const pathParts = path.split('/');
                // Path format: /admin/hours/{email}/{start_time}
                if (pathParts.length < 5) {
                    return {
                        statusCode: 400,
                        headers: corsHeaders,
                        body: JSON.stringify({ error: 'Invalid path format' })
                    };
                }
                
                const targetEmail = decodeURIComponent(pathParts[3]);
                const targetStartTime = decodeURIComponent(pathParts[4]);
                
                console.log('Raw path parts:', pathParts);
                console.log('Looking for entry with email:', targetEmail, 'start_time:', targetStartTime);
                console.log('All database entries:');
                hoursDatabase.forEach((entry, index) => {
                    console.log(`  ${index}: email="${entry.user_email}", start_time="${entry.start_time}", status="${entry.status}"`);
                });
                
                const requestData = JSON.parse(body);
                const { status } = requestData;
                
                if (!status || !['approved', 'rejected'].includes(status)) {
                    return {
                        statusCode: 400,
                        headers: corsHeaders,
                        body: JSON.stringify({ error: 'Invalid status. Must be "approved" or "rejected"' })
                    };
                }
                
                // Try multiple matching strategies
                let entryIndex = -1;
                
                // Strategy 1: Exact start_time match (since ID = start_time now)
                entryIndex = hoursDatabase.findIndex(entry => 
                    entry.start_time === targetStartTime
                );
                console.log('Strategy 1 - exact start_time match:', entryIndex);
                
                // Strategy 2: Exact email + start_time match
                if (entryIndex === -1) {
                    entryIndex = hoursDatabase.findIndex(entry => 
                        entry.user_email === targetEmail && entry.start_time === targetStartTime
                    );
                    console.log('Strategy 2 - email + start_time match:', entryIndex);
                }
                
                // Strategy 3: Just find the first pending entry for this email (fallback)
                if (entryIndex === -1) {
                    entryIndex = hoursDatabase.findIndex(entry => 
                        entry.user_email === targetEmail && entry.status === 'pending'
                    );
                    console.log('Strategy 3 - fallback to first pending for email:', entryIndex);
                }
                
                console.log('Found entry at index:', entryIndex);
                
                if (entryIndex === -1) {
                    return {
                        statusCode: 404,
                        headers: corsHeaders,
                        body: JSON.stringify({ 
                            error: 'Hour entry not found',
                            debug: {
                                targetEmail,
                                targetStartTime,
                                availableEntries: hoursDatabase.map(e => ({ 
                                    id: e.id,
                                    email: e.user_email, 
                                    start_time: e.start_time,
                                    status: e.status 
                                }))
                            }
                        })
                    };
                }
                
                // Update the status
                hoursDatabase[entryIndex].status = status;
                hoursDatabase[entryIndex].updated_at = new Date().toISOString();
                
                console.log('Updated entry:', hoursDatabase[entryIndex]);
                
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