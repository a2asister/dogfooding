import { createSignal, onMount } from 'solid-js';
import Login from './pages/Login.jsx';
import ScratchCardPage from './pages/ScratchCardPage.jsx';
import Admin from './pages/Admin.jsx';

const App = () => {
  const [currentPage, setCurrentPage] = createSignal('login');
  const [user, setUser] = createSignal(null);
  const [hasDrawn, setHasDrawn] = createSignal(false);
  const [coupon, setCoupon] = createSignal(null);

  onMount(() => {
    try {
      const savedUser = localStorage.getItem('user');
      const savedHasDrawn = localStorage.getItem('hasDrawn');
      const savedCoupon = localStorage.getItem('coupon');

      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      if (savedHasDrawn) {
        try {
          setHasDrawn(JSON.parse(savedHasDrawn));
        } catch {
          setHasDrawn(savedHasDrawn === 'true');
        }
      }
      if (savedCoupon) {
        setCoupon(JSON.parse(savedCoupon));
      }
    } catch (err) {
      console.error('Error reading localStorage:', err);
    }
  });

  const navigate = (page) => {
    setCurrentPage(page);
  };

  const handleLogin = (userData, drawn, couponData) => {
    setUser(userData);
    setHasDrawn(!!drawn);
    if (couponData) {
      setCoupon(couponData);
    }
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('hasDrawn', JSON.stringify(!!drawn));
    if (couponData) {
      localStorage.setItem('coupon', JSON.stringify(couponData));
    }
    navigate('scratch');
  };

  const handleDraw = (isWinner, couponData) => {
    setHasDrawn(true);
    if (isWinner && couponData) {
      setCoupon(couponData);
      localStorage.setItem('coupon', JSON.stringify(couponData));
    }
    localStorage.setItem('hasDrawn', 'true');
  };

  return (
    <div class="app-container">
      <header class="app-header">
        <h1>🎰 趣味刮刮卡</h1>
        <nav class="nav-links">
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); navigate('login'); }}
            class={currentPage() === 'login' ? 'active' : ''}
          >
            首页
          </a>
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); navigate('scratch'); }}
            class={currentPage() === 'scratch' ? 'active' : ''}
          >
            刮奖
          </a>
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); navigate('admin'); }}
            class={currentPage() === 'admin' ? 'active' : ''}
          >
            管理
          </a>
        </nav>
      </header>
      <main class="main-content">
        {currentPage() === 'login' && (
          <Login onLogin={handleLogin} navigate={navigate} />
        )}
        {currentPage() === 'scratch' && (
          <ScratchCardPage 
            user={user()} 
            hasDrawn={hasDrawn()} 
            coupon={coupon()}
            onDraw={handleDraw}
            navigate={navigate}
          />
        )}
        {currentPage() === 'admin' && (
          <Admin navigate={navigate} />
        )}
      </main>
    </div>
  );
};

export default App;
