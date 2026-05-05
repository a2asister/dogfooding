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
  Drawer,
  Divider,
  InputNumber,
  DatePicker
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  RocketOutlined,
  FileTextOutlined,
  SearchOutlined,
  FilterOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import useSiteStore from '../stores/siteStore';
import { contentApi, modelApi } from '../services/api';

const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

function Contents() {
  const { currentSite } = useSiteStore();
  const [loading, setLoading] = useState(false);
  const [contents, setContents] = useState([]);
  const [models, setModels] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  const [viewingContent, setViewingContent] = useState(null);
  const [form] = Form.useForm();
  const [selectedModel, setSelectedModel] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  useEffect(() => {
    if (currentSite) {
      loadContents();
      loadModels();
    }
  }, [currentSite, pagination.current, pagination.pageSize, statusFilter]);

  const loadContents = async () => {
    setLoading(true);
    try {
      const params = {
        limit: pagination.pageSize,
        offset: (pagination.current - 1) * pagination.pageSize
      };
      if (statusFilter) params.status = statusFilter;
      if (selectedModel) params.modelId = selectedModel;
      
      const response = await contentApi.getAll(currentSite.id, params);
      if (response.success) {
        const items = response.data?.items || response.data || [];
        const total = response.data?.total || items.length;
        setContents(items);
        setPagination(prev => ({ ...prev, total }));
      }
    } catch (error) {
      message.error('加载内容列表失败');
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
    setEditingContent(null);
    form.resetFields();
    if (models.length > 0) {
      form.setFieldsValue({
        modelId: models[0].id,
        status: 'draft',
        data: {}
      });
    }
    setModalVisible(true);
  };

  const handleEdit = (content) => {
    setEditingContent(content);
    form.setFieldsValue({
      ...content,
      ...content.data
    });
    setModalVisible(true);
  };

  const handleView = (content) => {
    setViewingContent(content);
    setDrawerVisible(true);
  };

  const handleDelete = async (contentId) => {
    try {
      await contentApi.delete(currentSite.id, contentId);
      message.success('内容已删除');
      loadContents();
    } catch (error) {
      message.error('删除内容失败');
    }
  };

  const handlePublish = async (content) => {
    try {
      const response = await contentApi.publish(currentSite.id, content.id);
      if (response.success) {
        message.success('内容已发布');
        loadContents();
      }
    } catch (error) {
      message.error('发布内容失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const modelId = values.modelId;
      const model = models.find(m => m.id === modelId);
      
      const contentData = {};
      if (model && model.fields) {
        model.fields.forEach(field => {
          if (values[field.name] !== undefined) {
            contentData[field.name] = values[field.name];
          }
        });
      }
      
      const submitData = {
        modelId,
        data: contentData,
        slug: values.slug || contentData.slug || contentData.title?.toLowerCase().replace(/\s+/g, '-'),
        status: values.status
      };
      
      if (editingContent) {
        const response = await contentApi.update(currentSite.id, editingContent.id, submitData);
        if (response.success) {
          message.success('内容已更新');
          loadContents();
        }
      } else {
        const response = await contentApi.create(currentSite.id, submitData);
        if (response.success) {
          message.success('内容已创建');
          loadContents();
        }
      }
      
      setModalVisible(false);
    } catch (error) {
      message.error(error.response?.data?.error || '操作失败');
    }
  };

  const currentModel = selectedModel ? models.find(m => m.id === selectedModel) : null;
  const editingModel = editingContent ? models.find(m => m.id === editingContent.modelId) : currentModel;

  const columns = [
    {
      title: '标题',
      dataIndex: ['data', 'title'],
      key: 'title',
      render: (text, record) => (
        <Space>
          <FileTextOutlined style={{ color: '#667eea' }} />
          <span style={{ fontWeight: 500 }}>
            {text || record.data?.name || record.slug || '-'}
          </span>
        </Space>
      ),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="搜索标题"
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              size="small"
              style={{ width: 90 }}
            >
              搜索
            </Button>
            <Button
              onClick={() => clearFilters()}
              size="small"
              style={{ width: 90 }}
            >
              重置
            </Button>
          </Space>
        </div>
      ),
      filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#667eea' : undefined }} />,
      onFilter: (value, record) => 
        (record.data?.title || record.data?.name || '').toLowerCase().includes(value.toLowerCase())
    },
    {
      title: 'URL别名',
      dataIndex: 'slug',
      key: 'slug',
      render: (slug) => (
        <code style={{ background: '#f5f5f5', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>
          {slug}
        </code>
      )
    },
    {
      title: '模型',
      dataIndex: 'modelSlug',
      key: 'modelSlug',
      render: (slug) => <Tag color="blue">{slug}</Tag>,
      filters: models.map(m => ({ text: m.name, value: m.id })),
      onFilter: (value, record) => record.modelId === value
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag className={status === 'published' ? 'tag-published' : 'tag-draft'}>
          {status === 'published' ? '已发布' : '草稿'}
        </Tag>
      ),
      filters: [
        { text: '已发布', value: 'published' },
        { text: '草稿', value: 'draft' }
      ],
      onFilter: (value, record) => record.status === value
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (time) => dayjs(time).format('YYYY-MM-DD HH:mm'),
      sorter: (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt)
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small" className="action-buttons">
          <Tooltip title="查看">
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          {record.status !== 'published' && (
            <Tooltip title="发布">
              <Button
                type="link"
                size="small"
                icon={<RocketOutlined />}
                onClick={() => handlePublish(record)}
              />
            </Tooltip>
          )}
          <Popconfirm
            title="确定要删除这个内容吗？"
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

  const renderField = (field) => {
    switch (field.type) {
      case 'textarea':
      case 'richtext':
        return (
          <Form.Item
            name={field.name}
            label={field.label}
            rules={field.required ? [{ required: true, message: `请输入${field.label}` }] : []}
            initialValue={editingContent?.data?.[field.name] || field.default}
          >
            <TextArea
              rows={field.type === 'richtext' ? 8 : 4}
              placeholder={`请输入${field.label}`}
            />
          </Form.Item>
        );
      case 'select':
        return (
          <Form.Item
            name={field.name}
            label={field.label}
            rules={field.required ? [{ required: true, message: `请选择${field.label}` }] : []}
            initialValue={editingContent?.data?.[field.name] || field.default}
          >
            <Select placeholder={`请选择${field.label}`}>
              {field.options?.split('\n').map((opt, idx) => {
                const [value, label] = opt.split('|');
                return <Option key={idx} value={value?.trim()}>{label?.trim() || value?.trim()}</Option>;
              }) || []}
            </Select>
          </Form.Item>
        );
      case 'checkbox':
        return (
          <Form.Item
            name={field.name}
            label={field.label}
            valuePropName="checked"
            initialValue={editingContent?.data?.[field.name] || field.default === 'true'}
          >
            <Switch />
          </Form.Item>
        );
      case 'number':
        return (
          <Form.Item
            name={field.name}
            label={field.label}
            rules={field.required ? [{ required: true, message: `请输入${field.label}` }] : []}
            initialValue={editingContent?.data?.[field.name] || field.default}
          >
            <InputNumber style={{ width: '100%' }} placeholder={`请输入${field.label}`} />
          </Form.Item>
        );
      case 'date':
      case 'datetime':
        return (
          <Form.Item
            name={field.name}
            label={field.label}
            rules={field.required ? [{ required: true, message: `请选择${field.label}` }] : []}
            initialValue={editingContent?.data?.[field.name] ? dayjs(editingContent.data[field.name]) : null}
          >
            <DatePicker
              showTime={field.type === 'datetime'}
              style={{ width: '100%' }}
              placeholder={`请选择${field.label}`}
            />
          </Form.Item>
        );
      default:
        return (
          <Form.Item
            name={field.name}
            label={field.label}
            rules={field.required ? [{ required: true, message: `请输入${field.label}` }] : []}
            initialValue={editingContent?.data?.[field.name] || field.default}
          >
            <Input placeholder={`请输入${field.label}`} />
          </Form.Item>
        );
    }
  };

  return (
    <Spin spinning={loading}>
      <div>
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>内容管理</h1>
            <p style={{ color: '#6b7280', margin: 0 }}>
              管理站点内容，创建、编辑和发布内容
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={handleCreate}
          >
            创建内容
          </Button>
        </div>

        <Card className="form-card">
          {contents.length > 0 || loading ? (
            <Table
              columns={columns}
              dataSource={contents}
              rowKey="id"
              pagination={{
                ...pagination,
                showSizeChanger: true,
                showTotal: (total) => `共 ${total} 条`,
                onChange: (page, pageSize) => setPagination(prev => ({ ...prev, current: page, pageSize }))
              }}
              className="table-container"
            />
          ) : (
            <Empty
              description={
                <div>
                  <p style={{ marginBottom: 16 }}>暂无内容</p>
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                    创建第一篇内容
                  </Button>
                </div>
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{ padding: 60 }}
            />
          )}
        </Card>

        <Modal
          title={editingContent ? '编辑内容' : '创建内容'}
          open={modalVisible}
          onOk={handleSubmit}
          onCancel={() => setModalVisible(false)}
          okText="确定"
          cancelText="取消"
          width={700}
        >
          <Form
            form={form}
            layout="vertical"
            className="modal-content"
          >
            <Form.Item
              name="modelId"
              label="内容模型"
              rules={[{ required: true, message: '请选择内容模型' }]}
            >
              <Select 
                placeholder="请选择内容模型"
                size="large"
                onChange={(value) => {
                  setSelectedModel(value);
                }}
              >
                {models.map(model => (
                  <Option key={model.id} value={model.id}>
                    {model.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="slug"
              label="URL别名"
              help="用于生成访问路径，留空将自动从标题生成"
            >
              <Input placeholder="例如：my-first-post" />
            </Form.Item>

            <Form.Item
              name="status"
              label="状态"
              initialValue="draft"
            >
              <Select size="large">
                <Option value="draft">草稿</Option>
                <Option value="published">已发布</Option>
              </Select>
            </Form.Item>

            <Divider>
              <Space>
                <FileTextOutlined />
                内容字段
              </Space>
            </Divider>

            {editingModel?.fields?.map((field, index) => (
              <div key={field.name}>
                {renderField(field)}
              </div>
            ))}

            {(!editingModel || editingModel.fields?.length === 0) && (
              <Empty
                description="请先选择内容模型，或该模型没有定义字段"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                style={{ padding: 20 }}
              />
            )}
          </Form>
        </Modal>

        <Drawer
          title="内容详情"
          width={600}
          open={drawerVisible}
          onClose={() => setDrawerVisible(false)}
        >
          {viewingContent && (
            <div>
              <Card size="small" style={{ marginBottom: 16 }}>
                <p><strong>标题：</strong>{viewingContent.data?.title || viewingContent.data?.name || '-'}</p>
                <p><strong>URL别名：</strong><code>{viewingContent.slug}</code></p>
                <p><strong>模型：</strong><Tag color="blue">{viewingContent.modelSlug}</Tag></p>
                <p>
                  <strong>状态：</strong>
                  <Tag className={viewingContent.status === 'published' ? 'tag-published' : 'tag-draft'}>
                    {viewingContent.status === 'published' ? '已发布' : '草稿'}
                  </Tag>
                </p>
                <p><strong>创建时间：</strong>{dayjs(viewingContent.createdAt).format('YYYY-MM-DD HH:mm')}</p>
                <p><strong>更新时间：</strong>{dayjs(viewingContent.updatedAt).format('YYYY-MM-DD HH:mm')}</p>
                {viewingContent.publishedAt && (
                  <p><strong>发布时间：</strong>{dayjs(viewingContent.publishedAt).format('YYYY-MM-DD HH:mm')}</p>
                )}
              </Card>

              <Divider>
                <Space>
                  <FileTextOutlined />
                  内容数据
                </Space>
              </Divider>

              <Card size="small">
                {viewingContent.data ? (
                  Object.entries(viewingContent.data).map(([key, value]) => (
                    <div key={key} style={{ marginBottom: 12 }}>
                      <p style={{ fontWeight: 600, marginBottom: 4 }}>{key}</p>
                      {typeof value === 'string' && value.length > 100 ? (
                        <div style={{ 
                          padding: 8, 
                          background: '#f9fafb', 
                          borderRadius: 4,
                          whiteSpace: 'pre-wrap'
                        }}>
                          {value}
                        </div>
                      ) : (
                        <p style={{ color: '#666', margin: 0 }}>
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <Empty
                    description="暂无数据"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                )}
              </Card>
            </div>
          )}
        </Drawer>
      </div>
    </Spin>
  );
}

export default Contents;
