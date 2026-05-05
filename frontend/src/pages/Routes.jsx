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
  Select,
  Switch,
  InputNumber
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  LinkOutlined,
  AppstoreOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import useSiteStore from '../stores/siteStore';
import { routeApi, modelApi } from '../services/api';

const { Option } = Select;
const { TextArea } = Input;

function RoutesPage() {
  const { currentSite } = useSiteStore();
  const [loading, setLoading] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [models, setModels] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (currentSite) {
      loadRoutes();
      loadModels();
    }
  }, [currentSite]);

  const loadRoutes = async () => {
    setLoading(true);
    try {
      const response = await routeApi.getAll(currentSite.id);
      if (response.success) {
        setRoutes(response.data);
      }
    } catch (error) {
      message.error('加载路由规则列表失败');
    } finally {
      setLoading(false);
    }
  };

  const loadModels = async () => {
    try {
      const response = await modelApi.getAll(currentSite.id);
      if (response.success) {
        setModels(response.data);
      }
    } catch (error) {
      message.error('加载内容模型失败');
    }
  };

  const handleCreate = () => {
    setEditingRoute(null);
    form.resetFields();
    form.setFieldsValue({
      type: 'model',
      renderType: 'ssg',
      priority: 0,
      status: 'active'
    });
    setModalVisible(true);
  };

  const handleEdit = (route) => {
    setEditingRoute(route);
    form.setFieldsValue(route);
    setModalVisible(true);
  };

  const handleDelete = async (routeId) => {
    try {
      await routeApi.delete(currentSite.id, routeId);
      setRoutes(routes.filter(r => r.id !== routeId));
      message.success('路由规则已删除');
    } catch (error) {
      message.error('删除路由规则失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingRoute) {
        const response = await routeApi.update(currentSite.id, editingRoute.id, values);
        if (response.success) {
          setRoutes(routes.map(r => r.id === editingRoute.id ? response.data : r));
          message.success('路由规则已更新');
        }
      } else {
        const response = await routeApi.create(currentSite.id, values);
        if (response.success) {
          setRoutes([...routes, response.data]);
          message.success('路由规则已创建');
        }
      }
      
      setModalVisible(false);
    } catch (error) {
      message.error(error.response?.data?.error || '操作失败');
    }
  };

  const columns = [
    {
      title: '路由模式',
      dataIndex: 'pattern',
      key: 'pattern',
      render: (pattern) => (
        <Space>
          <LinkOutlined style={{ color: '#667eea' }} />
          <code style={{ background: '#f5f5f5', padding: '2px 8px', borderRadius: 4 }}>
            {pattern}
          </code>
        </Space>
      )
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'model' ? 'blue' : 'purple'}>
          {type === 'model' ? '模型路由' : type === 'single' ? '单页面' : type}
        </Tag>
      )
    },
    {
      title: '目标模型',
      dataIndex: 'targetModel',
      key: 'targetModel',
      render: (targetModel) => targetModel ? (
        <Tag color="cyan">{targetModel}</Tag>
      ) : '-'
    },
    {
      title: '渲染类型',
      dataIndex: 'renderType',
      key: 'renderType',
      render: (renderType) => (
        <Tag color={renderType === 'ssg' ? 'green' : 'orange'}>
          {renderType === 'ssg' ? 'SSG 静态生成' : renderType === 'ssr' ? 'SSR 服务端渲染' : renderType}
        </Tag>
      )
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      sorter: (a, b) => a.priority - b.priority
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag className={status === 'active' ? 'tag-active' : 'tag-inactive'}>
          {status === 'active' ? '活跃' : '禁用'}
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
          <Tooltip title="编辑">
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这个路由规则吗？"
            description="删除后无法恢复。"
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
            <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>路由规则</h1>
            <p style={{ color: '#6b7280', margin: 0 }}>
              管理 URL 路由规则，配置动态路由和渲染方式
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={handleCreate}
          >
            创建路由
          </Button>
        </div>

        <Card className="form-card">
          {routes.length > 0 || loading ? (
            <Table
              columns={columns}
              dataSource={routes}
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
                  <p style={{ marginBottom: 16 }}>暂无路由规则</p>
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                    创建第一个路由规则
                  </Button>
                </div>
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{ padding: 60 }}
            />
          )}
        </Card>

        <Modal
          title={editingRoute ? '编辑路由规则' : '创建路由规则'}
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
              name="pattern"
              label="路由模式"
              rules={[
                { required: true, message: '请输入路由模式' },
                { 
                  pattern: /^\/[a-zA-Z0-9\/_-]*(:[a-zA-Z_]+)*$/,
                  message: '路由模式必须以 / 开头，例如：/article/:slug'
                }
              ]}
              help="例如：/article/:slug 或 /page/:id"
            >
              <Input placeholder="/article/:slug" size="large" />
            </Form.Item>

            <Form.Item
              name="type"
              label="路由类型"
              rules={[{ required: true, message: '请选择路由类型' }]}
            >
              <Select size="large">
                <Option value="model">模型路由</Option>
                <Option value="single">单页面</Option>
              </Select>
            </Form.Item>

            {form.getFieldValue('type') === 'model' && (
              <Form.Item
                name="targetModel"
                label="目标模型"
                rules={[{ required: true, message: '请选择目标模型' }]}
              >
                <Select size="large" placeholder="请选择内容模型">
                  {models.map(model => (
                    <Option key={model.id} value={model.slug}>
                      {model.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            )}

            <Form.Item
              name="template"
              label="模板名称"
              help="用于渲染的模板文件名称"
            >
              <Input placeholder="default" size="large" />
            </Form.Item>

            <Form.Item
              name="renderType"
              label="渲染类型"
              rules={[{ required: true, message: '请选择渲染类型' }]}
            >
              <Select size="large">
                <Option value="ssg">SSG - 静态站点生成</Option>
                <Option value="ssr">SSR - 服务端渲染</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="priority"
              label="优先级"
              help="数字越大，优先级越高，匹配时优先使用"
              initialValue={0}
            >
              <InputNumber style={{ width: '100%' }} size="large" min={0} max={100} />
            </Form.Item>

            <Form.Item
              name="status"
              label="状态"
              valuePropName="checked"
              initialValue={true}
            >
              <Switch
                checkedChildren="活跃"
                unCheckedChildren="禁用"
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </Spin>
  );
}

export default RoutesPage;
