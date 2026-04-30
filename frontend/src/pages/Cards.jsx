import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Space,
  InputNumber,
  Tag,
  Popconfirm,
  Card,
  Switch,
  Row,
  Col
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { cardApi, categoryApi } from '../api';

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;

const cardTypeOptions = [
  { value: 'debit', label: '借记卡' },
  { value: 'credit', label: '信用卡' },
  { value: 'prepaid', label: '预付卡' }
];

const Cards = () => {
  const [cards, setCards] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  useEffect(() => {
    fetchData();
    fetchCategories();
  }, []);

  const fetchData = async (search = '') => {
    setLoading(true);
    try {
      const params = search ? { search } : {};
      const response = await cardApi.getAll(params);
      setCards(response.data);
    } catch (error) {
      message.error('获取银行卡列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryApi.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error('获取分类失败:', error);
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
    fetchData(value);
  };

  const handleAdd = () => {
    setEditingCard(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingCard(record);
    form.setFieldsValue({
      ...record,
      valid_from: record.valid_from ? dayjs(record.valid_from) : null,
      valid_to: record.valid_to ? dayjs(record.valid_to) : null
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await cardApi.delete(id);
      message.success('删除成功');
      fetchData(searchText);
    } catch (error) {
      message.error(error.response?.data?.error || '删除失败');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await cardApi.updateStatus(id, status);
      message.success('状态更新成功');
      fetchData(searchText);
    } catch (error) {
      message.error('状态更新失败');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      const formattedValues = {
        ...values,
        valid_from: values.valid_from ? values.valid_from.format('YYYY-MM-DD') : null,
        valid_to: values.valid_to ? values.valid_to.format('YYYY-MM-DD') : null
      };

      if (editingCard) {
        await cardApi.update(editingCard.id, formattedValues);
        message.success('更新成功');
      } else {
        await cardApi.create(formattedValues);
        message.success('创建成功');
      }

      setModalVisible(false);
      fetchData(searchText);
    } catch (error) {
      if (error.errorFields) {
        return;
      }
      message.error(error.response?.data?.error || '操作失败');
    }
  };

  const columns = [
    {
      title: '银行名称',
      dataIndex: 'bank_name',
      key: 'bank_name',
      render: (text) => <strong>{text}</strong>
    },
    {
      title: '卡号',
      dataIndex: 'card_number_masked',
      key: 'card_number_masked',
      render: (text, record) => (
        <span>
          {text}
          <Tag color="blue" style={{ marginLeft: 8 }}>
            尾号 {record.card_number_last4}
          </Tag>
        </span>
      )
    },
    {
      title: '卡片类型',
      dataIndex: 'card_type',
      key: 'card_type',
      render: (type) => {
        const typeMap = {
          debit: { text: '借记卡', color: 'blue' },
          credit: { text: '信用卡', color: 'orange' },
          prepaid: { text: '预付卡', color: 'green' }
        };
        const info = typeMap[type] || { text: type, color: 'default' };
        return <Tag color={info.color}>{info.text}</Tag>;
      }
    },
    {
      title: '账户分类',
      dataIndex: 'category_name',
      key: 'category_name',
      render: (name, record) => (
        name ? (
          <Tag color={record.category_color || '#1890ff'}>{name}</Tag>
        ) : (
          <Tag color="default">未分类</Tag>
        )
      )
    },
    {
      title: '有效期',
      dataIndex: 'valid_to',
      key: 'valid_to',
      render: (date) => date ? dayjs(date).format('YYYY-MM-DD') : '-'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Switch
          checked={status === 'active'}
          checkedChildren="启用"
          unCheckedChildren="停用"
          onChange={(checked) => handleStatusChange(record.id, checked ? 'active' : 'inactive')}
        />
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这张银行卡吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  const stats = {
    total: cards.length,
    active: cards.filter(c => c.status === 'active').length,
    inactive: cards.filter(c => c.status === 'inactive').length
  };

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 'bold', color: '#1890ff' }}>
                {stats.total}
              </div>
              <div style={{ color: '#666' }}>总银行卡数</div>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 'bold', color: '#52c41a' }}>
                {stats.active}
              </div>
              <div style={{ color: '#666' }}>启用中</div>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 'bold', color: '#ff4d4f' }}>
                {stats.inactive}
              </div>
              <div style={{ color: '#666' }}>已停用</div>
            </div>
          </Card>
        </Col>
      </Row>

      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Search
          placeholder="搜索银行名称、卡号尾号..."
          allowClear
          enterButton={<SearchOutlined />}
          size="middle"
          onSearch={handleSearch}
          style={{ width: 400 }}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加银行卡
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={cards}
        rowKey="id"
        loading={loading}
        pagination={{
          showTotal: (total) => `共 ${total} 条记录`,
          pageSize: 10
        }}
      />

      <Modal
        title={editingCard ? '编辑银行卡' : '添加银行卡'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="bank_name"
            label="银行名称"
            rules={[{ required: true, message: '请输入银行名称' }]}
          >
            <Input placeholder="例如：中国工商银行" />
          </Form.Item>

          <Form.Item
            name="card_number"
            label="卡号"
            rules={[{ required: true, message: '请输入卡号' }]}
          >
            <Input placeholder="请输入银行卡号" />
          </Form.Item>

          <Form.Item
            name="card_type"
            label="卡片类型"
            rules={[{ required: true, message: '请选择卡片类型' }]}
          >
            <Select placeholder="请选择卡片类型">
              {cardTypeOptions.map(opt => (
                <Option key={opt.value} value={opt.value}>{opt.label}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="category_id" label="账户分类">
            <Select placeholder="请选择账户分类" allowClear>
              {categories.map(cat => (
                <Option key={cat.id} value={cat.id}>{cat.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="cvv"
            label="CVV码（可选）"
          >
            <Input placeholder="信用卡CVV码" maxLength={4} />
          </Form.Item>

          <Form.Item name="valid_from" label="发卡日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="valid_to" label="有效期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="reserved_info" label="预留信息">
            <TextArea rows={3} placeholder="预留信息或备注" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Cards;
