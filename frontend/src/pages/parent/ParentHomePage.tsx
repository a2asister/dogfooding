import { useState, useEffect } from 'react';
import { Card, Row, Col, List, Progress, Tag, Button, Avatar } from 'antd';
import {
  UserOutlined,
  BookOutlined,
  TrophyOutlined,
  StarOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { statsAPI } from '../../services/api';

export const ParentHomePage = () => {
  const navigate = useNavigate();
  const [children, setChildren] = useState<Array<Record<string, unknown>>>([]);
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await statsAPI.getParentStats();
      setChildren(response.data.children || []);
      setStats(response.data.stats);
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-2xl font-bold text-gray-800 mb-6">
        👋 欢迎回来，家长！
      </div>

      <Row gutter={[16, 16]}>
        {children.map((child, index) => (
          <Col xs={24} lg={12} key={index}>
            <Card
              className="shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/children/${child.id}`)}
            >
              <div className="flex items-center gap-4">
                <Avatar size={64} icon={<UserOutlined />} className="bg-blue-500" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{child.nickname}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                    <span className="flex items-center gap-1">
                      <StarOutlined className="text-yellow-500" />
                      {(child.points as number) || 0} 积分
                    </span>
                    <span className="flex items-center gap-1">
                      <TrophyOutlined className="text-orange-500" />
                      {(child.level as number) || 1} 级
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOutlined className="text-blue-500" />
                      {(child.courseCount as number) || 0} 门课程
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>本周学习进度</span>
                      <span>{(child.weeklyProgress as number) || 0}%</span>
                    </div>
                    <Progress
                      percent={(child.weeklyProgress as number) || 0}
                      size="small"
                      showInfo={false}
                    />
                  </div>
                </div>
                <Button type="link">查看详情 →</Button>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {children.length === 0 && (
        <Card className="shadow-sm">
          <div className="text-center py-12 text-gray-500">
            <UserOutlined className="text-6xl text-gray-300 mb-4" />
            <p className="text-lg mb-4">还没有绑定孩子的账号</p>
            <Button type="primary">绑定孩子账号</Button>
          </div>
        </Card>
      )}

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card
            title="📊 学习概览"
            className="shadow-sm"
          >
            <Row gutter={[16, 16]}>
              <Col xs={12}>
                <Card size="small" className="bg-blue-50">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {(stats?.totalStudyHours as number) || 0}
                    </div>
                    <div className="text-sm text-gray-600">本周学习时长（小时）</div>
                  </div>
                </Card>
              </Col>
              <Col xs={12}>
                <Card size="small" className="bg-green-50">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {(stats?.completedCourses as number) || 0}
                    </div>
                    <div className="text-sm text-gray-600">已完成课程</div>
                  </div>
                </Card>
              </Col>
              <Col xs={12}>
                <Card size="small" className="bg-orange-50">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">
                      {(stats?.completedChallenges as number) || 0}
                    </div>
                    <div className="text-sm text-gray-600">完成闯关</div>
                  </div>
                </Card>
              </Col>
              <Col xs={12}>
                <Card size="small" className="bg-purple-50">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {(stats?.avgScore as number) || 0}
                    </div>
                    <div className="text-sm text-gray-600">作业平均分</div>
                  </div>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title="🔔 最新消息"
            extra={<Button type="link" size="small">全部</Button>}
            className="shadow-sm"
          >
            <List
              dataSource={(stats?.notifications as Array<Record<string, unknown>> || [])}
              renderItem={(item) => (
                <List.Item className="py-3">
                  <List.Item.Meta
                    avatar={<div className="text-2xl">{item.icon || '📬'}</div>}
                    title={item.title}
                    description={
                      <div>
                        <p className="text-sm text-gray-600">{item.content}</p>
                        <p className="text-xs text-gray-400 mt-1">{item.time}</p>
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
              onClick={() => navigate('/reports')}
            >
              <div className="text-4xl mb-2">📊</div>
              <div className="font-medium">学习报告</div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card
              hoverable
              className="text-center cursor-pointer bg-gradient-to-br from-green-50 to-green-100"
              onClick={() => navigate('/children')}
            >
              <div className="text-4xl mb-2">👨‍👩‍👧</div>
              <div className="font-medium">子女管理</div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card
              hoverable
              className="text-center cursor-pointer bg-gradient-to-br from-orange-50 to-orange-100"
            >
              <div className="text-4xl mb-2">🏆</div>
              <div className="font-medium">勋章墙</div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card
              hoverable
              className="text-center cursor-pointer bg-gradient-to-br from-purple-50 to-purple-100"
            >
              <div className="text-4xl mb-2">💬</div>
              <div className="font-medium">联系老师</div>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default ParentHomePage;
