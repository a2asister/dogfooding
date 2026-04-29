import React, { useState, useEffect } from 'react';
import {
  Row, Col, Card, Statistic, Table, Tag, Progress, Empty, Spin
} from 'antd';
import {
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  RocketOutlined
} from '@ant-design/icons';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import dayjs from 'dayjs';
import { testRunsApi, testCasesApi, tasksApi, projectsApi } from '../services/api';

const COLORS = ['#52c41a', '#ff4d4f', '#faad14', '#1890ff', '#722ed1', '#eb2f96'];

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalCases: 0,
    totalRuns: 0,
    totalProjects: 0,
    totalTasks: 0,
    passRate: 0,
    recentRuns: []
  });

  const [trendData, setTrendData] = useState([]);
  const [problemData, setProblemData] = useState([]);
  const [caseTypeData, setCaseTypeData] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [testCases, testRuns, projects, tasks] = await Promise.all([
        testCasesApi.getAll(),
        testRunsApi.getAll({ limit: 20 }),
        projectsApi.getAll(),
        tasksApi.getAll()
      ]);

      const passedCases = testRuns.reduce((sum, run) => sum + (run.passedCases || 0), 0);
      const totalCasesRun = testRuns.reduce((sum, run) => sum + (run.totalCases || 0), 0);
      const passRate = totalCasesRun > 0 ? Math.round((passedCases / totalCasesRun) * 100) : 0;

      setStats({
        totalCases: testCases.length,
        totalRuns: testRuns.length,
        totalProjects: projects.length,
        totalTasks: tasks.length,
        passRate,
        recentRuns: testRuns.slice(0, 10)
      });

      const trend = generateTrendData(testRuns);
      setTrendData(trend);

      const problems = analyzeProblems(testRuns);
      setProblemData(problems);

      const caseTypes = analyzeCaseTypes(testCases);
      setCaseTypeData(caseTypes);

    } catch (error) {
      console.error('加载仪表盘数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateTrendData = (runs) => {
    const days = 7;
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = dayjs().subtract(i, 'day').format('MM-DD');
      const dayRuns = runs.filter(r => 
        dayjs(r.startedAt).isSame(dayjs().subtract(i, 'day'), 'day')
      );
      const total = dayRuns.reduce((s, r) => s + (r.totalCases || 0), 0);
      const passed = dayRuns.reduce((s, r) => s + (r.passedCases || 0), 0);
      const failed = dayRuns.reduce((s, r) => s + (r.failedCases || 0), 0);
      
      data.push({
        date,
        total,
        passed,
        failed,
        passRate: total > 0 ? Math.round((passed / total) * 100) : 0
      });
    }
    return data;
  };

  const analyzeProblems = (runs) => {
    const distribution = {};
    runs.forEach(run => {
      if (run.problemDistribution) {
        Object.entries(run.problemDistribution).forEach(([key, value]) => {
          distribution[key] = (distribution[key] || 0) + value;
        });
      }
    });
    
    return Object.entries(distribution).map(([name, value]) => ({
      name: getProblemName(name),
      value
    }));
  };

  const getProblemName = (type) => {
    const names = {
      'assertion_failed': '断言失败',
      'server_error': '服务端错误',
      'client_error': '客户端错误',
      'network': '网络错误',
      'timeout': '超时',
      'execution_error': '执行错误',
      'unknown': '未知错误'
    };
    return names[type] || type;
  };

  const analyzeCaseTypes = (cases) => {
    const types = {};
    cases.forEach(c => {
      const type = c.type || 'api';
      types[type] = (types[type] || 0) + 1;
    });
    
    const typeNames = {
      'api': '接口测试',
      'ui': 'UI测试',
      'script': '自定义脚本'
    };
    
    return Object.entries(types).map(([type, value]) => ({
      name: typeNames[type] || type,
      value
    }));
  };

  const columns = [
    {
      title: '运行ID',
      dataIndex: 'id',
      key: 'id',
      width: 150,
      render: (text) => text.substring(0, 8) + '...'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const color = status === 'completed' ? 'green' : status === 'failed' ? 'red' : 'orange';
        return <Tag color={color}>{status === 'completed' ? '已完成' : status === 'failed' ? '失败' : '运行中'}</Tag>;
      }
    },
    {
      title: '用例数',
      key: 'cases',
      width: 120,
      render: (_, record) => `${record.passedCases || 0}/${record.totalCases || 0}`
    },
    {
      title: '通过率',
      key: 'passRate',
      width: 150,
      render: (_, record) => {
        const rate = record.passRate || 0;
        const color = rate >= 90 ? '#52c41a' : rate >= 70 ? '#faad14' : '#ff4d4f';
        return <Progress percent={rate} size="small" strokeColor={color} />;
      }
    },
    {
      title: '耗时',
      dataIndex: 'duration',
      key: 'duration',
      width: 100,
      render: (ms) => ms ? `${(ms / 1000).toFixed(1)}s` : '-'
    },
    {
      title: '时间',
      dataIndex: 'startedAt',
      key: 'startedAt',
      render: (time) => dayjs(time).format('MM-DD HH:mm')
    }
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-title">仪表盘</div>
        <div className="page-description">查看测试平台整体概览和运行趋势</div>
      </div>

      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Card>
              <Statistic
                title="测试用例总数"
                value={stats.totalCases}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="测试运行次数"
                value={stats.totalRuns}
                prefix={<RocketOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="项目数量"
                value={stats.totalProjects}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#13c2c2' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="平均通过率"
                value={stats.passRate}
                suffix="%"
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: stats.passRate >= 80 ? '#52c41a' : '#ff4d4f' }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={16}>
            <Card title="运行趋势" className="card-section">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="passed" stroke="#52c41a" name="通过" />
                  <Line type="monotone" dataKey="failed" stroke="#ff4d4f" name="失败" />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col span={8}>
            <Card title="用例类型分布" className="card-section">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={caseTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {caseTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={8}>
            <Card title="问题分布" className="card-section">
              {problemData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={problemData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#ff4d4f" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Empty description="暂无问题数据" style={{ padding: '40px 0' }} />
              )}
            </Card>
          </Col>
          <Col span={16}>
            <Card title="最近运行" className="card-section">
              {stats.recentRuns.length > 0 ? (
                <Table
                  columns={columns}
                  dataSource={stats.recentRuns}
                  rowKey="id"
                  size="small"
                  pagination={false}
                />
              ) : (
                <Empty description="暂无运行记录" style={{ padding: '40px 0' }} />
              )}
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default Dashboard;
