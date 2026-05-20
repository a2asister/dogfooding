import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Space, Tag, Avatar, Badge, Descriptions, List, Modal, Form, Input, Select, message, Row, Col, Alert } from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined, CloseCircleOutlined, CommentOutlined } from '@ant-design/icons';
import { prApi } from '@/api';
import type { PullRequest, PRReview } from '@/types';
import dayjs from 'dayjs';

function PullRequestDetail(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pr, setPr] = useState<PullRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [mergeCheck, setMergeCheck] = useState<{ canMerge: boolean; reasons: string[] } | null>(null);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchData = async (): Promise<void> => {
    if (!id) return;
    try {
      const [prResult, checkResult] = await Promise.all([
        prApi.get(id),
        prApi.canMerge(id),
      ]);
      setPr(prResult.pr as PullRequest);
      setMergeCheck(checkResult);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleReview = async (values: { state: string; comment?: string }): Promise<void> => {
    if (!id) return;
    try {
      await prApi.addReview(id, values.state, values.comment);
      message.success('提交审核成功');
      setReviewModalVisible(false);
      form.resetFields();
      fetchData();
    } catch {
      // ignore
    }
  };

  const getStateTag = (prState: string): JSX.Element => {
    const map: Record<string, { color: string; text: string }> = {
      open: { color: 'green', text: '开放' },
      closed: { color: 'red', text: '关闭' },
      merged: { color: 'purple', text: '已合并' },
    };
    const t = map[prState] || map.open;
    return <Tag color={t.color}>{t.text}</Tag>;
  };

  const getCiStatusBadge = (status: string): JSX.Element => {
    const map: Record<string, { status: 'success' | 'processing' | 'error' | 'warning' | 'default'; text: string }> = {
      success: { status: 'success', text: 'CI 检查通过' },
      failed: { status: 'error', text: 'CI 检查失败' },
      pending: { status: 'processing', text: 'CI 进行中' },
      skipped: { status: 'default', text: 'CI 跳过' },
    };
    const t = map[status] || map.pending;
    return <Badge status={t.status} text={t.text} />;
  };

  const getReviewStateIcon = (state: string): JSX.Element => {
    const map: Record<string, JSX.Element> = {
      approved: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      changes_requested: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
      commented: <CommentOutlined style={{ color: '#1890ff' }} />,
    };
    return map[state] || <CommentOutlined />;
  };

  const getReviewStateText = (state: string): string => {
    const map: Record<string, string> = {
      approved: '批准',
      changes_requested: '请求修改',
      commented: '评论',
    };
    return map[state] || state;
  };

  if (loading) {
    return <Card loading />;
  }

  if (!pr) {
    return <Card>PR 不存在</Card>;
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
            返回
          </Button>
          {getStateTag(pr.state)}
          {getCiStatusBadge(pr.ciStatus)}
          {pr.mergeable && <Tag color="green">可合并</Tag>}
        </Space>

        <h2 style={{ marginBottom: 8 }}>#{pr.number} {pr.title}</h2>
        <Space style={{ color: '#888', marginBottom: 16 }}>
          <Avatar size={20} src={pr.authorAvatar}>
            {pr.author?.[0]?.toUpperCase()}
          </Avatar>
          <span>{pr.author}</span>
          <span>想要将</span>
          <Tag color="blue">{pr.headBranch}</Tag>
          <span>合并到</span>
          <Tag color="cyan">{pr.baseBranch}</Tag>
          <span>·</span>
          <span>{dayjs(pr.createdAt).format('YYYY-MM-DD HH:mm')} 创建</span>
        </Space>

        {pr.body && (
          <div style={{ padding: 16, background: '#f5f5f5', borderRadius: 8, marginBottom: 16 }}>
            {pr.body}
          </div>
        )}

        {mergeCheck && (
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={12}>
              {mergeCheck.canMerge ? (
                <Alert
                  message="合并检查通过"
                  description="此 PR 满足所有合并条件"
                  type="success"
                  showIcon
                />
              ) : (
                <Alert
                  message="合并检查未通过"
                  description={mergeCheck.reasons.join('；')}
                  type="error"
                  showIcon
                />
              )}
            </Col>
            <Col span={12}>
              <Alert
                message="审批情况"
                description={`已获得 ${pr.approvals.length} 人批准`}
                type={pr.approvals.length > 0 ? 'success' : 'warning'}
                showIcon
              />
            </Col>
          </Row>
        )}

        <Space wrap>
          {pr.labels.map((label) => (
            <Tag key={label} color="geekblue">
              {label}
            </Tag>
          ))}
        </Space>
      </Card>

      <Descriptions title="基本信息" bordered column={2} size="small">
        <Descriptions.Item label="PR 编号">{pr.number}</Descriptions.Item>
        <Descriptions.Item label="状态">{pr.state}</Descriptions.Item>
        <Descriptions.Item label="源分支">{pr.headBranch}</Descriptions.Item>
        <Descriptions.Item label="目标分支">{pr.baseBranch}</Descriptions.Item>
        <Descriptions.Item label="CI 状态">{pr.ciStatus}</Descriptions.Item>
        <Descriptions.Item label="可合并">{pr.mergeable ? '是' : '否'}</Descriptions.Item>
        <Descriptions.Item label="合并状态">{pr.mergeStateStatus || '-'}</Descriptions.Item>
        <Descriptions.Item label="创建时间">{dayjs(pr.createdAt).format('YYYY-MM-DD HH:mm')}</Descriptions.Item>
      </Descriptions>

      <Card
        title={`审核记录 (${pr.reviews.length})`}
        extra={
          pr.state === 'open' && (
            <Button type="primary" onClick={() => setReviewModalVisible(true)}>
              提交审核
            </Button>
          )
        }
      >
        {pr.reviews.length > 0 ? (
          <List
            dataSource={pr.reviews}
            renderItem={(item: PRReview) => (
              <List.Item key={item.id}>
                <List.Item.Meta
                  avatar={<Avatar size={36}>{item.reviewer?.[0]?.toUpperCase()}</Avatar>}
                  title={
                    <Space>
                      <strong>{item.reviewer}</strong>
                      {getReviewStateIcon(item.state)}
                      <Tag color={item.state === 'approved' ? 'green' : item.state === 'changes_requested' ? 'red' : 'blue'}>
                        {getReviewStateText(item.state)}
                      </Tag>
                      <span style={{ color: '#888', fontSize: 12 }}>
                        {dayjs(item.submittedAt).format('YYYY-MM-DD HH:mm')}
                      </span>
                    </Space>
                  }
                  description={item.comment || '无评论'}
                />
              </List.Item>
            )}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: 24, color: '#888' }}>
            暂无审核记录
          </div>
        )}
      </Card>

      <Modal
        title="提交审核"
        open={reviewModalVisible}
        onCancel={() => {
          setReviewModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleReview}>
          <Form.Item name="state" label="审核结果" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="approved">批准</Select.Option>
              <Select.Option value="changes_requested">请求修改</Select.Option>
              <Select.Option value="commented">仅评论</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="comment" label="评论内容">
            <Input.TextArea rows={4} placeholder="请输入评论内容..." />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              提交
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}

export default PullRequestDetail;
