import React, { useState } from 'react';
import {
  Card,
  Table,
  Tabs,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Tag,
  message,
  Timeline,
  Badge,
} from 'antd';
import { PlusOutlined, BellOutlined, FileTextOutlined, CalendarOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

const Admin = () => {
  const [notices, setNotices] = useState([
    { id: '1', title: '春节放假通知', content: '春节假期安排：2月10日至2月17日放假', publishDate: '2024-01-15', status: 'published', type: 'notice' },
    { id: '2', title: '新员工入职培训', content: '本周三下午2点在会议室A进行新员工培训', publishDate: '2024-01-12', status: 'published', type: 'notice' },
    { id: '3', title: '办公区域调整通知', content: '因业务发展需要，部分办公区域将进行调整', publishDate: '2024-01-10', status: 'draft', type: 'notice' },
  ]);

  const [documents, setDocuments] = useState([
    { id: '1', name: '员工手册_2024版.pdf', type: 'PDF', size: '2.5MB', uploadDate: '2024-01-15', category: '规章制度' },
    { id: '2', name: '财务报销流程.docx', type: 'Word', size: '180KB', uploadDate: '2024-01-10', category: '流程文档' },
    { id: '3', name: '采购申请模板.xlsx', type: 'Excel', size: '25KB', uploadDate: '2024-01-08', category: '模板文件' },
  ]);

  const [events, setEvents] = useState([
    { id: '1', title: '年度总结大会', date: '2024-01-25', time: '14:00', location: '大会议室', status: 'scheduled' },
    { id: '2', title: '新员工入职培训', date: '2024-01-18', time: '09:00', location: '培训室A', status: 'scheduled' },
    { id: '3', title: '部门例会', date: '2024-01-15', time: '10:00', location: '会议室B', status: 'completed' },
  ]);

  const [noticeModalVisible, setNoticeModalVisible] = useState(false);
  const [form] = Form.useForm();

  const noticeColumns = [
    { title: '标题', dataIndex: 'title', key: 'title' },
    { title: '发布日期', dataIndex: 'publishDate', key: 'publishDate' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'published' ? 'green' : 'orange'}>
          {status === 'published' ? '已发布' : '草稿'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <>
          <Button type="link" size="small">编辑</Button>
          <Button type="link" size="small" danger>删除</Button>
        </>
      ),
    },
  ];

  const documentColumns = [
    { title: '文件名', dataIndex: 'name', key: 'name' },
    { title: '类型', dataIndex: 'type', key: 'type' },
    { title: '大小', dataIndex: 'size', key: 'size' },
    { title: '分类', dataIndex: 'category', key: 'category' },
    { title: '上传日期', dataIndex: 'uploadDate', key: 'uploadDate' },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <>
          <Button type="link" size="small">下载</Button>
          <Button type="link" size="small" danger>删除</Button>
        </>
      ),
    },
  ];

  const eventColumns = [
    { title: '活动名称', dataIndex: 'title', key: 'title' },
    { title: '日期', dataIndex: 'date', key: 'date' },
    { title: '时间', dataIndex: 'time', key: 'time' },
    { title: '地点', dataIndex: 'location', key: 'location' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'scheduled' ? 'blue' : 'green'}>
          {status === 'scheduled' ? '已安排' : '已完成'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <>
          <Button type="link" size="small">编辑</Button>
          <Button type="link" size="small" danger>删除</Button>
        </>
      ),
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>行政管理</h2>
      
      <Tabs defaultActiveKey="notices">
        <TabPane tab="公告通知" key="notices">
          <Card
            extra={
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setNoticeModalVisible(true)}>
                发布公告
              </Button>
            }
          >
            <Table
              columns={noticeColumns}
              dataSource={notices}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>
        
        <TabPane tab="文档管理" key="documents">
          <Card
            extra={
              <Button type="primary" icon={<PlusOutlined />}>
                上传文档
              </Button>
            }
          >
            <Table
              columns={documentColumns}
              dataSource={documents}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>
        
        <TabPane tab="活动管理" key="events">
          <Card
            extra={
              <Button type="primary" icon={<PlusOutlined />}>
                新增活动
              </Button>
            }
          >
            <Table
              columns={eventColumns}
              dataSource={events}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>
      </Tabs>

      <Modal
        title="发布公告"
        open={noticeModalVisible}
        onOk={() => {
          form.validateFields().then((values) => {
            const newNotice = {
              ...values,
              id: Date.now().toString(),
              publishDate: new Date().toISOString().split('T')[0],
              status: 'published',
            };
            setNotices([newNotice, ...notices]);
            message.success('发布成功');
            setNoticeModalVisible(false);
            form.resetFields();
          });
        }}
        onCancel={() => setNoticeModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="公告标题"
            rules={[{ required: true, message: '请输入公告标题' }]}
          >
            <Input placeholder="请输入公告标题" />
          </Form.Item>
          <Form.Item
            name="type"
            label="公告类型"
            rules={[{ required: true, message: '请选择公告类型' }]}
          >
            <Select placeholder="请选择公告类型">
              <Option value="notice">通知公告</Option>
              <Option value="policy">政策法规</Option>
              <Option value="activity">活动通知</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="content"
            label="公告内容"
            rules={[{ required: true, message: '请输入公告内容' }]}
          >
            <TextArea rows={6} placeholder="请输入公告内容" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Admin;
