import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, MapPin, ChevronRight, ShoppingCart } from 'lucide-react'
import type { Order } from '@/types'
import { orderApi } from '@/api/order'

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: '待支付', color: 'bg-yellow-100 text-yellow-800' },
  paid: { label: '已支付', color: 'bg-blue-100 text-blue-800' },
  preparing: { label: '制作中', color: 'bg-purple-100 text-purple-800' },
  delivering: { label: '配送中', color: 'bg-orange-100 text-orange-800' },
  completed: { label: '已完成', color: 'bg-green-100 text-green-800' },
  cancelled: { label: '已取消', color: 'bg-gray-100 text-gray-800' },
  after_sale: { label: '售后中', color: 'bg-red-100 text-red-800' },
}

const mockOrders: Order[] = [
  {
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
  },
]

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>(mockOrders)
  const [activeTab, setActiveTab] = useState('all')

  const tabs = [
    { value: 'all', label: '全部' },
    { value: 'pending', label: '待支付' },
    { value: 'preparing', label: '制作中' },
    { value: 'delivering', label: '配送中' },
    { value: 'completed', label: '已完成' },
  ]

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'all') return true
    return order.status === activeTab
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 flex items-center">
          <ClipboardList className="h-6 w-6 mr-2" />
          我的订单
        </h1>
      </div>

      <div className="flex space-x-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              activeTab === tab.value
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-16">
          <ClipboardList className="mx-auto h-16 w-16 text-gray-300" />
          <p className="mt-4 text-gray-500">暂无订单</p>
          <Link to="/menu" className="mt-4 inline-block btn-primary">
            去点餐
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="card hover:shadow-md transition-shadow block"
            >
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">
                    订单号：{order.orderNo}
                  </span>
                  <span className="text-sm text-gray-500">
                    {order.createdAt}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge ${statusMap[order.status]?.color}`}>
                    {statusMap[order.status]?.label}
                  </span>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              <div className="p-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.productName}</p>
                      <p className="text-sm text-gray-500">
                        ¥{item.price} x {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium text-gray-900">¥{item.subtotal}</p>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    {order.deliveryType === 'room' ? (
                      <><MapPin className="h-4 w-4 mr-1" /> 配送至 {order.roomNumber} 房</>
                    ) : (
                      <><ShoppingCart className="h-4 w-4 mr-1" /> 到店自取</>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">共{order.items.reduce((sum, item) => sum + item.quantity, 0)}件</span>
                  <span className="text-lg font-bold text-primary-500">
                    合计 ¥{order.paidAmount}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
