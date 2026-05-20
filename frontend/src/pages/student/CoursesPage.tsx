import { useState, useEffect } from 'react';
import { Card, Row, Col, Tag, Button, Input, Select, Empty, Spin } from 'antd';
import { SearchOutlined, StarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { coursesAPI } from '../../services/api';
import { Course } from '../../types';

const { Search } = Input;
const { Option } = Select;

export const CoursesPage = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [searchText, levelFilter, courses]);

  const loadCourses = async () => {
    try {
      const response = await coursesAPI.getCourses();
      setCourses(response.data.courses);
      setFilteredCourses(response.data.courses);
    } catch (err) {
      console.error('Failed to load courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = courses;
    
    if (searchText) {
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(searchText.toLowerCase()) ||
          course.description?.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    if (levelFilter !== 'all') {
      filtered = filtered.filter((course) => course.level === levelFilter);
    }
    
    setFilteredCourses(filtered);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'green';
      case 'basic':
        return 'blue';
      case 'advanced':
        return 'orange';
      default:
        return 'default';
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case 'beginner':
        return '🌱 启蒙';
      case 'basic':
        return '📖 基础';
      case 'advanced':
        return '🚀 进阶';
      default:
        return level;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">📚 课程中心</h2>
        <div className="flex gap-3 w-full sm:w-auto">
          <Search
            placeholder="搜索课程..."
            allowClear
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
            prefix={<SearchOutlined />}
          />
          <Select
            value={levelFilter}
            onChange={setLevelFilter}
            style={{ width: 150 }}
          >
            <Option value="all">全部等级</Option>
            <Option value="beginner">启蒙级</Option>
            <Option value="basic">基础级</Option>
            <Option value="advanced">进阶级</Option>
          </Select>
        </div>
      </div>

      <Spin spinning={loading}>
        {filteredCourses.length === 0 && !loading ? (
          <Empty description="暂无课程" />
        ) : (
          <Row gutter={[16, 16]}>
            {filteredCourses.map((course) => (
              <Col xs={24} sm={12} lg={8} key={course.id}>
                <Card
                  hoverable
                  className="h-full shadow-sm hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/courses/${course.id}`)}
                  cover={
                    <div
                      className="h-40 flex items-center justify-center text-6xl"
                      style={{
                        background: `linear-gradient(135deg, ${
                          course.level === 'beginner'
                            ? '#d1fae5'
                            : course.level === 'basic'
                            ? '#dbeafe'
                            : '#ffedd5'
                        }, ${
                          course.level === 'beginner'
                            ? '#6ee7b7'
                            : course.level === 'basic'
                            ? '#93c5fd'
                            : '#fdba74'
                        })`,
                      }}
                    >
                      {course.level === 'beginner'
                        ? '🌱'
                        : course.level === 'basic'
                        ? '📖'
                        : '🚀'}
                    </div>
                  }
                >
                  <Card.Meta
                    title={
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{course.title}</span>
                        <Tag color={getLevelColor(course.level)}>
                          {getLevelText(course.level)}
                        </Tag>
                      </div>
                    }
                    description={
                      <div className="mt-2">
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                          {course.description || '暂无描述'}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <StarOutlined /> {course.rating || 0}
                          </span>
                          <span>{course.lessonCount || 0} 节课</span>
                          <span>{course.enrollmentCount || 0} 人学习</span>
                        </div>
                      </div>
                    }
                  />
                  <div className="mt-4">
                    <Button type="primary" block>
                      开始学习
                    </Button>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Spin>
    </div>
  );
};

export default CoursesPage;
