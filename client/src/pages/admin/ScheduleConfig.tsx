import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Select,
  InputNumber,
  message,
  Switch,
  Tag,
  DatePicker,
  Row,
  Col,
} from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import type { DoctorSchedule, User, Department } from '@/types';
import { adminApi, doctorApi, departmentApi } from '@/services/api';
import dayjs from 'dayjs';

const timeSlots = [
  '08:00-09:00',
  '09:00-10:00',
  '10:00-11:00',
  '11:00-12:00',
  '14:00-15:00',
  '15:00-16:00',
  '16:00-17:00',
  '17:00-18:00',
];

export default function ScheduleConfig() {
  const [schedules, setSchedules] = useState<DoctorSchedule[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterDepartment, setFilterDepartment] = useState<number | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [scheduleRes, doctorRes, deptRes] = await Promise.all([
        adminApi.getScheduleConfig(),
        doctorApi.getList(),
        departmentApi.getAll(),
      ]);
      setSchedules(scheduleRes);
      setDoctors(doctorRes);
      setDepartments(deptRes);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    form.resetFields();
    setModalVisible(true);
  };

  const handleSubmit = async (values: {
    doctor_id: number;
    department_id: number;
    schedule_date: string;
    time_slot: string;
    total_quota: number;
  }) => {
    try {
      const schedule: DoctorSchedule = {
        id: 0,
        doctor_id: values.doctor_id,
        department_id: values.department_id,
        schedule_date: dayjs(values.schedule_date as unknown as dayjs.Dayjs).format('YYYY-MM-DD'),
        time_slot: values.time_slot,
        total_quota: values.total_quota,
        used_quota: 0,
        is_enabled: 1,
      };
      await adminApi.saveScheduleConfig([schedule]);
      message.success('添加成功');
      setModalVisible(false);
      fetchData();
    } catch {
      // error handled
    }
  };

  const handleToggle = async (id: number, isEnabled: number) => {
    try {
      await adminApi.toggleSchedule(id, isEnabled === 1 ? 0 : 1);
      message.success(isEnabled === 1 ? '已关闭' : '已开启');
      fetchData();
    } catch {
      // error handled
    }
  };

  const handleBatchGenerate = async () => {
    try {
      const batchSchedules: DoctorSchedule[] = [];
      const today = dayjs();

      doctors
        .filter((d) => d.role === 'doctor')
        .forEach((doctor) => {
          for (let i = 0; i < 7; i++) {
            const date = today.add(i, 'day');
            if (date.day() === 0 || date.day() === 6) continue;
            timeSlots.slice(0, 4).forEach((slot) => {
              batchSchedules.push({
                id: 0,
                doctor_id: doctor.id,
                department_id: doctor.department_id || 1,
                schedule_date: date.format('YYYY-MM-DD'),
                time_slot: slot,
                total_quota: 20,
                used_quota: 0,
                is_enabled: 1,
                doctor_name: doctor.real_name,
                department_name: doctor.department_name,
              });
            });
          }
        });

      await adminApi.saveScheduleConfig(batchSchedules);
      message.success(`已生成 ${batchSchedules.length} 条号源`);
      fetchData();
    } catch {
      // error handled
    }
  };

  const filteredSchedules = filterDepartment
    ? schedules.filter((s) => s.department_id === filterDepartment)
    : schedules;

  const columns = [
    { title: '日期', dataIndex: 'schedule_date', key: 'schedule_date', width: 120 },
    {
      title: '时段',
      dataIndex: 'time_slot',
      key: 'time_slot',
      width: 100,
      render: (slot: string) => <Tag color="blue">{slot}</Tag>,
    },
    { title: '科室', dataIndex: 'department_name', key: 'department_name', width: 120 },
    { title: '医生', dataIndex: 'doctor_name', key: 'doctor_name', width: 100 },
    {
      title: '号源配额',
      key: 'quota',
      width: 120,
      render: (_: unknown, record: DoctorSchedule) => (
        <span>
          {record.used_quota}/{record.total_quota}
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'is_enabled',
      key: 'is_enabled',
      width: 100,
      render: (enabled: number, record: DoctorSchedule) => (
        <Switch
          checked={enabled === 1}
          onChange={() => handleToggle(record.id, enabled)}
          checkedChildren="开"
          unCheckedChildren="关"
        />
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold m-0">号源配置</h2>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={handleBatchGenerate}>
            批量生成一周号源
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增号源
          </Button>
        </Space>
      </div>

      <div className="mb-4">
        <Row gutter={16}>
          <Col span={6}>
            <Select
              placeholder="筛选科室"
              allowClear
              style={{ width: '100%' }}
              value={filterDepartment}
              onChange={setFilterDepartment}
            >
              {departments.map((dept) => (
                <Select.Option key={dept.id} value={dept.id}>
                  {dept.name}
                </Select.Option>
              ))}
            </Select>
          </Col>
        </Row>
      </div>

      <Table
        columns={columns}
        dataSource={filteredSchedules}
        rowKey="id"
        loading={loading}
        scroll={{ y: 600 }}
      />

      <Modal
        title="新增号源"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="department_id"
            label="科室"
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
            name="doctor_id"
            label="医生"
            rules={[{ required: true, message: '请选择医生' }]}
          >
            <Select placeholder="请选择医生">
              {doctors
                .filter((d) => d.role === 'doctor')
                .map((doctor) => (
                  <Select.Option key={doctor.id} value={doctor.id}>
                    {doctor.real_name} - {doctor.department_name}
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="schedule_date"
            label="日期"
            rules={[{ required: true, message: '请选择日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="time_slot"
            label="时段"
            rules={[{ required: true, message: '请选择时段' }]}
          >
            <Select placeholder="请选择时段">
              {timeSlots.map((slot) => (
                <Select.Option key={slot} value={slot}>
                  {slot}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="total_quota"
            label="号源数量"
            rules={[{ required: true, message: '请输入号源数量' }]}
          >
            <InputNumber min={1} max={100} defaultValue={20} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                保存
              </Button>
              <Button onClick={() => setModalVisible(false)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
