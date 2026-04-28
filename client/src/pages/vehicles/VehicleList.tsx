import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Card, 
  Space, 
  Input, 
  Select, 
  Tag, 
  Modal, 
  message,
  Descriptions,
  Divider,
  Form,
  InputNumber
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  EyeOutlined, 
  EditOutlined, 
  DeleteOutlined,
  UserOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { vehicleApi } from '../../services/api';
import type { Vehicle, VehicleStatus, VehicleType } from '../../types';

const { Option } = Select;
const { TextArea } = Input;

const VehicleList: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Vehicle[]>([]);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10
  });
  const [searchParams, setSearchParams] = useState({
    keyword: '',
    status: undefined as VehicleStatus | undefined,
    type: undefined as VehicleType | undefined
  });
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [form] = Form.useForm();

  const statusMap: Record<VehicleStatus, { label: string; color: string }> = {
    available: { label: '空闲', color: 'success' },
    in_use: { label: '使用中', color: 'processing' },
    maintenance: { label: '维护中', color: 'warning' },
    out_of_service: { label: '停用', color: 'default' }
  };

  const typeMap: Record<VehicleType, { label: string; color: string }> = {
    van: { label: '厢式货车', color: 'blue' },
    truck: { label: '卡车', color: 'green' },
    motorcycle: { label: '摩托车', color: 'orange' },
    other: { label: '其他', color: 'default' }
  };

  useEffect(() => {
    loadVehicles();
  }, [pagination.current, pagination.pageSize, searchParams]);

  const loadVehicles = async () => {
    setLoading(true);
    try {
      const result = await vehicleApi.getList({
        page: pagination.current,
        pageSize: pagination.pageSize,
        ...searchParams
      });
      
      if (result.success && result.data) {
        setData(result.data.list);
        setTotal(result.data.total);
      }
    } catch (error) {
      console.error('加载车辆列表失败:', error);
      message.error('加载车辆列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (record: Vehicle) => {
    setSelectedVehicle(record);
    setDetailModalVisible(true);
  };

  const handleEdit = (record: Vehicle) => {
    setFormMode('edit');
    setSelectedVehicle(record);
    form.setFieldsValue({
      ...record
    });
    setFormModalVisible(true);
  };

  const handleCreate = () => {
    setFormMode('create');
    setSelectedVehicle(null);
    form.resetFields();
    setFormModalVisible(true);
  };

  const handleDelete = async (record: Vehicle) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除车辆「${record.plateNumber}」吗？`,
      onOk: async () => {
        try {
          const result = await vehicleApi.delete(record.id);
          if (result.success) {
            message.success('删除成功');
            loadVehicles();
          } else {
            message.error(result.message || '删除失败');
          }
        } catch (error) {
          console.error('删除失败:', error);
          message.error('删除失败');
        }
      }
    });
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }));
    loadVehicles();
  };

  const handleReset = () => {
    setSearchParams({
      keyword: '',
      status: undefined,
      type: undefined
    });
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleFormSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (formMode === 'create') {
        const result = await vehicleApi.create(values);
        if (result.success) {
          message.success('创建成功');
          setFormModalVisible(false);
          loadVehicles();
        } else {
          message.error(result.message || '创建失败');
        }
      } else if (selectedVehicle) {
        const result = await vehicleApi.update(selectedVehicle.id, values);
        if (result.success) {
          message.success('更新成功');
          setFormModalVisible(false);
          loadVehicles();
        } else {
          message.error(result.message || '更新失败');
        }
      }
    } catch (error) {
      console.error('表单提交失败:', error);
    }
  };

  const handleStatusChange = async (record: Vehicle, status: VehicleStatus) => {
    try {
      const result = await vehicleApi.updateStatus(record.id, status);
      if (result.success) {
        message.success('状态更新成功');
        loadVehicles();
      } else {
        message.error(result.message || '状态更新失败');
      }
    } catch (error) {
      console.error('状态更新失败:', error);
      message.error('状态更新失败');
    }
  };

  const columns = [
    {
      title: '车牌号',
      dataIndex: 'plateNumber',
      key: 'plateNumber',
      width: 120
    },
    {
      title: '车辆类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: VehicleType) => {
        const typeInfo = typeMap[type] || typeMap.other;
        return <Tag color={typeInfo.color}>{typeInfo.label}</Tag>;
      }
    },
    {
      title: '品牌',
      dataIndex: 'brand',
      key: 'brand',
      width: 100
    },
    {
      title: '型号',
      dataIndex: 'model',
      key: 'model',
      width: 120
    },
    {
      title: '载重容量',
      dataIndex: 'capacity',
      key: 'capacity',
      width: 100,
      render: (capacity: number) => `${capacity} 吨`
    },
    {
      title: '当前载重',
      dataIndex: 'currentLoad',
      key: 'currentLoad',
      width: 100,
      render: (currentLoad: number) => `${currentLoad || 0} 吨`
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: VehicleStatus) => {
        const statusInfo = statusMap[status] || statusMap.out_of_service;
        return <Tag color={statusInfo.color}>{statusInfo.label}</Tag>;
      }
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (time: string) => time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '-'
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right' as const,
      render: (_: any, record: Vehicle) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            查看
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Select
            placeholder="状态"
            style={{ width: 80 }}
            value={record.status}
            onChange={(value) => handleStatusChange(record, value)}
          >
            {Object.entries(statusMap).map(([key, value]) => (
              <Option key={key} value={key}>{value.label}</Option>
            ))}
          </Select>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      )
    }
  ];

  const tablePagination = {
    ...pagination,
    total,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total: number) => `共 ${total} 条记录`,
    onChange: (page: number, pageSize: number) => {
      setPagination({ current: page, pageSize });
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>车辆管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          新增车辆
        </Button>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Space wrap size="middle">
          <Input
            placeholder="搜索车牌号/品牌/型号"
            prefix={<SearchOutlined />}
            style={{ width: 250 }}
            value={searchParams.keyword}
            onChange={(e) => setSearchParams(prev => ({ ...prev, keyword: e.target.value }))}
            onPressEnter={handleSearch}
          />
          <Select
            placeholder="车辆类型"
            style={{ width: 120 }}
            allowClear
            value={searchParams.type}
            onChange={(value) => setSearchParams(prev => ({ ...prev, type: value }))}
          >
            {Object.entries(typeMap).map(([key, value]) => (
              <Option key={key} value={key}>{value.label}</Option>
            ))}
          </Select>
          <Select
            placeholder="状态"
            style={{ width: 120 }}
            allowClear
            value={searchParams.status}
            onChange={(value) => setSearchParams(prev => ({ ...prev, status: value }))}
          >
            {Object.entries(statusMap).map(([key, value]) => (
              <Option key={key} value={key}>{value.label}</Option>
            ))}
          </Select>
          <Button type="primary" onClick={handleSearch}>
            搜索
          </Button>
          <Button onClick={handleReset}>
            重置
          </Button>
        </Space>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={tablePagination}
          scroll={{ x: 1300 }}
        />
      </Card>

      <Modal
        title="车辆详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={700}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
      >
        {selectedVehicle && (
          <div>
            <Descriptions title="基本信息" bordered column={2}>
              <Descriptions.Item label="车牌号">{selectedVehicle.plateNumber}</Descriptions.Item>
              <Descriptions.Item label="车辆类型">
                <Tag color={typeMap[selectedVehicle.type]?.color}>
                  {typeMap[selectedVehicle.type]?.label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="品牌">{selectedVehicle.brand}</Descriptions.Item>
              <Descriptions.Item label="型号">{selectedVehicle.model}</Descriptions.Item>
              <Descriptions.Item label="载重容量">{selectedVehicle.capacity} 吨</Descriptions.Item>
              <Descriptions.Item label="当前载重">{selectedVehicle.currentLoad || 0} 吨</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={statusMap[selectedVehicle.status]?.color}>
                  {statusMap[selectedVehicle.status]?.label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {selectedVehicle.createdAt ? dayjs(selectedVehicle.createdAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions title="其他信息" bordered column={2}>
              <Descriptions.Item label="购买日期">
                {selectedVehicle.purchaseDate ? dayjs(selectedVehicle.purchaseDate).format('YYYY-MM-DD') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="上次维护日期">
                {selectedVehicle.lastMaintenanceDate ? dayjs(selectedVehicle.lastMaintenanceDate).format('YYYY-MM-DD') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="描述" span={2}>
                {selectedVehicle.description || '-'}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>

      <Modal
        title={formMode === 'create' ? '新增车辆' : '编辑车辆'}
        open={formModalVisible}
        onCancel={() => setFormModalVisible(false)}
        width={600}
        onOk={handleFormSubmit}
        okText="确定"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: 24 }}
        >
          <Form.Item
            name="plateNumber"
            label="车牌号"
            rules={[{ required: true, message: '请输入车牌号' }]}
          >
            <Input placeholder="请输入车牌号" />
          </Form.Item>

          <Form.Item
            name="type"
            label="车辆类型"
            rules={[{ required: true, message: '请选择车辆类型' }]}
          >
            <Select placeholder="请选择车辆类型">
              {Object.entries(typeMap).map(([key, value]) => (
                <Option key={key} value={key}>{value.label}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="brand"
            label="品牌"
            rules={[{ required: true, message: '请输入品牌' }]}
          >
            <Input placeholder="请输入品牌" />
          </Form.Item>

          <Form.Item
            name="model"
            label="型号"
            rules={[{ required: true, message: '请输入型号' }]}
          >
            <Input placeholder="请输入型号" />
          </Form.Item>

          <Form.Item
            name="capacity"
            label="载重容量（吨）"
            rules={[{ required: true, message: '请输入载重容量' }]}
          >
            <InputNumber
              placeholder="请输入载重容量"
              style={{ width: '100%' }}
              min={0}
              step={0.1}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
          >
            <TextArea rows={3} placeholder="请输入描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default VehicleList;
