import { create } from 'zustand'
import type { CartItem, Product } from '@/types'

interface CartState {
  items: CartItem[]
  deliveryType: 'room' | 'pickup'
  scheduledTime: string | null
  roomNumber: string | null
  
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
  setDeliveryType: (type: 'room' | 'pickup') => void
  setScheduledTime: (time: string | null) => void
  setRoomNumber: (roomNumber: string | null) => void
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  deliveryType: 'room',
  scheduledTime: null,
  roomNumber: null,
  
  addItem: (product, quantity = 1) => {
    set((state) => {
      const existingItem = state.items.find((item) => item.productId === product.id)
      
      if (existingItem) {
        return {
          items: state.items.map((item) =>
            item.productId === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
        }
      }
      
      return {
        items: [
          ...state.items,
          {
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity,
          },
        ],
      }
    })
  },
  
  removeItem: (productId) => {
    set((state) => ({
      items: state.items.filter((item) => item.productId !== productId),
    }))
  },
  
  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId)
      return
    }
    
    set((state) => ({
      items: state.items.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      ),
    }))
  },
  
  clearCart: () => {
    set({ items: [] })
  },
  
  setDeliveryType: (type) => {
    set({ deliveryType: type })
  },
  
  setScheduledTime: (time) => {
    set({ scheduledTime: time })
  },
  
  setRoomNumber: (roomNumber) => {
    set({ roomNumber })
  },
}))

export const selectTotalPrice = (state: CartState) => {
  return state.items.reduce((total, item) => total + item.price * item.quantity, 0)
}

export const selectTotalItems = (state: CartState) => {
  return state.items.reduce((total, item) => total + item.quantity, 0)
}
