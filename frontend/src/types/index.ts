export interface User {
  id: number
  username: string
  name: string
  email?: string
  phone?: string
  roomNumber?: string
  role: 'guest' | 'staff' | 'admin'
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: number
  name: string
  description?: string
  sort: number
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: number
  name: string
  description?: string
  price: number
  originalPrice?: number
  image?: string
  categoryId: number
  category?: Category
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'special' | 'combo'
  stock: number
  unit: string
  isRecommend: boolean
  sort: number
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface CartItem {
  productId: number
  name: string
  price: number
  image?: string
  quantity: number
}

export interface OrderItem {
  id: number
  orderId: number
  productId: number
  productName: string
  productImage?: string
  price: number
  quantity: number
  subtotal: number
}

export interface Order {
  id: number
  orderNo: string
  userId: number
  user?: User
  status: 'pending' | 'paid' | 'preparing' | 'delivering' | 'completed' | 'cancelled' | 'after_sale'
  totalAmount: number
  discountAmount: number
  paidAmount: number
  deliveryType: 'room' | 'pickup'
  roomNumber?: string
  scheduledTime?: string
  remark?: string
  paidAt?: string
  preparedAt?: string
  deliveredAt?: string
  completedAt?: string
  cancelledAt?: string
  items: OrderItem[]
  createdAt: string
  updatedAt: string
}

export interface CreateOrderRequest {
  items: { productId: number; quantity: number }[]
  deliveryType: 'room' | 'pickup'
  roomNumber?: string
  scheduledTime?: string
  remark?: string
}

export interface OperationLog {
  id: number
  userId: number
  user?: User
  action: string
  targetType: string
  targetId: number
  details: string
  ip?: string
  createdAt: string
}

export interface Statistics {
  todayOrders: number
  todayRevenue: number
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
  preparingOrders: number
  deliveringOrders: number
  topProducts: { id: number; name: string; count: number }[]
  recentOrders: Order[]
}

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}
