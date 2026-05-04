import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Tag,
  Tabs,
  Space,
  message,
  Popconfirm,
  Spin,
  Empty,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, LoadingOutlined } from '@ant-design/icons';
import hrService from '../services/hrService';
import dayjs from 'dayjs';

const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

const HR = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employeeModalVisible, setEmployeeModalVisible] = useState(false);
  const [departmentModalVisible, setDepartmentModalVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deptLoading, setDeptLoading] = useState(false);
  const [form] = Form.useForm();
  const [deptForm] = Form.useForm();

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await hrService.getEmployees();
      setEmployees(data || []);
    } catch (error) {
      console.error('获取员工列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      setDeptLoading(true);
      const data = await hrService.getDepartments();
      setDepartments(data || []);
    } catch (error) {
      console.error('获取部门列表失败:', error);
    } finally {
      setDeptLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
  }, []);

  const employeeColumns = [
    { title: '员工编号', dataIndex: 'employeeNo', key: 'employeeNo' },
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '部门', dataIndex: 'department', key: 'department' },
    { title: '职位', dataIndex: 'position', key: 'position' },
    { title: '联系电话', dataIndex: 'phone', key: 'phone' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colorMap = {
          active: 'green',
          onLeave: 'orange',
          resigned: 'red',
        };
        const textMap = {
          active: '在职',
          onLeave: '休假',
          resigned: '已离职',
        };
        return <Tag color={colorMap[status] || 'default'}>{textMap[status] || status}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditEmployee(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除该员工吗？"
            onConfirm={() => handleDeleteEmployee(record.id)}
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

  const departmentColumns = [
    { title: '部门名称', dataIndex: 'name', key: 'name' },
    { title: '部门负责人', dataIndex: 'manager', key: 'manager' },
    { title: '员工人数', dataIndex: 'employeeCount', key: 'employeeCount' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '正常' : '停用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" icon={<EditOutlined />}>编辑</Button>
          <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
        </Space>
      ),
    },
  ];

  const handleEditEmployee = (record) => {
    setEditingEmployee(record);
    form.setFieldsValue({
      ...record,
      joinDate: record.joinDate ? dayjs(record.joinDate) : null,
    });
    setEmployeeModalVisible(true);
  };

  const handleDeleteEmployee = async (id) => {
    try {
      await hrService.deleteEmployee(id);
      message.success('删除成功');
      fetchEmployees();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleAddEmployee = () => {
    setEditingEmployee(null);
    form.resetFields();
    setEmployeeModalVisible(true);
  };

  const handleEmployeeSubmit = async () => {
    try {
      const values = await form.validateFields();
      const submitData = {
        ...values,
        joinDate: values.joinDate ? values.joinDate.format('YYYY-MM-DD') : null,
      };

      if (editingEmployee) {
        await hrService.updateEmployee(editingEmployee.id, submitData);
        message.success('更新成功');
      } else {
        await hrService.createEmployee(submitData);
        message.success('添加成功');
      }

      setEmployeeModalVisible(false);
      fetchEmployees();
    } catch (error) {
      console.error('提交失败:', error);
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>人事管理</h2>
      
      <Tabs defaultActiveKey="employees">
        <TabPane tab="员工管理" key="employees">
          <Card
            extra={
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddEmployee}>
                添加员工
              </Button>
            }
          >
            <Spin spinning={loading} indicator={<LoadingOutlined spin />}>
              {!loading && employees.length === 0 ? (
                <Empty description="暂无员工数据" />
              ) : (
                <Table
                  columns={employeeColumns}
                  dataSource={employees}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
              )}
            </Spin>
          </Card>
        </TabPane>
        
        <TabPane tab="部门管理" key="departments">
          <Card
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setDepartmentModalVisible(true)}
              >
                添加部门
              </Button>
            }
          >
            <Spin spinning={deptLoading}>
              {!deptLoading && departments.length === 0 ? (
                <Empty description="暂无部门数据" />
              ) : (
                <Table
                  columns={departmentColumns}
                  dataSource={departments}
                  rowKey="id"
                  pagination={false}
                />
              )}
            </Spin>
          </Card>
        </TabPane>
        
        <TabPane tab="考勤管理" key="attendance">
          <Card>
            <p style={{ textAlign: 'center', color: '#999', padding: 40 }}>
              考勤管理功能模块
            </p>
          </Card>
        </TabPane>
      </Tabs>

      <Modal
        title={editingEmployee ? '编辑员工' : '添加员工'}
        open={employeeModalVisible}
        onOk={handleEmployeeSubmit}
        onCancel={() => setEmployeeModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item
            name="employeeNo"
            label="员工编号"
            rules={[{ required: true, message: '请输入员工编号' }]}
          >
            <Input placeholder="请输入员工编号" />
          </Form.Item>
          <Form.Item
            name="department"
            label="部门"
            rules={[{ required: true, message: '请选择部门' }]}
          >
            <Select placeholder="请选择部门">
              {departments.map((dept) => (
                <Option key={dept.id} value={dept.name}>
                  {dept.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="position" label="职位">
            <Input placeholder="请输入职位" />
          </Form.Item>
          <Form.Item name="phone" label="联系电话">
            <Input placeholder="请输入联系电话" />
          </Form.Item>
          <Form.Item name="email" label="邮箱">
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              <Option value="active">在职</Option>
              <Option value="onLeave">休假</Option>
              <Option value="resigned">已离职</Option>
            </Select>
          </Form.Item>
          <Form.Item name="joinDate" label="入职日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="添加部门"
        open={departmentModalVisible}
        onOk={async () => {
          try {
            const values = await deptForm.validateFields();
            await hrService.createDepartment({
              ...values,
              employeeCount: 0,
              status: 'active',
            });
            message.success('添加成功');
            setDepartmentModalVisible(false);
            fetchDepartments();
          } catch (error) {
            console.error('添加部门失败:', error);
          }
        }}
        onCancel={() => setDepartmentModalVisible(false)}
      >
        <Form form={deptForm} layout="vertical">
          <Form.Item
            name="name"
            label="部门名称"
            rules={[{ required: true, message: '请输入部门名称' }]}
          >
            <Input placeholder="请输入部门名称" />
          </Form.Item>
          <Form.Item name="manager" label="部门负责人">
            <Input placeholder="请输入部门负责人" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default HR;
