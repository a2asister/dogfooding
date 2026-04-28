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
  Tabs
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  EyeOutlined, 
  EditOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { returnApi } from '../../services/api';
import type { 
  Return, 
  ReturnType, 
  ReturnStatus, 
  Claim, 
  ClaimType, 
  ClaimStatus 
} from '../../types';

const { Option } = Select;
const { TextArea } = Input;

const ReturnList: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'returns' | 'claims'>('returns');
  const [returnLoading, setReturnLoading] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);
  const [returnData, setReturnData] = useState<Return[]>([]);
  const [claimData, setClaimData] = useState<Claim[]>([]);
  const [returnTotal, setReturnTotal] = useState(0);
  const [claimTotal, setClaimTotal] = useState(0);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10
  });
  const [returnSearchParams, setReturnSearchParams] = useState({
    keyword: '',
    status: undefined as ReturnStatus | undefined,
    type: undefined as ReturnType | undefined
  });
  const [claimSearchParams, setClaimSearchParams] = useState({
    keyword: '',
    status: undefined as ClaimStatus | undefined,
    type: undefined as ClaimType | undefined
  });
  const [selectedReturn, setSelectedReturn] = useState<Return | null>(null);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [form] = Form.useForm();
  const [approveForm] = Form.useForm();
  const [approveModalVisible, setApproveModalVisible] = useState(false);

  const returnTypeMap: Record<ReturnType, { label: string; color: string }> = {
    exchange: { label: '换货', color: 'blue' },
    refund: { label: '退款', color: 'green' },
    reject: { label: '拒收', color: 'orange' }
  };

  const returnStatusMap: Record<ReturnStatus, { label: string; color: string }> = {
    requested: { label: '已申请', color: 'default' },
    approved: { label: '已批准', color: 'processing' },
    received: { label: '已收货', color: 'blue' },
    inspected: { label: '已检验', color: 'cyan' },
    processed: { label: '已处理', color: 'geekblue' },
    completed: { label: '已完成', color: 'success' },
    rejected: { label: '已拒绝', color: 'error' },
    cancelled: { label: '已取消', color: 'default' }
  };

  const claimTypeMap: Record<ClaimType, { label: string; color: string }> = {
    damage: { label: '破损理赔', color: 'orange' },
    lost: { label: '丢失理赔', color: 'red' },
    delay: { label: '延误理赔', color: 'gold' },
    service: { label: '服务理赔', color: 'blue' },
    other: { label: '其他', color: 'default' }
  };

  const claimStatusMap: Record<ClaimStatus, { label: string; color: string }> = {
    pending: { label: '待处理', color: 'default' },
    reviewing: { label: '审核中', color: 'processing' },
    approved: { label: '已批准', color: 'success' },
    rejected: { label: '已拒绝', color: 'error' },
    paid: { label: '已赔付', color: 'green' },
    closed: { label: '已关闭', color: 'default' }
  };

  useEffect(() => {
    if (activeTab === 'returns') {
      loadReturns();
    } else {
      loadClaims();
    }
  }, [pagination.current, pagination.pageSize, activeTab, returnSearchParams, claimSearchParams]);

  const loadReturns = async () => {
    setReturnLoading(true);
    try {
      const result = await returnApi.getReturns({
        page: pagination.current,
        pageSize: pagination.pageSize,
        ...returnSearchParams
      });
      
      if (result.success && result.data) {
        setReturnData(result.data.list);
        setReturnTotal(result.data.total);
      }
    } catch (error) {
      console.error('加载退换货列表失败:', error);
      message.error('加载退换货列表失败');
    } finally {
      setReturnLoading(false);
    }
  };

  const loadClaims = async () => {
    setClaimLoading(true);
    try {
      const result = await returnApi.getClaims({
        page: pagination.current,
        pageSize: pagination.pageSize,
        ...claimSearchParams
      });
      
      if (result.success && result.data) {
        setClaimData(result.data.list);
        setClaimTotal(result.data.total);
      }
    } catch (error) {
      console.error('加载理赔列表失败:', error);
      message.error('加载理赔列表失败');
    } finally {
      setClaimLoading(false);
    }
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key as 'returns' | 'claims');
    setPagination({ current: 1, pageSize: 10 });
  };

  const handleViewReturn = (record: Return) => {
    setSelectedReturn(record);
    setSelectedClaim(null);
    setDetailModalVisible(true);
  };

  const handleViewClaim = (record: Claim) => {
    setSelectedClaim(record);
    setSelectedReturn(null);
    setDetailModalVisible(true);
  };

  const handleCreateReturn = () => {
    setFormMode('create');
    setSelectedReturn(null);
    form.resetFields();
    form.setFieldsValue({
      type: 'refund' as ReturnType,
      status: 'requested' as ReturnStatus
    });
    setFormModalVisible(true);
  };

  const handleCreateClaim = () => {
    setFormMode('create');
    setSelectedClaim(null);
    form.resetFields();
    form.setFieldsValue({
      type: 'damage' as ClaimType,
      status: 'pending' as ClaimStatus
    });
    setFormModalVisible(true);
  };

  const handleEditReturn = (record: Return) => {
    setFormMode('edit');
    setSelectedReturn(record);
    form.setFieldsValue({
      ...record
    });
    setFormModalVisible(true);
  };

  const handleEditClaim = (record: Claim) => {
    setFormMode('edit');
    setSelectedClaim(record);
    form.setFieldsValue({
      ...record
    });
    setFormModalVisible(true);
  };

  const handleApproveReturn = (record: Return) => {
    setSelectedReturn(record);
    approveForm.resetFields();
    setApproveModalVisible(true);
  };

  const handleRejectReturn = (record: Return) => {
    Modal.confirm({
      title: '拒绝退换货申请',
      content: '请输入拒绝原因',
      okText: '确认拒绝',
      okType: 'danger',
      onOk: async () => {
        try {
          const result = await returnApi.rejectReturn(record.id);
          if (result.success) {
            message.success('已拒绝申请');
            loadReturns();
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

  const handleApproveSubmit = async () => {
    try {
      const values = await approveForm.validateFields();
      if (selectedReturn) {
        const result = await returnApi.approveReturn(selectedReturn.id, {
          approvalComment: values.approvalComment,
          refundAmount: values.refundAmount
        });
        if (result.success) {
          message.success('审批成功');
          setApproveModalVisible(false);
          loadReturns();
        } else {
          message.error(result.message || '操作失败');
        }
      }
    } catch (error) {
      console.error('操作失败:', error);
    }
  };

  const handleReturnSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }));
    loadReturns();
  };

  const handleClaimSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }));
    loadClaims();
  };

  const handleReturnReset = () => {
    setReturnSearchParams({
      keyword: '',
      status: undefined,
      type: undefined
    });
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleClaimReset = () => {
    setClaimSearchParams({
      keyword: '',
      status: undefined,
      type: undefined
    });
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleFormSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (activeTab === 'returns') {
        if (formMode === 'create') {
          const result = await returnApi.createReturn(values);
          if (result.success) {
            message.success('创建成功');
            setFormModalVisible(false);
            loadReturns();
          } else {
            message.error(result.message || '创建失败');
          }
        } else if (selectedReturn) {
          const result = await returnApi.updateReturnStatus(selectedReturn.id, values.status);
          if (result.success) {
            message.success('更新成功');
            setFormModalVisible(false);
            loadReturns();
          } else {
            message.error(result.message || '更新失败');
          }
        }
      } else {
        if (formMode === 'create') {
          const result = await returnApi.createClaim(values);
          if (result.success) {
            message.success('创建成功');
            setFormModalVisible(false);
            loadClaims();
          } else {
            message.error(result.message || '创建失败');
          }
        } else if (selectedClaim) {
          const result = await returnApi.updateClaim(selectedClaim.id, values);
          if (result.success) {
            message.success('更新成功');
            setFormModalVisible(false);
            loadClaims();
          } else {
            message.error(result.message || '更新失败');
          }
        }
      }
    } catch (error) {
      console.error('表单提交失败:', error);
    }
  };

  const returnColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60
    },
    {
      title: '订单ID',
      dataIndex: 'orderId',
      key: 'orderId',
      width: 80
    },
    {
      title: '运单号',
      dataIndex: 'returnWaybillNo',
      key: 'returnWaybillNo',
      width: 120,
      render: (value: string) => value || '-'
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (type: ReturnType) => {
        const typeInfo = returnTypeMap[type] || returnTypeMap.refund;
        return <Tag color={typeInfo.color}>{typeInfo.label}</Tag>;
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (status: ReturnStatus) => {
        const statusInfo = returnStatusMap[status] || returnStatusMap.requested;
        return <Tag color={statusInfo.color}>{statusInfo.label}</Tag>;
      }
    },
    {
      title: '申请原因',
      dataIndex: 'requestReason',
      key: 'requestReason',
      width: 150,
      ellipsis: true
    },
    {
      title: '退款金额',
      dataIndex: 'refundAmount',
      key: 'refundAmount',
      width: 100,
      render: (value: number) => value ? `¥${value}` : '-'
    },
    {
      title: '申请时间',
      dataIndex: 'requestedAt',
      key: 'requestedAt',
      width: 160,
      render: (time: string) => time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '-'
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right' as const,
      render: (_: any, record: Return) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewReturn(record)}
          >
            查看
          </Button>
          {record.status === 'requested' && (
            <>
              <Button
                type="link"
                icon={<CheckCircleOutlined />}
                onClick={() => handleApproveReturn(record)}
              >
                批准
              </Button>
              <Button
                type="link"
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => handleRejectReturn(record)}
              >
                拒绝
              </Button>
            </>
          )}
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditReturn(record)}
          >
            编辑
          </Button>
        </Space>
      )
    }
  ];

  const claimColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60
    },
    {
      title: '索赔人',
      dataIndex: 'claimantName',
      key: 'claimantName',
      width: 100
    },
    {
      title: '联系电话',
      dataIndex: 'claimantPhone',
      key: 'claimantPhone',
      width: 120
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: ClaimType) => {
        const typeInfo = claimTypeMap[type] || claimTypeMap.other;
        return <Tag color={typeInfo.color}>{typeInfo.label}</Tag>;
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (status: ClaimStatus) => {
        const statusInfo = claimStatusMap[status] || claimStatusMap.pending;
        return <Tag color={statusInfo.color}>{statusInfo.label}</Tag>;
      }
    },
    {
      title: '索赔金额',
      dataIndex: 'claimAmount',
      key: 'claimAmount',
      width: 100,
      render: (value: number) => `¥${value}`
    },
    {
      title: '批准金额',
      dataIndex: 'approvedAmount',
      key: 'approvedAmount',
      width: 100,
      render: (value: number) => value ? `¥${value}` : '-'
    },
    {
      title: '索赔原因',
      dataIndex: 'claimReason',
      key: 'claimReason',
      width: 150,
      ellipsis: true
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
      width: 150,
      fixed: 'right' as const,
      render: (_: any, record: Claim) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewClaim(record)}
          >
            查看
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditClaim(record)}
          >
            编辑
          </Button>
        </Space>
      )
    }
  ];

  const tablePagination = {
    ...pagination,
    total: activeTab === 'returns' ? returnTotal : claimTotal,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total: number) => `共 ${total} 条记录`,
    onChange: (page: number, pageSize: number) => {
      setPagination({ current: page, pageSize });
    }
  };

  const tabItems = [
    {
      key: 'returns',
      label: '退换货管理',
      children: (
        <>
          <Card style={{ marginBottom: 16 }}>
            <Space wrap size="middle">
              <Input
                placeholder="搜索申请原因/备注"
                prefix={<SearchOutlined />}
                style={{ width: 200 }}
                value={returnSearchParams.keyword}
                onChange={(e) => setReturnSearchParams(prev => ({ ...prev, keyword: e.target.value }))}
                onPressEnter={handleReturnSearch}
              />
              <Select
                placeholder="类型"
                style={{ width: 100 }}
                allowClear
                value={returnSearchParams.type}
                onChange={(value) => setReturnSearchParams(prev => ({ ...prev, type: value }))}
              >
                {Object.entries(returnTypeMap).map(([key, value]) => (
                  <Option key={key} value={key}>{value.label}</Option>
                ))}
              </Select>
              <Select
                placeholder="状态"
                style={{ width: 100 }}
                allowClear
                value={returnSearchParams.status}
                onChange={(value) => setReturnSearchParams(prev => ({ ...prev, status: value }))}
              >
                {Object.entries(returnStatusMap).map(([key, value]) => (
                  <Option key={key} value={key}>{value.label}</Option>
                ))}
              </Select>
              <Button type="primary" onClick={handleReturnSearch}>
                搜索
              </Button>
              <Button onClick={handleReturnReset}>
                重置
              </Button>
            </Space>
          </Card>

          <Card>
            <Table
              columns={returnColumns}
              dataSource={returnData}
              rowKey="id"
              loading={returnLoading}
              pagination={tablePagination}
              scroll={{ x: 1500 }}
            />
          </Card>
        </>
      )
    },
    {
      key: 'claims',
      label: '理赔管理',
      children: (
        <>
          <Card style={{ marginBottom: 16 }}>
            <Space wrap size="middle">
              <Input
                placeholder="搜索索赔人/原因"
                prefix={<SearchOutlined />}
                style={{ width: 200 }}
                value={claimSearchParams.keyword}
                onChange={(e) => setClaimSearchParams(prev => ({ ...prev, keyword: e.target.value }))}
                onPressEnter={handleClaimSearch}
              />
              <Select
                placeholder="类型"
                style={{ width: 120 }}
                allowClear
                value={claimSearchParams.type}
                onChange={(value) => setClaimSearchParams(prev => ({ ...prev, type: value }))}
              >
                {Object.entries(claimTypeMap).map(([key, value]) => (
                  <Option key={key} value={key}>{value.label}</Option>
                ))}
              </Select>
              <Select
                placeholder="状态"
                style={{ width: 100 }}
                allowClear
                value={claimSearchParams.status}
                onChange={(value) => setClaimSearchParams(prev => ({ ...prev, status: value }))}
              >
                {Object.entries(claimStatusMap).map(([key, value]) => (
                  <Option key={key} value={key}>{value.label}</Option>
                ))}
              </Select>
              <Button type="primary" onClick={handleClaimSearch}>
                搜索
              </Button>
              <Button onClick={handleClaimReset}>
                重置
              </Button>
            </Space>
          </Card>

          <Card>
            <Table
              columns={claimColumns}
              dataSource={claimData}
              rowKey="id"
              loading={claimLoading}
              pagination={tablePagination}
              scroll={{ x: 1600 }}
            />
          </Card>
        </>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>退换货管理</h2>
        <Space>
          {activeTab === 'returns' ? (
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateReturn}>
              新增退换货
            </Button>
          ) : (
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateClaim}>
              新增理赔
            </Button>
          )}
        </Space>
      </div>

      <Tabs activeKey={activeTab} onChange={handleTabChange} items={tabItems} />

      <Modal
        title={selectedReturn ? '退换货详情' : '理赔详情'}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={700}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
      >
        {selectedReturn && (
          <div>
            <Descriptions title="基本信息" bordered column={2}>
              <Descriptions.Item label="ID">{selectedReturn.id}</Descriptions.Item>
              <Descriptions.Item label="订单ID">{selectedReturn.orderId}</Descriptions.Item>
              <Descriptions.Item label="运单ID">{selectedReturn.waybillId || '-'}</Descriptions.Item>
              <Descriptions.Item label="退回运单号">{selectedReturn.returnWaybillNo || '-'}</Descriptions.Item>
              <Descriptions.Item label="类型">
                <Tag color={returnTypeMap[selectedReturn.type]?.color}>
                  {returnTypeMap[selectedReturn.type]?.label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={returnStatusMap[selectedReturn.status]?.color}>
                  {returnStatusMap[selectedReturn.status]?.label}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions title="申请信息" bordered column={2}>
              <Descriptions.Item label="申请原因" span={2}>
                {selectedReturn.requestReason}
              </Descriptions.Item>
              <Descriptions.Item label="详细描述" span={2}>
                {selectedReturn.requestDescription || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="申请时间">
                {selectedReturn.requestedAt ? dayjs(selectedReturn.requestedAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="退款金额">
                {selectedReturn.refundAmount ? `¥${selectedReturn.refundAmount}` : '-'}
              </Descriptions.Item>
            </Descriptions>

            {(selectedReturn.approvalComment || selectedReturn.inspectionResult) && (
              <>
                <Divider />
                <Descriptions title="处理信息" bordered column={2}>
                  {selectedReturn.approvalComment && (
                    <Descriptions.Item label="审批意见" span={2}>
                      {selectedReturn.approvalComment}
                    </Descriptions.Item>
                  )}
                  {selectedReturn.inspectionResult && (
                    <Descriptions.Item label="检验结果" span={2}>
                      {selectedReturn.inspectionResult}
                    </Descriptions.Item>
                  )}
                  {selectedReturn.approvedAt && (
                    <Descriptions.Item label="审批时间">
                      {dayjs(selectedReturn.approvedAt).format('YYYY-MM-DD HH:mm:ss')}
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </>
            )}
          </div>
        )}

        {selectedClaim && (
          <div>
            <Descriptions title="基本信息" bordered column={2}>
              <Descriptions.Item label="ID">{selectedClaim.id}</Descriptions.Item>
              <Descriptions.Item label="订单ID">{selectedClaim.orderId || '-'}</Descriptions.Item>
              <Descriptions.Item label="运单ID">{selectedClaim.waybillId || '-'}</Descriptions.Item>
              <Descriptions.Item label="异常件ID">{selectedClaim.exceptionItemId || '-'}</Descriptions.Item>
              <Descriptions.Item label="类型">
                <Tag color={claimTypeMap[selectedClaim.type]?.color}>
                  {claimTypeMap[selectedClaim.type]?.label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={claimStatusMap[selectedClaim.status]?.color}>
                  {claimStatusMap[selectedClaim.status]?.label}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions title="索赔人信息" bordered column={2}>
              <Descriptions.Item label="姓名">{selectedClaim.claimantName}</Descriptions.Item>
              <Descriptions.Item label="电话">{selectedClaim.claimantPhone}</Descriptions.Item>
              <Descriptions.Item label="邮箱">{selectedClaim.claimantEmail || '-'}</Descriptions.Item>
              <Descriptions.Item label="提交时间">
                {selectedClaim.submittedAt ? dayjs(selectedClaim.submittedAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions title="索赔信息" bordered column={2}>
              <Descriptions.Item label="索赔金额">¥{selectedClaim.claimAmount}</Descriptions.Item>
              <Descriptions.Item label="批准金额">
                {selectedClaim.approvedAmount ? `¥${selectedClaim.approvedAmount}` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="赔付金额">
                {selectedClaim.payoutAmount ? `¥${selectedClaim.payoutAmount}` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="满意度">
                {selectedClaim.reviewComment || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="索赔原因" span={2}>
                {selectedClaim.claimReason}
              </Descriptions.Item>
              <Descriptions.Item label="详细描述" span={2}>
                {selectedClaim.claimDescription || '-'}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>

      <Modal
        title={activeTab === 'returns' 
          ? (formMode === 'create' ? '新增退换货' : '编辑退换货')
          : (formMode === 'create' ? '新增理赔' : '编辑理赔')
        }
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
          {activeTab === 'returns' ? (
            <>
              <Form.Item
                name="orderId"
                label="订单ID"
                rules={[{ required: true, message: '请输入订单ID' }]}
              >
                <InputNumber placeholder="请输入订单ID" style={{ width: '100%' }} min={1} />
              </Form.Item>

              <Form.Item
                name="type"
                label="类型"
                rules={[{ required: true, message: '请选择类型' }]}
              >
                <Select placeholder="请选择类型">
                  {Object.entries(returnTypeMap).map(([key, value]) => (
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
                  {Object.entries(returnStatusMap).map(([key, value]) => (
                    <Option key={key} value={key}>{value.label}</Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="requestReason"
                label="申请原因"
                rules={[{ required: true, message: '请输入申请原因' }]}
              >
                <Input placeholder="请输入申请原因" />
              </Form.Item>

              <Form.Item
                name="requestDescription"
                label="详细描述"
              >
                <TextArea rows={3} placeholder="请输入详细描述" />
              </Form.Item>

              <Form.Item
                name="returnWaybillNo"
                label="退回运单号"
              >
                <Input placeholder="请输入退回运单号" />
              </Form.Item>
            </>
          ) : (
            <>
              <Form.Item
                name="claimantName"
                label="索赔人姓名"
                rules={[{ required: true, message: '请输入索赔人姓名' }]}
              >
                <Input placeholder="请输入索赔人姓名" />
              </Form.Item>

              <Form.Item
                name="claimantPhone"
                label="联系电话"
                rules={[{ required: true, message: '请输入联系电话' }]}
              >
                <Input placeholder="请输入联系电话" />
              </Form.Item>

              <Form.Item
                name="claimantEmail"
                label="邮箱"
              >
                <Input placeholder="请输入邮箱" />
              </Form.Item>

              <Form.Item
                name="type"
                label="理赔类型"
                rules={[{ required: true, message: '请选择理赔类型' }]}
              >
                <Select placeholder="请选择理赔类型">
                  {Object.entries(claimTypeMap).map(([key, value]) => (
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
                  {Object.entries(claimStatusMap).map(([key, value]) => (
                    <Option key={key} value={key}>{value.label}</Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="claimAmount"
                label="索赔金额（元）"
                rules={[{ required: true, message: '请输入索赔金额' }]}
              >
                <InputNumber placeholder="请输入索赔金额" style={{ width: '100%' }} min={0} precision={2} />
              </Form.Item>

              <Form.Item
                name="claimReason"
                label="索赔原因"
                rules={[{ required: true, message: '请输入索赔原因' }]}
              >
                <Input placeholder="请输入索赔原因" />
              </Form.Item>

              <Form.Item
                name="claimDescription"
                label="详细描述"
              >
                <TextArea rows={3} placeholder="请输入详细描述" />
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
            </>
          )}
        </Form>
      </Modal>

      <Modal
        title="审批退换货"
        open={approveModalVisible}
        onCancel={() => setApproveModalVisible(false)}
        width={500}
        onOk={handleApproveSubmit}
        okText="确认批准"
        cancelText="取消"
      >
        <Form
          form={approveForm}
          layout="vertical"
          style={{ marginTop: 24 }}
        >
          <Form.Item
            name="refundAmount"
            label="退款金额（元）"
          >
            <InputNumber placeholder="请输入退款金额" style={{ width: '100%' }} min={0} precision={2} />
          </Form.Item>

          <Form.Item
            name="approvalComment"
            label="审批意见"
          >
            <TextArea rows={3} placeholder="请输入审批意见" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ReturnList;
