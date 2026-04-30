const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult, param } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const [tags] = await pool.execute(
      'SELECT * FROM tags WHERE user_id = ? ORDER BY name',
      [req.user.userId]
    );
    res.json(tags);
  } catch (error) {
    console.error('获取标签错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

router.get('/:id',
  [param('id').isUUID().withMessage('无效的标签ID')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const [tags] = await pool.execute(
        'SELECT * FROM tags WHERE id = ? AND user_id = ?',
        [req.params.id, req.user.userId]
      );

      if (tags.length === 0) {
        return res.status(404).json({ error: '标签不存在' });
      }

      res.json(tags[0]);
    } catch (error) {
      console.error('获取标签详情错误:', error);
      res.status(500).json({ error: '服务器内部错误' });
    }
  }
);

router.post('/',
  [
    body('name').isLength({ min: 1, max: 50 }).withMessage('标签名称长度必须在1-50个字符之间'),
    body('color').optional().isHexColor().withMessage('无效的颜色格式')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, color = '#1890ff' } = req.body;

      const [existing] = await pool.execute(
        'SELECT id FROM tags WHERE user_id = ? AND name = ?',
        [req.user.userId, name]
      );

      if (existing.length > 0) {
        return res.status(409).json({ error: '该标签名称已存在' });
      }

      const tagId = uuidv4();
      await pool.execute(
        'INSERT INTO tags (id, user_id, name, color) VALUES (?, ?, ?, ?)',
        [tagId, req.user.userId, name, color]
      );

      const [tags] = await pool.execute(
        'SELECT * FROM tags WHERE id = ?',
        [tagId]
      );

      res.status(201).json(tags[0]);
    } catch (error) {
      console.error('创建标签错误:', error);
      res.status(500).json({ error: '服务器内部错误' });
    }
  }
);

router.put('/:id',
  [
    param('id').isUUID().withMessage('无效的标签ID'),
    body('name').optional().isLength({ min: 1, max: 50 }).withMessage('标签名称长度必须在1-50个字符之间'),
    body('color').optional().isHexColor().withMessage('无效的颜色格式')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, color } = req.body;

      const [tags] = await pool.execute(
        'SELECT * FROM tags WHERE id = ? AND user_id = ?',
        [req.params.id, req.user.userId]
      );

      if (tags.length === 0) {
        return res.status(404).json({ error: '标签不存在' });
      }

      const tag = tags[0];
      const updatedName = name !== undefined ? name : tag.name;
      const updatedColor = color !== undefined ? color : tag.color;

      if (name && name !== tag.name) {
        const [existing] = await pool.execute(
          'SELECT id FROM tags WHERE user_id = ? AND name = ? AND id != ?',
          [req.user.userId, name, req.params.id]
        );
        if (existing.length > 0) {
          return res.status(409).json({ error: '该标签名称已存在' });
        }
      }

      await pool.execute(
        'UPDATE tags SET name = ?, color = ? WHERE id = ? AND user_id = ?',
        [updatedName, updatedColor, req.params.id, req.user.userId]
      );

      const [updatedTags] = await pool.execute(
        'SELECT * FROM tags WHERE id = ?',
        [req.params.id]
      );

      res.json(updatedTags[0]);
    } catch (error) {
      console.error('更新标签错误:', error);
      res.status(500).json({ error: '服务器内部错误' });
    }
  }
);

router.delete('/:id',
  [param('id').isUUID().withMessage('无效的标签ID')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const [tags] = await pool.execute(
        'SELECT * FROM tags WHERE id = ? AND user_id = ?',
        [req.params.id, req.user.userId]
      );

      if (tags.length === 0) {
        return res.status(404).json({ error: '标签不存在' });
      }

      await pool.execute(
        'DELETE FROM transaction_tags WHERE tag_id = ?',
        [req.params.id]
      );

      await pool.execute(
        'DELETE FROM tags WHERE id = ? AND user_id = ?',
        [req.params.id, req.user.userId]
      );

      res.json({ message: '标签已删除' });
    } catch (error) {
      console.error('删除标签错误:', error);
      res.status(500).json({ error: '服务器内部错误' });
    }
  }
);

module.exports = router;
