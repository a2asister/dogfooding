import React, { useState, useEffect } from 'react';
import { useCart } from './CartProvider';

interface CartItemType {
  id: number;
  cartId: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  description?: string;
}

export default function CartPage() {
  const { cartItems, cartCount, cartTotal, removeFromCart, updateQuantity, clearCart, checkout } = useCart();
  const [visibleItems, setVisibleItems] = useState<CartItemType[]>([]);
  const [removingIds, setRemovingIds] = useState<number[]>([]);

  useEffect(() => {
    const newItems = cartItems.map(item => ({
      ...item,
      cartId: item.id,
    }));
    
    setVisibleItems(newItems);
  }, [cartItems]);

  const handleRemove = (cartId: number, index: number) => {
    setRemovingIds(prev => [...prev, cartId]);
    
    setTimeout(() => {
      setVisibleItems(prev => prev.filter(item => item.cartId !== cartId));
      setRemovingIds(prev => prev.filter(id => id !== cartId));
      
      setTimeout(() => {
        removeFromCart(cartId);
      }, 300);
    }, 500);
  };

  const canCheckout = cartItems.length > 0;

  return (
    <section style={{
      background: 'white',
      borderRadius: '20px',
      padding: '2rem',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <h2 style={{
          fontSize: '1.8rem',
          fontWeight: 'bold',
          color: '#2d3748'
        }}>
          🛒 购物车
          <span style={{
            fontSize: '1rem',
            color: '#718096',
            marginLeft: '0.75rem',
            fontWeight: 'normal'
          }}>
            ({cartCount} 件商品)
          </span>
        </h2>
        
        {cartItems.length > 0 && (
          <button
            onClick={clearCart}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#e53e3e',
              fontSize: '0.9rem',
              cursor: 'pointer',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              transition: 'background 0.2s ease'
            }}
            className="clear-cart-btn"
          >
            清空购物车
          </button>
        )}
      </div>
      
      {visibleItems.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem'
        }}>
          <div style={{
            fontSize: '4rem',
            marginBottom: '1rem'
          }}>
            🛒
          </div>
          <p style={{
            fontSize: '1.2rem',
            color: '#718096'
          }}>
            购物车是空的，快去添加商品吧！
          </p>
        </div>
      ) : (
        <div style={{ marginBottom: '2rem' }}>
          <div className="cart-items-container">
            {visibleItems.map((item, index) => {
              const isRemoving = removingIds.includes(item.cartId);
              
              return (
                <div
                  key={item.cartId}
                  className={`cart-item ${isRemoving ? 'removing' : ''}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '1.5rem',
                    background: '#f7fafc',
                    borderRadius: '12px',
                    marginBottom: '1rem',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{
                      width: '100px',
                      height: '100px',
                      objectFit: 'cover',
                      borderRadius: '10px',
                      marginRight: '1.5rem',
                      flexShrink: 0
                    }}
                  />
                  
                  <div style={{
                    flex: 1,
                    minWidth: 0
                  }}>
                    <h3 style={{
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      color: '#2d3748',
                      marginBottom: '0.25rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {item.name}
                    </h3>
                    
                    {item.description && (
                      <p style={{
                        fontSize: '0.85rem',
                        color: '#718096',
                        marginBottom: '0.75rem'
                      }}>
                        {item.description}
                      </p>
                    )}
                    
                    <span style={{
                      fontSize: '1.15rem',
                      fontWeight: 'bold',
                      color: '#e53e3e'
                    }}>
                      ¥{item.price.toFixed(2)}
                    </span>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginRight: '2rem'
                  }}>
                    <button
                      onClick={() => updateQuantity(item.cartId, Math.max(1, item.quantity - 1))}
                      style={{
                        width: '36px',
                        height: '36px',
                        border: '1px solid #e2e8f0',
                        background: 'white',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease'
                      }}
                      className="qty-btn"
                    >
                      -
                    </button>
                    
                    <span style={{
                      width: '50px',
                      textAlign: 'center',
                      fontSize: '1.1rem',
                      fontWeight: '600'
                    }}>
                      {item.quantity}
                    </span>
                    
                    <button
                      onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                      style={{
                        width: '36px',
                        height: '36px',
                        border: '1px solid #e2e8f0',
                        background: 'white',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease'
                      }}
                      className="qty-btn"
                    >
                      +
                    </button>
                  </div>
                  
                  <div style={{
                    marginRight: '2rem',
                    textAlign: 'right',
                    minWidth: '100px'
                  }}>
                    <div style={{
                      fontSize: '0.85rem',
                      color: '#718096',
                      marginBottom: '0.25rem'
                    }}>
                      小计
                    </div>
                    <div style={{
                      fontSize: '1.25rem',
                      fontWeight: 'bold',
                      color: '#e53e3e'
                    }}>
                      ¥{(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleRemove(item.cartId, index)}
                    style={{
                      width: '40px',
                      height: '40px',
                      border: 'none',
                      background: '#fed7d7',
                      color: '#e53e3e',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontSize: '1.2rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                      flexShrink: 0
                    }}
                    className="delete-btn"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
          
          <div style={{
            marginTop: '2rem',
            padding: '1.5rem',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            borderRadius: '16px',
            color: 'white'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <span style={{
                fontSize: '1.2rem',
                fontWeight: '600'
              }}>
                总计
              </span>
              <span style={{
                fontSize: '2rem',
                fontWeight: 'bold'
              }}>
                ¥{cartTotal.toFixed(2)}
              </span>
            </div>
            
            <button
              onClick={checkout}
              disabled={!canCheckout}
              style={{
                width: '100%',
                padding: '1rem',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: canCheckout ? 'pointer' : 'not-allowed',
                position: 'relative',
                overflow: 'hidden',
                background: canCheckout 
                  ? 'linear-gradient(90deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3, #ff6b6b)'
                  : '#a0aec0',
                backgroundSize: canCheckout ? '400% 100%' : 'auto',
                color: 'white',
                transition: 'all 0.3s ease'
              }}
              className={canCheckout ? 'checkout-btn active' : 'checkout-btn disabled'}
            >
              立即结算
            </button>
          </div>
        </div>
      )}
      
      <style>
        {`
          .cart-item {
            animation: slideInUp 0.5s ease forwards;
          }
          
          .cart-item.removing {
            animation: slideOutLeft 0.5s ease forwards;
          }
          
          @keyframes slideInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes slideOutLeft {
            0% {
              opacity: 1;
              transform: translateX(0);
            }
            100% {
              opacity: 0;
              transform: translateX(-100%);
            }
          }
          
          .clear-cart-btn:hover {
            background: #fff5f5;
          }
          
          .qty-btn:hover {
            background: #edf2f7;
            border-color: #cbd5e0;
          }
          
          .qty-btn:active {
            transform: scale(0.95);
          }
          
          .delete-btn:hover {
            background: #fc8181;
            color: white;
            transform: scale(1.1);
          }
          
          .delete-btn:active {
            transform: scale(0.95);
          }
          
          .checkout-btn.active {
            animation: gradientFlow 3s linear infinite;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
          }
          
          .checkout-btn.active:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
          }
          
          .checkout-btn.active::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(
              90deg,
              transparent,
              rgba(255, 255, 255, 0.3),
              transparent
            );
            animation: shimmer 2s linear infinite;
          }
          
          @keyframes gradientFlow {
            0% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }
          
          @keyframes shimmer {
            0% {
              left: -100%;
            }
            100% {
              left: 100%;
            }
          }
        `}
      </style>
    </section>
  );
}
