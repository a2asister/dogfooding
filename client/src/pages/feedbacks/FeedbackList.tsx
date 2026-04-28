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
  Rate
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  EyeOutlined, 
  EditOutlined,
  MessageOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { feedbackApi } from '../../services/api';
import type { Feedback, FeedbackType, FeedbackStatus } from '../../types';

const { Option } = Select;
const { TextArea } = Input;

const FeedbackList: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Feedback[]>([]);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10
  });
  const [searchParams, setSearchParams] = useState({
    keyword: '',
    status: undefined as FeedbackStatus | undefined,
    type: undefined as FeedbackType | undefined
  });
  const [selectedItem, setSelectedItem] = useState<Feedback | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [respondModalVisible, setRespondModalVisible] = useState(false);
  const [respondForm] = Form.useForm();
  const [form] = Form.useForm();

  const typeMap: Record<FeedbackType, { label: string; color: string }> = {
    complaint: { label: '投诉', color: 'red' },
    suggestion: { label: '建议', color: 'blue' },
    consult: { label: '咨询', color: 'cyan' },
    praise: { label: '表扬', color: 'green' },
    other: { label: '其他', color: 'default' }
  };

  const statusMap: Record<FeedbackStatus, { label: string; color: string }> = {
    pending: { label: '待处理', color: 'default' },
    processing: { label: '处理中', color: 'processing' },
    resolved: { label: '已解决', color: 'success' },
    closed: { label: '已关闭', color: 'default' }
  };

  useEffect(() => {
    loadFeedbacks();
  }, [pagination.current, pagination.pageSize, searchParams]);

  const loadFeedbacks = async () => {
    setLoading(true);
    try {
      const result = await feedbackApi.getList({
        page: pagination.current,
        pageSize: pagination.pageSize,
        ...searchParams
      });
      
      if (result.success && result.data) {
        setData(result.data.list);
        setTotal(result.data.total);
      }
    } catch (error) {
      console.error('加载客户反馈列表失败:', error);
      message.error('加载客户反馈列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (record: Feedback) => {
    setSelectedItem(record);
    setDetailModalVisible(true);
  };

  const handleEdit = (record: Feedback) => {
    setFormMode('edit');
    setSelectedItem(record);
    form.setFieldsValue({
      ...record
    });
    setFormModalVisible(true);
  };

  const handleCreate = () => {
    setFormMode('create');
    setSelectedItem(null);
    form.resetFields();
    form.setFieldsValue({
      type: 'consult' as FeedbackType,
      status: 'pending' as FeedbackStatus
    });
    setFormModalVisible(true);
  };

  const handleRespond = (record: Feedback) => {
    setSelectedItem(record);
    respondForm.resetFields();
    if (record.responseContent) {
      respondForm.setFieldsValue({
        responseContent: record.responseContent,
        satisfaction: record.satisfaction
      });
    }
    setRespondModalVisible(true);
  };

  const handleClose = (record: Feedback) => {
    Modal.confirm({
      title: '关闭反馈',
      content: '确定要关闭这条反馈吗？',
      onOk: async () => {
        try {
          const result = await feedbackApi.close(record.id);
          if (result.success) {
            message.success('已关闭反馈');
            loadFeedbacks();
          } else {
            message.error(result.message || '操作失败');
          }
        } catch (error) {
          console.error('操作失败:', error);
          message.error('操作失败');
        }
      }
    });
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }));
    loadFeedbacks();
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
        const result = await feedbackApi.create(values);
        if (result.success) {
          message.success('创建成功');
          setFormModalVisible(false);
          loadFeedbacks();
        } else {
          message.error(result.message || '创建失败');
        }
      } else if (selectedItem) {
        const result = await feedbackApi.assign(selectedItem.id, values.assignedTo);
        if (result.success) {
          message.success('更新成功');
          setFormModalVisible(false);
          loadFeedbacks();
        } else {
          message.error(result.message || '更新失败');
        }
      }
    } catch (error) {
      console.error('表单提交失败:', error);
    }
  };

  const handleRespondSubmit = async () => {
    try {
      const values = await respondForm.validateFields();
      if (selectedItem) {
        const result = await feedbackApi.respond(selectedItem.id, {
          responseContent: values.responseContent,
          satisfaction: values.satisfaction
        });
        if (result.success) {
          message.success('回复成功');
          setRespondModalVisible(false);
          loadFeedbacks();
        } else {
          message.error(result.message || '操作失败');
        }
      }
    } catch (error) {
      console.error('操作失败:', error);
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
      title: '客户姓名',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 100
    },
    {
      title: '联系电话',
      dataIndex: 'customerPhone',
      key: 'customerPhone',
      width: 120
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (type: FeedbackType) => {
        const typeInfo = typeMap[type] || typeMap.other;
        return <Tag color={typeInfo.color}>{typeInfo.label}</Tag>;
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (status: FeedbackStatus) => {
        const statusInfo = statusMap[status] || statusMap.pending;
        return <Tag color={statusInfo.color}>{statusInfo.label}</Tag>;
      }
    },
    {
      title: '主题',
      dataIndex: 'subject',
      key: 'subject',
      width: 150,
      ellipsis: true
    },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      width: 200,
      ellipsis: true
    },
    {
      title: '满意度',
      dataIndex: 'satisfaction',
      key: 'satisfaction',
      width: 100,
      render: (value: number) => value ? <Rate disabled value={value} /> : '-'
    },
    {
      title: '提交时间',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      width: 160,
      render: (time: string) => time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '-'
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      fixed: 'right' as const,
      render: (_: any, record: Feedback) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            查看
          </Button>
          {record.status === 'pending' && (
            <Button
              type="link"
              icon={<MessageOutlined />}
              onClick={() => handleRespond(record)}
            >
              回复
            </Button>
          )}
          {record.status === 'resolved' && (
            <Button
              type="link"
              icon={<CheckCircleOutlined />}
              onClick={() => handleClose(record)}
            >
              关闭
            </Button>
          )}
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
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
        <h2>客户反馈</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          新增反馈
        </Button>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Space wrap size="middle">
          <Input
            placeholder="搜索客户姓名/电话/主题/内容"
            prefix={<SearchOutlined />}
            style={{ width: 250 }}
            value={searchParams.keyword}
            onChange={(e) => setSearchParams(prev => ({ ...prev, keyword: e.target.value }))}
            onPressEnter={handleSearch}
          />
          <Select
            placeholder="类型"
            style={{ width: 100 }}
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
        title="反馈详情"
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
              <Descriptions.Item label="订单ID">{selectedItem.orderId || '-'}</Descriptions.Item>
              <Descriptions.Item label="运单ID">{selectedItem.waybillId || '-'}</Descriptions.Item>
              <Descriptions.Item label="提交时间">
                {selectedItem.submittedAt ? dayjs(selectedItem.submittedAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="类型">
                <Tag color={typeMap[selectedItem.type]?.color}>
                  {typeMap[selectedItem.type]?.label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={statusMap[selectedItem.status]?.color}>
                  {statusMap[selectedItem.status]?.label}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions title="客户信息" bordered column={2}>
              <Descriptions.Item label="姓名">{selectedItem.customerName}</Descriptions.Item>
              <Descriptions.Item label="电话">{selectedItem.customerPhone}</Descriptions.Item>
              <Descriptions.Item label="邮箱">{selectedItem.customerEmail || '-'}</Descriptions.Item>
              <Descriptions.Item label="满意度">
                {selectedItem.satisfaction ? <Rate disabled value={selectedItem.satisfaction} /> : '-'}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions title="反馈内容" bordered column={1}>
              <Descriptions.Item label="主题">{selectedItem.subject}</Descriptions.Item>
              <Descriptions.Item label="内容">
                <div style={{ whiteSpace: 'pre-wrap' }}>{selectedItem.content}</div>
              </Descriptions.Item>
              <Descriptions.Item label="附件">
                {selectedItem.attachmentUrls || '-'}
              </Descriptions.Item>
            </Descriptions>

            {selectedItem.responseContent && (
              <>
                <Divider />
                <Descriptions title="回复信息" bordered column={1}>
                  <Descriptions.Item label="回复内容">
                    <div style={{ whiteSpace: 'pre-wrap' }}>{selectedItem.responseContent}</div>
                  </Descriptions.Item>
                  <Descriptions.Item label="回复时间">
                    {selectedItem.responseAt ? dayjs(selectedItem.responseAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
                  </Descriptions.Item>
                </Descriptions>
              </>
            )}
          </div>
        )}
      </Modal>

      <Modal
        title={formMode === 'create' ? '新增反馈' : '编辑反馈'}
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
            name="customerName"
            label="客户姓名"
            rules={[{ required: true, message: '请输入客户姓名' }]}
          >
            <Input placeholder="请输入客户姓名" />
          </Form.Item>

          <Form.Item
            name="customerPhone"
            label="联系电话"
            rules={[{ required: true, message: '请输入联系电话' }]}
          >
            <Input placeholder="请输入联系电话" />
          </Form.Item>

          <Form.Item
            name="customerEmail"
            label="邮箱"
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>

          <Form.Item
            name="type"
            label="反馈类型"
            rules={[{ required: true, message: '请选择反馈类型' }]}
          >
            <Select placeholder="请选择反馈类型">
              {Object.entries(typeMap).map(([key, value]) => (
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
            name="subject"
            label="主题"
            rules={[{ required: true, message: '请输入主题' }]}
          >
            <Input placeholder="请输入主题" />
          </Form.Item>

          <Form.Item
            name="content"
            label="内容"
            rules={[{ required: true, message: '请输入内容' }]}
          >
            <TextArea rows={4} placeholder="请输入内容" />
          </Form.Item>

          <Form.Item
            name="orderId"
            label="关联订单ID"
          >
            <InputNumber placeholder="请输入关联订单ID" style={{ width: '100%' }} min={1} />
          </Form.Item>

          <Form.Item
            name="waybillId"
            label="关联运单ID"
          >
            <InputNumber placeholder="请输入关联运单ID" style={{ width: '100%' }} min={1} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="回复反馈"
        open={respondModalVisible}
        onCancel={() => setRespondModalVisible(false)}
        width={600}
        onOk={handleRespondSubmit}
        okText="提交回复"
        cancelText="取消"
      >
        <Form
          form={respondForm}
          layout="vertical"
          style={{ marginTop: 24 }}
        >
          <Form.Item
            name="responseContent"
            label="回复内容"
            rules={[{ required: true, message: '请输入回复内容' }]}
          >
            <TextArea rows={5} placeholder="请输入回复内容" />
          </Form.Item>

          <Form.Item
            name="satisfaction"
            label="满意度评分"
          >
            <Rate />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FeedbackList;
