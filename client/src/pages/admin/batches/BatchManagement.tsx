import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Select,
  message,
  Space,
  Card,
  Tag,
  Descriptions,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { batchApi, gradeApi } from '@/services';
import type { ElectiveBatch, Grade } from '@/types';
import dayjs, { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;

const BatchManagement: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ElectiveBatch[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailBatch, setDetailBatch] = useState<ElectiveBatch | null>(null);
  const [grades, setGrades] = useState<Grade[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await batchApi.getBatches({
        page: currentPage,
        pageSize,
      });
      if (res.success) {
        setData(res.data?.rows || []);
        setTotal(res.data?.count || 0);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGrades = async () => {
    try {
      const res = await gradeApi.getGrades();
      if (res.success) {
        setGrades(res.data || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, pageSize]);

  useEffect(() => {
    fetchGrades();
  }, []);

  const handleCreate = () => {
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleDetail = (record: ElectiveBatch) => {
    setDetailBatch(record);
    setIsDetailModalOpen(true);
  };

  const handleStart = async (id: string) => {
    try {
      const res = await batchApi.startBatch(id);
      if (res.success) {
        message.success('批次已启动');
        fetchData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleEnd = async (id: string) => {
    try {
      const res = await batchApi.endBatch(id);
      if (res.success) {
        message.success('批次已结束');
        fetchData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const [startDate, endDate] = values.dateRange as [Dayjs, Dayjs];
      
      const res = await batchApi.createBatch({
        name: values.name,
        academicYear: values.academicYear,
        semester: values.semester,
        startDate: startDate.toDate(),
        endDate: endDate.toDate(),
        gradeIds: values.gradeIds,
        maxCredits: values.maxCredits,
        minCredits: values.minCredits,
        description: values.description,
      });

      if (res.success) {
        message.success('创建成功');
        setIsModalOpen(false);
        fetchData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getStatusTag = (status: string) => {
    const colorMap: Record<string, string> = {
      pending: 'blue',
      active: 'green',
      ended: 'default',
      cancelled: 'red',
    };
    const textMap: Record<string, string> = {
      pending: '待开始',
      active: '进行中',
      ended: '已结束',
      cancelled: '已取消',
    };
    return <Tag color={colorMap[status] || 'default'}>{textMap[status] || status}</Tag>;
  };

  const columns: ColumnsType<ElectiveBatch> = [
    {
      title: '序号',
      key: 'index',
      width: 60,
      render: (_: unknown, __: ElectiveBatch, index: number) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: '批次名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text: string, record: ElectiveBatch) => (
        <a onClick={() => handleDetail(record)}>{text}</a>
      ),
    },
    {
      title: '学年',
      dataIndex: 'academicYear',
      key: 'academicYear',
      width: 120,
    },
    {
      title: '学期',
      dataIndex: 'semester',
      key: 'semester',
      width: 80,
    },
    {
      title: '开始时间',
      dataIndex: 'startDate',
      key: 'startDate',
      width: 180,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '结束时间',
      dataIndex: 'endDate',
      key: 'endDate',
      width: 180,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '学分限制',
      key: 'credits',
      width: 120,
      render: (_: unknown, record: ElectiveBatch) => (
        <span>
          {record.minCredits || 0} - {record.maxCredits || 0}
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_: unknown, record: ElectiveBatch) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleDetail(record)}>
            详情
          </Button>
          {record.status === 'pending' && (
            <Button type="link" size="small" icon={<PlayCircleOutlined />} onClick={() => handleStart(record.id)}>
              启动
            </Button>
          )}
          {record.status === 'active' && (
            <Button type="link" size="small" icon={<PauseCircleOutlined />} onClick={() => handleEnd(record.id)}>
              结束
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="page-container">
      <Card className="filter-card">
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新增批次
          </Button>
          <Button icon={<ReloadOutlined />} onClick={fetchData}>
            刷新
          </Button>
        </Space>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            current: currentPage,
            pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
        />
      </Card>

      <Modal
        title="新增选课批次"
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="批次名称"
                rules={[{ required: true, message: '请输入批次名称' }]}
              >
                <Input placeholder="例如：2024-2025学年第一学期选课" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="academicYear"
                label="学年"
                rules={[{ required: true, message: '请选择学年' }]}
              >
                <Select placeholder="请选择学年">
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return (
                      <Option key={year} value={`${year}-${year + 1}`}>
                        {year}-{year + 1}学年
                      </Option>
                    );
                  })}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="semester"
                label="学期"
                rules={[{ required: true, message: '请选择学期' }]}
              >
                <Select placeholder="请选择学期">
                  <Option value="1">第一学期</Option>
                  <Option value="2">第二学期</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="dateRange"
                label="选课时间段"
                rules={[{ required: true, message: '请选择选课时间段' }]}
              >
                <RangePicker
                  showTime
                  style={{ width: '100%' }}
                  placeholder={['开始时间', '结束时间']}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="gradeIds"
            label="参与年级"
            rules={[{ required: true, message: '请选择参与年级' }]}
          >
            <Select
              mode="multiple"
              placeholder="请选择参与年级"
              options={grades.map((g) => ({
                label: g.name,
                value: g.id,
              }))}
            />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="minCredits"
                label="最小学分"
                initialValue={0}
              >
                <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入最小学分" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="maxCredits"
                label="最大学分"
                initialValue={25}
                rules={[{ required: true, message: '请输入最大学分' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入最大学分" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="备注说明">
            <TextArea rows={3} placeholder="请输入备注说明" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="批次详情"
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={null}
        width={600}
      >
        {detailBatch && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="批次名称">{detailBatch.name}</Descriptions.Item>
            <Descriptions.Item label="学年">{detailBatch.academicYear}</Descriptions.Item>
            <Descriptions.Item label="学期">
              {detailBatch.semester === '1' ? '第一学期' : '第二学期'}
            </Descriptions.Item>
            <Descriptions.Item label="状态">{getStatusTag(detailBatch.status)}</Descriptions.Item>
            <Descriptions.Item label="选课时间段">
              {dayjs(detailBatch.startDate).format('YYYY-MM-DD HH:mm')} 至 {dayjs(detailBatch.endDate).format('YYYY-MM-DD HH:mm')}
            </Descriptions.Item>
            <Descriptions.Item label="学分限制">
              最小学分：{detailBatch.minCredits || 0}，最大学分：{detailBatch.maxCredits || 0}
            </Descriptions.Item>
            <Descriptions.Item label="参与年级">
              {detailBatch.gradeIds?.map((gradeId) => {
                const grade = grades.find((g) => g.id === gradeId);
                return grade?.name || gradeId;
              }).join('、') || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="备注">{detailBatch.description || '-'}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default BatchManagement;
