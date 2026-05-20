import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Popconfirm, Tag, Drawer, InputNumber, Upload } from 'antd';
import { EditOutlined, EyeOutlined, UploadOutlined } from '@ant-design/icons';
import request from '../../utils/request';

const PersonalKpis: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [detailOpen, setDetailOpen] = useState(false);
  const [assessOpen, setAssessOpen] = useState(false);
  const [detailRecord, setDetailRecord] = useState<any>(null);
  const [assessRecord, setAssessRecord] = useState<any>(null);
  const [scores, setScores] = useState<Record<number, number>>({});
  const [form] = Form.useForm();

  useEffect(() => {
    loadData();
  }, [pagination.current, pagination.pageSize]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res: any = await request.get('/personal-kpis', {
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

  const handleView = async (record: any) => {
    const res: any = await request.get(`/personal-kpis/${record.id}`);
    if (res.code === 0) {
      setDetailRecord(res.data);
      setDetailOpen(true);
    }
  };

  const handleAssess = (record: any) => {
    setAssessRecord(record);
    setScores({});
    form.resetFields();
    setAssessOpen(true);
  };

  const handleSelfSubmit = async () => {
    if (!assessRecord) return;
    const values = form.getFieldsValue();
    const res: any = await request.post(`/personal-kpis/${assessRecord.id}/self-assessment`, {
      scores,
      selfAssessment: values.selfAssessment,
      evidenceUrl: values.evidenceUrl,
    });
    if (res.code === 0) {
      message.success('提交成功');
      setAssessOpen(false);
      loadData();
    }
  };

  const handleSuperiorSubmit = async () => {
    if (!assessRecord) return;
    const values = form.getFieldsValue();
    const res: any = await request.post(`/personal-kpis/${assessRecord.id}/superior-assessment`, {
      scores,
      comments: values.comments,
      bonus: [],
      penalty: [],
    });
    if (res.code === 0) {
      message.success('提交成功');
      setAssessOpen(false);
      loadData();
    }
  };

  const handleApprove = async (record: any) => {
    const res: any = await request.post(`/personal-kpis/${record.id}/action`, { action: 'approve' });
    if (res.code === 0) {
      message.success('审批通过');
      loadData();
    }
  };

  const handleReject = async (record: any) => {
    const res: any = await request.post(`/personal-kpis/${record.id}/action`, { action: 'reject' });
    if (res.code === 0) {
      message.success('已驳回');
      loadData();
    }
  };

  const statusMap: Record<string, { color: string; text: string }> = {
    draft: { color: 'default', text: '草稿' },
    pending_review: { color: 'blue', text: '待审核' },
    approved: { color: 'green', text: '已批准' },
    rejected: { color: 'red', text: '已驳回' },
    locked: { color: 'orange', text: '周期锁定' },
    self_assessing: { color: 'cyan', text: '自评中' },
    superior_assessing: { color: 'purple', text: '上级评分中' },
    reviewing: { color: 'gold', text: '审核中' },
    completed: { color: 'green', text: '已完成' },
  };

  const columns = [
    { title: '考核计划', dataIndex: 'planName' },
    { title: '员工姓名', dataIndex: 'employeeName' },
    { title: '部门', dataIndex: 'departmentName' },
    { title: '方案', dataIndex: 'schemeName' },
    { title: '状态', dataIndex: 'status', render: (v: string) => <Tag color={statusMap[v]?.color}>{statusMap[v]?.text}</Tag> },
    { title: '创建时间', dataIndex: 'createdAt' },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="small">
          <Button icon={<EyeOutlined />} size="small" onClick={() => handleView(record)}>查看</Button>
          {record.status === 'self_assessing' && (
            <Button type="primary" size="small" onClick={() => handleAssess(record)}>去自评</Button>
          )}
          {record.status === 'superior_assessing' && (
            <Button type="primary" size="small" onClick={() => handleAssess(record)}>去评分</Button>
          )}
          {record.status === 'reviewing' && (
            <>
              <Button type="primary" size="small" onClick={() => handleApprove(record)}>通过</Button>
              <Popconfirm title="确定驳回?" onConfirm={() => handleReject(record)}>
                <Button size="small" danger>驳回</Button>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="page-content">
      <div style={{ marginBottom: 16 }}>
        <h3>个人KPI</h3>
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
      <Drawer title="KPI详情" placement="right" onClose={() => setDetailOpen(false)} open={detailOpen} width={700}>
        {detailRecord && (
          <div>
            <h4>{detailRecord.planName} - {detailRecord.employeeName}</h4>
            <Tag color={statusMap[detailRecord.status]?.color}>{statusMap[detailRecord.status]?.text}</Tag>
            
            <h5 style={{ marginTop: 16 }}>KPI指标</h5>
            <Table
              dataSource={detailRecord.indicatorsConfig || []}
              columns={[
                { title: '指标名称', dataIndex: 'indicatorName' },
                { title: '权重', dataIndex: 'weight', render: (v: number) => `${v}%` },
                { title: '目标值', dataIndex: 'targetValue' },
              ]}
              rowKey="indicatorId"
              pagination={false}
              size="small"
            />

            {detailRecord.result && (
              <>
                <h5 style={{ marginTop: 16 }}>考核结果</h5>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div>自评分: <strong>{detailRecord.result.selfScore}</strong></div>
                  <div>上级评分: <strong>{detailRecord.result.superiorScore}</strong></div>
                  <div>最终得分: <strong style={{ color: '#1890ff', fontSize: 18 }}>{detailRecord.result.finalScore}</strong></div>
                  <div>绩效等级: <Tag color={detailRecord.result.grade === 'S' ? 'red' : detailRecord.result.grade === 'A' ? 'orange' : 'green'}>{detailRecord.result.grade}</Tag></div>
                </div>
              </>
            )}

            <h5 style={{ marginTop: 16 }}>审批流程</h5>
            {detailRecord.workflow?.map((w: any, i: number) => (
              <div key={i} style={{ padding: 8, borderLeft: '2px solid #1890ff', marginBottom: 8, paddingLeft: 12 }}>
                <div style={{ fontWeight: 500 }}>{w.action}</div>
                <div style={{ color: '#888', fontSize: 12 }}>{w.operatorName} - {w.createdAt}</div>
                {w.comments && <div style={{ marginTop: 4 }}>{w.comments}</div>}
              </div>
            ))}
          </div>
        )}
      </Drawer>
      <Modal
        title={assessRecord?.status === 'self_assessing' ? '个人自评' : '上级评分'}
        open={assessOpen}
        onCancel={() => setAssessOpen(false)}
        footer={null}
        width={700}
      >
        {assessRecord && (
          <Form form={form} layout="vertical">
            <h5>指标评分</h5>
            {(assessRecord.indicatorsConfig || []).map((ind: any, index: number) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500 }}>{ind.indicatorName}</div>
                  <div style={{ color: '#888', fontSize: 12 }}>权重: {ind.weight}%</div>
                </div>
                <InputNumber
                  min={0}
                  max={100}
                  value={scores[ind.indicatorId]}
                  onChange={(v) => setScores({ ...scores, [ind.indicatorId]: Number(v) })}
                  placeholder="0-100"
                />
              </div>
            ))}
            {assessRecord.status === 'self_assessing' ? (
              <>
                <Form.Item name="selfAssessment" label="自评说明">
                  <Input.TextArea rows={3} placeholder="请描述工作完成情况" />
                </Form.Item>
                <Form.Item name="evidenceUrl" label="佐证材料">
                  <Upload maxCount={1}>
                    <Button icon={<UploadOutlined />}>上传文件</Button>
                  </Upload>
                </Form.Item>
                <Form.Item>
                  <Space>
                    <Button type="primary" onClick={handleSelfSubmit}>提交自评</Button>
                    <Button onClick={() => setAssessOpen(false)}>取消</Button>
                  </Space>
                </Form.Item>
              </>
            ) : (
              <>
                <Form.Item name="comments" label="评分评语">
                  <Input.TextArea rows={3} placeholder="请输入评语" />
                </Form.Item>
                <Form.Item>
                  <Space>
                    <Button type="primary" onClick={handleSuperiorSubmit}>提交评分</Button>
                    <Button onClick={() => setAssessOpen(false)}>取消</Button>
                  </Space>
                </Form.Item>
              </>
            )}
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default PersonalKpis;
