import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Statistic, Row, Col, Tag, Table, Descriptions,
  Progress, Tabs, Empty, Spin, Collapse, Space, Button,
  Modal, Form, Input, Select
} from 'antd';
import {
  ArrowLeftOutlined, CheckCircleOutlined, CloseCircleOutlined,
  ClockCircleOutlined, BugOutlined, FileTextOutlined
} from '@ant-design/icons';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import dayjs from 'dayjs';
import { testRunsApi, defectsApi } from '../services/api';

const { Option } = Select;
const { Panel } = Collapse;

const COLORS = ['#52c41a', '#ff4d4f', '#faad14', '#1890ff', '#722ed1'];

const TestRunReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [defectModalVisible, setDefectModalVisible] = useState(false);
  const [selectedCaseResult, setSelectedCaseResult] = useState(null);
  const [defectForm] = Form.useForm();

  useEffect(() => {
    if (id) {
      loadReport();
    }
  }, [id]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const data = await testRunsApi.getReport(id);
      setReport(data);
    } catch (error) {
      console.error('加载报告失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDefect = (caseResult) => {
    setSelectedCaseResult(caseResult);
    defectForm.resetFields();
    defectForm.setFieldsValue({
      title: `[缺陷] ${caseResult.testCaseName} - 执行失败`,
      description: `测试用例: ${caseResult.testCaseName}\n执行结果: 失败\n` +
        (caseResult.stepResults?.length > 0 ? 
          `失败步骤: ${caseResult.stepResults.find(s => !s.success)?.step?.name || '未知'}` : '')
    });
    setDefectModalVisible(true);
  };

  const handleSubmitDefect = async () => {
    try {
      const values = await defectForm.validateFields();
      await defectsApi.create({
        ...values,
        projectId: 'temp',
        testRunId: id,
        caseResultId: selectedCaseResult?.testCaseId,
        status: 'open'
      });
      message.success('创建缺陷成功');
      setDefectModalVisible(false);
    } catch (error) {
      if (!error.errorFields) {
        message.error('创建缺陷失败');
      }
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!report) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Empty description="报告不存在" />
      </div>
    );
  }

  const { summary, cases, logs, problemDistribution } = report;

  const pieData = [
    { name: '通过', value: summary.passed, color: '#52c41a' },
    { name: '失败', value: summary.failed, color: '#ff4d4f' },
    { name: '跳过', value: summary.skipped, color: '#faad14' }
  ].filter(item => item.value > 0);

  const problemData = Object.entries(problemDistribution || {}).map(([name, value]) => ({
    name: getProblemName(name),
    value
  }));

  const caseColumns = [
    {
      title: '测试用例',
      dataIndex: 'testCaseName',
      key: 'testCaseName',
      render: (text) => <strong>{text}</strong>
    },
    {
      title: '状态',
      key: 'status',
      width: 100,
      render: (_, record) => (
        <Tag color={record.passed ? 'success' : 'error'}>
          {record.passed ? '通过' : '失败'}
        </Tag>
      )
    },
    {
      title: '耗时',
      dataIndex: 'duration',
      key: 'duration',
      width: 100,
      render: (ms) => ms ? `${(ms / 1000).toFixed(2)}s` : '-'
    },
    {
      title: '步骤数',
      key: 'steps',
      width: 100,
      render: (_, record) => (
        <span>
          {record.stepResults?.filter(s => s.success).length || 0}/
          {record.stepResults?.length || 0}
        </span>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          {!record.passed && (
            <Button
              type="link"
              size="small"
              icon={<BugOutlined />}
              onClick={() => handleCreateDefect(record)}
            >
              提交缺陷
            </Button>
          )}
        </Space>
      )
    }
  ];

  const expandedRowRender = (record) => (
    <div style={{ padding: 16, background: '#fafafa' }}>
      <h4 style={{ marginBottom: 12 }}>执行步骤:</h4>
      {record.stepResults?.map((step, index) => (
        <div key={index} style={{
          padding: 12,
          marginBottom: 8,
          background: step.success ? '#f6ffed' : '#fff2f0',
          border: `1px solid ${step.success ? '#b7eb8f' : '#ffccc7'}`,
          borderRadius: 4
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>
              <Tag color={step.success ? 'success' : 'error'}>步骤 {index + 1}</Tag>
              <strong>{step.step?.name || '未命名步骤'}</strong>
            </span>
            <span style={{ color: '#8c8c8c' }}>
              耗时: {step.duration}ms
            </span>
          </div>
          {step.logs && (
            <div className="log-panel" style={{ marginTop: 8, maxHeight: 200 }}>
              {step.logs.join('\n')}
            </div>
          )}
          {!step.success && step.error && (
            <div style={{ marginTop: 8, color: '#ff4d4f' }}>
              错误: {step.error}
            </div>
          )}
        </div>
      ))}
      
      {record.assertionResults && record.assertionResults.length > 0 && (
        <>
          <h4 style={{ marginTop: 16, marginBottom: 12 }}>断言结果:</h4>
          {record.assertionResults.map((assertion, index) => (
            <div key={index} style={{
              padding: 8,
              marginBottom: 4,
              background: assertion.passed ? '#f6ffed' : '#fff2f0',
              borderRadius: 4
            }}>
              <Tag color={assertion.passed ? 'success' : 'error'}>
                {assertion.passed ? '通过' : '失败'}
              </Tag>
              <span style={{ marginLeft: 8 }}>{assertion.message}</span>
            </div>
          ))}
        </>
      )}
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/test-runs')}>
            返回
          </Button>
          <span style={{ fontSize: 20, fontWeight: 600 }}>测试报告</span>
          <Tag>{id?.substring(0, 8)}...</Tag>
        </Space>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Row gutter={24}>
          <Col span={6}>
            <Statistic
              title="总用例数"
              value={summary.total}
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="通过"
              value={summary.passed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="失败"
              value={summary.failed}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="通过率"
              value={summary.passRate}
              suffix="%"
              prefix={<ClockCircleOutlined />}
              valueStyle={{
                color: parseFloat(summary.passRate) >= 90 ? '#52c41a' : 
                       parseFloat(summary.passRate) >= 70 ? '#faad14' : '#ff4d4f'
              }}
            />
          </Col>
        </Row>
        <Row gutter={24} style={{ marginTop: 16 }}>
          <Col span={12}>
            <Progress
              percent={parseFloat(summary.passRate)}
              status="active"
              strokeColor={
                parseFloat(summary.passRate) >= 90 ? '#52c41a' :
                parseFloat(summary.passRate) >= 70 ? '#faad14' : '#ff4d4f'
              }
              strokeWidth={20}
            />
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Tag>耗时: {summary.duration ? (summary.duration / 1000).toFixed(2) + 's' : '-'}</Tag>
          </Col>
        </Row>
      </Card>

      <Tabs
        defaultActiveKey="cases"
        items={[
          {
            key: 'cases',
            label: '测试用例',
            children: (
              <Card>
                <Table
                  columns={caseColumns}
                  dataSource={cases}
                  rowKey="testCaseId"
                  expandable={{ expandedRowRender }}
                  pagination={{
                    showSizeChanger: true,
                    showTotal: (total) => `共 ${total} 条`,
                    pageSize: 10
                  }}
                />
              </Card>
            )
          },
          {
            key: 'analysis',
            label: '数据分析',
            children: (
              <Row gutter={16}>
                <Col span={12}>
                  <Card title="用例执行分布">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="问题分布">
                    {problemData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={problemData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="value" fill="#ff4d4f" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <Empty description="暂无问题数据" style={{ padding: 40 }} />
                    )}
                  </Card>
                </Col>
              </Row>
            )
          },
          {
            key: 'logs',
            label: '运行日志',
            children: (
              <Card>
                {logs && logs.length > 0 ? (
                  <div className="log-panel" style={{ maxHeight: 600 }}>
                    {logs.join('\n')}
                  </div>
                ) : (
                  <Empty description="暂无日志" />
                )}
              </Card>
            )
          }
        ]}
      />

      <Modal
        title="创建缺陷"
        open={defectModalVisible}
        onOk={handleSubmitDefect}
        onCancel={() => setDefectModalVisible(false)}
        okText="确定"
        cancelText="取消"
      >
        <Form form={defectForm} layout="vertical">
          <Form.Item
            name="title"
            label="缺陷标题"
            rules={[{ required: true, message: '请输入缺陷标题' }]}
          >
            <Input placeholder="请输入缺陷标题" />
          </Form.Item>
          <Form.Item
            name="severity"
            label="严重程度"
            initialValue="medium"
          >
            <Select>
              <Option value="critical">严重</Option>
              <Option value="high">高</Option>
              <Option value="medium">中</Option>
              <Option value="low">低</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="priority"
            label="优先级"
            initialValue="normal"
          >
            <Select>
              <Option value="high">高</Option>
              <Option value="normal">中</Option>
              <Option value="low">低</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="description"
            label="缺陷描述"
          >
            <Input.TextArea rows={4} placeholder="请输入缺陷描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

function getProblemName(type) {
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
}

export default TestRunReport;
