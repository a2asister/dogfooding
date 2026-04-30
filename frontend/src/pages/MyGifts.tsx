import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { Package, Gamepad2, ChevronRight, Gift, Clock, CheckCircle, XCircle } from 'lucide-react'
import axios from 'axios'

interface ClaimItem {
  id: number
  code: string
  claimedAt: string
  isActivated: boolean
  activatedAt: string | null
  gift: {
    id: number
    name: string
    icon: string | null
  }
  game: {
    name: string
    icon: string | null
  }
  type: {
    name: string
  }
}

const MyGifts = () => {
  const { data, isLoading, isError, error } = useQuery(
    'myGifts',
    async () => {
      const response = await axios.get('/api/gifts/my/list?pageSize=50')
      return response.data
    }
  )

  const claims: ClaimItem[] = data?.data?.items || []
  const pagination = data?.data?.pagination

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      alert('礼包码已复制到剪贴板！')
    } catch {
      alert('复制失败，请手动复制')
    }
  }

  return (
    <div className="container-page">
      <div className="mb-6">
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <Link to="/" className="hover:text-primary-600">
            首页
          </Link>
          <ChevronRight className="w-4 h-4 mx-1" />
          <span className="text-gray-900">我的礼包</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          <Package className="inline w-7 h-7 mr-2 text-primary-500" />
          我的礼包
        </h1>
        <p className="mt-1 text-gray-600">
          查看和管理您已领取的礼包
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="flex items-start">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg mr-4"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded mb-2 w-1/3"></div>
                    <div className="h-4 bg-gray-100 rounded mb-2 w-1/4"></div>
                    <div className="h-10 bg-gray-100 rounded mt-3"></div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      ) : isError ? (
        <div className="card p-12 text-center">
          <XCircle className="w-16 h-16 text-danger-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            加载失败
          </h3>
          <p className="text-gray-600 mb-4">
            {error instanceof Error ? error.message : '请稍后重试'}
          </p>
          <Link to="/" className="btn-primary inline-flex items-center">
            返回首页
          </Link>
        </div>
      ) : claims.length === 0 ? (
        <div className="card p-12 text-center">
          <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            暂无领取记录
          </h3>
          <p className="text-gray-600 mb-6">
            您还没有领取过任何礼包，快去浏览游戏并领取礼包吧！
          </p>
          <Link to="/games" className="btn-primary inline-flex items-center">
            <Gamepad2 className="w-5 h-5 mr-2" />
            浏览游戏
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {claims.map((claim) => (
            <div key={claim.id} className="card p-6">
              <div className="flex flex-col sm:flex-row sm:items-start">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center flex-shrink-0 mb-4 sm:mb-0 sm:mr-6">
                  {claim.gift.icon ? (
                    <img
                      src={claim.gift.icon}
                      alt={claim.gift.name}
                      className="w-12 h-12 object-contain"
                    />
                  ) : (
                    <Gift className="w-8 h-8 text-primary-500" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {claim.gift.name}
                    </h3>
                    <span
                      className={`badge inline-flex items-center mt-2 sm:mt-0 ${
                        claim.isActivated
                          ? 'badge-success'
                          : 'badge-primary'
                      }`}
                    >
                      {claim.isActivated ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          已激活
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 mr-1" />
                          待激活
                        </>
                      )}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600 mb-4">
                    <span className="flex items-center">
                      <Gamepad2 className="w-4 h-4 mr-1" />
                      {claim.game.name}
                    </span>
                    <span>{claim.type.name}</span>
                    <span className="text-gray-500">
                      领取时间：{new Date(claim.claimedAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          礼包码
                        </p>
                        <code className="text-lg font-mono font-semibold text-primary-600 bg-white px-3 py-1 rounded border border-primary-200">
                          {claim.code}
                        </code>
                      </div>

                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleCopyCode(claim.code)}
                          className="btn-outline text-sm"
                        >
                          复制礼包码
                        </button>

                        {!claim.isActivated && (
                          <button
                            onClick={() =>
                              alert(
                                `请在游戏内激活礼包码：${claim.code}`
                              )
                            }
                            className="btn-primary text-sm"
                          >
                            立即激活
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center">
          <div className="text-sm text-gray-600">
            共 {pagination.total} 条记录，第 {pagination.page} /{' '}
            {pagination.totalPages} 页
          </div>
        </div>
      )}
    </div>
  )
}

export default MyGifts
