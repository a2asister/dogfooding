import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9527;

const db = new Database(path.join(__dirname, 'likes.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    like_count INTEGER NOT NULL DEFAULT 0
  );
  
  CREATE TABLE IF NOT EXISTS user_likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id, user_id)
  );
  
  INSERT OR IGNORE INTO posts (id, like_count) VALUES (1, 0);
`);

app.use(cors());
app.use(express.json());

app.get('/api/posts/:postId', (req, res) => {
  const postId = parseInt(req.params.postId);
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(postId);
  
  if (!post) {
    db.prepare('INSERT INTO posts (id, like_count) VALUES (?, 0)').run(postId);
    return res.json({ id: postId, like_count: 0 });
  }
  
  res.json(post);
});

app.post('/api/posts/:postId/like', (req, res) => {
  const postId = parseInt(req.params.postId);
  const { userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }
  
  const existingLike = db.prepare('SELECT * FROM user_likes WHERE post_id = ? AND user_id = ?').get(postId, userId);
  
  if (existingLike) {
    return res.status(409).json({ error: 'Already liked' });
  }
  
  const transaction = db.transaction(() => {
    db.prepare('INSERT INTO user_likes (post_id, user_id) VALUES (?, ?)').run(postId, userId);
    db.prepare('UPDATE posts SET like_count = like_count + 1 WHERE id = ?').run(postId);
    const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(postId);
    return post;
  });
  
  const result = transaction();
  res.json(result);
});

app.delete('/api/posts/:postId/like', (req, res) => {
  const postId = parseInt(req.params.postId);
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }
  
  const existingLike = db.prepare('SELECT * FROM user_likes WHERE post_id = ? AND user_id = ?').get(postId, userId);
  
  if (!existingLike) {
    return res.status(409).json({ error: 'Not liked yet' });
  }
  
  const transaction = db.transaction(() => {
    db.prepare('DELETE FROM user_likes WHERE post_id = ? AND user_id = ?').run(postId, userId);
    db.prepare('UPDATE posts SET like_count = like_count - 1 WHERE id = ? AND like_count > 0').run(postId);
    const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(postId);
    return post;
  });
  
  const result = transaction();
  res.json(result);
});

app.post('/api/posts/:postId/combo-like', (req, res) => {
  const postId = parseInt(req.params.postId);
  const { userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }
  
  const existingLike = db.prepare('SELECT * FROM user_likes WHERE post_id = ? AND user_id = ?').get(postId, userId);
  
  if (!existingLike) {
    db.prepare('INSERT INTO user_likes (post_id, user_id) VALUES (?, ?)').run(postId, userId);
  }
  
  db.prepare('UPDATE posts SET like_count = like_count + 1 WHERE id = ?').run(postId);
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(postId);
  
  res.json(post);
});

app.get('/api/posts/:postId/like-status', (req, res) => {
  const postId = parseInt(req.params.postId);
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }
  
  const existingLike = db.prepare('SELECT * FROM user_likes WHERE post_id = ? AND user_id = ?').get(postId, userId);
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(postId);
  
  res.json({
    liked: !!existingLike,
    like_count: post?.like_count || 0
  });
});

app.listen(PORT, () => {
  console.log(`Like animation server running on http://localhost:${PORT}`);
});
