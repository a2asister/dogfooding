const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult, param, query } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/',
  [
    query('card_id').optional().isUUID().withMessage('无效的银行卡ID'),
    query('transaction_type').optional().isIn(['income', 'expense']).withMessage('无效的交易类型'),
    query('start_date').optional().matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('开始日期格式必须为 YYYY-MM-DD'),
    query('end_date').optional().matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('结束日期格式必须为 YYYY-MM-DD'),
    query('search').optional().isString().withMessage('搜索关键词必须是字符串'),
    query('tag_ids').optional().isString().withMessage('标签ID必须是字符串'),
    query('page').optional().isInt({ min: 1 }).withMessage('页码必须是正整数'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { card_id, transaction_type, start_date, end_date, search, tag_ids } = req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;

      let countSql = `
        SELECT COUNT(DISTINCT t.id) as total
        FROM transactions t
        JOIN bank_cards bc ON t.card_id = bc.id
        WHERE t.user_id = ?
      `;
      let dataSql = `
        SELECT t.*, bc.bank_name, bc.card_number_last4, 
               GROUP_CONCAT(DISTINCT CONCAT(tg.id, '|', tg.name, '|', tg.color) SEPARATOR ';') as tags
        FROM transactions t
        JOIN bank_cards bc ON t.card_id = bc.id
        LEFT JOIN transaction_tags tt ON t.id = tt.transaction_id
        LEFT JOIN tags tg ON tt.tag_id = tg.id
        WHERE t.user_id = ?
      `;
      const countParams = [req.user.userId];
      const dataParams = [req.user.userId];

      if (card_id) {
        countSql += ' AND t.card_id = ?';
        dataSql += ' AND t.card_id = ?';
        countParams.push(card_id);
        dataParams.push(card_id);
      }

      if (transaction_type) {
        countSql += ' AND t.transaction_type = ?';
        dataSql += ' AND t.transaction_type = ?';
        countParams.push(transaction_type);
        dataParams.push(transaction_type);
      }

      if (start_date) {
        countSql += ' AND t.transaction_date >= ?';
        dataSql += ' AND t.transaction_date >= ?';
        countParams.push(start_date);
        dataParams.push(start_date);
      }

      if (end_date) {
        countSql += ' AND t.transaction_date <= ?';
        dataSql += ' AND t.transaction_date <= ?';
        countParams.push(end_date);
        dataParams.push(end_date);
      }

      if (search && search.trim()) {
        countSql += ' AND (t.merchant LIKE ? OR t.description LIKE ? OR t.notes LIKE ?)';
        dataSql += ' AND (t.merchant LIKE ? OR t.description LIKE ? OR t.notes LIKE ?)';
        const searchTerm = `%${search.trim()}%`;
        countParams.push(searchTerm, searchTerm, searchTerm);
        dataParams.push(searchTerm, searchTerm, searchTerm);
      }

      if (tag_ids && tag_ids.trim()) {
        const tagIdArray = tag_ids.split(',').map(id => id.trim()).filter(id => id);
        if (tagIdArray.length > 0) {
          const placeholders = tagIdArray.map(() => '?').join(',');
          countSql += ` AND t.id IN (
            SELECT DISTINCT tt.transaction_id 
            FROM transaction_tags tt 
            WHERE tt.tag_id IN (${placeholders})
          )`;
          dataSql += ` AND t.id IN (
            SELECT DISTINCT tt.transaction_id 
            FROM transaction_tags tt 
            WHERE tt.tag_id IN (${placeholders})
          )`;
          countParams.push(...tagIdArray);
          dataParams.push(...tagIdArray);
        }
      }

      dataSql += ' GROUP BY t.id ORDER BY t.transaction_date DESC, t.created_at DESC LIMIT ? OFFSET ?';
      dataParams.push(parseInt(limit), offset);

      const [countResult] = await pool.execute(countSql, countParams);
      const [transactions] = await pool.execute(dataSql, dataParams);

      const processedTransactions = transactions.map(t => {
        const tags = t.tags ? t.tags.split(';').map(tagStr => {
          const [id, name, color] = tagStr.split('|');
          return { id, name, color };
        }) : [];
        return { ...t, tags };
      });

      const total = countResult[0]?.total || 0;
      res.json({
        transactions: processedTransactions,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('获取交易记录错误:', error);
      res.status(500).json({ error: '服务器内部错误' });
    }
  }
);

router.get('/stats',
  [
    query('card_id').optional().isUUID().withMessage('无效的银行卡ID'),
    query('start_date').optional().matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('开始日期格式必须为 YYYY-MM-DD'),
    query('end_date').optional().matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('结束日期格式必须为 YYYY-MM-DD')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { card_id, start_date, end_date } = req.query;

      let sql = `
        SELECT 
          transaction_type,
          SUM(amount) as total,
          COUNT(*) as count
        FROM transactions
        WHERE user_id = ?
      `;
      const params = [req.user.userId];

      if (card_id) {
        sql += ' AND card_id = ?';
        params.push(card_id);
      }

      if (start_date) {
        sql += ' AND transaction_date >= ?';
        params.push(start_date);
      }

      if (end_date) {
        sql += ' AND transaction_date <= ?';
        params.push(end_date);
      }

      sql += ' GROUP BY transaction_type';

      const [stats] = await pool.execute(sql, params);

      const result = {
        total_income: 0,
        total_expense: 0,
        income_count: 0,
        expense_count: 0,
        balance: 0
      };

      stats.forEach(stat => {
        if (stat.transaction_type === 'income') {
          result.total_income = parseFloat(stat.total);
          result.income_count = stat.count;
        } else {
          result.total_expense = parseFloat(stat.total);
          result.expense_count = stat.count;
        }
      });

      result.balance = result.total_income - result.total_expense;

      res.json(result);
    } catch (error) {
      console.error('获取交易统计错误:', error);
      res.status(500).json({ error: '服务器内部错误' });
    }
  }
);

router.get('/:id',
  [param('id').isUUID().withMessage('无效的交易记录ID')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const [transactions] = await pool.execute(`
        SELECT t.*, bc.bank_name, bc.card_number_last4,
               GROUP_CONCAT(DISTINCT CONCAT(tg.id, '|', tg.name, '|', tg.color) SEPARATOR ';') as tags
        FROM transactions t
        JOIN bank_cards bc ON t.card_id = bc.id
        LEFT JOIN transaction_tags tt ON t.id = tt.transaction_id
        LEFT JOIN tags tg ON tt.tag_id = tg.id
        WHERE t.id = ? AND t.user_id = ?
        GROUP BY t.id
      `, [req.params.id, req.user.userId]);

      if (transactions.length === 0) {
        return res.status(404).json({ error: '交易记录不存在' });
      }

      const transaction = transactions[0];
      const tags = transaction.tags ? transaction.tags.split(';').map(tagStr => {
        const [id, name, color] = tagStr.split('|');
        return { id, name, color };
      }) : [];

      res.json({ ...transaction, tags });
    } catch (error) {
      console.error('获取交易记录详情错误:', error);
      res.status(500).json({ error: '服务器内部错误' });
    }
  }
);

router.post('/',
  [
    body('card_id').isUUID().withMessage('无效的银行卡ID'),
    body('transaction_type').isIn(['income', 'expense']).withMessage('无效的交易类型'),
    body('amount').isFloat({ min: 0.01 }).withMessage('金额必须大于0'),
    body('transaction_date').custom((value) => {
      if (typeof value === 'string') {
        return /^\d{4}-\d{2}-\d{2}$/.test(value);
      }
      return value instanceof Date;
    }).withMessage('交易日期格式无效，应为 YYYY-MM-DD'),
    body('merchant').optional().isLength({ max: 100 }).withMessage('商家名称最长100个字符'),
    body('tag_ids').optional().isArray().withMessage('标签ID必须是数组')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        card_id,
        transaction_type,
        amount,
        transaction_date,
        merchant = '',
        description = '',
        notes = '',
        tag_ids = []
      } = req.body;

      const [cards] = await pool.execute(
        'SELECT id FROM bank_cards WHERE id = ? AND user_id = ?',
        [card_id, req.user.userId]
      );

      if (cards.length === 0) {
        return res.status(404).json({ error: '银行卡不存在' });
      }

      const transactionId = uuidv4();
      await pool.execute(`
        INSERT INTO transactions 
        (id, user_id, card_id, transaction_type, amount, transaction_date, merchant, description, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [transactionId, req.user.userId, card_id, transaction_type, amount, transaction_date, merchant, description, notes]);

      if (tag_ids && tag_ids.length > 0) {
        const [userTags] = await pool.execute(
          'SELECT id FROM tags WHERE user_id = ? AND id IN (?)',
          [req.user.userId, tag_ids]
        );
        const validTagIds = userTags.map(t => t.id);
        
        for (const tagId of validTagIds) {
          await pool.execute(
            'INSERT INTO transaction_tags (transaction_id, tag_id) VALUES (?, ?)',
            [transactionId, tagId]
          );
        }
      }

      const [transactions] = await pool.execute(`
        SELECT t.*, bc.bank_name, bc.card_number_last4,
               GROUP_CONCAT(DISTINCT CONCAT(tg.id, '|', tg.name, '|', tg.color) SEPARATOR ';') as tags
        FROM transactions t
        JOIN bank_cards bc ON t.card_id = bc.id
        LEFT JOIN transaction_tags tt ON t.id = tt.transaction_id
        LEFT JOIN tags tg ON tt.tag_id = tg.id
        WHERE t.id = ?
        GROUP BY t.id
      `, [transactionId]);

      const transaction = transactions[0];
      const tags = transaction.tags ? transaction.tags.split(';').map(tagStr => {
        const [id, name, color] = tagStr.split('|');
        return { id, name, color };
      }) : [];

      res.status(201).json({ ...transaction, tags });
    } catch (error) {
      console.error('创建交易记录错误:', error);
      res.status(500).json({ error: '服务器内部错误' });
    }
  }
);

router.put('/:id',
  [
    param('id').isUUID().withMessage('无效的交易记录ID'),
    body('transaction_type').optional().isIn(['income', 'expense']).withMessage('无效的交易类型'),
    body('amount').optional().isFloat({ min: 0.01 }).withMessage('金额必须大于0'),
    body('transaction_date').optional().custom((value) => {
      if (value === undefined || value === null) return true;
      if (typeof value === 'string') {
        return /^\d{4}-\d{2}-\d{2}$/.test(value);
      }
      return value instanceof Date;
    }).withMessage('交易日期格式无效，应为 YYYY-MM-DD'),
    body('tag_ids').optional().isArray().withMessage('标签ID必须是数组')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const [transactions] = await pool.execute(
        'SELECT * FROM transactions WHERE id = ? AND user_id = ?',
        [req.params.id, req.user.userId]
      );

      if (transactions.length === 0) {
        return res.status(404).json({ error: '交易记录不存在' });
      }

      const transaction = transactions[0];
      const {
        card_id,
        transaction_type,
        amount,
        transaction_date,
        merchant,
        description,
        notes,
        tag_ids
      } = req.body;

      if (card_id) {
        const [cards] = await pool.execute(
          'SELECT id FROM bank_cards WHERE id = ? AND user_id = ?',
          [card_id, req.user.userId]
        );
        if (cards.length === 0) {
          return res.status(404).json({ error: '银行卡不存在' });
        }
      }

      const updatedCardId = card_id !== undefined ? card_id : transaction.card_id;
      const updatedType = transaction_type !== undefined ? transaction_type : transaction.transaction_type;
      const updatedAmount = amount !== undefined ? amount : transaction.amount;
      const updatedDate = transaction_date !== undefined ? transaction_date : transaction.transaction_date;
      const updatedMerchant = merchant !== undefined ? merchant : transaction.merchant;
      const updatedDescription = description !== undefined ? description : transaction.description;
      const updatedNotes = notes !== undefined ? notes : transaction.notes;

      await pool.execute(`
        UPDATE transactions SET
          card_id = ?, transaction_type = ?, amount = ?, transaction_date = ?,
          merchant = ?, description = ?, notes = ?
        WHERE id = ? AND user_id = ?
      `, [updatedCardId, updatedType, updatedAmount, updatedDate, updatedMerchant, updatedDescription, updatedNotes, req.params.id, req.user.userId]);

      if (tag_ids !== undefined) {
        await pool.execute(
          'DELETE FROM transaction_tags WHERE transaction_id = ?',
          [req.params.id]
        );

        if (tag_ids.length > 0) {
          const [userTags] = await pool.execute(
            'SELECT id FROM tags WHERE user_id = ? AND id IN (?)',
            [req.user.userId, tag_ids]
          );
          const validTagIds = userTags.map(t => t.id);
          
          for (const tagId of validTagIds) {
            await pool.execute(
              'INSERT INTO transaction_tags (transaction_id, tag_id) VALUES (?, ?)',
              [req.params.id, tagId]
            );
          }
        }
      }

      const [updatedTransactions] = await pool.execute(`
        SELECT t.*, bc.bank_name, bc.card_number_last4,
               GROUP_CONCAT(DISTINCT CONCAT(tg.id, '|', tg.name, '|', tg.color) SEPARATOR ';') as tags
        FROM transactions t
        JOIN bank_cards bc ON t.card_id = bc.id
        LEFT JOIN transaction_tags tt ON t.id = tt.transaction_id
        LEFT JOIN tags tg ON tt.tag_id = tg.id
        WHERE t.id = ?
        GROUP BY t.id
      `, [req.params.id]);

      const updatedTransaction = updatedTransactions[0];
      const tags = updatedTransaction.tags ? updatedTransaction.tags.split(';').map(tagStr => {
        const [id, name, color] = tagStr.split('|');
        return { id, name, color };
      }) : [];

      res.json({ ...updatedTransaction, tags });
    } catch (error) {
      console.error('更新交易记录错误:', error);
      res.status(500).json({ error: '服务器内部错误' });
    }
  }
);

router.delete('/:id',
  [param('id').isUUID().withMessage('无效的交易记录ID')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const [transactions] = await pool.execute(
        'SELECT * FROM transactions WHERE id = ? AND user_id = ?',
        [req.params.id, req.user.userId]
      );

      if (transactions.length === 0) {
        return res.status(404).json({ error: '交易记录不存在' });
      }

      await pool.execute(
        'DELETE FROM transaction_tags WHERE transaction_id = ?',
        [req.params.id]
      );

      await pool.execute(
        'DELETE FROM transactions WHERE id = ? AND user_id = ?',
        [req.params.id, req.user.userId]
      );

      res.json({ message: '交易记录已删除' });
    } catch (error) {
      console.error('删除交易记录错误:', error);
      res.status(500).json({ error: '服务器内部错误' });
    }
  }
);

module.exports = router;
