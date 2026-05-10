const express = require('express');
const router = express.Router();
const Form = require('../models/Form');
const { v4: uuidv4 } = require('uuid');

router.get('/', async (req, res) => {
  try {
    const { category, status, isTemplate } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (isTemplate !== undefined) filter.isTemplate = isTemplate === 'true';
    
    const forms = await Form.find(filter).sort({ createdAt: -1 });
    res.json(forms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ error: '表单不存在' });
    }
    res.json(form);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const form = new Form(req.body);
    await form.save();
    res.status(201).json(form);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const form = await Form.findByIdAndUpdate(
      req.params.id,
      { ...req.body, version: req.body.version ? req.body.version + 1 : 1 },
      { new: true, runValidators: true }
    );
    if (!form) {
      return res.status(404).json({ error: '表单不存在' });
    }
    res.json(form);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const form = await Form.findByIdAndDelete(req.params.id);
    if (!form) {
      return res.status(404).json({ error: '表单不存在' });
    }
    res.json({ message: '表单已删除' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/publish', async (req, res) => {
  try {
    const form = await Form.findByIdAndUpdate(
      req.params.id,
      { status: 'published' },
      { new: true }
    );
    if (!form) {
      return res.status(404).json({ error: '表单不存在' });
    }
    res.json(form);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/unpublish', async (req, res) => {
  try {
    const form = await Form.findByIdAndUpdate(
      req.params.id,
      { status: 'draft' },
      { new: true }
    );
    if (!form) {
      return res.status(404).json({ error: '表单不存在' });
    }
    res.json(form);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/duplicate', async (req, res) => {
  try {
    const sourceForm = await Form.findById(req.params.id);
    if (!sourceForm) {
      return res.status(404).json({ error: '表单不存在' });
    }
    
    const duplicatedForm = new Form({
      ...sourceForm.toObject(),
      _id: undefined,
      name: `${sourceForm.name} - 副本`,
      status: 'draft',
      version: 1,
      createdAt: undefined,
      updatedAt: undefined
    });
    
    await duplicatedForm.save();
    res.status(201).json(duplicatedForm);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
