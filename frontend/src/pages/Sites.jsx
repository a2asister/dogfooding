import React, { useEffect, useState } from 'react';
import {
  Button,
  Table,
  Tag,
  Modal,
  Form,
  Input,
  message,
  Popconfirm,
  Card,
  Empty,
  Spin,
  Space,
  Tooltip,
  Select
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  GlobalOutlined,
  RightOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import useSiteStore from '../stores/siteStore';
import useAuthStore from '../stores/authStore';
import { siteApi } from '../services/api';

const { TextArea } = Input;

function Sites() {
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSite, setEditingSite] = useState(null);
  const [form] = Form.useForm();
  const { sites, setSites, addSite, updateSite, removeSite, setCurrentSite, currentSite } = useSiteStore();
  const { user } = useAuthStore();

  useEffect(() => {
    loadSites();
  }, []);

  const loadSites = async () => {
    setLoading(true);
    try {
      const response = await siteApi.getAll();
      if (response.success) {
        setSites(response.data);
      }
    } catch (error) {
      message.error('加载站点列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingSite(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (site) => {
    setEditingSite(site);
    form.setFieldsValue(site);
    setModalVisible(true);
  };

  const handleDelete = async (siteId) => {
    try {
      await siteApi.delete(siteId);
      removeSite(siteId);
      message.success('站点已删除');
      
      if (currentSite?.id === siteId && sites.length > 1) {
        const remainingSites = sites.filter(s => s.id !== siteId);
        setCurrentSite(remainingSites[0]);
      }
    } catch (error) {
      message.error('删除站点失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingSite) {
        const response = await siteApi.update(editingSite.id, values);
        if (response.success) {
          updateSite(editingSite.id, response.data);
          message.success('站点已更新');
        }
      } else {
        const response = await siteApi.create(values);
        if (response.success) {
          addSite(response.data);
          if (sites.length === 0) {
            setCurrentSite(response.data);
          }
          message.success('站点已创建');
        }
      }
      
      setModalVisible(false);
    } catch (error) {
      message.error(error.response?.data?.error || '操作失败');
    }
  };

  const handleSelectSite = (site) => {
    setCurrentSite(site);
    message.success(`已切换到站点：${site.name}`);
  };

  const columns = [
    {
      title: '站点名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <GlobalOutlined style={{ color: '#667eea' }} />
          <span style={{ fontWeight: currentSite?.id === record.id ? 600 : 400 }}>
            {text}
          </span>
          {currentSite?.id === record.id && (
            <Tag color="purple">当前</Tag>
          )}
        </Space>
      )
    },
    {
      title: '域名',
      dataIndex: 'domain',
      key: 'domain',
      render: (domain) => (
        <a href={`//${domain}`} target="_blank" rel="noopener noreferrer">
          {domain}
        </a>
      )
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text) => text || '-'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag className={status === 'active' ? 'tag-active' : 'tag-inactive'}>
          {status === 'active' ? '活跃' : '未激活'}
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
      render: (_, record) => (
        <Space size="small" className="action-buttons">
          {currentSite?.id !== record.id && (
            <Tooltip title="切换到此站点">
              <Button
                type="link"
                size="small"
                icon={<RightOutlined />}
                onClick={() => handleSelectSite(record)}
              />
            </Tooltip>
          )}
          <Tooltip title="编辑">
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这个站点吗？"
            description="删除后无法恢复，站点下的所有内容都将被删除。"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="删除">
              <Button
                type="link"
                size="small"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <Spin spinning={loading}>
      <div>
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>站点管理</h1>
            <p style={{ color: '#6b7280', margin: 0 }}>
              管理您的所有站点，创建、编辑或删除站点
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={handleCreate}
          >
            创建站点
          </Button>
        </div>

        <Card className="form-card">
          {sites.length > 0 ? (
            <Table
              columns={columns}
              dataSource={sites}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `共 ${total} 条`
              }}
              className="table-container"
            />
          ) : (
            <Empty
              description={
                <div>
                  <p style={{ marginBottom: 16 }}>暂无站点</p>
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                    创建第一个站点
                  </Button>
                </div>
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{ padding: 60 }}
            />
          )}
        </Card>

        <Modal
          title={editingSite ? '编辑站点' : '创建站点'}
          open={modalVisible}
          onOk={handleSubmit}
          onCancel={() => setModalVisible(false)}
          okText="确定"
          cancelText="取消"
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            className="modal-content"
          >
            <Form.Item
              name="name"
              label="站点名称"
              rules={[
                { required: true, message: '请输入站点名称' },
                { min: 2, message: '站点名称至少2个字符' }
              ]}
            >
              <Input placeholder="请输入站点名称" size="large" />
            </Form.Item>

            <Form.Item
              name="domain"
              label="域名"
              rules={[
                { required: true, message: '请输入域名' },
                { 
                  pattern: /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
                  message: '请输入有效的域名'
                }
              ]}
              help="例如: example.com 或 blog.example.com"
            >
              <Input placeholder="请输入域名" size="large" />
            </Form.Item>

            <Form.Item
              name="description"
              label="站点描述"
            >
              <TextArea
                rows={4}
                placeholder="请输入站点描述"
                size="large"
                showCount
                maxLength={500}
              />
            </Form.Item>

            {!editingSite && (
              <Form.Item
                name="status"
                label="状态"
                initialValue="active"
              >
                <Select defaultValue="active" size="large">
                  <Select.Option value="active">活跃</Select.Option>
                  <Select.Option value="inactive">未激活</Select.Option>
                </Select>
              </Form.Item>
            )}
          </Form>
        </Modal>
      </div>
    </Spin>
  );
}

export default Sites;
