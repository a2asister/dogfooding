import { useEffect } from 'react';
import { Card, Typography, Row, Col, Statistic, Table, Tag, Space, Button, Modal, Form, Input, Select, DatePicker, message } from 'antd';
import {
  TeamOutlined,
  CalendarOutlined,
  FileTextOutlined,
  MedicineBoxOutlined,
  ExperimentOutlined,
  ScanOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useHospitalStore } from '../../stores/hospitalStore';
import { usePatientStore } from '../../stores/patientStore';
import { useCommonStore } from '../../stores/commonStore';
import type { ColumnsType } from 'antd/es/table';
import type { Patient, Appointment, MedicalRecord, Prescription, LabTestOrder, ImagingOrder, Admission } from '../../types';

const { Title, Text } = Typography;

export default function MedicalDashboard() {
  const { doctors, departments, loadAll: loadHospital } = useHospitalStore();
  const { patients, appointments, medicalRecords, prescriptions, loadAll: loadPatient } = usePatientStore();
  const { labTestOrders, imagingOrders, admissions, loadAll: loadCommon } = useCommonStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadHospital();
    loadPatient();
    loadCommon();
  }, [loadHospital, loadPatient, loadCommon]);

  const todayAppointments = appointments.filter((a) => {
    const today = new Date().toISOString().split('T')[0];
    return a.appointmentDate === today;
  }).length;

  const pendingLabTests = labTestOrders.filter((o) => o.status === 'pending').length;
  const pendingImaging = imagingOrders.filter((o) => o.status === 'pending').length;
  const activeAdmissions = admissions.filter((a) => a.status === 'admitted').length;

  const recentPatients = [...patients].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const patientColumns: ColumnsType<Patient> = [
    {
      title: '患者姓名',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
      render: (gender: string) => (
        <Tag color={gender === 'male' ? 'blue' : 'pink'}>
          {gender === 'male' ? '男' : '女'}
        </Tag>
      ),
    },
    {
      title: '电话',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '建档时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
  ];

  const handleAddPatient = () => {
    form.validateFields().then((values) => {
      usePatientStore.getState().addPatient(values);
      message.success('患者建档成功');
      setModalVisible(false);
      form.resetFields();
    });
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          医护工作台
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
          患者建档
        </Button>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="今日预约"
              value={todayAppointments}
              prefix={<CalendarOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="待处理检验"
              value={pendingLabTests}
              prefix={<ExperimentOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="待处理检查"
              value={pendingImaging}
              prefix={<ScanOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="在院患者"
              value={activeAdmissions}
              prefix={<TeamOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="最近患者列表">
            <Table
              columns={patientColumns}
              dataSource={recentPatients.slice(0, 5)}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="快速统计">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>患者总数</Text>
                <Text strong>{patients.length} 人</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>医生总数</Text>
                <Text strong>{doctors.length} 人</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>病历总数</Text>
                <Text strong>{medicalRecords.length} 份</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>处方总数</Text>
                <Text strong>{prescriptions.length} 张</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>科室数量</Text>
                <Text strong>{departments.length} 个</Text>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <Modal
        title="患者建档"
        open={modalVisible}
        onOk={handleAddPatient}
        onCancel={() => setModalVisible(false)}
        okText="确认建档"
        cancelText="取消"
        width={700}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item
            name="name"
            label="患者姓名"
            rules={[{ required: true, message: '请输入患者姓名' }]}
          >
            <Input placeholder="请输入患者姓名" />
          </Form.Item>
          <Form.Item
            name="gender"
            label="性别"
            rules={[{ required: true, message: '请选择性别' }]}
          >
            <Select placeholder="请选择性别">
              <Select.Option value="male">男</Select.Option>
              <Select.Option value="female">女</Select.Option>
              <Select.Option value="unknown">未知</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="birthDate"
            label="出生日期"
            rules={[{ required: true, message: '请选择出生日期' }]}
          >
            <DatePicker style={{ width: '100%' }} placeholder="请选择出生日期" />
          </Form.Item>
          <Form.Item
            name="idCard"
            label="身份证号"
            rules={[{ required: true, message: '请输入身份证号' }]}
          >
            <Input placeholder="请输入身份证号" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="联系电话"
            rules={[{ required: true, message: '请输入联系电话' }]}
          >
            <Input placeholder="请输入联系电话" />
          </Form.Item>
          <Form.Item name="address" label="家庭住址">
            <Input placeholder="请输入家庭住址" />
          </Form.Item>
          <Form.Item name="bloodType" label="血型">
            <Select placeholder="请选择血型" allowClear>
              <Select.Option value="A+">A+</Select.Option>
              <Select.Option value="A-">A-</Select.Option>
              <Select.Option value="B+">B+</Select.Option>
              <Select.Option value="B-">B-</Select.Option>
              <Select.Option value="AB+">AB+</Select.Option>
              <Select.Option value="AB-">AB-</Select.Option>
              <Select.Option value="O+">O+</Select.Option>
              <Select.Option value="O-">O-</Select.Option>
              <Select.Option value="未知">未知</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="emergencyContact" label="紧急联系人">
            <Input placeholder="请输入紧急联系人" />
          </Form.Item>
          <Form.Item name="emergencyPhone" label="紧急联系电话">
            <Input placeholder="请输入紧急联系电话" />
          </Form.Item>
          <Form.Item name="medicalHistory" label="既往病史">
            <Input.TextArea placeholder="请输入既往病史" rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
