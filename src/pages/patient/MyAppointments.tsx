import { useEffect, useMemo, useState } from 'react';
import {
  Card,
  Typography,
  Table,
  Tag,
  Space,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Popconfirm,
} from 'antd';
import { PlusOutlined, CloseOutlined } from '@ant-design/icons';
import { usePatientStore } from '../../stores/patientStore';
import { useHospitalStore } from '../../stores/hospitalStore';
import { useAuthStore } from '../../stores/authStore';
import type { ColumnsType } from 'antd/es/table';
import type { Appointment } from '../../types';
import dayjs from 'dayjs';

const { Title } = Typography;

const statusLabels: Record<string, string> = {
  pending: '待确认',
  confirmed: '已确认',
  completed: '已完成',
  cancelled: '已取消',
};

const statusColors: Record<string, string> = {
  pending: 'orange',
  confirmed: 'blue',
  completed: 'green',
  cancelled: 'default',
};

const timeSlots = [
  '08:00-08:30',
  '08:30-09:00',
  '09:00-09:30',
  '09:30-10:00',
  '10:00-10:30',
  '10:30-11:00',
  '11:00-11:30',
  '11:30-12:00',
  '14:00-14:30',
  '14:30-15:00',
  '15:00-15:30',
  '15:30-16:00',
  '16:00-16:30',
  '16:30-17:00',
  '17:00-17:30',
];

export default function MyAppointments() {
  const { currentUser } = useAuthStore();
  const { appointments, patients, loadAll: loadPatient, addAppointment, cancelAppointment } =
    usePatientStore();
  const { departments, doctors, loadAll: loadHospital } = useHospitalStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadPatient();
    loadHospital();
  }, [loadPatient, loadHospital]);

  const currentPatient = useMemo(() => {
    return patients.find((p) => p.userId === currentUser?.id);
  }, [patients, currentUser]);

  const myAppointments = useMemo(() => {
    if (!currentPatient) return [];
    return [...appointments]
      .filter((a) => a.patientId === currentPatient.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [appointments, currentPatient]);

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

  const handleAddAppointment = () => {
    if (!currentPatient) {
      message.error('请先完成患者建档');
      return;
    }
    form.resetFields();
    setModalVisible(true);
  };

  const handleSubmit = () => {
    if (!currentPatient) return;
    form.validateFields().then((values) => {
      if (values.appointmentDate) {
        values.appointmentDate = values.appointmentDate.format('YYYY-MM-DD');
      }
      addAppointment({
        ...values,
        patientId: currentPatient.id,
        status: 'pending',
        triageStatus: 'pending',
      });
      message.success('预约成功');
      setModalVisible(false);
    });
  };

  const handleCancel = (id: string) => {
    const success = cancelAppointment(id);
    if (success) {
      message.success('预约已取消');
    }
  };

  const columns: ColumnsType<Appointment> = [
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
      render: (deptId) => <Tag color="blue">{getDepartmentName(deptId)}</Tag>,
    },
    {
      title: '医生',
      dataIndex: 'doctorId',
      key: 'doctorId',
      render: (docId) => getDoctorName(docId),
    },
    {
      title: '分诊状态',
      dataIndex: 'triageStatus',
      key: 'triageStatus',
      render: (triageStatus) => (
        <Tag color={triageStatus === 'completed' ? 'green' : 'orange'}>
          {triageStatus === 'completed' ? '已分诊' : '待分诊'}
        </Tag>
      ),
    },
    {
      title: '预约状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={statusColors[status]}>{statusLabels[status]}</Tag>
      ),
    },
    {
      title: '备注',
      dataIndex: 'notes',
      key: 'notes',
      render: (notes) => notes || '-',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          {record.status === 'pending' && (
            <Popconfirm
              title="确定要取消该预约吗？"
              onConfirm={() => handleCancel(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" danger icon={<CloseOutlined />}>
                取消
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

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
          我的预约
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddAppointment}>
          预约挂号
        </Button>
      </div>

      <Card>
        {myAppointments.length > 0 ? (
          <Table
            columns={columns}
            dataSource={myAppointments}
            rowKey="id"
            size="middle"
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条预约记录`,
            }}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
            暂无预约记录，请点击上方按钮进行预约挂号
          </div>
        )}
      </Card>

      {/* 预约挂号模态框 */}
      <Modal
        title="预约挂号"
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText="确认预约"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item
            name="departmentId"
            label="选择科室"
            rules={[{ required: true, message: '请选择科室' }]}
          >
            <Select placeholder="请选择科室">
              {departments.map((dept) => (
                <Select.Option key={dept.id} value={dept.id}>
                  {dept.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="doctorId"
            label="选择医生"
            rules={[{ required: true, message: '请选择医生' }]}
          >
            <Select placeholder="请选择医生">
              {doctors.map((doc) => {
                const user = useHospitalStore
                  .getState()
                  .medicalStaff.find((u) => u.id === doc.userId);
                return (
                  <Select.Option key={doc.id} value={doc.id}>
                    {user?.name} - {doc.title}
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>
          <Form.Item
            name="appointmentDate"
            label="预约日期"
            rules={[{ required: true, message: '请选择预约日期' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              placeholder="请选择预约日期"
              disabledDate={(current) => current && current < dayjs().startOf('day')}
            />
          </Form.Item>
          <Form.Item
            name="timeSlot"
            label="时间段"
            rules={[{ required: true, message: '请选择时间段' }]}
          >
            <Select placeholder="请选择时间段">
              {timeSlots.map((slot) => (
                <Select.Option key={slot} value={slot}>
                  {slot}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="notes" label="备注">
            <Input.TextArea placeholder="请输入备注" rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
