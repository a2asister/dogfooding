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
  List,
  Badge,
  Drawer,
  Divider,
  InputNumber
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  DatabaseOutlined,
  FieldNumberOutlined,
  SettingOutlined,
  EyeOutlined,
  AppstoreOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import useSiteStore from '../stores/siteStore';
import { modelApi } from '../services/api';

const { TextArea } = Input;
const { Option } = Select;

const FIELD_TYPES = [
  { value: 'text', label: '单行文本', icon: '✏️' },
  { value: 'textarea', label: '多行文本', icon: '📝' },
  { value: 'richtext', label: '富文本', icon: '📰' },
  { value: 'number', label: '数字', icon: '🔢' },
  { value: 'select', label: '下拉选择', icon: '📋' },
  { value: 'checkbox', label: '多选框', icon: '☑️' },
  { value: 'radio', label: '单选框', icon: '🔘' },
  { value: 'date', label: '日期', icon: '📅' },
  { value: 'datetime', label: '日期时间', icon: '⏰' },
  { value: 'image', label: '图片', icon: '🖼️' },
  { value: 'file', label: '文件', icon: '📁' },
  { value: 'url', label: '链接', icon: '🔗' },
  { value: 'email', label: '邮箱', icon: '📧' }
];

function ContentModels() {
  const { currentSite } = useSiteStore();
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingModel, setEditingModel] = useState(null);
  const [viewingModel, setViewingModel] = useState(null);
  const [form] = Form.useForm();
  const [fieldsForm] = Form.useForm();
  const [editingField, setEditingField] = useState(null);
  const [fieldModalVisible, setFieldModalVisible] = useState(false);

  useEffect(() => {
    if (currentSite) {
      loadModels();
    }
  }, [currentSite]);

  const loadModels = async () => {
    setLoading(true);
    try {
      const response = await modelApi.getAll(currentSite.id);
      if (response.success) {
        setModels(response.data);
      }
    } catch (error) {
      message.error('加载内容模型列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingModel(null);
    form.resetFields();
    fieldsForm.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (model) => {
    setEditingModel(model);
    form.setFieldsValue(model);
    setModalVisible(true);
  };

  const handleView = (model) => {
    setViewingModel(model);
    setDrawerVisible(true);
  };

  const handleDelete = async (modelId) => {
    try {
      await modelApi.delete(currentSite.id, modelId);
      setModels(models.filter(m => m.id !== modelId));
      message.success('内容模型已删除');
    } catch (error) {
      message.error(error.response?.data?.error || '删除内容模型失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingModel) {
        const response = await modelApi.update(currentSite.id, editingModel.id, values);
        if (response.success) {
          setModels(models.map(m => m.id === editingModel.id ? response.data : m));
          message.success('内容模型已更新');
        }
      } else {
        const response = await modelApi.create(currentSite.id, {
          ...values,
          fields: []
        });
        if (response.success) {
          setModels([...models, response.data]);
          message.success('内容模型已创建');
        }
      }
      
      setModalVisible(false);
    } catch (error) {
      message.error(error.response?.data?.error || '操作失败');
    }
  };

  const handleAddField = () => {
    setEditingField(null);
    fieldsForm.resetFields();
    fieldsForm.setFieldsValue({
      type: 'text',
      required: false
    });
    setFieldModalVisible(true);
  };

  const handleEditField = (field, index) => {
    setEditingField({ ...field, index });
    fieldsForm.setFieldsValue(field);
    setFieldModalVisible(true);
  };

  const handleSaveField = () => {
    const values = fieldsForm.getFieldsValue();
    const currentFields = form.getFieldValue('fields') || editingModel?.fields || [];
    
    if (editingField) {
      currentFields[editingField.index] = values;
    } else {
      currentFields.push(values);
    }
    
    form.setFieldsValue({ fields: currentFields });
    setFieldModalVisible(false);
  };

  const handleRemoveField = (index) => {
    const currentFields = form.getFieldValue('fields') || editingModel?.fields || [];
    const newFields = currentFields.filter((_, i) => i !== index);
    form.setFieldsValue({ fields: newFields });
  };

  const columns = [
    {
      title: '模型名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <AppstoreOutlined style={{ color: '#667eea' }} />
          <span style={{ fontWeight: 500 }}>{text}</span>
          {record.isSystem && (
            <Tag color="blue">系统</Tag>
          )}
        </Space>
      )
    },
    {
      title: '别名',
      dataIndex: 'slug',
      key: 'slug',
      render: (slug) => <code style={{ background: '#f5f5f5', padding: '2px 8px', borderRadius: 4 }}>{slug}</code>
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text) => text || '-'
    },
    {
      title: '字段数',
      dataIndex: 'fields',
      key: 'fields',
      render: (fields) => (
        <Badge count={fields?.length || 0} style={{ backgroundColor: '#667eea' }} />
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
          <Tooltip title="查看">
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
            />
          </Tooltip>
          {!record.isSystem && (
            <>
              <Tooltip title="编辑">
                <Button
                  type="link"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(record)}
                />
              </Tooltip>
              <Popconfirm
                title="确定要删除这个内容模型吗？"
                description="删除后无法恢复，如果模型下有内容将无法删除。"
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
            </>
          )}
        </Space>
      )
    }
  ];

  const currentFields = form.getFieldValue('fields') || editingModel?.fields || [];

  return (
    <Spin spinning={loading}>
      <div>
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>内容模型</h1>
            <p style={{ color: '#6b7280', margin: 0 }}>
              管理内容结构，定义字段和数据类型
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={handleCreate}
          >
            创建模型
          </Button>
        </div>

        <Card className="form-card">
          {models.length > 0 ? (
            <Table
              columns={columns}
              dataSource={models}
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
                  <p style={{ marginBottom: 16 }}>暂无内容模型</p>
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                    创建第一个内容模型
                  </Button>
                </div>
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{ padding: 60 }}
            />
          )}
        </Card>

        <Modal
          title={editingModel ? '编辑内容模型' : '创建内容模型'}
          open={modalVisible}
          onOk={handleSubmit}
          onCancel={() => setModalVisible(false)}
          okText="确定"
          cancelText="取消"
          width={800}
        >
          <Form
            form={form}
            layout="vertical"
            className="modal-content"
          >
            <Form.Item
              name="name"
              label="模型名称"
              rules={[
                { required: true, message: '请输入模型名称' },
                { min: 2, message: '模型名称至少2个字符' }
              ]}
            >
              <Input placeholder="例如：文章、产品、页面" size="large" />
            </Form.Item>

            <Form.Item
              name="slug"
              label="模型别名"
              rules={[
                { required: true, message: '请输入模型别名' },
                { 
                  pattern: /^[a-z][a-z0-9-]*$/,
                  message: '别名只能包含小写字母、数字和横杠，且以字母开头'
                }
              ]}
              help="用于 URL 路径，例如：article, product"
            >
              <Input placeholder="例如：article, product" size="large" />
            </Form.Item>

            <Form.Item
              name="description"
              label="描述"
            >
              <TextArea
                rows={2}
                placeholder="请输入模型描述"
                size="large"
                showCount
                maxLength={200}
              />
            </Form.Item>

            <Divider>
              <Space>
                <DatabaseOutlined />
                字段管理
              </Space>
            </Divider>

            <div style={{ marginBottom: 16 }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddField}
              >
                添加字段
              </Button>
            </div>

            {currentFields.length > 0 ? (
              <List
                dataSource={currentFields}
                renderItem={(field, index) => (
                  <List.Item
                    actions={[
                      <Button
                        type="link"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEditField(field, index)}
                      />,
                      <Popconfirm
                        title="确定要删除这个字段吗？"
                        onConfirm={() => handleRemoveField(index)}
                        okText="确定"
                        cancelText="取消"
                      >
                        <Button
                          type="link"
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                        />
                      </Popconfirm>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <span style={{ fontSize: 20 }}>
                          {FIELD_TYPES.find(t => t.value === field.type)?.icon || '📄'}
                        </span>
                      }
                      title={
                        <Space>
                          <span style={{ fontWeight: 500 }}>{field.label}</span>
                          <code style={{ fontSize: 12, color: '#666' }}>{field.name}</code>
                          {field.required && <Tag color="red" style={{ fontSize: 10 }}>必填</Tag>}
                        </Space>
                      }
                      description={
                        <Space>
                          <Tag>{FIELD_TYPES.find(t => t.value === field.type)?.label || field.type}</Tag>
                          {field.default !== undefined && (
                            <Tag color="blue">默认: {field.default}</Tag>
                          )}
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty
                description="暂无字段，点击上方按钮添加"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                style={{ padding: 20 }}
              />
            )}
          </Form>
        </Modal>

        <Modal
          title={editingField ? '编辑字段' : '添加字段'}
          open={fieldModalVisible}
          onOk={handleSaveField}
          onCancel={() => setFieldModalVisible(false)}
          okText="确定"
          cancelText="取消"
          width={500}
        >
          <Form
            form={fieldsForm}
            layout="vertical"
            className="modal-content"
          >
            <Form.Item
              name="label"
              label="字段标签"
              rules={[{ required: true, message: '请输入字段标签' }]}
            >
              <Input placeholder="例如：标题、内容、价格" size="large" />
            </Form.Item>

            <Form.Item
              name="name"
              label="字段名称"
              rules={[
                { required: true, message: '请输入字段名称' },
                { 
                  pattern: /^[a-z][a-z0-9_]*$/,
                  message: '名称只能包含小写字母、数字和下划线，且以字母开头'
                }
              ]}
              help="用于代码中，例如：title, content, price"
            >
              <Input placeholder="例如：title, content, price" size="large" />
            </Form.Item>

            <Form.Item
              name="type"
              label="字段类型"
              rules={[{ required: true, message: '请选择字段类型' }]}
            >
              <Select size="large" placeholder="请选择字段类型">
                {FIELD_TYPES.map(type => (
                  <Option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="required"
              label="必填"
              valuePropName="checked"
              initialValue={false}
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name="default"
              label="默认值"
            >
              <Input placeholder="可选，设置默认值" size="large" />
            </Form.Item>

            <Form.Item
              name="help"
              label="帮助文本"
            >
              <Input placeholder="显示在字段下方的提示信息" size="large" />
            </Form.Item>

            {fieldsForm.getFieldValue('type') === 'select' || 
             fieldsForm.getFieldValue('type') === 'checkbox' || 
             fieldsForm.getFieldValue('type') === 'radio' ? (
              <Form.Item
                name="options"
                label="选项"
                help="每行一个选项，格式：值|显示文本，例如：1|选项一"
              >
                <TextArea
                  rows={4}
                  placeholder="1|选项一&#10;2|选项二&#10;3|选项三"
                />
              </Form.Item>
            ) : null}
          </Form>
        </Modal>

        <Drawer
          title="模型详情"
          width={600}
          open={drawerVisible}
          onClose={() => setDrawerVisible(false)}
        >
          {viewingModel && (
            <div>
              <Card size="small" style={{ marginBottom: 16 }}>
                <p><strong>名称：</strong>{viewingModel.name}</p>
                <p><strong>别名：</strong><code>{viewingModel.slug}</code></p>
                <p><strong>描述：</strong>{viewingModel.description || '-'}</p>
                <p><strong>系统模型：</strong>{viewingModel.isSystem ? '是' : '否'}</p>
              </Card>

              <Divider>
                <Space>
                  <DatabaseOutlined />
                  字段列表 ({viewingModel.fields?.length || 0})
                </Space>
              </Divider>

              {viewingModel.fields && viewingModel.fields.length > 0 ? (
                viewingModel.fields.map((field, index) => (
                  <Card 
                    key={index} 
                    size="small" 
                    style={{ marginBottom: 12 }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                      <span style={{ fontSize: 20 }}>
                        {FIELD_TYPES.find(t => t.value === field.type)?.icon || '📄'}
                      </span>
                      <span style={{ fontWeight: 600, fontSize: 16 }}>{field.label}</span>
                      <code style={{ color: '#666' }}>{field.name}</code>
                      {field.required && <Tag color="red">必填</Tag>}
                    </div>
                    <p>
                      <Tag>{FIELD_TYPES.find(t => t.value === field.type)?.label || field.type}</Tag>
                      {field.default !== undefined && (
                        <Tag color="blue">默认: {field.default}</Tag>
                      )}
                    </p>
                    {field.help && <p style={{ color: '#666', fontSize: 12, margin: 0 }}>{field.help}</p>}
                  </Card>
                ))
              ) : (
                <Empty
                  description="该模型暂无字段"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </div>
          )}
        </Drawer>
      </div>
    </Spin>
  );
}

export default ContentModels;
