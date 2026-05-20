import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, List, Button, Tag } from 'antd';
import {
  TeamOutlined,
  BookOutlined,
  TrophyOutlined,
  UserOutlined,
  ArrowRightOutlined,
  LineChartOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { statsAPI } from '../../services/api';

export const AdminHomePage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await statsAPI.getAdminStats();
      setStats(response.data.stats);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-2xl font-bold text-gray-800 mb-6">
        👋 欢迎回来，管理员！
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm">
            <Statistic
              title={<span className="text-gray-600">👥 用户总数</span>}
              value={(stats?.totalUsers as number) || 0}
              prefix={<UserOutlined className="text-blue-500" />}
              valueStyle={{ color: '#3b82f6' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm">
            <Statistic
              title={<span className="text-gray-600">👨‍🎓 学生数</span>}
              value={(stats?.studentCount as number) || 0}
              prefix={<TeamOutlined className="text-green-500" />}
              valueStyle={{ color: '#10b981' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm">
            <Statistic
              title={<span className="text-gray-600">👨‍🏫 教师数</span>}
              value={(stats?.teacherCount as number) || 0}
              prefix={<UserOutlined className="text-purple-500" />}
              valueStyle={{ color: '#8b5cf6' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm">
            <Statistic
              title={<span className="text-gray-600">📚 课程总数</span>}
              value={(stats?.courseCount as number) || 0}
              prefix={<BookOutlined className="text-orange-500" />}
              valueStyle={{ color: '#f97316' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card
            title="📊 平台数据概览"
            className="shadow-sm"
          >
            <Row gutter={[16, 16]}>
              <Col xs={12}>
                <Card size="small" className="bg-gray-50">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-700">
                      {(stats?.totalProjects as number) || 0}
                    </div>
                    <div className="text-sm text-gray-500">作品总数</div>
                  </div>
                </Card>
              </Col>
              <Col xs={12}>
                <Card size="small" className="bg-gray-50">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-700">
                      {(stats?.totalChallenges as number) || 0}
                    </div>
                    <div className="text-sm text-gray-500">闯关题总数</div>
                  </div>
                </Card>
              </Col>
              <Col xs={12}>
                <Card size="small" className="bg-gray-50">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-700">
                      {(stats?.totalClasses as number) || 0}
                    </div>
                    <div className="text-sm text-gray-500">班级总数</div>
                  </div>
                </Card>
              </Col>
              <Col xs={12}>
                <Card size="small" className="bg-gray-50">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-700">
                      {(stats?.totalHomework as number) || 0}
                    </div>
                    <div className="text-sm text-gray-500">作业总数</div>
                  </div>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title="🏆 热门课程"
            className="shadow-sm"
          >
            <List
              dataSource={(stats?.topCourses as Array<Record<string, unknown>> || [])}
              renderItem={(course, index) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <div className="flex items-center gap-2">
                        <Tag color={index === 0 ? 'gold' : index === 1 ? 'silver' : 'default'}>
                          #{index + 1}
                        </Tag>
                        <span>{String(course.title)}</span>
                      </div>
                    }
                    description={`${String(course.enrollmentCount || 0)} 人学习`}
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
              onClick={() => navigate('/users')}
            >
              <div className="text-4xl mb-2">👥</div>
              <div className="font-medium">用户管理</div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card
              hoverable
              className="text-center cursor-pointer bg-gradient-to-br from-green-50 to-green-100"
              onClick={() => navigate('/courses')}
            >
              <div className="text-4xl mb-2">📚</div>
              <div className="font-medium">课程管理</div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card
              hoverable
              className="text-center cursor-pointer bg-gradient-to-br from-orange-50 to-orange-100"
              onClick={() => navigate('/challenges')}
            >
              <div className="text-4xl mb-2">🎮</div>
              <div className="font-medium">闯关管理</div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card
              hoverable
              className="text-center cursor-pointer bg-gradient-to-br from-purple-50 to-purple-100"
              onClick={() => navigate('/settings')}
            >
              <div className="text-4xl mb-2">⚙️</div>
              <div className="font-medium">系统设置</div>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default AdminHomePage;
