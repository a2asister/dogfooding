import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Card, 
  Space, 
  Input, 
  DatePicker, 
  Select, 
  Tag, 
  Modal, 
  message,
  Descriptions,
  Timeline,
  Divider
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  EyeOutlined, 
  EditOutlined, 
  DeleteOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { orderApi } from '../../services/api';
import type { Order, OrderStatus, PaginatedResponse } from '../../types';

const { RangePicker } = DatePicker;
const { Option } = Select;

const OrderList: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10
  });
  const [searchParams, setSearchParams] = useState({
    keyword: '',
    status: undefined as OrderStatus | undefined,
    startDate: undefined as string | undefined,
    endDate: undefined as string | undefined
  });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const statusMap: Record<OrderStatus, { label: string; color: string }> = {
    pending: { label: '待处理', color: 'gold' },
    confirmed: { label: '已确认', color: 'blue' },
    pickup_assigned: { label: '已分配揽收', color: 'cyan' },
    picked_up: { label: '已揽收', color: 'purple' },
    transferring: { label: '中转中', color: 'orange' },
    in_transit: { label: '运输中', color: 'processing' },
    arrived: { label: '已到达', color: 'geekblue' },
    delivering: { label: '派送中', color: 'lime' },
    delivered: { label: '已签收', color: 'success' },
    cancelled: { label: '已取消', color: 'default' },
    returned: { label: '已退回', color: 'red' }
  };

  useEffect(() => {
    loadOrders();
  }, [pagination.current, pagination.pageSize, searchParams]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const result = await orderApi.getList({
        page: pagination.current,
        pageSize: pagination.pageSize,
        ...searchParams
      });
      
      if (result.success && result.data) {
        setData(result.data.list);
        setTotal(result.data.total);
      }
    } catch (error) {
      console.error('加载订单列表失败:', error);
      message.error('加载订单列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (record: Order) => {
    setSelectedOrder(record);
    setDetailModalVisible(true);
  };

  const handleEdit = (record: Order) => {
    navigate(`/orders/${record.id}`);
  };

  const handleCreate = () => {
    navigate('/orders/create');
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }));
    loadOrders();
  };

  const handleReset = () => {
    setSearchParams({
      keyword: '',
      status: undefined,
      startDate: undefined,
      endDate: undefined
    });
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const columns = [
    {
      title: '订单号',
      dataIndex: 'orderNo',
      key: 'orderNo',
      width: 180,
      render: (text: string) => <span style={{ color: '#1890ff', cursor: 'pointer' }}>{text}</span>
    },
    {
      title: '寄件人',
      dataIndex: 'senderName',
      key: 'senderName',
      width: 100
    },
    {
      title: '寄件人电话',
      dataIndex: 'senderPhone',
      key: 'senderPhone',
      width: 120
    },
    {
      title: '收件人',
      dataIndex: 'receiverName',
      key: 'receiverName',
      width: 100
    },
    {
      title: '收件人电话',
      dataIndex: 'receiverPhone',
      key: 'receiverPhone',
      width: 120
    },
    {
      title: '物品名称',
      dataIndex: 'packageName',
      key: 'packageName',
      width: 150
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: OrderStatus) => {
        const statusInfo = statusMap[status] || statusMap.pending;
        return <Tag color={statusInfo.color}>{statusInfo.label}</Tag>;
      }
    },
    {
      title: '金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 100,
      render: (amount: number) => amount ? `¥${amount.toFixed(2)}` : '-'
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right' as const,
      render: (_: any, record: Order) => (
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
        <h2>订单管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          新建订单
        </Button>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Space wrap size="middle">
          <Input
            placeholder="搜索订单号/姓名/电话"
            prefix={<SearchOutlined />}
            style={{ width: 250 }}
            value={searchParams.keyword}
            onChange={(e) => setSearchParams(prev => ({ ...prev, keyword: e.target.value }))}
            onPressEnter={handleSearch}
          />
          <Select
            placeholder="订单状态"
            style={{ width: 150 }}
            allowClear
            value={searchParams.status}
            onChange={(value) => setSearchParams(prev => ({ ...prev, status: value }))}
          >
            {Object.entries(statusMap).map(([key, value]) => (
              <Option key={key} value={key}>{value.label}</Option>
            ))}
          </Select>
          <RangePicker
            placeholder={['开始日期', '结束日期']}
            onChange={(dates) => {
              if (dates) {
                setSearchParams(prev => ({
                  ...prev,
                  startDate: dates[0]?.format('YYYY-MM-DD'),
                  endDate: dates[1]?.format('YYYY-MM-DD')
                }));
              } else {
                setSearchParams(prev => ({
                  ...prev,
                  startDate: undefined,
                  endDate: undefined
                }));
              }
            }}
          />
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
        title="订单详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
      >
        {selectedOrder && (
          <div>
            <Descriptions title="基本信息" bordered column={2}>
              <Descriptions.Item label="订单号">{selectedOrder.orderNo}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={statusMap[selectedOrder.status].color}>
                  {statusMap[selectedOrder.status].label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="物品名称">{selectedOrder.packageName}</Descriptions.Item>
              <Descriptions.Item label="物品类型">{selectedOrder.packageType}</Descriptions.Item>
              <Descriptions.Item label="件数">{selectedOrder.packageCount}</Descriptions.Item>
              <Descriptions.Item label="重量">{selectedOrder.packageWeight ? `${selectedOrder.packageWeight}kg` : '-'}</Descriptions.Item>
              <Descriptions.Item label="保价金额">{selectedOrder.declaredValue ? `¥${selectedOrder.declaredValue}` : '-'}</Descriptions.Item>
              <Descriptions.Item label="金额">{selectedOrder.totalAmount ? `¥${selectedOrder.totalAmount}` : '-'}</Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions title="寄件人信息" bordered column={2}>
              <Descriptions.Item label="姓名">{selectedOrder.senderName}</Descriptions.Item>
              <Descriptions.Item label="电话">{selectedOrder.senderPhone}</Descriptions.Item>
              <Descriptions.Item label="地址" span={2}>
                {selectedOrder.senderProvince} {selectedOrder.senderCity} {selectedOrder.senderDistrict} {selectedOrder.senderAddress}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions title="收件人信息" bordered column={2}>
              <Descriptions.Item label="姓名">{selectedOrder.receiverName}</Descriptions.Item>
              <Descriptions.Item label="电话">{selectedOrder.receiverPhone}</Descriptions.Item>
              <Descriptions.Item label="地址" span={2}>
                {selectedOrder.receiverProvince} {selectedOrder.receiverCity} {selectedOrder.receiverDistrict} {selectedOrder.receiverAddress}
              </Descriptions.Item>
            </Descriptions>

            {selectedOrder.waybill?.trackingRecords && selectedOrder.waybill.trackingRecords.length > 0 && (
              <>
                <Divider />
                <h4>物流轨迹</h4>
                <Timeline
                  items={selectedOrder.waybill.trackingRecords
                    .sort((a, b) => new Date(b.eventTime).getTime() - new Date(a.eventTime).getTime())
                    .map((record) => ({
                      color: record.event.includes('异常') ? 'red' : 'blue',
                      children: (
                        <div>
                          <p>{record.description}</p>
                          <p style={{ fontSize: 12, color: '#999' }}>
                            {record.branchName && `网点: ${record.branchName} `}
                            {record.operatorName && `操作人: ${record.operatorName} `}
                            {dayjs(record.eventTime).format('YYYY-MM-DD HH:mm:ss')}
                          </p>
                        </div>
                      )
                    }))}
                />
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrderList;
