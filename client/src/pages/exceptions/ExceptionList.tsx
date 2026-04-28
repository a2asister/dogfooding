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
  InputNumber,
  DatePicker
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  EyeOutlined, 
  EditOutlined, 
  DeleteOutlined,
  WarningOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { exceptionApi } from '../../services/api';
import type { ExceptionItem, ExceptionType, ExceptionStatus, ExceptionPriority } from '../../types';

const { Option } = Select;
const { TextArea } = Input;

const ExceptionList: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ExceptionItem[]>([]);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10
  });
  const [searchParams, setSearchParams] = useState({
    keyword: '',
    status: undefined as ExceptionStatus | undefined,
    type: undefined as ExceptionType | undefined,
    priority: undefined as ExceptionPriority | undefined
  });
  const [selectedItem, setSelectedItem] = useState<ExceptionItem | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [statusFormVisible, setStatusFormVisible] = useState(false);
  const [statusForm] = Form.useForm();
  const [form] = Form.useForm();

  const typeMap: Record<ExceptionType, { label: string; color: string }> = {
    lost: { label: '丢失', color: 'red' },
    damaged: { label: '破损', color: 'orange' },
    delayed: { label: '延误', color: 'gold' },
    returned: { label: '退回', color: 'blue' },
    rejected: { label: '拒收', color: 'purple' },
    address_error: { label: '地址错误', color: 'cyan' },
    contact_failed: { label: '联系失败', color: 'magenta' },
    package_abnormal: { label: '包裹异常', color: 'geekblue' },
    other: { label: '其他', color: 'default' }
  };

  const statusMap: Record<ExceptionStatus, { label: string; color: string }> = {
    pending: { label: '待处理', color: 'default' },
    processing: { label: '处理中', color: 'processing' },
    resolved: { label: '已解决', color: 'success' },
    escalated: { label: '已升级', color: 'warning' },
    closed: { label: '已关闭', color: 'default' }
  };

  const priorityMap: Record<ExceptionPriority, { label: string; color: string }> = {
    low: { label: '低', color: 'default' },
    medium: { label: '中', color: 'blue' },
    high: { label: '高', color: 'orange' },
    critical: { label: '紧急', color: 'red' }
  };

  useEffect(() => {
    loadExceptions();
  }, [pagination.current, pagination.pageSize, searchParams]);

  const loadExceptions = async () => {
    setLoading(true);
    try {
      const result = await exceptionApi.getList({
        page: pagination.current,
        pageSize: pagination.pageSize,
        ...searchParams
      });
      
      if (result.success && result.data) {
        setData(result.data.list);
        setTotal(result.data.total);
      }
    } catch (error) {
      console.error('加载异常件列表失败:', error);
      message.error('加载异常件列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (record: ExceptionItem) => {
    setSelectedItem(record);
    setDetailModalVisible(true);
  };

  const handleEdit = (record: ExceptionItem) => {
    setFormMode('edit');
    setSelectedItem(record);
    form.setFieldsValue({
      ...record,
      detectedAt: record.detectedAt ? dayjs(record.detectedAt) : undefined
    });
    setFormModalVisible(true);
  };

  const handleCreate = () => {
    setFormMode('create');
    setSelectedItem(null);
    form.resetFields();
    form.setFieldsValue({
      priority: 'medium' as ExceptionPriority,
      status: 'pending' as ExceptionStatus
    });
    setFormModalVisible(true);
  };

  const handleDelete = async (record: ExceptionItem) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除该异常记录吗？`,
      onOk: async () => {
        try {
          const result = await exceptionApi.update(record.id, { status: 'closed' as ExceptionStatus });
          if (result.success) {
            message.success('删除成功');
            loadExceptions();
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
    loadExceptions();
  };

  const handleReset = () => {
    setSearchParams({
      keyword: '',
      status: undefined,
      type: undefined,
      priority: undefined
    });
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleFormSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (values.detectedAt) {
        values.detectedAt = values.detectedAt.toISOString();
      }
      
      if (formMode === 'create') {
        const result = await exceptionApi.create(values);
        if (result.success) {
          message.success('创建成功');
          setFormModalVisible(false);
          loadExceptions();
        } else {
          message.error(result.message || '创建失败');
        }
      } else if (selectedItem) {
        const result = await exceptionApi.update(selectedItem.id, values);
        if (result.success) {
          message.success('更新成功');
          setFormModalVisible(false);
          loadExceptions();
        } else {
          message.error(result.message || '更新失败');
        }
      }
    } catch (error) {
      console.error('表单提交失败:', error);
    }
  };

  const handleStatusChange = (record: ExceptionItem, status: ExceptionStatus) => {
    setSelectedItem(record);
    statusForm.resetFields();
    statusForm.setFieldsValue({ status });
    setStatusFormVisible(true);
  };

  const handleStatusSubmit = async () => {
    try {
      const values = await statusForm.validateFields();
      if (selectedItem) {
        const result = await exceptionApi.updateStatus(selectedItem.id, {
          status: values.status,
          resolutionSteps: values.resolutionSteps,
          resolutionCost: values.resolutionCost
        });
        if (result.success) {
          message.success('状态更新成功');
          setStatusFormVisible(false);
          loadExceptions();
        } else {
          message.error(result.message || '状态更新失败');
        }
      }
    } catch (error) {
      console.error('状态更新失败:', error);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60
    },
    {
      title: '运单ID',
      dataIndex: 'waybillId',
      key: 'waybillId',
      width: 80
    },
    {
      title: '异常类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: ExceptionType) => {
        const typeInfo = typeMap[type] || typeMap.other;
        return <Tag color={typeInfo.color}>{typeInfo.label}</Tag>;
      }
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      render: (priority: ExceptionPriority) => {
        const priorityInfo = priorityMap[priority] || priorityMap.medium;
        return <Tag color={priorityInfo.color}>{priorityInfo.label}</Tag>;
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (status: ExceptionStatus) => {
        const statusInfo = statusMap[status] || statusMap.pending;
        return <Tag color={statusInfo.color}>{statusInfo.label}</Tag>;
      }
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      width: 200,
      ellipsis: true
    },
    {
      title: '预估损失',
      dataIndex: 'estimatedLoss',
      key: 'estimatedLoss',
      width: 100,
      render: (value: number) => value ? `¥${value}` : '-'
    },
    {
      title: '责任人',
      dataIndex: 'responsiblePersonName',
      key: 'responsiblePersonName',
      width: 100,
      render: (value: string) => value || '-'
    },
    {
      title: '发现时间',
      dataIndex: 'detectedAt',
      key: 'detectedAt',
      width: 160,
      render: (time: string) => time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '-'
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      fixed: 'right' as const,
      render: (_: any, record: ExceptionItem) => (
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
        <h2>异常件管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          新增异常
        </Button>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Space wrap size="middle">
          <Input
            placeholder="搜索描述/责任人"
            prefix={<SearchOutlined />}
            style={{ width: 200 }}
            value={searchParams.keyword}
            onChange={(e) => setSearchParams(prev => ({ ...prev, keyword: e.target.value }))}
            onPressEnter={handleSearch}
          />
          <Select
            placeholder="异常类型"
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
            placeholder="优先级"
            style={{ width: 100 }}
            allowClear
            value={searchParams.priority}
            onChange={(value) => setSearchParams(prev => ({ ...prev, priority: value }))}
          >
            {Object.entries(priorityMap).map(([key, value]) => (
              <Option key={key} value={key}>{value.label}</Option>
            ))}
          </Select>
          <Select
            placeholder="状态"
            style={{ width: 100 }}
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
        title="异常详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={700}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
      >
        {selectedItem && (
          <div>
            <Descriptions title="基本信息" bordered column={2}>
              <Descriptions.Item label="ID">{selectedItem.id}</Descriptions.Item>
              <Descriptions.Item label="运单ID">{selectedItem.waybillId}</Descriptions.Item>
              <Descriptions.Item label="异常类型">
                <Tag color={typeMap[selectedItem.type]?.color}>
                  {typeMap[selectedItem.type]?.label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="优先级">
                <Tag color={priorityMap[selectedItem.priority]?.color}>
                  {priorityMap[selectedItem.priority]?.label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={statusMap[selectedItem.status]?.color}>
                  {statusMap[selectedItem.status]?.label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="发现时间">
                {selectedItem.detectedAt ? dayjs(selectedItem.detectedAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions title="详细信息" bordered column={2}>
              <Descriptions.Item label="描述" span={2}>
                {selectedItem.description || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="破损描述" span={2}>
                {selectedItem.damageDescription || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="预估损失">
                {selectedItem.estimatedLoss ? `¥${selectedItem.estimatedLoss}` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="处理成本">
                {selectedItem.resolutionCost ? `¥${selectedItem.resolutionCost}` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="责任人">
                {selectedItem.responsiblePersonName || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="位置">
                {selectedItem.location || '-'}
              </Descriptions.Item>
            </Descriptions>

            {selectedItem.resolutionSteps && (
              <>
                <Divider />
                <Descriptions title="处理信息" bordered column={1}>
                  <Descriptions.Item label="处理步骤">
                    {selectedItem.resolutionSteps}
                  </Descriptions.Item>
                  <Descriptions.Item label="解决时间">
                    {selectedItem.resolvedAt ? dayjs(selectedItem.resolvedAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
                  </Descriptions.Item>
                </Descriptions>
              </>
            )}
          </div>
        )}
      </Modal>

      <Modal
        title={formMode === 'create' ? '新增异常' : '编辑异常'}
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
            name="waybillId"
            label="运单ID"
            rules={[{ required: true, message: '请输入运单ID' }]}
          >
            <InputNumber placeholder="请输入运单ID" style={{ width: '100%' }} min={1} />
          </Form.Item>

          <Form.Item
            name="type"
            label="异常类型"
            rules={[{ required: true, message: '请选择异常类型' }]}
          >
            <Select placeholder="请选择异常类型">
              {Object.entries(typeMap).map(([key, value]) => (
                <Option key={key} value={key}>{value.label}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="priority"
            label="优先级"
            rules={[{ required: true, message: '请选择优先级' }]}
          >
            <Select placeholder="请选择优先级">
              {Object.entries(priorityMap).map(([key, value]) => (
                <Option key={key} value={key}>{value.label}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              {Object.entries(statusMap).map(([key, value]) => (
                <Option key={key} value={key}>{value.label}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="detectedAt"
            label="发现时间"
          >
            <DatePicker 
              showTime 
              style={{ width: '100%' }} 
              placeholder="请选择发现时间"
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="异常描述"
            rules={[{ required: true, message: '请输入异常描述' }]}
          >
            <TextArea rows={3} placeholder="请输入异常描述" />
          </Form.Item>

          <Form.Item
            name="damageDescription"
            label="破损描述"
          >
            <TextArea rows={2} placeholder="请输入破损描述" />
          </Form.Item>

          <Form.Item
            name="estimatedLoss"
            label="预估损失（元）"
          >
            <InputNumber placeholder="请输入预估损失" style={{ width: '100%' }} min={0} precision={2} />
          </Form.Item>

          <Form.Item
            name="location"
            label="发生位置"
          >
            <Input placeholder="请输入发生位置" />
          </Form.Item>

          <Form.Item
            name="responsiblePersonName"
            label="责任人姓名"
          >
            <Input placeholder="请输入责任人姓名" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="更新状态"
        open={statusFormVisible}
        onCancel={() => setStatusFormVisible(false)}
        width={500}
        onOk={handleStatusSubmit}
        okText="确定"
        cancelText="取消"
      >
        <Form
          form={statusForm}
          layout="vertical"
          style={{ marginTop: 24 }}
        >
          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              {Object.entries(statusMap).map(([key, value]) => (
                <Option key={key} value={key}>{value.label}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="resolutionSteps"
            label="处理步骤"
          >
            <TextArea rows={3} placeholder="请输入处理步骤" />
          </Form.Item>

          <Form.Item
            name="resolutionCost"
            label="处理成本（元）"
          >
            <InputNumber placeholder="请输入处理成本" style={{ width: '100%' }} min={0} precision={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ExceptionList;
