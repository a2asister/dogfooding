import React, { useState, useEffect } from 'react';
import {
  Table, Button, Space, Popconfirm, message, Card, Spin, Tag,
  Modal, Form, Input, Select, Row, Col, Transfer
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FolderOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { testSuitesApi, projectsApi, testCasesApi } from '../services/api';

const { Option } = Select;

const TestSuites = () => {
  const [loading, setLoading] = useState(false);
  const [testSuites, setTestSuites] = useState([]);
  const [projects, setProjects] = useState([]);
  const [testCases, setTestCases] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSuite, setEditingSuite] = useState(null);
  const [selectedTestCaseIds, setSelectedTestCaseIds] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [suitesData, projectsData, casesData] = await Promise.all([
        testSuitesApi.getAll(),
        projectsApi.getAll(),
        testCasesApi.getAll()
      ]);
      setTestSuites(suitesData);
      setProjects(projectsData);
      setTestCases(casesData);
    } catch (error) {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingSuite(null);
    form.resetFields();
    setSelectedTestCaseIds([]);
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingSuite(record);
    form.setFieldsValue(record);
    setSelectedTestCaseIds(record.testCaseIds || []);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await testSuitesApi.delete(id);
      message.success('删除成功');
      loadData();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data = {
        ...values,
        testCaseIds: selectedTestCaseIds
      };

      if (editingSuite) {
        await testSuitesApi.update(editingSuite.id, data);
        message.success('更新成功');
      } else {
        await testSuitesApi.create(data);
        message.success('创建成功');
      }

      setModalVisible(false);
      loadData();
    } catch (error) {
      if (!error.errorFields) {
        message.error(editingSuite ? '更新失败' : '创建失败');
      }
    }
  };

  const columns = [
    {
      title: '套件名称',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <strong>{text}</strong>
    },
    {
      title: '项目',
      dataIndex: 'projectId',
      key: 'projectId',
      render: (projectId) => {
        const project = projects.find(p => p.id === projectId);
        return project ? <Tag color="blue">{project.name}</Tag> : '-';
      }
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: '用例数',
      key: 'testCaseCount',
      render: (_, record) => (
        <Tag color="purple">{(record.testCaseIds || []).length} 个用例</Tag>
      )
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
      width: 150,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定要删除这个测试套件吗？" onConfirm={() => handleDelete(record.id)} okText="确定" cancelText="取消">
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  const transferDataSource = testCases.map(tc => ({
    key: tc.id,
    title: tc.name,
    description: `类型: ${tc.type} | 分组: ${tc.group || 'default'}`
  }));

  return (
    <div>
      <div className="page-header">
        <div className="page-title">测试套件</div>
        <div className="page-description">管理测试用例集合，支持批量执行</div>
      </div>

      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新建测试套件
          </Button>
        </div>

        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={testSuites}
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
        title={editingSuite ? '编辑测试套件' : '新建测试套件'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText="确定"
        cancelText="取消"
        width={800}
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
                label="套件名称"
                rules={[{ required: true, message: '请输入套件名称' }]}
              >
                <Input placeholder="请输入套件名称" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="description"
            label="套件描述"
          >
            <Input.TextArea rows={2} placeholder="请输入套件描述" />
          </Form.Item>
          <Form.Item
            label="选择测试用例"
          >
            <Transfer
              dataSource={transferDataSource}
              targetKeys={selectedTestCaseIds}
              onChange={setSelectedTestCaseIds}
              showSearch
              listStyle={{ width: 300, height: 300 }}
              render={item => (
                <div>
                  <div style={{ fontWeight: 500 }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: '#8c8c8c' }}>{item.description}</div>
                </div>
              )}
              titles={['可选用例', '已选用例']}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TestSuites;
