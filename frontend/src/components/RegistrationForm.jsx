import { createSignal } from 'solid-js';

const RegistrationForm = ({ onSubmit, onClose }) => {
  const [formData, setFormData] = createSignal({
    user_name: '',
    phone: '',
    email: '',
    company: '',
    position: ''
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData());
  };

  return (
    <div class="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">线上报名</h2>
          <button class="modal-close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">姓名 *</label>
              <input 
                type="text" 
                class="form-input" 
                required
                value={formData().user_name}
                onInput={(e) => handleChange('user_name', e.target.value)}
                placeholder="请输入姓名"
              />
            </div>

            <div class="form-group">
              <label class="form-label">手机号 *</label>
              <input 
                type="tel" 
                class="form-input" 
                required
                value={formData().phone}
                onInput={(e) => handleChange('phone', e.target.value)}
                placeholder="请输入手机号"
              />
            </div>

            <div class="form-group">
              <label class="form-label">邮箱</label>
              <input 
                type="email" 
                class="form-input" 
                value={formData().email}
                onInput={(e) => handleChange('email', e.target.value)}
                placeholder="请输入邮箱"
              />
            </div>

            <div class="form-group">
              <label class="form-label">公司</label>
              <input 
                type="text" 
                class="form-input" 
                value={formData().company}
                onInput={(e) => handleChange('company', e.target.value)}
                placeholder="请输入公司名称"
              />
            </div>

            <div class="form-group">
              <label class="form-label">职位</label>
              <input 
                type="text" 
                class="form-input" 
                value={formData().position}
                onInput={(e) => handleChange('position', e.target.value)}
                placeholder="请输入职位"
              />
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-outline" onClick={onClose}>取消</button>
            <button type="submit" class="btn btn-primary">确认报名</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;
