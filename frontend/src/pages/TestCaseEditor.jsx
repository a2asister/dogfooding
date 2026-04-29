import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Form, Input, Select, Button, Space, Divider, List, Tag,
  Modal, Tabs, message, Row, Col, Empty
} from 'antd';
import {
  ArrowLeftOutlined, SaveOutlined, PlusOutlined,
  DeleteOutlined, DragOutlined, CloudOutlined
} from '@ant-design/icons';
import { testCasesApi, projectsApi, environmentsApi } from '../services/api';

const { Option } = Select;
const { TextArea } = Input;

const TestCaseEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [projects, setProjects] = useState([]);
  const [environments, setEnvironments] = useState([]);
  const [steps, setSteps] = useState([]);
  const [assertions, setAssertions] = useState([]);
  const [parameters, setParameters] = useState([]);
  const [stepModalVisible, setStepModalVisible] = useState(false);
  const [editingStep, setEditingStep] = useState(null);
  const [stepForm] = Form.useForm();
  const [assertionModalVisible, setAssertionModalVisible] = useState(false);
  const [editingAssertion, setEditingAssertion] = useState(null);
  const [assertionForm] = Form.useForm();
  const [parameterModalVisible, setParameterModalVisible] = useState(false);
  const [editingParameter, setEditingParameter] = useState(null);
  const [parameterForm] = Form.useForm();

  const isNew = id === 'new';

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [projectsData, environmentsData] = await Promise.all([
        projectsApi.getAll(),
        environmentsApi.getAll()
      ]);
      setProjects(projectsData);
      setEnvironments(environmentsData);

      if (!isNew) {
        const testCase = await testCasesApi.getById(id);
        form.setFieldsValue(testCase);
        setSteps(testCase.steps || []);
        setAssertions(testCase.assertions || []);
        setParameters(testCase.parameters || []);
      }
    } catch (error) {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const values = await form.validateFields();
      
      const data = {
        ...values,
        steps,
        assertions,
        parameters
      };

      if (isNew) {
        await testCasesApi.create(data);
        message.success('创建成功');
      } else {
        await testCasesApi.update(id, data);
        message.success('更新成功');
      }
      
      navigate('/test-cases');
    } catch (error) {
      if (!error.errorFields) {
        message.error(isNew ? '创建失败' : '更新失败');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleAddStep = () => {
    setEditingStep(null);
    stepForm.resetFields();
    stepForm.setFieldsValue({ type: 'api', method: 'GET' });
    setStepModalVisible(true);
  };

  const handleEditStep = (index) => {
    const step = steps[index];
    setEditingStep({ ...step, index });
    stepForm.setFieldsValue(step);
    setStepModalVisible(true);
  };

  const handleDeleteStep = (index) => {
    const newSteps = [...steps];
    newSteps.splice(index, 1);
    setSteps(newSteps);
  };

  const handleSaveStep = async () => {
    try {
      const values = await stepForm.validateFields();
      
      if (editingStep !== null) {
        const newSteps = [...steps];
        newSteps[editingStep.index] = values;
        setSteps(newSteps);
      } else {
        setSteps([...steps, values]);
      }
      
      setStepModalVisible(false);
    } catch (error) {
      // 表单验证错误
    }
  };

  const handleAddAssertion = () => {
    setEditingAssertion(null);
    assertionForm.resetFields();
    assertionForm.setFieldsValue({ type: 'status_code', expected: 200 });
    setAssertionModalVisible(true);
  };

  const handleEditAssertion = (index) => {
    const assertion = assertions[index];
    setEditingAssertion({ ...assertion, index });
    assertionForm.setFieldsValue(assertion);
    setAssertionModalVisible(true);
  };

  const handleDeleteAssertion = (index) => {
    const newAssertions = [...assertions];
    newAssertions.splice(index, 1);
    setAssertions(newAssertions);
  };

  const handleSaveAssertion = async () => {
    try {
      const values = await assertionForm.validateFields();
      
      if (editingAssertion !== null) {
        const newAssertions = [...assertions];
        newAssertions[editingAssertion.index] = values;
        setAssertions(newAssertions);
      } else {
        setAssertions([...assertions, values]);
      }
      
      setAssertionModalVisible(false);
    } catch (error) {
      // 表单验证错误
    }
  };

  const handleAddParameter = () => {
    setEditingParameter(null);
    parameterForm.resetFields();
    setParameterModalVisible(true);
  };

  const handleEditParameter = (index) => {
    const param = parameters[index];
    setEditingParameter({ ...param, index });
    parameterForm.setFieldsValue(param);
    setParameterModalVisible(true);
  };

  const handleDeleteParameter = (index) => {
    const newParams = [...parameters];
    newParams.splice(index, 1);
    setParameters(newParams);
  };

  const handleSaveParameter = async () => {
    try {
      const values = await parameterForm.validateFields();
      
      if (editingParameter !== null) {
        const newParams = [...parameters];
        newParams[editingParameter.index] = values;
        setParameters(newParams);
      } else {
        setParameters([...parameters, values]);
      }
      
      setParameterModalVisible(false);
    } catch (error) {
      // 表单验证错误
    }
  };

  const stepTypeNames = {
    api: '接口请求',
    ui: 'UI操作',
    script: '自定义脚本',
    sleep: '等待'
  };

  const assertionTypeNames = {
    equals: '值相等',
    not_equals: '值不相等',
    contains: '包含',
    status_code: '状态码',
    greater_than: '大于',
    less_than: '小于'
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/test-cases')}>
            返回
          </Button>
          <span style={{ fontSize: 20, fontWeight: 600 }}>
            {isNew ? '新建测试用例' : '编辑测试用例'}
          </span>
        </Space>
      </div>

      <Form form={form} layout="vertical">
        <Tabs
          defaultActiveKey="basic"
          items={[
            {
              key: 'basic',
              label: '基本信息',
              children: (
                <Card>
                  <Row gutter={24}>
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
                        label="用例名称"
                        rules={[{ required: true, message: '请输入用例名称' }]}
                      >
                        <Input placeholder="请输入用例名称" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="type"
                        label="用例类型"
                        initialValue="api"
                      >
                        <Select placeholder="请选择用例类型">
                          <Option value="api">接口测试</Option>
                          <Option value="ui">UI测试</Option>
                          <Option value="script">自定义脚本</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="group"
                        label="用例分组"
                        initialValue="default"
                      >
                        <Input placeholder="请输入分组名称" />
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
                    <Col span={24}>
                      <Form.Item
                        name="description"
                        label="用例描述"
                      >
                        <TextArea rows={3} placeholder="请输入用例描述" />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              )
            },
            {
              key: 'steps',
              label: '测试步骤',
              children: (
                <Card>
                  <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAddStep}>
                      添加步骤
                    </Button>
                  </div>

                  {steps.length > 0 ? (
                    <List
                      dataSource={steps}
                      renderItem={(item, index) => (
                        <List.Item
                          actions={[
                            <a key="edit" onClick={() => handleEditStep(index)}>编辑</a>,
                            <a key="delete" style={{ color: '#ff4d4f' }} onClick={() => handleDeleteStep(index)}>删除</a>
                          ]}
                        >
                          <List.Item.Meta
                            avatar={<Tag color="blue">{index + 1}</Tag>}
                            title={
                              <Space>
                                <span>{item.name || `步骤 ${index + 1}`}</span>
                                <Tag>{stepTypeNames[item.type] || item.type}</Tag>
                              </Space>
                            }
                            description={
                              item.type === 'api' ? `${item.method} ${item.url}` :
                              item.type === 'sleep' ? `等待 ${item.duration} 秒` :
                              null
                            }
                          />
                        </List.Item>
                      )}
                    />
                  ) : (
                    <Empty description="暂无步骤，请点击上方按钮添加" />
                  )}
                </Card>
              )
            },
            {
              key: 'assertions',
              label: '断言配置',
              children: (
                <Card>
                  <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAddAssertion}>
                      添加断言
                    </Button>
                  </div>

                  {assertions.length > 0 ? (
                    <List
                      dataSource={assertions}
                      renderItem={(item, index) => (
                        <List.Item
                          actions={[
                            <a key="edit" onClick={() => handleEditAssertion(index)}>编辑</a>,
                            <a key="delete" style={{ color: '#ff4d4f' }} onClick={() => handleDeleteAssertion(index)}>删除</a>
                          ]}
                        >
                          <List.Item.Meta
                            avatar={<Tag color="purple">{index + 1}</Tag>}
                            title={
                              <Space>
                                <Tag>{assertionTypeNames[item.type] || item.type}</Tag>
                                <span>{item.actual}</span>
                                <span style={{ color: '#8c8c8c' }}>期望: {item.expected}</span>
                              </Space>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  ) : (
                    <Empty description="暂无断言，请点击上方按钮添加" />
                  )}
                </Card>
              )
            },
            {
              key: 'parameters',
              label: '参数配置',
              children: (
                <Card>
                  <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAddParameter}>
                      添加参数
                    </Button>
                  </div>

                  {parameters.length > 0 ? (
                    <List
                      dataSource={parameters}
                      renderItem={(item, index) => (
                        <List.Item
                          actions={[
                            <a key="edit" onClick={() => handleEditParameter(index)}>编辑</a>,
                            <a key="delete" style={{ color: '#ff4d4f' }} onClick={() => handleDeleteParameter(index)}>删除</a>
                          ]}
                        >
                          <List.Item.Meta
                            title={
                              <Space>
                                <Tag color="orange">{item.key}</Tag>
                                <span>{item.name}</span>
                              </Space>
                            }
                            description={`值: ${item.value}`}
                          />
                        </List.Item>
                      )}
                    />
                  ) : (
                    <Empty description="暂无参数，请点击上方按钮添加" />
                  )}
                </Card>
              )
            }
          ]}
        />

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <Space>
            <Button onClick={() => navigate('/test-cases')}>取消</Button>
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} loading={saving}>
              保存
            </Button>
          </Space>
        </div>
      </Form>

      <Modal
        title={editingStep !== null ? '编辑步骤' : '添加步骤'}
        open={stepModalVisible}
        onOk={handleSaveStep}
        onCancel={() => setStepModalVisible(false)}
        okText="确定"
        cancelText="取消"
        width={600}
      >
        <Form form={stepForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="步骤名称"
                rules={[{ required: true, message: '请输入步骤名称' }]}
              >
                <Input placeholder="请输入步骤名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="type"
                label="步骤类型"
                rules={[{ required: true, message: '请选择步骤类型' }]}
              >
                <Select placeholder="请选择步骤类型">
                  <Option value="api">接口请求</Option>
                  <Option value="ui">UI操作</Option>
                  <Option value="script">自定义脚本</Option>
                  <Option value="sleep">等待</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item noStyle shouldUpdate>
            {({ getFieldValue }) => {
              const type = getFieldValue('type');
              if (type === 'api') {
                return (
                  <>
                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item name="method" label="请求方法" initialValue="GET">
                          <Select>
                            <Option value="GET">GET</Option>
                            <Option value="POST">POST</Option>
                            <Option value="PUT">PUT</Option>
                            <Option value="DELETE">DELETE</Option>
                            <Option value="PATCH">PATCH</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={16}>
                        <Form.Item name="url" label="请求URL">
                          <Input placeholder="例如: https://api.example.com/users" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item name="headers" label="请求头 (JSON)">
                      <TextArea rows={3} placeholder='{"Authorization": "Bearer token"}' />
                    </Form.Item>
                    <Form.Item name="body" label="请求体 (JSON)">
                      <TextArea rows={4} placeholder='{"name": "test"}' />
                    </Form.Item>
                  </>
                );
              }
              if (type === 'sleep') {
                return (
                  <Form.Item name="duration" label="等待时间（秒）">
                    <Input type="number" placeholder="请输入等待时间" />
                  </Form.Item>
                );
              }
              if (type === 'script') {
                return (
                  <>
                    <Form.Item name="language" label="脚本语言" initialValue="javascript">
                      <Select>
                        <Option value="javascript">JavaScript</Option>
                        <Option value="python">Python</Option>
                      </Select>
                    </Form.Item>
                    <Form.Item name="script" label="脚本内容">
                      <TextArea rows={8} placeholder="// 输入脚本内容" />
                    </Form.Item>
                  </>
                );
              }
              return null;
            }}
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingAssertion !== null ? '编辑断言' : '添加断言'}
        open={assertionModalVisible}
        onOk={handleSaveAssertion}
        onCancel={() => setAssertionModalVisible(false)}
        okText="确定"
        cancelText="取消"
      >
        <Form form={assertionForm} layout="vertical">
          <Form.Item
            name="type"
            label="断言类型"
            rules={[{ required: true, message: '请选择断言类型' }]}
          >
            <Select placeholder="请选择断言类型">
              <Option value="status_code">状态码</Option>
              <Option value="equals">值相等</Option>
              <Option value="not_equals">值不相等</Option>
              <Option value="contains">包含</Option>
              <Option value="greater_than">大于</Option>
              <Option value="less_than">小于</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="actual"
            label="实际值路径"
            rules={[{ required: true, message: '请输入实际值路径' }]}
            help="例如: step_1_result.status 或 step_1_result.data.id"
          >
            <Input placeholder="请输入实际值路径" />
          </Form.Item>
          <Form.Item
            name="expected"
            label="期望值"
            rules={[{ required: true, message: '请输入期望值' }]}
          >
            <Input placeholder="请输入期望值" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingParameter !== null ? '编辑参数' : '添加参数'}
        open={parameterModalVisible}
        onOk={handleSaveParameter}
        onCancel={() => setParameterModalVisible(false)}
        okText="确定"
        cancelText="取消"
      >
        <Form form={parameterForm} layout="vertical">
          <Form.Item
            name="name"
            label="参数名称"
            rules={[{ required: true, message: '请输入参数名称' }]}
          >
            <Input placeholder="请输入参数名称" />
          </Form.Item>
          <Form.Item
            name="key"
            label="参数键"
            rules={[{ required: true, message: '请输入参数键' }]}
          >
            <Input placeholder="例如: baseUrl" />
          </Form.Item>
          <Form.Item
            name="value"
            label="参数值"
            rules={[{ required: true, message: '请输入参数值' }]}
          >
            <Input placeholder="请输入参数值" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TestCaseEditor;
