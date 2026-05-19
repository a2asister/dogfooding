import React, { useEffect, useState } from 'react';
import { Card, Row, Col, List, Tag, Statistic, Progress, Avatar } from 'antd';
import {
  CalendarOutlined,
  TrophyOutlined,
  StarOutlined,
  MessageOutlined,
  BookOutlined,
  NotificationOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { studentApi } from '../../api';
import { DashboardData } from '../../types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await studentApi.getDashboard();
      setData(res);
    } catch (error) {
      console.error('加载数据失败', error);
    } finally {
      setLoading(false);
    }
  };

  const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  const today = new Date().getDay() || 7;

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: '20px' }}>
        <Col span={6}>
          <Card className="card-shadow">
            <Statistic
              title="平均绩点"
              value={data?.gpa || 0}
              precision={1}
              prefix={<TrophyOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="card-shadow">
            <Statistic
              title="已修学分"
              value={data?.totalCredits || 0}
              suffix="学分"
              prefix={<BookOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="card-shadow" onClick={() => navigate('/student/evaluations')} style={{ cursor: 'pointer' }}>
            <Statistic
              title="待评教课程"
              value={data?.pendingEvaluations || 0}
              prefix={<StarOutlined style={{ color: '#f5222d' }} />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="card-shadow" onClick={() => navigate('/student/messages')} style={{ cursor: 'pointer' }}>
            <Statistic
              title="未读消息"
              value={data?.unreadCount || 0}
              prefix={<MessageOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={16}>
          <Card
            className="card-shadow"
            title={<><CalendarOutlined /> 今日课表（{weekDays[today - 1]}）</>}
            style={{ marginBottom: '20px' }}
            loading={loading}
            onClick={() => navigate('/student/schedule')}
            extra={<Tag color="blue">{data?.todaySchedules?.length || 0} 门课程</Tag>}
          >
            <List
              dataSource={data?.todaySchedules || []}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        style={{ backgroundColor: '#1677ff', verticalAlign: 'middle' }}
                      >
                        {item.startPeriod}-{item.endPeriod}
                      </Avatar>
                    }
                    title={item.courseName}
                    description={
                      <div>
                        <span style={{ marginRight: '15px' }}>👨‍🏫 {item.teacher}</span>
                        <span>📍 {item.location}</span>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>

          <Card
            className="card-shadow"
            title={<><NotificationOutlined /> 最新通知</>}
            onClick={() => navigate('/student/messages')}
            style={{ cursor: 'pointer' }}
          >
            <List
              dataSource={data?.notifications || []}
              renderItem={(item) => (
                <List.Item className="news-item">
                  <List.Item.Meta
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {item.isRead === 0 && <Tag color="red">新</Tag>}
                        <span>{item.title}</span>
                      </div>
                    }
                    description={item.createdAt}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col span={8}>
          <Card
            className="card-shadow"
            title={<><TrophyOutlined /> 最近成绩</>}
            style={{ marginBottom: '20px' }}
            loading={loading}
            onClick={() => navigate('/student/grades')}
          >
            <List
              dataSource={data?.recentGrades || []}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={item.courseName}
                    description={
                      <div>
                        <Progress
                          percent={item.score}
                          size="small"
                          strokeColor={item.score >= 90 ? '#52c41a' : item.score >= 60 ? '#1890ff' : '#f5222d'}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#999' }}>
                          <span>绩点：{item.gradePoint}</span>
                          <span>{item.semester}</span>
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>

          <Card className="card-shadow" title="待办事项">
            <List
              dataSource={[
                { title: '完成期末评教', status: 'warning', count: data?.pendingEvaluations || 0 },
                { title: '查看未读消息', status: 'processing', count: data?.unreadCount || 0 },
                { title: '确认本学期选课', status: 'info', count: 1 },
              ]}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={item.title}
                    description={
                      <Tag color={item.status as any}>
                        {item.count} 项待处理
                      </Tag>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
