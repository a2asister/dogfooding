import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingCart, Plus, Minus, Trash2, Clock, MapPin, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCartStore, selectTotalPrice, selectTotalItems } from '@/stores/cartStore'
import { orderApi } from '@/api/order'
import { useAuthStore } from '@/stores/authStore'

export default function Cart() {
  const navigate = useNavigate()
  const items = useCartStore((state) => state.items)
  const deliveryType = useCartStore((state) => state.deliveryType)
  const scheduledTime = useCartStore((state) => state.scheduledTime)
  const roomNumber = useCartStore((state) => state.roomNumber)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeItem = useCartStore((state) => state.removeItem)
  const setDeliveryType = useCartStore((state) => state.setDeliveryType)
  const setScheduledTime = useCartStore((state) => state.setScheduledTime)
  const setRoomNumber = useCartStore((state) => state.setRoomNumber)
  const clearCart = useCartStore((state) => state.clearCart)
  const totalPrice = useCartStore(selectTotalPrice)
  const totalItems = useCartStore(selectTotalItems)
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [remark, setRemark] = useState('')

  const timeSlots = [
    '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  ]

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error('购物车为空')
      return
    }

    if (deliveryType === 'room' && !roomNumber) {
      toast.error('请输入房间号')
      return
    }

    setLoading(true)
    try {
      const response = await orderApi.createOrder({
        items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        deliveryType,
        roomNumber: deliveryType === 'room' ? roomNumber : undefined,
        scheduledTime,
        remark,
      })

      if (response.data.code === 200) {
        clearCart()
        toast.success('下单成功')
        navigate(`/orders/${response.data.data.id}`)
      } else {
        toast.error(response.data.message || '下单失败')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || '下单失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <ShoppingCart className="mx-auto h-16 w-16 text-gray-300" />
        <h2 className="mt-4 text-lg font-medium text-gray-900">购物车是空的</h2>
        <p className="mt-2 text-gray-500">快去选购美食吧</p>
        <button
          onClick={() => navigate('/menu')}
          className="mt-6 btn-primary"
        >
          去点餐
        </button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="card">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2" />
              购物车 ({totalItems}件)
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {items.map((item) => (
              <div key={item.productId} className="p-4 flex items-center gap-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{item.name}</h3>
                  <p className="text-primary-500 font-medium mt-1">¥{item.price}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center hover:bg-primary-600"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">¥{item.price * item.quantity}</p>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-red-500 hover:text-red-600 text-sm mt-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-4">
          <h3 className="font-medium text-gray-900 mb-4 flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            配送方式
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setDeliveryType('room')}
              className={`p-4 rounded-lg border-2 text-center ${
                deliveryType === 'room'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <MapPin className={`h-6 w-6 mx-auto mb-2 ${deliveryType === 'room' ? 'text-primary-500' : 'text-gray-400'}`} />
              <span className="font-medium">配送至客房</span>
            </button>
            <button
              onClick={() => setDeliveryType('pickup')}
              className={`p-4 rounded-lg border-2 text-center ${
                deliveryType === 'pickup'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <ShoppingCart className={`h-6 w-6 mx-auto mb-2 ${deliveryType === 'pickup' ? 'text-primary-500' : 'text-gray-400'}`} />
              <span className="font-medium">到店自取</span>
            </button>
          </div>

          {deliveryType === 'room' && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                房间号
              </label>
              <input
                type="text"
                value={roomNumber || user?.roomNumber || ''}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="请输入房间号，如：808"
                className="input"
              />
            </div>
          )}
        </div>

        <div className="card p-4">
          <h3 className="font-medium text-gray-900 mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            预约用餐时间
          </h3>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            <button
              onClick={() => setScheduledTime(null)}
              className={`p-2 rounded-lg text-sm ${
                !scheduledTime
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              立即
            </button>
            {timeSlots.map((time) => (
              <button
                key={time}
                onClick={() => setScheduledTime(time)}
                className={`p-2 rounded-lg text-sm ${
                  scheduledTime === time
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        <div className="card p-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            备注
          </label>
          <textarea
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="如有特殊要求请备注（如：不要辣椒、少放糖等）"
            rows={3}
            className="input"
          />
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="card sticky top-40">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-medium text-gray-900">订单汇总</h3>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">餐品金额</span>
              <span className="text-gray-900">¥{totalPrice}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">配送费</span>
              <span className="text-gray-900">¥{deliveryType === 'room' ? 10 : 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">优惠</span>
              <span className="text-green-600">-¥0</span>
            </div>
            <div className="pt-3 border-t border-gray-100 flex justify-between">
              <span className="font-medium text-gray-900">合计</span>
              <span className="text-xl font-bold text-primary-500">
                ¥{totalPrice + (deliveryType === 'room' ? 10 : 0)}
              </span>
            </div>
          </div>
          <div className="p-4">
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full btn-primary py-3 text-base flex items-center justify-center"
            >
              {loading ? '提交中...' : '确认下单'}
              <ChevronRight className="h-5 w-5 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
