import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Input,
  Select,
  Modal,
  Form,
  message,
  Space,
  Popconfirm,
  Tag,
  Card,
  Row,
  Col,
  InputNumber,
  Divider,
  Descriptions,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  ReloadOutlined,
  EyeOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { courseApi, userApi } from '@/services';
import type { Course, CourseCategory } from '@/types';

const { Option } = Select;
const { TextArea } = Input;

const CourseManagement: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Course[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [detailCourse, setDetailCourse] = useState<Course | null>(null);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [teachers, setTeachers] = useState<Array<{ id: string; name: string; teacherNo?: string }>>([]);
  const [schedules, setSchedules] = useState<Array<{
    dayOfWeek: number;
    startPeriod: number;
    endPeriod: number;
    location: string;
    startWeek: number;
    endWeek: number;
  }>>([
    { dayOfWeek: 1, startPeriod: 1, endPeriod: 2, location: '', startWeek: 1, endWeek: 18 },
  ]);

  const [filters, setFilters] = useState({
    keyword: '',
    categoryId: '',
    teacherId: '',
    status: undefined as string | undefined,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await courseApi.getCourses({
        keyword: filters.keyword || undefined,
        categoryId: filters.categoryId || undefined,
        teacherId: filters.teacherId || undefined,
        status: filters.status as 'draft' | 'published' | 'archived' | undefined,
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

  const fetchCategories = async () => {
    try {
      const res = await courseApi.getCategories();
      if (res.success) {
        setCategories(res.data || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await userApi.getTeachers();
      if (res.success) {
        setTeachers(res.data || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, pageSize, filters]);

  useEffect(() => {
    fetchCategories();
    fetchTeachers();
  }, []);

  const handleCreate = () => {
    setEditingCourse(null);
    form.resetFields();
    setSchedules([{ dayOfWeek: 1, startPeriod: 1, endPeriod: 2, location: '', startWeek: 1, endWeek: 18 }]);
    setIsModalOpen(true);
  };

  const handleEdit = (record: Course) => {
    setEditingCourse(record);
    form.setFieldsValue({
      name: record.name,
      code: record.code,
      categoryId: record.categoryId,
      teacherId: record.teacherId,
      credit: record.credit,
      totalHours: record.totalHours,
      maxStudents: record.maxStudents,
      description: record.description,
      syllabus: record.syllabus,
      prerequisites: record.prerequisites,
      assessmentMethod: record.assessmentMethod,
      isHot: record.isHot,
      sortOrder: record.sortOrder,
    });
    setSchedules(
      record.schedules?.map((s) => ({
        dayOfWeek: s.dayOfWeek,
        startPeriod: s.startPeriod,
        endPeriod: s.endPeriod,
        location: s.location,
        startWeek: s.startWeek || 1,
        endWeek: s.endWeek || 18,
      })) || [{ dayOfWeek: 1, startPeriod: 1, endPeriod: 2, location: '', startWeek: 1, endWeek: 18 }]
    );
    setIsModalOpen(true);
  };

  const handleDetail = (record: Course) => {
    setDetailCourse(record);
    setIsDetailModalOpen(true);
  };

  const handlePublish = async (id: string) => {
    try {
      const res = await courseApi.publishCourse(id);
      if (res.success) {
        message.success('发布成功');
        fetchData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleArchive = async (id: string) => {
    try {
      const res = await courseApi.archiveCourse(id);
      if (res.success) {
        message.success('归档成功');
        fetchData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const validSchedules = schedules.filter((s) => s.location);
      if (editingCourse) {
        const res = await courseApi.updateCourse(editingCourse.id, {
          name: values.name,
          categoryId: values.categoryId,
          teacherId: values.teacherId,
          credit: values.credit,
          totalHours: values.totalHours,
          maxStudents: values.maxStudents,
          description: values.description,
          syllabus: values.syllabus,
          prerequisites: values.prerequisites,
          assessmentMethod: values.assessmentMethod,
          isHot: values.isHot,
          sortOrder: values.sortOrder,
          schedules: validSchedules,
        });
        if (res.success) {
          message.success('更新成功');
          setIsModalOpen(false);
          fetchData();
        }
      } else {
        const res = await courseApi.createCourse({
          name: values.name,
          code: values.code,
          categoryId: values.categoryId,
          teacherId: values.teacherId,
          credit: values.credit,
          totalHours: values.totalHours,
          maxStudents: values.maxStudents,
          description: values.description,
          syllabus: values.syllabus,
          prerequisites: values.prerequisites,
          assessmentMethod: values.assessmentMethod,
          sortOrder: values.sortOrder,
          schedules: validSchedules,
        });
        if (res.success) {
          message.success('创建成功');
          setIsModalOpen(false);
          fetchData();
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const addSchedule = () => {
    setSchedules([...schedules, { dayOfWeek: 1, startPeriod: 1, endPeriod: 2, location: '', startWeek: 1, endWeek: 18 }]);
  };

  const removeSchedule = (index: number) => {
    if (schedules.length > 1) {
      setSchedules(schedules.filter((_, i) => i !== index));
    }
  };

  const updateSchedule = (index: number, field: string, value: number | string) => {
    const newSchedules = [...schedules];
    (newSchedules[index] as Record<string, unknown>)[field] = value;
    setSchedules(newSchedules);
  };

  const dayMap: Record<number, string> = {
    1: '周一', 2: '周二', 3: '周三', 4: '周四', 5: '周五', 6: '周六', 7: '周日'
  };

  const getStatusTag = (status: string) => {
    const colorMap: Record<string, string> = {
      draft: 'default',
      published: 'green',
      archived: 'red',
    };
    const textMap: Record<string, string> = {
      draft: '草稿',
      published: '已发布',
      archived: '已归档',
    };
    return <Tag color={colorMap[status] || 'default'}>{textMap[status] || status}</Tag>;
  };

  const columns: ColumnsType<Course> = [
    {
      title: '序号',
      key: 'index',
      width: 60,
      render: (_: unknown, __: Course, index: number) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: '课程编码',
      dataIndex: 'code',
      key: 'code',
      width: 120,
    },
    {
      title: '课程名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (text: string, record: Course) => (
        <a onClick={() => handleDetail(record)}>{text}</a>
      ),
    },
    {
      title: '课程分类',
      dataIndex: ['category', 'name'],
      key: 'category',
      width: 100,
      render: (text: string) => text || '-',
    },
    {
      title: '授课教师',
      dataIndex: ['teacher', 'name'],
      key: 'teacher',
      width: 100,
      render: (text: string) => text || '-',
    },
    {
      title: '学分',
      dataIndex: 'credit',
      key: 'credit',
      width: 60,
    },
    {
      title: '选课人数',
      key: 'students',
      width: 100,
      render: (_: unknown, record: Course) => (
        <span>
          {record.currentStudents || 0} / {record.maxStudents || 50}
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
      title: '热门',
      dataIndex: 'isHot',
      key: 'isHot',
      width: 60,
      render: (isHot: boolean) => (
        isHot ? <Tag color="orange">热门</Tag> : '-'
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 280,
      fixed: 'right',
      render: (_: unknown, record: Course) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleDetail(record)}>
            详情
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          {record.status === 'draft' && (
            <Button type="link" size="small" onClick={() => handlePublish(record.id)}>
              发布
            </Button>
          )}
          {record.status === 'published' && (
            <Popconfirm title="确定要归档吗？" onConfirm={() => handleArchive(record.id)}>
              <Button type="link" size="small">
                归档
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="page-container">
      <Card className="filter-card">
        <Space wrap>
          <Input
            placeholder="搜索课程名称/编码"
            prefix={<SearchOutlined />}
            style={{ width: 200 }}
            value={filters.keyword}
            onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
            onPressEnter={() => { setCurrentPage(1); fetchData(); }}
          />
          <Select
            placeholder="选择课程分类"
            style={{ width: 150 }}
            allowClear
            value={filters.categoryId || undefined}
            onChange={(value) => setFilters({ ...filters, categoryId: value })}
          >
            {categories.map((c) => (
              <Option key={c.id} value={c.id}>{c.name}</Option>
            ))}
          </Select>
          <Select
            placeholder="选择授课教师"
            style={{ width: 150 }}
            allowClear
            value={filters.teacherId || undefined}
            onChange={(value) => setFilters({ ...filters, teacherId: value })}
          >
            {teachers.map((t) => (
              <Option key={t.id} value={t.id}>{t.name}</Option>
            ))}
          </Select>
          <Select
            placeholder="选择状态"
            style={{ width: 120 }}
            allowClear
            value={filters.status}
            onChange={(value) => setFilters({ ...filters, status: value })}
          >
            <Option value="draft">草稿</Option>
            <Option value="published">已发布</Option>
            <Option value="archived">已归档</Option>
          </Select>
          <Button icon={<SearchOutlined />} onClick={() => { setCurrentPage(1); fetchData(); }}>
            搜索
          </Button>
          <Button icon={<ReloadOutlined />} onClick={fetchData}>
            刷新
          </Button>
        </Space>
        <div style={{ marginTop: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新增课程
          </Button>
        </div>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1400 }}
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
        title={editingCourse ? '编辑课程' : '新增课程'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        width={800}
        style={{ top: 20 }}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="code"
                label="课程编码"
                rules={[{ required: true, message: '请输入课程编码' }]}
              >
                <Input placeholder="请输入课程编码" disabled={!!editingCourse} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="name"
                label="课程名称"
                rules={[{ required: true, message: '请输入课程名称' }]}
              >
                <Input placeholder="请输入课程名称" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="categoryId"
                label="课程分类"
                rules={[{ required: true, message: '请选择课程分类' }]}
              >
                <Select placeholder="请选择课程分类">
                  {categories.map((c) => (
                    <Option key={c.id} value={c.id}>{c.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="teacherId"
                label="授课教师"
                rules={[{ required: true, message: '请选择授课教师' }]}
              >
                <Select placeholder="请选择授课教师">
                  {teachers.map((t) => (
                    <Option key={t.id} value={t.id}>{t.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="credit"
                label="学分"
                rules={[{ required: true, message: '请输入学分' }]}
              >
                <InputNumber min={0} max={10} step={0.5} style={{ width: '100%' }} placeholder="请输入学分" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="totalHours"
                label="总学时"
                initialValue={36}
              >
                <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入总学时" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="maxStudents"
                label="最大人数"
                initialValue={50}
              >
                <InputNumber min={1} style={{ width: '100%' }} placeholder="请输入最大人数" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="isHot"
                label="热门课程"
                valuePropName="checked"
                initialValue={false}
              >
                <Select>
                  <Option value={true}>是</Option>
                  <Option value={false}>否</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="sortOrder"
                label="排序"
                initialValue={0}
              >
                <InputNumber min={0} style={{ width: '100%' }} placeholder="数字越小越靠前" />
              </Form.Item>
            </Col>
          </Row>
          <Divider orientation="left">上课时间安排</Divider>
          {schedules.map((schedule, index) => (
            <Card
              key={index}
              size="small"
              style={{ marginBottom: 16 }}
              title={
                <Space>
                  <Tag color="blue">第 {index + 1} 节课程</Tag>
                  {schedule.location && (
                    <Tag color="green">
                      {dayMap[schedule.dayOfWeek]} 第{schedule.startPeriod}-{schedule.endPeriod}节 · {schedule.location}
                    </Tag>
                  )}
                </Space>
              }
              extra={
                schedules.length > 1 ? (
                  <Button type="text" danger onClick={() => removeSchedule(index)}>
                    删除
                  </Button>
                ) : null
              }
            >
              <Row gutter={[16, 16]}>
                <Col xs={12} sm={6}>
                  <div style={{ marginBottom: 4, color: '#666', fontSize: 12 }}>星期</div>
                  <Select
                    value={schedule.dayOfWeek}
                    onChange={(value) => updateSchedule(index, 'dayOfWeek', value)}
                    style={{ width: '100%' }}
                    size="large"
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                      <Option key={d} value={d}>{dayMap[d]}</Option>
                    ))}
                  </Select>
                </Col>
                <Col xs={12} sm={6}>
                  <div style={{ marginBottom: 4, color: '#666', fontSize: 12 }}>节次</div>
                  <Space.Compact style={{ width: '100%' }}>
                    <Select
                      value={schedule.startPeriod}
                      onChange={(value) => updateSchedule(index, 'startPeriod', value || 1)}
                      style={{ width: '45%' }}
                      size="large"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((p) => (
                        <Option key={p} value={p}>{p}</Option>
                      ))}
                    </Select>
                    <Input
                      disabled
                      value="-"
                      style={{ width: '10%', textAlign: 'center', pointerEvents: 'none' }}
                      size="large"
                    />
                    <Select
                      value={schedule.endPeriod}
                      onChange={(value) => updateSchedule(index, 'endPeriod', value || 2)}
                      style={{ width: '45%' }}
                      size="large"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((p) => (
                        <Option key={p} value={p}>{p}</Option>
                      ))}
                    </Select>
                  </Space.Compact>
                </Col>
                <Col xs={12} sm={6}>
                  <div style={{ marginBottom: 4, color: '#666', fontSize: 12 }}>周次</div>
                  <Space.Compact style={{ width: '100%' }}>
                    <Select
                      value={schedule.startWeek}
                      onChange={(value) => updateSchedule(index, 'startWeek', value || 1)}
                      style={{ width: '45%' }}
                      size="large"
                    >
                      {Array.from({ length: 20 }, (_, i) => i + 1).map((w) => (
                        <Option key={w} value={w}>{w}</Option>
                      ))}
                    </Select>
                    <Input
                      disabled
                      value="-"
                      style={{ width: '10%', textAlign: 'center', pointerEvents: 'none' }}
                      size="large"
                    />
                    <Select
                      value={schedule.endWeek}
                      onChange={(value) => updateSchedule(index, 'endWeek', value || 18)}
                      style={{ width: '45%' }}
                      size="large"
                    >
                      {Array.from({ length: 20 }, (_, i) => i + 1).map((w) => (
                        <Option key={w} value={w}>{w}</Option>
                      ))}
                    </Select>
                  </Space.Compact>
                </Col>
                <Col xs={12} sm={6}>
                  <div style={{ marginBottom: 4, color: '#666', fontSize: 12 }}>上课地点 <span style={{ color: '#ff4d4f' }}>*</span></div>
                  <Input
                    placeholder="例如：教学楼A301"
                    value={schedule.location}
                    onChange={(e) => updateSchedule(index, 'location', e.target.value)}
                    size="large"
                  />
                </Col>
              </Row>
              {schedule.startPeriod > schedule.endPeriod && (
                <div style={{ marginTop: 8, color: '#ff4d4f', fontSize: 12 }}>
                  ⚠️ 开始节次不能大于结束节次
                </div>
              )}
              {schedule.startWeek > schedule.endWeek && (
                <div style={{ marginTop: 8, color: '#ff4d4f', fontSize: 12 }}>
                  ⚠️ 开始周次不能大于结束周次
                </div>
              )}
            </Card>
          ))}
          <Button type="dashed" onClick={addSchedule} block icon={<PlusOutlined />} size="large" style={{ height: 48 }}>
            添加上课时间
          </Button>
          <Divider orientation="left">其他信息</Divider>
          <Form.Item name="description" label="课程简介">
            <TextArea rows={3} placeholder="请输入课程简介" />
          </Form.Item>
          <Form.Item name="syllabus" label="教学大纲">
            <TextArea rows={3} placeholder="请输入教学大纲" />
          </Form.Item>
          <Form.Item name="prerequisites" label="先修课程要求">
            <TextArea rows={2} placeholder="请输入先修课程要求" />
          </Form.Item>
          <Form.Item name="assessmentMethod" label="考核方式">
            <TextArea rows={2} placeholder="请输入考核方式" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="课程详情"
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={null}
        width={700}
      >
        {detailCourse && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="课程编码">{detailCourse.code}</Descriptions.Item>
            <Descriptions.Item label="课程名称">{detailCourse.name}</Descriptions.Item>
            <Descriptions.Item label="课程分类">
              {detailCourse.category?.name || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="授课教师">
              {detailCourse.teacher?.name || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="学分">{detailCourse.credit}</Descriptions.Item>
            <Descriptions.Item label="总学时">{detailCourse.totalHours || '-'}</Descriptions.Item>
            <Descriptions.Item label="选课人数">
              {detailCourse.currentStudents || 0} / {detailCourse.maxStudents || 50}
            </Descriptions.Item>
            <Descriptions.Item label="状态">{getStatusTag(detailCourse.status)}</Descriptions.Item>
            <Descriptions.Item label="上课时间" span={2}>
              {detailCourse.schedules && detailCourse.schedules.length > 0 ? (
                <Space direction="vertical">
                  {detailCourse.schedules.map((s, i) => (
                    <Tag key={i} icon={<ClockCircleOutlined />}>
                      {dayMap[s.dayOfWeek]} 第{s.startPeriod}-{s.endPeriod}节 {s.location} (第{s.startWeek || 1}-{s.endWeek || 18}周)
                    </Tag>
                  ))}
                </Space>
              ) : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="课程简介" span={2}>
              {detailCourse.description || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="教学大纲" span={2}>
              {detailCourse.syllabus || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="先修课程" span={2}>
              {detailCourse.prerequisites || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="考核方式" span={2}>
              {detailCourse.assessmentMethod || '-'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default CourseManagement;
