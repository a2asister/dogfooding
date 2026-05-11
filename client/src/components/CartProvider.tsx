import React, { createContext, useContext, useState, useEffect } from 'react';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  description?: string;
}

interface CartItem extends Product {
  cartId: number;
  quantity: number;
}

interface CartContextType {
  products: Product[];
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (productId: number) => void;
  removeFromCart: (cartId: number) => void;
  updateQuantity: (cartId: number, quantity: number) => void;
  clearCart: () => void;
  checkout: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export default function CartProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, cartRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/cart')
      ]);
      
      const productsData = await productsRes.json();
      const cartData = await cartRes.json();
      
      if (productsData.success) {
        setProducts(productsData.data);
      }
      
      if (cartData.success) {
        setCartItems(cartData.data.items);
        setCartCount(cartData.data.count);
        setCartTotal(cartData.data.total);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const addToCart = async (productId: number) => {
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 })
      });
      
      if (response.ok) {
        await fetchCart();
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const removeFromCart = async (cartId: number) => {
    try {
      const response = await fetch(`/api/cart/${cartId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await fetchCart();
      }
    } catch (error) {
      console.error('Failed to remove from cart:', error);
    }
  };

  const updateQuantity = async (cartId: number, quantity: number) => {
    try {
      const response = await fetch(`/api/cart/${cartId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity })
      });
      
      if (response.ok) {
        await fetchCart();
      }
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  const clearCart = async () => {
    try {
      const response = await fetch('/api/cart', {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await fetchCart();
      }
    } catch (error) {
      console.error('Failed to clear cart:', error);
    }
  };

  const checkout = async () => {
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST'
      });
      
      if (response.ok) {
        await fetchCart();
      }
    } catch (error) {
      console.error('Failed to checkout:', error);
    }
  };

  const fetchCart = async () => {
    try {
      const response = await fetch('/api/cart');
      const data = await response.json();
      
      if (data.success) {
        setCartItems(data.data.items);
        setCartCount(data.data.count);
        setCartTotal(data.data.total);
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    }
  };

  return (
    <CartContext.Provider value={{
      products,
      cartItems,
      cartCount,
      cartTotal,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      checkout
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
