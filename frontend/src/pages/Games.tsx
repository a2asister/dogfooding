import { useState } from 'react'
import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { Gamepad2, Filter, ChevronRight, Gift, Grid3X3, Search, X } from 'lucide-react'
import axios from 'axios'

interface Category {
  id: number
  name: string
  description: string
  sortOrder: number
  gameCount: number
}

interface GameItem {
  id: number
  name: string
  icon: string | null
  description: string
  publisher: string
  giftCount: number
  category: {
    id: number
    name: string
  }
}

const Games = () => {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>(
    'gameCategories',
    async () => {
      const response = await axios.get('/api/games/categories')
      return response.data.data
    }
  )

  const { data: gamesData, isLoading: gamesLoading } = useQuery(
    ['games', selectedCategory, searchKeyword],
    async () => {
      const params: Record<string, any> = {
        pageSize: 50,
      }
      if (selectedCategory) {
        params.categoryId = selectedCategory
      }
      if (searchKeyword) {
        params.keyword = searchKeyword
      }
      const response = await axios.get('/api/games', { params })
      return response.data.data
    }
  )

  const games: GameItem[] = gamesData?.items || []

  const handleClearFilters = () => {
    setSelectedCategory(null)
    setSearchKeyword('')
  }

  const hasActiveFilters = selectedCategory !== null || searchKeyword !== ''

  return (
    <div className="container-page">
      <div className="mb-6">
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <Link to="/" className="hover:text-primary-600">
            首页
          </Link>
          <ChevronRight className="w-4 h-4 mx-1" />
          <span className="text-gray-900">游戏中心</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          <Gamepad2 className="inline w-7 h-7 mr-2 text-primary-500" />
          游戏中心
        </h1>
        <p className="mt-1 text-gray-600">
          浏览游戏，发现精彩礼包
        </p>
      </div>

      <div className="mb-6">
        <div className="card p-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="搜索游戏名称..."
                className="input pl-10"
              />
              {searchKeyword && (
                <button
                  onClick={() => setSearchKeyword('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`md:hidden flex items-center justify-center px-4 py-2 rounded-lg border transition-colors ${
                showFilters
                  ? 'border-primary-500 text-primary-600 bg-primary-50'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4 mr-2" />
              筛选
              {hasActiveFilters && (
                <span className="ml-2 w-2 h-2 rounded-full bg-primary-500"></span>
              )}
            </button>
          </div>

          {(showFilters || true) && (
            <div className={`mt-4 pt-4 border-t border-gray-200 ${showFilters ? 'md:hidden' : 'hidden md:block'}`}>
              <div className="flex flex-col md:flex-row md:items-center gap-2">
                <span className="text-sm font-medium text-gray-700 flex items-center">
                  <Grid3X3 className="w-4 h-4 mr-1.5" />
                  游戏分类：
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === null
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    全部
                  </button>
                  {categoriesLoading ? (
                    Array(3)
                      .fill(0)
                      .map((_, i) => (
                        <div
                          key={i}
                          className="w-16 h-8 bg-gray-100 rounded-full animate-pulse"
                        ></div>
                      ))
                  ) : (
                    categories?.map((category) => (
                      <button
                        key={category.id}
                        onClick={() =>
                          setSelectedCategory(
                            selectedCategory === category.id ? null : category.id
                          )
                        }
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          selectedCategory === category.id
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {category.name}
                        <span className="ml-1 text-xs opacity-75">
                          ({category.gameCount})
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {hasActiveFilters && (
                <div className="mt-3 flex items-center">
                  <button
                    onClick={handleClearFilters}
                    className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
                  >
                    <X className="w-4 h-4 mr-1" />
                    清除筛选
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {gamesLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array(8)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="card overflow-hidden animate-pulse">
                <div className="h-32 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                </div>
              </div>
            ))}
        </div>
      ) : games.length === 0 ? (
        <div className="card p-12 text-center">
          <Gamepad2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            暂无游戏
          </h3>
          <p className="text-gray-600 mb-4">
            {hasActiveFilters
              ? '没有找到符合条件的游戏，请尝试修改筛选条件'
              : '暂无游戏，请稍后再试'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="btn-primary inline-flex items-center"
            >
              清除筛选条件
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {games.map((game) => (
            <Link
              key={game.id}
              to={`/games/${game.id}`}
              className="card overflow-hidden card-hover group"
            >
              <div className="relative h-32 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                {game.icon ? (
                  <img
                    src={game.icon}
                    alt={game.name}
                    className="w-20 h-20 object-contain"
                  />
                ) : (
                  <Gamepad2 className="w-12 h-12 text-gray-400" />
                )}
                {game.giftCount > 0 && (
                  <div className="absolute top-2 right-2">
                    <span className="badge badge-primary">
                      <Gift className="w-3 h-3 mr-1 inline" />
                      {game.giftCount}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-1 group-hover:text-primary-600 transition-colors truncate">
                  {game.name}
                </h3>
                <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                  {game.description}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{game.category.name}</span>
                  {game.publisher && (
                    <span className="truncate ml-2">{game.publisher}</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {gamesData?.pagination && gamesData.pagination.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center">
          <div className="text-sm text-gray-600">
            共 {gamesData.pagination.total} 款游戏，第{' '}
            {gamesData.pagination.page} / {gamesData.pagination.totalPages} 页
          </div>
        </div>
      )}
    </div>
  )
}

export default Games
