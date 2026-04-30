import { useState } from 'react'
import { useQuery } from 'react-query'
import { Plus, Search, Edit, Trash2, Gamepad2, Eye, EyeOff, Grid3X3 } from 'lucide-react'
import axios from 'axios'

const AdminGames = () => {
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)

  const { data: gamesData, isLoading } = useQuery(
    ['adminGames', selectedCategory],
    async () => {
      const params: Record<string, any> = {
        pageSize: 50,
      }
      if (selectedCategory) params.categoryId = selectedCategory
      const response = await axios.get('/api/admin/games', { params })
      return response.data.data
    }
  )

  const games = gamesData?.items || []

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            <Gamepad2 className="inline w-7 h-7 mr-2 text-primary-500" />
            游戏管理
          </h1>
          <p className="mt-1 text-gray-600">
            管理游戏和游戏分类
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button className="btn-outline flex items-center">
            <Grid3X3 className="w-4 h-4 mr-2" />
            管理分类
          </button>
          <button className="btn-primary flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            新建游戏
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
              placeholder="搜索游戏名称..."
              className="input pl-10"
            />
          </div>
          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
            className="input lg:w-40"
          >
            <option value="">全部分类</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="card p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      ) : games.length === 0 ? (
        <div className="card p-12 text-center">
          <Gamepad2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            暂无游戏
          </h3>
          <p className="text-gray-600 mb-4">
            点击上方按钮创建第一个游戏
          </p>
          <button className="btn-primary inline-flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            新建游戏
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {games.map((game: any) => (
            <div key={game.id} className="card overflow-hidden">
              <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                {game.icon ? (
                  <img
                    src={game.icon}
                    alt={game.name}
                    className="w-20 h-20 object-contain"
                  />
                ) : (
                  <Gamepad2 className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{game.name}</h3>
                  <span
                    className={`badge text-xs ${
                      game.is_active
                        ? 'badge-success'
                        : 'badge-danger'
                    }`}
                  >
                    {game.is_active ? '上架中' : '已下架'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                  {game.description || '-'}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span>分类: {game.category_name || '-'}</span>
                  <span>开发商: {game.publisher || '-'}</span>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-3">
                    <button className="text-primary-600 hover:text-primary-900 text-sm">
                      <Edit className="w-4 h-4 inline mr-1" />
                      编辑
                    </button>
                    <button className="text-gray-600 hover:text-gray-900 text-sm">
                      {game.is_active ? (
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
                  </div>
                  <button className="text-danger-600 hover:text-danger-900 text-sm">
                    <Trash2 className="w-4 h-4 inline mr-1" />
                    删除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminGames
