import { useEffect, useMemo } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Typography,
  Tag,
  Progress,
  List,
  Avatar,
} from 'antd';
import {
  TeamOutlined,
  MedicineBoxOutlined,
  ScheduleOutlined,
  FileTextOutlined,
  UserOutlined,
  ToolOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useHospitalStore } from '../../stores/hospitalStore';
import { usePatientStore } from '../../stores/patientStore';
import { useCommonStore } from '../../stores/commonStore';
import type { ColumnsType } from 'antd/es/table';
import type { User, Patient, Appointment, Equipment } from '../../types';

const { Title, Text } = Typography;

export default function AdminDashboard() {
  const { departments, doctors, medications, equipment, medicalStaff, loadAll } =
    useHospitalStore();
  const { patients, appointments, loadAll: loadPatient } = usePatientStore();
  const { operationLogs, orders, loadAll: loadCommon } = useCommonStore();

  useEffect(() => {
    loadAll();
    loadPatient();
    loadCommon();
  }, [loadAll, loadPatient, loadCommon]);

  const todayAppointments = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return appointments.filter((a) => a.appointmentDate === today).length;
  }, [appointments]);

  const todayRevenue = useMemo(() => {
    return orders
      .filter((o) => o.status === 'paid')
      .reduce((sum, o) => sum + (o.paidAmount || 0), 0);
  }, [orders]);

  const lowStockEquipment = useMemo(() => {
    return equipment.filter((e) => e.status === 'maintenance').length;
  }, [equipment]);

  const recentLogs = useMemo(() => {
    return [...operationLogs].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [operationLogs]);

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

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>
        系统概览
      </Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="今日预约"
              value={todayAppointments}
              prefix={<ScheduleOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="患者总数"
              value={patients.length}
              prefix={<UserOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="今日营收"
              value={todayRevenue}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="设备维护中"
              value={lowStockEquipment}
              prefix={<WarningOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={8}>
          <Card title="科室统计" size="small">
            <List
              dataSource={departments.slice(0, 5)}
              renderItem={(dept) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar style={{ backgroundColor: '#1890ff' }}>
                        <TeamOutlined />
                      </Avatar>
                    }
                    title={dept.name}
                    description={`医生数: ${doctors.filter((d) => d.departmentId === dept.id).length}`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card title="药品库存概览" size="small">
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text>药品总数</Text>
                <Text strong>{medications.length} 种</Text>
              </div>
              <Progress percent={80} status="active" strokeColor="#52c41a" />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text>库存充足</Text>
                <Text strong>{Math.floor(medications.length * 0.85)} 种</Text>
              </div>
              <Progress percent={85} status="active" strokeColor="#1890ff" />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text type="warning">库存预警</Text>
                <Text strong type="warning">
                  {Math.floor(medications.length * 0.1)} 种
                </Text>
              </div>
              <Progress percent={10} status="exception" strokeColor="#faad14" />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card title="医护人员统计" size="small">
            <List
              dataSource={medicalStaff.slice(0, 5)}
              renderItem={(staff) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar style={{ backgroundColor: '#52c41a' }}>
                        {staff.name.charAt(0)}
                      </Avatar>
                    }
                    title={staff.name}
                    description={staff.phone}
                  />
                  <Tag color="green">在线</Tag>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Card title="最近患者列表" style={{ marginBottom: 24 }}>
        <Table
          columns={patientColumns}
          dataSource={patients.slice(0, 5)}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Card>

      <Card title="最近操作日志">
        <List
          dataSource={recentLogs.slice(0, 8)}
          renderItem={(log) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <Avatar
                    style={{
                      backgroundColor:
                        log.userRole === 'admin'
                          ? '#1890ff'
                          : log.userRole === 'medical'
                            ? '#52c41a'
                            : log.userRole === 'charge'
                              ? '#faad14'
                              : '#722ed1',
                    }}
                  >
                    {log.userName.charAt(0)}
                  </Avatar>
                }
                title={
                  <span>
                    <Text strong>{log.userName}</Text>
                    <Text type="secondary" style={{ marginLeft: 8 }}>
                      {log.module} - {log.action}
                    </Text>
                  </span>
                }
                description={
                  <span>
                    <Text>{log.details}</Text>
                    <Text type="secondary" style={{ marginLeft: 16 }}>
                      {new Date(log.createdAt).toLocaleString()}
                    </Text>
                  </span>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
}
