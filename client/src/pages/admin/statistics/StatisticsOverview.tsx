import { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Button,
  Tag,
  Spin,
  message,
} from 'antd';
import {
  TeamOutlined,
  BookOutlined,
  UserOutlined,
  CalendarOutlined,
  ExportOutlined,
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { statisticApi } from '@/services';
import type { OverviewStats, CategoryStats, SelectionTrend } from '@/services/statistic';

const StatisticsOverview: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [trendData, setTrendData] = useState<SelectionTrend[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [overviewRes, categoryRes, trendRes] = await Promise.all([
        statisticApi.getOverview(),
        statisticApi.getCategoryStats(),
        statisticApi.getSelectionTrend(undefined),
      ]);

      if (overviewRes.success) {
        setOverview(overviewRes.data || null);
      }
      if (categoryRes.success) {
        setCategoryStats(categoryRes.data || []);
      }
      if (trendRes.success) {
        setTrendData(trendRes.data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExportSelectionSummary = () => {
    statisticApi.exportSelectionSummary(undefined);
    message.success('开始导出选课汇总数据...');
  };

  const handleExportCourseStats = () => {
    statisticApi.exportCourseStats();
    message.success('开始导出课程统计数据...');
  };

  const categoryBarChartOption = {
    title: {
      text: '各分类选课人数统计',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: categoryStats.map((c) => c.name),
      axisLabel: {
        rotate: 30,
      },
    },
    yAxis: {
      type: 'value',
      name: '选课人数',
    },
    series: [
      {
        name: '选课人数',
        type: 'bar',
        data: categoryStats.map((c) => c.totalSelections),
        itemStyle: {
          color: '#1890ff',
        },
      },
      {
        name: '课程数量',
        type: 'bar',
        data: categoryStats.map((c) => c.courseCount),
        itemStyle: {
          color: '#52c41a',
        },
      },
    ],
    legend: {
      data: ['选课人数', '课程数量'],
      top: 30,
    },
  };

  const trendLineChartOption = {
    title: {
      text: '选课人数趋势',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: trendData.map((t) => t.date),
    },
    yAxis: {
      type: 'value',
      name: '选课人数',
    },
    series: [
      {
        name: '当日选课人数',
        type: 'line',
        smooth: true,
        data: trendData.map((t) => t.count),
        areaStyle: {
          color: 'rgba(24, 144, 255, 0.3)',
        },
        itemStyle: {
          color: '#1890ff',
        },
      },
    ],
  };

  const categoryColumns = [
    {
      title: '分类名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '分类编码',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: '课程数量',
      dataIndex: 'courseCount',
      key: 'courseCount',
      render: (count: number) => (
        <Tag color="blue">{count}</Tag>
      ),
    },
    {
      title: '选课人数',
      dataIndex: 'totalSelections',
      key: 'totalSelections',
      render: (count: number) => (
        <Tag color="green">{count}</Tag>
      ),
    },
  ];

  return (
    <div className="page-container">
      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="学生总数"
                value={overview?.totalStudents || 0}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="教师总数"
                value={overview?.totalTeachers || 0}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="课程总数"
                value={overview?.totalCourses || 0}
                prefix={<BookOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="进行中批次"
                value={overview?.activeBatches || 0}
                prefix={<CalendarOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24} lg={12}>
            <Card
              title="选课趋势"
              extra={
                <Button icon={<ExportOutlined />} onClick={handleExportSelectionSummary}>
                  导出数据
                </Button>
              }
            >
              <ReactECharts option={trendLineChartOption} style={{ height: 300 }} />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card
              title="课程分类统计"
              extra={
                <Button icon={<ExportOutlined />} onClick={handleExportCourseStats}>
                  导出数据
                </Button>
              }
            >
              <ReactECharts option={categoryBarChartOption} style={{ height: 300 }} />
            </Card>
          </Col>
        </Row>

        <Card title="分类选课详情" style={{ marginTop: 16 }}>
          <Table
            columns={categoryColumns}
            dataSource={categoryStats}
            rowKey="id"
            pagination={false}
          />
        </Card>
      </Spin>
    </div>
  );
};

export default StatisticsOverview;
