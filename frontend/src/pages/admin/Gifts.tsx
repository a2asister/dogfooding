import { useState } from 'react'
import { useQuery } from 'react-query'
import { Plus, Search, Edit, Trash2, Upload, Eye, EyeOff, Package } from 'lucide-react'
import axios from 'axios'

const AdminGifts = () => {
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedGame, setSelectedGame] = useState<number | null>(null)
  const [selectedType, setSelectedType] = useState<number | null>(null)
  const [isActive, setIsActive] = useState<boolean | null>(null)

  const { data: giftsData, isLoading } = useQuery(
    ['adminGifts', selectedGame, selectedType, isActive],
    async () => {
      const params: Record<string, any> = {
        pageSize: 50,
      }
      if (selectedGame) params.gameId = selectedGame
      if (selectedType) params.typeId = selectedType
      if (isActive !== null) params.isActive = isActive
      const response = await axios.get('/api/admin/gifts', { params })
      return response.data.data
    }
  )

  const gifts = giftsData?.items || []

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            <Package className="inline w-7 h-7 mr-2 text-primary-500" />
            礼包管理
          </h1>
          <p className="mt-1 text-gray-600">
            创建和管理游戏礼包
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button className="btn-outline flex items-center">
            <Upload className="w-4 h-4 mr-2" />
            批量导入礼包码
          </button>
          <button className="btn-primary flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            新建礼包
          </button>
        </div>
      </div>

      <div className="card p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="搜索礼包名称..."
              className="input pl-10"
            />
          </div>
          <select
            value={selectedGame || ''}
            onChange={(e) => setSelectedGame(e.target.value ? Number(e.target.value) : null)}
            className="input lg:w-40"
          >
            <option value="">全部游戏</option>
          </select>
          <select
            value={selectedType || ''}
            onChange={(e) => setSelectedType(e.target.value ? Number(e.target.value) : null)}
            className="input lg:w-40"
          >
            <option value="">全部类型</option>
          </select>
          <select
            value={isActive === null ? '' : isActive ? 'active' : 'inactive'}
            onChange={(e) => {
              const val = e.target.value
              setIsActive(val === '' ? null : val === 'active')
            }}
            className="input lg:w-40"
          >
            <option value="">全部状态</option>
            <option value="active">上架中</option>
            <option value="inactive">已下架</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="card p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      ) : gifts.length === 0 ? (
        <div className="card p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            暂无礼包
          </h3>
          <p className="text-gray-600 mb-4">
            点击上方按钮创建第一个礼包
          </p>
          <button className="btn-primary inline-flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            新建礼包
          </button>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    礼包信息
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    游戏
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    领取统计
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    时间
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {gifts.map((gift: any) => (
                  <tr key={gift.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center mr-4">
                          <Package className="w-6 h-6 text-primary-500" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {gift.name}
                          </div>
                          <div className="text-sm text-gray-500 line-clamp-1">
                            {gift.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {gift.game_name || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        已领取: <span className="font-medium text-primary-600">{gift.claimed_count || 0}</span>
                        <span className="text-gray-400">/{gift.total_count || 0}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div
                          className="bg-primary-500 h-1.5 rounded-full"
                          style={{
                            width: `${Math.min(100, gift.total_count ? (gift.claimed_count / gift.total_count) * 100 : 0)}%`,
                          }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>开始: {gift.start_time ? formatDate(gift.start_time) : '-'}</div>
                      <div>结束: {gift.end_time ? formatDate(gift.end_time) : '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`badge ${
                          gift.is_active
                            ? 'badge-success'
                            : 'badge-danger'
                        }`}
                      >
                        {gift.is_active ? '上架中' : '已下架'}
                      </span>
                      {gift.is_visible === 0 && (
                        <span className="badge bg-gray-100 text-gray-600 ml-2">
                          隐藏
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button className="text-primary-600 hover:text-primary-900 mr-3">
                        <Edit className="w-4 h-4 inline mr-1" />
                        编辑
                      </button>
                      <button className="text-gray-600 hover:text-gray-900 mr-3">
                        {gift.is_active ? (
                          <>
                            <EyeOff className="w-4 h-4 inline mr-1" />
                            下架
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 inline mr-1" />
                            上架
                          </>
                        )}
                      </button>
                      <button className="text-danger-600 hover:text-danger-900">
                        <Trash2 className="w-4 h-4 inline mr-1" />
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminGifts
