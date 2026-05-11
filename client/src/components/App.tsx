import CartProvider from './CartProvider';
import Header from './Header';
import ProductGrid from './ProductGrid';
import CartPage from './CartPage';
import FlyingAnimation from './FlyingAnimation';

export default function App() {
  return (
    <FlyingAnimation>
      <CartProvider>
        <Header />
        <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
          <ProductGrid />
          <CartPage />
        </main>
      </CartProvider>
    </FlyingAnimation>
  );
}
