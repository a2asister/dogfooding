import { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Tag } from 'antd';
import { UserOutlined, FileTextOutlined, CalendarOutlined, TrophyOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import request from '../utils/request';

const Dashboard: React.FC = () => {
  const [overview, setOverview] = useState<any>(null);
  const [companyData, setCompanyData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [overviewRes, companyRes] = await Promise.all([
        request.get('/statistics/overview'),
        request.get('/statistics/company-overview'),
      ]);
      if ((overviewRes as any).code === 0) setOverview((overviewRes as any).data);
      if ((companyRes as any).code === 0) setCompanyData((companyRes as any).data);
    } finally {
      setLoading(false);
    }
  };

  const gradeChartOption = {
    tooltip: { trigger: 'item' },
    legend: { bottom: '5%', left: 'center' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      label: { show: false },
      data: overview?.gradeDistribution?.map((g: any) => ({
        value: g.count,
        name: g.gradeName,
        itemStyle: { color: g.color },
      })) || [],
    }],
  };

  const trendChartOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['平均得分', '考核人数'] },
    xAxis: { type: 'category', data: companyData?.monthlyTrend?.map((m: any) => `${m.month}月`) || [] },
    yAxis: [{ type: 'value', name: '得分' }, { type: 'value', name: '人数' }],
    series: [
      {
        name: '平均得分',
        type: 'line',
        smooth: true,
        data: companyData?.monthlyTrend?.map((m: any) => m.avgScore) || [],
      },
      {
        name: '考核人数',
        type: 'bar',
        yAxisIndex: 1,
        data: companyData?.monthlyTrend?.map((m: any) => m.totalCount) || [],
      },
    ],
  };

  const deptColumns = [
    { title: '部门', dataIndex: 'departmentName' },
    { title: '考核人数', dataIndex: 'totalCount' },
    { title: '平均分', dataIndex: 'avgScore', render: (v: number) => v?.toFixed(2) },
  ];

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic
              title="员工总数"
              value={overview?.totalEmployees || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic
              title="考核计划"
              value={overview?.totalPlans || 0}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic
              title="进行中计划"
              value={overview?.activePlans || 0}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic
              title="已完成考核"
              value={overview?.totalResults || 0}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="绩效等级分布" loading={loading}>
            <ReactECharts option={gradeChartOption} style={{ height: 300 }} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="绩效趋势" loading={loading}>
            <ReactECharts option={trendChartOption} style={{ height: 300 }} />
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title="部门绩效排名" loading={loading}>
            <Table
              dataSource={companyData?.departmentStats || []}
              columns={deptColumns}
              rowKey="departmentId"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="等级占比" loading={loading}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {companyData?.gradeDistribution?.map((g: any) => (
                <div key={g.grade} style={{ textAlign: 'center', flex: 1, minWidth: 80 }}>
                  <Tag color={g.color} style={{ fontSize: 14, padding: '4px 12px' }}>
                    {g.gradeName}
                  </Tag>
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontSize: 20, fontWeight: 'bold' }}>{g.count}</div>
                    <div style={{ color: '#999', fontSize: 12 }}>{g.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
