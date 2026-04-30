import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useState } from 'react'
import { Gift, ChevronRight, Clock, Users, CheckCircle, AlertCircle, Copy, Gamepad2, LogIn, ArrowLeft } from 'lucide-react'
import axios from 'axios'
import { useAuthStore } from '../stores/authStore'

interface GiftDetail {
  id: number
  name: string
  description: string
  icon: string | null
  totalCount: number
  claimedCount: number
  startTime: string | null
  endTime: string | null
  isActive: boolean
  isVisible: boolean
  userClaimed: boolean
  game: {
    id: number
    name: string
    description: string
    icon: string | null
  }
  type: {
    id: number
    name: string
  }
  category: {
    name: string
  }
}

const GiftDetail = () => {
  const { giftId } = useParams<{ giftId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { isAuthenticated } = useAuthStore()
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [claimedCode, setClaimedCode] = useState('')
  const [claimError, setClaimError] = useState('')

  const { data, isLoading, isError, error } = useQuery(
    ['gift', giftId],
    async () => {
      const response = await axios.get(`/api/gifts/${giftId}`)
      return response.data.data as GiftDetail
    },
    {
      enabled: !!giftId,
    }
  )

  const claimMutation = useMutation(
    async () => {
      const response = await axios.post(`/api/gifts/${giftId}/claim`)
      return response.data
    },
    {
      onSuccess: (data) => {
        setClaimedCode(data.data.code)
        setShowSuccessModal(true)
        queryClient.invalidateQueries(['gift', giftId])
      },
      onError: (err: any) => {
        setClaimError(err.response?.data?.error?.message || '领取失败，请稍后重试')
      },
    }
  )

  const handleClaim = () => {
    setClaimError('')
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/gifts/${giftId}` } })
      return
    }
    claimMutation.mutate()
  }

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(claimedCode)
      alert('礼包码已复制到剪贴板！')
    } catch {
      alert('复制失败，请手动复制')
    }
  }

  const remainingCount = data ? data.totalCount - data.claimedCount : 0
  const isExpired = data && data.endTime ? new Date(data.endTime) < new Date() : false
  const isNotStarted = data && data.startTime ? new Date(data.startTime) > new Date() : false
  const isOutOfStock = remainingCount <= 0

  const canClaim =
    data &&
    data.isActive &&
    data.isVisible &&
    !isExpired &&
    !isNotStarted &&
    !isOutOfStock &&
    !data.userClaimed

  return (
    <div className="container-page">
      <div className="mb-6">
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <Link to="/" className="hover:text-primary-600">
            首页
          </Link>
          <ChevronRight className="w-4 h-4 mx-1" />
          <Link to="/games" className="hover:text-primary-600">
            游戏中心
          </Link>
          <ChevronRight className="w-4 h-4 mx-1" />
          {data && (
            <Link to={`/games/${data.game.id}`} className="hover:text-primary-600">
              {data.game.name}
            </Link>
          )}
          <ChevronRight className="w-4 h-4 mx-1" />
          <span className="text-gray-900">礼包详情</span>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          返回上一页
        </button>
      </div>

      {isLoading ? (
        <div className="card p-8">
          <div className="animate-pulse">
            <div className="flex flex-col md:flex-row">
              <div className="w-32 h-32 bg-gray-200 rounded-lg mx-auto md:mx-0 mb-4 md:mb-0 md:mr-8"></div>
              <div className="flex-1">
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="h-4 bg-gray-100 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-100 rounded w-3/4 mb-4"></div>
                <div className="h-12 bg-gray-100 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        </div>
      ) : isError ? (
        <div className="card p-12 text-center">
          <AlertCircle className="w-16 h-16 text-danger-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            加载失败
          </h3>
          <p className="text-gray-600 mb-4">
            {error instanceof Error ? error.message : '礼包不存在或已下架'}
          </p>
          <Link to="/games" className="btn-primary inline-flex items-center">
            浏览游戏
          </Link>
        </div>
      ) : data ? (
        <div>
          <div className="card p-6 mb-6">
            <div className="flex flex-col md:flex-row">
              <div className="w-32 h-32 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center mx-auto md:mx-0 mb-4 md:mb-0 md:mr-8 flex-shrink-0">
                {data.icon ? (
                  <img
                    src={data.icon}
                    alt={data.name}
                    className="w-24 h-24 object-contain"
                  />
                ) : (
                  <Gift className="w-16 h-16 text-primary-500" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="badge badge-primary">
                        {data.type.name}
                      </span>
                      <span className="badge bg-gray-100 text-gray-600">
                        {data.category.name}
                      </span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {data.name}
                    </h1>
                  </div>

                  <div className="mt-4 md:mt-0 flex items-center">
                    {data.userClaimed && (
                      <span className="badge badge-success text-sm flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        已领取
                      </span>
                    )}
                    {isOutOfStock && !data.userClaimed && (
                      <span className="badge badge-warning text-sm flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        已领完
                      </span>
                    )}
                    {isExpired && (
                      <span className="badge badge-danger text-sm flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        已过期
                      </span>
                    )}
                    {isNotStarted && (
                      <span className="badge bg-warning-50 text-warning-600 text-sm flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        未开始
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-gray-600 mb-6">{data.description}</p>

                <div className="flex flex-wrap gap-6 mb-6 text-sm">
                  <div className="flex items-center">
                    <Gamepad2 className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="text-gray-600">所属游戏：</span>
                    <Link
                      to={`/games/${data.game.id}`}
                      className="text-primary-600 hover:text-primary-700 font-medium ml-1"
                    >
                      {data.game.name}
                    </Link>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="text-gray-600">已领取：</span>
                    <span className="font-medium text-gray-900 ml-1">
                      {data.claimedCount}
                    </span>
                    <span className="text-gray-400">/{data.totalCount}</span>
                  </div>
                  <div className="flex items-center">
                    <Gift className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="text-gray-600">剩余：</span>
                    <span
                      className={`font-medium ml-1 ${
                        remainingCount > 0 ? 'text-success-600' : 'text-danger-600'
                      }`}
                    >
                      {remainingCount}
                    </span>
                  </div>
                </div>

                {(data.startTime || data.endTime) && (
                  <div className="flex flex-wrap gap-4 mb-6 text-sm">
                    {data.startTime && (
                      <div className="flex items-center">
                        <Clock className="w-5 h-5 text-gray-400 mr-2" />
                        <span className="text-gray-600">开始时间：</span>
                        <span className="text-gray-900 ml-1">
                          {new Date(data.startTime).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {data.endTime && (
                      <div className="flex items-center">
                        <Clock className="w-5 h-5 text-gray-400 mr-2" />
                        <span className="text-gray-600">结束时间：</span>
                        <span className="text-gray-900 ml-1">
                          {new Date(data.endTime).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {claimError && (
                  <div className="mb-4 p-3 bg-danger-50 text-danger-600 rounded-lg text-sm">
                    {claimError}
                  </div>
                )}

                <div className="flex items-center gap-4">
                  {canClaim ? (
                    <button
                      onClick={handleClaim}
                      disabled={claimMutation.isLoading}
                      className="btn-primary px-8 py-3 text-lg font-medium flex items-center"
                    >
                      {claimMutation.isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          领取中...
                        </>
                      ) : (
                        <>
                          <Gift className="w-5 h-5 mr-2" />
                          立即领取
                        </>
                      )}
                    </button>
                  ) : data.userClaimed ? (
                    <button
                      disabled
                      className="btn-secondary px-8 py-3 text-lg font-medium flex items-center cursor-not-allowed opacity-75"
                    >
                      <CheckCircle className="w-5 h-5 mr-2 text-success-600" />
                      已领取
                    </button>
                  ) : isOutOfStock ? (
                    <button
                      disabled
                      className="btn-secondary px-8 py-3 text-lg font-medium flex items-center cursor-not-allowed opacity-75"
                    >
                      <AlertCircle className="w-5 h-5 mr-2 text-warning-600" />
                      已领完
                    </button>
                  ) : isExpired ? (
                    <button
                      disabled
                      className="btn-secondary px-8 py-3 text-lg font-medium flex items-center cursor-not-allowed opacity-75"
                    >
                      <AlertCircle className="w-5 h-5 mr-2 text-danger-600" />
                      已过期
                    </button>
                  ) : isNotStarted ? (
                    <button
                      disabled
                      className="btn-secondary px-8 py-3 text-lg font-medium flex items-center cursor-not-allowed opacity-75"
                    >
                      <Clock className="w-5 h-5 mr-2 text-warning-600" />
                      未开始
                    </button>
                  ) : !data.isActive ? (
                    <button
                      disabled
                      className="btn-secondary px-8 py-3 text-lg font-medium flex items-center cursor-not-allowed opacity-75"
                    >
                      <AlertCircle className="w-5 h-5 mr-2 text-gray-500" />
                      已下架
                    </button>
                  ) : null}

                  {!isAuthenticated && canClaim && (
                    <Link
                      to="/login"
                      state={{ from: `/gifts/${giftId}` }}
                      className="btn-outline px-6 py-3 text-lg font-medium flex items-center"
                    >
                      <LogIn className="w-5 h-5 mr-2" />
                      登录后领取
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  <Gift className="inline w-5 h-5 mr-2 text-primary-500" />
                  礼包详情
                </h2>
                <div className="prose max-w-none text-gray-600">
                  <p>{data.description}</p>
                </div>
              </div>
            </div>

            <div className="md:col-span-1">
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  <Gamepad2 className="inline w-5 h-5 mr-2 text-primary-500" />
                  所属游戏
                </h2>
                <Link
                  to={`/games/${data.game.id}`}
                  className="block card-hover"
                >
                  <div className="flex items-center mb-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center mr-4">
                      {data.game.icon ? (
                        <img
                          src={data.game.icon}
                          alt={data.game.name}
                          className="w-12 h-12 object-contain"
                        />
                      ) : (
                        <Gamepad2 className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                        {data.game.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {data.category.name}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {data.game.description}
                  </p>
                </Link>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Link
                    to={`/games/${data.game.id}`}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center justify-center"
                  >
                    查看该游戏所有礼包
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card p-12 text-center">
          <AlertCircle className="w-16 h-16 text-warning-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            数据加载中
          </h3>
          <p className="text-gray-600">
            请稍候...
          </p>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="card p-8 max-w-md w-full text-center">
            <div className="w-20 h-20 bg-success-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-success-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              领取成功！
            </h2>
            <p className="text-gray-600 mb-6">
              您的礼包码如下，请妥善保管
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500 mb-2">礼包码</p>
              <code className="text-2xl font-mono font-bold text-primary-600 block">
                {claimedCode}
              </code>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleCopyCode}
                className="btn-outline flex-1 flex items-center justify-center"
              >
                <Copy className="w-4 h-4 mr-2" />
                复制礼包码
              </button>
              <Link
                to="/my-gifts"
                className="btn-primary flex-1 flex items-center justify-center"
              >
                查看我的礼包
              </Link>
            </div>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="mt-4 text-sm text-gray-500 hover:text-gray-700"
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default GiftDetail
