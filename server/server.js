const express = require('express');
const cors = require('cors');
const path = require('path');
const imageRoutes = require('./routes/imageRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/processed', express.static(path.join(__dirname, 'processed')));

app.use('/api/images', imageRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Image Processor Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
