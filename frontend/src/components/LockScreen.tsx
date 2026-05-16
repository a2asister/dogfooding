import React, { useState, useEffect } from 'react';

interface LockScreenProps {
  onUnlock: () => void;
}

const LockScreen: React.FC<LockScreenProps> = ({ onUnlock }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '1234' || password === '') {
      setError('');
      onUnlock();
    } else {
      setError('密码错误，请重试');
      setPassword('');
    }
  };

  return (
    <div
      className="lock-screen"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
          opacity: 0.05,
        }}
      />

      <div
        style={{
          textAlign: 'center',
          color: '#fff',
          marginBottom: '60px',
          textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
        }}
      >
        <div
          style={{
            fontSize: '96px',
            fontWeight: 300,
            letterSpacing: '4px',
            marginBottom: '8px',
          }}
        >
          {currentTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })}
        </div>
        <div style={{ fontSize: '20px', opacity: 0.9 }}>
          {currentTime.toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          padding: '40px',
          width: '320px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: '36px',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
            }}
          >
            👤
          </div>
          <h2 style={{ margin: 0, fontSize: '20px', color: '#333', fontWeight: 500 }}>
            欢迎回来
          </h2>
          <p style={{ margin: '8px 0 0', fontSize: '14px', color: '#666' }}>
            输入密码以解锁电脑
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px', position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="输入密码 (默认: 1234)"
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '2px solid',
                borderColor: error ? '#e74c3c' : '#e0e0e0',
                borderRadius: '10px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = error ? '#e74c3c' : '#e0e0e0';
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '18px',
                padding: '4px',
              }}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
            {error && (
              <p style={{ color: '#e74c3c', fontSize: '12px', margin: '8px 0 0', textAlign: 'center' }}>
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '14px',
              border: 'none',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
              fontSize: '16px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.transform = 'translateY(-2px)';
              (e.target as HTMLElement).style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.transform = 'translateY(0)';
              (e.target as HTMLElement).style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
            }}
          >
            🔓 解锁
          </button>
        </form>

        <div
          style={{
            marginTop: '24px',
            textAlign: 'center',
            fontSize: '12px',
            color: '#999',
          }}
        >
          提示：按 Enter 键快速解锁
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: '40px',
          display: 'flex',
          gap: '32px',
          color: '#fff',
          fontSize: '24px',
          opacity: 0.8,
        }}
      >
        <span style={{ cursor: 'pointer' }} title="网络">🌐</span>
        <span style={{ cursor: 'pointer' }} title="电池">🔋</span>
        <span style={{ cursor: 'pointer' }} title="设置">⚙️</span>
      </div>
    </div>
  );
};

export default LockScreen;
