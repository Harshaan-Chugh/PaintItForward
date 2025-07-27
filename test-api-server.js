import express from 'express';
import cors from 'cors';
const app = express();

app.use(cors());
app.use(express.json());

// Mock total hours endpoint that simulates database calculation
app.get('/hours/total', (req, res) => {
  console.log('GET /hours/total endpoint called');
  // Simulate calculating from approved hours in database
  // This would normally scan DynamoDB for approved hours
  const mockApprovedHours = [
    { start_time: '2024-01-15T09:00:00Z', end_time: '2024-01-15T12:00:00Z' }, // 3 hours
    { start_time: '2024-01-20T10:00:00Z', end_time: '2024-01-20T14:30:00Z' }, // 4.5 hours
    { start_time: '2024-02-05T13:00:00Z', end_time: '2024-02-05T17:00:00Z' }, // 4 hours
    { start_time: '2024-02-12T08:00:00Z', end_time: '2024-02-12T11:00:00Z' }, // 3 hours
    { start_time: '2024-03-01T14:00:00Z', end_time: '2024-03-01T18:00:00Z' }, // 4 hours
  ];

  let totalHours = 0;
  mockApprovedHours.forEach(hour => {
    const startTime = new Date(hour.start_time);
    const endTime = new Date(hour.end_time);
    const diffMs = endTime.getTime() - startTime.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    totalHours += diffHours;
  });

  res.json({
    totalHours: totalHours.toFixed(1),
    totalEntries: mockApprovedHours.length
  });
});

const PORT = 3030;
app.listen(PORT, () => {
  console.log(`Test API server running on http://localhost:${PORT}`);
  console.log(`Total hours endpoint: http://localhost:${PORT}/hours/total`);
});