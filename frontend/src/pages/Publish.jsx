import React, { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Button,
  Tag,
  Modal,
  Form,
  Select,
  Switch,
  Input,
  message,
  Spin,
  Space,
  Divider,
  Descriptions,
  Alert,
  Timeline,
  Badge,
  Row,
  Col,
  Statistic
} from 'antd';
import {
  RocketOutlined,
  ClockCircleOutlined,
  HistoryOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  SyncOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import useSiteStore from '../stores/siteStore';
import { publishApi, contentApi } from '../services/api';

const { Option } = Select;
const { TextArea } = Input;

function Publish() {
  const { currentSite } = useSiteStore();
  const [loading, setLoading] = useState(false);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [schedule, setSchedule] = useState({
    autoPublish: false,
    publishSchedule: null,
    publishType: 'incremental'
  });
  const [publishing, setPublishing] = useState(false);
  const [publishedContents, setPublishedContents] = useState([]);
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [form] = Form.useForm();

  const cronPresets = [
    { label: '每小时', value: '0 * * * *' },
    { label: '每天凌晨 2 点', value: '0 2 * * *' },
    { label: '每天凌晨 4 点', value: '0 4 * * *' },
    { label: '每周一凌晨 2 点', value: '0 2 * * 1' },
    { label: '每 6 小时', value: '0 */6 * * *' },
  ];

  useEffect(() => {
    if (currentSite) {
      loadSchedule();
      loadLogs();
      loadPublishedContents();
    }
  }, [currentSite]);

  const loadSchedule = async () => {
    try {
      const response = await publishApi.getSchedule(currentSite.id);
      if (response.success) {
        setSchedule(response.data);
      }
    } catch (error) {
      console.error('加载定时发布设置失败:', error);
    }
  };

  const loadLogs = async () => {
    setLogsLoading(true);
    try {
      const response = await publishApi.getLogs(currentSite.id, { limit: 20 });
      if (response.success) {
        setLogs(response.data.items || []);
      }
    } catch (error) {
      console.error('加载发布日志失败:', error);
    } finally {
      setLogsLoading(false);
    }
  };

  const loadPublishedContents = async () => {
    try {
      const response = await contentApi.getAll(currentSite.id, { limit: 100 });
      if (response.success) {
        const contents = response.data?.items || response.data || [];
        setPublishedContents(contents.filter(c => c.status === 'published'));
      }
    } catch (error) {
      console.error('加载内容列表失败:', error);
    }
  };

  const handlePublish = async (type) => {
    setPublishing(true);
    try {
      const response = await publishApi.publish(currentSite.id, { type });
      if (response.success) {
        message.success(`发布成功！已发布 ${response.data.publishedCount} 条内容`);
        loadLogs();
        loadPublishedContents();
      }
    } catch (error) {
      message.error(error.response?.data?.error || '发布失败');
    } finally {
      setPublishing(false);
    }
  };

  const handleSaveSchedule = async () => {
    try {
      const values = await form.validateFields();
      const response = await publishApi.setSchedule(currentSite.id, {
        enabled: values.autoPublish,
        cronExpression: values.publishSchedule,
        type: values.publishType
      });
      if (response.success) {
        message.success('定时发布设置已保存');
        setSchedule(response.data);
        setScheduleModalVisible(false);
      }
    } catch (error) {
      message.error(error.response?.data?.error || '保存失败');
    }
  };

  const openScheduleModal = () => {
    form.setFieldsValue({
      autoPublish: schedule.autoPublish,
      publishSchedule: schedule.publishSchedule || '0 2 * * *',
      publishType: schedule.publishType || 'incremental'
    });
    setScheduleModalVisible(true);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'processing':
        return <LoadingOutlined style={{ color: '#1890ff' }} />;
      case 'failed':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  const getStatusTag = (status) => {
    const colors = {
      completed: 'success',
      processing: 'processing',
      failed: 'error',
      pending: 'default'
    };
    const labels = {
      completed: '已完成',
      processing: '处理中',
      failed: '失败',
      pending: '等待中'
    };
    return <Tag color={colors[status] || 'default'}>{labels[status] || status}</Tag>;
  };

  const logColumns = [
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <Space>
          {getStatusIcon(status)}
          {getStatusTag(status)}
        </Space>
      )
    },
    {
      title: '发布类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type) => (
        <Tag color={type === 'full' ? 'purple' : 'blue'}>
          {type === 'full' ? '全量发布' : '增量发布'}
        </Tag>
      )
    },
    {
      title: '内容数量',
      dataIndex: 'contentCount',
      key: 'contentCount',
      width: 100,
      render: (count) => <strong>{count}</strong>
    },
    {
      title: '触发时间',
      dataIndex: 'triggeredAt',
      key: 'triggeredAt',
      render: (time) => dayjs(time).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: '完成时间',
      dataIndex: 'completedAt',
      key: 'completedAt',
      render: (time) => time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-'
    }
  ];

  return (
    <Spin spinning={loading}>
      <div>
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>发布管理</h1>
            <p style={{ color: '#6b7280', margin: 0 }}>
              管理内容发布、定时任务和发布历史
            </p>
          </div>
          <Button
            type="primary"
            icon={<SettingOutlined />}
            onClick={openScheduleModal}
          >
            定时设置
          </Button>
        </div>

        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={8} lg={8}>
            <Card className="stats-card" bordered={false} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <Statistic
                title={<span style={{ color: '#fff' }}>待发布内容</span>}
                value={publishedContents.length}
                prefix={<RocketOutlined style={{ color: '#fff' }} />}
                valueStyle={{ color: '#fff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={8}>
            <Card className="stats-card" bordered={false} style={{ background: schedule.autoPublish ? 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' : 'linear-gradient(135deg, #f3f4f6 0%, #d1d5db 100%)' }}>
              <Statistic
                title={<span style={{ color: schedule.autoPublish ? '#fff' : '#6b7280' }}>自动发布</span>}
                value={schedule.autoPublish ? '已开启' : '已关闭'}
                prefix={<ClockCircleOutlined style={{ color: schedule.autoPublish ? '#fff' : '#6b7280' }} />}
                valueStyle={{ color: schedule.autoPublish ? '#fff' : '#6b7280', fontSize: 20 }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={8}>
            <Card className="stats-card" bordered={false} style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
              <Statistic
                title={<span style={{ color: '#fff' }}>发布次数</span>}
                value={logs.filter(l => l.status === 'completed').length}
                prefix={<HistoryOutlined style={{ color: '#fff' }} />}
                valueStyle={{ color: '#fff' }}
              />
            </Card>
          </Col>
        </Row>

        <Card title="快速发布" className="form-card" style={{ marginBottom: 24 }}>
          {schedule.autoPublish && (
            <Alert
              message="定时发布已开启"
              description={`当前定时任务：${schedule.publishSchedule || '未配置'}`}
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={12} lg={12}>
              <Card
                hoverable
                className="form-card"
                style={{ 
                  cursor: 'pointer',
                  background: 'linear-gradient(135deg, #f0f5ff 0%, #e6f7ff 100%)',
                  borderColor: '#adc6ff'
                }}
              >
                <div style={{ textAlign: 'center', padding: '24px 16px' }}>
                  <RocketOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
                  <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>增量发布</h3>
                  <p style={{ color: '#6b7280', marginBottom: 16, fontSize: 14 }}>
                    只发布最近更新的内容，速度更快
                  </p>
                  <Button
                    type="primary"
                    icon={publishing ? <LoadingOutlined /> : <SyncOutlined spin={publishing} />}
                    onClick={() => handlePublish('incremental')}
                    loading={publishing}
                    size="large"
                  >
                    {publishing ? '发布中...' : '开始增量发布'}
                  </Button>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={12} lg={12}>
              <Card
                hoverable
                className="form-card"
                style={{ 
                  cursor: 'pointer',
                  background: 'linear-gradient(135deg, #fff7e6 0%, #fff1f0 100%)',
                  borderColor: '#ffd591'
                }}
              >
                <div style={{ textAlign: 'center', padding: '24px 16px' }}>
                  <RocketOutlined style={{ fontSize: 48, color: '#fa8c16', marginBottom: 16 }} />
                  <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>全量发布</h3>
                  <p style={{ color: '#6b7280', marginBottom: 16, fontSize: 14 }}>
                    重新发布所有已发布内容，较慢但更完整
                  </p>
                  <Button
                    icon={publishing ? <LoadingOutlined /> : <SyncOutlined spin={publishing} />}
                    onClick={() => handlePublish('full')}
                    loading={publishing}
                    size="large"
                  >
                    {publishing ? '发布中...' : '开始全量发布'}
                  </Button>
                </div>
              </Card>
            </Col>
          </Row>
        </Card>

        <Card title="发布日志" className="form-card">
          <Spin spinning={logsLoading}>
            {logs.length > 0 ? (
              <Table
                columns={logColumns}
                dataSource={logs}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `共 ${total} 条记录`
                }}
                className="table-container"
              />
            ) : (
              <div style={{ textAlign: 'center', padding: 60 }}>
                <HistoryOutlined style={{ fontSize: 64, color: '#d1d5db', marginBottom: 16 }} />
                <p style={{ color: '#6b7280', marginBottom: 16 }}>暂无发布日志</p>
                <Button type="primary" icon={<RocketOutlined />} onClick={() => handlePublish('incremental')}>
                  执行第一次发布
                </Button>
              </div>
            )}
          </Spin>
        </Card>

        <Modal
          title="定时发布设置"
          open={scheduleModalVisible}
          onOk={handleSaveSchedule}
          onCancel={() => setScheduleModalVisible(false)}
          okText="保存"
          cancelText="取消"
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            className="modal-content"
          >
            <Form.Item
              name="autoPublish"
              label="开启自动发布"
              valuePropName="checked"
            >
              <Switch
                checkedChildren="开启"
                unCheckedChildren="关闭"
              />
            </Form.Item>

            <Form.Item
              name="publishSchedule"
              label="定时表达式 (Cron)"
              rules={[{ required: true, message: '请选择或输入定时表达式' }]}
            >
              <Select
                size="large"
                placeholder="选择定时任务"
                allowClear
                dropdownRender={(menu) => (
                  <>
                    {menu}
                    <Divider style={{ margin: '8px 0' }} />
                    <div style={{ padding: '0 8px 8px' }}>
                      <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>
                        提示：Cron 表达式格式：分 时 日 月 周
                      </p>
                    </div>
                  </>
                )}
              >
                {cronPresets.map(preset => (
                  <Option key={preset.value} value={preset.value}>
                    {preset.label} ({preset.value})
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="publishType"
              label="发布类型"
              rules={[{ required: true, message: '请选择发布类型' }]}
            >
              <Select size="large">
                <Option value="incremental">增量发布（只发布更新内容）</Option>
                <Option value="full">全量发布（发布所有内容）</Option>
              </Select>
            </Form.Item>

            <Alert
              message="Cron 表达式说明"
              description={
                <div>
                  <p style={{ marginBottom: 8 }}><code>分 时 日 月 周</code></p>
                  <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>
                    例如：<code>0 2 * * *</code> 表示每天凌晨 2 点执行
                  </p>
                </div>
              }
              type="info"
              showIcon
            />
          </Form>
        </Modal>
      </div>
    </Spin>
  );
}

export default Publish;
