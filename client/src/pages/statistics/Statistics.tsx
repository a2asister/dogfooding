import { useState, useEffect } from 'react';
import { Row, Col, Card, Select, Table, Button } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import request from '../../utils/request';

const Statistics: React.FC = () => {
  const [overview, setOverview] = useState<any>(null);
  const [companyData, setCompanyData] = useState<any>(null);
  const [deptRanking, setDeptRanking] = useState<any[]>([]);
  const [indicatorData, setIndicatorData] = useState<any[]>([]);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadData();
  }, [year]);

  const loadData = async () => {
    const [overviewRes, companyRes, deptRes, indicatorRes] = await Promise.all([
      request.get('/statistics/overview'),
      request.get('/statistics/company-overview', { params: { year } }),
      request.get('/statistics/department-ranking'),
      request.get('/statistics/indicator-completion'),
    ]);

    if ((overviewRes as any).code === 0) setOverview((overviewRes as any).data);
    if ((companyRes as any).code === 0) setCompanyData((companyRes as any).data);
    if ((deptRes as any).code === 0) setDeptRanking((deptRes as any).data);
    if ((indicatorRes as any).code === 0) setIndicatorData((indicatorRes as any).data);
  };

  const handleExport = async () => {
    const res: any = await request.get('/statistics/charts/export', { params: { type: 'grade_distribution' } });
    console.log('Export data:', res.data);
  };

  const gradeBarOption = {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: companyData?.gradeDistribution?.map((g: any) => g.gradeName) || [] },
    yAxis: { type: 'value', name: '人数' },
    series: [{
      type: 'bar',
      data: companyData?.gradeDistribution?.map((g: any) => ({
        value: g.count,
        itemStyle: { color: g.color },
      })) || [],
      label: { show: true, position: 'top', formatter: '{c}人 ({d}%)' },
    }],
  };

  const deptRadarOption = {
    tooltip: {},
    legend: { data: deptRanking.slice(0, 5).map((d: any) => d.departmentName) },
    radar: {
      indicator: [
        { name: '平均分', max: 100 },
        { name: 'S级率', max: 100 },
        { name: 'A级率', max: 100 },
        { name: '参与率', max: 100 },
      ],
    },
    series: [{
      type: 'radar',
      data: deptRanking.slice(0, 5).map((d: any) => ({
        value: [d.avgScore, d.sCount / d.totalCount * 100, d.aCount / d.totalCount * 100, 100],
        name: d.departmentName,
      })),
    }],
  };

  const indicatorBarOption = {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: indicatorData.map((i: any) => i.indicatorName) },
    yAxis: [{ type: 'value', name: '完成率(%)' }, { type: 'value', name: '数值' }],
    series: [
      {
        name: '完成率',
        type: 'bar',
        data: indicatorData.map((i: any) => i.completionRate),
        label: { show: true, position: 'top', formatter: '{c}%' },
      },
      {
        name: '目标值',
        type: 'line',
        yAxisIndex: 1,
        data: indicatorData.map((i: any) => i.avgTarget),
      },
    ],
  };

  const deptColumns = [
    { title: '排名', dataIndex: 'rank', width: 80 },
    { title: '部门', dataIndex: 'departmentName' },
    { title: '考核人数', dataIndex: 'totalCount' },
    { title: '平均分', dataIndex: 'avgScore', render: (v: number) => v?.toFixed(2) },
    { title: 'S级', dataIndex: 'sCount' },
    { title: 'A级', dataIndex: 'aCount' },
    { title: 'B级', dataIndex: 'bCount' },
    { title: 'C级', dataIndex: 'cCount' },
    { title: 'D级', dataIndex: 'dCount' },
  ];

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>公司绩效大盘</h3>
          <div style={{ display: 'flex', gap: 16 }}>
            <Select
              value={year}
              onChange={setYear}
              style={{ width: 120 }}
            >
              {[2024, 2025, 2026].map((y) => (
                <Select.Option key={y} value={y}>{y}年</Select.Option>
              ))}
            </Select>
            <Button icon={<DownloadOutlined />} onClick={handleExport}>导出图表</Button>
          </div>
        </div>

        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Card title="绩效等级分布" size="small">
              <ReactECharts option={gradeBarOption} style={{ height: 280 }} />
            </Card>
          </Col>
          <Col span={8}>
            <Card title="部门能力雷达图" size="small">
              <ReactECharts option={deptRadarOption} style={{ height: 280 }} />
            </Card>
          </Col>
          <Col span={8}>
            <Card title="指标完成率" size="small">
              <ReactECharts option={indicatorBarOption} style={{ height: 280 }} />
            </Card>
          </Col>
        </Row>
      </Card>

      <Card title="部门绩效排名">
        <Table
          columns={deptColumns}
          dataSource={deptRanking}
          rowKey="departmentId"
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  );
};

export default Statistics;
