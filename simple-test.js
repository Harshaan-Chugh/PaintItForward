import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());

app.get('/hours/total', (req, res) => {
  console.log('Endpoint hit!');
  res.json({ totalHours: '18.5', totalEntries: 5 });
});

app.listen(3030, () => {
  console.log('Server running on port 3030');
});