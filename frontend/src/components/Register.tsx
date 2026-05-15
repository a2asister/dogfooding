import React, { useState } from 'react';

interface RegisterProps {
  onRegister: (token: string, user: any) => void;
  onSwitchToLogin: () => void;
}

export function Register({ onRegister, onSwitchToLogin }: RegisterProps) {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('两次密码输入不一致');
      return;
    }

    if (!email && !phone && !username) {
      setError('至少填写邮箱、手机号或用户名中的一项');
      return;
    }

    setLoading(true);

    try {
      const payload: any = { password };
      if (email) payload.email = email;
      if (phone) payload.phone = phone;
      if (username) payload.username = username;

      const response = await fetch('http://localhost:3950/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      onRegister(data.token, data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>注册 Web CLI</h2>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="输入邮箱"
            />
          </div>
          <div className="form-group">
            <label>或手机号</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="输入手机号"
            />
          </div>
          <div className="form-group">
            <label>或用户名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="输入用户名"
            />
          </div>
          <div className="form-group">
            <label>密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="输入密码"
              required
            />
          </div>
          <div className="form-group">
            <label>确认密码</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="再次输入密码"
              required
            />
          </div>
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? '注册中...' : '注册'}
          </button>
        </form>
        <p className="auth-switch">
          已有账号?{' '}
          <button onClick={onSwitchToLogin} className="link-button">
            立即登录
          </button>
        </p>
      </div>
    </div>
  );
}
