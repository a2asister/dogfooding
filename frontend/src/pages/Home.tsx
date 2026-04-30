import { Link } from 'react-router-dom'
import { UtensilsCrossed, Clock, Star, ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'

const mealTypes = [
  { id: 'breakfast', name: '早餐', icon: '🌅', time: '07:00-10:00' },
  { id: 'lunch', name: '午餐', icon: '☀️', time: '11:30-14:00' },
  { id: 'dinner', name: '晚餐', icon: '🌙', time: '17:30-21:00' },
  { id: 'special', name: '特色餐品', icon: '⭐', time: '全天' },
]

const featuredProducts = [
  {
    id: 1,
    name: '招牌红烧肉套餐',
    price: 68,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20braised%20pork%20belly%20set%20meal%20with%20rice%20and%20vegetables%20in%20hotel%20restaurant&image_size=square',
    description: '精选五花肉，慢炖两小时',
    isRecommend: true,
  },
  {
    id: 2,
    name: '广式早茶套餐',
    price: 88,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Cantonese%20dim%20sum%20breakfast%20set%20with%20various%20steamed%20buns%20and%20tea&image_size=square',
    description: '包含虾饺、烧卖、凤爪等',
    isRecommend: true,
  },
  {
    id: 3,
    name: '日式鳗鱼饭',
    price: 98,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20unagi%20don%20grilled%20eel%20rice%20bowl%20with%20sauce&image_size=square',
    description: '进口鳗鱼，现烤现卖',
    isRecommend: true,
  },
]

export default function Home() {
  const { addItem } = useCartStore()

  const handleAddToCart = (product: typeof featuredProducts[0]) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      categoryId: 1,
      mealType: 'combo',
      stock: 100,
      unit: '份',
      isRecommend: product.isRecommend,
      sort: 0,
      status: 'active',
      createdAt: '',
      updatedAt: '',
      description: product.description,
    })
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">欢迎回来</h1>
            <p className="text-primary-100">今天想吃点什么？我们为您准备了精选美食</p>
            <Link
              to="/menu"
              className="inline-flex items-center mt-6 bg-white text-primary-600 px-6 py-3 rounded-lg font-medium hover:bg-primary-50 transition-colors"
            >
              <UtensilsCrossed className="h-5 w-5 mr-2" />
              浏览菜单
            </Link>
          </div>
          <div className="hidden lg:block">
            <img
              src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=delicious%20gourmet%20food%20platter%20with%20various%20dishes%20elegant%20presentation&image_size=square"
              alt="美食"
              className="w-64 h-64 rounded-2xl object-cover shadow-lg"
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">用餐时间</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {mealTypes.map((type) => (
            <Link
              key={type.id}
              to={`/menu?mealType=${type.id}`}
              className="card p-4 hover:shadow-md transition-shadow text-center"
            >
              <div className="text-4xl mb-2">{type.icon}</div>
              <h3 className="font-medium text-gray-900">{type.name}</h3>
              <div className="flex items-center justify-center text-sm text-gray-500 mt-1">
                <Clock className="h-3 w-3 mr-1" />
                {type.time}
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Star className="h-5 w-5 text-yellow-500 mr-2" />
            今日推荐
          </h2>
          <Link to="/menu" className="text-primary-500 hover:text-primary-600 text-sm">
            查看全部 →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredProducts.map((product) => (
            <div key={product.id} className="card hover:shadow-md transition-shadow">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-48 object-cover"
          />
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-gray-900">{product.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{product.description}</p>
              </div>
              {product.isRecommend && (
                <span className="badge bg-yellow-100 text-yellow-800">推荐</span>
              )}
            </div>
            <div className="flex items-center justify-between mt-4">
              <span className="text-xl font-bold text-primary-500">¥{product.price}</span>
              <button
                onClick={() => handleAddToCart(product)}
                className="flex items-center px-3 py-1.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 text-sm"
              >
                <ShoppingCart className="h-4 w-4 mr-1" />
                加入购物车
              </button>
            </div>
          </div>
        </div>
          ))}
        </div>
      </div>
    </div>
  )
}
