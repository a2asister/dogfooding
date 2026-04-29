import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table, Button, Space, Popconfirm, message, Card, Spin, Tag, Select, Input, Row, Col, Badge
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, CopyOutlined,
  PlayCircleOutlined, SearchOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { testCasesApi, projectsApi } from '../services/api';

const { Option } = Select;

const TestCases = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [testCases, setTestCases] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filters, setFilters] = useState({
    projectId: undefined,
    type: undefined,
    group: undefined
  });
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [casesData, projectsData] = await Promise.all([
        testCasesApi.getAll(filters),
        projectsApi.getAll()
      ]);
      setTestCases(casesData);
      setProjects(projectsData);
    } catch (error) {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record) => {
    navigate(`/test-cases/${record.id}`);
  };

  const handleDelete = async (id) => {
    try {
      await testCasesApi.delete(id);
      message.success('删除成功');
      loadData();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleClone = async (record) => {
    try {
      await testCasesApi.clone(record.id);
      message.success('克隆成功');
      loadData();
    } catch (error) {
      message.error('克隆失败');
    }
  };

  const typeColors = {
    api: 'blue',
    ui: 'purple',
    script: 'orange'
  };

  const typeNames = {
    api: '接口测试',
    ui: 'UI测试',
    script: '自定义脚本'
  };

  const filteredCases = testCases.filter(tc => {
    if (!searchText) return true;
    const searchLower = searchText.toLowerCase();
    return (
      tc.name?.toLowerCase().includes(searchLower) ||
      tc.description?.toLowerCase().includes(searchLower)
    );
  });

  const columns = [
    {
      title: '用例名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <a onClick={() => handleEdit(record)}><strong>{text}</strong></a>
      )
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type) => (
        <Tag color={typeColors[type] || 'default'}>
          {typeNames[type] || type}
        </Tag>
      )
    },
    {
      title: '分组',
      dataIndex: 'group',
      key: 'group',
      width: 120
    },
    {
      title: '版本',
      dataIndex: 'version',
      key: 'version',
      width: 80,
      render: (v) => <Badge count={`v${v}`} showZero style={{ backgroundColor: '#1890ff' }} />
    },
    {
      title: '步骤数',
      key: 'steps',
      width: 80,
      render: (_, record) => (record.steps || []).length
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (time) => dayjs(time).format('YYYY-MM-DD HH:mm')
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 160,
      render: (time) => dayjs(time).format('YYYY-MM-DD HH:mm')
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" size="small" icon={<CopyOutlined />} onClick={() => handleClone(record)}>
            克隆
          </Button>
          <Popconfirm title="确定要删除这个用例吗？" onConfirm={() => handleDelete(record.id)} okText="确定" cancelText="取消">
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
        <div className="page-title">测试用例</div>
        <div className="page-description">管理接口、UI、自定义脚本等类型的自动化测试用例</div>
      </div>

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col span={6}>
              <Input
                placeholder="搜索用例名称或描述"
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col>
            <Col span={4}>
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
            <Col span={4}>
              <Select
                placeholder="用例类型"
                style={{ width: '100%' }}
                value={filters.type}
                onChange={(value) => setFilters({ ...filters, type: value })}
                allowClear
              >
                <Option value="api">接口测试</Option>
                <Option value="ui">UI测试</Option>
                <Option value="script">自定义脚本</Option>
              </Select>
            </Col>
            <Col span={4}>
              <Select
                placeholder="用例分组"
                style={{ width: '100%' }}
                value={filters.group}
                onChange={(value) => setFilters({ ...filters, group: value })}
                allowClear
              >
                {[...new Set(testCases.map(tc => tc.group).filter(Boolean))].map(g => (
                  <Option key={g} value={g}>{g}</Option>
                ))}
              </Select>
            </Col>
            <Col span={6} style={{ textAlign: 'right' }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/test-cases/new')}>
                新建用例
              </Button>
            </Col>
          </Row>
        </div>

        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={filteredCases}
            rowKey="id"
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条`
            }}
          />
        </Spin>
      </Card>
    </div>
  );
};

export default TestCases;
