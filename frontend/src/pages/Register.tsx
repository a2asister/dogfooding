import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { Gift, User, Lock, Phone, Mail, ArrowLeft } from 'lucide-react'
import { useForm } from 'react-hook-form'

interface RegisterFormData {
  username: string
  password: string
  confirmPassword: string
  phone?: string
  email?: string
}

const Register = () => {
  const navigate = useNavigate()
  const { register: registerUser, isLoading } = useAuthStore()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
      phone: '',
      email: '',
    },
  })

  const password = watch('password')

  const onSubmit = async (data: RegisterFormData) => {
    setError('')
    setSuccess('')
    try {
      await registerUser({
        username: data.username,
        password: data.password,
        phone: data.phone || undefined,
        email: data.email || undefined,
      })
      setSuccess('注册成功！正在跳转...')
      setTimeout(() => {
        navigate('/')
      }, 1000)
    } catch (err: any) {
      setError(err.response?.data?.error?.message || '注册失败，请稍后重试')
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
            创建新账户
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            加入游戏礼包中心，领取海量游戏礼包
          </p>
        </div>

        <div className="card p-6">
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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="username" className="label">
                用户名 <span className="text-danger-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('username', {
                    required: '请输入用户名',
                    minLength: {
                      value: 3,
                      message: '用户名至少3个字符',
                    },
                    maxLength: {
                      value: 20,
                      message: '用户名最多20个字符',
                    },
                    pattern: {
                      value: /^[a-zA-Z0-9_]+$/,
                      message: '用户名只能包含字母、数字和下划线',
                    },
                  })}
                  type="text"
                  id="username"
                  className="input pl-10"
                  placeholder="请输入用户名（3-20个字符）"
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-sm text-danger-600">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="label">
                密码 <span className="text-danger-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('password', {
                    required: '请输入密码',
                    minLength: {
                      value: 6,
                      message: '密码至少6个字符',
                    },
                  })}
                  type="password"
                  id="password"
                  className="input pl-10"
                  placeholder="请输入密码（至少6个字符）"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-danger-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="label">
                确认密码 <span className="text-danger-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('confirmPassword', {
                    required: '请确认密码',
                    validate: (value) =>
                      value === password || '两次输入的密码不一致',
                  })}
                  type="password"
                  id="confirmPassword"
                  className="input pl-10"
                  placeholder="请再次输入密码"
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-danger-600">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="label">
                手机号
                <span className="text-gray-400 ml-1">（选填，用于手机号登录）</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('phone', {
                    pattern: {
                      value: /^1[3-9]\d{9}$/,
                      message: '请输入正确的手机号',
                    },
                  })}
                  type="tel"
                  id="phone"
                  className="input pl-10"
                  placeholder="请输入手机号"
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-danger-600">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="label">
                邮箱
                <span className="text-gray-400 ml-1">（选填）</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('email', {
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: '请输入正确的邮箱格式',
                    },
                  })}
                  type="email"
                  id="email"
                  className="input pl-10"
                  placeholder="请输入邮箱"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-danger-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="flex items-start">
              <input
                id="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-0.5"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                我已阅读并同意
                <Link to="/terms" className="text-primary-600 hover:text-primary-700 mx-1">
                  服务条款
                </Link>
                和
                <Link to="/privacy" className="text-primary-600 hover:text-primary-700 ml-1">
                  隐私政策
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary flex items-center justify-center"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              ) : null}
              注册
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              已有账号？
              <Link to="/login" className="ml-1 text-primary-600 hover:text-primary-700 font-medium">
                <ArrowLeft className="inline w-4 h-4 mr-1" />
                立即登录
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
