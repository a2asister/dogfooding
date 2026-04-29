import { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Input,
  Select,
  Button,
  Tag,
  Modal,
  Descriptions,
  Space,
  Spin,
  message,
  Empty,
  Progress,
} from 'antd';
import {
  SearchOutlined,
  StarOutlined,
  StarFilled,
  EyeOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  BookOutlined,
} from '@ant-design/icons';
import { courseApi, electiveApi, batchApi, categoryApi } from '@/services';
import type { Course, ElectiveBatch, CourseCategory } from '@/types';

const { Option } = Select;
const { Search } = Input;

const CourseHall: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeBatches, setActiveBatches] = useState<ElectiveBatch[]>([]);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [keyword, setKeyword] = useState<string>('');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailCourse, setDetailCourse] = useState<Course | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [mySelections, setMySelections] = useState<Set<string>>(new Set());

  const fetchData = async () => {
    setLoading(true);
    try {
      const [batchesRes, categoriesRes] = await Promise.all([
        batchApi.getActiveBatches(),
        categoryApi.getCategories(),
      ]);

      if (batchesRes.success) {
        setActiveBatches(batchesRes.data || []);
        if (batchesRes.data && batchesRes.data.length > 0 && !selectedBatch) {
          setSelectedBatch(batchesRes.data[0].id);
        }
      }
      if (categoriesRes.success) {
        setCategories(categoriesRes.data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    if (!selectedBatch) return;
    setLoading(true);
    try {
      const res = await courseApi.getPublishedCourses({
        categoryId: selectedCategory || undefined,
        keyword: keyword || undefined,
        pageSize: 100,
      });
      if (res.success) {
        setCourses(res.data?.rows || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const res = await electiveApi.getMyFavorites();
      if (res.success) {
        const ids = new Set(res.data?.map((f) => f.courseId) || []);
        setFavorites(ids);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMySelections = async () => {
    if (!selectedBatch) return;
    try {
      const res = await electiveApi.getMySelections(selectedBatch);
      if (res.success) {
        const ids = new Set(res.data?.map((s) => s.courseId) || []);
        setMySelections(ids);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchFavorites();
  }, []);

  useEffect(() => {
    if (selectedBatch) {
      fetchCourses();
      fetchMySelections();
    }
  }, [selectedBatch, selectedCategory, keyword]);

  const handleSearch = (value: string) => {
    setKeyword(value);
  };

  const handleDetail = (course: Course) => {
    setDetailCourse(course);
    setIsDetailModalOpen(true);
  };

  const handleToggleFavorite = async (courseId: string) => {
    try {
      const res = await electiveApi.toggleFavorite(courseId);
      if (res.success && res.data) {
        if (res.data.isFavorite) {
          setFavorites((prev) => new Set([...prev, courseId]));
          message.success('收藏成功');
        } else {
          setFavorites((prev) => {
            const next = new Set(prev);
            next.delete(courseId);
            return next;
          });
          message.success('已取消收藏');
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSelectCourse = async (courseId: string) => {
    if (!selectedBatch) {
      message.warning('请先选择选课批次');
      return;
    }

    try {
      const res = await electiveApi.selectCourse({
        courseId,
        batchId: selectedBatch,
      });
      if (res.success) {
        message.success('选课成功');
        setMySelections((prev) => new Set([...prev, courseId]));
        fetchCourses();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDropCourse = async (courseId: string) => {
    if (!selectedBatch) {
      message.warning('请先选择选课批次');
      return;
    }

    try {
      const res = await electiveApi.dropCourse({
        courseId,
        batchId: selectedBatch,
      });
      if (res.success) {
        message.success('退课成功');
        setMySelections((prev) => {
          const next = new Set(prev);
          next.delete(courseId);
          return next;
        });
        fetchCourses();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const dayMap: Record<number, string> = {
    1: '周一', 2: '周二', 3: '周三', 4: '周四', 5: '周五', 6: '周六', 7: '周日'
  };

  return (
    <div className="page-container">
      <Card className="filter-card">
        <Space wrap>
          <Select
            placeholder="选择选课批次"
            style={{ width: 250 }}
            value={selectedBatch || undefined}
            onChange={setSelectedBatch}
          >
            {activeBatches.map((batch) => (
              <Option key={batch.id} value={batch.id}>
                {batch.name}
              </Option>
            ))}
          </Select>
          <Select
            placeholder="选择课程分类"
            style={{ width: 180 }}
            allowClear
            value={selectedCategory || undefined}
            onChange={setSelectedCategory}
          >
            {categories.map((cat) => (
              <Option key={cat.id} value={cat.id}>
                {cat.name}
              </Option>
            ))}
          </Select>
          <Search
            placeholder="搜索课程名称/编码"
            style={{ width: 250 }}
            onSearch={handleSearch}
            enterButton={<SearchOutlined />}
          />
        </Space>
      </Card>

      <Spin spinning={loading}>
        {courses.length > 0 ? (
          <Row gutter={[16, 16]}>
            {courses.map((course) => {
              const isSelected = mySelections.has(course.id);
              const isFavorite = favorites.has(course.id);
              const current = course.currentStudents || 0;
              const max = course.maxStudents || 50;
              const isFull = current >= max;
              const percent = Math.round((current / max) * 100);

              return (
                <Col xs={24} sm={12} lg={8} key={course.id}>
                  <Card
                    hoverable
                    className="course-card"
                    cover={
                      <div
                        style={{
                          height: 120,
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          padding: 16,
                        }}
                      >
                        <div>
                          <h3 style={{ color: 'white', margin: 0, marginBottom: 8 }}>{course.name}</h3>
                          <Space>
                            <Tag color="blue">{course.category?.name}</Tag>
                            <Tag color="green">{course.credit}学分</Tag>
                          </Space>
                        </div>
                      </div>
                    }
                    actions={[
                      <Button
                        type="link"
                        icon={isFavorite ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
                        onClick={() => handleToggleFavorite(course.id)}
                      >
                        {isFavorite ? '已收藏' : '收藏'}
                      </Button>,
                      <Button type="link" icon={<EyeOutlined />} onClick={() => handleDetail(course)}>
                        详情
                      </Button>,
                      isSelected ? (
                        <Button type="link" danger onClick={() => handleDropCourse(course.id)}>
                          退课
                        </Button>
                      ) : (
                        <Button
                          type="primary"
                          disabled={isFull}
                          onClick={() => handleSelectCourse(course.id)}
                        >
                          {isFull ? '已满' : '选课'}
                        </Button>
                      ),
                    ]}
                  >
                    <div style={{ marginBottom: 12 }}>
                      <Space size="small">
                        <Tag icon={<TeamOutlined />}>
                          {course.teacher?.name || '待分配'}
                        </Tag>
                        <Tag icon={<BookOutlined />}>
                          {course.code}
                        </Tag>
                        {isSelected && <Tag color="green">已选</Tag>}
                        {isFull && !isSelected && <Tag color="red">已满</Tag>}
                      </Space>
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <Space size="small" wrap>
                        {course.schedules?.map((s, i) => (
                          <Tag key={i} icon={<ClockCircleOutlined />}>
                            {dayMap[s.dayOfWeek]} 第{s.startPeriod}-{s.endPeriod}节 {s.location}
                          </Tag>
                        ))}
                      </Space>
                    </div>
                    <div>
                      <Progress
                        percent={percent}
                        size="small"
                        format={() => `${current}/${max}人`}
                        strokeColor={isFull ? '#f5222d' : '#52c41a'}
                      />
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        ) : (
          <Card>
            <Empty description="暂无可用课程" />
          </Card>
        )}
      </Spin>

      <Modal
        title="课程详情"
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={
          detailCourse && (
            <Space>
              <Button
                icon={favorites.has(detailCourse.id) ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
                onClick={() => handleToggleFavorite(detailCourse.id)}
              >
                {favorites.has(detailCourse.id) ? '已收藏' : '收藏'}
              </Button>
              {mySelections.has(detailCourse.id) ? (
                <Button danger onClick={() => handleDropCourse(detailCourse.id)}>
                  退课
                </Button>
              ) : (
                <Button
                  type="primary"
                  disabled={(detailCourse.currentStudents || 0) >= (detailCourse.maxStudents || 50)}
                  onClick={() => handleSelectCourse(detailCourse.id)}
                >
                  选课
                </Button>
              )}
            </Space>
          )
        }
        width={700}
      >
        {detailCourse && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="课程名称">{detailCourse.name}</Descriptions.Item>
            <Descriptions.Item label="课程编码">{detailCourse.code}</Descriptions.Item>
            <Descriptions.Item label="课程分类">{detailCourse.category?.name || '-'}</Descriptions.Item>
            <Descriptions.Item label="授课教师">{detailCourse.teacher?.name || '-'}</Descriptions.Item>
            <Descriptions.Item label="学分">{detailCourse.credit}</Descriptions.Item>
            <Descriptions.Item label="总学时">{detailCourse.totalHours || '-'}</Descriptions.Item>
            <Descriptions.Item label="选课进度">
              {detailCourse.currentStudents || 0} / {detailCourse.maxStudents || 50} 人
              <Progress
                percent={Math.round(((detailCourse.currentStudents || 0) / (detailCourse.maxStudents || 50)) * 100)}
                style={{ marginTop: 8 }}
              />
            </Descriptions.Item>
            <Descriptions.Item label="上课时间">
              {detailCourse.schedules && detailCourse.schedules.length > 0 ? (
                <Space direction="vertical">
                  {detailCourse.schedules.map((s, i) => (
                    <Tag key={i}>
                      {dayMap[s.dayOfWeek]} 第{s.startPeriod}-{s.endPeriod}节 {s.location}
                    </Tag>
                  ))}
                </Space>
              ) : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="课程简介">{detailCourse.description || '-'}</Descriptions.Item>
            <Descriptions.Item label="教学大纲">{detailCourse.syllabus || '-'}</Descriptions.Item>
            <Descriptions.Item label="先修课程">{detailCourse.prerequisites || '-'}</Descriptions.Item>
            <Descriptions.Item label="考核方式">{detailCourse.assessmentMethod || '-'}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default CourseHall;
