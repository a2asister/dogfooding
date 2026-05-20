import { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, DatePicker, Space, message, Tag, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckOutlined } from '@ant-design/icons';
import { homeworkAPI } from '../../services/api';
import { Homework } from '../../types';

const { Option } = Select;
const { RangePicker } = DatePicker;

export const TeacherHomeworkPage = () => {
  const [homeworkList, setHomeworkList] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadHomework();
  }, []);

  const loadHomework = async () => {
    try {
      const response = await homeworkAPI.getHomework();
      setHomeworkList(response.data.homework);
    } catch (err) {
      console.error('Failed to load homework:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (values: {
    title: string;
    description: string;
    courseId: string;
    classIds: string[];
    deadline: [Date, Date];
  }) => {
    try {
      await homeworkAPI.createHomework({
        ...values,
        deadline: values.deadline[1].toISOString(),
      });
      message.success('作业发布成功');
      setModalVisible(false);
      form.resetFields();
      loadHomework();
    } catch (err) {
      message.error('发布失败');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await homeworkAPI.deleteHomework(id);
      message.success('删除成功');
      loadHomework();
    } catch (err) {
      message.error('删除失败');
    }
  };

  const handleGrade = (id: string) => {
    Modal.info({
      title: '批改作业',
      content: (
        <div>
          <p>这里可以查看学生提交的作业代码并进行批改。</p>
          <p>功能：评分、写评语、打回重做</p>
        </div>
      ),
    });
  };

  const columns = [
    {
      title: '作业名称',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => <span className="font-medium">{text}</span>,
    },
    {
      title: '所属课程',
      dataIndex: 'courseTitle',
      key: 'courseTitle',
    },
    {
      title: '班级',
      dataIndex: 'classNames',
      key: 'classNames',
      render: (names: string[]) => names?.map((n) => <Tag key={n}>{n}</Tag>),
    },
    {
      title: '提交情况',
      key: 'submission',
      render: (_, record: Homework) => (
        <span>
          {record.submittedCount || 0}/{record.totalCount || 0} 人提交
        </span>
      ),
    },
    {
      title: '截止时间',
      dataIndex: 'deadline',
      key: 'deadline',
      render: (deadline: string) => new Date(deadline).toLocaleDateString(),
    },
    {
      title: '状态',
      key: 'status',
      render: (_, record: Homework) => {
        const now = new Date();
        const deadline = new Date(record.deadline);
        if (now > deadline) return <Tag color="error">已截止</Tag>;
        return <Tag color="success">进行中</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record: Homework) => (
        <Space>
          <Button size="small" icon={<CheckOutlined />} onClick={() => handleGrade(record.id)}>
            批改
          </Button>
          <Button size="small" icon={<EditOutlined />}>
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这份作业吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">📝 作业管理</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalVisible(true)}
        >
          发布作业
        </Button>
      </div>

      <Card className="shadow-sm">
        <Table
          dataSource={homeworkList}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="发布作业"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handlePublish}>
          <Form.Item
            name="title"
            label="作业名称"
            rules={[{ required: true, message: '请输入作业名称' }]}
          >
            <Input placeholder="例如：第一单元课后练习" />
          </Form.Item>
          <Form.Item
            name="description"
            label="作业要求"
            rules={[{ required: true, message: '请输入作业要求' }]}
          >
            <Input.TextArea rows={4} placeholder="详细描述作业要求" />
          </Form.Item>
          <Form.Item
            name="courseId"
            label="所属课程"
            rules={[{ required: true, message: '请选择课程' }]}
          >
            <Select placeholder="选择课程">
              <Option value="1">Scratch 启蒙课程</Option>
              <Option value="2">Python 基础课程</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="classIds"
            label="发布班级"
            rules={[{ required: true, message: '请选择班级' }]}
          >
            <Select mode="multiple" placeholder="选择要发布的班级">
              <Option value="1">三年级编程一班</Option>
              <Option value="2">四年级编程二班</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="deadline"
            label="截止时间"
            rules={[{ required: true, message: '请选择截止时间' }]}
          >
            <RangePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item>
            <div className="flex justify-end gap-2">
              <Button onClick={() => setModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">发布</Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TeacherHomeworkPage;
