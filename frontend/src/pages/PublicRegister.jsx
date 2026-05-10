import { createSignal, createEffect } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import { api } from '../api.js';

const PublicRegister = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = createSignal(null);
  const [loading, setLoading] = createSignal(true);
  const [submitting, setSubmitting] = createSignal(false);
  const [success, setSuccess] = createSignal(false);
  const [error, setError] = createSignal('');
  
  const [formData, setFormData] = createSignal({
    user_name: '',
    phone: '',
    email: '',
    company: '',
    position: ''
  });

  createEffect(() => {
    (async () => {
      try {
        const data = await api.getActivity(params.id);
        setActivity(data);
      } catch (err) {
        setError('活动不存在或已结束');
      } finally {
        setLoading(false);
      }
    })();
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    try {
      await api.register(params.id, formData());
      setSuccess(true);
    } catch (err) {
      setError(err.message || '报名失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const progressPercent = () => {
    if (!activity()) return 0;
    return activity().max_participants > 0 
      ? (activity().current_participants / activity().max_participants * 100) 
      : 0;
  };

  const isFull = () => {
    if (!activity()) return false;
    return activity().current_participants >= activity().max_participants;
  };

  if (loading()) {
    return (
      <div class="public-register">
        <div class="empty-state">
          <div class="empty-icon">⏳</div>
          <div class="empty-text">加载中...</div>
        </div>
      </div>
    );
  }

  if (error() && !activity()) {
    return (
      <div class="public-register">
        <div class="empty-state">
          <div class="empty-icon">❌</div>
          <div class="empty-text">{error()}</div>
          <button 
            class="btn btn-primary" 
            style={{ marginTop: '20px' }}
            onClick={() => navigate('/activities')}
          >
            返回活动列表
          </button>
        </div>
      </div>
    );
  }

  if (success()) {
    return (
      <div class="public-register">
        <div class="success-container">
          <div class="success-icon">✓</div>
          <h2>报名成功！</h2>
          <p>您已成功报名参加「{activity()?.name}」</p>
          <p class="success-info">我们已收到您的报名信息，活动开始前会通过短信通知您。</p>
          <div class="success-actions">
            <button 
              class="btn btn-outline"
              onClick={() => {
                setSuccess(false);
                setFormData({
                  user_name: '',
                  phone: '',
                  email: '',
                  company: '',
                  position: ''
                });
              }}
            >
              继续报名
            </button>
            <button 
              class="btn btn-primary"
              onClick={() => navigate('/activities')}
            >
              返回活动列表
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div class="public-register">
      <div class="register-container">
        <div class="register-header">
          <button 
            class="btn btn-sm btn-outline back-btn"
            onClick={() => navigate('/activities')}
          >
            ← 返回
          </button>
        </div>

        <div class="activity-info-card">
          <h1 class="activity-title">{activity()?.name}</h1>
          
          <div class="activity-meta">
            <div class="meta-item">
              <span class="meta-icon">📍</span>
              <span class="meta-text">{activity()?.location}</span>
            </div>
            <div class="meta-item">
              <span class="meta-icon">📅</span>
              <span class="meta-text">{activity()?.start_time}</span>
            </div>
            <div class="meta-item">
              <span class="meta-icon">⏰</span>
              <span class="meta-text">至 {activity()?.end_time}</span>
            </div>
          </div>

          {activity()?.description && (
            <div class="activity-desc">
              <p>{activity()?.description}</p>
            </div>
          )}

          <div class="progress-section">
            <div class="progress-header">
              <span>报名进度</span>
              <span class={isFull() ? 'full' : ''}>
                {activity()?.current_participants}/{activity()?.max_participants} 人
              </span>
            </div>
            <div class="progress-bar-lg">
              <div 
                class="progress-fill-lg" 
                style={{ width: `${Math.min(progressPercent(), 100)}%` }}
              />
            </div>
            {isFull() && (
              <div class="full-notice">
                <span>⚠️ 名额已满</span>
              </div>
            )}
          </div>
        </div>

        {!isFull() && (
          <div class="register-form-card">
            <h2 class="form-title">填写报名信息</h2>
            
            {error() && (
              <div class="error-alert">
                {error()}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label required">姓名</label>
                  <input 
                    type="text" 
                    class="form-input-lg" 
                    required
                    value={formData().user_name}
                    onInput={(e) => handleChange('user_name', e.target.value)}
                    placeholder="请输入您的姓名"
                  />
                </div>

                <div class="form-group">
                  <label class="form-label required">手机号</label>
                  <input 
                    type="tel" 
                    class="form-input-lg" 
                    required
                    value={formData().phone}
                    onInput={(e) => handleChange('phone', e.target.value)}
                    placeholder="请输入手机号"
                  />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">邮箱</label>
                <input 
                  type="email" 
                  class="form-input-lg" 
                  value={formData().email}
                  onInput={(e) => handleChange('email', e.target.value)}
                  placeholder="请输入邮箱（选填）"
                />
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">公司</label>
                  <input 
                    type="text" 
                    class="form-input-lg" 
                    value={formData().company}
                    onInput={(e) => handleChange('company', e.target.value)}
                    placeholder="请输入公司名称（选填）"
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">职位</label>
                  <input 
                    type="text" 
                    class="form-input-lg" 
                    value={formData().position}
                    onInput={(e) => handleChange('position', e.target.value)}
                    placeholder="请输入职位（选填）"
                  />
                </div>
              </div>

              <div class="submit-section">
                <button 
                  type="submit" 
                  class="btn btn-primary btn-lg"
                  disabled={submitting()}
                >
                  {submitting() ? '提交中...' : '确认报名'}
                </button>
                <p class="submit-tip">
                  点击「确认报名」即表示您同意活动相关条款和隐私政策
                </p>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicRegister;
