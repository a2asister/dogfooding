import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Typography,
  message,
  Switch,
  Row,
  Col,
  Space,
  Divider,
} from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { microAppRegistry } from '@/services/microAppRegistry';
import {
  DEFAULT_APP,
  APP_CATEGORIES,
  APP_STATUS_LABELS,
  DEFAULT_SANDBOX_CONFIG,
  validateAppName,
} from '@/shared';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface FormValues {
  name: string;
  displayName: string;
  description: string;
  icon: string;
  category: string;
  author: string;
  status: typeof DEFAULT_APP.status;
  sandboxEnabled: boolean;
  strictStyleIsolation: boolean;
  experimentalStyleIsolation: boolean;
}

const AppCreate: React.FC = () => {
  const [form] = Form.useForm<FormValues>();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const initialValues: FormValues = {
    name: '',
    displayName: '',
    description: '',
    icon: 'AppstoreOutlined',
    category: 'other',
    author: '',
    status: 'developing',
    sandboxEnabled: DEFAULT_SANDBOX_CONFIG.enabled,
    strictStyleIsolation: DEFAULT_SANDBOX_CONFIG.strictStyleIsolation,
    experimentalStyleIsolation: DEFAULT_SANDBOX_CONFIG.experimentalStyleIsolation,
  };

  const handleSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      microAppRegistry.registerApp({
        name: values.name,
        displayName: values.displayName,
        description: values.description,
        icon: values.icon,
        category: values.category,
        author: values.author,
        status: values.status,
        currentVersion: '',
        versions: [],
        routes: [],
        sandboxConfig: {
          enabled: values.sandboxEnabled,
          strictStyleIsolation: values.strictStyleIsolation,
          experimentalStyleIsolation: values.experimentalStyleIsolation,
          props: {},
        },
      });

      message.success('应用创建成功');
      navigate('/app-manage');
    } catch (error) {
      message.error('创建失败，请重试');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const validateName = (_: unknown, value: string) => {
    if (!value) {
      return Promise.reject(new Error('请输入应用名称'));
    }
    if (!validateAppName(value)) {
      return Promise.reject(new Error('应用名称必须以字母开头，只包含字母、数字和连字符'));
    }
    if (microAppRegistry.getAppByName(value)) {
      return Promise.reject(new Error('应用名称已存在'));
    }
    return Promise.resolve();
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 24,
          paddingBottom: 16,
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/app-manage')}
          style={{ width: 36, height: 36 }}
        />
        <div>
          <Title level={4} style={{ margin: 0, fontWeight: 600 }}>
            新建应用
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            创建一个新的微应用并进行基础配置
          </Text>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Row gutter={[24, 0]}>
          <Col xs={24} lg={16}>
            <Card
              title={
                <span style={{ fontWeight: 600 }}>
                  基本信息
                </span>
              }
              bordered={false}
              style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)', marginBottom: 24 }}
            >
              <Row gutter={[16, 0]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="name"
                    label="应用标识"
                    rules={[{ required: true }, { validator: validateName }]}
                    help="唯一标识，用于路由注册，创建后不可修改"
                    extra={
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        示例: user-center, dashboard
                      </Text>
                    }
                  >
                    <Input
                      placeholder="请输入应用标识"
                      prefix={
                        <Text type="secondary" style={{ marginRight: 4 }}>
                          /
                        </Text>
                      }
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="displayName"
                    label="显示名称"
                    rules={[{ required: true, message: '请输入显示名称' }]}
                    help="用户可见的应用名称"
                  >
                    <Input placeholder="请输入显示名称" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="description"
                label="应用描述"
                rules={[{ required: true, message: '请输入应用描述' }]}
              >
                <TextArea
                  placeholder="请输入应用描述"
                  rows={4}
                  showCount
                  maxLength={500}
                />
              </Form.Item>

              <Row gutter={[16, 0]}>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="category"
                    label="应用分类"
                    rules={[{ required: true, message: '请选择应用分类' }]}
                  >
                    <Select placeholder="请选择分类">
                      {APP_CATEGORIES.map((category) => (
                        <Option key={category.value} value={category.value}>
                          {category.label}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} md={8}>
                  <Form.Item
                    name="author"
                    label="开发团队"
                    rules={[{ required: true, message: '请输入开发团队' }]}
                  >
                    <Input placeholder="请输入开发团队" />
                  </Form.Item>
                </Col>

                <Col xs={24} md={8}>
                  <Form.Item
                    name="status"
                    label="应用状态"
                    rules={[{ required: true, message: '请选择应用状态' }]}
                  >
                    <Select placeholder="请选择状态">
                      {Object.entries(APP_STATUS_LABELS).map(([key, label]) => (
                        <Option key={key} value={key}>
                          {label}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card
              title={
                <span style={{ fontWeight: 600 }}>
                  沙箱配置
                </span>
              }
              bordered={false}
              style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)', marginBottom: 24 }}
            >
              <div className="sandbox-config-panel">
                <Form.Item
                  name="sandboxEnabled"
                  label="启用沙箱"
                  valuePropName="checked"
                >
                  <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                </Form.Item>

                <Form.Item
                  name="strictStyleIsolation"
                  label="严格样式隔离"
                  valuePropName="checked"
                  help="使用Shadow DOM进行样式隔离，兼容性较差"
                >
                  <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                </Form.Item>

                <Form.Item
                  name="experimentalStyleIsolation"
                  label="实验性样式隔离"
                  valuePropName="checked"
                  help="通过动态添加前缀的方式进行样式隔离"
                >
                  <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                </Form.Item>

                <Divider style={{ margin: '16px 0' }} />

                <div style={{ fontSize: 12, color: '#666', lineHeight: 1.8 }}>
                  <Text strong>沙箱说明：</Text>
                  <ul style={{ marginTop: 8, paddingLeft: 16 }}>
                    <li>沙箱用于隔离子应用的JavaScript全局变量</li>
                    <li>严格样式隔离使用Shadow DOM，可能影响第三方库</li>
                    <li>实验性样式隔离通过CSS前缀实现，兼容性更好</li>
                    <li>建议生产环境启用沙箱以保证应用隔离</li>
                  </ul>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        <Card
          bordered={false}
          style={{
            borderRadius: 8,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
            background: '#fafafa',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 12,
            }}
          >
            <Button
              size="large"
              onClick={() => navigate('/app-manage')}
              style={{ height: 40, borderRadius: 6, padding: '0 24px' }}
            >
              取消
            </Button>
            <Button
              type="primary"
              size="large"
              htmlType="submit"
              loading={loading}
              icon={<SaveOutlined />}
              style={{ height: 40, borderRadius: 6, padding: '0 24px' }}
            >
              创建应用
            </Button>
          </div>
        </Card>
      </Form>
    </div>
  );
};

export default AppCreate;
