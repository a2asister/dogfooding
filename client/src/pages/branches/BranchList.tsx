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
  DeleteOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { branchApi } from '../../services/api';
import type { Branch, BranchStatus, BranchType, PaginatedResponse } from '../../types';

const { Option } = Select;
const { TextArea } = Input;

const BranchList: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Branch[]>([]);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10
  });
  const [searchParams, setSearchParams] = useState({
    keyword: '',
    status: undefined as BranchStatus | undefined,
    type: undefined as BranchType | undefined
  });
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [form] = Form.useForm();

  const statusMap: Record<BranchStatus, { label: string; color: string }> = {
    active: { label: '正常', color: 'success' },
    inactive: { label: '停用', color: 'default' },
    maintenance: { label: '维护中', color: 'warning' }
  };

  const typeMap: Record<BranchType, { label: string; color: string }> = {
    hub: { label: '转运中心', color: 'blue' },
    station: { label: '网点', color: 'green' },
    agency: { label: '代办点', color: 'orange' }
  };

  useEffect(() => {
    loadBranches();
  }, [pagination.current, pagination.pageSize, searchParams]);

  const loadBranches = async () => {
    setLoading(true);
    try {
      const result = await branchApi.getList({
        page: pagination.current,
        pageSize: pagination.pageSize,
        ...searchParams
      });
      
      if (result.success && result.data) {
        setData(result.data.list);
        setTotal(result.data.total);
      }
    } catch (error) {
      console.error('加载网点列表失败:', error);
      message.error('加载网点列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (record: Branch) => {
    setSelectedBranch(record);
    setDetailModalVisible(true);
  };

  const handleEdit = (record: Branch) => {
    setFormMode('edit');
    setSelectedBranch(record);
    form.setFieldsValue({
      ...record
    });
    setFormModalVisible(true);
  };

  const handleCreate = () => {
    setFormMode('create');
    setSelectedBranch(null);
    form.resetFields();
    setFormModalVisible(true);
  };

  const handleDelete = async (record: Branch) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除网点「${record.name}」吗？`,
      onOk: async () => {
        try {
          const result = await branchApi.delete(record.id);
          if (result.success) {
            message.success('删除成功');
            loadBranches();
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
    loadBranches();
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
        const result = await branchApi.create(values);
        if (result.success) {
          message.success('创建成功');
          setFormModalVisible(false);
          loadBranches();
        } else {
          message.error(result.message || '创建失败');
        }
      } else if (selectedBranch) {
        const result = await branchApi.update(selectedBranch.id, values);
        if (result.success) {
          message.success('更新成功');
          setFormModalVisible(false);
          loadBranches();
        } else {
          message.error(result.message || '更新失败');
        }
      }
    } catch (error) {
      console.error('表单提交失败:', error);
    }
  };

  const handleStatusChange = async (record: Branch, status: BranchStatus) => {
    try {
      const result = await branchApi.updateStatus(record.id, status);
      if (result.success) {
        message.success('状态更新成功');
        loadBranches();
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
      title: '网点编号',
      dataIndex: 'code',
      key: 'code',
      width: 120
    },
    {
      title: '网点名称',
      dataIndex: 'name',
      key: 'name',
      width: 150
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: BranchType) => {
        const typeInfo = typeMap[type] || typeMap.station;
        return <Tag color={typeInfo.color}>{typeInfo.label}</Tag>;
      }
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
      width: 200,
      render: (_: any, record: Branch) => (
        <span>
          {record.province} {record.city} {record.district} {record.address}
        </span>
      )
    },
    {
      title: '联系人',
      dataIndex: 'contactPerson',
      key: 'contactPerson',
      width: 100
    },
    {
      title: '联系电话',
      dataIndex: 'contactPhone',
      key: 'contactPhone',
      width: 120
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: BranchStatus) => {
        const statusInfo = statusMap[status] || statusMap.inactive;
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
      render: (_: any, record: Branch) => (
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
        <h2>网点管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          新增网点
        </Button>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Space wrap size="middle">
          <Input
            placeholder="搜索编号/名称/地址/电话"
            prefix={<SearchOutlined />}
            style={{ width: 250 }}
            value={searchParams.keyword}
            onChange={(e) => setSearchParams(prev => ({ ...prev, keyword: e.target.value }))}
            onPressEnter={handleSearch}
          />
          <Select
            placeholder="网点类型"
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
          scroll={{ x: 1400 }}
        />
      </Card>

      <Modal
        title="网点详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={700}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
      >
        {selectedBranch && (
          <div>
            <Descriptions title="基本信息" bordered column={2}>
              <Descriptions.Item label="网点编号">{selectedBranch.code}</Descriptions.Item>
              <Descriptions.Item label="网点名称">{selectedBranch.name}</Descriptions.Item>
              <Descriptions.Item label="类型">
                <Tag color={typeMap[selectedBranch.type]?.color}>
                  {typeMap[selectedBranch.type]?.label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={statusMap[selectedBranch.status]?.color}>
                  {statusMap[selectedBranch.status]?.label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="联系人">{selectedBranch.contactPerson}</Descriptions.Item>
              <Descriptions.Item label="联系电话">{selectedBranch.contactPhone}</Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions title="地址信息" bordered column={1}>
              <Descriptions.Item label="详细地址">
                {selectedBranch.province} {selectedBranch.city} {selectedBranch.district} {selectedBranch.address}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions title="其他信息" bordered column={2}>
              <Descriptions.Item label="描述">{selectedBranch.description || '-'}</Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {selectedBranch.createdAt ? dayjs(selectedBranch.createdAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>

      <Modal
        title={formMode === 'create' ? '新增网点' : '编辑网点'}
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
            name="name"
            label="网点名称"
            rules={[{ required: true, message: '请输入网点名称' }]}
          >
            <Input placeholder="请输入网点名称" />
          </Form.Item>

          <Form.Item
            name="type"
            label="网点类型"
            rules={[{ required: true, message: '请选择网点类型' }]}
          >
            <Select placeholder="请选择网点类型">
              {Object.entries(typeMap).map(([key, value]) => (
                <Option key={key} value={key}>{value.label}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="province"
            label="省份"
            rules={[{ required: true, message: '请输入省份' }]}
          >
            <Input placeholder="请输入省份" />
          </Form.Item>

          <Form.Item
            name="city"
            label="城市"
            rules={[{ required: true, message: '请输入城市' }]}
          >
            <Input placeholder="请输入城市" />
          </Form.Item>

          <Form.Item
            name="district"
            label="区县"
            rules={[{ required: true, message: '请输入区县' }]}
          >
            <Input placeholder="请输入区县" />
          </Form.Item>

          <Form.Item
            name="address"
            label="详细地址"
            rules={[{ required: true, message: '请输入详细地址' }]}
          >
            <Input placeholder="请输入详细地址" />
          </Form.Item>

          <Form.Item
            name="contactPerson"
            label="联系人"
            rules={[{ required: true, message: '请输入联系人' }]}
          >
            <Input placeholder="请输入联系人" />
          </Form.Item>

          <Form.Item
            name="contactPhone"
            label="联系电话"
            rules={[{ required: true, message: '请输入联系电话' }]}
          >
            <Input placeholder="请输入联系电话" />
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

export default BranchList;
