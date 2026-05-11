import { createSignal } from 'solid-js';
import ScratchCard from '../components/ScratchCard.jsx';
import { draw } from '../api';

const ScratchCardPage = (props) => {
  const [localHasDrawn, setLocalHasDrawn] = createSignal(props.hasDrawn);
  const [localIsWinner, setLocalIsWinner] = createSignal(!!props.coupon);
  const [localCoupon, setLocalCoupon] = createSignal(props.coupon);
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal('');

  const handleStartDraw = async () => {
    if (!props.user || localHasDrawn()) return;

    setLoading(true);
    setError('');

    try {
      const result = await draw(props.user.id, props.user.phone);
      
      if (result.error) {
        setError(result.error);
      } else {
        setLocalHasDrawn(true);
        setLocalIsWinner(result.isWinner);
        setLocalCoupon(result.coupon);
        if (props.onDraw) {
          props.onDraw(result.isWinner, result.coupon);
        }
      }
    } catch (err) {
      setError('抽奖失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleReveal = () => {
  };

  return (
    <div class="scratch-container">
      {props.user && <div class="user-info">欢迎，手机号: {props.user.phone}</div>}
      
      {!localHasDrawn() ? (
        <div class="login-container" style={{ textAlign: 'center' }}>
          <h2>🎰 刮刮卡抽奖</h2>
          <p style={{ marginBottom: '2rem', color: '#666' }}>
            每位用户仅限刮奖一次，祝您好运！
          </p>
          
          {error() && <div class="status-message error">{error()}</div>}
          
          <button 
            class="btn btn-primary" 
            onClick={handleStartDraw}
            disabled={loading()}
          >
            {loading() ? '抽奖中...' : '开始刮奖'}
          </button>
        </div>
      ) : (
        <>
          <div class="hint-text">刮开涂层查看结果</div>
          <ScratchCard 
            isWinner={localIsWinner()} 
            coupon={localCoupon()}
            onReveal={handleReveal}
          />
        </>
      )}
    </div>
  );
};

export default ScratchCardPage;
