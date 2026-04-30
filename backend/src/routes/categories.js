const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult, param } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const [categories] = await pool.execute(
      'SELECT * FROM account_categories WHERE user_id = ? ORDER BY name',
      [req.user.userId]
    );
    res.json(categories);
  } catch (error) {
    console.error('获取分类错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

router.get('/:id',
  [param('id').isUUID().withMessage('无效的分类ID')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const [categories] = await pool.execute(
        'SELECT * FROM account_categories WHERE id = ? AND user_id = ?',
        [req.params.id, req.user.userId]
      );

      if (categories.length === 0) {
        return res.status(404).json({ error: '分类不存在' });
      }

      res.json(categories[0]);
    } catch (error) {
      console.error('获取分类详情错误:', error);
      res.status(500).json({ error: '服务器内部错误' });
    }
  }
);

router.post('/',
  [
    body('name').isLength({ min: 1, max: 50 }).withMessage('分类名称长度必须在1-50个字符之间'),
    body('color').optional().isHexColor().withMessage('无效的颜色格式')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, color = '#1890ff', description = '' } = req.body;

      const [existing] = await pool.execute(
        'SELECT id FROM account_categories WHERE user_id = ? AND name = ?',
        [req.user.userId, name]
      );

      if (existing.length > 0) {
        return res.status(409).json({ error: '该分类名称已存在' });
      }

      const categoryId = uuidv4();
      await pool.execute(
        'INSERT INTO account_categories (id, user_id, name, color, description) VALUES (?, ?, ?, ?, ?)',
        [categoryId, req.user.userId, name, color, description]
      );

      const [categories] = await pool.execute(
        'SELECT * FROM account_categories WHERE id = ?',
        [categoryId]
      );

      res.status(201).json(categories[0]);
    } catch (error) {
      console.error('创建分类错误:', error);
      res.status(500).json({ error: '服务器内部错误' });
    }
  }
);

router.put('/:id',
  [
    param('id').isUUID().withMessage('无效的分类ID'),
    body('name').optional().isLength({ min: 1, max: 50 }).withMessage('分类名称长度必须在1-50个字符之间'),
    body('color').optional().isHexColor().withMessage('无效的颜色格式')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, color, description } = req.body;

      const [categories] = await pool.execute(
        'SELECT * FROM account_categories WHERE id = ? AND user_id = ?',
        [req.params.id, req.user.userId]
      );

      if (categories.length === 0) {
        return res.status(404).json({ error: '分类不存在' });
      }

      const category = categories[0];
      const updatedName = name !== undefined ? name : category.name;
      const updatedColor = color !== undefined ? color : category.color;
      const updatedDescription = description !== undefined ? description : category.description;

      if (name && name !== category.name) {
        const [existing] = await pool.execute(
          'SELECT id FROM account_categories WHERE user_id = ? AND name = ? AND id != ?',
          [req.user.userId, name, req.params.id]
        );
        if (existing.length > 0) {
          return res.status(409).json({ error: '该分类名称已存在' });
        }
      }

      await pool.execute(
        'UPDATE account_categories SET name = ?, color = ?, description = ? WHERE id = ? AND user_id = ?',
        [updatedName, updatedColor, updatedDescription, req.params.id, req.user.userId]
      );

      const [updatedCategories] = await pool.execute(
        'SELECT * FROM account_categories WHERE id = ?',
        [req.params.id]
      );

      res.json(updatedCategories[0]);
    } catch (error) {
      console.error('更新分类错误:', error);
      res.status(500).json({ error: '服务器内部错误' });
    }
  }
);

router.delete('/:id',
  [param('id').isUUID().withMessage('无效的分类ID')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const [categories] = await pool.execute(
        'SELECT * FROM account_categories WHERE id = ? AND user_id = ?',
        [req.params.id, req.user.userId]
      );

      if (categories.length === 0) {
        return res.status(404).json({ error: '分类不存在' });
      }

      const [cards] = await pool.execute(
        'SELECT COUNT(*) as count FROM bank_cards WHERE category_id = ?',
        [req.params.id]
      );

      if (cards[0].count > 0) {
        return res.status(400).json({ error: '该分类下还有银行卡，无法删除' });
      }

      await pool.execute(
        'DELETE FROM account_categories WHERE id = ? AND user_id = ?',
        [req.params.id, req.user.userId]
      );

      res.json({ message: '分类已删除' });
    } catch (error) {
      console.error('删除分类错误:', error);
      res.status(500).json({ error: '服务器内部错误' });
    }
  }
);

module.exports = router;
