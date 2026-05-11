import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import { mockUsers, MockUser } from './mockData';

const app = express();
const PORT = 8765;
const DB_PATH = './follow.db';

app.use(cors());
app.use(express.json());

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS follows (
    follower_id TEXT NOT NULL,
    following_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, following_id)
  )
`);

type User = MockUser & {
  isFollowing: boolean;
  followerCount: number;
  followingCount: number;
};

function getFollowStats(userId: string) {
  const followerRow = db
    .prepare('SELECT COUNT(*) as count FROM follows WHERE following_id = ?')
    .get(userId) as { count: number };
  const followingRow = db
    .prepare('SELECT COUNT(*) as count FROM follows WHERE follower_id = ?')
    .get(userId) as { count: number };
  return {
    followerCount: followerRow.count,
    followingCount: followingRow.count
  };
}

function checkIsFollowing(followerId: string, followingId: string): boolean {
  const row = db
    .prepare(
      'SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?'
    )
    .get(followerId, followingId);
  return !!row;
}

function enrichUser(mockUser: MockUser, viewerId: string): User {
  const stats = getFollowStats(mockUser.id);
  return {
    ...mockUser,
    isFollowing: checkIsFollowing(viewerId, mockUser.id),
    ...stats
  };
}

const VIEWER_ID = 'viewer_001';

app.get('/api/users', (req, res) => {
  const users = mockUsers.map((u) => enrichUser(u, VIEWER_ID));
  res.json(users);
});

app.get('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const mockUser = mockUsers.find((u) => u.id === id);
  if (!mockUser) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json(enrichUser(mockUser, VIEWER_ID));
});

app.post('/api/follow/:id', (req, res) => {
  const { id } = req.params;
  const mockUser = mockUsers.find((u) => u.id === id);
  if (!mockUser) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  if (id === VIEWER_ID) {
    res.status(400).json({ error: 'Cannot follow yourself' });
    return;
  }
  const insert = db
    .prepare(
      'INSERT OR IGNORE INTO follows (follower_id, following_id) VALUES (?, ?)'
    )
    .run(VIEWER_ID, id);
  res.json({
    success: true,
    following: insert.changes > 0,
    followerCount: getFollowStats(id).followerCount
  });
});

app.delete('/api/follow/:id', (req, res) => {
  const { id } = req.params;
  const del = db
    .prepare(
      'DELETE FROM follows WHERE follower_id = ? AND following_id = ?'
    )
    .run(VIEWER_ID, id);
  res.json({
    success: true,
    following: false,
    followerCount: getFollowStats(id).followerCount
  });
});

app.get('/api/followers/:id', (req, res) => {
  const { id } = req.params;
  const rows = db
    .prepare('SELECT follower_id FROM follows WHERE following_id = ?')
    .all(id) as { follower_id: string }[];
  res.json(rows.map((r) => r.follower_id));
});

app.get('/api/following/:id', (req, res) => {
  const { id } = req.params;
  const rows = db
    .prepare('SELECT following_id FROM follows WHERE follower_id = ?')
    .all(id) as { following_id: string }[];
  res.json(rows.map((r) => r.following_id));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
