const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');
const Form = require('../models/Form');
const User = require('../models/User');

router.get('/', async (req, res) => {
  try {
    const { formId, status, createdBy } = req.query;
    const filter = {};
    if (formId) filter.formId = formId;
    if (status) filter.status = status;
    if (createdBy) filter.createdBy = createdBy;
    
    const submissions = await Submission.find(filter);
    
    const submissionsWithRefs = await Promise.all(submissions.map(async (submission) => {
      const submissionObj = submission.toObject();
      
      if (submissionObj.formId) {
        const form = await Form.findById(submissionObj.formId);
        submissionObj.formId = form ? { _id: form._id, id: form._id, name: form.name } : submissionObj.formId;
      }
      
      if (submissionObj.createdBy) {
        const user = await User.findById(submissionObj.createdBy);
        submissionObj.createdBy = user ? { _id: user._id, id: user._id, name: user.name, username: user.username } : submissionObj.createdBy;
      }
      
      return submissionObj;
    }));
    
    submissionsWithRefs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json(submissionsWithRefs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    
    if (!submission) {
      return res.status(404).json({ error: '提交记录不存在' });
    }
    
    const submissionObj = submission.toObject();
    
    if (submissionObj.formId) {
      const form = await Form.findById(submissionObj.formId);
      submissionObj.formId = form ? form.toObject() : submissionObj.formId;
    }
    
    if (submissionObj.createdBy) {
      const user = await User.findById(submissionObj.createdBy);
      submissionObj.createdBy = user ? { _id: user._id, id: user._id, name: user.name, username: user.username } : submissionObj.createdBy;
    }
    
    if (submissionObj.workflowHistory && submissionObj.workflowHistory.length > 0) {
      submissionObj.workflowHistory = await Promise.all(submissionObj.workflowHistory.map(async (item) => {
        if (item.actor) {
          const user = await User.findById(item.actor);
          return {
            ...item,
            actor: user ? { _id: user._id, id: user._id, name: user.name, username: user.username } : item.actor
          };
        }
        return item;
      }));
    }
    
    res.json(submissionObj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { formId, data } = req.body;
    
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ error: '表单不存在' });
    }
    
    const validationErrors = validateSubmission(form.fields, data);
    
    const submission = new Submission({
      formId,
      formVersion: form.version,
      data,
      status: validationErrors.length > 0 ? 'draft' : 'submitted',
      validationErrors,
      createdBy: req.body.createdBy
    });
    
    await submission.save();
    res.status(201).json(submission);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { data, status } = req.body;
    
    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ error: '提交记录不存在' });
    }
    
    const form = await Form.findById(submission.formId);
    let validationErrors = [];
    
    if (data) {
      validationErrors = validateSubmission(form.fields, data);
      submission.data = { ...submission.data, ...data };
    }
    
    if (status) {
      submission.status = status;
    }
    
    submission.validationErrors = validationErrors;
    submission.updatedBy = req.body.updatedBy;
    submission.isNew = false;
    
    await submission.save();
    res.json(submission);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const submission = await Submission.findByIdAndDelete(req.params.id);
    if (!submission) {
      return res.status(404).json({ error: '提交记录不存在' });
    }
    res.json({ message: '提交记录已删除' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/submit', async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ error: '提交记录不存在' });
    }
    
    const form = await Form.findById(submission.formId);
    const validationErrors = validateSubmission(form.fields, submission.data);
    
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: '表单验证失败',
        validationErrors
      });
    }
    
    submission.status = 'submitted';
    submission.currentWorkflowStep = form.workflows && form.workflows.length > 0 ? form.workflows[0].name : 'submitted';
    submission.validationErrors = [];
    submission.isNew = false;
    
    await submission.save();
    res.json(submission);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function validateSubmission(fields, data) {
  const errors = [];
  
  fields.forEach(field => {
    const value = data[field.name];
    
    if (field.required && (value === undefined || value === null || value === '')) {
      errors.push({
        field: field.name,
        message: `${field.label}不能为空`,
        type: 'required'
      });
    }
    
    if (field.rules && Array.isArray(field.rules)) {
      field.rules.forEach(rule => {
        switch (rule.type) {
          case 'pattern':
            if (value && !new RegExp(rule.value).test(value)) {
              errors.push({
                field: field.name,
                message: rule.message || `${field.label}格式不正确`,
                type: 'pattern'
              });
            }
            break;
          case 'min':
            if (value !== undefined && value !== null && Number(value) < Number(rule.value)) {
              errors.push({
                field: field.name,
                message: rule.message || `${field.label}不能小于${rule.value}`,
                type: 'min'
              });
            }
            break;
          case 'max':
            if (value !== undefined && value !== null && Number(value) > Number(rule.value)) {
              errors.push({
                field: field.name,
                message: rule.message || `${field.label}不能大于${rule.value}`,
                type: 'max'
              });
            }
            break;
        }
      });
    }
  });
  
  return errors;
}

module.exports = router;
