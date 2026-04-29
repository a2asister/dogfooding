import React, { useState, useEffect } from 'react';
import {
  Table, Button, Space, Popconfirm, message, Card, Spin, Tag,
  Modal, Form, Input, Select, Row, Col, Switch, InputNumber
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, PlayCircleOutlined,
  ClockCircleOutlined, CloudOutlined, SettingOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { tasksApi, projectsApi, testSuitesApi, testCasesApi, environmentsApi } from '../services/api';

const { Option } = Select;
const { TextArea } = Input;

const Tasks = () => {
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [testSuites, setTestSuites] = useState([]);
  const [testCases, setTestCases] = useState([]);
  const [environments, setEnvironments] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [runningTaskId, setRunningTaskId] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tasksData, projectsData, suitesData, casesData, envsData] = await Promise.all([
        tasksApi.getAll(),
        projectsApi.getAll(),
        testSuitesApi.getAll(),
        testCasesApi.getAll(),
        environmentsApi.getAll()
      ]);
      setTasks(tasksData);
      setProjects(projectsData);
      setTestSuites(suitesData);
      setTestCases(casesData);
      setEnvironments(envsData);
    } catch (error) {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingTask(null);
    form.resetFields();
    form.setFieldsValue({ mode: 'manual', status: 'idle' });
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingTask(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await tasksApi.delete(id);
      message.success('删除成功');
      loadData();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleRun = async (task) => {
    setRunningTaskId(task.id);
    try {
      await tasksApi.run(task.id);
      message.success('任务已启动');
      loadData();
    } catch (error) {
      message.error('启动任务失败');
    } finally {
      setRunningTaskId(null);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingTask) {
        await tasksApi.update(editingTask.id, values);
        message.success('更新成功');
      } else {
        await tasksApi.create(values);
        message.success('创建成功');
      }

      setModalVisible(false);
      loadData();
    } catch (error) {
      if (!error.errorFields) {
        message.error(editingTask ? '更新失败' : '创建失败');
      }
    }
  };

  const modeConfig = {
    manual: { icon: <PlayCircleOutlined />, color: 'blue', label: '手动' },
    scheduled: { icon: <ClockCircleOutlined />, color: 'orange', label: '定时' },
    ci: { icon: <CloudOutlined />, color: 'purple', label: 'CI' }
  };

  const columns = [
    {
      title: '任务名称',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <strong>{text}</strong>
    },
    {
      title: '执行模式',
      dataIndex: 'mode',
      key: 'mode',
      width: 100,
      render: (mode) => {
        const config = modeConfig[mode] || {};
        return (
          <Tag color={config.color}>
            {config.icon} {config.label || mode}
          </Tag>
        );
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const colorMap = {
          active: 'green',
          idle: 'default',
          paused: 'orange',
          stopped: 'red'
        };
        const labelMap = {
          active: '运行中',
          idle: '空闲',
          paused: '暂停',
          stopped: '已停止'
        };
        return <Tag color={colorMap[status] || 'default'}>{labelMap[status] || status}</Tag>;
      }
    },
    {
      title: 'Cron表达式',
      dataIndex: 'cronExpression',
      key: 'cronExpression',
      width: 150,
      render: (text) => text || '-'
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (time) => dayjs(time).format('YYYY-MM-DD HH:mm')
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<PlayCircleOutlined />}
            onClick={() => handleRun(record)}
            loading={runningTaskId === record.id}
          >
            执行
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定要删除这个任务吗？" onConfirm={() => handleDelete(record.id)} okText="确定" cancelText="取消">
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
        <div className="page-title">任务调度</div>
        <div className="page-description">管理测试任务，支持手动、定时、CI三种执行模式</div>
      </div>

      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新建任务
          </Button>
        </div>

        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={tasks}
            rowKey="id"
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条`
            }}
          />
        </Spin>
      </Card>

      <Modal
        title={editingTask ? '编辑任务' : '新建任务'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText="确定"
        cancelText="取消"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="projectId"
                label="所属项目"
                rules={[{ required: true, message: '请选择项目' }]}
              >
                <Select placeholder="请选择项目">
                  {projects.map(p => (
                    <Option key={p.id} value={p.id}>{p.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="name"
                label="任务名称"
                rules={[{ required: true, message: '请输入任务名称' }]}
              >
                <Input placeholder="请输入任务名称" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="mode"
                label="执行模式"
                initialValue="manual"
              >
                <Select placeholder="请选择执行模式">
                  <Option value="manual">手动执行</Option>
                  <Option value="scheduled">定时执行</Option>
                  <Option value="ci">CI 触发</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="environmentId"
                label="测试环境"
              >
                <Select placeholder="请选择测试环境" allowClear>
                  {environments.map(e => (
                    <Option key={e.id} value={e.id}>{e.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item noStyle shouldUpdate>
            {({ getFieldValue }) => {
              const mode = getFieldValue('mode');
              if (mode === 'scheduled') {
                return (
                  <Form.Item
                    name="cronExpression"
                    label="Cron 表达式"
                    rules={[{ required: true, message: '请输入 Cron 表达式' }]}
                    help="例如: 0 0 * * * (每天零点执行) 或 */5 * * * * (每5分钟执行)"
                  >
                    <Input placeholder="请输入 Cron 表达式" />
                  </Form.Item>
                );
              }
              return null;
            }}
          </Form.Item>

          <Form.Item
            label="选择测试套件"
            name="testSuiteIds"
          >
            <Select
              mode="multiple"
              placeholder="请选择测试套件（可选）"
              allowClear
            >
              {testSuites.map(s => (
                <Option key={s.id} value={s.id}>{s.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="选择测试用例"
            name="testCaseIds"
          >
            <Select
              mode="multiple"
              placeholder="请选择测试用例（可选）"
              allowClear
              showSearch
              optionFilterProp="children"
            >
              {testCases.map(tc => (
                <Option key={tc.id} value={tc.id}>{tc.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="任务描述"
          >
            <TextArea rows={3} placeholder="请输入任务描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Tasks;
