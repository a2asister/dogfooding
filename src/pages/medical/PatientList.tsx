import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Typography,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  message,
  Popconfirm,
  Descriptions,
  Drawer,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { usePatientStore } from '../../stores/patientStore';
import { useHospitalStore } from '../../stores/hospitalStore';
import type { ColumnsType } from 'antd/es/table';
import type { Patient, Department, Doctor, Appointment } from '../../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Search } = Input;

export default function PatientList() {
  const { patients, appointments, loadAll: loadPatient, addPatient, updatePatient, deletePatient, addAppointment } =
    usePatientStore();
  const { departments, doctors, loadAll: loadHospital } = useHospitalStore();

  const [searchText, setSearchText] = useState('');
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [appointmentModalVisible, setAppointmentModalVisible] = useState(false);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [form] = Form.useForm();
  const [appointmentForm] = Form.useForm();

  useEffect(() => {
    loadPatient();
    loadHospital();
  }, [loadPatient, loadHospital]);

  const filteredPatients = patients.filter(
    (p) =>
      p.name.includes(searchText) ||
      p.phone.includes(searchText) ||
      p.idCard.includes(searchText)
  );

  const handleAdd = () => {
    setSelectedPatient(null);
    form.resetFields();
    setAddModalVisible(true);
  };

  const handleEdit = (record: Patient) => {
    setSelectedPatient(record);
    form.setFieldsValue(record);
    setEditModalVisible(true);
  };

  const handleDelete = (id: string) => {
    const success = deletePatient(id);
    if (success) {
      message.success('删除成功');
    } else {
      message.error('删除失败');
    }
  };

  const handleView = (record: Patient) => {
    setSelectedPatient(record);
    setDetailDrawerVisible(true);
  };

  const handleAppointment = (record: Patient) => {
    setSelectedPatient(record);
    appointmentForm.resetFields();
    setAppointmentModalVisible(true);
  };

  const handleSubmitAdd = () => {
    form.validateFields().then((values) => {
      if (values.birthDate) {
        values.birthDate = values.birthDate.format('YYYY-MM-DD');
      }
      addPatient(values);
      message.success('患者建档成功');
      setAddModalVisible(false);
      form.resetFields();
    });
  };

  const handleSubmitEdit = () => {
    if (!selectedPatient) return;
    form.validateFields().then((values) => {
      if (values.birthDate) {
        values.birthDate = values.birthDate.format('YYYY-MM-DD');
      }
      const updated = updatePatient(selectedPatient.id, values);
      if (updated) {
        message.success('更新成功');
        setEditModalVisible(false);
      }
    });
  };

  const handleSubmitAppointment = () => {
    if (!selectedPatient) return;
    appointmentForm.validateFields().then((values) => {
      if (values.appointmentDate) {
        values.appointmentDate = values.appointmentDate.format('YYYY-MM-DD');
      }
      addAppointment({
        ...values,
        patientId: selectedPatient.id,
        status: 'pending',
        triageStatus: 'pending',
      });
      message.success('预约挂号成功');
      setAppointmentModalVisible(false);
      appointmentForm.resetFields();
    });
  };

  const patientAppointments = appointments.filter((a) => a.patientId === selectedPatient?.id);

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

  const columns: ColumnsType<Patient> = [
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
          {gender === 'male' ? '男' : gender === 'female' ? '女' : '未知'}
        </Tag>
      ),
    },
    {
      title: '年龄',
      dataIndex: 'birthDate',
      key: 'age',
      render: (date: string) => {
        const birth = dayjs(date);
        const now = dayjs();
        const age = now.diff(birth, 'year');
        return <span>{age} 岁</span>;
      },
    },
    {
      title: '电话',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '血型',
      dataIndex: 'bloodType',
      key: 'bloodType',
      render: (type) => type || '-',
    },
    {
      title: '建档时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleView(record)}>
            详情
          </Button>
          <Button type="link" icon={<PlusOutlined />} onClick={() => handleAppointment(record)}>
            挂号
          </Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定要删除该患者吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

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
      render: (status) => {
        const colorMap: Record<string, string> = {
          pending: 'orange',
          confirmed: 'blue',
          completed: 'green',
          cancelled: 'default',
        };
        const labelMap: Record<string, string> = {
          pending: '待确认',
          confirmed: '已确认',
          completed: '已完成',
          cancelled: '已取消',
        };
        return <Tag color={colorMap[status]}>{labelMap[status]}</Tag>;
      },
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
          患者管理
        </Title>
        <Space>
          <Search
            placeholder="搜索患者姓名、电话、身份证号"
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            患者建档
          </Button>
        </Space>
      </div>

      <Card>
        <Table columns={columns} dataSource={filteredPatients} rowKey="id" size="middle" pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 位患者`,
        }} />
      </Card>

      {/* 新增/编辑患者模态框 */}
      <Modal
        title={selectedPatient ? '编辑患者信息' : '患者建档'}
        open={addModalVisible || editModalVisible}
        onOk={addModalVisible ? handleSubmitAdd : handleSubmitEdit}
        onCancel={() => {
          setAddModalVisible(false);
          setEditModalVisible(false);
        }}
        okText="确认"
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

      {/* 预约挂号模态框 */}
      <Modal
        title="预约挂号"
        open={appointmentModalVisible}
        onOk={handleSubmitAppointment}
        onCancel={() => setAppointmentModalVisible(false)}
        okText="确认挂号"
        cancelText="取消"
      >
        <Form form={appointmentForm} layout="vertical" style={{ marginTop: 24 }}>
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
            <DatePicker style={{ width: '100%' }} placeholder="请选择预约日期" disabledDate={(current) => current && current < dayjs().startOf('day')} />
          </Form.Item>
          <Form.Item
            name="timeSlot"
            label="时间段"
            rules={[{ required: true, message: '请选择时间段' }]}
          >
            <Select placeholder="请选择时间段">
              <Select.Option value="08:00-08:30">08:00-08:30</Select.Option>
              <Select.Option value="08:30-09:00">08:30-09:00</Select.Option>
              <Select.Option value="09:00-09:30">09:00-09:30</Select.Option>
              <Select.Option value="09:30-10:00">09:30-10:00</Select.Option>
              <Select.Option value="10:00-10:30">10:00-10:30</Select.Option>
              <Select.Option value="10:30-11:00">10:30-11:00</Select.Option>
              <Select.Option value="14:00-14:30">14:00-14:30</Select.Option>
              <Select.Option value="14:30-15:00">14:30-15:00</Select.Option>
              <Select.Option value="15:00-15:30">15:00-15:30</Select.Option>
              <Select.Option value="15:30-16:00">15:30-16:00</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="notes" label="备注">
            <Input.TextArea placeholder="请输入备注" rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 患者详情抽屉 */}
      <Drawer
        title="患者详情"
        width={600}
        onClose={() => setDetailDrawerVisible(false)}
        open={detailDrawerVisible}
      >
        {selectedPatient && (
          <div>
            <Descriptions title="基本信息" bordered column={1} size="small">
              <Descriptions.Item label="姓名">{selectedPatient.name}</Descriptions.Item>
              <Descriptions.Item label="性别">
                {selectedPatient.gender === 'male' ? '男' : selectedPatient.gender === 'female' ? '女' : '未知'}
              </Descriptions.Item>
              <Descriptions.Item label="出生日期">{selectedPatient.birthDate}</Descriptions.Item>
              <Descriptions.Item label="年龄">
                {dayjs().diff(dayjs(selectedPatient.birthDate), 'year')} 岁
              </Descriptions.Item>
              <Descriptions.Item label="身份证号">{selectedPatient.idCard}</Descriptions.Item>
              <Descriptions.Item label="联系电话">{selectedPatient.phone}</Descriptions.Item>
              <Descriptions.Item label="家庭住址">{selectedPatient.address || '-'}</Descriptions.Item>
              <Descriptions.Item label="血型">{selectedPatient.bloodType || '-'}</Descriptions.Item>
              <Descriptions.Item label="紧急联系人">{selectedPatient.emergencyContact || '-'}</Descriptions.Item>
              <Descriptions.Item label="紧急联系电话">{selectedPatient.emergencyPhone || '-'}</Descriptions.Item>
              <Descriptions.Item label="既往病史">{selectedPatient.medicalHistory || '-'}</Descriptions.Item>
              <Descriptions.Item label="建档时间">
                {new Date(selectedPatient.createdAt).toLocaleString()}
              </Descriptions.Item>
            </Descriptions>

            <Title level={5} style={{ marginTop: 24, marginBottom: 16 }}>
              历史预约记录
            </Title>
            <Table
              columns={appointmentColumns}
              dataSource={patientAppointments}
              rowKey="id"
              size="small"
              pagination={false}
            />
          </div>
        )}
      </Drawer>
    </div>
  );
}
