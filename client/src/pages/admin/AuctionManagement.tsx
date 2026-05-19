import { useState, useEffect } from 'react';
import { Table, Tag, Button, Space, Modal, Form, Input, Select, message } from 'antd';
import dayjs from 'dayjs';
import { adminApi } from '../../services/api';
import { AuctionStatus, AuthStatus } from '../../types';

const { Option } = Select;
const { TextArea } = Input;

const statusMap: Record<string, { color: string; text: string }> = {
  [AuctionStatus.DRAFT]: { color: 'default', text: '草稿' },
  [AuctionStatus.PENDING]: { color: 'orange', text: '待审核' },
  [AuctionStatus.ACTIVE]: { color: 'green', text: '拍卖中' },
  [AuctionStatus.ENDED]: { color: 'blue', text: '已结束' },
  [AuctionStatus.CANCELLED]: { color: 'red', text: '已取消' }
};

const auditStatusMap: Record<string, { color: string; text: string }> = {
  [AuthStatus.PENDING]: { color: 'orange', text: '待审核' },
  [AuthStatus.VERIFIED]: { color: 'green', text: '已通过' },
  [AuthStatus.REJECTED]: { color: 'red', text: '已拒绝' }
};

function AuctionManagement(): JSX.Element {
  const [auctions, setAuctions] = useState<Array<{ id: number; title: string; category: string; startPrice: number; currentPrice: number; status: string; auditStatus: string; auditReason?: string; companyName: string; startTime: string; endTime: string }>>([]);
  const [auditModalVisible, setAuditModalVisible] = useState(false);
  const [currentAuction, setCurrentAuction] = useState<{ id: number; title: string } | null>(null);
  const [form] = Form.useForm();

  const loadAuctions = async (): Promise<void> => {
    try {
      const res = await adminApi.getAuctions() as unknown as { auctions: Array<{ id: number; title: string; category: string; startPrice: number; currentPrice: number; status: string; auditStatus: string; auditReason?: string; companyName: string; startTime: string; endTime: string }>; total: number };
      setAuctions(res.auctions);
    } catch {
      // Error handled
    }
  };

  useEffect(() => {
    loadAuctions();
  }, []);

  const handleAudit = (auction: { id: number; title: string }): void => {
    setCurrentAuction(auction);
    setAuditModalVisible(true);
  };

  const handleSubmitAudit = async (values: { status: string; reason?: string }): Promise<void> => {
    if (!currentAuction) return;
    
    try {
      await adminApi.auditAuction(currentAuction.id, values.status, values.reason);
      message.success('审核完成');
      setAuditModalVisible(false);
      form.resetFields();
      loadAuctions();
    } catch {
      // Error handled
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
      title: '商品标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category'
    },
    {
      title: '所属商家',
      dataIndex: 'companyName',
      key: 'companyName'
    },
    {
      title: '起拍价',
      dataIndex: 'startPrice',
      key: 'startPrice',
      render: (val: number) => `¥${val.toFixed(2)}`
    },
    {
      title: '当前价',
      dataIndex: 'currentPrice',
      key: 'currentPrice',
      render: (val: number) => <span className="price-text">¥{val.toFixed(2)}</span>
    },
    {
      title: '状态',
      key: 'status',
      render: (_: unknown, record: { status: string; auditStatus: string }) => (
        <Space direction="vertical" size={0}>
          <Tag color={statusMap[record.status]?.color || 'default'}>
            {statusMap[record.status]?.text || record.status}
          </Tag>
          <Tag color={auditStatusMap[record.auditStatus]?.color || 'default'}>
            {auditStatusMap[record.auditStatus]?.text || record.auditStatus}
          </Tag>
        </Space>
      )
    },
    {
      title: '开拍时间',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (text: string) => dayjs(text).format('MM-DD HH:mm')
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
      render: (text: string) => dayjs(text).format('MM-DD HH:mm')
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: unknown, record: { id: number; title: string; auditStatus: string }) => (
        record.auditStatus === AuthStatus.PENDING && (
          <Button type="link" size="small" onClick={() => handleAudit(record)}>
            审核
          </Button>
        )
      )
    }
  ];

  return (
    <div>
      <h2 className="page-title">拍卖商品管理</h2>
      
      <Table
        dataSource={auctions}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={`审核商品 - ${currentAuction?.title}`}
        open={auditModalVisible}
        onCancel={() => setAuditModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmitAudit}>
          <Form.Item
            name="status"
            label="审核结果"
            rules={[{ required: true, message: '请选择审核结果' }]}
          >
            <Select placeholder="请选择">
              <Option value={AuthStatus.VERIFIED}>通过</Option>
              <Option value={AuthStatus.REJECTED}>拒绝</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="reason"
            label="拒绝原因"
            extra="拒绝时必填"
          >
            <TextArea rows={3} placeholder="请输入拒绝原因" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              提交审核
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default AuctionManagement;
