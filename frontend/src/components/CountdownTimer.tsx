import React, { useState, useEffect, useRef } from 'react';
import FlipNumber from './FlipNumber';
import ProgressRing from './ProgressRing';

interface CountdownTimerProps {
  targetTime: Date;
  endTime: Date;
  title: string;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetTime, endTime, title }) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isUrgent, setIsUrgent] = useState(false);
  const [isCritical, setIsCritical] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [bgColor, setBgColor] = useState('linear-gradient(135deg, #667eea 0%, #764ba2 100%)');
  const lastSecondsRef = useRef<number>(-1);

  useEffect(() => {
    lastSecondsRef.current = -1;
    
    const calculateTime = () => {
      const now = Date.now();
      const target = new Date(targetTime).getTime();
      const end = new Date(endTime).getTime();
      const difference = target - now;

      if (difference <= 0) {
        const meetingProgress = Math.min(100, ((now - target) / (end - target)) * 100);
        setProgress(meetingProgress);
        
        if (now >= end) {
          setIsCompleted(true);
          setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        } else {
          setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        }
        return;
      }

      const totalSeconds = Math.ceil(difference / 1000);
      
      if (totalSeconds === lastSecondsRef.current) {
        return;
      }
      lastSecondsRef.current = totalSeconds;
      
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setTimeLeft({ hours, minutes, seconds });

      const totalDuration = end - target;
      const elapsed = totalDuration - difference;
      const progressPercent = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
      setProgress(progressPercent);

      setIsUrgent(totalSeconds <= 60);
      setIsCritical(totalSeconds <= 10);

      const urgencyRatio = Math.min(1, totalSeconds / 3600);
      const r = Math.floor(102 + (255 - 102) * (1 - urgencyRatio));
      const g = Math.floor(126 - 126 * (1 - urgencyRatio));
      const b = Math.floor(234 - 234 * (1 - urgencyRatio));
      setBgColor(`linear-gradient(135deg, rgb(${r}, ${g}, ${b}) 0%, rgb(${Math.floor(r * 0.8)}, ${Math.floor(g * 0.6)}, ${Math.floor(b * 0.5)}) 100%)`);
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);

    return () => clearInterval(timer);
  }, [targetTime, endTime]);

  const playCompletionSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  useEffect(() => {
    if (isCompleted) {
      playCompletionSound();
    }
  }, [isCompleted]);

  return (
    <div
      className="countdown-container"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: bgColor,
        transition: 'background 1s ease',
        position: 'relative',
      }}
    >
      {isCritical && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            animation: 'urgentPulse 0.5s infinite',
            pointerEvents: 'none',
          }}
        />
      )}

      <h1
        style={{
          color: 'white',
          fontSize: '2.5rem',
          marginBottom: '2rem',
          textShadow: '0 4px 12px rgba(0,0,0,0.3)',
        }}
      >
        {title}
      </h1>

      {isCompleted ? (
        <div className="fade-in" style={{ textAlign: 'center' }}>
          <svg width="200" height="200" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#2ecc71" strokeWidth="4" />
            <path
              className="checkmark"
              d="M30 50 L45 65 L70 35"
              fill="none"
              stroke="#2ecc71"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <h2 style={{ color: 'white', marginTop: '1rem', fontSize: '2rem' }}>会议圆满结束！</h2>
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
          <ProgressRing progress={progress} />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <FlipNumber value={timeLeft.hours} isUrgent={isUrgent} />
            <span className="separator">:</span>
            <FlipNumber value={timeLeft.minutes} isUrgent={isUrgent} />
            <span className="separator">:</span>
            <FlipNumber value={timeLeft.seconds} isUrgent={isUrgent} />
          </div>
        </div>
      )}

      <div
        style={{
          marginTop: '3rem',
          color: 'white',
          fontSize: '1.2rem',
          opacity: 0.9,
        }}
      >
        {isCompleted
          ? '感谢您的参与'
          : progress > 0 && progress < 100
          ? `会议进行中... ${Math.round(progress)}%`
          : '距离会议开始'}
      </div>
    </div>
  );
};

export default CountdownTimer;
