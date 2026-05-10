import { createSignal } from 'solid-js';

const ROIForm = ({ roi, onSubmit, onClose }) => {
  const [formData, setFormData] = createSignal({
    actual_revenue: roi?.actualRevenue || 0,
    marketing_cost: roi?.marketingCost || 0,
    new_leads: roi?.newLeads || 0,
    conversions: roi?.conversions || 0
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
          <h2 class="modal-title">ROI 数据设置</h2>
          <button class="modal-close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">实际收益 (¥)</label>
              <input 
                type="number" 
                class="form-input" 
                min="0"
                value={formData().actual_revenue}
                onInput={(e) => handleChange('actual_revenue', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div class="form-group">
              <label class="form-label">营销成本 (¥)</label>
              <input 
                type="number" 
                class="form-input" 
                min="0"
                value={formData().marketing_cost}
                onInput={(e) => handleChange('marketing_cost', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div class="form-group">
              <label class="form-label">新增线索数</label>
              <input 
                type="number" 
                class="form-input" 
                min="0"
                value={formData().new_leads}
                onInput={(e) => handleChange('new_leads', parseInt(e.target.value) || 0)}
              />
            </div>

            <div class="form-group">
              <label class="form-label">转化客户数</label>
              <input 
                type="number" 
                class="form-input" 
                min="0"
                value={formData().conversions}
                onInput={(e) => handleChange('conversions', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-outline" onClick={onClose}>取消</button>
            <button type="submit" class="btn btn-primary">保存</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ROIForm;
