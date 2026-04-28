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
  Divider,
  Form,
  InputNumber,
  Row,
  Col
} from 'antd';
import { 
  SearchOutlined, 
  EyeOutlined, 
  TruckOutlined,
  UserOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { waybillApi } from '../../services/api';
import type { Waybill, WaybillStatus, TrackingRecord } from '../../types';

const { RangePicker } = DatePicker;
const { Option } = Select;

const WaybillList: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Waybill[]>([]);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10
  });
  const [searchParams, setSearchParams] = useState({
    keyword: '',
    status: undefined as WaybillStatus | undefined,
    startDate: undefined as string | undefined,
    endDate: undefined as string | undefined
  });
  const [selectedWaybill, setSelectedWaybill] = useState<Waybill | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [form] = Form.useForm();

  const statusMap: Record<WaybillStatus, { label: string; color: string }> = {
    created: { label: '已创建', color: 'default' },
    picked_up: { label: '已揽收', color: 'purple' },
    in_transit: { label: '运输中', color: 'processing' },
    arrived: { label: '已到达', color: 'geekblue' },
    delivering: { label: '派送中', color: 'lime' },
    delivered: { label: '已送达', color: 'cyan' },
    signed: { label: '已签收', color: 'success' },
    returned: { label: '已退回', color: 'orange' },
    lost: { label: '丢失', color: 'red' },
    damaged: { label: '损坏', color: 'red' }
  };

  useEffect(() => {
    loadWaybills();
  }, [pagination.current, pagination.pageSize, searchParams]);

  const loadWaybills = async () => {
    setLoading(true);
    try {
      const result = await waybillApi.getList({
        page: pagination.current,
        pageSize: pagination.pageSize,
        ...searchParams
      });
      
      if (result.success && result.data) {
        setData(result.data.list);
        setTotal(result.data.total);
      }
    } catch (error) {
      console.error('加载运单列表失败:', error);
      message.error('加载运单列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (record: Waybill) => {
    setSelectedWaybill(record);
    setDetailModalVisible(true);
  };

  const handleUpdateStatus = (record: Waybill) => {
    setSelectedWaybill(record);
    form.setFieldsValue({
      status: record.status,
      description: ''
    });
    setStatusModalVisible(true);
  };

  const handleAssign = (record: Waybill) => {
    setSelectedWaybill(record);
    form.setFieldsValue({
      courierId: undefined,
      vehicleId: undefined
    });
    setAssignModalVisible(true);
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }));
    loadWaybills();
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

  const handleStatusSubmit = async () => {
    if (!selectedWaybill) return;
    try {
      const values = await form.validateFields();
      const result = await waybillApi.updateStatus(selectedWaybill.id, {
        status: values.status,
        description: values.description
      });
      
      if (result.success) {
        message.success('状态更新成功');
        setStatusModalVisible(false);
        loadWaybills();
      } else {
        message.error(result.message || '状态更新失败');
      }
    } catch (error: any) {
      message.error(error.message || '状态更新失败');
    }
  };

  const handleAssignSubmit = async () => {
    if (!selectedWaybill) return;
    try {
      const values = await form.validateFields();
      const result = await waybillApi.assignCourier(selectedWaybill.id, {
        courierId: values.courierId,
        vehicleId: values.vehicleId
      });
      
      if (result.success) {
        message.success('分配成功');
        setAssignModalVisible(false);
        loadWaybills();
      } else {
        message.error(result.message || '分配失败');
      }
    } catch (error: any) {
      message.error(error.message || '分配失败');
    }
  };

  const columns = [
    {
      title: '运单号',
      dataIndex: 'waybillNo',
      key: 'waybillNo',
      width: 180,
      render: (text: string) => <span style={{ color: '#1890ff' }}>{text}</span>
    },
    {
      title: '订单号',
      dataIndex: ['order', 'orderNo'],
      key: 'orderNo',
      width: 180
    },
    {
      title: '寄件人',
      dataIndex: ['order', 'senderName'],
      key: 'senderName',
      width: 100
    },
    {
      title: '收件人',
      dataIndex: ['order', 'receiverName'],
      key: 'receiverName',
      width: 100
    },
    {
      title: '物品',
      dataIndex: ['order', 'packageName'],
      key: 'packageName',
      width: 120
    },
    {
      title: '当前网点',
      dataIndex: ['currentBranch', 'name'],
      key: 'currentBranch',
      width: 120
    },
    {
      title: '快递员',
      dataIndex: ['courier', 'name'],
      key: 'courier',
      width: 100
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: WaybillStatus) => {
        const statusInfo = statusMap[status] || statusMap.created;
        return <Tag color={statusInfo.color}>{statusInfo.label}</Tag>;
      }
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
      width: 200,
      fixed: 'right' as const,
      render: (_: any, record: Waybill) => (
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
            onClick={() => handleUpdateStatus(record)}
          >
            更新状态
          </Button>
          <Button
            type="link"
            onClick={() => handleAssign(record)}
          >
            分配
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
      <h2 style={{ marginBottom: 24 }}>运单管理</h2>

      <Card style={{ marginBottom: 16 }}>
        <Space wrap size="middle">
          <Input
            placeholder="搜索运单号/订单号"
            prefix={<SearchOutlined />}
            style={{ width: 250 }}
            value={searchParams.keyword}
            onChange={(e) => setSearchParams(prev => ({ ...prev, keyword: e.target.value }))}
            onPressEnter={handleSearch}
          />
          <Select
            placeholder="运单状态"
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
          scroll={{ x: 1600 }}
        />
      </Card>

      <Modal
        title="运单详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={900}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
      >
        {selectedWaybill && (
          <div>
            <Descriptions title="运单信息" bordered column={2}>
              <Descriptions.Item label="运单号">{selectedWaybill.waybillNo}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={statusMap[selectedWaybill.status].color}>
                  {statusMap[selectedWaybill.status].label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="订单号">{selectedWaybill.order?.orderNo}</Descriptions.Item>
              <Descriptions.Item label="当前网点">{selectedWaybill.currentBranch?.name || '-'}</Descriptions.Item>
              <Descriptions.Item label="快递员">{selectedWaybill.courier?.name || '-'}</Descriptions.Item>
              <Descriptions.Item label="车辆">{selectedWaybill.vehicle?.plateNumber || '-'}</Descriptions.Item>
              <Descriptions.Item label="预计送达">
                {selectedWaybill.estimateDeliveryTime 
                  ? dayjs(selectedWaybill.estimateDeliveryTime).format('YYYY-MM-DD HH:mm') 
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="实际送达">
                {selectedWaybill.actualDeliveryTime 
                  ? dayjs(selectedWaybill.actualDeliveryTime).format('YYYY-MM-DD HH:mm') 
                  : '-'}
              </Descriptions.Item>
            </Descriptions>

            {selectedWaybill.order && (
              <>
                <Divider />
                <Descriptions title="订单信息" bordered column={2}>
                  <Descriptions.Item label="物品名称">{selectedWaybill.order.packageName}</Descriptions.Item>
                  <Descriptions.Item label="件数">{selectedWaybill.order.packageCount}</Descriptions.Item>
                  <Descriptions.Item label="寄件人">{selectedWaybill.order.senderName}</Descriptions.Item>
                  <Descriptions.Item label="寄件电话">{selectedWaybill.order.senderPhone}</Descriptions.Item>
                  <Descriptions.Item label="收件人">{selectedWaybill.order.receiverName}</Descriptions.Item>
                  <Descriptions.Item label="收件电话">{selectedWaybill.order.receiverPhone}</Descriptions.Item>
                </Descriptions>
              </>
            )}

            {selectedWaybill.trackingRecords && selectedWaybill.trackingRecords.length > 0 && (
              <>
                <Divider />
                <h4>物流轨迹</h4>
                <Timeline
                  items={selectedWaybill.trackingRecords
                    .sort((a, b) => new Date(b.eventTime).getTime() - new Date(a.eventTime).getTime())
                    .map((record) => ({
                      color: record.event.includes('异常') || record.event.includes('丢失') || record.event.includes('损坏') 
                        ? 'red' 
                        : 'blue',
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

      <Modal
        title="更新运单状态"
        open={statusModalVisible}
        onCancel={() => setStatusModalVisible(false)}
        onOk={handleStatusSubmit}
        okText="确认"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="status"
            label="运单状态"
            rules={[{ required: true, message: '请选择运单状态' }]}
          >
            <Select placeholder="请选择运单状态">
              {Object.entries(statusMap).map(([key, value]) => (
                <Option key={key} value={key}>{value.label}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="description"
            label="操作描述"
          >
            <Input.TextArea rows={3} placeholder="请输入操作描述" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="分配快递员"
        open={assignModalVisible}
        onCancel={() => setAssignModalVisible(false)}
        onOk={handleAssignSubmit}
        okText="确认分配"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="courierId"
            label="选择快递员"
            rules={[{ required: true, message: '请选择快递员' }]}
          >
            <Select placeholder="请选择快递员">
              <Option value={1}>张三</Option>
              <Option value={2}>李四</Option>
              <Option value={3}>王五</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="vehicleId"
            label="选择车辆（可选）"
          >
            <Select placeholder="请选择车辆" allowClear>
              <Option value={1}>京A12345 - 货车</Option>
              <Option value={2}>京B67890 - 厢式货车</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default WaybillList;
