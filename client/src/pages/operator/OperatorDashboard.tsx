import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Space, Progress, List, Avatar } from 'antd';
import {
  ShoppingCartOutlined,
  MoneyCollectOutlined,
  UserOutlined,
  RiseOutlined,
  AlertOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import dayjs from 'dayjs';
import { adminApi } from '../../services/api';
import { AuctionStatus, OrderStatus } from '../../types';

interface Auction {
  id: number;
  title: string;
  currentPrice: number;
  bidCount: number;
  endTime: string;
  status: string;
}

interface Order {
  id: number;
  orderNo: string;
  auctionTitle: string;
  amount: number;
  status: string;
  createdAt: string;
}

const statusMap: Record<string, { color: string; text: string }> = {
  [OrderStatus.PENDING_PAYMENT]: { color: 'orange', text: '待支付' },
  [OrderStatus.PAID]: { color: 'blue', text: '已支付' },
  [OrderStatus.SHIPPED]: { color: 'cyan', text: '已发货' },
  [OrderStatus.COMPLETED]: { color: 'green', text: '已完成' },
  [OrderStatus.CANCELLED]: { color: 'red', text: '已取消' }
};

const auctionStatusMap: Record<string, { color: string; text: string }> = {
  [AuctionStatus.ACTIVE]: { color: 'green', text: '拍卖中' },
  [AuctionStatus.PENDING]: { color: 'orange', text: '待开始' },
  [AuctionStatus.ENDED]: { color: 'blue', text: '已结束' }
};

function OperatorDashboard(): JSX.Element {
  const [stats, setStats] = useState({
    totalAuctions: 0,
    activeAuctions: 0,
    totalOrders: 0,
    todayOrders: 0,
    totalAmount: 0,
    todayAmount: 0,
    totalUsers: 0,
    pendingAudit: 0
  });
  const [liveAuctions, setLiveAuctions] = useState<Auction[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  const loadData = async (): Promise<void> => {
    try {
      const res = await adminApi.getStatistics() as unknown as {
        stats: typeof stats;
        liveAuctions: Auction[];
        recentOrders: Order[];
      };
      if (res.stats) {
        setStats(res.stats);
      }
      if (res.liveAuctions) {
        setLiveAuctions(res.liveAuctions);
      }
      if (res.recentOrders) {
        setRecentOrders(res.recentOrders);
      }
    } catch {
      // Use mock data
      setStats({
        totalAuctions: 156,
        activeAuctions: 23,
        totalOrders: 892,
        todayOrders: 45,
        totalAmount: 1258000,
        todayAmount: 68500,
        totalUsers: 2341,
        pendingAudit: 18
      });
      setLiveAuctions([
        { id: 1, title: '清代青花瓷瓶', currentPrice: 12500, bidCount: 45, endTime: dayjs().add(2, 'hour').toISOString(), status: AuctionStatus.ACTIVE },
        { id: 2, title: '名家书法真迹', currentPrice: 8800, bidCount: 32, endTime: dayjs().add(5, 'hour').toISOString(), status: AuctionStatus.ACTIVE },
        { id: 3, title: '限量版手表', currentPrice: 15600, bidCount: 28, endTime: dayjs().add(30, 'minute').toISOString(), status: AuctionStatus.ACTIVE },
        { id: 4, title: '古玩玉器挂件', currentPrice: 3200, bidCount: 15, endTime: dayjs().add(1, 'day').toISOString(), status: AuctionStatus.ACTIVE },
        { id: 5, title: '古钱币收藏套装', currentPrice: 5600, bidCount: 22, endTime: dayjs().add(8, 'hour').toISOString(), status: AuctionStatus.ACTIVE }
      ]);
      setRecentOrders([
        { id: 1, orderNo: 'AX20240115001', auctionTitle: '清代青花瓷瓶', amount: 12500, status: OrderStatus.PAID, createdAt: dayjs().subtract(10, 'minute').toISOString() },
        { id: 2, orderNo: 'AX20240115002', auctionTitle: '名家书法真迹', amount: 8800, status: OrderStatus.PENDING_PAYMENT, createdAt: dayjs().subtract(25, 'minute').toISOString() },
        { id: 3, orderNo: 'AX20240115003', auctionTitle: '限量版手表', amount: 15600, status: OrderStatus.SHIPPED, createdAt: dayjs().subtract(1, 'hour').toISOString() },
        { id: 4, orderNo: 'AX20240115004', auctionTitle: '古玩玉器挂件', amount: 3200, status: OrderStatus.COMPLETED, createdAt: dayjs().subtract(3, 'hour').toISOString() },
        { id: 5, orderNo: 'AX20240115005', auctionTitle: '古钱币收藏套装', amount: 5600, status: OrderStatus.PAID, createdAt: dayjs().subtract(5, 'hour').toISOString() }
      ]);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const salesChartOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['成交额', '订单数'] },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    },
    yAxis: [
      { type: 'value', name: '成交额(元)' },
      { type: 'value', name: '订单数' }
    ],
    series: [
      {
        name: '成交额',
        type: 'bar',
        data: [45000, 52000, 68000, 85000, 72000, 95000, 68500],
        itemStyle: { color: '#1890ff' }
      },
      {
        name: '订单数',
        type: 'line',
        yAxisIndex: 1,
        data: [28, 35, 42, 58, 48, 62, 45],
        itemStyle: { color: '#52c41a' },
        smooth: true
      }
    ]
  };

  const categoryChartOption = {
    tooltip: { trigger: 'item' },
    legend: { bottom: 0 },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        data: [
          { value: 35, name: '古玩字画' },
          { value: 28, name: '珠宝玉器' },
          { value: 22, name: '名表奢侈品' },
          { value: 15, name: '钱币邮票' }
        ]
      }
    ]
  };

  const getRemainingTime = (endTime: string): { text: string; percent: number } => {
    const now = dayjs();
    const end = dayjs(endTime);
    const diff = end.diff(now, 'second');
    
    if (diff <= 0) return { text: '已结束', percent: 100 };
    
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;
    
    let text = '';
    if (hours > 0) text += `${hours}小时`;
    if (minutes > 0) text += `${minutes}分`;
    text += `${seconds}秒`;
    
    const totalDuration = 3600 * 24;
    const percent = Math.min(100, Math.max(0, 100 - (diff / totalDuration) * 100));
    
    return { text, percent };
  };

  return (
    <div>
      <h2 className="page-title">运营总览</h2>
      
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="正在拍卖"
              value={stats.activeAuctions}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="今日订单"
              value={stats.todayOrders}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="今日成交额"
              value={stats.todayAmount}
              precision={2}
              prefix={<MoneyCollectOutlined />}
              suffix="元"
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="待审核"
              value={stats.pendingAudit}
              prefix={<AlertOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={16}>
          <Card title="本周交易趋势" extra={<RiseOutlined />}>
            <ReactECharts option={salesChartOption} style={{ height: 300 }} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="品类分布">
            <ReactECharts option={categoryChartOption} style={{ height: 300 }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card 
            title="实时拍卖" 
            extra={<Space><ClockCircleOutlined /> 每30秒刷新</Space>}
          >
            <List
              dataSource={liveAuctions}
              renderItem={(item) => {
                const remaining = getRemainingTime(item.endTime);
                return (
                  <List.Item key={item.id}>
                    <List.Item.Meta
                      avatar={<Avatar icon={<ShoppingCartOutlined />} />}
                      title={item.title}
                      description={
                        <Space direction="vertical" size={0} style={{ width: '100%' }}>
                          <div>
                            <Space>
                              {(() => {
                                const statusInfo = auctionStatusMap[item.status];
                                return statusInfo ? <Tag color={statusInfo.color}>{statusInfo.text}</Tag> : null;
                              })()}
                              <span>当前价：<b className="price-text">¥{item.currentPrice.toLocaleString()}</b></span>
                              <span>出价：{item.bidCount}次</span>
                            </Space>
                          </div>
                          <Progress 
                            percent={Math.round(remaining.percent)} 
                            size="small"
                            strokeColor={remaining.percent > 80 ? '#ff4d4f' : '#52c41a'}
                            format={() => `剩余 ${remaining.text}`}
                          />
                        </Space>
                      }
                    />
                  </List.Item>
                );
              }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="最新订单">
            <Table
              dataSource={recentOrders}
              rowKey="id"
              pagination={false}
              size="small"
              columns={[
                {
                  title: '订单',
                  dataIndex: 'auctionTitle',
                  key: 'title',
                  ellipsis: true
                },
                {
                  title: '金额',
                  dataIndex: 'amount',
                  key: 'amount',
                  width: 100,
                  render: (val: number) => <span className="price-text">¥{val.toLocaleString()}</span>
                },
                {
                  title: '状态',
                  dataIndex: 'status',
                  key: 'status',
                  width: 80,
                  render: (status: string) => {
                    const statusInfo = statusMap[status];
                    return statusInfo ? <Tag color={statusInfo.color}>{statusInfo.text}</Tag> : null;
                  }
                },
                {
                  title: '时间',
                  dataIndex: 'createdAt',
                  key: 'time',
                  width: 100,
                  render: (text: string) => dayjs(text).format('HH:mm')
                }
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default OperatorDashboard;
