import { v4 as uuidv4 } from 'uuid';
import { db } from './database.js';

function buildCommentTree(comments) {
  const map = new Map();
  const roots = [];

  comments.forEach(comment => {
    map.set(comment.id, { ...comment, children: [] });
  });

  comments.forEach(comment => {
    const node = map.get(comment.id);
    if (comment.parentId) {
      const parent = map.get(comment.parentId);
      if (parent) {
        parent.children.push(node);
      }
    } else {
      roots.push(node);
    }
  });

  return roots;
}

function getDescendantsCount(parentId) {
  const result = db
    .prepare(
      `SELECT COUNT(*) as count FROM comments WHERE materialized_path LIKE ?`
    )
    .get(`${parentId}%`);
  return result?.count || 0;
}

export const resolvers = {
  Comment: {
    children(parent) {
      const children = db
        .prepare(
          `SELECT id, content, author, parent_id as parentId, 
                  materialized_path as materializedPath, depth, likes, 
                  created_at as createdAt
           FROM comments 
           WHERE parent_id = ? 
           ORDER BY created_at ASC`
        )
        .all(parent.id);
      return children;
    },
    replies(parent) {
      return getDescendantsCount(parent.id);
    }
  },
  Query: {
    comments() {
      const rootComments = db
        .prepare(
          `SELECT id, content, author, parent_id as parentId, 
                  materialized_path as materializedPath, depth, likes, 
                  created_at as createdAt
           FROM comments 
           WHERE parent_id IS NULL 
           ORDER BY created_at DESC`
        )
        .all();
      return rootComments;
    },
    comment(_, { id }) {
      const comment = db
        .prepare(
          `SELECT id, content, author, parent_id as parentId, 
                  materialized_path as materializedPath, depth, likes, 
                  created_at as createdAt
           FROM comments WHERE id = ?`
        )
        .get(id);
      return comment || null;
    }
  },
  Mutation: {
    createComment(_, { input }) {
      const { content, author, parentId } = input;
      const id = uuidv4();

      let parentPath = '';
      let depth = 0;

      if (parentId) {
        const parent = db
          .prepare(
            `SELECT materialized_path as materializedPath, depth 
             FROM comments WHERE id = ?`
          )
          .get(parentId);

        if (!parent) {
          throw new Error('Parent comment not found');
        }

        parentPath = `${parent.materializedPath}${parentId}/`;
        depth = parent.depth + 1;
      }

      const materializedPath = parentPath;

      db.prepare(
        `INSERT INTO comments (id, content, author, parent_id, materialized_path, depth)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).run(id, content, author, parentId || null, materializedPath, depth);

      const newComment = db
        .prepare(
          `SELECT id, content, author, parent_id as parentId, 
                  materialized_path as materializedPath, depth, likes, 
                  created_at as createdAt
           FROM comments WHERE id = ?`
        )
        .get(id);

      return newComment;
    },
    deleteComment(_, { id }) {
      const result = db.prepare('DELETE FROM comments WHERE id = ?').run(id);
      if (result.changes === 0) {
        throw new Error('Comment not found');
      }
      return id;
    },
    likeComment(_, { id }) {
      db.prepare('UPDATE comments SET likes = likes + 1 WHERE id = ?').run(id);

      const comment = db
        .prepare(
          `SELECT id, content, author, parent_id as parentId, 
                  materialized_path as materializedPath, depth, likes, 
                  created_at as createdAt
           FROM comments WHERE id = ?`
        )
        .get(id);

      if (!comment) {
        throw new Error('Comment not found');
      }

      return comment;
    }
  }
};
