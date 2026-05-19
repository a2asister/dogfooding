import { useState, useEffect } from 'react';
import { Table, Tag, Button, Modal, Form, Input, Select, message } from 'antd';
import dayjs from 'dayjs';
import { adminApi } from '../../services/api';
import { AuthStatus, UserRole } from '../../types';

const { Option } = Select;
const { TextArea } = Input;

const authStatusMap: Record<string, { color: string; text: string }> = {
  [AuthStatus.UNVERIFIED]: { color: 'default', text: '未认证' },
  [AuthStatus.PENDING]: { color: 'orange', text: '待审核' },
  [AuthStatus.VERIFIED]: { color: 'green', text: '已认证' },
  [AuthStatus.REJECTED]: { color: 'red', text: '已拒绝' }
};

const roleMap: Record<string, string> = {
  [UserRole.USER]: '普通用户',
  [UserRole.MERCHANT]: '商家',
  [UserRole.OPERATOR]: '运营',
  [UserRole.ADMIN]: '管理员'
};

function UserManagement(): JSX.Element {
  const [users, setUsers] = useState<Array<{ id: number; phone: string; nickname: string; role: string; realName?: string; authStatus: string; balance: number; frozenBalance: number; createdAt: string }>>([]);
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: number; nickname: string } | null>(null);
  const [form] = Form.useForm();

  const loadUsers = async (): Promise<void> => {
    try {
      const res = await adminApi.getUsers() as unknown as { users: Array<{ id: number; phone: string; nickname: string; role: string; realName?: string; authStatus: string; balance: number; frozenBalance: number; createdAt: string }>; total: number };
      setUsers(res.users);
    } catch {
      // Error handled
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleAudit = (user: { id: number; nickname: string }): void => {
    setCurrentUser(user);
    setAuthModalVisible(true);
  };

  const handleSubmitAudit = async (values: { status: string; reason?: string }): Promise<void> => {
    if (!currentUser) return;
    
    try {
      await adminApi.auditUser(currentUser.id, values.status, values.reason);
      message.success('审核完成');
      setAuthModalVisible(false);
      form.resetFields();
      loadUsers();
    } catch {
      // Error handled
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
      key: 'nickname'
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone'
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => roleMap[role] || role
    },
    {
      title: '真实姓名',
      dataIndex: 'realName',
      key: 'realName',
      render: (name?: string) => name || '-'
    },
    {
      title: '认证状态',
      dataIndex: 'authStatus',
      key: 'authStatus',
      render: (status: string) => {
        const info = authStatusMap[status];
        return info ? <Tag color={info.color}>{info.text}</Tag> : <Tag>{status}</Tag>;
      }
    },
    {
      title: '余额',
      dataIndex: 'balance',
      key: 'balance',
      render: (val: number) => `¥${val.toFixed(2)}`
    },
    {
      title: '冻结余额',
      dataIndex: 'frozenBalance',
      key: 'frozenBalance',
      render: (val: number) => `¥${val.toFixed(2)}`
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm')
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: unknown, record: { id: number; nickname: string; authStatus: string }) => (
        record.authStatus === AuthStatus.PENDING && (
          <Button type="link" size="small" onClick={() => handleAudit(record)}>
            审核
          </Button>
        )
      )
    }
  ];

  return (
    <div>
      <h2 className="page-title">用户管理</h2>
      
      <Table
        dataSource={users}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={`审核用户 - ${currentUser?.nickname}`}
        open={authModalVisible}
        onCancel={() => setAuthModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmitAudit}>
          <Form.Item
            name="status"
            label="审核结果"
            rules={[{ required: true, message: '请选择审核结果' }]}
          >
            <Select placeholder="请选择">
              <Option value={AuthStatus.VERIFIED}>通过</Option>
              <Option value={AuthStatus.REJECTED}>拒绝</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="reason"
            label="拒绝原因"
            extra="拒绝时必填"
          >
            <TextArea rows={3} placeholder="请输入拒绝原因" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              提交审核
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default UserManagement;
