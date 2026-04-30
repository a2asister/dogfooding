const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult, param, query } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { encrypt, decrypt, maskCardNumber, getLast4 } = require('../utils/encryption');

const router = express.Router();

router.use(authenticateToken);

router.get('/',
  [
    query('status').optional().isIn(['active', 'inactive']).withMessage('无效的状态值'),
    query('search').optional().isString().withMessage('搜索关键词必须是字符串')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { status, search } = req.query;
      let sql = `
        SELECT bc.*, ac.name as category_name, ac.color as category_color
        FROM bank_cards bc
        LEFT JOIN account_categories ac ON bc.category_id = ac.id
        WHERE bc.user_id = ?
      `;
      const params = [req.user.userId];

      if (status) {
        sql += ' AND bc.status = ?';
        params.push(status);
      }

      if (search && search.trim()) {
        sql += ' AND (bc.bank_name LIKE ? OR bc.card_number_last4 LIKE ? OR bc.reserved_info LIKE ?)';
        const searchTerm = `%${search.trim()}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      sql += ' ORDER BY bc.created_at DESC';

      const [cards] = await pool.execute(sql, params);

      const processedCards = cards.map(card => ({
        ...card,
        card_number_masked: maskCardNumber(decrypt(card.card_number_encrypted)),
        card_number_last4: card.card_number_last4
      }));

      res.json(processedCards);
    } catch (error) {
      console.error('获取银行卡列表错误:', error);
      res.status(500).json({ error: '服务器内部错误' });
    }
  }
);

router.get('/:id',
  [param('id').isUUID().withMessage('无效的银行卡ID')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const [cards] = await pool.execute(`
        SELECT bc.*, ac.name as category_name, ac.color as category_color
        FROM bank_cards bc
        LEFT JOIN account_categories ac ON bc.category_id = ac.id
        WHERE bc.id = ? AND bc.user_id = ?
      `, [req.params.id, req.user.userId]);

      if (cards.length === 0) {
        return res.status(404).json({ error: '银行卡不存在' });
      }

      const card = cards[0];
      const processedCard = {
        ...card,
        card_number_masked: maskCardNumber(decrypt(card.card_number_encrypted)),
        card_number_last4: card.card_number_last4
      };

      res.json(processedCard);
    } catch (error) {
      console.error('获取银行卡详情错误:', error);
      res.status(500).json({ error: '服务器内部错误' });
    }
  }
);

router.post('/',
  [
    body('bank_name').isLength({ min: 1, max: 100 }).withMessage('银行名称长度必须在1-100个字符之间'),
    body('card_number').custom((value) => {
      const cleaned = value.replace(/[\s-]/g, '');
      return /^\d{13,19}$/.test(cleaned);
    }).withMessage('卡号长度必须在13-19个数字之间，可包含空格或连字符'),
    body('card_type').optional().isIn(['debit', 'credit', 'prepaid']).withMessage('无效的卡片类型'),
    body('status').optional().isIn(['active', 'inactive']).withMessage('无效的状态值')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        bank_name,
        card_number,
        card_type = 'debit',
        category_id = null,
        valid_from = null,
        valid_to = null,
        cvv = null,
        reserved_info = '',
        status = 'active'
      } = req.body;

      const encryptedCardNumber = encrypt(card_number.replace(/\s/g, ''));
      const encryptedCvv = cvv ? encrypt(cvv) : null;
      const last4 = getLast4(card_number.replace(/\s/g, ''));
      const cardId = uuidv4();

      await pool.execute(`
        INSERT INTO bank_cards 
        (id, user_id, category_id, bank_name, card_number_encrypted, card_number_last4, card_type, valid_from, valid_to, cvv_encrypted, reserved_info, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        cardId,
        req.user.userId,
        category_id,
        bank_name,
        encryptedCardNumber,
        last4,
        card_type,
        valid_from,
        valid_to,
        encryptedCvv,
        reserved_info,
        status
      ]);

      const [cards] = await pool.execute(`
        SELECT bc.*, ac.name as category_name, ac.color as category_color
        FROM bank_cards bc
        LEFT JOIN account_categories ac ON bc.category_id = ac.id
        WHERE bc.id = ?
      `, [cardId]);

      const card = cards[0];
      const processedCard = {
        ...card,
        card_number_masked: maskCardNumber(decrypt(card.card_number_encrypted)),
        card_number_last4: card.card_number_last4
      };

      res.status(201).json(processedCard);
    } catch (error) {
      console.error('创建银行卡错误:', error);
      res.status(500).json({ error: '服务器内部错误' });
    }
  }
);

router.put('/:id',
  [
    param('id').isUUID().withMessage('无效的银行卡ID'),
    body('bank_name').optional().isLength({ min: 1, max: 100 }).withMessage('银行名称长度必须在1-100个字符之间'),
    body('card_number').optional().custom((value) => {
      const cleaned = value.replace(/[\s-]/g, '');
      return /^\d{13,19}$/.test(cleaned);
    }).withMessage('卡号长度必须在13-19个数字之间，可包含空格或连字符'),
    body('card_type').optional().isIn(['debit', 'credit', 'prepaid']).withMessage('无效的卡片类型'),
    body('status').optional().isIn(['active', 'inactive']).withMessage('无效的状态值')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const [cards] = await pool.execute(
        'SELECT * FROM bank_cards WHERE id = ? AND user_id = ?',
        [req.params.id, req.user.userId]
      );

      if (cards.length === 0) {
        return res.status(404).json({ error: '银行卡不存在' });
      }

      const card = cards[0];
      const {
        bank_name,
        card_number,
        card_type,
        category_id,
        valid_from,
        valid_to,
        cvv,
        reserved_info,
        status
      } = req.body;

      let encryptedCardNumber = card.card_number_encrypted;
      let last4 = card.card_number_last4;
      if (card_number) {
        encryptedCardNumber = encrypt(card_number.replace(/\s/g, ''));
        last4 = getLast4(card_number.replace(/\s/g, ''));
      }

      let encryptedCvv = card.cvv_encrypted;
      if (cvv !== undefined) {
        encryptedCvv = cvv ? encrypt(cvv) : null;
      }

      const updatedBankName = bank_name !== undefined ? bank_name : card.bank_name;
      const updatedCardType = card_type !== undefined ? card_type : card.card_type;
      const updatedCategoryId = category_id !== undefined ? category_id : card.category_id;
      const updatedValidFrom = valid_from !== undefined ? valid_from : card.valid_from;
      const updatedValidTo = valid_to !== undefined ? valid_to : card.valid_to;
      const updatedReservedInfo = reserved_info !== undefined ? reserved_info : card.reserved_info;
      const updatedStatus = status !== undefined ? status : card.status;

      await pool.execute(`
        UPDATE bank_cards SET
          bank_name = ?,
          card_number_encrypted = ?,
          card_number_last4 = ?,
          card_type = ?,
          category_id = ?,
          valid_from = ?,
          valid_to = ?,
          cvv_encrypted = ?,
          reserved_info = ?,
          status = ?
        WHERE id = ? AND user_id = ?
      `, [
        updatedBankName,
        encryptedCardNumber,
        last4,
        updatedCardType,
        updatedCategoryId,
        updatedValidFrom,
        updatedValidTo,
        encryptedCvv,
        updatedReservedInfo,
        updatedStatus,
        req.params.id,
        req.user.userId
      ]);

      const [updatedCards] = await pool.execute(`
        SELECT bc.*, ac.name as category_name, ac.color as category_color
        FROM bank_cards bc
        LEFT JOIN account_categories ac ON bc.category_id = ac.id
        WHERE bc.id = ?
      `, [req.params.id]);

      const updatedCard = updatedCards[0];
      const processedCard = {
        ...updatedCard,
        card_number_masked: maskCardNumber(decrypt(updatedCard.card_number_encrypted)),
        card_number_last4: updatedCard.card_number_last4
      };

      res.json(processedCard);
    } catch (error) {
      console.error('更新银行卡错误:', error);
      res.status(500).json({ error: '服务器内部错误' });
    }
  }
);

router.patch('/:id/status',
  [
    param('id').isUUID().withMessage('无效的银行卡ID'),
    body('status').isIn(['active', 'inactive']).withMessage('无效的状态值')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const [cards] = await pool.execute(
        'SELECT * FROM bank_cards WHERE id = ? AND user_id = ?',
        [req.params.id, req.user.userId]
      );

      if (cards.length === 0) {
        return res.status(404).json({ error: '银行卡不存在' });
      }

      await pool.execute(
        'UPDATE bank_cards SET status = ? WHERE id = ? AND user_id = ?',
        [req.body.status, req.params.id, req.user.userId]
      );

      const [updatedCards] = await pool.execute(`
        SELECT bc.*, ac.name as category_name, ac.color as category_color
        FROM bank_cards bc
        LEFT JOIN account_categories ac ON bc.category_id = ac.id
        WHERE bc.id = ?
      `, [req.params.id]);

      const updatedCard = updatedCards[0];
      const processedCard = {
        ...updatedCard,
        card_number_masked: maskCardNumber(decrypt(updatedCard.card_number_encrypted)),
        card_number_last4: updatedCard.card_number_last4
      };

      res.json(processedCard);
    } catch (error) {
      console.error('更新银行卡状态错误:', error);
      res.status(500).json({ error: '服务器内部错误' });
    }
  }
);

router.delete('/:id',
  [param('id').isUUID().withMessage('无效的银行卡ID')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const [cards] = await pool.execute(
        'SELECT * FROM bank_cards WHERE id = ? AND user_id = ?',
        [req.params.id, req.user.userId]
      );

      if (cards.length === 0) {
        return res.status(404).json({ error: '银行卡不存在' });
      }

      const [transactions] = await pool.execute(
        'SELECT COUNT(*) as count FROM transactions WHERE card_id = ?',
        [req.params.id]
      );

      if (transactions[0].count > 0) {
        return res.status(400).json({ error: '该银行卡下还有交易记录，无法删除' });
      }

      await pool.execute(
        'DELETE FROM bank_cards WHERE id = ? AND user_id = ?',
        [req.params.id, req.user.userId]
      );

      res.json({ message: '银行卡已删除' });
    } catch (error) {
      console.error('删除银行卡错误:', error);
      res.status(500).json({ error: '服务器内部错误' });
    }
  }
);

module.exports = router;
