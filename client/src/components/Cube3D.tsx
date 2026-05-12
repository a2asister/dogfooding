import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Course } from '../types';

interface Cube3DProps {
  courses: Course[];
  onCourseClick: (course: Course) => void;
}

interface FaceState {
  offsetX: number;
  offsetY: number;
  scale: number;
  opacity: number;
}

const FACE_SIZE = 280;
const FACE_DEPTH = 150;
const ROTATION_THRESHOLD = 30;
const INERTIA_FRICTION = 0.95;
const BOUNCE_STRENGTH = 0.3;
const BOUNCE_FRICTION = 0.85;
const MIN_VELOCITY = 0.01;

const initialFaceStates: FaceState[] = [
  { offsetX: 0, offsetY: 0, scale: 1, opacity: 1 },
  { offsetX: 0, offsetY: 0, scale: 1, opacity: 1 },
  { offsetX: 0, offsetY: 0, scale: 1, opacity: 1 },
  { offsetX: 0, offsetY: 0, scale: 1, opacity: 1 },
  { offsetX: 0, offsetY: 0, scale: 1, opacity: 1 },
  { offsetX: 0, offsetY: 0, scale: 1, opacity: 1 },
];

export default function Cube3D({ courses, onCourseClick }: Cube3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotationY, setRotationY] = useState(0);
  const [rotationX, setRotationX] = useState(-10);
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredFace, setHoveredFace] = useState<number | null>(null);
  const [isExploding, setIsExploding] = useState(false);
  const [faceStates, setFaceStates] = useState<FaceState[]>(initialFaceStates);

  const startPosRef = useRef({ x: 0, y: 0 });
  const startRotationRef = useRef({ y: 0, x: -10 });
  const velocityRef = useRef({ x: 0, y: 0 });
  const lastTimeRef = useRef(0);
  const animationRef = useRef<number | null>(null);

  const paddedCourses = React.useMemo(() => {
    const pad = [...courses];
    while (pad.length < 6) {
      pad.push(...courses);
    }
    return pad.slice(0, 6);
  }, [courses]);

  const minAngle = 0;
  const maxAngle = (courses.length > 1 ? courses.length - 1 : 1) * 90;

  const stopAnimation = useCallback(() => {
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const animateInertia = useCallback(() => {
    const animate = () => {
      if (
        Math.abs(velocityRef.current.x) < MIN_VELOCITY &&
        Math.abs(velocityRef.current.y) < MIN_VELOCITY
      ) {
        animationRef.current = null;
        return;
      }

      setRotationY((prev) => {
        let newRot = prev + velocityRef.current.x;
        let shouldBounce = false;
        let bounceDirection = 0;

        if (newRot < minAngle) {
          const overshoot = minAngle - newRot;
          newRot = minAngle - overshoot * BOUNCE_STRENGTH;
          bounceDirection = 1;
          shouldBounce = true;
        } else if (newRot > maxAngle) {
          const overshoot = newRot - maxAngle;
          newRot = maxAngle + overshoot * BOUNCE_STRENGTH;
          bounceDirection = -1;
          shouldBounce = true;
        }

        if (shouldBounce) {
          velocityRef.current.x = bounceDirection * Math.abs(velocityRef.current.x) * BOUNCE_FRICTION;
        }

        velocityRef.current.x *= INERTIA_FRICTION;
        return newRot;
      });

      setRotationX((prev) => {
        let newRot = prev + velocityRef.current.y;
        if (newRot < -30) newRot = -30;
        if (newRot > 30) newRot = 30;
        velocityRef.current.y *= INERTIA_FRICTION;
        return newRot;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [maxAngle]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      stopAnimation();
      setIsDragging(true);
      startPosRef.current = { x: e.clientX, y: e.clientY };
      startRotationRef.current = { y: rotationY, x: rotationX };
      velocityRef.current = { x: 0, y: 0 };
      lastTimeRef.current = performance.now();
    },
    [rotationY, rotationX, stopAnimation]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;

      const currentTime = performance.now();
      const deltaTime = Math.max(currentTime - lastTimeRef.current, 1);

      const deltaX = (e.clientX - startPosRef.current.x) * 0.4;
      const deltaY = (e.clientY - startPosRef.current.y) * 0.2;

      const oldRotY = rotationY;
      const oldRotX = rotationX;

      const newRotY = startRotationRef.current.y + deltaX;
      const newRotX = Math.max(-30, Math.min(30, startRotationRef.current.x + deltaY));

      setRotationY(newRotY);
      setRotationX(newRotX);

      velocityRef.current = {
        x: ((newRotY - oldRotY) / deltaTime) * 16,
        y: ((newRotX - oldRotX) / deltaTime) * 16,
      };

      lastTimeRef.current = currentTime;
    },
    [isDragging, rotationY, rotationX]
  );

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    animateInertia();
  }, [isDragging, animateInertia]);

  const handleMouseLeave = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      animateInertia();
    }
  }, [isDragging, animateInertia]);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      stopAnimation();
      const touch = e.touches[0];
      setIsDragging(true);
      startPosRef.current = { x: touch.clientX, y: touch.clientY };
      startRotationRef.current = { y: rotationY, x: rotationX };
      velocityRef.current = { x: 0, y: 0 };
      lastTimeRef.current = performance.now();
    },
    [rotationY, rotationX, stopAnimation]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging) return;

      const currentTime = performance.now();
      const deltaTime = Math.max(currentTime - lastTimeRef.current, 1);
      const touch = e.touches[0];

      const deltaX = (touch.clientX - startPosRef.current.x) * 0.4;
      const deltaY = (touch.clientY - startPosRef.current.y) * 0.2;

      const oldRotY = rotationY;
      const oldRotX = rotationX;

      const newRotY = startRotationRef.current.y + deltaX;
      const newRotX = Math.max(-30, Math.min(30, startRotationRef.current.x + deltaY));

      setRotationY(newRotY);
      setRotationX(newRotX);

      velocityRef.current = {
        x: ((newRotY - oldRotY) / deltaTime) * 16,
        y: ((newRotX - oldRotX) / deltaTime) * 16,
      };

      lastTimeRef.current = currentTime;
    },
    [isDragging, rotationY, rotationX]
  );

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    animateInertia();
  }, [isDragging, animateInertia]);

  const handleFaceClick = useCallback(
    (index: number) => {
      if (Math.abs(velocityRef.current.x) > 1 || Math.abs(velocityRef.current.y) > 1) {
        return;
      }

      const faceAngle = index * 90;
      let targetAngle = faceAngle;

      if (targetAngle < rotationY - ROTATION_THRESHOLD) {
        targetAngle = faceAngle + Math.ceil((rotationY - faceAngle) / 90) * 90 - 90;
      } else if (targetAngle > rotationY + ROTATION_THRESHOLD) {
        targetAngle = faceAngle + Math.floor((rotationY - faceAngle) / 90) * 90;
      }

      if (targetAngle < minAngle) targetAngle = faceAngle;
      if (targetAngle > maxAngle) targetAngle = maxAngle;

      if (Math.abs(targetAngle - rotationY) > ROTATION_THRESHOLD) {
        velocityRef.current = { x: (targetAngle - rotationY) * 0.1, y: 0 };
        animateInertia();
        return;
      }

      const course = paddedCourses[index];

      setIsExploding(true);
      setFaceStates([
        { offsetX: 0, offsetY: -400, scale: 0.5, opacity: 0 },
        { offsetX: 400, offsetY: 0, scale: 0.5, opacity: 0 },
        { offsetX: 0, offsetY: 400, scale: 0.5, opacity: 0 },
        { offsetX: -400, offsetY: 0, scale: 0.5, opacity: 0 },
        { offsetX: 200, offsetY: 300, scale: 0.5, opacity: 0 },
        { offsetX: -200, offsetY: -300, scale: 0.5, opacity: 0 },
      ]);

      setTimeout(() => {
        onCourseClick(course);
      }, 600);
    },
    [rotationY, paddedCourses, minAngle, maxAngle, animateInertia, onCourseClick]
  );

  useEffect(() => {
    setRotationY(0);
    setRotationX(-10);
    setIsExploding(false);
    setFaceStates(initialFaceStates);
    velocityRef.current = { x: 0, y: 0 };
    stopAnimation();
  }, [courses, stopAnimation]);

  const faceTransforms = [
    `translateZ(${FACE_DEPTH}px)`,
    `rotateY(90deg) translateZ(${FACE_DEPTH}px)`,
    `rotateY(180deg) translateZ(${FACE_DEPTH}px)`,
    `rotateY(-90deg) translateZ(${FACE_DEPTH}px)`,
    `rotateX(90deg) translateZ(${FACE_DEPTH}px)`,
    `rotateX(-90deg) translateZ(${FACE_DEPTH}px)`,
  ];

  return (
    <div
      ref={containerRef}
      className="cube-container"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        width: FACE_SIZE,
        height: FACE_SIZE,
        perspective: 1000,
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        touchAction: 'none',
      }}
    >
      <div
        className="cube"
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          transformStyle: 'preserve-3d',
          transform: `rotateX(${rotationX}deg) rotateY(${-rotationY}deg)`,
          transition: isDragging ? 'none' : 'transform 0.1s ease-out',
        }}
      >
        {faceTransforms.map((faceTransform, index) => {
          const course = paddedCourses[index];
          const isHovered = hoveredFace === index;
          const faceState = faceStates[index];
          const hoverTranslate = isHovered && !isExploding ? 30 : 0;

          return (
            <div
              key={index}
              className="cube-face"
              onMouseEnter={() => !isDragging && setHoveredFace(index)}
              onMouseLeave={() => setHoveredFace(null)}
              onClick={() => handleFaceClick(index)}
              style={{
                position: 'absolute',
                width: FACE_SIZE,
                height: FACE_SIZE,
                backfaceVisibility: 'hidden',
                borderRadius: 16,
                overflow: 'hidden',
                background: 'linear-gradient(145deg, #2a2a4a, #1a1a3a)',
                border: '2px solid rgba(255, 255, 255, 0.1)',
                boxShadow: isHovered
                  ? '0 20px 60px rgba(100, 150, 255, 0.4), 0 0 30px rgba(100, 150, 255, 0.2)'
                  : '0 10px 40px rgba(0, 0, 0, 0.3)',
                transform: `${faceTransform} translateZ(${hoverTranslate}px) translate(${faceState.offsetX}px, ${faceState.offsetY}px) scale(${faceState.scale})`,
                opacity: faceState.opacity,
                transition: isExploding
                  ? 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s ease-out'
                  : 'transform 0.3s ease-out, box-shadow 0.3s ease-out, opacity 0.6s ease-out',
                cursor: 'pointer',
              }}
            >
              <img
                src={course.cover}
                alt={course.title}
                style={{
                  width: '100%',
                  height: '65%',
                  objectFit: 'cover',
                }}
              />
              <div
                style={{
                  padding: 16,
                  height: '35%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  background: 'rgba(0, 0, 0, 0.6)',
                  backdropFilter: 'blur(5px)',
                }}
              >
                <h3
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    marginBottom: 6,
                    color: '#fff',
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                  }}
                >
                  {course.title}
                </h3>
                <div
                  style={{
                    display: 'flex',
                    gap: 8,
                    flexWrap: 'wrap',
                  }}
                >
                  {course.categories.slice(0, 2).map((cat) => (
                    <span
                      key={cat.id}
                      style={{
                        fontSize: 12,
                        padding: '3px 10px',
                        borderRadius: 12,
                        background: 'rgba(100, 150, 255, 0.3)',
                        color: '#a8c0ff',
                      }}
                    >
                      {cat.name}
                    </span>
                  ))}
                </div>
              </div>
              {isHovered && !isExploding && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background:
                      'linear-gradient(135deg, rgba(100, 150, 255, 0.1), rgba(150, 100, 255, 0.1))',
                    pointerEvents: 'none',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
