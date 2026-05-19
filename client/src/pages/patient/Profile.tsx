import { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Tabs, Avatar, message, Spin, List, Descriptions } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/store/authStore';
import { authApi, medicalRecordApi } from '@/services/api';
import type { User, MedicalRecord } from '@/types';

export default function Profile() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [loading, setLoading] = useState(false);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        real_name: user.real_name,
        phone: user.phone,
      });
    }
    fetchRecords();
  }, [user]);

  const fetchRecords = async () => {
    try {
      const res = await medicalRecordApi.getPatientRecords();
      setRecords(res);
    } finally {
      setRecordsLoading(false);
    }
  };

  const handleUpdateProfile = async (values: Partial<User>) => {
    setLoading(true);
    try {
      const res = await authApi.updateProfile(values);
      setUser(res);
      message.success('更新成功');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (values: { oldPassword: string; newPassword: string; confirmPassword: string }) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('两次输入的新密码不一致');
      return;
    }
    setLoading(true);
    try {
      await authApi.updatePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
      message.success('密码修改成功');
      passwordForm.resetFields();
    } finally {
      setLoading(false);
    }
  };

  const tabItems = [
    {
      key: 'info',
      label: '个人信息',
      children: (
        <div className="max-w-xl">
          <div className="text-center mb-8">
            <Avatar size={80} icon={<UserOutlined />} />
            <h3 className="mt-4 font-semibold">{user?.real_name}</h3>
            <p className="text-gray-500">{user?.phone}</p>
          </div>
          <Form form={form} layout="vertical" onFinish={handleUpdateProfile}>
            <Form.Item name="real_name" label="真实姓名" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="phone" label="手机号" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                保存修改
              </Button>
            </Form.Item>
          </Form>
        </div>
      ),
    },
    {
      key: 'password',
      label: '修改密码',
      children: (
        <div className="max-w-xl">
          <Form form={passwordForm} layout="vertical" onFinish={handleUpdatePassword}>
            <Form.Item name="oldPassword" label="原密码" rules={[{ required: true }]}>
              <Input.Password />
            </Form.Item>
            <Form.Item
              name="newPassword"
              label="新密码"
              rules={[{ required: true }, { min: 6, message: '密码至少6位' }]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              label="确认新密码"
              rules={[{ required: true }]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                修改密码
              </Button>
            </Form.Item>
          </Form>
        </div>
      ),
    },
    {
      key: 'records',
      label: '就诊档案',
      children: recordsLoading ? (
        <div className="flex justify-center py-8">
          <Spin />
        </div>
      ) : records.length === 0 ? (
        <div className="text-center py-8 text-gray-500">暂无就诊记录</div>
      ) : (
        <List
          dataSource={records}
          renderItem={(record) => (
            <List.Item key={record.id}>
              <Card className="w-full">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="就诊时间">{record.visit_time}</Descriptions.Item>
                  <Descriptions.Item label="医生">{record.doctor_name}</Descriptions.Item>
                  <Descriptions.Item label="科室">{record.department_name}</Descriptions.Item>
                  {record.chief_complaint && (
                    <Descriptions.Item label="主诉">{record.chief_complaint}</Descriptions.Item>
                  )}
                  {record.present_illness && (
                    <Descriptions.Item label="现病史">{record.present_illness}</Descriptions.Item>
                  )}
                  {record.diagnosis && (
                    <Descriptions.Item label="诊断">{record.diagnosis}</Descriptions.Item>
                  )}
                </Descriptions>
              </Card>
            </List.Item>
          )}
        />
      ),
    },
  ];

  return (
    <Card>
      <Tabs items={tabItems} />
    </Card>
  );
}
