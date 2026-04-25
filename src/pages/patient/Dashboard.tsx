import { useEffect, useMemo } from 'react';
import { Card, Typography, Row, Col, Statistic, Table, Tag, Space } from 'antd';
import {
  CalendarOutlined,
  FileTextOutlined,
  ShoppingOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { usePatientStore } from '../../stores/patientStore';
import { useCommonStore } from '../../stores/commonStore';
import { useAuthStore } from '../../stores/authStore';
import { useHospitalStore } from '../../stores/hospitalStore';
import type { ColumnsType } from 'antd/es/table';
import type { Appointment, MedicalRecord, Order } from '../../types';

const { Title } = Typography;

const appointmentStatusLabels: Record<string, string> = {
  pending: '待确认',
  confirmed: '已确认',
  completed: '已完成',
  cancelled: '已取消',
};

const appointmentStatusColors: Record<string, string> = {
  pending: 'orange',
  confirmed: 'blue',
  completed: 'green',
  cancelled: 'default',
};

const orderStatusLabels: Record<string, string> = {
  pending: '待支付',
  paid: '已支付',
  cancelled: '已取消',
  refunded: '已退款',
};

const orderStatusColors: Record<string, string> = {
  pending: 'orange',
  paid: 'green',
  cancelled: 'default',
  refunded: 'red',
};

export default function PatientDashboard() {
  const { currentUser } = useAuthStore();
  const { appointments, medicalRecords, patients, loadAll: loadPatient } = usePatientStore();
  const { orders, loadAll: loadCommon } = useCommonStore();
  const { doctors, departments, loadAll: loadHospital } = useHospitalStore();

  useEffect(() => {
    loadPatient();
    loadCommon();
    loadHospital();
  }, [loadPatient, loadCommon, loadHospital]);

  const currentPatient = useMemo(() => {
    return patients.find((p) => p.userId === currentUser?.id);
  }, [patients, currentUser]);

  const myAppointments = useMemo(() => {
    if (!currentPatient) return [];
    return appointments
      .filter((a) => a.patientId === currentPatient.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [appointments, currentPatient]);

  const myRecords = useMemo(() => {
    if (!currentPatient) return [];
    return medicalRecords
      .filter((r) => r.patientId === currentPatient.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [medicalRecords, currentPatient]);

  const myOrders = useMemo(() => {
    if (!currentPatient) return [];
    return orders
      .filter((o) => o.patientId === currentPatient.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, currentPatient]);

  const getDoctorName = (doctorId: string) => {
    const doc = doctors.find((d) => d.id === doctorId);
    const user = useHospitalStore
      .getState()
      .medicalStaff.find((u) => u.id === doc?.userId);
    return user?.name || '-';
  };

  const getDepartmentName = (deptId: string) => {
    const dept = departments.find((d) => d.id === deptId);
    return dept?.name || '-';
  };

  const appointmentColumns: ColumnsType<Appointment> = [
    {
      title: '预约日期',
      dataIndex: 'appointmentDate',
      key: 'appointmentDate',
    },
    {
      title: '时间段',
      dataIndex: 'timeSlot',
      key: 'timeSlot',
    },
    {
      title: '科室',
      dataIndex: 'departmentId',
      key: 'departmentId',
      render: (deptId) => getDepartmentName(deptId),
    },
    {
      title: '医生',
      dataIndex: 'doctorId',
      key: 'doctorId',
      render: (docId) => getDoctorName(docId),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={appointmentStatusColors[status]}>{appointmentStatusLabels[status]}</Tag>
      ),
    },
  ];

  const recordColumns: ColumnsType<MedicalRecord> = [
    {
      title: '医生',
      dataIndex: 'doctorId',
      key: 'doctorId',
      render: (docId) => getDoctorName(docId),
    },
    {
      title: '主诉',
      dataIndex: 'chiefComplaint',
      key: 'chiefComplaint',
      ellipsis: true,
    },
    {
      title: '诊断',
      dataIndex: 'diagnosis',
      key: 'diagnosis',
      ellipsis: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
  ];

  const orderColumns: ColumnsType<Order> = [
    {
      title: '订单类型',
      dataIndex: 'orderType',
      key: 'orderType',
      render: (type) => {
        const labels: Record<string, string> = {
          outpatient: '门诊',
          inpatient: '住院',
          pharmacy: '药房',
          lab: '检验',
          imaging: '检查',
        };
        return <Tag>{labels[type]}</Tag>;
      },
    },
    {
      title: '总金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => <span style={{ color: '#fa8c16' }}>¥{amount.toFixed(2)}</span>,
    },
    {
      title: '支付金额',
      dataIndex: 'paidAmount',
      key: 'paidAmount',
      render: (amount) => (
        <span style={{ color: '#52c41a' }}>{amount !== undefined ? `¥${amount.toFixed(2)}` : '-'}</span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={orderStatusColors[status]}>{orderStatusLabels[status]}</Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
  ];

  return (
    <div>
      <Title level={3} style={{ marginBottom: 16 }}>
        患者服务中心
      </Title>

      {currentPatient && (
        <Card style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Statistic
                title="患者姓名"
                value={currentPatient.name}
                prefix={<UserOutlined />}
              />
            </Col>
            <Col xs={24} sm={12}>
              <Statistic
                title="联系电话"
                value={currentPatient.phone}
              />
            </Col>
            <Col xs={24} sm={12}>
              <Statistic
                title="性别"
                value={currentPatient.gender === 'male' ? '男' : currentPatient.gender === 'female' ? '女' : '未知'}
              />
            </Col>
            <Col xs={24} sm={12}>
              <Statistic
                title="血型"
                value={currentPatient.bloodType || '未知'}
              />
            </Col>
          </Row>
        </Card>
      )}

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="我的预约"
              value={myAppointments.length}
              prefix={<CalendarOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="我的病历"
              value={myRecords.length}
              prefix={<FileTextOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="我的订单"
              value={myOrders.length}
              prefix={<ShoppingOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="待支付订单"
              value={myOrders.filter((o) => o.status === 'pending').length}
              prefix={<ShoppingOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="最近预约" style={{ marginBottom: 16 }}>
        {myAppointments.length > 0 ? (
          <Table
            columns={appointmentColumns}
            dataSource={myAppointments.slice(0, 5)}
            rowKey="id"
            size="middle"
            pagination={false}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
            暂无预约记录
          </div>
        )}
      </Card>

      <Card title="最近病历" style={{ marginBottom: 16 }}>
        {myRecords.length > 0 ? (
          <Table
            columns={recordColumns}
            dataSource={myRecords.slice(0, 5)}
            rowKey="id"
            size="middle"
            pagination={false}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
            暂无病历记录
          </div>
        )}
      </Card>

      <Card title="最近订单">
        {myOrders.length > 0 ? (
          <Table
            columns={orderColumns}
            dataSource={myOrders.slice(0, 5)}
            rowKey="id"
            size="middle"
            pagination={false}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
            暂无订单记录
          </div>
        )}
      </Card>
    </div>
  );
}
