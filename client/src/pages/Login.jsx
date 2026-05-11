import { createSignal } from 'solid-js';
import { login } from '../api';

const Login = (props) => {
  const [phone, setPhone] = createSignal('');
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(phone());
      if (result.error) {
        setError(result.error);
      } else {
        if (props.onLogin) {
          props.onLogin(result.user, result.hasDrawn, result.coupon);
        }
      }
    } catch (err) {
      setError('登录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="login-container">
      <h2>手机号登录</h2>
      <form onSubmit={handleSubmit}>
        <div class="form-group">
          <label>请输入手机号</label>
          <input
            type="tel"
            value={phone()}
            onInput={(e) => setPhone(e.target.value)}
            placeholder="11位手机号码"
            maxLength={11}
            required
          />
        </div>
        {error() && <div class="status-message error">{error()}</div>}
        <button type="submit" class="btn btn-primary" disabled={loading()}>
          {loading() ? '登录中...' : '开始刮奖'}
        </button>
      </form>
    </div>
  );
};

export default Login;
