import React, { useState, useEffect } from 'react';
import type { Course } from '../types';

interface CourseDetailProps {
  course: Course;
  onClose: () => void;
}

export default function CourseDetail({ course, onClose }: CourseDetailProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    });
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 400);
  };

  return (
    <div
      onClick={handleClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.4s ease-out',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(145deg, #2a2a4a, #1a1a3a)',
          borderRadius: 24,
          padding: 0,
          maxWidth: 500,
          width: '90%',
          overflow: 'hidden',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.5), 0 0 100px rgba(100, 150, 255, 0.2)',
          border: '2px solid rgba(255, 255, 255, 0.1)',
          transform: isVisible ? 'scale(1) translateZ(0)' : 'scale(0.3) translateZ(-1000px)',
          transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transformStyle: 'preserve-3d',
        }}
      >
        <div
          style={{
            position: 'relative',
            height: 280,
            overflow: 'hidden',
          }}
        >
          <img
            src={course.cover}
            alt={course.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: isVisible ? 'scale(1)' : 'scale(1.3)',
              transition: 'transform 0.6s ease-out 0.2s',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 150,
              background: 'linear-gradient(transparent, rgba(26, 26, 58, 1))',
              pointerEvents: 'none',
            }}
          />
          <button
            onClick={handleClose}
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'rgba(0, 0, 0, 0.5)',
              border: 'none',
              color: '#fff',
              fontSize: 24,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(5px)',
              transition: 'transform 0.2s, background 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.7)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.5)';
            }}
          >
            ×
          </button>
        </div>

        <div
          style={{
            padding: 28,
            marginTop: -60,
            position: 'relative',
          }}
        >
          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
              marginBottom: 12,
              color: '#fff',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
            }}
          >
            {course.title}
          </h1>

          <div
            style={{
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap',
              marginBottom: 20,
            }}
          >
            {course.categories.map((cat) => (
              <span
                key={cat.id}
                style={{
                  fontSize: 12,
                  padding: '4px 12px',
                  borderRadius: 12,
                  background: 'rgba(100, 150, 255, 0.3)',
                  color: '#a8c0ff',
                }}
              >
                {cat.name}
              </span>
            ))}
          </div>

          <p
            style={{
              fontSize: 15,
              lineHeight: 1.7,
              color: 'rgba(255, 255, 255, 0.8)',
              marginBottom: 24,
            }}
          >
            {course.description}
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 16,
              marginBottom: 28,
            }}
          >
            <div
              style={{
                textAlign: 'center',
                padding: 16,
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 12,
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: 'rgba(255, 255, 255, 0.5)',
                  marginBottom: 4,
                }}
              >
                讲师
              </div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: '#fff',
                }}
              >
                {course.instructor || '未知'}
              </div>
            </div>

            <div
              style={{
                textAlign: 'center',
                padding: 16,
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 12,
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: 'rgba(255, 255, 255, 0.5)',
                  marginBottom: 4,
                }}
              >
                时长
              </div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: '#fff',
                }}
              >
                {course.duration || '未知'}
              </div>
            </div>

            <div
              style={{
                textAlign: 'center',
                padding: 16,
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 12,
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: 'rgba(255, 255, 255, 0.5)',
                  marginBottom: 4,
                }}
              >
                难度
              </div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color:
                    course.level === '初级'
                      ? '#4ecdc4'
                      : course.level === '中级'
                      ? '#ffab40'
                      : '#ff6b6b',
                }}
              >
                {course.level || '未知'}
              </div>
            </div>
          </div>

          <button
            style={{
              width: '100%',
              padding: 16,
              fontSize: 16,
              fontWeight: 600,
              color: '#fff',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: 12,
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 15px 40px rgba(102, 126, 234, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.4)';
            }}
          >
            立即学习
          </button>
        </div>
      </div>
    </div>
  );
}
