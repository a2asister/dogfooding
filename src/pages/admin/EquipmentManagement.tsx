import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Typography,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  message,
  Popconfirm,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ToolOutlined } from '@ant-design/icons';
import { useHospitalStore } from '../../stores/hospitalStore';
import type { ColumnsType } from 'antd/es/table';
import type { Equipment } from '../../types';

const { Title } = Typography;

const statusColors: Record<string, string> = {
  active: 'green',
  maintenance: 'orange',
  retired: 'default',
  broken: 'red',
};

const statusLabels: Record<string, string> = {
  active: '正常使用',
  maintenance: '维护中',
  retired: '已报废',
  broken: '故障',
};

export default function EquipmentManagement() {
  const { equipment, loadEquipment, addEquipment, updateEquipment, deleteEquipment } =
    useHospitalStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEq, setEditingEq] = useState<Equipment | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadEquipment();
  }, [loadEquipment]);

  const handleAdd = () => {
    setEditingEq(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Equipment) => {
    setEditingEq(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    const success = deleteEquipment(id);
    if (success) {
      message.success('删除成功');
    } else {
      message.error('删除失败');
    }
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (editingEq) {
        const updated = updateEquipment(editingEq.id, values);
        if (updated) {
          message.success('更新成功');
          setModalVisible(false);
        }
      } else {
        addEquipment(values);
        message.success('创建成功');
        setModalVisible(false);
      }
    });
  };

  const columns: ColumnsType<Equipment> = [
    {
      title: '设备名称',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <Space>
          <ToolOutlined style={{ color: '#1890ff' }} />
          <Typography.Text strong>{text}</Typography.Text>
        </Space>
      ),
    },
    {
      title: '设备类型',
      dataIndex: 'equipmentType',
      key: 'equipmentType',
      render: (type) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: '型号',
      dataIndex: 'model',
      key: 'model',
      render: (text) => text || '-',
    },
    {
      title: '序列号',
      dataIndex: 'serialNumber',
      key: 'serialNumber',
      render: (text) => text || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={statusColors[status]}>{statusLabels[status]}</Tag>,
    },
    {
      title: '位置',
      dataIndex: 'location',
      key: 'location',
      render: (text) => text || '-',
    },
    {
      title: '最后维护日期',
      dataIndex: 'lastMaintenanceDate',
      key: 'lastMaintenanceDate',
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
            title="确定要删除该设备吗？"
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
          设备管理
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增设备
        </Button>
      </div>

      <Card>
        <Table columns={columns} dataSource={equipment} rowKey="id" size="middle" />
      </Card>

      <Modal
        title={editingEq ? '编辑设备' : '新增设备'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText="确定"
        cancelText="取消"
        width={700}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item
            name="name"
            label="设备名称"
            rules={[{ required: true, message: '请输入设备名称' }]}
          >
            <Input placeholder="请输入设备名称" />
          </Form.Item>
          <Form.Item
            name="equipmentType"
            label="设备类型"
            rules={[{ required: true, message: '请输入设备类型' }]}
          >
            <Input placeholder="请输入设备类型" />
          </Form.Item>
          <Form.Item name="model" label="型号">
            <Input placeholder="请输入型号" />
          </Form.Item>
          <Form.Item name="serialNumber" label="序列号">
            <Input placeholder="请输入序列号" />
          </Form.Item>
          <Form.Item name="manufacturer" label="生产厂家">
            <Input placeholder="请输入生产厂家" />
          </Form.Item>
          <Form.Item name="purchaseDate" label="购买日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="warrantyExpiry" label="保修到期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="location" label="存放位置">
            <Input placeholder="请输入存放位置" />
          </Form.Item>
          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              <Select.Option value="active">正常使用</Select.Option>
              <Select.Option value="maintenance">维护中</Select.Option>
              <Select.Option value="broken">故障</Select.Option>
              <Select.Option value="retired">已报废</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="lastMaintenanceDate" label="最后维护日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="nextMaintenanceDate" label="下次维护日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea placeholder="请输入设备描述" rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
