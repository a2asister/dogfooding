const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const productRoutes = require('./routes/productRoutes');
const skuRoutes = require('./routes/skuRoutes');
const discountRoutes = require('./routes/discountRoutes');

const app = express();
const PORT = 8765; // 不常用端口号

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../client/dist')));

// API路由
app.use('/api/products', productRoutes);
app.use('/api/skus', skuRoutes);
app.use('/api/discounts', discountRoutes);

// 处理所有其他请求，返回Vue应用
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`后端服务器运行在 http://localhost:${PORT}`);
  console.log(`API接口可用: http://localhost:${PORT}/api/`);
});