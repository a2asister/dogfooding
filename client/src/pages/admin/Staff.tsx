import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  message,
  Tag,
  DatePicker,
} from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import type { User, Department } from '@/types';
import { adminApi, departmentApi } from '@/services/api';
import dayjs from 'dayjs';

const titleOptions = [
  '主任医师',
  '副主任医师',
  '主治医师',
  '住院医师',
  '护师',
  '护士',
  '技师',
  '检验师',
  '药剂师',
];

export default function Staff() {
  const [staff, setStaff] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingStaff, setEditingStaff] = useState<User | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [staffRes, deptRes] = await Promise.all([
        adminApi.getAccounts('medical'),
        departmentApi.getAll(),
      ]);
      setStaff(staffRes);
      setDepartments(deptRes);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingStaff(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: User) => {
    setEditingStaff(record);
    form.setFieldsValue({
      real_name: record.real_name,
      phone: record.phone,
      role: record.role,
      department_id: record.department_id,
      title: record.title,
      license_no: record.license_no,
      education: record.education,
      hire_date: record.hire_date ? dayjs(record.hire_date) : undefined,
    });
    setModalVisible(true);
  };

  const handleSubmit = async (values: Partial<User> & { hire_date?: dayjs.Dayjs }) => {
    try {
      const submitData = {
        ...values,
        hire_date: values.hire_date ? values.hire_date.format('YYYY-MM-DD') : undefined,
      };
      if (editingStaff) {
        await adminApi.updateAccount(editingStaff.id, submitData);
        message.success('更新成功');
      } else {
        await adminApi.createAccount({
          ...submitData,
          username: submitData.phone,
          password: '123456',
        });
        message.success('创建成功，初始密码 123456');
      }
      setModalVisible(false);
      fetchData();
    } catch {
      // error handled
    }
  };

  const columns = [
    { title: '姓名', dataIndex: 'real_name', key: 'real_name' },
    { title: '手机号', dataIndex: 'phone', key: 'phone' },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        const roleMap: Record<string, string> = {
          doctor: '医生',
          nurse: '护士',
          pharmacist: '药剂师',
          technician: '医技',
        };
        return <Tag>{roleMap[role] || role}</Tag>;
      },
    },
    { title: '科室', dataIndex: 'department_name', key: 'department_name' },
    { title: '职称', dataIndex: 'title', key: 'title' },
    {
      title: '执业证号',
      dataIndex: 'license_no',
      key: 'license_no',
      render: (val: string) => val || '-',
    },
    {
      title: '学历',
      dataIndex: 'education',
      key: 'education',
      render: (val: string) => val || '-',
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active: number) => (
        <Tag color={active === 1 ? 'green' : 'red'}>
          {active === 1 ? '在岗' : '离岗'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: User) => (
        <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
          编辑
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold m-0">医护档案</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增医护
        </Button>
      </div>

      <Table columns={columns} dataSource={staff} rowKey="id" loading={loading} />

      <Modal
        title={editingStaff ? '编辑医护档案' : '新增医护'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="real_name"
              label="姓名"
              rules={[{ required: true, message: '请输入姓名' }]}
            >
              <Input placeholder="请输入姓名" />
            </Form.Item>
            <Form.Item
              name="phone"
              label="手机号"
              rules={[{ required: true, message: '请输入手机号' }]}
            >
              <Input placeholder="请输入手机号" />
            </Form.Item>
            <Form.Item
              name="role"
              label="角色"
              rules={[{ required: true, message: '请选择角色' }]}
            >
              <Select placeholder="请选择角色">
                <Select.Option value="doctor">医生</Select.Option>
                <Select.Option value="nurse">护士</Select.Option>
                <Select.Option value="pharmacist">药剂师</Select.Option>
                <Select.Option value="technician">医技</Select.Option>
              </Select>
            </Form.Item>
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
              name="title"
              label="职称"
              rules={[{ required: true, message: '请选择职称' }]}
            >
              <Select placeholder="请选择职称">
                {titleOptions.map((title) => (
                  <Select.Option key={title} value={title}>
                    {title}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="license_no" label="执业证号">
              <Input placeholder="请输入执业证号" />
            </Form.Item>
            <Form.Item name="education" label="学历">
              <Select placeholder="请选择学历">
                <Select.Option value="博士">博士</Select.Option>
                <Select.Option value="硕士">硕士</Select.Option>
                <Select.Option value="本科">本科</Select.Option>
                <Select.Option value="大专">大专</Select.Option>
                <Select.Option value="中专">中专</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="hire_date" label="入职日期">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </div>
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
