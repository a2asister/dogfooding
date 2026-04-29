import React, { useState, useEffect } from 'react';
import {
  Table, Button, Space, Popconfirm, message, Card, Spin, Tag,
  Modal, Form, Input, Select, Row, Col
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SettingOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { parametersApi, projectsApi } from '../services/api';

const { Option } = Select;

const Parameters = () => {
  const [loading, setLoading] = useState(false);
  const [parameters, setParameters] = useState([]);
  const [projects, setProjects] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingParam, setEditingParam] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [paramsData, projectsData] = await Promise.all([
        parametersApi.getAll(),
        projectsApi.getAll()
      ]);
      setParameters(paramsData);
      setProjects(projectsData);
    } catch (error) {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingParam(null);
    form.resetFields();
    form.setFieldsValue({ type: 'common' });
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingParam(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await parametersApi.delete(id);
      message.success('删除成功');
      loadData();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editingParam) {
        await parametersApi.update(editingParam.id, values);
        message.success('更新成功');
      } else {
        await parametersApi.create(values);
        message.success('创建成功');
      }

      setModalVisible(false);
      loadData();
    } catch (error) {
      if (!error.errorFields) {
        message.error(editingParam ? '更新失败' : '创建失败');
      }
    }
  };

  const typeColors = {
    common: 'default',
    secret: 'red',
    environment: 'blue'
  };

  const typeNames = {
    common: '普通参数',
    secret: '敏感参数',
    environment: '环境参数'
  };

  const columns = [
    {
      title: '参数名称',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <Space>
          <SettingOutlined style={{ color: '#1890ff' }} />
          <strong>{text}</strong>
        </Space>
      )
    },
    {
      title: '参数键',
      dataIndex: 'key',
      key: 'key',
      render: (key) => <Tag color="blue">{key}</Tag>
    },
    {
      title: '参数值',
      dataIndex: 'value',
      key: 'value',
      render: (value, record) => {
        if (record.type === 'secret') {
          return <Tag color="red">*** 已隐藏 ***</Tag>;
        }
        return <span style={{ fontFamily: 'monospace' }}>{value}</span>;
      }
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={typeColors[type] || 'default'}>
          {typeNames[type] || type}
        </Tag>
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
          <Popconfirm title="确定要删除这个参数吗？" onConfirm={() => handleDelete(record.id)} okText="确定" cancelText="取消">
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
        <div className="page-title">参数管理</div>
        <div className="page-description">管理测试参数，支持普通参数、敏感参数和环境参数</div>
      </div>

      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新建参数
          </Button>
        </div>

        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={parameters}
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
        title={editingParam ? '编辑参数' : '新建参数'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText="确定"
        cancelText="取消"
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
                name="type"
                label="参数类型"
                initialValue="common"
              >
                <Select placeholder="请选择参数类型">
                  <Option value="common">普通参数</Option>
                  <Option value="secret">敏感参数</Option>
                  <Option value="environment">环境参数</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="参数名称"
                rules={[{ required: true, message: '请输入参数名称' }]}
              >
                <Input placeholder="例如: 超时时间" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="key"
                label="参数键"
                rules={[{ required: true, message: '请输入参数键' }]}
              >
                <Input placeholder="例如: timeout" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="value"
            label="参数值"
            rules={[{ required: true, message: '请输入参数值' }]}
          >
            <Input placeholder="请输入参数值" />
          </Form.Item>
          <Form.Item
            name="description"
            label="参数描述"
          >
            <Input.TextArea rows={2} placeholder="请输入参数描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Parameters;
