import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table, Button, Space, Popconfirm, message, Card, Spin, Tag,
  Progress, Select, Row, Col
} from 'antd';
import {
  EyeOutlined, DeleteOutlined, SearchOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { testRunsApi, projectsApi, tasksApi } from '../services/api';

const { Option } = Select;

const TestRuns = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [testRuns, setTestRuns] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState({
    projectId: undefined,
    status: undefined
  });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [runsData, projectsData, tasksData] = await Promise.all([
        testRunsApi.getAll(filters),
        projectsApi.getAll(),
        tasksApi.getAll()
      ]);
      setTestRuns(runsData);
      setProjects(projectsData);
      setTasks(tasksData);
    } catch (error) {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await testRunsApi.delete(id);
      message.success('删除成功');
      loadData();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const columns = [
    {
      title: '运行ID',
      dataIndex: 'id',
      key: 'id',
      width: 180,
      render: (text) => (
        <a onClick={() => navigate(`/test-runs/${text}`)}>
          <strong>{text.substring(0, 12)}...</strong>
        </a>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const colorMap = {
          completed: 'success',
          failed: 'error',
          running: 'processing',
          pending: 'default'
        };
        const labelMap = {
          completed: '已完成',
          failed: '失败',
          running: '运行中',
          pending: '待执行'
        };
        return <Tag color={colorMap[status] || 'default'}>{labelMap[status] || status}</Tag>;
      }
    },
    {
      title: '执行模式',
      dataIndex: 'mode',
      key: 'mode',
      width: 100,
      render: (mode) => {
        const modeNames = {
          manual: '手动',
          scheduled: '定时',
          ci: 'CI'
        };
        return <Tag>{modeNames[mode] || mode}</Tag>;
      }
    },
    {
      title: '用例数',
      key: 'cases',
      width: 120,
      render: (_, record) => {
        const passed = record.passedCases || 0;
        const total = record.totalCases || 0;
        return (
          <span>
            <Tag color="success">{passed}</Tag>
            <span style={{ color: '#8c8c8c' }}>/</span>
            <Tag>{total}</Tag>
          </span>
        );
      }
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
      render: (ms) => {
        if (!ms) return '-';
        if (ms < 1000) return `${ms}ms`;
        return `${(ms / 1000).toFixed(1)}s`;
      }
    },
    {
      title: '时间',
      dataIndex: 'startedAt',
      key: 'startedAt',
      width: 160,
      render: (time) => dayjs(time).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/test-runs/${record.id}`)}
          >
            查看
          </Button>
          <Popconfirm title="确定要删除这条运行记录吗？" onConfirm={() => handleDelete(record.id)} okText="确定" cancelText="取消">
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-title">测试运行</div>
        <div className="page-description">查看测试运行记录和详细报告</div>
      </div>

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={6}>
              <Select
                placeholder="选择项目"
                style={{ width: '100%' }}
                value={filters.projectId}
                onChange={(value) => setFilters({ ...filters, projectId: value })}
                allowClear
              >
                {projects.map(p => (
                  <Option key={p.id} value={p.id}>{p.name}</Option>
                ))}
              </Select>
            </Col>
            <Col span={6}>
              <Select
                placeholder="状态"
                style={{ width: '100%' }}
                value={filters.status}
                onChange={(value) => setFilters({ ...filters, status: value })}
                allowClear
              >
                <Option value="completed">已完成</Option>
                <Option value="failed">失败</Option>
                <Option value="running">运行中</Option>
              </Select>
            </Col>
          </Row>
        </div>

        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={testRuns}
            rowKey="id"
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条`,
              pageSize: 10
            }}
          />
        </Spin>
      </Card>
    </div>
  );
};

export default TestRuns;
