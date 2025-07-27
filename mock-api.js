// Simple Express.js mock API for testing
import express from 'express';
import cors from 'cors';
const app = express();

app.use(cors());
app.use(express.json());

// Mock data storage
let hours = [];
let nextId = 1;

// Mock admin emails
const ADMIN_EMAILS = ['harshaan.chugh@gmail.com', 'Pc104861@student.musd.org'];

// Helper function to verify mock Google token (for testing)
function verifyMockToken(authHeader) {
  const token = authHeader?.replace('Bearer ', '');
  if (!token) throw new Error('No token');
  
  // For testing, decode the JWT payload (unsafe in production!)
  try {
    const parts = token.split('.');
    const payload = JSON.parse(atob(parts[1]));
    return { email: payload.email, name: payload.name };
  } catch {
    throw new Error('Invalid token');
  }
}

// Routes
app.post('/hours', async (req, res) => {
  try {
    const { email } = verifyMockToken(req.headers.authorization);
    const { start_time, end_time, description } = req.body;
    
    if (!start_time || !end_time) {
      return res.status(400).json({ error: 'Missing start_time or end_time' });
    }

    const hour = {
      id: nextId++,
      email,
      start_time,
      end_time,
      status: 'pending',
      description: description || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    hours.push(hour);
    res.status(201).json(hour);
  } catch (error) {
    console.error('Create hour error:', error);
    res.status(401).json({ error: 'Unauthorized' });
  }
});

app.get('/hours', async (req, res) => {
  try {
    const { email } = verifyMockToken(req.headers.authorization);
    const userHours = hours.filter(h => h.email === email);
    res.json({ hours: userHours });
  } catch (error) {
    console.error('List hours error:', error);
    res.status(401).json({ error: 'Unauthorized' });
  }
});

app.get('/admin/pending', async (req, res) => {
  try {
    const { email } = verifyMockToken(req.headers.authorization);
    
    if (!ADMIN_EMAILS.includes(email)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const pendingHours = hours.filter(h => h.status === 'pending');
    res.json({ pending_hours: pendingHours });
  } catch (error) {
    console.error('List pending error:', error);
    res.status(401).json({ error: 'Unauthorized' });
  }
});

app.patch('/admin/hours/:email/:start_time', async (req, res) => {
  try {
    const { email: adminEmail } = verifyMockToken(req.headers.authorization);
    
    if (!ADMIN_EMAILS.includes(adminEmail)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { email, start_time } = req.params;
    const { status } = req.body;
    
    const hour = hours.find(h => 
      h.email === decodeURIComponent(email) && 
      h.start_time === decodeURIComponent(start_time)
    );

    if (!hour) {
      return res.status(404).json({ error: 'Hour entry not found' });
    }

    hour.status = status;
    hour.updated_at = new Date().toISOString();

    res.json({ message: `Hour entry ${status} successfully`, item: hour });
  } catch (error) {
    console.error('Admin update error:', error);
    res.status(401).json({ error: 'Unauthorized' });
  }
});

const PORT = 3030;
app.listen(PORT, () => {
  console.log(`🚀 Mock API running on http://localhost:${PORT}`);
  console.log('📝 Admin emails:', ADMIN_EMAILS);
  console.log('🔧 Ready for testing!');
});