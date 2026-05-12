import React, { useState } from 'react';
import CountdownTimer from './components/CountdownTimer';
import MeetingManager from './components/MeetingManager';

interface Meeting {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  isCompleted: boolean;
}

const App: React.FC = () => {
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);

  if (selectedMeeting) {
    return (
      <div>
        <button
          onClick={() => setSelectedMeeting(null)}
          style={{
            position: 'fixed',
            top: '1rem',
            left: '1rem',
            zIndex: 100,
            padding: '0.75rem 1.5rem',
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
            backdropFilter: 'blur(10px)',
          }}
        >
          ← 返回列表
        </button>
        <CountdownTimer
          targetTime={new Date(selectedMeeting.startTime)}
          endTime={new Date(selectedMeeting.endTime)}
          title={selectedMeeting.title}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <MeetingManager onSelectMeeting={setSelectedMeeting} />
    </div>
  );
};

export default App;
