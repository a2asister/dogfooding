import React, { useState, useEffect } from 'react';
import Cube3D from './Cube3D';
import TagCloud from './TagCloud';
import CourseDetail from './CourseDetail';
import { fetchCourses, fetchCategories } from '../utils/api';
import type { Course, Category } from '../types';

export default function CourseSelector() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [coursesData, categoriesData] = await Promise.all([
          fetchCourses(),
          fetchCategories(),
        ]);
        setCourses(coursesData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const coursesData = await fetchCourses(selectedCategory || undefined);
        setCourses(coursesData);
      } catch (error) {
        console.error('Failed to load courses:', error);
      }
    };

    loadCourses();
  }, [selectedCategory]);

  const handleCategorySelect = (slug: string | null) => {
    setSelectedCategory(slug);
  };

  const handleCourseClick = (course: Course) => {
    setSelectedCourse(course);
  };

  const handleCloseDetail = () => {
    setSelectedCourse(null);
  };

  if (loading) {
    return (
      <div
        style={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            fontSize: 24,
            color: 'rgba(255, 255, 255, 0.8)',
          }}
        >
          加载中...
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        padding: 20,
      }}
    >
      <h1
        style={{
          fontSize: 36,
          fontWeight: 700,
          marginBottom: 8,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        课程选择器
      </h1>

      <p
        style={{
          fontSize: 14,
          color: 'rgba(255, 255, 255, 0.6)',
          marginBottom: 24,
        }}
      >
        滑动立方体浏览课程，点击标签筛选，点击课程查看详情
      </p>

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 30,
        }}
      >
        <TagCloud
          categories={categories}
          selectedCategory={selectedCategory}
          onCategorySelect={handleCategorySelect}
        />

        <div
          style={{
            position: 'relative',
            perspective: 1000,
          }}
        >
          {courses.length > 0 ? (
            <Cube3D courses={courses} onCourseClick={handleCourseClick} />
          ) : (
            <div
              style={{
                width: 280,
                height: 280,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                color: 'rgba(255, 255, 255, 0.6)',
              }}
            >
              该分类下暂无课程
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          marginTop: 20,
          fontSize: 12,
          color: 'rgba(255, 255, 255, 0.4)',
        }}
      >
        ← 左右滑动旋转立方体 →
      </div>

      {selectedCourse && (
        <CourseDetail course={selectedCourse} onClose={handleCloseDetail} />
      )}
    </div>
  );
}
