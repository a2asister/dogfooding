import { useState, useEffect } from 'react'
import { Search, Filter, ShoppingCart, Plus, Minus } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Product } from '@/types'
import { useCartStore } from '@/stores/cartStore'

const mealTypeOptions = [
  { value: '', label: '全部' },
  { value: 'breakfast', label: '早餐' },
  { value: 'lunch', label: '午餐' },
  { value: 'dinner', label: '晚餐' },
  { value: 'special', label: '特色餐品' },
  { value: 'combo', label: '套餐' },
]

const mockProducts: Product[] = [
  {
    id: 1,
    name: '招牌红烧肉套餐',
    description: '精选五花肉，慢炖两小时，入口即化',
    price: 68,
    originalPrice: 88,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20braised%20pork%20belly%20set%20meal%20with%20rice%20and%20vegetables%20in%20hotel%20restaurant&image_size=square',
    categoryId: 1,
    mealType: 'combo',
    stock: 50,
    unit: '份',
    isRecommend: true,
    sort: 1,
    status: 'active',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 2,
    name: '广式早茶套餐',
    description: '包含虾饺、烧卖、凤爪、肠粉等经典点心',
    price: 88,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Cantonese%20dim%20sum%20breakfast%20set%20with%20various%20steamed%20buns%20and%20tea&image_size=square',
    categoryId: 1,
    mealType: 'breakfast',
    stock: 30,
    unit: '份',
    isRecommend: true,
    sort: 2,
    status: 'active',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 3,
    name: '日式鳗鱼饭',
    description: '进口鳗鱼，现烤现卖，搭配秘制酱汁',
    price: 98,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20unagi%20don%20grilled%20eel%20rice%20bowl%20with%20sauce&image_size=square',
    categoryId: 2,
    mealType: 'lunch',
    stock: 20,
    unit: '份',
    isRecommend: true,
    sort: 3,
    status: 'active',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 4,
    name: '黑椒牛排套餐',
    description: '澳洲进口牛排，搭配黑椒酱汁',
    price: 168,
    originalPrice: 198,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=black%20pepper%20steak%20set%20meal%20with%20vegetables%20and%20potatoes&image_size=square',
    categoryId: 3,
    mealType: 'dinner',
    stock: 15,
    unit: '份',
    isRecommend: false,
    sort: 4,
    status: 'active',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 5,
    name: '佛跳墙',
    description: '山珍海味，慢炖8小时',
    price: 298,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20Buddha%20Jumps%20Over%20the%20Wall%20soup%20deluxe%20seafood%20dish&image_size=square',
    categoryId: 4,
    mealType: 'special',
    stock: 5,
    unit: '份',
    isRecommend: true,
    sort: 5,
    status: 'active',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
]

export default function Menu() {
  const [products, setProducts] = useState<Product[]>(mockProducts)
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(mockProducts)
  const [keyword, setKeyword] = useState('')
  const [mealType, setMealType] = useState('')
  const { items, addItem, updateQuantity } = useCartStore()

  useEffect(() => {
    let result = products

    if (keyword) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(keyword.toLowerCase()) ||
        p.description?.toLowerCase().includes(keyword.toLowerCase())
      )
    }

    if (mealType) {
      result = result.filter((p) => p.mealType === mealType)
    }

    setFilteredProducts(result)
  }, [keyword, mealType, products])

  const getCartQuantity = (productId: number) => {
    const item = items.find((i) => i.productId === productId)
    return item?.quantity || 0
  }

  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) {
      toast.error('库存不足')
      return
    }
    addItem(product)
    toast.success('已加入购物车')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索餐品..."
            className="input pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-500" />
          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value)}
            className="input"
          >
            {mealTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingCart className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-4 text-gray-500">暂无餐品</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const cartQuantity = getCartQuantity(product.id)
            return (
              <div key={product.id} className="card hover:shadow-md transition-shadow">
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  {product.isRecommend && (
                    <span className="absolute top-3 left-3 badge bg-yellow-100 text-yellow-800">
                      推荐
                    </span>
                  )}
                  {product.stock <= 0 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-medium">已售罄</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{product.name}</h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold text-primary-500">¥{product.price}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-400 line-through">
                          ¥{product.originalPrice}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      库存: {product.stock}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-sm text-gray-500">
                      {mealTypeOptions.find((o) => o.value === product.mealType)?.label}
                    </span>
                    {cartQuantity > 0 ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(product.id, cartQuantity - 1)}
                          className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-medium">{cartQuantity}</span>
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={product.stock <= cartQuantity}
                          className="w-7 h-7 rounded-full bg-primary-500 text-white flex items-center justify-center hover:bg-primary-600 disabled:opacity-50"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock <= 0}
                        className="flex items-center px-3 py-1.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        加入
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
