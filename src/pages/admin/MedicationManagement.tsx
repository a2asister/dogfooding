import { useState, useEffect } from 'react';
import { Card, Table, Button, Typography, Space, Tag, Modal, Form, Input, InputNumber, Select, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useHospitalStore } from '../../stores/hospitalStore';
import type { ColumnsType } from 'antd/es/table';
import type { Medication } from '../../types';
import { MEDICATION_CATEGORIES } from '../../constants';

const { Title } = Typography;

export default function MedicationManagement() {
  const { medications, loadMedications, addMedication, updateMedication, deleteMedication } =
    useHospitalStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadMedications();
  }, [loadMedications]);

  const handleAdd = () => {
    setEditingMed(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Medication) => {
    setEditingMed(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    const success = deleteMedication(id);
    if (success) {
      message.success('删除成功');
    } else {
      message.error('删除失败');
    }
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (editingMed) {
        const updated = updateMedication(editingMed.id, values);
        if (updated) {
          message.success('更新成功');
          setModalVisible(false);
        }
      } else {
        addMedication(values);
        message.success('创建成功');
        setModalVisible(false);
      }
    });
  };

  const columns: ColumnsType<Medication> = [
    {
      title: '药品名称',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Typography.Text strong>{text}</Typography.Text>,
    },
    {
      title: '通用名',
      dataIndex: 'genericName',
      key: 'genericName',
      render: (text) => text || '-',
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: (category) => <Tag color="blue">{category}</Tag>,
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: (price) => <span style={{ color: '#fa8c16' }}>¥{price.toFixed(2)}</span>,
    },
    {
      title: '生产厂家',
      dataIndex: 'manufacturer',
      key: 'manufacturer',
      render: (text) => text || '-',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定要删除该药品吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          药品管理
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增药品
        </Button>
      </div>

      <Card>
        <Table columns={columns} dataSource={medications} rowKey="id" size="middle" />
      </Card>

      <Modal
        title={editingMed ? '编辑药品' : '新增药品'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText="确定"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item
            name="name"
            label="药品名称"
            rules={[{ required: true, message: '请输入药品名称' }]}
          >
            <Input placeholder="请输入药品名称" />
          </Form.Item>
          <Form.Item name="genericName" label="通用名">
            <Input placeholder="请输入通用名" />
          </Form.Item>
          <Form.Item
            name="category"
            label="分类"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select placeholder="请选择分类">
              {MEDICATION_CATEGORIES.map((cat) => (
                <Select.Option key={cat} value={cat}>
                  {cat}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="unit"
            label="单位"
            rules={[{ required: true, message: '请输入单位' }]}
          >
            <Input placeholder="请输入单位，如：盒、瓶、支" />
          </Form.Item>
          <Form.Item
            name="price"
            label="价格"
            rules={[{ required: true, message: '请输入价格' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="请输入价格"
              precision={2}
              min={0}
            />
          </Form.Item>
          <Form.Item name="manufacturer" label="生产厂家">
            <Input placeholder="请输入生产厂家" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea placeholder="请输入药品描述" rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
