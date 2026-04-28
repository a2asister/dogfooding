import React, { useState } from 'react';
import { Row, Col, Card, Tabs, Select, DatePicker, Space } from 'antd';
import ReactECharts from 'echarts-for-react';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

const Reports: React.FC = () => {
  const [dateRange, setDateRange] = useState<string[]>([
    dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
    dayjs().format('YYYY-MM-DD')
  ]);
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day');

  const orderTrendOption = {
    title: {
      text: '订单趋势分析',
      left: 'center',
      textStyle: { fontSize: 16 }
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['下单数', '签收数', '取消数'],
      bottom: 10
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['1日', '5日', '10日', '15日', '20日', '25日', '30日']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '下单数',
        type: 'line',
        smooth: true,
        stack: 'Total',
        data: [120, 132, 150, 234, 290, 330, 410],
        itemStyle: { color: '#1890ff' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
              { offset: 1, color: 'rgba(24, 144, 255, 0.05)' }
            ]
          }
        }
      },
      {
        name: '签收数',
        type: 'line',
        smooth: true,
        stack: 'Total',
        data: [100, 115, 130, 210, 265, 300, 380],
        itemStyle: { color: '#52c41a' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(82, 196, 26, 0.3)' },
              { offset: 1, color: 'rgba(82, 196, 26, 0.05)' }
            ]
          }
        }
      },
      {
        name: '取消数',
        type: 'line',
        smooth: true,
        stack: 'Total',
        data: [8, 12, 10, 15, 12, 18, 10],
        itemStyle: { color: '#ff4d4f' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(255, 77, 79, 0.3)' },
              { offset: 1, color: 'rgba(255, 77, 79, 0.05)' }
            ]
          }
        }
      }
    ]
  };

  const waybillStatusOption = {
    title: {
      text: '运单状态分布',
      left: 'center',
      textStyle: { fontSize: 16 }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'center'
    },
    series: [
      {
        name: '运单状态',
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
          { value: 156, name: '待揽收', itemStyle: { color: '#faad14' } },
          { value: 320, name: '运输中', itemStyle: { color: '#1890ff' } },
          { value: 85, name: '派送中', itemStyle: { color: '#13c2c2' } },
          { value: 480, name: '已签收', itemStyle: { color: '#52c41a' } },
          { value: 12, name: '异常件', itemStyle: { color: '#ff4d4f' } },
          { value: 25, name: '退回', itemStyle: { color: '#722ed1' } }
        ]
      }
    ]
  };

  const revenueOption = {
    title: {
      text: '营收统计',
      left: 'center',
      textStyle: { fontSize: 16 }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['运费收入', '增值服务', '其他收入'],
      bottom: 10
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
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
        name: '运费收入',
        type: 'bar',
        stack: 'total',
        emphasis: {
          focus: 'series'
        },
        data: [28500, 32000, 36800, 42500, 48200, 55600],
        itemStyle: { color: '#1890ff' }
      },
      {
        name: '增值服务',
        type: 'bar',
        stack: 'total',
        emphasis: {
          focus: 'series'
        },
        data: [8200, 9500, 11200, 13800, 16500, 19200],
        itemStyle: { color: '#52c41a' }
      },
      {
        name: '其他收入',
        type: 'bar',
        stack: 'total',
        emphasis: {
          focus: 'series'
        },
        data: [3500, 4200, 5100, 6200, 7500, 8800],
        itemStyle: { color: '#722ed1' }
      }
    ]
  };

  const exceptionOption = {
    title: {
      text: '异常件类型分布',
      left: 'center',
      textStyle: { fontSize: 16 }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    series: [
      {
        name: '异常类型',
        type: 'pie',
        radius: '60%',
        data: [
          { value: 35, name: '地址错误', itemStyle: { color: '#1890ff' } },
          { value: 25, name: '联系失败', itemStyle: { color: '#52c41a' } },
          { value: 20, name: '包裹破损', itemStyle: { color: '#faad14' } },
          { value: 15, name: '客户拒收', itemStyle: { color: '#ff4d4f' } },
          { value: 5, name: '其他', itemStyle: { color: '#722ed1' } }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };

  const branchPerformanceOption = {
    title: {
      text: '网点业绩排名',
      left: 'center',
      textStyle: { fontSize: 16 }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value'
    },
    yAxis: {
      type: 'category',
      data: ['龙华网点', '福田网点', '南山网点', '宝安网点', '罗湖网点', '龙岗网点']
    },
    series: [
      {
        name: '完成订单数',
        type: 'bar',
        data: [1256, 1180, 1050, 980, 860, 750],
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            colorStops: [
              { offset: 0, color: '#1890ff' },
              { offset: 1, color: '#52c41a' }
            ]
          }
        }
      }
    ]
  };

  const deliveryOption = {
    title: {
      text: '派送时效分析',
      left: 'center',
      textStyle: { fontSize: 16 }
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['平均时效（小时）', '准时率（%）'],
      bottom: 10
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    },
    yAxis: [
      {
        type: 'value',
        name: '时效（小时）',
        position: 'left'
      },
      {
        type: 'value',
        name: '准时率（%）',
        position: 'right',
        max: 100
      }
    ],
    series: [
      {
        name: '平均时效（小时）',
        type: 'bar',
        data: [24, 22, 26, 23, 25, 28, 30],
        itemStyle: { color: '#1890ff' },
        yAxisIndex: 0
      },
      {
        name: '准时率（%）',
        type: 'line',
        smooth: true,
        data: [92, 95, 90, 94, 91, 88, 85],
        itemStyle: { color: '#52c41a' },
        yAxisIndex: 1
      }
    ]
  };

  const returnStatsOption = {
    title: {
      text: '退换货统计',
      left: 'center',
      textStyle: { fontSize: 16 }
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['申请数', '完成数', '驳回数'],
      bottom: 10
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '申请数',
        type: 'line',
        smooth: true,
        data: [45, 52, 48, 56, 62, 58],
        itemStyle: { color: '#1890ff' }
      },
      {
        name: '完成数',
        type: 'line',
        smooth: true,
        data: [38, 45, 42, 48, 55, 50],
        itemStyle: { color: '#52c41a' }
      },
      {
        name: '驳回数',
        type: 'line',
        smooth: true,
        data: [5, 4, 3, 6, 5, 6],
        itemStyle: { color: '#ff4d4f' }
      }
    ]
  };

  const tabItems = [
    {
      key: 'overview',
      label: '综合概览',
      children: (
        <>
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={16}>
              <Card>
                <ReactECharts option={orderTrendOption} style={{ height: 400 }} />
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card>
                <ReactECharts option={waybillStatusOption} style={{ height: 400 }} />
              </Card>
            </Col>
          </Row>
          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24}>
              <Card>
                <ReactECharts option={revenueOption} style={{ height: 400 }} />
              </Card>
            </Col>
          </Row>
        </>
      )
    },
    {
      key: 'operation',
      label: '运营分析',
      children: (
        <>
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card>
                <ReactECharts option={branchPerformanceOption} style={{ height: 400 }} />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card>
                <ReactECharts option={deliveryOption} style={{ height: 400 }} />
              </Card>
            </Col>
          </Row>
        </>
      )
    },
    {
      key: 'exception',
      label: '异常分析',
      children: (
        <>
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card>
                <ReactECharts option={exceptionOption} style={{ height: 400 }} />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card>
                <ReactECharts option={returnStatsOption} style={{ height: 400 }} />
              </Card>
            </Col>
          </Row>
        </>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2>运营报表</h2>
        <Space>
          <Select 
            value={period} 
            onChange={(value) => setPeriod(value)}
            style={{ width: 120 }}
          >
            <Option value="day">按日</Option>
            <Option value="week">按周</Option>
            <Option value="month">按月</Option>
          </Select>
          <RangePicker
            value={[dayjs(dateRange[0]), dayjs(dateRange[1])]}
            onChange={(dates) => {
              if (dates && dates[0] && dates[1]) {
                setDateRange([dates[0].format('YYYY-MM-DD'), dates[1].format('YYYY-MM-DD')]);
              }
            }}
          />
        </Space>
      </div>

      <Tabs defaultActiveKey="overview" items={tabItems} />
    </div>
  );
};

export default Reports;
