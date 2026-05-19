import { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Statistic } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  CalendarOutlined,
  MedicineBoxOutlined,
} from '@ant-design/icons';
import { adminApi } from '@/services/api';
import type { StatisticsOverview } from '@/types';

export default function Statistics() {
  const [overview, setOverview] = useState<StatisticsOverview | null>(null);
  const [last7Days, setLast7Days] = useState<{ date: string; count: number }[]>([]);
  const [departmentStats, setDepartmentStats] = useState<
    { department_name: string; appointment_count: number }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await adminApi.getStatistics();
      setOverview(res.overview);
      setLast7Days(res.last7DaysAppointments || []);
      setDepartmentStats(res.departmentStats || []);
    } finally {
      setLoading(false);
    }
  };

  const dayColumns = [
    { title: '日期', dataIndex: 'date', key: 'date' },
    { title: '预约量', dataIndex: 'count', key: 'count', sorter: (a: { count: number }, b: { count: number }) => a.count - b.count },
  ];

  const deptColumns = [
    { title: '科室', dataIndex: 'department_name', key: 'department_name' },
    { title: '预约量', dataIndex: 'appointment_count', key: 'appointment_count', sorter: (a: { appointment_count: number }, b: { appointment_count: number }) => a.appointment_count - b.appointment_count },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">统计报表</h2>

      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card loading={loading}>
            <Statistic
              title="今日预约"
              value={overview?.todayAppointments || 0}
              prefix={<CalendarOutlined className="text-blue-500" />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic
              title="今日接诊"
              value={overview?.todayVisits || 0}
              prefix={<MedicineBoxOutlined className="text-green-500" />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic
              title="患者总数"
              value={overview?.totalPatients || 0}
              prefix={<UserOutlined className="text-orange-500" />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic
              title="医生总数"
              value={overview?.totalDoctors || 0}
              prefix={<TeamOutlined className="text-purple-500" />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="近7天预约趋势" loading={loading}>
            <Table
              columns={dayColumns}
              dataSource={last7Days}
              rowKey="date"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="各科室预约统计" loading={loading}>
            <Table
              columns={deptColumns}
              dataSource={departmentStats}
              rowKey="department_name"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
