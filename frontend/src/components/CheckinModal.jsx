import { createSignal, createMemo } from 'solid-js';

const CheckinModal = ({ registrations, onCheckin, onClose }) => {
  const [searchTerm, setSearchTerm] = createSignal('');
  const [filterType, setFilterType] = createSignal('all');

  const statusText = (status) => {
    const map = {
      registered: '待签到',
      checked_in: '已签到',
      checked_out: '已签退',
      absent: '缺席'
    };
    return map[status] || status;
  };

  const statusBadgeClass = (status) => {
    const map = {
      registered: 'badge-pending',
      checked_in: 'badge-success',
      checked_out: 'badge-completed',
      absent: 'badge-danger'
    };
    return map[status] || 'badge';
  };

  const canCheckin = (status) => status === 'registered';
  const canCheckout = (status) => status === 'checked_in';
  const canMarkAbsent = (status) => status === 'registered';
  const canRevert = (status) => ['checked_in', 'checked_out', 'absent'].includes(status);

  const filteredRegistrations = createMemo(() => {
    let list = registrations;
    
    if (filterType() === 'pending') {
      list = list.filter(r => r.status === 'registered');
    } else if (filterType() === 'checked_in') {
      list = list.filter(r => r.status === 'checked_in');
    } else if (filterType() === 'checked_out') {
      list = list.filter(r => r.status === 'checked_out');
    } else if (filterType() === 'absent') {
      list = list.filter(r => r.status === 'absent');
    }
    
    if (searchTerm()) {
      const term = searchTerm().toLowerCase();
      list = list.filter(r => 
        r.user_name.toLowerCase().includes(term) || 
        r.phone.includes(term) ||
        (r.company && r.company.toLowerCase().includes(term))
      );
    }
    
    return list;
  });

  const stats = createMemo(() => {
    const total = registrations.length;
    const pending = registrations.filter(r => r.status === 'registered').length;
    const checkedIn = registrations.filter(r => r.status === 'checked_in').length;
    const checkedOut = registrations.filter(r => r.status === 'checked_out').length;
    const absent = registrations.filter(r => r.status === 'absent').length;
    
    return { total, pending, checkedIn, checkedOut, absent };
  });

  return (
    <div class="modal-overlay checkin-modal" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div class="modal modal-lg">
        <div class="modal-header">
          <h2 class="modal-title">线下核销管理</h2>
          <button class="modal-close" onClick={onClose}>&times;</button>
        </div>
        
        <div class="modal-body">
          <div class="checkin-stats">
            <div class="stat-item">
              <span class="stat-value">{stats().total}</span>
              <span class="stat-label">总报名</span>
            </div>
            <div class="stat-item pending">
              <span class="stat-value">{stats().pending}</span>
              <span class="stat-label">待签到</span>
            </div>
            <div class="stat-item checked-in">
              <span class="stat-value">{stats().checkedIn}</span>
              <span class="stat-label">已签到</span>
            </div>
            <div class="stat-item checked-out">
              <span class="stat-value">{stats().checkedOut}</span>
              <span class="stat-label">已签退</span>
            </div>
            <div class="stat-item absent">
              <span class="stat-value">{stats().absent}</span>
              <span class="stat-label">缺席</span>
            </div>
          </div>

          <div class="checkin-controls">
            <div class="filter-tabs">
              <button 
                class={`filter-tab ${filterType() === 'all' ? 'active' : ''}`}
                onClick={() => setFilterType('all')}
              >
                全部
              </button>
              <button 
                class={`filter-tab ${filterType() === 'pending' ? 'active' : ''}`}
                onClick={() => setFilterType('pending')}
              >
                待签到
              </button>
              <button 
                class={`filter-tab ${filterType() === 'checked_in' ? 'active' : ''}`}
                onClick={() => setFilterType('checked_in')}
              >
                已签到
              </button>
              <button 
                class={`filter-tab ${filterType() === 'absent' ? 'active' : ''}`}
                onClick={() => setFilterType('absent')}
              >
                缺席
              </button>
            </div>
            
            <div class="search-box">
              <input 
                type="text" 
                class="form-input" 
                placeholder="🔍 搜索姓名、手机号、公司..."
                value={searchTerm()}
                onInput={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div class="checkin-list">
            {filteredRegistrations().length === 0 ? (
              <div class="empty-state">
                <div class="empty-icon">📋</div>
                <div class="empty-text">暂无符合条件的用户</div>
              </div>
            ) : (
              filteredRegistrations().map(r => (
                <div class="checkin-item checkin-item-lg">
                  <div class="checkin-info">
                    <div class="checkin-header">
                      <h4>{r.user_name}</h4>
                      <span class={`badge ${statusBadgeClass(r.status)}`}>
                        {statusText(r.status)}
                      </span>
                    </div>
                    <div class="checkin-meta">
                      <span>📱 {r.phone}</span>
                      {r.company && <span>🏢 {r.company}</span>}
                      {r.position && <span>💼 {r.position}</span>}
                    </div>
                    {r.checkin_time && (
                      <div class="checkin-times">
                        <span>签到: {r.checkin_time}</span>
                        {r.checkout_time && <span>签退: {r.checkout_time}</span>}
                      </div>
                    )}
                  </div>
                  <div class="checkin-actions">
                    {canCheckin(r.status) && (
                      <button 
                        class="btn btn-primary btn-sm"
                        onClick={() => onCheckin(r.id, 'checkin')}
                      >
                        签到
                      </button>
                    )}
                    {canCheckout(r.status) && (
                      <button 
                        class="btn btn-secondary btn-sm"
                        onClick={() => onCheckin(r.id, 'checkout')}
                      >
                        签退
                      </button>
                    )}
                    {canMarkAbsent(r.status) && (
                      <button 
                        class="btn btn-danger btn-sm"
                        onClick={() => onCheckin(r.id, 'absent')}
                      >
                        标记缺席
                      </button>
                    )}
                    {canRevert(r.status) && (
                      <button 
                        class="btn btn-outline btn-sm"
                        onClick={() => onCheckin(r.id, 'revert')}
                      >
                        重置
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        <div class="modal-footer">
          <button type="button" class="btn btn-outline" onClick={onClose}>关闭</button>
        </div>
      </div>
    </div>
  );
};

export default CheckinModal;
