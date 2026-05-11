const Koa = require('koa');
const Router = require('@koa/router');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');
const db = require('./database');

const app = new Koa();
const router = new Router();
const PORT = 43210;

app.use(bodyParser());
app.use(cors());

router.get('/api/products', (ctx) => {
  const products = db.prepare('SELECT * FROM products').all();
  ctx.body = { success: true, data: products };
});

router.get('/api/cart', (ctx) => {
  const cartItems = db.prepare(`
    SELECT c.id, c.product_id, c.quantity, p.name, p.price, p.image, p.description
    FROM cart c
    JOIN products p ON c.product_id = p.id
  `).all();
  
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  
  ctx.body = { success: true, data: { items: cartItems, total, count } };
});

router.post('/api/cart', (ctx) => {
  const { productId, quantity = 1 } = ctx.request.body;
  
  if (!productId) {
    ctx.status = 400;
    ctx.body = { success: false, message: 'productId is required' };
    return;
  }
  
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
  if (!product) {
    ctx.status = 404;
    ctx.body = { success: false, message: 'Product not found' };
    return;
  }
  
  const existing = db.prepare('SELECT * FROM cart WHERE product_id = ?').get(productId);
  
  if (existing) {
    db.prepare('UPDATE cart SET quantity = quantity + ? WHERE product_id = ?').run(quantity, productId);
  } else {
    db.prepare('INSERT INTO cart (product_id, quantity) VALUES (?, ?)').run(productId, quantity);
  }
  
  ctx.body = { success: true, message: 'Added to cart' };
});

router.put('/api/cart/:id', (ctx) => {
  const { id } = ctx.params;
  const { quantity } = ctx.request.body;
  
  if (!quantity || quantity < 1) {
    ctx.status = 400;
    ctx.body = { success: false, message: 'Valid quantity is required' };
    return;
  }
  
  const item = db.prepare('SELECT * FROM cart WHERE id = ?').get(id);
  if (!item) {
    ctx.status = 404;
    ctx.body = { success: false, message: 'Cart item not found' };
    return;
  }
  
  db.prepare('UPDATE cart SET quantity = ? WHERE id = ?').run(quantity, id);
  ctx.body = { success: true, message: 'Quantity updated' };
});

router.delete('/api/cart/:id', (ctx) => {
  const { id } = ctx.params;
  
  const item = db.prepare('SELECT * FROM cart WHERE id = ?').get(id);
  if (!item) {
    ctx.status = 404;
    ctx.body = { success: false, message: 'Cart item not found' };
    return;
  }
  
  db.prepare('DELETE FROM cart WHERE id = ?').run(id);
  ctx.body = { success: true, message: 'Item removed from cart' };
});

router.delete('/api/cart', (ctx) => {
  db.prepare('DELETE FROM cart').run();
  ctx.body = { success: true, message: 'Cart cleared' };
});

router.post('/api/checkout', (ctx) => {
  const cartItems = db.prepare('SELECT * FROM cart').all();
  
  if (cartItems.length === 0) {
    ctx.status = 400;
    ctx.body = { success: false, message: 'Cart is empty' };
    return;
  }
  
  db.prepare('DELETE FROM cart').run();
  ctx.body = { success: true, message: 'Checkout successful' };
});

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
