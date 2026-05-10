const express = require('express');
const router = express.Router();
const XLSX = require('xlsx');
const Submission = require('../models/Submission');
const Form = require('../models/Form');
const User = require('../models/User');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

router.post('/import/:formId', upload.single('file'), async (req, res) => {
  try {
    const { formId } = req.params;
    const form = await Form.findById(formId);
    
    if (!form) {
      return res.status(404).json({ error: '表单不存在' });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: '请上传文件' });
    }
    
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    const results = {
      success: [],
      errors: [],
      total: data.length
    };
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      try {
        const validationErrors = validateImportRow(form.fields, row, i + 2);
        
        if (validationErrors.length > 0) {
          results.errors.push({
            row: i + 2,
            errors: validationErrors
          });
          continue;
        }
        
        const submission = new Submission({
          formId,
          formVersion: form.version,
          data: row,
          status: 'imported',
          createdBy: req.body.createdBy
        });
        
        await submission.save();
        results.success.push({
          row: i + 2,
          submissionId: submission._id
        });
      } catch (error) {
        results.errors.push({
          row: i + 2,
          error: error.message
        });
      }
    }
    
    res.json({
      message: '导入完成',
      successCount: results.success.length,
      errorCount: results.errors.length,
      results
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/export/:formId', async (req, res) => {
  try {
    const { formId } = req.params;
    const form = await Form.findById(formId);
    
    if (!form) {
      return res.status(404).json({ error: '表单不存在' });
    }
    
    const submissions = await Submission.find({ formId });
    submissions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    const exportData = await Promise.all(submissions.map(async (submission) => {
      let createdByInfo = '';
      if (submission.createdBy) {
        const user = await User.findById(submission.createdBy);
        if (user) {
          createdByInfo = user.name || user.username || '';
        }
      }
      
      const row = {
        '提交时间': new Date(submission.createdAt).toLocaleString(),
        '提交人': createdByInfo,
        '状态': submission.status
      };
      
      form.fields.forEach(field => {
        row[field.label] = formatValue(submission.data[field.name], field);
      });
      
      return row;
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '数据');
    
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${form.name}_导出数据.xlsx`);
    
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/template/:formId', async (req, res) => {
  try {
    const { formId } = req.params;
    const form = await Form.findById(formId);
    
    if (!form) {
      return res.status(404).json({ error: '表单不存在' });
    }
    
    const headers = form.fields.map(field => field.label);
    const worksheet = XLSX.utils.aoa_to_sheet([headers]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '模板');
    
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${form.name}_导入模板.xlsx`);
    
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function validateImportRow(fields, row, rowNum) {
  const errors = [];
  
  fields.forEach(field => {
    const value = row[field.label];
    
    if (field.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field.label}不能为空`);
    }
    
    if (field.rules && Array.isArray(field.rules)) {
      field.rules.forEach(rule => {
        switch (rule.type) {
          case 'pattern':
            if (value && !new RegExp(rule.value).test(String(value))) {
              errors.push(rule.message || `${field.label}格式不正确`);
            }
            break;
        }
      });
    }
  });
  
  return errors;
}

function formatValue(value, field) {
  if (value === undefined || value === null) return '';
  
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  
  return String(value);
}

module.exports = router;
