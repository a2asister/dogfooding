import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Tabs, Tag, Modal, message } from 'antd';
import { BookOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { studentApi } from '../../api';
import { Course } from '../../types';

const Courses: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);
  const [confirmModal, setConfirmModal] = useState<{ visible: boolean; course: Course | null; action: 'select' | 'drop' }>({
    visible: false,
    course: null,
    action: 'select',
  });

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const data = await studentApi.getCourses();
      setAvailableCourses(data.availableCourses || []);
      setSelectedCourses(data.selectedCourses || []);
    } catch (error) {
      console.error('加载课程失败', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (course: Course) => {
    try {
      await studentApi.selectCourse(course.id);
      message.success('选课成功');
      loadCourses();
    } catch (error) {
      console.error('选课失败', error);
    }
  };

  const handleDrop = async (course: Course) => {
    try {
      await studentApi.dropCourse(course.id);
      message.success('退课成功');
      loadCourses();
    } catch (error) {
      console.error('退课失败', error);
    }
  };

  const availableColumns = [
    { title: '课程名称', dataIndex: 'name', key: 'name' },
    { title: '授课教师', dataIndex: 'teacher', key: 'teacher', width: 120 },
    { title: '学分', dataIndex: 'credit', key: 'credit', width: 80 },
    {
      title: '选课人数',
      key: 'enrolled',
      width: 120,
      render: (_: any, record: Course) => `${record.enrolled}/${record.capacity}`,
    },
    { title: '学期', dataIndex: 'semester', key: 'semester', width: 180 },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: any, record: Course) =>
        record.selected ? (
          <Tag color="green">已选</Tag>
        ) : (
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            disabled={record.enrolled >= record.capacity}
            onClick={() => setConfirmModal({ visible: true, course: record, action: 'select' })}
          >
            选课
          </Button>
        ),
    },
  ];

  const selectedColumns = [
    { title: '课程名称', dataIndex: 'name', key: 'name' },
    { title: '授课教师', dataIndex: 'teacher', key: 'teacher', width: 120 },
    { title: '学分', dataIndex: 'credit', key: 'credit', width: 80 },
    { title: '学期', dataIndex: 'semester', key: 'semester', width: 180 },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: any, record: Course) => (
        <Button
          type="primary"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => setConfirmModal({ visible: true, course: record, action: 'drop' })}
        >
          退课
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Card
        className="card-shadow"
        title={<><BookOutlined /> 课程选择</>}
        extra={<Tag color="blue">已选 {selectedCourses.length} 门课程，共 {selectedCourses.reduce((sum, c) => sum + c.credit, 0)} 学分</Tag>}
      >
        <Tabs
          items={[
            {
              key: 'available',
              label: '可选课程',
              children: (
                <Table
                  loading={loading}
                  dataSource={availableCourses}
                  columns={availableColumns}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
              ),
            },
            {
              key: 'selected',
              label: '已选课程',
              children: (
                <Table
                  loading={loading}
                  dataSource={selectedCourses}
                  columns={selectedColumns}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title={confirmModal.action === 'select' ? '确认选课' : '确认退课'}
        open={confirmModal.visible}
        onOk={() => {
          if (confirmModal.course) {
            if (confirmModal.action === 'select') {
              handleSelect(confirmModal.course);
            } else {
              handleDrop(confirmModal.course);
            }
          }
          setConfirmModal({ visible: false, course: null, action: 'select' });
        }}
        onCancel={() => setConfirmModal({ visible: false, course: null, action: 'select' })}
        okText="确认"
        cancelText="取消"
      >
        <p>
          您确定要{confirmModal.action === 'select' ? '选择' : '退选'}课程「{confirmModal.course?.name}」吗？
        </p>
      </Modal>
    </div>
  );
};

export default Courses;
