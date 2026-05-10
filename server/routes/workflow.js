const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');
const Form = require('../models/Form');
const User = require('../models/User');

router.post('/:submissionId/approve', async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { comment, approverId } = req.body;
    
    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ error: '提交记录不存在' });
    }
    
    const form = await Form.findById(submission.formId);
    if (!form || !form.workflows || form.workflows.length === 0) {
      return res.status(400).json({ error: '该表单没有配置工作流' });
    }
    
    const currentStepIndex = form.workflows.findIndex(w => w.name === submission.currentWorkflowStep);
    if (currentStepIndex === -1) {
      return res.status(400).json({ error: '当前步骤不存在' });
    }
    
    const currentStep = form.workflows[currentStepIndex];
    const nextStep = form.workflows[currentStepIndex + 1];
    
    submission.workflowHistory.push({
      step: currentStep.name,
      action: 'approve',
      actor: approverId,
      comment,
      fromStatus: submission.status,
      toStatus: nextStep ? 'pending' : 'approved'
    });
    
    if (nextStep) {
      submission.currentWorkflowStep = nextStep.name;
      submission.status = 'pending';
      submission.assignee = nextStep.assignee;
    } else {
      submission.status = 'approved';
      submission.currentWorkflowStep = 'completed';
    }
    
    submission.isNew = false;
    await submission.save();
    res.json(submission);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:submissionId/reject', async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { comment, approverId } = req.body;
    
    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ error: '提交记录不存在' });
    }
    
    const form = await Form.findById(submission.formId);
    const currentStep = form.workflows.find(w => w.name === submission.currentWorkflowStep);
    
    submission.workflowHistory.push({
      step: currentStep ? currentStep.name : submission.currentWorkflowStep,
      action: 'reject',
      actor: approverId,
      comment,
      fromStatus: submission.status,
      toStatus: 'rejected'
    });
    
    submission.status = 'rejected';
    submission.currentWorkflowStep = 'rejected';
    submission.isNew = false;
    
    await submission.save();
    res.json(submission);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:submissionId/return', async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { comment, approverId } = req.body;
    
    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ error: '提交记录不存在' });
    }
    
    submission.workflowHistory.push({
      step: submission.currentWorkflowStep,
      action: 'return',
      actor: approverId,
      comment,
      fromStatus: submission.status,
      toStatus: 'draft'
    });
    
    submission.status = 'draft';
    submission.currentWorkflowStep = 'draft';
    submission.isNew = false;
    
    await submission.save();
    res.json(submission);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/submissions/:userId/pending', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const pendingSubmissions = await Submission.find({
      $or: [
        { assignee: userId },
        { status: 'pending' }
      ]
    });
    
    const submissionsWithRefs = await Promise.all(pendingSubmissions.map(async (submission) => {
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

module.exports = router;
