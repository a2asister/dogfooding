import React, { useState, useEffect } from 'react';
import {
  Table, Button, Space, Popconfirm, message, Card, Spin, Tag,
  Modal, Form, Input, Select, Row, Col, Descriptions, Timeline
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, BugOutlined, EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { defectsApi, projectsApi } from '../services/api';

const { Option } = Select;
const { TextArea } = Input;

const Defects = () => {
  const [loading, setLoading] = useState(false);
  const [defects, setDefects] = useState([]);
  const [projects, setProjects] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [editingDefect, setEditingDefect] = useState(null);
  const [selectedDefect, setSelectedDefect] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [defectsData, projectsData] = await Promise.all([
        defectsApi.getAll(),
        projectsApi.getAll()
      ]);
      setDefects(defectsData);
      setProjects(projectsData);
    } catch (error) {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingDefect(null);
    form.resetFields();
    form.setFieldsValue({ severity: 'medium', priority: 'normal', status: 'open' });
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingDefect(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleView = (record) => {
    setSelectedDefect(record);
    setDetailVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await defectsApi.delete(id);
      message.success('删除成功');
      loadData();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editingDefect) {
        await defectsApi.update(editingDefect.id, values);
        message.success('更新成功');
      } else {
        await defectsApi.create(values);
        message.success('创建成功');
      }

      setModalVisible(false);
      loadData();
    } catch (error) {
      if (!error.errorFields) {
        message.error(editingDefect ? '更新失败' : '创建失败');
      }
    }
  };

  const severityColors = {
    critical: 'red',
    high: 'orange',
    medium: 'blue',
    low: 'default'
  };

  const severityNames = {
    critical: '严重',
    high: '高',
    medium: '中',
    low: '低'
  };

  const priorityColors = {
    high: 'red',
    normal: 'blue',
    low: 'default'
  };

  const priorityNames = {
    high: '高',
    normal: '中',
    low: '低'
  };

  const statusColors = {
    open: 'red',
    in_progress: 'orange',
    resolved: 'green',
    closed: 'default'
  };

  const statusNames = {
    open: '待处理',
    in_progress: '处理中',
    resolved: '已解决',
    closed: '已关闭'
  };

  const columns = [
    {
      title: '缺陷标题',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <a onClick={() => handleView(record)}>
          <strong>{text}</strong>
        </a>
      )
    },
    {
      title: '严重程度',
      dataIndex: 'severity',
      key: 'severity',
      width: 100,
      render: (severity) => (
        <Tag color={severityColors[severity] || 'default'}>
          {severityNames[severity] || severity}
        </Tag>
      )
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      render: (priority) => (
        <Tag color={priorityColors[priority] || 'default'}>
          {priorityNames[priority] || priority}
        </Tag>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={statusColors[status] || 'default'}>
          {statusNames[status] || status}
        </Tag>
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
      width: 180,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleView(record)}>
            查看
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定要删除这个缺陷吗？" onConfirm={() => handleDelete(record.id)} okText="确定" cancelText="取消">
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
        <div className="page-title">缺陷管理</div>
        <div className="page-description">管理测试过程中发现的缺陷，支持绑定测试用例和运行记录</div>
      </div>

      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="primary" icon={<BugOutlined />} onClick={handleCreate}>
            新建缺陷
          </Button>
        </div>

        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={defects}
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
        title={editingDefect ? '编辑缺陷' : '新建缺陷'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText="确定"
        cancelText="取消"
        width={600}
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
                name="status"
                label="状态"
                initialValue="open"
              >
                <Select>
                  <Option value="open">待处理</Option>
                  <Option value="in_progress">处理中</Option>
                  <Option value="resolved">已解决</Option>
                  <Option value="closed">已关闭</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="title"
            label="缺陷标题"
            rules={[{ required: true, message: '请输入缺陷标题' }]}
          >
            <Input placeholder="请输入缺陷标题" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="severity"
                label="严重程度"
                initialValue="medium"
              >
                <Select>
                  <Option value="critical">严重</Option>
                  <Option value="high">高</Option>
                  <Option value="medium">中</Option>
                  <Option value="low">低</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="priority"
                label="优先级"
                initialValue="normal"
              >
                <Select>
                  <Option value="high">高</Option>
                  <Option value="normal">中</Option>
                  <Option value="low">低</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="assignee"
            label="指派人"
          >
            <Input placeholder="请输入指派人" />
          </Form.Item>
          <Form.Item
            name="description"
            label="缺陷描述"
          >
            <TextArea rows={4} placeholder="请输入缺陷描述" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="缺陷详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={700}
      >
        {selectedDefect && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="缺陷标题" span={2}>
                {selectedDefect.title}
              </Descriptions.Item>
              <Descriptions.Item label="严重程度">
                <Tag color={severityColors[selectedDefect.severity]}>
                  {severityNames[selectedDefect.severity]}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="优先级">
                <Tag color={priorityColors[selectedDefect.priority]}>
                  {priorityNames[selectedDefect.priority]}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={statusColors[selectedDefect.status]}>
                  {statusNames[selectedDefect.status]}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="指派人">
                {selectedDefect.assignee || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="创建时间" span={2}>
                {dayjs(selectedDefect.createdAt).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="缺陷描述" span={2}>
                {selectedDefect.description || '-'}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Defects;
