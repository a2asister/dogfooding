import { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Spin, List } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  CalendarOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { adminApi } from '@/services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState<{
    overview: {
      todayAppointments: number;
      todayVisits: number;
      totalPatients: number;
      totalDoctors: number;
    };
    last7DaysAppointments: { date: string; count: number }[];
    departmentStats: { department_name: string; appointment_count: number }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await adminApi.getStatistics();
      setStats(res);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">数据概览</h2>

      <Row gutter={16} className="mb-6">
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="今日预约"
              value={stats?.overview.todayAppointments || 0}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="今日接诊"
              value={stats?.overview.todayVisits || 0}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="患者总数"
              value={stats?.overview.totalPatients || 0}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="医生总数"
              value={stats?.overview.totalDoctors || 0}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} lg={12}>
          <Card title="近7天预约趋势">
            <List
              dataSource={stats?.last7DaysAppointments || []}
              renderItem={(item) => (
                <List.Item key={item.date}>
                  <span>{item.date}</span>
                  <span className="font-semibold">{item.count} 个预约</span>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="科室预约统计">
            <List
              dataSource={stats?.departmentStats || []}
              renderItem={(item) => (
                <List.Item key={item.department_name}>
                  <span>{item.department_name}</span>
                  <span className="font-semibold">{item.appointment_count} 个预约</span>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
