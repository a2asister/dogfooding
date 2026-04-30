import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, MapPin, ShoppingCart, AlertCircle, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Order } from '@/types'
import { orderApi } from '@/api/order'

const statusMap: Record<string, { label: string; color: string; steps: string[] }> = {
  pending: {
    label: '待支付',
    color: 'bg-yellow-100 text-yellow-800',
    steps: ['订单创建'],
  },
  paid: {
    label: '已支付',
    color: 'bg-blue-100 text-blue-800',
    steps: ['订单创建', '支付完成'],
  },
  preparing: {
    label: '制作中',
    color: 'bg-purple-100 text-purple-800',
    steps: ['订单创建', '支付完成', '开始制作'],
  },
  delivering: {
    label: '配送中',
    color: 'bg-orange-100 text-orange-800',
    steps: ['订单创建', '支付完成', '开始制作', '开始配送'],
  },
  completed: {
    label: '已完成',
    color: 'bg-green-100 text-green-800',
    steps: ['订单创建', '支付完成', '开始制作', '开始配送', '订单完成'],
  },
  cancelled: {
    label: '已取消',
    color: 'bg-gray-100 text-gray-800',
    steps: ['订单创建', '订单取消'],
  },
  after_sale: {
    label: '售后中',
    color: 'bg-red-100 text-red-800',
    steps: ['订单创建', '支付完成', '开始制作', '开始配送', '订单完成', '售后申请'],
  },
}

const mockOrder: Order = {
  id: 1,
  orderNo: 'ORD202401010001',
  userId: 1,
  status: 'preparing',
  totalAmount: 68,
  discountAmount: 0,
  paidAmount: 68,
  deliveryType: 'room',
  roomNumber: '808',
  createdAt: '2024-01-01 12:00:00',
  paidAt: '2024-01-01 12:01:00',
  preparedAt: '2024-01-01 12:05:00',
  updatedAt: '2024-01-01 12:05:00',
  items: [
    {
      id: 1,
      orderId: 1,
      productId: 1,
      productName: '招牌红烧肉套餐',
      price: 68,
      quantity: 1,
      subtotal: 68,
    },
  ],
}

export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState<Order>(mockOrder)
  const [loading, setLoading] = useState(false)
  const [showAfterSale, setShowAfterSale] = useState(false)
  const [afterSaleType, setAfterSaleType] = useState('refund')
  const [afterSaleReason, setAfterSaleReason] = useState('')

  const statusInfo = statusMap[order.status] || statusMap.pending

  const handleCancelOrder = async () => {
    if (!window.confirm('确定要取消订单吗？')) return

    setLoading(true)
    try {
      const response = await orderApi.cancelOrder(order.id)
      if (response.data.code === 200) {
        toast.success('订单已取消')
        setOrder({ ...order, status: 'cancelled' })
      } else {
        toast.error(response.data.message || '取消失败')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || '取消失败')
    } finally {
      setLoading(false)
    }
  }

  const handleAfterSale = async () => {
    if (!afterSaleReason) {
      toast.error('请填写售后原因')
      return
    }

    setLoading(true)
    try {
      const response = await orderApi.applyAfterSale(order.id, {
        type: afterSaleType,
        reason: afterSaleReason,
      })
      if (response.data.code === 200) {
        toast.success('售后申请已提交')
        setShowAfterSale(false)
        setOrder({ ...order, status: 'after_sale' })
      } else {
        toast.error(response.data.message || '提交失败')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || '提交失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          返回
        </button>
      </div>

      <div className="card">
        <div className="p-6 bg-gradient-to-r from-primary-500 to-primary-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <span className={`badge bg-white text-primary-600`}>
                {statusInfo.label}
              </span>
              <p className="mt-2 text-lg font-medium">
                {order.status === 'preparing' && '厨师正在为您精心制作美食'}
                {order.status === 'delivering' && '骑手已出发，很快就到'}
                {order.status === 'completed' && '感谢您的用餐'}
                {order.status === 'pending' && '请尽快完成支付'}
              </p>
            </div>
            <Clock className="h-8 w-8 opacity-80" />
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {statusInfo.steps.map((step, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className={`w-3 h-3 rounded-full mt-1 ${
                  index < statusInfo.steps.length - 1
                    ? 'bg-primary-500'
                    : 'bg-gray-300'
                }`} />
                <div>
                  <p className={`font-medium ${
                    index < statusInfo.steps.length - 1 ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-medium text-gray-900 mb-4">配送信息</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-gray-600">
            {order.deliveryType === 'room' ? (
              <><MapPin className="h-5 w-5" /><span>配送至 {order.roomNumber} 房</span></>
            ) : (
              <><ShoppingCart className="h-5 w-5" /><span>到店自取</span></>
            )}
          </div>
          {order.scheduledTime && (
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="h-5 w-5" />
              <span>预约时间：{order.scheduledTime}</span>
            </div>
          )}
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-medium text-gray-900 mb-4">订单信息</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">订单号</span>
            <span className="text-gray-900">{order.orderNo}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">下单时间</span>
            <span className="text-gray-900">{order.createdAt}</span>
          </div>
          {order.paidAt && (
            <div className="flex justify-between">
              <span className="text-gray-500">支付时间</span>
              <span className="text-gray-900">{order.paidAt}</span>
            </div>
          )}
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-medium text-gray-900 mb-4">餐品明细</h3>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4">
              <div className="flex-1">
                <p className="font-medium text-gray-900">{item.productName}</p>
                <p className="text-sm text-gray-500">
                  ¥{item.price} x {item.quantity}</p>
              </div>
              <p className="font-medium text-gray-900">¥{item.subtotal}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">餐品金额</span>
            <span className="text-gray-900">¥{order.totalAmount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">配送费</span>
            <span className="text-gray-900">¥{order.deliveryType === 'room' ? 10 : 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">优惠</span>
            <span className="text-green-600">-¥{order.discountAmount}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-gray-100">
            <span className="font-medium text-gray-900">实付金额</span>
            <span className="text-xl font-bold text-primary-500">¥{order.paidAmount}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        {order.status === 'pending' && (
          <button
            onClick={handleCancelOrder}
            disabled={loading}
            className="flex-1 btn-secondary"
          >
            取消订单
          </button>
        )}
        {(order.status === 'paid' || order.status === 'preparing') && (
          <>
            <button
              onClick={() => setShowAfterSale(true)}
              className="flex-1 btn-secondary flex items-center justify-center"
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              申请售后
            </button>
            <button
              onClick={handleCancelOrder}
              disabled={loading}
              className="flex-1 btn-secondary"
            >
              取消订单
            </button>
          </>
        )}
        {order.status === 'completed' && (
          <button
            onClick={() => setShowAfterSale(true)}
            className="flex-1 btn-secondary flex items-center justify-center"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            评价/售后
          </button>
        )}
      </div>

      {showAfterSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">申请售后</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  售后类型
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setAfterSaleType('refund')}
                    className={`p-3 rounded-lg border-2 text-center text-sm ${
                      afterSaleType === 'refund'
                        ? 'border-primary-500 bg-primary-50 text-primary-600'
                        : 'border-gray-200'
                    }`}
                  >
                    仅退款
                  </button>
                  <button
                    onClick={() => setAfterSaleType('return')}
                    className={`p-3 rounded-lg border-2 text-center text-sm ${
                      afterSaleType === 'return'
                        ? 'border-primary-500 bg-primary-50 text-primary-600'
                        : 'border-gray-200'
                    }`}
                  >
                    退款退货
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  售后原因
                </label>
                <textarea
                  value={afterSaleReason}
                  onChange={(e) => setAfterSaleReason(e.target.value)}
                  placeholder="请详细描述售后原因..."
                  rows={4}
                  className="input"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAfterSale(false)}
                className="flex-1 btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleAfterSale}
                disabled={loading}
                className="flex-1 btn-primary"
              >
                提交申请
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
