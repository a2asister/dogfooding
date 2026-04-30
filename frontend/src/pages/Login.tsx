import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { Gift, LogIn, User, Lock, Phone, ArrowRight } from 'lucide-react'
import { useForm } from 'react-hook-form'

interface LoginFormData {
  username: string
  password: string
}

interface PhoneLoginFormData {
  phone: string
  code: string
}

const Login = () => {
  const navigate = useNavigate()
  const { login, loginWithPhone, isLoading } = useAuthStore()
  const [loginType, setLoginType] = useState<'password' | 'phone'>('password')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [sendingCode, setSendingCode] = useState(false)
  const [codeSent, setCodeSent] = useState(false)

  const passwordForm = useForm<LoginFormData>({
    defaultValues: {
      username: '',
      password: '',
    },
  })

  const phoneForm = useForm<PhoneLoginFormData>({
    defaultValues: {
      phone: '',
      code: '',
    },
  })

  const handlePasswordLogin = async (data: LoginFormData) => {
    setError('')
    setSuccess('')
    try {
      await login(data)
      setSuccess('登录成功！正在跳转...')
      setTimeout(() => {
        navigate('/')
      }, 1000)
    } catch (err: any) {
      setError(err.response?.data?.error?.message || '登录失败，请检查用户名和密码')
    }
  }

  const handleSendCode = async () => {
    const phone = phoneForm.getValues('phone')
    if (!phone || phone.length !== 11) {
      setError('请输入正确的手机号')
      return
    }
    setError('')
    setSendingCode(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setCodeSent(true)
      setSuccess('验证码已发送（测试用例：123456）')
    } catch {
      setError('发送验证码失败')
    } finally {
      setSendingCode(false)
    }
  }

  const handlePhoneLogin = async (data: PhoneLoginFormData) => {
    setError('')
    setSuccess('')
    try {
      await loginWithPhone(data.phone, data.code)
      setSuccess('登录成功！正在跳转...')
      setTimeout(() => {
        navigate('/')
      }, 1000)
    } catch (err: any) {
      setError(err.response?.data?.error?.message || '登录失败')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center">
            <Gift className="w-10 h-10 text-primary-500" />
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            登录游戏礼包中心
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            欢迎回来！请登录您的账户
          </p>
        </div>

        <div className="card p-6">
          <div className="flex mb-6">
            <button
              onClick={() => {
                setLoginType('password')
                setError('')
                setSuccess('')
              }}
              className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
                loginType === 'password'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center">
                <Lock className="w-4 h-4 mr-1.5" />
                密码登录
              </div>
            </button>
            <button
              onClick={() => {
                setLoginType('phone')
                setError('')
                setSuccess('')
              }}
              className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
                loginType === 'phone'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center">
                <Phone className="w-4 h-4 mr-1.5" />
                手机号登录
              </div>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-danger-50 text-danger-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-success-50 text-success-600 rounded-lg text-sm">
              {success}
            </div>
          )}

          {loginType === 'password' ? (
            <form onSubmit={passwordForm.handleSubmit(handlePasswordLogin)} className="space-y-4">
              <div>
                <label htmlFor="username" className="label">
                  用户名
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    {...passwordForm.register('username', { required: '请输入用户名' })}
                    type="text"
                    id="username"
                    className="input pl-10"
                    placeholder="请输入用户名"
                  />
                </div>
                {passwordForm.formState.errors.username && (
                  <p className="mt-1 text-sm text-danger-600">
                    {passwordForm.formState.errors.username.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="label">
                  密码
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    {...passwordForm.register('password', { required: '请输入密码' })}
                    type="password"
                    id="password"
                    className="input pl-10"
                    placeholder="请输入密码"
                  />
                </div>
                {passwordForm.formState.errors.password && (
                  <p className="mt-1 text-sm text-danger-600">
                    {passwordForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                    记住我
                  </label>
                </div>
                <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700">
                  忘记密码？
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                ) : (
                  <LogIn className="w-5 h-5 mr-2" />
                )}
                登录
              </button>
            </form>
          ) : (
            <form onSubmit={phoneForm.handleSubmit(handlePhoneLogin)} className="space-y-4">
              <div>
                <label htmlFor="phone" className="label">
                  手机号
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    {...phoneForm.register('phone', { 
                      required: '请输入手机号',
                      pattern: {
                        value: /^1[3-9]\d{9}$/,
                        message: '请输入正确的手机号'
                      }
                    })}
                    type="tel"
                    id="phone"
                    className="input pl-10"
                    placeholder="请输入手机号"
                  />
                </div>
                {phoneForm.formState.errors.phone && (
                  <p className="mt-1 text-sm text-danger-600">
                    {phoneForm.formState.errors.phone.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="code" className="label">
                  验证码
                </label>
                <div className="flex space-x-3">
                  <div className="relative flex-1">
                    <input
                      {...phoneForm.register('code', { required: '请输入验证码' })}
                      type="text"
                      id="code"
                      className="input"
                      placeholder="请输入验证码"
                      maxLength={6}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={sendingCode || codeSent}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      codeSent
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                    }`}
                  >
                    {sendingCode ? '发送中...' : codeSent ? '已发送' : '获取验证码'}
                  </button>
                </div>
                {phoneForm.formState.errors.code && (
                  <p className="mt-1 text-sm text-danger-600">
                    {phoneForm.formState.errors.code.message}
                  </p>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  测试验证码：123456
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                ) : (
                  <LogIn className="w-5 h-5 mr-2" />
                )}
                登录
              </button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              还没有账号？
              <Link to="/register" className="ml-1 text-primary-600 hover:text-primary-700 font-medium">
                立即注册 <ArrowRight className="inline w-4 h-4" />
              </Link>
            </p>
          </div>

          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-2">测试账号：</p>
            <p className="text-xs text-gray-600">
              <span className="font-medium">管理员：</span> admin / admin123456
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
