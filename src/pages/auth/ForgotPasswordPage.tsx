import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertModal } from '@/components/common/Modal';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
      showMessage('提示', '请输入手机号', 'warning');
      return;
    }
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      showMessage('提示', '请输入正确的手机号', 'warning');
      return;
    }
    setCountdown(60);
    showMessage('验证码已发送', '验证码已发送到您的手机，请在5分钟内输入。', 'success');
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone) {
      showMessage('提示', '请输入手机号', 'warning');
      return;
    }

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      showMessage('提示', '请输入正确的手机号', 'warning');
      return;
    }

    if (!code) {
      showMessage('提示', '请输入验证码', 'warning');
      return;
    }

    if (code.length !== 6) {
      showMessage('提示', '验证码格式不正确', 'warning');
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);

    setStep(2);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password) {
      showMessage('提示', '请输入新密码', 'warning');
      return;
    }

    if (password.length < 6) {
      showMessage('提示', '密码长度不能少于6位', 'warning');
      return;
    }

    if (password !== confirmPassword) {
      showMessage('提示', '两次输入的密码不一致', 'warning');
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);

    showMessage('密码重置成功', '您的密码已重置成功，请使用新密码登录。', 'success');
    
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">忘记密码</h1>
        <p className="text-gray-500">重置您的登录密码</p>
      </div>

      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
          }`}>
            1
          </div>
          <span className={`ml-2 text-sm ${step >= 1 ? 'text-primary-600' : 'text-gray-500'}`}>
            验证身份
          </span>
        </div>
        <div className={`w-16 h-0.5 mx-4 ${step >= 2 ? 'bg-primary-600' : 'bg-gray-200'}`} />
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
          }`}>
            2
          </div>
          <span className={`ml-2 text-sm ${step >= 2 ? 'text-primary-600' : 'text-gray-500'}`}>
            重置密码
          </span>
        </div>
      </div>

      {step === 1 ? (
        <form onSubmit={handleVerifyCode} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">手机号</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
              placeholder="请输入注册时的手机号"
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
                验证中...
              </span>
            ) : (
              '下一步'
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">新密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请设置新密码（至少6位）"
              className="input-field"
            />
            <p className="text-xs text-gray-500 mt-1">密码长度至少6位，建议包含字母和数字</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">确认新密码</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="请再次输入新密码"
              className="input-field"
            />
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
                重置中...
              </span>
            ) : (
              '确认重置'
            )}
          </button>
        </form>
      )}

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

export default ForgotPasswordPage;
