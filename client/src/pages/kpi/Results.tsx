import { useState, useEffect } from 'react';
import { Table, Button, Select, message, Space, Tag, Card } from 'antd';
import { ExportOutlined } from '@ant-design/icons';
import request from '../../utils/request';

const Results: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [filters, setFilters] = useState({ grade: '', planId: '' });
  const [grades, setGrades] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    loadData();
    loadGrades();
    loadPlans();
  }, [pagination.current, pagination.pageSize, filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res: any = await request.get('/results', {
        params: { page: pagination.current, pageSize: pagination.pageSize, ...filters },
      });
      if (res.code === 0) {
        setData(res.data.list);
        setTotal(res.data.total);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadGrades = async () => {
    const res: any = await request.get('/results/grades');
    if (res.code === 0) setGrades(res.data);
  };

  const loadPlans = async () => {
    const res: any = await request.get('/plans', { params: { pageSize: 1000 } });
    if (res.code === 0) setPlans(res.data.list);
  };

  const handleExport = async () => {
    const res: any = await request.get('/results/export', { params: filters });
    if (res.code === 0) {
      const link = document.createElement('a');
      link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${res.data.file}`;
      link.download = `绩效结果_${Date.now()}.xlsx`;
      link.click();
      message.success('导出成功');
    }
  };

  const columns = [
    { title: '员工姓名', dataIndex: 'employeeName' },
    { title: '工号', dataIndex: 'employeeNo' },
    { title: '部门', dataIndex: 'departmentName' },
    { title: '考核计划', dataIndex: 'planName' },
    { title: '自评分', dataIndex: 'selfScore' },
    { title: '上级评分', dataIndex: 'superiorScore' },
    { title: '最终得分', dataIndex: 'finalScore', render: (v: number) => <strong>{v?.toFixed(2)}</strong> },
    {
      title: '绩效等级',
      dataIndex: 'grade',
      render: (v: string, record: any) => (
        <Tag color={record.gradeColor}>{record.gradeName}</Tag>
      ),
    },
    { title: '加分', dataIndex: 'totalBonus', render: (v: number) => v ? <span style={{ color: '#52c41a' }}>+{v}</span> : '-' },
    { title: '扣分', dataIndex: 'totalPenalty', render: (v: number) => v ? <span style={{ color: '#ff4d4f' }}>-{v}</span> : '-' },
    { title: '考核时间', dataIndex: 'createdAt' },
  ];

  return (
    <div className="page-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3>绩效结果</h3>
        <Space>
          <Select
            placeholder="选择绩效等级"
            style={{ width: 150 }}
            allowClear
            value={filters.grade || undefined}
            onChange={(v) => setFilters({ ...filters, grade: v || '' })}
          >
            {grades.map((g) => (
              <Select.Option key={g.grade} value={g.grade}>{g.name}</Select.Option>
            ))}
          </Select>
          <Select
            placeholder="选择考核计划"
            style={{ width: 200 }}
            allowClear
            value={filters.planId || undefined}
            onChange={(v) => setFilters({ ...filters, planId: v || '' })}
          >
            {plans.map((p: any) => (
              <Select.Option key={p.id} value={p.id}>{p.name}</Select.Option>
            ))}
          </Select>
          <Button icon={<ExportOutlined />} onClick={handleExport}>导出</Button>
        </Space>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          {grades.map((g) => {
            const count = data.filter((d) => d.grade === g.grade).length;
            return (
              <div key={g.grade} style={{ textAlign: 'center' }}>
                <Tag color={g.color} style={{ fontSize: 14, padding: '4px 12px', marginBottom: 8 }}>
                  {g.name}
                </Tag>
                <div style={{ fontSize: 24, fontWeight: 'bold' }}>{count}</div>
              </div>
            );
          })}
        </div>
      </Card>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          total,
          onChange: (page, pageSize) => setPagination({ current: page, pageSize }),
        }}
      />
    </div>
  );
};

export default Results;
