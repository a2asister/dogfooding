import { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Space, Modal, message, Empty, Spin } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { homeworkAPI } from '../../services/api';
import { HomeworkSubmission } from '../../types';

export const HomeworkPage = () => {
  const navigate = useNavigate();
  const [homeworkList, setHomeworkList] = useState<HomeworkSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHomework();
  }, []);

  const loadHomework = async () => {
    try {
      const response = await homeworkAPI.getMyHomework();
      setHomeworkList(response.data.homework);
    } catch (err) {
      console.error('Failed to load homework:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (homework: HomeworkSubmission) => {
    Modal.confirm({
      title: '提交作业',
      content: '确定要提交这份作业吗？提交后将进入批改流程。',
      onOk: async () => {
        try {
          await homeworkAPI.submitHomework(homework.id, {
            blocksXml: '',
            code: '',
          });
          message.success('作业已提交！');
          loadHomework();
        } catch (err) {
          message.error('提交失败，请重试');
        }
      },
    });
  };

  const columns = [
    {
      title: '作业名称',
      dataIndex: 'homeworkTitle',
      key: 'homeworkTitle',
      render: (text: string) => <span className="font-medium">{text}</span>,
    },
    {
      title: '所属课程',
      dataIndex: 'courseTitle',
      key: 'courseTitle',
    },
    {
      title: '截止时间',
      dataIndex: 'deadline',
      key: 'deadline',
      render: (deadline: string) => (
        <span className={new Date(deadline) < new Date() ? 'text-red-500' : ''}>
          {new Date(deadline).toLocaleDateString()}
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: HomeworkSubmission) => {
        const isOverdue = new Date(record.deadline) < new Date();
        if (status === 'submitted' || status === 'graded') {
          return <Tag color="success"><CheckCircleOutlined /> 已提交</Tag>;
        }
        if (isOverdue) {
          return <Tag color="error"><CloseCircleOutlined /> 已逾期</Tag>;
        }
        return <Tag color="warning"><ClockCircleOutlined /> 待提交</Tag>;
      },
    },
    {
      title: '得分',
      dataIndex: 'score',
      key: 'score',
      render: (score: number | null) => {
        if (score === null) return '-';
        return <span className={score >= 60 ? 'text-green-600' : 'text-red-500'}>{score}分</span>;
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record: HomeworkSubmission) => (
        <Space>
          {record.status === 'pending' && (
            <Button
              type="primary"
              size="small"
              onClick={() => handleSubmit(record)}
            >
              提交作业
            </Button>
          )}
          {record.status === 'graded' && (
            <Button
              size="small"
              onClick={() => Modal.info({
                title: '老师评语',
                content: record.feedback || '暂无评语',
              })}
            >
              查看评语
            </Button>
          )}
          <Button
            size="small"
            onClick={() => navigate(`/editor?homeworkId=${record.id}`)}
          >
            编辑
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">📝 课后作业</h2>
        <div className="flex gap-2">
          <Tag color="warning">待提交: {homeworkList.filter((h) => h.status === 'pending').length}</Tag>
          <Tag color="success">已完成: {homeworkList.filter((h) => h.status === 'graded').length}</Tag>
        </div>
      </div>

      <Card className="shadow-sm">
        <Spin spinning={loading}>
          {homeworkList.length === 0 && !loading ? (
            <Empty description="暂无作业" />
          ) : (
            <Table
              dataSource={homeworkList}
              columns={columns}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          )}
        </Spin>
      </Card>
    </div>
  );
};

export default HomeworkPage;
