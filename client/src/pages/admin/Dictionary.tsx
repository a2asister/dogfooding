import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Tabs,
  InputNumber,
  Tag,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { Dictionary, OperationLog } from '@/types';
import { dictionaryApi } from '@/services/api';

const dictionaryTypes = [
  { key: 'region', label: '地区数据' },
  { key: 'disease', label: '疾病分类' },
  { key: 'drug', label: '药品目录' },
  { key: 'department', label: '科室分类' },
  { key: 'title', label: '职称分类' },
];

export default function Dictionary() {
  const [currentType, setCurrentType] = useState('region');
  const [dictionaries, setDictionaries] = useState<Record<string, Dictionary[]>>({});
  const [operationLogs, setOperationLogs] = useState<OperationLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Dictionary | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchDictionaries();
    fetchOperationLogs();
  }, []);

  const fetchDictionaries = async () => {
    setLoading(true);
    try {
      const res = await dictionaryApi.getAll();
      setDictionaries(res);
    } finally {
      setLoading(false);
    }
  };

  const fetchOperationLogs = async () => {
    try {
      const res = await dictionaryApi.getOperationLogs(1, 50);
      setOperationLogs(res.list as OperationLog[]);
    } catch {
      // error handled
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Dictionary) => {
    setEditingItem(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await dictionaryApi.delete(id);
      message.success('删除成功');
      fetchDictionaries();
    } catch {
      // error handled
    }
  };

  const handleSubmit = async (values: Partial<Dictionary>) => {
    try {
      if (editingItem) {
        await dictionaryApi.update(editingItem.id, values);
        message.success('更新成功');
      } else {
        await dictionaryApi.create({ ...values, type: currentType });
        message.success('创建成功');
      }
      setModalVisible(false);
      fetchDictionaries();
    } catch {
      // error handled
    }
  };

  const columns = [
    { title: '编码', dataIndex: 'code', key: 'code', width: 120 },
    { title: '名称', dataIndex: 'name', key: 'name' },
    {
      title: '上级编码',
      dataIndex: 'parent_code',
      key: 'parent_code',
      render: (val: string) => val || '-',
    },
    { title: '排序', dataIndex: 'sort_order', key: 'sort_order', width: 80 },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: unknown, record: Dictionary) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const logColumns = [
    { title: '操作人', dataIndex: 'user_name', key: 'user_name', width: 120 },
    { title: '模块', dataIndex: 'module', key: 'module', width: 120 },
    { title: '操作内容', dataIndex: 'operation', key: 'operation' },
    { title: 'IP地址', dataIndex: 'ip', key: 'ip', width: 120 },
    {
      title: '操作时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (time: string) => <Tag color="blue">{time}</Tag>,
    },
  ];

  const tabItems = [
    ...dictionaryTypes.map((type) => ({
      key: type.key,
      label: type.label,
      children: (
        <div>
          <div className="flex justify-end mb-4">
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增{type.label}
            </Button>
          </div>
          <Table
            columns={columns}
            dataSource={dictionaries[type.key] || []}
            rowKey="id"
            loading={loading}
            size="small"
          />
        </div>
      ),
    })),
    {
      key: 'logs',
      label: '操作日志',
      children: (
        <Table
          columns={logColumns}
          dataSource={operationLogs}
          rowKey="id"
          loading={loading}
          size="small"
        />
      ),
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">数据字典</h2>
      <Tabs
        activeKey={currentType}
        onChange={setCurrentType}
        items={tabItems}
      />

      <Modal
        title={editingItem ? '编辑字典项' : '新增字典项'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="code"
            label="编码"
            rules={[{ required: true, message: '请输入编码' }]}
          >
            <Input placeholder="请输入编码" />
          </Form.Item>
          <Form.Item
            name="name"
            label="名称"
            rules={[{ required: true, message: '请输入名称' }]}
          >
            <Input placeholder="请输入名称" />
          </Form.Item>
          <Form.Item name="parent_code" label="上级编码">
            <Select
              placeholder="请选择上级（可选）"
              allowClear
              showSearch
              optionFilterProp="label"
            >
              {(dictionaries[currentType] || []).map((item) => (
                <Select.Option key={item.code} value={item.code} label={item.name}>
                  {item.code} - {item.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="sort_order"
            label="排序"
            rules={[{ required: true, message: '请输入排序' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                保存
              </Button>
              <Button onClick={() => setModalVisible(false)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
