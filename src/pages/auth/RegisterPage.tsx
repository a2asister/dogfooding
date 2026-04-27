import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertModal } from '@/components/common/Modal';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'success' | 'warning' | 'error',
  });

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const showMessage = (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error') => {
    setModalConfig({ title, message, type });
    setShowModal(true);
  };

  const handleSendCode = () => {
    if (!phone) {
      showMessage('注册失败', '请输入手机号', 'error');
      return;
    }
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      showMessage('注册失败', '请输入正确的手机号', 'error');
      return;
    }
    setCountdown(60);
    showMessage('验证码已发送', '验证码已发送到您的手机，请在5分钟内输入。', 'success');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreed) {
      showMessage('注册失败', '请先阅读并同意用户协议和隐私政策', 'error');
      return;
    }

    if (!phone) {
      showMessage('注册失败', '请输入手机号', 'error');
      return;
    }

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      showMessage('注册失败', '请输入正确的手机号', 'error');
      return;
    }

    if (!code) {
      showMessage('注册失败', '请输入验证码', 'error');
      return;
    }

    if (code.length !== 6) {
      showMessage('注册失败', '验证码格式不正确', 'error');
      return;
    }

    if (!password) {
      showMessage('注册失败', '请输入密码', 'error');
      return;
    }

    if (password.length < 6) {
      showMessage('注册失败', '密码长度不能少于6位', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showMessage('注册失败', '两次输入的密码不一致', 'error');
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);

    showMessage('注册成功', '您的账号已注册成功，请登录。', 'success');
    
    setTimeout(() => {
      navigate('/login');
    }, 1500);
  };

  return (
    <div className="card p-8">
      <div className="text-center mb-8">
        <Link to="/login" className="inline-flex items-center gap-1 text-primary-600 hover:underline mb-4">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回登录
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">注册账号</h1>
        <p className="text-gray-500">创建您的职聘网账号</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">手机号</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
            placeholder="请输入手机号"
            className="input-field"
            maxLength={11}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">验证码</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="请输入验证码"
              className="input-field flex-1"
              maxLength={6}
            />
            <button
              type="button"
              onClick={handleSendCode}
              disabled={countdown > 0}
              className={`px-4 py-3 rounded-lg font-medium whitespace-nowrap transition-colors ${
                countdown > 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
              }`}
            >
              {countdown > 0 ? `${countdown}s后重发` : '获取验证码'}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">设置密码</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="请设置密码（至少6位）"
            className="input-field"
          />
          <p className="text-xs text-gray-500 mt-1">密码长度至少6位，建议包含字母和数字</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">确认密码</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="请再次输入密码"
            className="input-field"
          />
        </div>

        <div className="flex items-start">
          <input
            type="checkbox"
            id="register-agreement"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500 mt-0.5"
          />
          <label htmlFor="register-agreement" className="ml-2 text-sm text-gray-600">
            我已阅读并同意
            <a href="#" className="text-primary-600 hover:underline">《用户协议》</a>
            和
            <a href="#" className="text-primary-600 hover:underline">《隐私政策》</a>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              注册中...
            </span>
          ) : (
            '注册'
          )}
        </button>
      </form>

      <div className="text-center mt-6">
        <p className="text-gray-500 text-sm">
          已有账号？
          <Link to="/login" className="text-primary-600 hover:underline font-medium">
            立即登录
          </Link>
        </p>
      </div>

      <AlertModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
      />
    </div>
  );
};

export default RegisterPage;
