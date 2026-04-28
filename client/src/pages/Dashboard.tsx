import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, message } from 'antd';
import {
  FileTextOutlined,
  HourglassOutlined,
  TruckOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  DollarOutlined,
  WarningOutlined,
  TeamOutlined
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { dashboardApi } from '../services/api';
import type { DashboardStats } from '../types';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingOrders: 0,
    inTransitOrders: 0,
    deliveredOrders: 0,
    todayOrders: 0,
    todayRevenue: 0,
    pendingExceptions: 0,
    activeCouriers: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const result = await dashboardApi.getStats();
      if (result.success && result.data) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('加载统计数据失败:', error);
    }
  };

  const orderTrendOption = {
    title: {
      text: '订单趋势',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['订单数', '签收数'],
      bottom: 0
    },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '订单数',
        type: 'line',
        smooth: true,
        data: [120, 132, 101, 134, 90, 230, 210],
        itemStyle: { color: '#1890ff' }
      },
      {
        name: '签收数',
        type: 'line',
        smooth: true,
        data: [100, 120, 90, 110, 80, 200, 190],
        itemStyle: { color: '#52c41a' }
      }
    ]
  };

  const statusPieOption = {
    title: {
      text: '订单状态分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'center'
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 45, name: '待处理', itemStyle: { color: '#faad14' } },
          { value: 120, name: '运输中', itemStyle: { color: '#1890ff' } },
          { value: 280, name: '已签收', itemStyle: { color: '#52c41a' } },
          { value: 5, name: '异常', itemStyle: { color: '#ff4d4f' } }
        ]
      }
    ]
  };

  const revenueBarOption = {
    title: {
      text: '营收统计',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月']
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '¥{value}'
      }
    },
    series: [
      {
        type: 'bar',
        data: [12500, 15800, 18200, 21500, 25800, 29200],
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#1890ff' },
              { offset: 1, color: '#52c41a' }
            ]
          }
        }
      }
    ]
  };

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 24 }}>数据概览</h2>

      <Row gutter={[16, 16]}>
        <Col xs={12} sm={12} md={6}>
          <Card>
            <Statistic
              title="总订单数"
              value={stats.totalOrders || 1234}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card>
            <Statistic
              title="待处理订单"
              value={stats.pendingOrders || 45}
              prefix={<HourglassOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card>
            <Statistic
              title="运输中"
              value={stats.inTransitOrders || 120}
              prefix={<TruckOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card>
            <Statistic
              title="已签收"
              value={stats.deliveredOrders || 1050}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={12} sm={12} md={6}>
          <Card>
            <Statistic
              title="今日订单"
              value={stats.todayOrders || 56}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card>
            <Statistic
              title="今日营收"
              value={stats.todayRevenue || 8560}
              precision={2}
              prefix={<DollarOutlined />}
              suffix="元"
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card>
            <Statistic
              title="待处理异常"
              value={stats.pendingExceptions || 5}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card>
            <Statistic
              title="在岗快递员"
              value={stats.activeCouriers || 28}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#2f54eb' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card>
            <ReactECharts option={orderTrendOption} style={{ height: 350 }} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card>
            <ReactECharts option={statusPieOption} style={{ height: 350 }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card>
            <ReactECharts option={revenueBarOption} style={{ height: 350 }} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
