import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Empty,
  Modal,
  Descriptions,
  message,
} from 'antd';
import { ReloadOutlined, EyeOutlined, UserOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { teacherApi } from '@/services';
import type { TeacherCourse, CourseSelectionWithStudent } from '@/services/teacher';
import type { User } from '@/types';

const dayMap: Record<number, string> = {
  1: '周一', 2: '周二', 3: '周三', 4: '周四', 5: '周五', 6: '周六', 7: '周日'
};

const MyCourses: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<TeacherCourse[]>([]);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailCourse, setDetailCourse] = useState<TeacherCourse | null>(null);
  const [isStudentsModalOpen, setIsStudentsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<TeacherCourse | null>(null);
  const [students, setStudents] = useState<CourseSelectionWithStudent[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await teacherApi.getMyCourses();
      if (res.success && res.data) {
        setCourses(res.data.rows || []);
      }
    } catch (error) {
      console.error(error);
      message.error('获取课程列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleDetail = (course: TeacherCourse) => {
    setDetailCourse(course);
    setIsDetailModalOpen(true);
  };

  const handleViewStudents = async (course: TeacherCourse) => {
    setSelectedCourse(course);
    setIsStudentsModalOpen(true);
    setStudentsLoading(true);
    try {
      const res = await teacherApi.getCourseStudents(course.id);
      if (res.success) {
        setStudents(res.data || []);
      }
    } catch (error) {
      console.error(error);
      message.error('获取选课学生列表失败');
    } finally {
      setStudentsLoading(false);
    }
  };

  const columns: ColumnsType<TeacherCourse> = [
    {
      title: '序号',
      key: 'index',
      width: 60,
      render: (_: unknown, __: TeacherCourse, index: number) => index + 1,
    },
    {
      title: '课程名称',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      render: (text: string, record: TeacherCourse) => (
        <a onClick={() => handleDetail(record)}>{text}</a>
      ),
    },
    {
      title: '课程编码',
      dataIndex: 'code',
      key: 'code',
      width: 120,
    },
    {
      title: '课程分类',
      dataIndex: ['category', 'name'],
      key: 'category',
      width: 100,
      render: (text: string | undefined) => text || '-',
    },
    {
      title: '学分',
      dataIndex: 'credit',
      key: 'credit',
      width: 60,
    },
    {
      title: '选课人数',
      key: 'enrolledCount',
      width: 100,
      render: (_: unknown, record: TeacherCourse) => {
        const enrolled = record.enrolledCount ?? record.currentStudents ?? 0;
        const max = record.maxCapacity ?? record.maxStudents ?? 50;
        return (
          <Tag color={enrolled < max ? 'green' : 'orange'}>
            {enrolled}/{max}
          </Tag>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => {
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
      },
    },
    {
      title: '上课时间',
      key: 'schedule',
      width: 200,
      render: (_: unknown, record: TeacherCourse) => {
        const schedules = record.schedules;
        if (!schedules || schedules.length === 0) return '-';
        return (
          <Space direction="vertical" size="small">
            {schedules.map((s, i) => (
              <Tag key={i}>
                {dayMap[s.dayOfWeek]} 第{s.startPeriod}-{s.endPeriod}节
              </Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_: unknown, record: TeacherCourse) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleDetail(record)}>
            详情
          </Button>
          <Button
            type="link"
            size="small"
            icon={<UserOutlined />}
            onClick={() => handleViewStudents(record)}
          >
            选课名单
          </Button>
        </Space>
      ),
    },
  ];

  const studentColumns: ColumnsType<CourseSelectionWithStudent> = [
    {
      title: '序号',
      key: 'index',
      width: 60,
      render: (_: unknown, __: CourseSelectionWithStudent, index: number) => index + 1,
    },
    {
      title: '学号',
      dataIndex: ['student', 'studentNo'],
      key: 'studentNo',
      width: 120,
      render: (_: unknown, record: CourseSelectionWithStudent) => {
        const student = record.student;
        if ('username' in (student || {})) {
          return (student as User)?.studentNo || (student as User)?.studentId || '-';
        }
        return student?.studentNo || '-';
      },
    },
    {
      title: '姓名',
      dataIndex: ['student', 'name'],
      key: 'name',
      width: 100,
      render: (_: unknown, record: CourseSelectionWithStudent) => {
        return record.student?.name || '-';
      },
    },
    {
      title: '性别',
      dataIndex: ['student', 'gender'],
      key: 'gender',
      width: 60,
      render: (_: unknown, record: CourseSelectionWithStudent) => {
        const student = record.student;
        const genderMap: Record<string, string> = { male: '男', female: '女' };
        if ('username' in (student || {})) {
          return genderMap[(student as User)?.gender || ''] || '-';
        }
        return '-';
      },
    },
    {
      title: '专业',
      dataIndex: ['student', 'major'],
      key: 'major',
      width: 150,
      render: (_: unknown, record: CourseSelectionWithStudent) => {
        const student = record.student;
        if ('username' in (student || {})) {
          return (student as User)?.major || '-';
        }
        return '-';
      },
    },
    {
      title: '年级',
      dataIndex: ['student', 'gradeId'],
      key: 'grade',
      width: 100,
      render: (_: unknown, record: CourseSelectionWithStudent) => {
        const student = record.student;
        if ('username' in (student || {})) {
          return (student as User)?.grade?.name || student?.grade?.name || '-';
        }
        return student?.grade?.name || '-';
      },
    },
    {
      title: '班级',
      dataIndex: ['student', 'classId'],
      key: 'class',
      width: 100,
      render: (_: unknown, record: CourseSelectionWithStudent) => {
        const student = record.student;
        if ('username' in (student || {})) {
          return (student as User)?.class?.name || student?.class?.name || '-';
        }
        return student?.class?.name || '-';
      },
    },
    {
      title: '成绩',
      dataIndex: 'score',
      key: 'score',
      width: 80,
      render: (score: number | null | undefined) => {
        if (score === null || score === undefined) {
          return <Tag color="default">未录入</Tag>;
        }
        return (
          <Tag color={score >= 60 ? 'green' : 'red'}>
            {score}
          </Tag>
        );
      },
    },
    {
      title: '选课状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          selected: 'green',
          dropped: 'red',
          completed: 'blue',
        };
        const textMap: Record<string, string> = {
          selected: '已选',
          dropped: '已退',
          completed: '已完成',
        };
        return <Tag color={colorMap[status] || 'default'}>{textMap[status] || status}</Tag>;
      },
    },
    {
      title: '选课时间',
      dataIndex: 'selectedAt',
      key: 'selectedAt',
      width: 160,
      render: (date: string | undefined) => date ? new Date(date).toLocaleString() : '-',
    },
  ];

  return (
    <div className="page-container">
      <Card className="filter-card">
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchCourses}>
            刷新
          </Button>
          <Tag color="blue">共 {courses.length} 门课程</Tag>
        </Space>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={courses}
          rowKey="id"
          loading={loading}
          locale={{
            emptyText: <Empty description="暂无课程" />,
          }}
        />
      </Card>

      <Modal
        title="课程详情"
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={null}
        width={600}
      >
        {detailCourse && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="课程名称">
              {detailCourse.name}
            </Descriptions.Item>
            <Descriptions.Item label="课程编码">
              {detailCourse.code}
            </Descriptions.Item>
            <Descriptions.Item label="课程分类">
              {detailCourse.category?.name || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="授课教师">
              {detailCourse.teacher?.name || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="学分">
              {detailCourse.credit}
            </Descriptions.Item>
            <Descriptions.Item label="总学时">
              {detailCourse.totalHours || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="选课人数">
              {(detailCourse.enrolledCount ?? detailCourse.currentStudents ?? 0)}/{(detailCourse.maxCapacity ?? detailCourse.maxStudents ?? 50)}
            </Descriptions.Item>
            <Descriptions.Item label="上课时间">
              {(() => {
                const schedules = detailCourse.schedules;
                if (!schedules || schedules.length === 0) return '-';
                return (
                  <Space direction="vertical">
                    {schedules.map((s, i) => (
                      <Tag key={i}>
                        {dayMap[s.dayOfWeek]} 第{s.startPeriod}-{s.endPeriod}节 {s.location}
                      </Tag>
                    ))}
                  </Space>
                );
              })()}
            </Descriptions.Item>
            <Descriptions.Item label="课程简介">
              {detailCourse.description || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={detailCourse.status === 'published' ? 'green' : 'default'}>
                {detailCourse.status === 'published' ? '已发布' : '草稿'}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      <Modal
        title={`选课名单 - ${selectedCourse?.name}`}
        open={isStudentsModalOpen}
        onCancel={() => setIsStudentsModalOpen(false)}
        footer={null}
        width={1000}
      >
        <div style={{ marginBottom: 16 }}>
          <Tag color="blue">共 {students.length} 名学生</Tag>
        </div>
        <Table
          columns={studentColumns}
          dataSource={students}
          rowKey="id"
          loading={studentsLoading}
          locale={{
            emptyText: <Empty description="暂无选课学生" />,
          }}
          scroll={{ x: 1000 }}
        />
      </Modal>
    </div>
  );
};

export default MyCourses;
