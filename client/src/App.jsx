import { createSignal, createEffect, onMount, onCleanup } from 'solid-js';
import { getActivity, createActivity, purchase } from './utils/api';
import ParticleBackground from './components/ParticleBackground';
import CountdownTimer from './components/CountdownTimer';
import NeonProgress from './components/NeonProgress';
import SliderVerify from './components/SliderVerify';

function App() {
  const [activity, setActivity] = createSignal(null);
  const [currentTime, setCurrentTime] = createSignal(Date.now());
  const [showConfig, setShowConfig] = createSignal(false);
  const [sliderToken, setSliderToken] = createSignal(null);
  const [purchaseStatus, setPurchaseStatus] = createSignal(null);
  const [isPurchasing, setIsPurchasing] = createSignal(false);
  const [userId] = createSignal('user_' + Math.random().toString(36).substr(2, 9));
  
  const [configForm, setConfigForm] = createSignal({
    name: '',
    product_name: '',
    product_image: '',
    original_price: 9999,
    sale_price: 4999,
    start_time: Date.now() + 60000,
    end_time: Date.now() + 3600000,
    total_stock: 100
  });
  
  const timeProgress = () => {
    const act = activity();
    if (!act) return 0;
    
    const now = Date.now();
    const totalDuration = act.end_time - act.start_time;
    const elapsed = now - act.start_time;
    
    if (totalDuration <= 0) return 0;
    return Math.max(0, Math.min(1, elapsed / totalDuration));
  };
  
  const timeRemaining = () => {
    const act = activity();
    if (!act) return 0;
    
    const now = Date.now();
    const remaining = act.end_time - now;
    return Math.max(0, remaining);
  };
  
  const isActive = () => {
    const act = activity();
    if (!act) return false;
    const now = Date.now();
    return now >= act.start_time && now < act.end_time;
  };
  
  const isEnded = () => {
    const act = activity();
    if (!act) return true;
    const now = Date.now();
    return now >= act.end_time;
  };
  
  const isPending = () => {
    const act = activity();
    if (!act) return false;
    const now = Date.now();
    return now < act.start_time;
  };
  
  createEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 100);
    
    return () => clearInterval(interval);
  });
  
  onMount(async () => {
    await loadActivity();
    
    const refreshInterval = setInterval(async () => {
      await loadActivity();
    }, 10000);
    
    return () => clearInterval(refreshInterval);
  });
  
  async function loadActivity() {
    const result = await getActivity();
    if (result && result.success) {
      setActivity(result.data);
    }
  }
  
  async function handleCreateActivity() {
    const form = configForm();
    const result = await createActivity({
      name: form.name,
      product_name: form.product_name,
      product_image: form.product_image,
      original_price: parseFloat(form.original_price),
      sale_price: parseFloat(form.sale_price),
      start_time: form.start_time,
      end_time: form.end_time,
      total_stock: parseInt(form.total_stock)
    });
    
    if (result && result.success) {
      alert('活动创建成功！');
      setShowConfig(false);
      await loadActivity();
    } else {
      alert('创建活动失败');
    }
  }
  
  async function handlePurchase() {
    if (!sliderToken()) {
      alert('请先完成滑块验证');
      return;
    }
    
    if (isPurchasing()) return;
    
    setIsPurchasing(true);
    setPurchaseStatus(null);
    
    const act = activity();
    const result = await purchase(act.id, userId(), sliderToken());
    
    setPurchaseStatus(result);
    setIsPurchasing(false);
    
    if (result.success) {
      await loadActivity();
    }
  }
  
  const containerStyle = {
    minHeight: '100vh',
    position: 'relative',
    padding: '20px'
  };
  
  const mainWrapperStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    position: 'relative',
    zIndex: 10
  };
  
  const headerStyle = {
    textAlign: 'center',
    marginBottom: '60px',
    paddingTop: '40px'
  };
  
  const titleStyle = {
    fontSize: '56px',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #00f7ff, #0066ff, #ff00ff)',
    'background-clip': 'text',
    '-webkit-background-clip': 'text',
    '-webkit-text-fill-color': 'transparent',
    marginBottom: '15px',
    'text-shadow': '0 0 30px rgba(0, 247, 255, 0.5)',
    letterSpacing: '2px'
  };
  
  const subtitleStyle = {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '18px',
    marginBottom: '25px'
  };
  
  const configBtnStyle = {
    padding: '12px 28px',
    background: 'rgba(0, 247, 255, 0.1)',
    border: '1px solid rgba(0, 247, 255, 0.4)',
    borderRadius: '30px',
    color: '#00f7ff',
    cursor: 'pointer',
    fontSize: '15px',
    transition: 'all 0.3s ease',
    fontWeight: '500'
  };
  
  const activityCardStyle = {
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(20px)',
    borderRadius: '32px',
    padding: '50px',
    border: '1px solid rgba(0, 247, 255, 0.15)',
    boxShadow: '0 25px 80px rgba(0, 0, 0, 0.4)',
    marginBottom: '40px'
  };
  
  const productSectionStyle = {
    display: 'flex',
    gap: '50px',
    marginBottom: '60px',
    alignItems: 'flex-start'
  };
  
  const imageContainerStyle = {
    flex: '0 0 280px',
    position: 'relative',
    flexShrink: 0
  };
  
  const productImageStyle = {
    width: '280px',
    height: '280px',
    objectFit: 'cover',
    borderRadius: '24px',
    boxShadow: '0 15px 40px rgba(0, 0, 0, 0.4)'
  };
  
  const saleBadgeStyle = {
    position: 'absolute',
    top: '-15px',
    right: '-15px',
    background: 'linear-gradient(135deg, #ff4444, #ff0000)',
    color: '#fff',
    padding: '10px 20px',
    borderRadius: '25px',
    fontSize: '16px',
    fontWeight: 'bold',
    boxShadow: '0 8px 25px rgba(255, 0, 0, 0.4)',
    zIndex: 2
  };
  
  const productInfoStyle = {
    flex: 1,
    minWidth: 0
  };
  
  const productTitleStyle = {
    color: '#fff',
    fontSize: '32px',
    marginBottom: '12px',
    fontWeight: '700'
  };
  
  const productNameStyle = {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: '20px',
    marginBottom: '30px',
    lineHeight: '1.5'
  };
  
  const priceSectionStyle = {
    display: 'flex',
    alignItems: 'baseline',
    gap: '20px',
    marginBottom: '35px',
    flexWrap: 'wrap'
  };
  
  const salePriceStyle = {
    color: '#ff4444',
    fontSize: '48px',
    fontWeight: 'bold',
    textShadow: '0 0 25px rgba(255, 68, 68, 0.5)'
  };
  
  const originalPriceStyle = {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: '22px',
    textDecoration: 'line-through'
  };
  
  const discountBadgeStyle = {
    background: 'rgba(255, 68, 68, 0.2)',
    color: '#ff4444',
    padding: '6px 16px',
    borderRadius: '18px',
    fontSize: '15px',
    fontWeight: '500'
  };
  
  const stockSectionStyle = {
    display: 'flex',
    gap: '25px',
    flexWrap: 'wrap'
  };
  
  const stockCardStyle = {
    padding: '15px 30px',
    background: 'rgba(0, 247, 255, 0.08)',
    borderRadius: '14px',
    border: '1px solid rgba(0, 247, 255, 0.25)',
    minWidth: '120px'
  };
  
  const stockCardGoldStyle = {
    padding: '15px 30px',
    background: 'rgba(255, 200, 0, 0.08)',
    borderRadius: '14px',
    border: '1px solid rgba(255, 200, 0, 0.25)',
    minWidth: '120px'
  };
  
  const stockLabelStyle = {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '13px',
    marginBottom: '6px',
    display: 'block'
  };
  
  const stockValueStyle = {
    color: '#00f7ff',
    fontSize: '28px',
    fontWeight: 'bold'
  };
  
  const stockValueGoldStyle = {
    color: '#ffc800',
    fontSize: '28px',
    fontWeight: 'bold'
  };
  
  const progressSectionStyle = {
    marginBottom: '50px'
  };
  
  const progressHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '15px',
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: '15px'
  };
  
  const countdownSectionStyle = {
    textAlign: 'center',
    marginBottom: '50px',
    padding: '50px 40px',
    background: 'rgba(0, 0, 0, 0.35)',
    borderRadius: '24px',
    border: '1px solid rgba(0, 247, 255, 0.1)'
  };
  
  const countdownTitleStyle = {
    color: '#00f7ff',
    fontSize: '20px',
    marginBottom: '30px',
    textTransform: 'uppercase',
    letterSpacing: '3px',
    fontWeight: '600'
  };
  
  const endedTextStyle = {
    fontSize: '56px',
    color: '#ff4444',
    fontWeight: 'bold',
    textShadow: '0 0 35px rgba(255, 68, 68, 0.5)'
  };
  
  const actionSectionStyle = {
    background: 'rgba(0, 0, 0, 0.25)',
    borderRadius: '24px',
    padding: '40px',
    border: '1px solid rgba(0, 247, 255, 0.08)'
  };
  
  const sliderWrapperStyle = {
    marginBottom: '30px',
    maxWidth: '500px',
    marginLeft: 'auto',
    marginRight: 'auto'
  };
  
  const purchaseBtnStyle = {
    width: '100%',
    padding: '22px',
    background: 'linear-gradient(135deg, #ff4444, #ff0066)',
    border: 'none',
    borderRadius: '16px',
    color: '#fff',
    fontSize: '22px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 0 35px rgba(255, 0, 102, 0.5), inset 0 2px 0 rgba(255,255,255,0.2)',
    transition: 'all 0.3s ease',
    letterSpacing: '1px'
  };
  
  const purchaseBtnDisabledStyle = {
    ...purchaseBtnStyle,
    background: 'rgba(100, 100, 100, 0.3)',
    cursor: 'not-allowed',
    boxShadow: 'none'
  };
  
  const statusMessageStyle = {
    marginTop: '20px',
    padding: '18px 24px',
    borderRadius: '14px',
    textAlign: 'center',
    fontSize: '15px',
    fontWeight: '500'
  };
  
  const emptyStateStyle = {
    textAlign: 'center',
    padding: '100px 60px',
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '32px',
    border: '1px solid rgba(0, 247, 255, 0.1)',
    marginBottom: '40px'
  };
  
  const emptyIconStyle = {
    fontSize: '80px',
    marginBottom: '25px'
  };
  
  const emptyTitleStyle = {
    color: '#fff',
    marginBottom: '12px',
    fontSize: '28px'
  };
  
  const emptyDescStyle = {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '16px'
  };
  
  const footerStyle = {
    textAlign: 'center',
    padding: '30px 0',
    color: 'rgba(255, 255, 255, 0.3)',
    fontSize: '13px'
  };
  
  const configPanelStyle = {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(15px)',
    borderRadius: '24px',
    padding: '40px',
    marginBottom: '40px',
    border: '1px solid rgba(0, 247, 255, 0.2)',
    animation: 'slideIn 0.4s ease'
  };
  
  const configTitleStyle = {
    color: '#00f7ff',
    marginBottom: '30px',
    fontSize: '24px',
    fontWeight: '600'
  };
  
  const configGridStyle = {
    display: 'grid',
    'grid-template-columns': 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px'
  };
  
  const formGroupStyle = {
    marginBottom: '5px'
  };
  
  const labelStyle = {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '13px',
    display: 'block',
    marginBottom: '8px',
    fontWeight: '500'
  };
  
  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(0, 247, 255, 0.3)',
    borderRadius: '12px',
    color: '#fff',
    outline: 'none',
    fontSize: '15px',
    transition: 'all 0.3s ease',
    boxSizing: 'border-box'
  };
  
  const createBtnStyle = {
    marginTop: '30px',
    width: '100%',
    padding: '18px',
    background: 'linear-gradient(135deg, #00f7ff, #0066ff)',
    border: 'none',
    borderRadius: '14px',
    color: '#fff',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 0 25px rgba(0, 247, 255, 0.4)',
    transition: 'all 0.3s ease'
  };
  
  return (
    <div style={containerStyle}>
      <ParticleBackground timeProgress={timeProgress} />
      
      <div style={mainWrapperStyle}>
        <header style={headerStyle}>
          <h1 style={titleStyle}>⚡ 闪购倒计时 ⚡</h1>
          <p style={subtitleStyle}>限时秒杀，手慢无！</p>
          
          <button
            onClick={() => setShowConfig(!showConfig())}
            style={configBtnStyle}
          >
            {showConfig() ? '关闭配置' : '⚙️ 配置活动'}
          </button>
        </header>
        
        {showConfig() && (
          <div style={configPanelStyle}>
            <h2 style={configTitleStyle}>创建新活动</h2>
            
            <div style={configGridStyle}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>活动名称</label>
                <input
                  type="text"
                  value={configForm().name}
                  onInput={(e) => setConfigForm({ ...configForm(), name: e.target.value })}
                  style={inputStyle}
                  placeholder="限时秒杀活动"
                />
              </div>
              
              <div style={formGroupStyle}>
                <label style={labelStyle}>商品名称</label>
                <input
                  type="text"
                  value={configForm().product_name}
                  onInput={(e) => setConfigForm({ ...configForm(), product_name: e.target.value })}
                  style={inputStyle}
                  placeholder="iPhone 15 Pro Max"
                />
              </div>
              
              <div style={formGroupStyle}>
                <label style={labelStyle}>商品图片URL（可选）</label>
                <input
                  type="text"
                  value={configForm().product_image}
                  onInput={(e) => setConfigForm({ ...configForm(), product_image: e.target.value })}
                  style={inputStyle}
                  placeholder="https://..."
                />
              </div>
              
              <div style={formGroupStyle}>
                <label style={labelStyle}>库存数量</label>
                <input
                  type="number"
                  value={configForm().total_stock}
                  onInput={(e) => setConfigForm({ ...configForm(), total_stock: parseInt(e.target.value) || 0 })}
                  style={inputStyle}
                />
              </div>
              
              <div style={formGroupStyle}>
                <label style={labelStyle}>原价</label>
                <input
                  type="number"
                  value={configForm().original_price}
                  onInput={(e) => setConfigForm({ ...configForm(), original_price: parseFloat(e.target.value) || 0 })}
                  style={inputStyle}
                />
              </div>
              
              <div style={formGroupStyle}>
                <label style={labelStyle}>秒杀价</label>
                <input
                  type="number"
                  value={configForm().sale_price}
                  onInput={(e) => setConfigForm({ ...configForm(), sale_price: parseFloat(e.target.value) || 0 })}
                  style={inputStyle}
                />
              </div>
              
              <div style={formGroupStyle}>
                <label style={labelStyle}>开始时间（毫秒时间戳）</label>
                <input
                  type="number"
                  value={configForm().start_time}
                  onInput={(e) => setConfigForm({ ...configForm(), start_time: parseInt(e.target.value) || Date.now() })}
                  style={inputStyle}
                />
              </div>
              
              <div style={formGroupStyle}>
                <label style={labelStyle}>结束时间（毫秒时间戳）</label>
                <input
                  type="number"
                  value={configForm().end_time}
                  onInput={(e) => setConfigForm({ ...configForm(), end_time: parseInt(e.target.value) || Date.now() + 3600000 })}
                  style={inputStyle}
                />
              </div>
            </div>
            
            <button
              onClick={handleCreateActivity}
              style={createBtnStyle}
            >
              创建活动
            </button>
          </div>
        )}
        
        {activity() ? (
          <div style={activityCardStyle}>
            <div style={productSectionStyle}>
              <div style={imageContainerStyle}>
                <div style={saleBadgeStyle}>秒杀</div>
                <img
                  src={activity().product_image || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=smartphone%20product%20photo%20white%20background&image_size=square_hd'}
                  alt={activity().product_name}
                  style={productImageStyle}
                />
              </div>
              
              <div style={productInfoStyle}>
                <h2 style={productTitleStyle}>{activity().name}</h2>
                
                <p style={productNameStyle}>{activity().product_name}</p>
                
                <div style={priceSectionStyle}>
                  <span style={salePriceStyle}>¥{activity().sale_price}</span>
                  <span style={originalPriceStyle}>¥{activity().original_price}</span>
                  <span style={discountBadgeStyle}>
                    省 ¥{activity().original_price - activity().sale_price}
                  </span>
                </div>
                
                <div style={stockSectionStyle}>
                  <div style={stockCardStyle}>
                    <span style={stockLabelStyle}>总库存</span>
                    <div style={stockValueStyle}>{activity().total_stock}</div>
                  </div>
                  
                  <div style={stockCardGoldStyle}>
                    <span style={stockLabelStyle}>剩余库存</span>
                    <div style={stockValueGoldStyle}>{activity().current_stock}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div style={progressSectionStyle}>
              <div style={progressHeaderStyle}>
                <span>{isPending() ? '活动即将开始' : isEnded() ? '活动已结束' : '活动进行中'}</span>
                <span>已完成 {Math.round(timeProgress() * 100)}%</span>
              </div>
              <NeonProgress progress={timeProgress() * 100} />
            </div>
            
            <div style={countdownSectionStyle}>
              <h3 style={countdownTitleStyle}>
                {isPending() ? '距离开始' : isEnded() ? '活动已结束' : '距离结束'}
              </h3>
              
              {!isEnded() ? (
                <CountdownTimer 
                  timeRemaining={isPending() ? (activity().start_time - Date.now()) : timeRemaining()} 
                />
              ) : (
                <div style={endedTextStyle}>已结束</div>
              )}
            </div>
            
            {isActive() && (
              <div style={actionSectionStyle}>
                <div style={sliderWrapperStyle}>
                  <SliderVerify onVerified={(token) => setSliderToken(token)} />
                </div>
                
                <button
                  onClick={handlePurchase}
                  disabled={!sliderToken() || isPurchasing() || activity().current_stock <= 0}
                  style={sliderToken() && !isPurchasing() && activity().current_stock > 0 ? purchaseBtnStyle : purchaseBtnDisabledStyle}
                >
                  {isPurchasing() ? '⏳ 抢购中...' : activity().current_stock <= 0 ? '已售罄' : '🔥 立即抢购'}
                </button>
                
                {purchaseStatus() && (
                  <div style={{
                    ...statusMessageStyle,
                    background: purchaseStatus().success ? 'rgba(0, 255, 100, 0.1)' : 'rgba(255, 68, 68, 0.1)',
                    border: `1px solid ${purchaseStatus().success ? 'rgba(0, 255, 100, 0.3)' : 'rgba(255, 68, 68, 0.3)'}`,
                    color: purchaseStatus().success ? '#00ff64' : '#ff4444'
                  }}>
                    {purchaseStatus().message}
                  </div>
                )}
              </div>
            )}
            
            {isPending() && (
              <div style={{
                textAlign: 'center',
                padding: '60px 40px',
                background: 'rgba(0, 247, 255, 0.05)',
                borderRadius: '24px',
                border: '1px solid rgba(0, 247, 255, 0.1)'
              }}>
                <div style={{ fontSize: '32px', color: '#00f7ff', marginBottom: '15px' }}>
                  🕐 活动即将开始
                </div>
                <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '16px' }}>
                  请耐心等待，准备好了再下手！
                </p>
              </div>
            )}
            
            {isEnded() && (
              <div style={{
                textAlign: 'center',
                padding: '60px 40px',
                background: 'rgba(255, 68, 68, 0.05)',
                borderRadius: '24px',
                border: '1px solid rgba(255, 68, 68, 0.1)'
              }}>
                <div style={{ fontSize: '32px', color: '#ff4444', marginBottom: '15px' }}>
                  ⏰ 活动已结束
                </div>
                <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '16px' }}>
                  感谢参与，请关注下一场活动！
                </p>
              </div>
            )}
          </div>
        ) : (
          <div style={emptyStateStyle}>
            <div style={emptyIconStyle}>🎯</div>
            <h2 style={emptyTitleStyle}>暂无活动</h2>
            <p style={emptyDescStyle}>
              点击上方「配置活动」按钮创建新的秒杀活动
            </p>
          </div>
        )}
        
        <footer style={footerStyle}>
          用户ID: {userId()} | 服务端口: 58743
        </footer>
      </div>
    </div>
  );
}

export default App;
