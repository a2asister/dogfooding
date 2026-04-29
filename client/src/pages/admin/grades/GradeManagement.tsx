import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Space,
  Card,
  Collapse,
  Tag,
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { gradeApi } from '@/services';
import type { Grade, Class } from '@/types';

const { Panel } = Collapse;

const GradeManagement: React.FC = () => {
  const [gradeForm] = Form.useForm();
  const [classForm] = Form.useForm();
  const [data, setData] = useState<Grade[]>([]);
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [currentGradeId, setCurrentGradeId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await gradeApi.getGrades();
      if (res.success) {
        setData(res.data || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateGrade = () => {
    setEditingGrade(null);
    gradeForm.resetFields();
    setIsGradeModalOpen(true);
  };

  const handleEditGrade = (record: Grade) => {
    setEditingGrade(record);
    gradeForm.setFieldsValue({
      name: record.name,
      year: record.year,
      description: record.description,
    });
    setIsGradeModalOpen(true);
  };

  const handleDeleteGrade = async (id: string) => {
    try {
      const res = await gradeApi.deleteGrade(id);
      if (res.success) {
        message.success('删除成功');
        fetchData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateClass = (gradeId: string) => {
    setCurrentGradeId(gradeId);
    setEditingClass(null);
    classForm.resetFields();
    setIsClassModalOpen(true);
  };

  const handleEditClass = (cls: Class) => {
    setCurrentGradeId(cls.gradeId);
    setEditingClass(cls);
    classForm.setFieldsValue({
      name: cls.name,
      description: cls.description,
    });
    setIsClassModalOpen(true);
  };

  const handleDeleteClass = async (gradeId: string, classId: string) => {
    try {
      const res = await gradeApi.deleteClass(gradeId, classId);
      if (res.success) {
        message.success('删除成功');
        fetchData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmitGrade = async () => {
    try {
      const values = await gradeForm.validateFields();
      if (editingGrade) {
        const res = await gradeApi.updateGrade(editingGrade.id, {
          name: values.name,
          year: values.year,
          description: values.description,
        });
        if (res.success) {
          message.success('更新成功');
          setIsGradeModalOpen(false);
          fetchData();
        }
      } else {
        const res = await gradeApi.createGrade({
          name: values.name,
          year: values.year,
          description: values.description,
        });
        if (res.success) {
          message.success('创建成功');
          setIsGradeModalOpen(false);
          fetchData();
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmitClass = async () => {
    if (!currentGradeId) return;
    try {
      const values = await classForm.validateFields();
      if (editingClass) {
        const res = await gradeApi.updateClass(currentGradeId, editingClass.id, {
          name: values.name,
          description: values.description,
        });
        if (res.success) {
          message.success('更新成功');
          setIsClassModalOpen(false);
          fetchData();
        }
      } else {
        const res = await gradeApi.createClass(currentGradeId, {
          name: values.name,
          description: values.description,
        });
        if (res.success) {
          message.success('创建成功');
          setIsClassModalOpen(false);
          fetchData();
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const classColumns: ColumnsType<Class> = [
    {
      title: '序号',
      key: 'index',
      width: 60,
      render: (_: unknown, __: Class, index: number) => index + 1,
    },
    {
      title: '班级名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
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
      width: 150,
      render: (_: unknown, record: Class) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEditClass(record)}>
            编辑
          </Button>
          <Popconfirm title="确定要删除吗？" onConfirm={() => handleDeleteClass(record.gradeId, record.id)}>
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
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateGrade}>
            新增年级
          </Button>
          <Button icon={<ReloadOutlined />} onClick={fetchData}>
            刷新
          </Button>
        </Space>
      </Card>

      <Card>
        <Collapse defaultActiveKey={['1']}>
          {data.map((grade) => {
            const classes = (grade as unknown as Record<string, unknown>).classes as Class[] || [];
            return (
              <Panel
                header={
                  <Space>
                    <span style={{ fontWeight: 600 }}>{grade.name}</span>
                    <Tag>{grade.year}学年</Tag>
                    <Tag color="blue">{classes.length}个班级</Tag>
                  </Space>
                }
                key={grade.id}
                extra={
                  <Space onClick={(e) => e.stopPropagation()}>
                    <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEditGrade(grade)}>
                      编辑
                    </Button>
                    <Button type="link" size="small" icon={<PlusOutlined />} onClick={() => handleCreateClass(grade.id)}>
                      新增班级
                    </Button>
                    <Popconfirm title="确定要删除吗？" onConfirm={() => handleDeleteGrade(grade.id)}>
                      <Button type="link" size="small" danger icon={<DeleteOutlined />}>
                        删除
                      </Button>
                    </Popconfirm>
                  </Space>
                }
              >
                <Table
                  columns={classColumns}
                  dataSource={classes}
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
              </Panel>
            );
          })}
        </Collapse>
      </Card>

      <Modal
        title={editingGrade ? '编辑年级' : '新增年级'}
        open={isGradeModalOpen}
        onOk={handleSubmitGrade}
        onCancel={() => setIsGradeModalOpen(false)}
      >
        <Form form={gradeForm} layout="vertical">
          <Form.Item
            name="name"
            label="年级名称"
            rules={[{ required: true, message: '请输入年级名称' }]}
          >
            <Input placeholder="例如：2024级" />
          </Form.Item>
          <Form.Item
            name="year"
            label="学年"
            rules={[{ required: true, message: '请选择学年' }]}
          >
            <Input placeholder="例如：2024-2025" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="请输入年级描述" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingClass ? '编辑班级' : '新增班级'}
        open={isClassModalOpen}
        onOk={handleSubmitClass}
        onCancel={() => setIsClassModalOpen(false)}
      >
        <Form form={classForm} layout="vertical">
          <Form.Item
            name="name"
            label="班级名称"
            rules={[{ required: true, message: '请输入班级名称' }]}
          >
            <Input placeholder="例如：计算机科学与技术1班" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="请输入班级描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default GradeManagement;
