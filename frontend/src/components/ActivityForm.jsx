import { createSignal } from 'solid-js';

const ActivityForm = ({ activity, onSubmit, onClose }) => {
  const isEdit = !!activity;
  const [formData, setFormData] = createSignal({
    name: activity?.name || '',
    description: activity?.description || '',
    location: activity?.location || '',
    start_time: activity?.start_time ? activity.start_time.slice(0, 16) : '',
    end_time: activity?.end_time ? activity.end_time.slice(0, 16) : '',
    max_participants: activity?.max_participants || 100,
    budget: activity?.budget || 0,
    expected_revenue: activity?.expected_revenue || 0,
    status: activity?.status || 'draft'
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
          <h2 class="modal-title">{isEdit ? '编辑活动' : '新建活动'}</h2>
          <button class="modal-close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">活动名称 *</label>
              <input 
                type="text" 
                class="form-input" 
                required
                value={formData().name}
                onInput={(e) => handleChange('name', e.target.value)}
                placeholder="请输入活动名称"
              />
            </div>

            <div class="form-group">
              <label class="form-label">活动描述</label>
              <textarea 
                class="form-textarea"
                value={formData().description}
                onInput={(e) => handleChange('description', e.target.value)}
                placeholder="请输入活动描述"
              />
            </div>

            <div class="form-group">
              <label class="form-label">活动地点 *</label>
              <input 
                type="text" 
                class="form-input" 
                required
                value={formData().location}
                onInput={(e) => handleChange('location', e.target.value)}
                placeholder="请输入活动地点"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div class="form-group">
                <label class="form-label">开始时间 *</label>
                <input 
                  type="datetime-local" 
                  class="form-input" 
                  required
                  value={formData().start_time}
                  onInput={(e) => handleChange('start_time', e.target.value)}
                />
              </div>
              <div class="form-group">
                <label class="form-label">结束时间 *</label>
                <input 
                  type="datetime-local" 
                  class="form-input" 
                  required
                  value={formData().end_time}
                  onInput={(e) => handleChange('end_time', e.target.value)}
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">最大参与人数</label>
              <input 
                type="number" 
                class="form-input" 
                min="1"
                value={formData().max_participants}
                onInput={(e) => handleChange('max_participants', parseInt(e.target.value) || 0)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div class="form-group">
                <label class="form-label">预算 (¥)</label>
                <input 
                  type="number" 
                  class="form-input" 
                  min="0"
                  value={formData().budget}
                  onInput={(e) => handleChange('budget', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div class="form-group">
                <label class="form-label">预期收益 (¥)</label>
                <input 
                  type="number" 
                  class="form-input" 
                  min="0"
                  value={formData().expected_revenue}
                  onInput={(e) => handleChange('expected_revenue', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            {isEdit && (
              <div class="form-group">
                <label class="form-label">活动状态</label>
                <select 
                  class="form-select"
                  value={formData().status}
                  onChange={(e) => handleChange('status', e.target.value)}
                >
                  <option value="draft">草稿</option>
                  <option value="active">进行中</option>
                  <option value="completed">已结束</option>
                </select>
              </div>
            )}
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-outline" onClick={onClose}>取消</button>
            <button type="submit" class="btn btn-primary">{isEdit ? '保存' : '创建'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ActivityForm;
