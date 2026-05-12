import { createSignal, createEffect, onCleanup } from 'solid-js';
import ProgressRing from './components/ProgressRing';
import NestedProgressRings from './components/NestedProgressRings';
import './index.css';

const OVERALL_PROGRESS_QUERY = `
  query GetOverallProgress {
    overallProgress {
      totalCourses
      completedCourses
      totalLessons
      completedLessons
      progress
      subjects {
        subject
        totalCourses
        completedCourses
        totalLessons
        completedLessons
        progress
      }
    }
  }
`;

const FIREWORK_COLORS = [
  '#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3', '#f38181',
  '#aa96da', '#fcbad3', '#a8d8ea', '#ffecd2', '#fcb69f'
];

async function fetchGraphQL(query, variables = {}) {
  const response = await fetch('/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });
  
  if (!response.ok) {
    throw new Error(`GraphQL请求失败: ${response.status}`);
  }
  
  const data = await response.json();
  
  if (data.errors) {
    throw new Error(data.errors[0].message);
  }
  
  return data.data;
}

function createFireworks(container) {
  const fireworkCount = 5;
  const particlesPerFirework = 30;
  
  for (let i = 0; i < fireworkCount; i++) {
    setTimeout(() => {
      const centerX = 20 + Math.random() * 60;
      const centerY = 20 + Math.random() * 60;
      
      for (let j = 0; j < particlesPerFirework; j++) {
        const particle = document.createElement('div');
        particle.className = 'firework';
        particle.style.left = `${centerX}%`;
        particle.style.top = `${centerY}%`;
        particle.style.backgroundColor = FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)];
        
        const angle = (j / particlesPerFirework) * Math.PI * 2;
        const velocity = 80 + Math.random() * 120;
        const x = Math.cos(angle) * velocity;
        const y = Math.sin(angle) * velocity;
        
        particle.style.setProperty('--x', `${x}px`);
        particle.style.setProperty('--y', `${y}px`);
        particle.style.animationDelay = `${j * 5}ms`;
        
        container.appendChild(particle);
        
        setTimeout(() => {
          particle.remove();
        }, 1600);
      }
    }, i * 400);
  }
}

function App() {
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal(null);
  const [data, setData] = createSignal(null);
  const [progress, setProgress] = createSignal(0);
  const [subjects, setSubjects] = createSignal([]);
  const [showCelebration, setShowCelebration] = createSignal(false);
  const [lastMilestone, setLastMilestone] = createSignal(-1);

  let fireworksContainerRef;
  let pollInterval;

  const fetchData = async () => {
    try {
      const result = await fetchGraphQL(OVERALL_PROGRESS_QUERY);
      setData(result);
      setError(null);
      
      const newProgress = result.overallProgress.progress;
      const newSubjects = result.overallProgress.subjects || [];
      
      const milestones = [25, 50, 75, 100];
      for (const m of milestones) {
        if (newProgress >= m && lastMilestone() < m) {
          setShowCelebration(true);
          setLastMilestone(m);
          
          setTimeout(() => {
            if (fireworksContainerRef) {
              createFireworks(fireworksContainerRef);
            }
          }, 100);
          
          setTimeout(() => setShowCelebration(false), 3500);
          break;
        }
      }
      
      setProgress(newProgress);
      setSubjects(newSubjects);
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  };

  createEffect(() => {
    fetchData();
    pollInterval = setInterval(fetchData, 5000);
    return () => clearInterval(pollInterval);
  });

  if (loading() && !data()) {
    return (
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>
    );
  }

  if (error()) {
    return (
      <div class="error-container">
        <h2>错误</h2>
        <p>{error().message}</p>
        <button onClick={fetchData}>重试</button>
      </div>
    );
  }

  const currentData = data();
  const overallData = currentData?.overallProgress || {
    totalCourses: 0,
    completedCourses: 0,
    totalLessons: 0,
    completedLessons: 0,
  };

  return (
    <div class="app">
      <h1 class="title">学习进度追踪</h1>
      
      <div class="overview-stats">
        <div class="stat-card">
          <span class="stat-label">总课程</span>
          <span class="stat-value">{overallData.totalCourses}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">已完成</span>
          <span class="stat-value">{overallData.completedCourses}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">总课时</span>
          <span class="stat-value">{overallData.totalLessons}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">已学课时</span>
          <span class="stat-value">{overallData.completedLessons}</span>
        </div>
      </div>

      <div class="progress-section">
        <h2 class="section-title">总体进度</h2>
        <div class="ring-container">
          <ProgressRing
            progress={progress()}
            size={220}
            strokeWidth={14}
            color="#6366f1"
            showLabel
            animated
            onMilestone={() => {}}
          />
        </div>
      </div>

      {subjects().length > 0 && (
        <div class="progress-section">
          <h2 class="section-title">科目进度</h2>
          <NestedProgressRings
            overallProgress={progress()}
            subjects={subjects()}
          />
        </div>
      )}

      {showCelebration() && (
        <div class="celebration-overlay">
          <div 
            class="fireworks-container" 
            ref={el => fireworksContainerRef = el}
          ></div>
        </div>
      )}
    </div>
  );
}

export default App;
