import { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  List,
  Tag,
  Button,
  Spin,
  Modal,
  Form,
  Input,
  Select,
  message,
  Statistic,
} from 'antd';
import { UserOutlined, ClockCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { visitApi, doctorApi } from '@/services/api';
import type { Visit, User } from '@/types';

const statusMap: Record<string, { color: string; text: string }> = {
  waiting: { color: 'gold', text: '待接诊' },
  in_progress: { color: 'processing', text: '接诊中' },
  completed: { color: 'green', text: '已完成' },
  cancelled: { color: 'default', text: '已取消' },
};

export default function Reception() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [walkInModalVisible, setWalkInModalVisible] = useState(false);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [visitRes, doctorRes] = await Promise.all([
        visitApi.getTodayList(),
        doctorApi.getList(),
      ]);
      setVisits(visitRes);
      setDoctors(doctorRes);
    } finally {
      setLoading(false);
    }
  };

  const handleReceive = async (id: number) => {
    try {
      await visitApi.receive(id);
      message.success('接诊成功');
      fetchData();
    } catch {
      // error handled
    }
  };

  const handleFinish = async (id: number) => {
    try {
      await visitApi.finish(id);
      message.success('接诊结束');
      fetchData();
    } catch {
      // error handled
    }
  };

  const handleWalkInSubmit = async (values: {
    patientName: string;
    patientPhone: string;
    doctorId: number;
  }) => {
    try {
      await visitApi.createWalkIn(values);
      message.success('挂号成功');
      setWalkInModalVisible(false);
      form.resetFields();
      fetchData();
    } catch {
      // error handled
    }
  };

  const stats = {
    total: visits.length,
    waiting: visits.filter((v) => v.status === 'waiting').length,
    inProgress: visits.filter((v) => v.status === 'in_progress').length,
    completed: visits.filter((v) => v.status === 'completed').length,
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold m-0">今日接诊看板</h2>
        <Button type="primary" onClick={() => setWalkInModalVisible(true)}>
          现场挂号
        </Button>
      </div>

      <Row gutter={16} className="mb-6">
        <Col xs={12} sm={6}>
          <Card>
            <Statistic title="今日总接诊" value={stats.total} prefix={<UserOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="待接诊"
              value={stats.waiting}
              valueStyle={{ color: '#faad14' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="接诊中"
              value={stats.inProgress}
              valueStyle={{ color: '#1677ff' }}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="已完成"
              value={stats.completed}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card title="接诊列表">
        <List
          dataSource={visits}
          renderItem={(visit) => (
            <List.Item
              key={visit.id}
              actions={[
                visit.status === 'waiting' && (
                  <Button type="primary" onClick={() => handleReceive(visit.id)}>
                    接诊
                  </Button>
                ),
                visit.status === 'in_progress' && (
                  <Button onClick={() => navigate(`/medical/medical-record/${visit.id}`)}>
                    电子病历
                  </Button>
                ),
                visit.status === 'in_progress' && (
                  <Button type="primary" onClick={() => handleFinish(visit.id)}>
                    结束接诊
                  </Button>
                ),
              ].filter(Boolean)}
            >
              <List.Item.Meta
                title={
                  <span>
                    {visit.patient_name}
                    <Tag className="ml-2" color={statusMap[visit.status].color}>
                      {statusMap[visit.status].text}
                    </Tag>
                  </span>
                }
                description={
                  <div>
                    <p className="mb-1">手机号：{visit.patient_phone}</p>
                    <p className="mb-1">
                      医生：{visit.doctor_name} | {visit.department_name}
                    </p>
                    <p className="text-gray-400 text-xs">
                      创建时间：{visit.created_at}
                      {visit.start_time && ` | 接诊时间：${visit.start_time}`}
                    </p>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      <Modal
        title="现场挂号"
        open={walkInModalVisible}
        onCancel={() => setWalkInModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleWalkInSubmit}>
          <Form.Item
            name="patientName"
            label="患者姓名"
            rules={[{ required: true, message: '请输入患者姓名' }]}
          >
            <Input placeholder="请输入患者姓名" />
          </Form.Item>
          <Form.Item
            name="patientPhone"
            label="手机号"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
            ]}
          >
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item
            name="doctorId"
            label="选择医生"
            rules={[{ required: true, message: '请选择医生' }]}
          >
            <Select placeholder="请选择医生">
              {doctors.map((doctor) => (
                <Select.Option key={doctor.id} value={doctor.id}>
                  {doctor.real_name} - {doctor.department_name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              确认挂号
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
