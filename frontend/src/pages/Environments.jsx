import React, { useState, useEffect } from 'react';
import {
  Table, Button, Space, Popconfirm, message, Card, Spin, Tag,
  Modal, Form, Input, Select, Row, Col, List, Divider
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, GlobalOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { environmentsApi, projectsApi } from '../services/api';

const { Option } = Select;
const { TextArea } = Input;

const Environments = () => {
  const [loading, setLoading] = useState(false);
  const [environments, setEnvironments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEnv, setEditingEnv] = useState(null);
  const [variables, setVariables] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [envsData, projectsData] = await Promise.all([
        environmentsApi.getAll(),
        projectsApi.getAll()
      ]);
      setEnvironments(envsData);
      setProjects(projectsData);
    } catch (error) {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingEnv(null);
    form.resetFields();
    setVariables([]);
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingEnv(record);
    form.setFieldsValue(record);
    setVariables(record.variables || []);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await environmentsApi.delete(id);
      message.success('删除成功');
      loadData();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data = {
        ...values,
        variables
      };

      if (editingEnv) {
        await environmentsApi.update(editingEnv.id, data);
        message.success('更新成功');
      } else {
        await environmentsApi.create(data);
        message.success('创建成功');
      }

      setModalVisible(false);
      loadData();
    } catch (error) {
      if (!error.errorFields) {
        message.error(editingEnv ? '更新失败' : '创建失败');
      }
    }
  };

  const handleAddVariable = () => {
    setVariables([...variables, { key: '', value: '', description: '' }]);
  };

  const handleRemoveVariable = (index) => {
    const newVariables = [...variables];
    newVariables.splice(index, 1);
    setVariables(newVariables);
  };

  const handleVariableChange = (index, field, value) => {
    const newVariables = [...variables];
    newVariables[index] = { ...newVariables[index], [field]: value };
    setVariables(newVariables);
  };

  const columns = [
    {
      title: '环境名称',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <Space>
          <GlobalOutlined style={{ color: '#1890ff' }} />
          <strong>{text}</strong>
        </Space>
      )
    },
    {
      title: '所属项目',
      dataIndex: 'projectId',
      key: 'projectId',
      render: (projectId) => {
        const project = projects.find(p => p.id === projectId);
        return project ? <Tag color="blue">{project.name}</Tag> : '-';
      }
    },
    {
      title: 'Base URL',
      dataIndex: 'baseUrl',
      key: 'baseUrl',
      ellipsis: true
    },
    {
      title: '环境变量数',
      key: 'variableCount',
      render: (_, record) => (
        <Tag color="purple">{(record.variables || []).length} 个</Tag>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (time) => dayjs(time).format('YYYY-MM-DD HH:mm')
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定要删除这个测试环境吗？" onConfirm={() => handleDelete(record.id)} okText="确定" cancelText="取消">
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-title">测试环境</div>
        <div className="page-description">管理测试环境配置，包括 Base URL 和环境变量</div>
      </div>

      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新建环境
          </Button>
        </div>

        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={environments}
            rowKey="id"
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条`
            }}
          />
        </Spin>
      </Card>

      <Modal
        title={editingEnv ? '编辑测试环境' : '新建测试环境'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText="确定"
        cancelText="取消"
        width={700}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="projectId"
                label="所属项目"
                rules={[{ required: true, message: '请选择项目' }]}
              >
                <Select placeholder="请选择项目">
                  {projects.map(p => (
                    <Option key={p.id} value={p.id}>{p.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="name"
                label="环境名称"
                rules={[{ required: true, message: '请输入环境名称' }]}
              >
                <Input placeholder="例如: 测试环境、预发环境、生产环境" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="baseUrl"
            label="Base URL"
          >
            <Input placeholder="例如: https://api.example.com" />
          </Form.Item>
          <Form.Item
            name="description"
            label="环境描述"
          >
            <TextArea rows={2} placeholder="请输入环境描述" />
          </Form.Item>

          <Divider>环境变量</Divider>

          <div style={{ marginBottom: 16 }}>
            <Button type="dashed" onClick={handleAddVariable} block icon={<PlusOutlined />}>
              添加环境变量
            </Button>
          </div>

          {variables.map((variable, index) => (
            <div key={index} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <Input
                style={{ flex: 1 }}
                placeholder="变量名 (key)"
                value={variable.key}
                onChange={(e) => handleVariableChange(index, 'key', e.target.value)}
              />
              <Input
                style={{ flex: 1 }}
                placeholder="变量值 (value)"
                value={variable.value}
                onChange={(e) => handleVariableChange(index, 'value', e.target.value)}
              />
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleRemoveVariable(index)}
              />
            </div>
          ))}
        </Form>
      </Modal>
    </div>
  );
};

export default Environments;
