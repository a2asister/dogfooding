import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, DatePicker, message, Space, Popconfirm, Tag, Drawer, Progress } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, PlayCircleOutlined, PauseCircleOutlined, StopOutlined, ClockCircleOutlined } from '@ant-design/icons';
import request from '../../utils/request';

const Plans: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [progressOpen, setProgressOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [detailRecord, setDetailRecord] = useState<any>(null);
  const [progressData, setProgressData] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    loadData();
    loadEmployees();
  }, [pagination.current, pagination.pageSize]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res: any = await request.get('/plans', {
        params: { page: pagination.current, pageSize: pagination.pageSize },
      });
      if (res.code === 0) {
        setData(res.data.list);
        setTotal(res.data.total);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    const res: any = await request.get('/employees/all');
    if (res.code === 0) setEmployees(res.data);
  };

  const handleAdd = () => {
    setEditingRecord(null);
    setSelectedEmployees([]);
    form.resetFields();
    setModalOpen(true);
  };

  const handleEdit = (record: any) => {
    setEditingRecord(record);
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      templateType: record.templateType,
      cycleType: record.cycleType,
      cycleYear: record.cycleYear,
      cycleMonth: record.cycleMonth,
    });
    setSelectedEmployees(record.participants?.map((p: any) => p.employeeId) || []);
    setModalOpen(true);
  };

  const handleView = async (record: any) => {
    const res: any = await request.get(`/plans/${record.id}`);
    if (res.code === 0) {
      setDetailRecord(res.data);
      setDetailOpen(true);
    }
  };

  const handleViewProgress = async (record: any) => {
    const res: any = await request.get(`/plans/${record.id}/progress`);
    if (res.code === 0) {
      setProgressData(res.data);
      setProgressOpen(true);
    }
  };

  const handleAction = async (record: any, action: string) => {
    const res: any = await request.post(`/plans/${record.id}/action`, { action });
    if (res.code === 0) {
      message.success('操作成功');
      loadData();
    } else {
      message.error(res.message);
    }
  };

  const handleDelete = async (id: number) => {
    const res: any = await request.delete(`/plans/${id}`);
    if (res.code === 0) {
      message.success('删除成功');
      loadData();
    }
  };

  const handleSubmit = async (values: any) => {
    const data = {
      ...values,
      participants: selectedEmployees.map((empId) => ({ employeeId: empId })),
      startDate: values.startDate?.format('YYYY-MM-DD'),
      endDate: values.endDate?.format('YYYY-MM-DD'),
      selfAssessmentStart: values.selfAssessmentStart?.format('YYYY-MM-DD'),
      selfAssessmentEnd: values.selfAssessmentEnd?.format('YYYY-MM-DD'),
      superiorAssessmentStart: values.superiorAssessmentStart?.format('YYYY-MM-DD'),
      superiorAssessmentEnd: values.superiorAssessmentEnd?.format('YYYY-MM-DD'),
      reviewStart: values.reviewStart?.format('YYYY-MM-DD'),
      reviewEnd: values.reviewEnd?.format('YYYY-MM-DD'),
      resultPublicationDate: values.resultPublicationDate?.format('YYYY-MM-DD'),
    };
    if (editingRecord) {
      const res: any = await request.put(`/plans/${editingRecord.id}`, data);
      if (res.code === 0) {
        message.success('更新成功');
        setModalOpen(false);
        loadData();
      }
    } else {
      const res: any = await request.post('/plans', data);
      if (res.code === 0) {
        message.success('创建成功');
        setModalOpen(false);
        loadData();
      }
    }
  };

  const statusMap: Record<string, { color: string; text: string }> = {
    draft: { color: 'default', text: '草稿' },
    pending: { color: 'blue', text: '待启动' },
    in_progress: { color: 'green', text: '进行中' },
    paused: { color: 'orange', text: '已暂停' },
    completed: { color: 'cyan', text: '已完成' },
    published: { color: 'purple', text: '已发布' },
    archived: { color: 'gray', text: '已归档' },
    cancelled: { color: 'red', text: '已取消' },
  };

  const columns = [
    { title: '计划名称', dataIndex: 'name' },
    { title: '周期类型', dataIndex: 'cycleType' },
    { title: '考核年份', dataIndex: 'cycleYear' },
    { title: '参与人数', dataIndex: 'participantCount' },
    { title: '状态', dataIndex: 'status', render: (v: string) => <Tag color={statusMap[v]?.color}>{statusMap[v]?.text}</Tag> },
    { title: '创建人', dataIndex: 'creatorName' },
    { title: '创建时间', dataIndex: 'createdAt' },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="small">
          <Button icon={<EyeOutlined />} size="small" onClick={() => handleView(record)}>详情</Button>
          <Button icon={<ClockCircleOutlined />} size="small" onClick={() => handleViewProgress(record)}>进度</Button>
          {record.status === 'draft' && <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)}>编辑</Button>}
          {record.status === 'pending' && <Button icon={<PlayCircleOutlined />} size="small" type="primary" onClick={() => handleAction(record, 'start')}>启动</Button>}
          {record.status === 'in_progress' && <Button icon={<PauseCircleOutlined />} size="small" onClick={() => handleAction(record, 'pause')}>暂停</Button>}
          {record.status === 'paused' && <Button icon={<PlayCircleOutlined />} size="small" onClick={() => handleAction(record, 'resume')}>恢复</Button>}
          {(record.status === 'draft' || record.status === 'pending') && (
            <Popconfirm title="确定删除?" onConfirm={() => handleDelete(record.id)}>
              <Button icon={<DeleteOutlined />} size="small" danger>删除</Button>
            </Popconfirm>
          )}
          <Button icon={<StopOutlined />} size="small" danger onClick={() => handleAction(record, 'cancel')}>终止</Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3>考核计划</h3>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增计划</Button>
      </div>
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
      <Modal
        title={editingRecord ? '编辑计划' : '新增计划'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item name="name" label="计划名称" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="templateType" label="模板类型">
              <Select>
                <Select.Option value="QUARTERLY">季度考核</Select.Option>
                <Select.Option value="MONTHLY">月度考核</Select.Option>
                <Select.Option value="YEARLY">年度考核</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="cycleType" label="周期类型">
              <Select>
                <Select.Option value="QUARTERLY">季度</Select.Option>
                <Select.Option value="MONTHLY">月度</Select.Option>
                <Select.Option value="YEARLY">年度</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="cycleYear" label="考核年份" rules={[{ required: true }]}>
              <Input type="number" defaultValue={new Date().getFullYear()} />
            </Form.Item>
            <Form.Item name="cycleMonth" label="考核月份">
              <Input type="number" />
            </Form.Item>
            <Form.Item name="startDate" label="开始日期">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="endDate" label="结束日期">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="selfAssessmentStart" label="自评开始">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="selfAssessmentEnd" label="自评结束">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="superiorAssessmentStart" label="上级评分开始">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="superiorAssessmentEnd" label="上级评分结束">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="reviewStart" label="审核开始">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="reviewEnd" label="审核结束">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="resultPublicationDate" label="结果公布日期">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </div>
          <Form.Item label="考核人员">
            <Select
              mode="multiple"
              style={{ width: '100%' }}
              placeholder="选择参与考核的员工"
              value={selectedEmployees}
              onChange={setSelectedEmployees}
            >
              {employees.map((e: any) => (
                <Select.Option key={e.id} value={e.id}>{e.realName} ({e.employeeNo})</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">确定</Button>
              <Button onClick={() => setModalOpen(false)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
      <Drawer title="计划详情" placement="right" onClose={() => setDetailOpen(false)} open={detailOpen} width={600}>
        {detailRecord && (
          <div>
            <h4>{detailRecord.name}</h4>
            <p>{detailRecord.description}</p>
            <h5>参与人员 ({detailRecord.participants?.length || 0})</h5>
            <Table
              dataSource={detailRecord.participants || []}
              columns={[
                { title: '姓名', dataIndex: 'realName' },
                { title: '工号', dataIndex: 'employeeNo' },
                { title: '部门', dataIndex: 'departmentName' },
                { title: '状态', dataIndex: 'status' },
              ]}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </div>
        )}
      </Drawer>
      <Modal title="考核进度" open={progressOpen} onCancel={() => setProgressOpen(false)} footer={null} width={500}>
        {progressData && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>总体进度</span>
                <span>{progressData.overallProgress}%</span>
              </div>
              <Progress percent={progressData.overallProgress} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <div style={{ color: '#888', fontSize: 12 }}>待开始</div>
                <div style={{ fontSize: 24, fontWeight: 'bold' }}>{progressData.pending}</div>
              </div>
              <div>
                <div style={{ color: '#888', fontSize: 12 }}>自评中</div>
                <div style={{ fontSize: 24, fontWeight: 'bold' }}>{progressData.selfAssessing}</div>
              </div>
              <div>
                <div style={{ color: '#888', fontSize: 12 }}>上级评分中</div>
                <div style={{ fontSize: 24, fontWeight: 'bold' }}>{progressData.superiorAssessing}</div>
              </div>
              <div>
                <div style={{ color: '#888', fontSize: 12 }}>审核中</div>
                <div style={{ fontSize: 24, fontWeight: 'bold' }}>{progressData.reviewing}</div>
              </div>
              <div>
                <div style={{ color: '#888', fontSize: 12 }}>已完成</div>
                <div style={{ fontSize: 24, fontWeight: 'bold' }}>{progressData.completed}</div>
              </div>
              <div>
                <div style={{ color: '#888', fontSize: 12 }}>总数</div>
                <div style={{ fontSize: 24, fontWeight: 'bold' }}>{progressData.total}</div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Plans;
