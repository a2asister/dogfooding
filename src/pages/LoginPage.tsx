import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { useAppStore } from '../store';
import { getUsers, getUserByUsername, addLoginRecord } from '../data/services';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const setCurrentUser = useAppStore(state => state.setCurrentUser);
  const setIsAuthenticated = useAppStore(state => state.setIsAuthenticated);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 模拟登录验证
      // 在实际项目中，这里应该有密码哈希验证
      const user = await getUserByUsername(username);

      if (!user || !user.isActive) {
        setError('用户名或密码错误');
        setLoading(false);
        return;
      }

      // 模拟密码验证（实际项目中应该使用 bcrypt 等加密库）
      // 这里我们简单验证用户名存在，实际项目中需要验证密码哈希
      
      // 更新登录时间
      // await updateLastLogin(user.id);

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
        loginTime: Date.now(),
      });

      // 更新全局状态
      setCurrentUser(user);
      setIsAuthenticated(true);

      // 跳转到后台
      navigate('/admin');
    } catch (err) {
      setError('登录失败，请稍后重试');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  // 快速登录（演示用）
  const handleQuickLogin = async (role: 'admin' | 'designer') => {
    setLoading(true);
    setError('');

    try {
      const users = await getUsers(role);
      if (users.length > 0) {
        const user = users[0];
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
          loginTime: Date.now(),
        });
        setCurrentUser(user);
        setIsAuthenticated(true);
        navigate('/admin');
      } else {
        setError('找不到该角色的用户');
      }
    } catch {
      setError('快速登录失败');
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900">欢迎回来</h1>
          <p className="text-gray-500 mt-1">登录您的设计师管理后台</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Quick Login (Demo Only) */}
          <div className="mb-6 p-4 bg-purple-50 rounded-xl">
            <p className="text-sm text-purple-600 font-medium mb-3">快速登录（演示用）</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleQuickLogin('admin')}
                disabled={loading}
                className="flex items-center justify-center space-x-1 px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                <span>管理员</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleQuickLogin('designer')}
                disabled={loading}
                className="flex items-center justify-center space-x-1 px-3 py-2 bg-pink-600 text-white rounded-lg text-sm font-medium hover:bg-pink-700 transition-colors disabled:opacity-50"
              >
                <span>设计师</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                用户名
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                placeholder="请输入用户名"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                密码
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all pr-12"
                  placeholder="请输入密码"
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

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="ml-2 text-sm text-gray-600">记住我</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-purple-600 hover:text-purple-700">
                忘记密码？
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  <span>登录中...</span>
                </>
              ) : (
                '登录'
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              还没有账号？{' '}
              <Link to="/register" className="text-purple-600 hover:text-purple-700 font-medium">
                立即注册
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

export default LoginPage;
