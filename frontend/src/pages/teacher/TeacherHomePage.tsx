import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, List, Progress, Button, Tag } from 'antd';
import {
  TeamOutlined,
  BookOutlined,
  FileTextOutlined,
  TrophyOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { statsAPI } from '../../services/api';

export const TeacherHomePage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await statsAPI.getTeacherStats();
      setStats(response.data.stats);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-2xl font-bold text-gray-800 mb-6">
        👋 欢迎回来，老师！
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm">
            <Statistic
              title={<span className="text-gray-600">👥 班级数量</span>}
              value={(stats?.classCount as number) || 0}
              prefix={<TeamOutlined className="text-blue-500" />}
              valueStyle={{ color: '#3b82f6' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm">
            <Statistic
              title={<span className="text-gray-600">👨‍🎓 学生总数</span>}
              value={(stats?.studentCount as number) || 0}
              prefix={<TeamOutlined className="text-green-500" />}
              valueStyle={{ color: '#10b981' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm">
            <Statistic
              title={<span className="text-gray-600">📚 课程数量</span>}
              value={(stats?.courseCount as number) || 0}
              prefix={<BookOutlined className="text-purple-500" />}
              valueStyle={{ color: '#8b5cf6' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm">
            <Statistic
              title={<span className="text-gray-600">📝 待批改作业</span>}
              value={(stats?.pendingHomeworkCount as number) || 0}
              prefix={<FileTextOutlined className="text-orange-500" />}
              valueStyle={{ color: '#f97316' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card
            title="📝 最近作业提交"
            extra={<Button type="link" onClick={() => navigate('/homework')}>查看全部</Button>}
            className="shadow-sm"
          >
            <List
              dataSource={(stats?.recentSubmissions as Array<Record<string, unknown>> || [])}
              renderItem={(submission) => (
                <List.Item className="hover:bg-gray-50 rounded-lg px-3 -mx-3">
                  <List.Item.Meta
                    title={String(submission.homeworkTitle)}
                    description={
                      <div className="flex items-center gap-4">
                        <span className="text-gray-600">学生：{String(submission.studentName)}</span>
                        <span className="text-gray-400 text-sm">
                          {new Date(String(submission.submittedAt)).toLocaleDateString()}
                        </span>
                      </div>
                    }
                  />
                  <Tag color={
                    submission.status === 'pending' ? 'warning' :
                    submission.status === 'graded' ? 'success' : 'default'
                  }>
                    {submission.status === 'pending' ? '待批改' :
                     submission.status === 'graded' ? '已批改' : '已提交'}
                  </Tag>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title="🏫 我的班级"
            extra={<Button type="link" onClick={() => navigate('/classes')}>管理</Button>}
            className="shadow-sm"
          >
            <List
              dataSource={(stats?.classes as Array<Record<string, unknown>> || [])}
              renderItem={(cls) => (
                <List.Item>
                  <List.Item.Meta
                    title={String(cls.name)}
                    description={
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">{String(cls.studentCount)} 名学生</span>
                        <Progress
                          percent={(cls.avgProgress as number) || 0}
                          size="small"
                          className="w-20"
                        />
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="⚡ 快捷操作"
        className="shadow-sm"
      >
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={6}>
            <Card
              hoverable
              className="text-center cursor-pointer bg-gradient-to-br from-blue-50 to-blue-100"
              onClick={() => navigate('/classes/create')}
            >
              <div className="text-4xl mb-2">🏫</div>
              <div className="font-medium">创建班级</div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card
              hoverable
              className="text-center cursor-pointer bg-gradient-to-br from-green-50 to-green-100"
              onClick={() => navigate('/courses/create')}
            >
              <div className="text-4xl mb-2">📚</div>
              <div className="font-medium">创建课程</div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card
              hoverable
              className="text-center cursor-pointer bg-gradient-to-br from-orange-50 to-orange-100"
              onClick={() => navigate('/homework/publish')}
            >
              <div className="text-4xl mb-2">📝</div>
              <div className="font-medium">发布作业</div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card
              hoverable
              className="text-center cursor-pointer bg-gradient-to-br from-purple-50 to-purple-100"
              onClick={() => navigate('/stats')}
            >
              <div className="text-4xl mb-2">📊</div>
              <div className="font-medium">查看统计</div>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default TeacherHomePage;
