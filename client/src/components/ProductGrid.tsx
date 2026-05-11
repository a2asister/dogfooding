import { useCart } from './CartProvider';
import { useFlyingAnimation } from './FlyingAnimation';

export default function ProductGrid() {
  const { products, addToCart } = useCart();
  const flyingAnimation = useFlyingAnimation();

  const handleAddToCart = async (productId: number, event: React.MouseEvent<HTMLButtonElement>, image: string) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    
    if (flyingAnimation) {
      flyingAnimation.triggerFlyingAnimation(image, rect);
    }
    
    setTimeout(() => {
      addToCart(productId);
    }, 100);
  };

  return (
    <section style={{ marginBottom: '4rem' }}>
      <h2 style={{
        fontSize: '1.8rem',
        fontWeight: 'bold',
        marginBottom: '2rem',
        color: '#2d3748'
      }}>
        热销商品
      </h2>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1.5rem'
      }}>
        {products.map(product => (
          <div key={product.id} style={{
            background: 'white',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
          }} className="product-card">
            <div style={{
              position: 'relative',
              paddingTop: '100%',
              background: '#f7fafc',
              overflow: 'hidden'
            }}>
              <img 
                src={product.image} 
                alt={product.name}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.5s ease'
                }}
                className="product-image"
              />
            </div>
            
            <div style={{ padding: '1.5rem' }}>
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: '#2d3748',
                marginBottom: '0.5rem'
              }}>
                {product.name}
              </h3>
              
              {product.description && (
                <p style={{
                  fontSize: '0.9rem',
                  color: '#718096',
                  marginBottom: '1rem'
                }}>
                  {product.description}
                </p>
              )}
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  color: '#e53e3e'
                }}>
                  ¥{product.price.toFixed(2)}
                </span>
                
                <button
                  onClick={(e) => handleAddToCart(product.id, e, product.image)}
                  style={{
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.25rem',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    boxShadow: '0 2px 8px rgba(102, 126, 234, 0.4)'
                  }}
                  className="add-to-cart-btn"
                >
                  加入购物车
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <style>
        {`
          .product-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
          }
          
          .product-card:hover .product-image {
            transform: scale(1.1);
          }
          
          .add-to-cart-btn:hover {
            transform: scale(1.05);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.5);
          }
          
          .add-to-cart-btn:active {
            transform: scale(0.98);
          }
        `}
      </style>
    </section>
  );
}
