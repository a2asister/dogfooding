import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Tabs, Tag, Modal, Form, Rate, Input, message } from 'antd';
import { StarOutlined } from '@ant-design/icons';
import { studentApi } from '../../api';
import { Evaluation } from '../../types';

const { TextArea } = Input;

const Evaluations: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState<Evaluation[]>([]);
  const [history, setHistory] = useState<Evaluation[]>([]);
  const [evaluateModal, setEvaluateModal] = useState<{ visible: boolean; evaluation: Evaluation | null }>({
    visible: false,
    evaluation: null,
  });
  const [form] = Form.useForm();

  useEffect(() => {
    loadEvaluations();
  }, []);

  const loadEvaluations = async () => {
    setLoading(true);
    try {
      const data = await studentApi.getEvaluations();
      setPending(data.pending || []);
      setHistory(data.history || []);
    } catch (error) {
      console.error('加载评教失败', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    if (!evaluateModal.evaluation) return;
    try {
      await studentApi.submitEvaluation(evaluateModal.evaluation.id, values);
      message.success('评教提交成功');
      setEvaluateModal({ visible: false, evaluation: null });
      form.resetFields();
      loadEvaluations();
    } catch (error) {
      console.error('提交评教失败', error);
    }
  };

  const pendingColumns = [
    { title: '课程名称', dataIndex: 'courseName', key: 'courseName' },
    { title: '授课教师', dataIndex: 'teacherName', key: 'teacherName', width: 120 },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: any, record: Evaluation) => (
        <Button
          type="primary"
          size="small"
          icon={<StarOutlined />}
          onClick={() => {
            setEvaluateModal({ visible: true, evaluation: record });
            form.resetFields();
          }}
        >
          评教
        </Button>
      ),
    },
  ];

  const historyColumns = [
    { title: '课程名称', dataIndex: 'courseName', key: 'courseName' },
    { title: '授课教师', dataIndex: 'teacherName', key: 'teacherName', width: 120 },
    {
      title: '教学水平',
      dataIndex: 'teachingScore',
      key: 'teachingScore',
      width: 120,
      render: (score: number) => <Rate disabled value={score} allowHalf />,
    },
    {
      title: '课程内容',
      dataIndex: 'contentScore',
      key: 'contentScore',
      width: 120,
      render: (score: number) => <Rate disabled value={score} allowHalf />,
    },
    {
      title: '综合评分',
      dataIndex: 'overallScore',
      key: 'overallScore',
      width: 120,
      render: (score: number) => <Rate disabled value={score} allowHalf />,
    },
    { title: '评价', dataIndex: 'comment', key: 'comment' },
  ];

  return (
    <div>
      <Card
        className="card-shadow"
        title={<><StarOutlined /> 期末评教</>}
        extra={<Tag color="red">待评教 {pending.length} 门课程</Tag>}
      >
        <Tabs
          items={[
            {
              key: 'pending',
              label: `待评教 (${pending.length})`,
              children: (
                <Table
                  loading={loading}
                  dataSource={pending}
                  columns={pendingColumns}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
              ),
            },
            {
              key: 'history',
              label: `评教历史 (${history.length})`,
              children: (
                <Table
                  loading={loading}
                  dataSource={history}
                  columns={historyColumns}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title="课程评教"
        open={evaluateModal.visible}
        onOk={form.submit}
        onCancel={() => setEvaluateModal({ visible: false, evaluation: null })}
        okText="提交评教"
        cancelText="取消"
        width={500}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <p>课程：<strong>{evaluateModal.evaluation?.courseName}</strong></p>
            <p>教师：<strong>{evaluateModal.evaluation?.teacherName}</strong></p>
          </div>
          <Form.Item
            label="教学水平"
            name="teachingScore"
            rules={[{ required: true, message: '请对教学水平进行评分' }]}
          >
            <Rate allowHalf />
          </Form.Item>
          <Form.Item
            label="课程内容"
            name="contentScore"
            rules={[{ required: true, message: '请对课程内容进行评分' }]}
          >
            <Rate allowHalf />
          </Form.Item>
          <Form.Item
            label="综合评分"
            name="overallScore"
            rules={[{ required: true, message: '请进行综合评分' }]}
          >
            <Rate allowHalf />
          </Form.Item>
          <Form.Item label="评价建议" name="comment">
            <TextArea rows={4} placeholder="请输入您的评价和建议（选填）" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Evaluations;
