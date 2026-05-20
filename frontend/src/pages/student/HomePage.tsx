import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Progress, List, Tag, Button } from 'antd';
import {
  BookOutlined,
  TrophyOutlined,
  StarOutlined,
  FireOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { statsAPI, coursesAPI } from '../../services/api';
import { Course, Badge } from '../../types';

export const StudentHomePage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [recentCourses, setRecentCourses] = useState<Course[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, coursesRes] = await Promise.all([
        statsAPI.getStudentStats(),
        coursesAPI.getMyCourses(),
      ]);
      setStats(statsRes.data.stats);
      setRecentCourses(coursesRes.data.courses.slice(0, 3));
      setBadges(statsRes.data.badges || []);
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-2xl font-bold text-gray-800 mb-6">
        👋 欢迎回来，{stats ? '小程序员' : '同学'}！
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title={<span className="text-gray-600">⭐ 积分</span>}
              value={stats?.points as number || 0}
              prefix={<StarOutlined className="text-yellow-500" />}
              valueStyle={{ color: '#f59e0b' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title={<span className="text-gray-600">🏆 等级</span>}
              value={stats?.level as number || 1}
              prefix={<TrophyOutlined className="text-orange-500" />}
              valueStyle={{ color: '#f97316' }}
              suffix="级"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title={<span className="text-gray-600">📚 已完成课程</span>}
              value={stats?.completedCourses as number || 0}
              prefix={<BookOutlined className="text-blue-500" />}
              valueStyle={{ color: '#3b82f6' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title={<span className="text-gray-600">🎯 闯关完成</span>}
              value={stats?.completedChallenges as number || 0}
              prefix={<FireOutlined className="text-red-500" />}
              valueStyle={{ color: '#ef4444' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card
            title="📖 正在学习的课程"
            extra={<Button type="link" onClick={() => navigate('/courses')}>查看全部</Button>}
            className="shadow-sm"
          >
            {recentCourses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                还没有学习课程，快去选择一门课程开始学习吧！
                <Button type="primary" className="mt-4" onClick={() => navigate('/courses')}>
                  浏览课程
                </Button>
              </div>
            ) : (
              <List
                dataSource={recentCourses}
                renderItem={(course) => (
                  <List.Item
                    className="cursor-pointer hover:bg-gray-50 rounded-lg px-3 -mx-3"
                    onClick={() => navigate(`/courses/${course.id}`)}
                  >
                    <List.Item.Meta
                      title={course.title}
                      description={course.description?.slice(0, 50) + '...'}
                    />
                    <div className="flex items-center gap-4">
                      <Tag color={
                        course.level === 'beginner' ? 'green' :
                        course.level === 'basic' ? 'blue' : 'orange'
                      }>
                        {course.level === 'beginner' ? '启蒙' :
                         course.level === 'basic' ? '基础' : '进阶'}
                      </Tag>
                      <Progress
                        percent={(course as unknown as { progress?: number }).progress || 0}
                        size="small"
                        className="w-24"
                      />
                    </div>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="🏅 我的勋章" className="shadow-sm">
            {badges.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                还没有获得勋章，继续努力哦！
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {badges.slice(0, 6).map((badge) => (
                  <div key={badge.id} className="text-center">
                    <div className="text-4xl mb-2">{badge.icon}</div>
                    <div className="text-xs text-gray-600">{badge.name}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <Card
        title="🔥 快捷操作"
        className="shadow-sm"
      >
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={6}>
            <Card
              hoverable
              className="text-center cursor-pointer bg-gradient-to-br from-blue-50 to-blue-100"
              onClick={() => navigate('/editor')}
            >
              <div className="text-4xl mb-2">💻</div>
              <div className="font-medium">开始编程</div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card
              hoverable
              className="text-center cursor-pointer bg-gradient-to-br from-green-50 to-green-100"
              onClick={() => navigate('/courses')}
            >
              <div className="text-4xl mb-2">📚</div>
              <div className="font-medium">学习课程</div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card
              hoverable
              className="text-center cursor-pointer bg-gradient-to-br from-orange-50 to-orange-100"
              onClick={() => navigate('/challenges')}
            >
              <div className="text-4xl mb-2">🎮</div>
              <div className="font-medium">闯关练习</div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card
              hoverable
              className="text-center cursor-pointer bg-gradient-to-br from-purple-50 to-purple-100"
              onClick={() => navigate('/projects')}
            >
              <div className="text-4xl mb-2">🎨</div>
              <div className="font-medium">我的作品</div>
            </Card>
          </Col>
        </Row>
      </Card>

      <Card
        title={<span className="flex items-center gap-2"><ClockCircleOutlined /> 最近活动</span>}
        className="shadow-sm"
      >
        <List
          dataSource={(stats?.recentActivity as Array<Record<string, unknown>> || [])}
          renderItem={(activity) => (
            <List.Item>
              <List.Item.Meta
                title={
                  activity.type === 'course' ? '开始学习课程' :
                  activity.type === 'challenge' ? '完成闯关' :
                  activity.type === 'homework' ? '提交作业' : '创建作品'
                }
                description={activity.title || '继续加油！'}
              />
              <div className="text-gray-400 text-sm">
                {String(activity.date).slice(0, 10)}
              </div>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default StudentHomePage;
