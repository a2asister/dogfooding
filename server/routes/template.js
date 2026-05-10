const express = require('express');
const router = express.Router();
const Form = require('../models/Form');

router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = { isTemplate: true, status: 'published' };
    if (category) filter.category = category;
    
    const templates = await Form.find(filter).sort({ createdAt: -1 });
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const categories = await Form.distinct('category', { isTemplate: true });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/apply', async (req, res) => {
  try {
    const template = await Form.findById(req.params.id);
    if (!template || !template.isTemplate) {
      return res.status(404).json({ error: '模板不存在' });
    }
    
    const newForm = new Form({
      ...template.toObject(),
      _id: undefined,
      name: req.body.name || `${template.name} - 新建`,
      isTemplate: false,
      status: 'draft',
      version: 1,
      createdAt: undefined,
      updatedAt: undefined,
      createdBy: req.body.createdBy
    });
    
    await newForm.save();
    res.status(201).json(newForm);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/seed', async (req, res) => {
  try {
    const defaultTemplates = [
      {
        name: '请假申请表单',
        description: '员工请假申请，支持多级审批',
        category: '人事管理',
        isTemplate: true,
        status: 'published',
        fields: [
          {
            id: 'field_1',
            type: 'input',
            label: '申请人',
            name: 'applicant',
            required: true,
            placeholder: '请输入姓名',
            rules: []
          },
          {
            id: 'field_2',
            type: 'select',
            label: '请假类型',
            name: 'leaveType',
            required: true,
            options: [
              { label: '年假', value: 'annual' },
              { label: '病假', value: 'sick' },
              { label: '事假', value: 'personal' },
              { label: '婚假', value: 'marriage' },
              { label: '产假', value: 'maternity' }
            ],
            rules: []
          },
          {
            id: 'field_3',
            type: 'dateRange',
            label: '请假时间',
            name: 'leaveDate',
            required: true,
            rules: []
          },
          {
            id: 'field_4',
            type: 'textarea',
            label: '请假原因',
            name: 'reason',
            required: true,
            placeholder: '请详细说明请假原因',
            rules: []
          },
          {
            id: 'field_5',
            type: 'input',
            label: '审批人',
            name: 'approver',
            required: true,
            rules: []
          }
        ],
        workflows: [
          {
            name: '部门经理审批',
            type: 'approve',
            fromStatus: 'submitted',
            toStatus: 'pending_manager',
            assignee: 'manager'
          },
          {
            name: '人事确认',
            type: 'approve',
            fromStatus: 'pending_manager',
            toStatus: 'approved',
            assignee: 'hr'
          }
        ]
      },
      {
        name: '报销申请表单',
        description: '费用报销申请，支持费用明细子表单',
        category: '财务管理',
        isTemplate: true,
        status: 'published',
        fields: [
          {
            id: 'field_1',
            type: 'input',
            label: '申请人',
            name: 'applicant',
            required: true,
            rules: []
          },
          {
            id: 'field_2',
            type: 'input',
            label: '报销部门',
            name: 'department',
            required: true,
            rules: []
          },
          {
            id: 'field_3',
            type: 'subForm',
            label: '费用明细',
            name: 'expenses',
            required: true,
            subForm: {
              minRows: 1,
              maxRows: 50
            },
            rules: []
          },
          {
            id: 'field_4',
            type: 'textarea',
            label: '备注',
            name: 'remark',
            rules: []
          }
        ]
      },
      {
        name: '员工信息登记表',
        description: '新员工入职信息登记',
        category: '人事管理',
        isTemplate: true,
        status: 'published',
        fields: [
          {
            id: 'field_1',
            type: 'input',
            label: '姓名',
            name: 'name',
            required: true,
            rules: []
          },
          {
            id: 'field_2',
            type: 'radio',
            label: '性别',
            name: 'gender',
            required: true,
            options: [
              { label: '男', value: 'male' },
              { label: '女', value: 'female' }
            ],
            rules: []
          },
          {
            id: 'field_3',
            type: 'input',
            label: '身份证号',
            name: 'idCard',
            required: true,
            rules: [
              {
                type: 'pattern',
                value: '^[1-9]\\d{5}(18|19|20)\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])\\d{3}[0-9Xx]$',
                message: '身份证号格式不正确'
              }
            ]
          },
          {
            id: 'field_4',
            type: 'input',
            label: '联系电话',
            name: 'phone',
            required: true,
            rules: [
              {
                type: 'pattern',
                value: '^1[3-9]\\d{9}$',
                message: '手机号格式不正确'
              }
            ]
          },
          {
            id: 'field_5',
            type: 'input',
            label: '邮箱',
            name: 'email',
            required: true,
            rules: [
              {
                type: 'pattern',
                value: '^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\\.[a-zA-Z0-9_-]+)+$',
                message: '邮箱格式不正确'
              }
            ]
          }
        ]
      },
      {
        name: '项目报备单',
        description: '项目信息报备表单',
        category: '项目管理',
        isTemplate: true,
        status: 'published',
        fields: [
          {
            id: 'field_1',
            type: 'input',
            label: '项目名称',
            name: 'projectName',
            required: true,
            rules: []
          },
          {
            id: 'field_2',
            type: 'select',
            label: '项目类型',
            name: 'projectType',
            required: true,
            options: [
              { label: '新建项目', value: 'new' },
              { label: '维护项目', value: 'maintenance' },
              { label: '升级项目', value: 'upgrade' }
            ],
            rules: []
          },
          {
            id: 'field_3',
            type: 'date',
            label: '预计开始时间',
            name: 'startDate',
            required: true,
            rules: []
          },
          {
            id: 'field_4',
            type: 'date',
            label: '预计完成时间',
            name: 'endDate',
            required: true,
            rules: []
          },
          {
            id: 'field_5',
            type: 'input',
            label: '负责人',
            name: 'manager',
            required: true,
            rules: []
          },
          {
            id: 'field_6',
            type: 'textarea',
            label: '项目描述',
            name: 'description',
            rules: []
          }
        ]
      },
      {
        name: '客户信息登记表',
        description: '客户基础信息录入表单',
        category: '客户管理',
        isTemplate: true,
        status: 'published',
        fields: [
          {
            id: 'field_1',
            type: 'input',
            label: '客户名称',
            name: 'customerName',
            required: true,
            rules: []
          },
          {
            id: 'field_2',
            type: 'select',
            label: '客户类型',
            name: 'customerType',
            required: true,
            options: [
              { label: '企业客户', value: 'enterprise' },
              { label: '个人客户', value: 'individual' },
              { label: '政府机构', value: 'government' }
            ],
            rules: []
          },
          {
            id: 'field_3',
            type: 'input',
            label: '联系人',
            name: 'contact',
            required: true,
            rules: []
          },
          {
            id: 'field_4',
            type: 'input',
            label: '联系电话',
            name: 'contactPhone',
            required: true,
            rules: [
              {
                type: 'pattern',
                value: '^1[3-9]\\d{9}$',
                message: '手机号格式不正确'
              }
            ]
          },
          {
            id: 'field_5',
            type: 'textarea',
            label: '客户地址',
            name: 'address',
            rules: []
          },
          {
            id: 'field_6',
            type: 'textarea',
            label: '备注',
            name: 'remark',
            rules: []
          }
        ]
      }
    ];
    
    const existingTemplates = await Form.find({ isTemplate: true });
    if (existingTemplates.length > 0) {
      return res.json({ message: '模板已存在，无需重复创建' });
    }
    
    for (const template of defaultTemplates) {
      const form = new Form(template);
      await form.save();
    }
    
    res.json({ message: '默认模板创建成功', count: defaultTemplates.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
