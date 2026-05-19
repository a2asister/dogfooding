import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { 
  UserOutlined, ShopOutlined, ShoppingOutlined, 
  RiseOutlined 
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { adminApi } from '../../services/api';

function AdminDashboard(): JSX.Element {
  const [stats, setStats] = useState({
    userCount: 0,
    merchantCount: 0,
    auctionCount: 0,
    orderCount: 0,
    totalAmount: 0,
    totalCommission: 0,
    recentOrders: [] as Array<{ date: string; count: number; amount: number }>
  });

  const loadStats = async (): Promise<void> => {
    try {
      const res = await adminApi.getStatistics() as unknown as {
        userCount: number;
        merchantCount: number;
        auctionCount: number;
        orderCount: number;
        totalAmount: number;
        totalCommission: number;
        recentOrders: Array<{ date: string; count: number; amount: number }>;
      };
      setStats(res);
    } catch {
      // Error handled
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const chartOption = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['订单数', '成交额']
    },
    xAxis: {
      type: 'category',
      data: stats.recentOrders.map(item => item.date).reverse()
    },
    yAxis: [
      {
        type: 'value',
        name: '订单数'
      },
      {
        type: 'value',
        name: '成交额(元)'
      }
    ],
    series: [
      {
        name: '订单数',
        type: 'bar',
        data: stats.recentOrders.map(item => item.count).reverse()
      },
      {
        name: '成交额',
        type: 'line',
        yAxisIndex: 1,
        data: stats.recentOrders.map(item => item.amount).reverse()
      }
    ]
  };

  return (
    <div>
      <h2 className="page-title">管理后台</h2>
      
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={4}>
          <Card>
            <Statistic 
              title="用户总数" 
              value={stats.userCount} 
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic 
              title="商家总数" 
              value={stats.merchantCount} 
              prefix={<ShopOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic 
              title="拍卖商品" 
              value={stats.auctionCount} 
              prefix={<ShoppingOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic 
              title="订单总数" 
              value={stats.orderCount} 
              prefix={<RiseOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic 
              title="成交总额" 
              value={stats.totalAmount} 
              prefix="¥"
              precision={2}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic 
              title="佣金收入" 
              value={stats.totalCommission} 
              prefix="¥"
              precision={2}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="近7天交易趋势">
        <ReactECharts option={chartOption} style={{ height: 400 }} />
      </Card>
    </div>
  );
}

export default AdminDashboard;
