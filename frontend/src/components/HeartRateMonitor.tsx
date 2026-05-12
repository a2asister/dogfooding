import { useState, useEffect } from 'react';
import { io, type Socket } from 'socket.io-client';

export default function HeartRateMonitor() {
  const [heartRate, setHeartRate] = useState(72);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket: Socket = io('http://localhost:3000', {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('WebSocket connected');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('WebSocket disconnected');
    });

    socket.on('connect_error', (error) => {
      console.log('Connection error:', error.message);
    });

    socket.on('heart-rate-update', (data: { rate: number }) => {
      if (data.rate) {
        setHeartRate(data.rate);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="monitor-container">
      <style jsx>{`
        .monitor-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
          position: relative;
          min-height: 100vh;
          overflow: hidden;
        }

        .ripple-bg {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
        }

        .ripple {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255, 60, 60, 0.15) 0%, transparent 70%);
          animation: ripple-expand 2s ease-out infinite;
        }

        .ripple:nth-child(1) {
          width: 200px;
          height: 200px;
          animation-delay: 0s;
        }

        .ripple:nth-child(2) {
          width: 300px;
          height: 300px;
          animation-delay: 0.5s;
        }

        .ripple:nth-child(3) {
          width: 400px;
          height: 400px;
          animation-delay: 1s;
        }

        .ripple:nth-child(4) {
          width: 500px;
          height: 500px;
          animation-delay: 1.5s;
        }

        @keyframes ripple-expand {
          0% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(2);
            opacity: 0;
          }
        }

        .content {
          position: relative;
          z-index: 1;
        }

        .header {
          text-align: center;
          margin-bottom: 40px;
        }

        .header h1 {
          font-size: 2.5rem;
          background: linear-gradient(90deg, #ff3c3c, #ff6b6b);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .status {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-top: 10px;
          padding: 8px 20px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 20px;
          font-size: 0.9rem;
        }

        .status-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: ${isConnected ? '#4ade80' : '#f87171'};
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .main-display {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          align-items: center;
        }

        .heart-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 30px;
        }

        .heart-container {
          position: relative;
          width: 200px;
          height: 180px;
        }

        .heart {
          position: absolute;
          width: 100%;
          height: 100%;
          transform: scale(1);
          animation: heartbeat ${60 / heartRate}s cubic-bezier(0.2, 0.8, 0.2, 1) infinite;
        }

        .heart svg {
          width: 100%;
          height: 100%;
          filter: drop-shadow(0 0 30px rgba(255, 60, 60, 0.6));
        }

        @keyframes heartbeat {
          0%, 100% {
            transform: scale(1);
          }
          10% {
            transform: scale(1.1);
          }
          20% {
            transform: scale(1);
          }
          30% {
            transform: scale(1.08);
          }
          40% {
            transform: scale(1);
          }
        }

        .glow-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 250px;
          height: 250px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255, 60, 60, 0.2) 0%, transparent 70%);
          animation: glow-pulse ${60 / heartRate}s ease-in-out infinite;
        }

        @keyframes glow-pulse {
          0%, 100% {
            opacity: 0.5;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.1);
          }
        }

        .rate-display {
          text-align: center;
        }

        .rate-label {
          font-size: 1rem;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 10px;
        }

        .flip-clock {
          display: flex;
          justify-content: center;
          gap: 4px;
        }

        .flip-digit {
          position: relative;
          width: 50px;
          height: 70px;
          background: linear-gradient(180deg, #1f2937 0%, #111827 100%);
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        }

        .digit-inner {
          position: absolute;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          font-weight: bold;
          color: #ff3c3c;
          font-family: 'Courier New', monospace;
          animation: flip-in 0.6s ease-out;
        }

        @keyframes flip-in {
          0% {
            transform: rotateX(90deg);
            opacity: 0;
          }
          100% {
            transform: rotateX(0deg);
            opacity: 1;
          }
        }

        .unit {
          display: flex;
          align-items: flex-end;
          padding-bottom: 10px;
          margin-left: 10px;
          font-size: 1.2rem;
          color: #9ca3af;
        }

        .ecg-section {
          background: rgba(0, 0, 0, 0.4);
          border-radius: 16px;
          padding: 30px;
          border: 1px solid rgba(255, 60, 60, 0.2);
        }

        .ecg-title {
          font-size: 1.1rem;
          color: #9ca3af;
          margin-bottom: 20px;
          letter-spacing: 1px;
        }

        .ecg-canvas {
          width: 100%;
          height: 200px;
          background: linear-gradient(180deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.8) 100%);
          border-radius: 8px;
          position: relative;
          overflow: hidden;
        }

        .grid-lines {
          position: absolute;
          width: 100%;
          height: 100%;
          background-image: 
            linear-gradient(rgba(255, 60, 60, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 60, 60, 0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }

        .ecg-path {
          position: absolute;
          width: 200%;
          height: 100%;
          animation: ecg-scroll 2s linear infinite;
        }

        @keyframes ecg-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .ecg-path svg {
          width: 100%;
          height: 100%;
        }

        .ecg-path path {
          fill: none;
          stroke: #ff3c3c;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
          filter: drop-shadow(0 0 8px rgba(255, 60, 60, 0.8));
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-top: 30px;
        }

        .stat-card {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: transform 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-5px);
          border-color: rgba(255, 60, 60, 0.3);
        }

        .stat-value {
          font-size: 2rem;
          font-weight: bold;
          color: #ff3c3c;
          margin-bottom: 5px;
        }

        .stat-label {
          font-size: 0.85rem;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        @media (max-width: 768px) {
          .main-display {
            grid-template-columns: 1fr;
          }
          
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="ripple-bg">
        <div className="ripple"></div>
        <div className="ripple"></div>
        <div className="ripple"></div>
        <div className="ripple"></div>
      </div>

      <div className="content">
        <div className="header">
          <h1>心率实时监测</h1>
          <div className="status">
            <span className="status-dot"></span>
            <span>{isConnected ? '传感器已连接' : '等待连接...'}</span>
          </div>
        </div>

        <div className="main-display">
          <div className="heart-section">
            <div className="heart-container">
              <div className="glow-ring"></div>
              <div className="heart">
                <svg viewBox="0 0 100 90" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M50 85C50 85 10 55 10 30C10 15 22 5 35 5C42 5 48 10 50 15C52 10 58 5 65 5C78 5 90 15 90 30C90 55 50 85 50 85Z"
                    fill="url(#heartGradient)"
                  />
                  <defs>
                    <linearGradient id="heartGradient" x1="50" y1="5" x2="50" y2="85" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#ff3c3c" />
                      <stop offset="1" stopColor="#cc2f2f" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            <div className="rate-display">
              <div className="rate-label">当前心率</div>
              <div className="flip-clock">
                {String(heartRate).padStart(3, '0').split('').map((digit, i) => (
                  <div key={i} className="flip-digit">
                    <div className="digit-inner" key={digit}>{digit}</div>
                  </div>
                ))}
                <div className="unit">BPM</div>
              </div>
            </div>
          </div>

          <div className="ecg-section">
            <div className="ecg-title">心电图 ECG</div>
            <div className="ecg-canvas">
              <div className="grid-lines"></div>
              <div className="ecg-path">
                <svg viewBox="0 0 1000 200" preserveAspectRatio="none">
                  <path
                    d="M0,100 L20,100 L25,95 L30,105 L35,100 L40,100 L60,100 L65,80 L70,120 L75,70 L80,130 L85,100 L100,100 L120,100 L125,95 L130,105 L135,100 L140,100 L160,100 L165,80 L170,120 L175,70 L180,130 L185,100 L200,100 L220,100 L225,95 L230,105 L235,100 L240,100 L260,100 L265,80 L270,120 L275,70 L280,130 L285,100 L300,100 L320,100 L325,95 L330,105 L335,100 L340,100 L360,100 L365,80 L370,120 L375,70 L380,130 L385,100 L400,100 L420,100 L425,95 L430,105 L435,100 L440,100 L460,100 L465,80 L470,120 L475,70 L480,130 L485,100 L500,100 L520,100 L525,95 L530,105 L535,100 L540,100 L560,100 L565,80 L570,120 L575,70 L580,130 L585,100 L600,100 L620,100 L625,95 L630,105 L635,100 L640,100 L660,100 L665,80 L670,120 L675,70 L680,130 L685,100 L700,100 L720,100 L725,95 L730,105 L735,100 L740,100 L760,100 L765,80 L770,120 L775,70 L780,130 L785,100 L800,100 L820,100 L825,95 L830,105 L835,100 L840,100 L860,100 L865,80 L870,120 L875,70 L880,130 L885,100 L900,100 L920,100 L925,95 L930,105 L935,100 L940,100 L960,100 L965,80 L970,120 L975,70 L980,130 L985,100 L1000,100"
                  />
                </svg>
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{60 + Math.floor(Math.random() * 10)}</div>
                <div className="stat-label">最低心率</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{80 + Math.floor(Math.random() * 10)}</div>
                <div className="stat-label">最高心率</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">Normal</div>
                <div className="stat-label">心律状态</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
