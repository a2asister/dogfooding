import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { AlertModal } from '@/components/common/Modal';

type LoginMode = 'phone' | 'password';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuthStore();
  const [mode, setMode] = useState<LoginMode>('phone');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [countdown, setCountdown] = useState(0);
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

  const showError = (message: string) => {
    setModalConfig({
      title: '登录失败',
      message,
      type: 'error',
    });
    setShowModal(true);
  };

  const handleSendCode = () => {
    if (!phone) {
      showError('请输入手机号');
      return;
    }
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      showError('请输入正确的手机号');
      return;
    }
    setCountdown(60);
    setModalConfig({
      title: '验证码已发送',
      message: '验证码已发送到您的手机，请在5分钟内输入。',
      type: 'success',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreed) {
      showError('请先阅读并同意用户协议和隐私政策');
      return;
    }

    if (!phone) {
      showError('请输入手机号');
      return;
    }

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      showError('请输入正确的手机号');
      return;
    }

    if (mode === 'phone') {
      if (!code) {
        showError('请输入验证码');
        return;
      }
      if (code.length !== 6) {
        showError('验证码格式不正确');
        return;
      }
    } else {
      if (!password) {
        showError('请输入密码');
        return;
      }
      if (password.length < 6) {
        showError('密码长度不能少于6位');
        return;
      }
    }

    try {
      const success = await login(phone, mode === 'password' ? password : undefined, mode === 'phone' ? code : undefined);
      if (success) {
        navigate('/home');
      }
    } catch {
      showError('登录失败，请稍后重试');
    }
  };

  const handleThirdPartyLogin = (provider: string) => {
    if (!agreed) {
      showError('请先阅读并同意用户协议和隐私政策');
      return;
    }
    setModalConfig({
      title: '快捷登录',
      message: `正在使用${provider}登录...`,
      type: 'info',
    });
    setShowModal(true);
    
    setTimeout(async () => {
      const success = await login('13800138000');
      if (success) {
        navigate('/home');
      }
    }, 1500);
  };

  return (
    <div className="card p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">欢迎登录职聘网</h1>
        <p className="text-gray-500">找到心仪的工作，开启职业新篇章</p>
      </div>

      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setMode('phone')}
          className={`flex-1 py-3 text-center font-medium transition-colors ${
            mode === 'phone'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          验证码登录
        </button>
        <button
          onClick={() => setMode('password')}
          className={`flex-1 py-3 text-center font-medium transition-colors ${
            mode === 'password'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          密码登录
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">手机号</label>
          <div className="relative">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
              placeholder="请输入手机号"
              className="input-field"
              maxLength={11}
            />
          </div>
        </div>

        {mode === 'phone' ? (
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
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              className="input-field"
            />
          </div>
        )}

        <div className="flex items-center">
          <input
            type="checkbox"
            id="agreement"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
          />
          <label htmlFor="agreement" className="ml-2 text-sm text-gray-600">
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
              登录中...
            </span>
          ) : (
            '登录'
          )}
        </button>
      </form>

      <div className="flex justify-between items-center mt-4">
        {mode === 'password' && (
          <Link to="/forgot-password" className="text-sm text-primary-600 hover:underline">
            忘记密码？
          </Link>
        )}
        {mode === 'phone' && <div />}
        <Link to="/register" className="text-sm text-primary-600 hover:underline">
          没有账号？立即注册
        </Link>
      </div>

      <div className="mt-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">其他登录方式</span>
          </div>
        </div>

        <div className="flex justify-center gap-8 mt-6">
          <button
            onClick={() => handleThirdPartyLogin('微信')}
            className="flex flex-col items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 01.598.082l1.584.926a.272.272 0 00.14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 01-.023-.156.49.49 0 01.201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.02-.407-.032zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.969-.982z" />
              </svg>
            </div>
            <span className="text-xs text-gray-500">微信</span>
          </button>

          <button
            onClick={() => handleThirdPartyLogin('QQ')}
            className="flex flex-col items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-12 h-12 rounded-full bg-sky-500 flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.003 2.001c-4.615 0-8.35 2.732-8.35 6.89 0 2.313 1.167 4.045 2.825 5.142.026.017.048.035.074.05-.012.055-.022.11-.022.167 0 .257.11.487.276.651-.08.075-.155.157-.221.246-.274.364-.457.773-.553 1.218-.077.357-.113.73-.113 1.112 0 .39.041.776.123 1.151.088.4.22.787.391 1.154.184.404.428.78.723 1.116.317.358.69.663 1.107.906.43.255.904.441 1.404.553.363.081.737.122 1.114.122.37 0 .737-.039 1.093-.114.494-.104.962-.283 1.384-.527.402-.232.761-.523 1.066-.867.317-.365.56-.77.722-1.2.173-.453.277-.936.308-1.432.024-.39.007-.783-.05-1.169-.064-.414-.19-.813-.372-1.187-.075-.156-.16-.304-.254-.445.15-.143.247-.348.247-.574 0-.042-.004-.084-.012-.125 1.435-.986 2.45-2.542 2.45-4.373 0-4.158-3.735-6.89-8.35-6.89z" />
              </svg>
            </div>
            <span className="text-xs text-gray-500">QQ</span>
          </button>

          <button
            onClick={() => handleThirdPartyLogin('微博')}
            className="flex flex-col items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10.098 20.323c-3.977.391-7.414-1.406-7.672-4.02-.259-2.609 2.759-5.047 6.74-5.441 3.979-.394 7.413 1.404 7.671 4.018.259 2.6-2.759 5.049-6.739 5.443zM9.05 17.219c-.384.616-1.208.884-1.829.602-.612-.279-.793-.991-.406-1.593.379-.595 1.176-.861 1.793-.601.622.263.82.972.442 1.592zm1.27-1.627c-.141.237-.449.353-.689.253-.236-.09-.313-.361-.177-.586.138-.227.436-.346.672-.24.239.09.315.36.194.573zm.176-2.719c-1.893-.493-4.033.45-4.857 2.118-.836 1.704-.026 3.591 1.886 4.21 1.983.642 4.318-.341 5.132-2.179.8-1.793-.201-3.642-2.161-4.149zm7.563-1.224c-.346-.105-.579-.18-.405-.649.376-1.017.415-1.897.007-2.529-.773-1.203-2.892-1.121-5.374-.035 0 0-.768.334-.572-.271.379-1.185.32-2.184-.259-2.75-.623-.61-2.228-.467-4.167.348C4.345 7.38 2 9.503 2 12.026c0 3.205 3.604 5.415 7.12 5.415 5.041 0 8.393-3.159 8.393-5.644 0-1.52-1.292-2.383-2.452-2.748z" />
              </svg>
            </div>
            <span className="text-xs text-gray-500">微博</span>
          </button>
        </div>
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

export default LoginPage;
