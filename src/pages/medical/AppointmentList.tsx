import { useEffect, useState } from 'react';
import { Card, Typography, Table, Tag, Space, Button, Select, DatePicker, Input, Modal, Form, message } from 'antd';
import { SearchOutlined, CheckOutlined, CloseOutlined, EditOutlined } from '@ant-design/icons';
import { usePatientStore } from '../../stores/patientStore';
import { useHospitalStore } from '../../stores/hospitalStore';
import type { ColumnsType } from 'antd/es/table';
import type { Appointment } from '../../types';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Search } = Input;

const statusColors: Record<string, string> = {
  pending: 'orange',
  confirmed: 'blue',
  completed: 'green',
  cancelled: 'default',
};

const statusLabels: Record<string, string> = {
  pending: '待确认',
  confirmed: '已确认',
  completed: '已完成',
  cancelled: '已取消',
};

const triageLabels: Record<string, string> = {
  pending: '待分诊',
  completed: '已分诊',
};

export default function AppointmentList() {
  const { appointments, loadAll: loadPatient, updateAppointment, cancelAppointment } = usePatientStore();
  const { departments, doctors, loadAll: loadHospital } = useHospitalStore();
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterDept, setFilterDept] = useState<string>('');
  const [triageModalVisible, setTriageModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadPatient();
    loadHospital();
  }, [loadPatient, loadHospital]);

  const getDepartmentName = (deptId: string) => {
    const dept = departments.find((d) => d.id === deptId);
    return dept?.name || '-';
  };

  const getDoctorName = (docId: string) => {
    const doc = doctors.find((d) => d.id === docId);
    const user = useHospitalStore
      .getState()
      .medicalStaff.find((u) => u.id === doc?.userId);
    return user?.name || '-';
  };

  const filteredAppointments = appointments.filter((a) => {
    const matchSearch =
      !searchText ||
      getDoctorName(a.doctorId).includes(searchText) ||
      a.timeSlot.includes(searchText) ||
      a.notes?.includes(searchText);
    const matchStatus = !filterStatus || a.status === filterStatus;
    const matchDept = !filterDept || a.departmentId === filterDept;
    return matchSearch && matchStatus && matchDept;
  });

  const handleConfirm = (id: string) => {
    const updated = updateAppointment(id, { status: 'confirmed' });
    if (updated) {
      message.success('预约已确认');
    }
  };

  const handleComplete = (id: string) => {
    const updated = updateAppointment(id, { status: 'completed' });
    if (updated) {
      message.success('预约已完成');
    }
  };

  const handleCancel = (id: string) => {
    const success = cancelAppointment(id);
    if (success) {
      message.success('预约已取消');
    }
  };

  const handleTriage = (record: Appointment) => {
    setSelectedAppointment(record);
    form.setFieldsValue({ triageNotes: record.triageNotes });
    setTriageModalVisible(true);
  };

  const handleSubmitTriage = () => {
    if (!selectedAppointment) return;
    form.validateFields().then((values) => {
      const updated = updateAppointment(selectedAppointment.id, {
        triageStatus: 'completed',
        triageNotes: values.triageNotes,
      });
      if (updated) {
        message.success('分诊完成');
        setTriageModalVisible(false);
      }
    });
  };

  const columns: ColumnsType<Appointment> = [
    {
      title: '预约日期',
      dataIndex: 'appointmentDate',
      key: 'appointmentDate',
      sorter: (a, b) => dayjs(a.appointmentDate).unix() - dayjs(b.appointmentDate).unix(),
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
      title: '预约状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={statusColors[status]}>{statusLabels[status]}</Tag>,
    },
    {
      title: '分诊状态',
      dataIndex: 'triageStatus',
      key: 'triageStatus',
      render: (triageStatus) => (
        <Tag color={triageStatus === 'completed' ? 'green' : 'orange'}>
          {triageLabels[triageStatus || 'pending']}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          {record.status === 'pending' && (
            <>
              <Button type="link" icon={<CheckOutlined />} onClick={() => handleConfirm(record.id)}>
                确认
              </Button>
              <Button type="link" icon={<EditOutlined />} onClick={() => handleTriage(record)}>
                分诊
              </Button>
            </>
          )}
          {record.status === 'confirmed' && record.triageStatus !== 'completed' && (
            <Button type="link" icon={<EditOutlined />} onClick={() => handleTriage(record)}>
              分诊
            </Button>
          )}
          {record.status === 'confirmed' && (
            <Button type="link" icon={<CheckOutlined />} onClick={() => handleComplete(record.id)}>
              完成
            </Button>
          )}
          {record.status !== 'cancelled' && record.status !== 'completed' && (
            <Button type="link" danger icon={<CloseOutlined />} onClick={() => handleCancel(record.id)}>
              取消
            </Button>
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
          预约挂号管理
        </Title>
      </div>

      <Card>
        <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Search
            placeholder="搜索医生、时间段"
            prefix={<SearchOutlined />}
            style={{ width: 250 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
          <Select
            placeholder="筛选状态"
            style={{ width: 150 }}
            allowClear
            value={filterStatus || undefined}
            onChange={(value) => setFilterStatus(value)}
          >
            <Select.Option value="pending">待确认</Select.Option>
            <Select.Option value="confirmed">已确认</Select.Option>
            <Select.Option value="completed">已完成</Select.Option>
            <Select.Option value="cancelled">已取消</Select.Option>
          </Select>
          <Select
            placeholder="筛选科室"
            style={{ width: 150 }}
            allowClear
            value={filterDept || undefined}
            onChange={(value) => setFilterDept(value)}
          >
            {departments.map((dept) => (
              <Select.Option key={dept.id} value={dept.id}>
                {dept.name}
              </Select.Option>
            ))}
          </Select>
        </div>

        <Table
          columns={columns}
          dataSource={filteredAppointments}
          rowKey="id"
          size="middle"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条预约记录`,
          }}
        />
      </Card>

      <Modal
        title="分诊处理"
        open={triageModalVisible}
        onOk={handleSubmitTriage}
        onCancel={() => setTriageModalVisible(false)}
        okText="确认分诊"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item
            name="triageNotes"
            label="分诊记录"
            rules={[{ required: true, message: '请输入分诊记录' }]}
          >
            <Input.TextArea placeholder="请输入分诊记录，包括症状描述、初步判断等" rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
