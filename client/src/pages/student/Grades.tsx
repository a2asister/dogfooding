import React, { useEffect, useState } from 'react';
import { Card, Table, Statistic, Row, Col, Select, Tag } from 'antd';
import { TrophyOutlined } from '@ant-design/icons';
import { studentApi } from '../../api';
import { Grade } from '../../types';

const { Option } = Select;

const Grades: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [semester, setSemester] = useState<string>('');

  const semesters = [
    '2024-2025学年第一学期',
    '2023-2024学年第二学期',
    '2023-2024学年第一学期',
    '2022-2023学年第二学期',
  ];

  useEffect(() => {
    loadGrades();
  }, [semester]);

  const loadGrades = async () => {
    setLoading(true);
    try {
      const data: any = await studentApi.getGrades({ semester: semester || undefined });
      setGrades(data.list || []);
      setStats(data.stats);
    } catch (error) {
      console.error('加载成绩失败', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#52c41a';
    if (score >= 80) return '#1890ff';
    if (score >= 70) return '#722ed1';
    if (score >= 60) return '#fa8c16';
    return '#f5222d';
  };

  const columns = [
    {
      title: '课程名称',
      dataIndex: 'courseName',
      key: 'courseName',
    },
    {
      title: '成绩',
      dataIndex: 'score',
      key: 'score',
      width: 120,
      render: (score: number) => (
        <span style={{ color: getScoreColor(score), fontWeight: '600', fontSize: '16px' }}>
          {score}
        </span>
      ),
    },
    {
      title: '绩点',
      dataIndex: 'gradePoint',
      key: 'gradePoint',
      width: 100,
      render: (gp: number) => <Tag color="blue">{gp}</Tag>,
    },
    {
      title: '学期',
      dataIndex: 'semester',
      key: 'semester',
    },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: '20px' }}>
        <Col span={6}>
          <Card className="card-shadow">
            <Statistic
              title="平均成绩"
              value={stats?.avgScore || 0}
              precision={1}
              suffix="分"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="card-shadow">
            <Statistic
              title="平均绩点"
              value={stats?.gpa || 0}
              precision={2}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="card-shadow">
            <Statistic
              title="已修课程"
              value={stats?.totalCourses || 0}
              suffix="门"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="card-shadow">
            <Statistic
              title="通过课程"
              value={stats?.passedCourses || 0}
              suffix="门"
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        className="card-shadow"
        title={<><TrophyOutlined /> 成绩查询</>}
        extra={
          <Select
            placeholder="选择学期"
            allowClear
            style={{ width: 200 }}
            value={semester || undefined}
            onChange={(value) => setSemester(value || '')}
          >
            {semesters.map((s) => (
              <Option key={s} value={s}>
                {s}
              </Option>
            ))}
          </Select>
        }
      >
        <Table
          loading={loading}
          dataSource={grades}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default Grades;
