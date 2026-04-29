import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Input,
  Select,
  Modal,
  Form,
  message,
  Space,
  Popconfirm,
  Tag,
  Card,
  Upload,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  ReloadOutlined,
  KeyOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { userApi, gradeApi } from '@/services';
import type { User, UserRole } from '@/types';
import * as XLSX from 'xlsx';

const { Option } = Select;

interface StudentManagementProps {
  role?: UserRole;
}

const StudentManagement: React.FC<StudentManagementProps> = ({ role = 'student' }) => {
  const [form] = Form.useForm();
  const [resetPasswordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [grades, setGrades] = useState<Array<{ id: string; name: string }>>([]);
  const [classes, setClasses] = useState<Array<{ id: string; name: string }>>([]);

  const [filters, setFilters] = useState({
    keyword: '',
    gradeId: '',
    classId: '',
  });

  const getRoleLabel = () => {
    switch (role) {
      case 'student': return '学生';
      case 'teacher': return '教师';
      case 'admin': return '管理员';
      default: return '用户';
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await userApi.getUsers({
        role,
        keyword: filters.keyword || undefined,
        gradeId: filters.gradeId || undefined,
        classId: filters.classId || undefined,
        page: currentPage,
        pageSize,
      });
      if (res.success) {
        setData(res.data?.rows || []);
        setTotal(res.data?.count || 0);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGrades = async () => {
    try {
      const res = await gradeApi.getGrades();
      if (res.success) {
        setGrades(res.data?.map((g: any) => ({ id: g.id, name: g.name })) || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchClasses = async (gradeId: string) => {
    if (!gradeId) {
      setClasses([]);
      return;
    }
    try {
      const res = await gradeApi.getClasses(gradeId);
      if (res.success) {
        setClasses(res.data?.map((c: any) => ({ id: c.id, name: c.name })) || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, pageSize, filters, role]);

  useEffect(() => {
    fetchGrades();
  }, []);

  const handleCreate = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record: User) => {
    setEditingUser(record);
    form.setFieldsValue({
      username: record.username,
      name: record.name,
      email: record.email,
      phone: record.phone,
      studentNo: record.studentNo,
      teacherNo: record.teacherNo,
      gradeId: record.gradeId,
      classId: record.classId,
    });
    if (record.gradeId) {
      fetchClasses(record.gradeId);
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await userApi.deleteUser(id);
      if (res.success) {
        message.success('删除成功');
        fetchData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const res = await userApi.toggleStatus(id);
      if (res.success) {
        message.success('状态更新成功');
        fetchData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleResetPassword = (id: string) => {
    setSelectedUserId(id);
    resetPasswordForm.resetFields();
    setIsResetPasswordModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingUser) {
        const res = await userApi.updateUser(editingUser.id, {
          name: values.name,
          email: values.email,
          phone: values.phone,
          studentNo: values.studentNo,
          teacherNo: values.teacherNo,
          gradeId: values.gradeId,
          classId: values.classId,
        });
        if (res.success) {
          message.success('更新成功');
          setIsModalOpen(false);
          fetchData();
        }
      } else {
        const res = await userApi.createUser({
          username: values.username,
          password: values.password,
          name: values.name,
          role,
          email: values.email,
          phone: values.phone,
          studentNo: values.studentNo,
          teacherNo: values.teacherNo,
          gradeId: values.gradeId,
          classId: values.classId,
        });
        if (res.success) {
          message.success('创建成功');
          setIsModalOpen(false);
          fetchData();
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleResetPasswordSubmit = async () => {
    if (!selectedUserId) return;
    try {
      const values = await resetPasswordForm.validateFields();
      const res = await userApi.resetPassword(selectedUserId, values.newPassword);
      if (res.success) {
        message.success('密码重置成功');
        setIsResetPasswordModalOpen(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        let successCount = 0;
        let failCount = 0;

        for (const item of jsonData as any[]) {
          try {
            const res = await userApi.createUser({
              username: item.username || item.学号 || item.工号,
              password: item.password || '123456',
              name: item.name || item.姓名,
              role,
              email: item.email,
              phone: item.phone || item.手机号,
              studentNo: item.studentNo || item.学号,
              teacherNo: item.teacherNo || item.工号,
            });
            if (res.success) {
              successCount++;
            } else {
              failCount++;
            }
          } catch {
            failCount++;
          }
        }

        message.success(`导入完成：成功 ${successCount} 条，失败 ${failCount} 条`);
        fetchData();
      } catch (error) {
        message.error('导入失败，请检查文件格式');
        console.error(error);
      }
    };
    reader.readAsArrayBuffer(file);
    return false;
  };

  const handleExport = () => {
    const exportData = data.map((item, index) => ({
      序号: index + 1,
      用户名: item.username,
      姓名: item.name,
      学号: item.studentNo || '-',
      工号: item.teacherNo || '-',
      邮箱: item.email || '-',
      电话: item.phone || '-',
      状态: item.isActive ? '启用' : '禁用',
      创建时间: item.createdAt,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `${getRoleLabel()}列表`);
    XLSX.writeFile(workbook, `${getRoleLabel()}列表.xlsx`);
  };

  const columns: ColumnsType<User> = [
    {
      title: '序号',
      key: 'index',
      width: 60,
      render: (_: unknown, __: User, index: number) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 120,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 100,
    },
    {
      title: role === 'student' ? '学号' : role === 'teacher' ? '工号' : '-',
      dataIndex: role === 'student' ? 'studentNo' : role === 'teacher' ? 'teacherNo' : '',
      key: role === 'student' ? 'studentNo' : role === 'teacher' ? 'teacherNo' : '',
      width: 120,
      render: (text: string) => text || '-',
    },
    {
      title: '年级',
      dataIndex: ['grade', 'name'],
      key: 'grade',
      width: 100,
      render: (text: string) => text || '-',
    },
    {
      title: '班级',
      dataIndex: ['class', 'name'],
      key: 'class',
      width: 100,
      render: (text: string) => text || '-',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 150,
      render: (text: string) => text || '-',
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 280,
      fixed: 'right',
      render: (_: unknown, record: User) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" size="small" icon={<KeyOutlined />} onClick={() => handleResetPassword(record.id)}>
            重置密码
          </Button>
          <Button type="link" size="small" onClick={() => handleToggleStatus(record.id)}>
            {record.isActive ? '禁用' : '启用'}
          </Button>
          <Popconfirm title="确定要删除吗？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-container">
      <Card className="filter-card">
        <Space wrap>
          <Input
            placeholder="搜索用户名/姓名/学号/工号"
            prefix={<SearchOutlined />}
            style={{ width: 250 }}
            value={filters.keyword}
            onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
            onPressEnter={() => { setCurrentPage(1); fetchData(); }}
          />
          {role === 'student' && (
            <>
              <Select
                placeholder="选择年级"
                style={{ width: 150 }}
                allowClear
                value={filters.gradeId || undefined}
                onChange={(value) => {
                  setFilters({ ...filters, gradeId: value, classId: '' });
                  fetchClasses(value);
                }}
              >
                {grades.map((g) => (
                  <Option key={g.id} value={g.id}>{g.name}</Option>
                ))}
              </Select>
              <Select
                placeholder="选择班级"
                style={{ width: 150 }}
                allowClear
                value={filters.classId || undefined}
                onChange={(value) => setFilters({ ...filters, classId: value })}
              >
                {classes.map((c) => (
                  <Option key={c.id} value={c.id}>{c.name}</Option>
                ))}
              </Select>
            </>
          )}
          <Button icon={<SearchOutlined />} onClick={() => { setCurrentPage(1); fetchData(); }}>
            搜索
          </Button>
          <Button icon={<ReloadOutlined />} onClick={fetchData}>
            刷新
          </Button>
        </Space>
        <div style={{ marginTop: 16 }}>
          <Space wrap>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              新增{getRoleLabel()}
            </Button>
            <Upload
              beforeUpload={handleImport}
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />}>
                批量导入
              </Button>
            </Upload>
            <Button icon={<UploadOutlined />} onClick={handleExport}>
              批量导出
            </Button>
          </Space>
        </div>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            current: currentPage,
            pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
        />
      </Card>

      <Modal
        title={editingUser ? `编辑${getRoleLabel()}` : `新增${getRoleLabel()}`}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          {!editingUser && (
            <>
              <Form.Item
                name="username"
                label="用户名"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input placeholder="请输入用户名" />
              </Form.Item>
              <Form.Item
                name="password"
                label="密码"
                rules={[{ required: true, message: '请输入密码' }]}
              >
                <Input.Password placeholder="请输入密码" />
              </Form.Item>
            </>
          )}
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>
          {role === 'student' && (
            <Form.Item
              name="studentNo"
              label="学号"
            >
              <Input placeholder="请输入学号" />
            </Form.Item>
          )}
          {role === 'teacher' && (
            <Form.Item
              name="teacherNo"
              label="工号"
            >
              <Input placeholder="请输入工号" />
            </Form.Item>
          )}
          {role === 'student' && (
            <>
              <Form.Item name="gradeId" label="年级">
                <Select
                  placeholder="请选择年级"
                  allowClear
                  onChange={(value) => {
                    form.setFieldValue('classId', undefined);
                    fetchClasses(value);
                  }}
                >
                  {grades.map((g) => (
                    <Option key={g.id} value={g.id}>{g.name}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="classId" label="班级">
                <Select placeholder="请选择班级" allowClear>
                  {classes.map((c) => (
                    <Option key={c.id} value={c.id}>{c.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </>
          )}
          <Form.Item name="email" label="邮箱">
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item name="phone" label="电话">
            <Input placeholder="请输入电话" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="重置密码"
        open={isResetPasswordModalOpen}
        onOk={handleResetPasswordSubmit}
        onCancel={() => setIsResetPasswordModalOpen(false)}
      >
        <Form form={resetPasswordForm} layout="vertical">
          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码至少6位' },
            ]}
          >
            <Input.Password placeholder="请输入新密码" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="确认密码"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="请再次输入新密码" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StudentManagement;
