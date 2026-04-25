import { useEffect } from 'react';
import { Card, Typography, Alert, Table, Tag, Space, Button } from 'antd';
import { useHospitalStore } from '../../stores/hospitalStore';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Doctor, Department } from '../../types';

const { Title, Text } = Typography;

export default function DoctorManagement() {
  const { doctors, departments, loadAll } = useHospitalStore();

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const getDepartmentName = (deptId: string) => {
    const dept = departments.find((d) => d.id === deptId);
    return dept?.name || '-';
  };

  const columns: ColumnsType<Doctor> = [
    {
      title: '医生姓名',
      dataIndex: 'title',
      key: 'title',
      render: (_, record) => {
        const user = useHospitalStore
          .getState()
          .medicalStaff.find((u) => u.id === record.userId);
        return user?.name || '-';
      },
    },
    {
      title: '职称',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '科室',
      dataIndex: 'departmentId',
      key: 'departmentId',
      render: (deptId: string) => (
        <Tag color="blue">{getDepartmentName(deptId)}</Tag>
      ),
    },
    {
      title: '专长',
      dataIndex: 'specialization',
      key: 'specialization',
    },
    {
      title: '执业证号',
      dataIndex: 'licenseNumber',
      key: 'licenseNumber',
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Space>
          <Button type="link" icon={<EditOutlined />}>
            编辑
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />}>
            删除
          </Button>
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
          医生管理
        </Title>
        <Button type="primary" icon={<PlusOutlined />}>
          新增医生
        </Button>
      </div>

      <Card>
        <Alert
          message="提示"
          description="医生信息与用户账号关联。请先在用户管理中创建医护人员账号，再在此处添加医生信息。"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Table columns={columns} dataSource={doctors} rowKey="id" size="middle" />
      </Card>
    </div>
  );
}
