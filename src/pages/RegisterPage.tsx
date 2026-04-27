import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, ArrowRight, CheckCircle } from 'lucide-react';
import { useAppStore } from '../store';
import { getUserByUsername, getUserByEmail, addUser, addLoginRecord } from '../data/services';
import type { User } from '../types';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const setCurrentUser = useAppStore(state => state.setCurrentUser);
  const setIsAuthenticated = useAppStore(state => state.setIsAuthenticated);

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError('请输入用户名');
      return false;
    }
    if (formData.username.length < 3) {
      setError('用户名至少需要3个字符');
      return false;
    }
    if (!formData.email.trim()) {
      setError('请输入邮箱');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('请输入有效的邮箱地址');
      return false;
    }
    if (!formData.password) {
      setError('请输入密码');
      return false;
    }
    if (formData.password.length < 6) {
      setError('密码至少需要6个字符');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致');
      return false;
    }
    if (!agreeTerms) {
      setError('请同意服务条款和隐私政策');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // 检查用户名是否已存在
      const existingUserByUsername = await getUserByUsername(formData.username);
      if (existingUserByUsername) {
        setError('用户名已存在，请选择其他用户名');
        setLoading(false);
        return;
      }

      // 检查邮箱是否已存在
      const existingUserByEmail = await getUserByEmail(formData.email);
      if (existingUserByEmail) {
        setError('邮箱已被注册，请使用其他邮箱');
        setLoading(false);
        return;
      }

      // 创建新用户
      const newUser = {
        username: formData.username,
        email: formData.email,
        passwordHash: btoa(formData.password),
        role: 'designer' as User['role'],
        permissions: [
          'portfolio:read',
          'portfolio:write',
          'case_study:read',
          'case_study:write',
          'order:read',
          'order:write',
          'chat:read',
          'chat:write',
          'review:read',
          'review:write',
          'material:read',
          'material:write',
          'analytics:read'
        ],
        isActive: true
      };

      const userId = await addUser(newUser);

      // 创建用户对象
      const user: User = {
        ...newUser,
        id: userId,
        lastLoginAt: null,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      // 记录登录
      await addLoginRecord({
        userId: user.id,
        username: user.username,
        deviceId: 'device-123',
        deviceName: navigator.userAgent,
        deviceType: 'web',
        ipAddress: '127.0.0.1',
        location: '未知',
        userAgent: navigator.userAgent,
        isSuccessful: true,
        failureReason: null,
        loginTime: Date.now()
      });

      // 更新全局状态
      setCurrentUser(user);
      setIsAuthenticated(true);

      setSuccess(true);

      // 显示成功消息后跳转到后台
      setTimeout(() => {
        navigate('/admin');
      }, 2000);

    } catch (err) {
      setError('注册失败，请稍后重试');
      console.error('Register error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({ ...formData, [field]: e.target.value });
    if (error) {
      setError('');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">注册成功！</h2>
            <p className="text-gray-500 mb-6">欢迎加入，您的账号已创建成功</p>
            <p className="text-sm text-gray-400">正在跳转到管理后台...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">D</span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">创建账号</h1>
          <p className="text-gray-500 mt-1">加入我们，开始您的设计之旅</p>
        </div>

        {/* Register Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                用户名 <span className="text-red-500">*</span>
              </label>
              <input
                id="username"
                type="text"
                value={formData.username}
                onChange={handleInputChange('username')}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                placeholder="请输入用户名（至少3个字符）"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                邮箱地址 <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                placeholder="请输入邮箱地址"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                密码 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all pr-12"
                  placeholder="请输入密码（至少6个字符）"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                确认密码 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange('confirmPassword')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all pr-12"
                  placeholder="请再次输入密码"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Terms Agreement */}
            <label className="flex items-start space-x-2">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-4 h-4 mt-0.5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-sm text-gray-600">
                我已阅读并同意
                <Link to="/terms" className="text-purple-600 hover:text-purple-700 mx-1">服务条款</Link>
                和
                <Link to="/privacy" className="text-purple-600 hover:text-purple-700 mx-1">隐私政策</Link>
              </span>
            </label>

            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="space-y-1">
                <p className="text-xs text-gray-500">密码强度：</p>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4].map((level) => {
                    let strength = 0;
                    if (formData.password.length >= 6) strength++;
                    if (formData.password.length >= 8) strength++;
                    if (/[A-Z]/.test(formData.password) || /[a-z]/.test(formData.password)) strength++;
                    if (/\d/.test(formData.password)) strength++;

                    const isActive = level <= strength;
                    const getColor = () => {
                      if (strength <= 2) return isActive ? 'bg-red-400' : 'bg-gray-200';
                      if (strength === 3) return isActive ? 'bg-yellow-400' : 'bg-gray-200';
                      return isActive ? 'bg-green-400' : 'bg-gray-200';
                    };

                    return (
                      <div
                        key={level}
                        className={`h-1.5 flex-1 rounded-full ${getColor()}`}
                      />
                    );
                  })}
                </div>
                <p className="text-xs text-gray-400">
                  {formData.password.length < 6 && '建议至少6个字符'}
                  {formData.password.length >= 6 && formData.password.length < 8 && '建议包含大小写字母和数字'}
                  {formData.password.length >= 8 && /\d/.test(formData.password) && '密码强度良好'}
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  <span>注册中...</span>
                </>
              ) : (
                '创建账号'
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              已有账号？{' '}
              <Link to="/login" className="text-purple-600 hover:text-purple-700 font-medium">
                立即登录
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link to="/" className="inline-flex items-center space-x-1 text-gray-500 hover:text-gray-700 text-sm">
            <ArrowRight className="w-4 h-4 rotate-180" />
            <span>返回首页</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
