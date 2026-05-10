import { createSignal, createEffect, onCleanup, createMemo } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import { api } from '../api.js';
import Toast from '../components/Toast.jsx';
import RegistrationForm from '../components/RegistrationForm.jsx';
import CheckinModal from '../components/CheckinModal.jsx';
import ROIForm from '../components/ROIForm.jsx';
import PieChart from '../components/PieChart.jsx';
import BarChart from '../components/BarChart.jsx';

const ActivityDetail = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = createSignal(null);
  const [stats, setStats] = createSignal(null);
  const [segments, setSegments] = createSignal(null);
  const [roi, setROI] = createSignal(null);
  const [registrations, setRegistrations] = createSignal([]);
  const [interactions, setInteractions] = createSignal([]);
  const [activeTab, setActiveTab] = createSignal('overview');
  const [loading, setLoading] = createSignal(true);
  const [showRegisterModal, setShowRegisterModal] = createSignal(false);
  const [showCheckinModal, setShowCheckinModal] = createSignal(false);
  const [showROIModal, setShowROIModal] = createSignal(false);
  const [toast, setToast] = createSignal({ show: false, message: '', type: 'success' });
  const [searchTerm, setSearchTerm] = createSignal('');
  const [filterStatus, setFilterStatus] = createSignal('all');
  let refreshInterval = null;

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const loadData = async () => {
    try {
      const [activityData, statsData, segmentsData, roiData, registrationsData, interactionsData] = await Promise.all([
        api.getActivity(params.id),
        api.getActivityStats(params.id),
        api.getUserSegments(params.id),
        api.getROI(params.id),
        api.getRegistrations(params.id),
        api.getInteractions(params.id)
      ]);
      
      setActivity(activityData);
      setStats(statsData);
      setSegments(segmentsData);
      setROI(roiData);
      setRegistrations(registrationsData);
      setInteractions(interactionsData);
    } catch (err) {
      showToast('加载数据失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (data) => {
    try {
      await api.register(params.id, data);
      showToast('报名成功');
      setShowRegisterModal(false);
      loadData();
    } catch (err) {
      showToast(err.message || '报名失败', 'error');
    }
  };

  const handleCheckinAction = async (registrationId, actionType) => {
    try {
      let message = '';
      
      if (actionType === 'checkin') {
        await api.checkin(registrationId);
        message = '签到成功';
      } else if (actionType === 'checkout') {
        await api.checkout(registrationId);
        message = '签退成功';
      } else if (actionType === 'absent') {
        if (!confirm('确认标记为缺席？')) return;
        await api.markAbsent(registrationId);
        message = '已标记缺席';
      } else if (actionType === 'revert') {
        if (!confirm('确认重置状态？')) return;
        await api.revertStatus(registrationId);
        message = '状态已重置';
      }
      
      showToast(message);
      loadData();
    } catch (err) {
      showToast(err.message || '操作失败', 'error');
    }
  };

  const handleCheckin = async (registrationId) => {
    try {
      await api.checkin(registrationId);
      showToast('签到成功');
      loadData();
    } catch (err) {
      showToast(err.message || '签到失败', 'error');
    }
  };

  const handleCheckout = async (registrationId) => {
    try {
      await api.checkout(registrationId);
      showToast('签退成功');
      loadData();
    } catch (err) {
      showToast(err.message || '签退失败', 'error');
    }
  };

  const handleAbsent = async (registrationId) => {
    if (!confirm('确认标记为缺席？')) return;
    try {
      await api.markAbsent(registrationId);
      showToast('已标记缺席');
      loadData();
    } catch (err) {
      showToast(err.message || '操作失败', 'error');
    }
  };

  const handleUpdateROI = async (data) => {
    try {
      await api.updateROI(params.id, data);
      showToast('ROI数据更新成功');
      setShowROIModal(false);
      loadData();
    } catch (err) {
      showToast(err.message || '更新失败', 'error');
    }
  };

  const handleAddInteraction = async (registrationId, type) => {
    try {
      await api.addInteraction(params.id, {
        registration_id: registrationId,
        type,
        content: `用户互动: ${type}`
      });
      showToast('互动记录已添加');
      loadData();
    } catch (err) {
      showToast('添加失败', 'error');
    }
  };

  const filteredRegistrations = () => {
    return registrations().filter(r => {
      const matchesSearch = r.user_name.includes(searchTerm()) || 
                            r.phone.includes(searchTerm());
      const matchesStatus = filterStatus() === 'all' || 
                            r.display_status === filterStatus() ||
                            r.status === filterStatus();
      return matchesSearch && matchesStatus;
    });
  };

  const getStatusDisplay = (r) => {
    if (r.checkout_time) return { text: '已完成', class: 'completed' };
    if (r.checkin_time) return { text: '已签到', class: 'checked_in' };
    if (r.status === 'absent') return { text: '缺席', class: 'absent' };
    return { text: '已报名', class: 'registered' };
  };

  const progressPercent = () => {
    if (!activity()) return 0;
    return activity().max_participants > 0 
      ? (activity().current_participants / activity().max_participants * 100) 
      : 0;
  };

  const totalUsers = () => {
    if (!segments()) return 0;
    return (segments().highly_engaged || 0) + 
           (segments().moderately_engaged || 0) + 
           (segments().lightly_engaged || 0) + 
           (segments().passive || 0);
  };

  createEffect(() => {
    loadData();
    refreshInterval = setInterval(loadData, 10000);
    onCleanup(() => {
      if (refreshInterval) clearInterval(refreshInterval);
    });
  });

  if (loading()) {
    return (
      <div class="empty-state">
        <div class="empty-icon">⏳</div>
        <div class="empty-text">加载中...</div>
      </div>
    );
  }

  return (
    <div>
      <div class="page-header">
        <div>
          <button 
            class="btn btn-sm btn-outline" 
            style={{ marginBottom: '8px' }}
            onClick={() => navigate('/activities')}
          >
            ← 返回列表
          </button>
          <h1 class="page-title">{activity()?.name}</h1>
          <div style={{ marginTop: '8px', display: 'flex', gap: '16px', color: 'var(--text-secondary)', fontSize: '14px' }}>
            <span>📍 {activity()?.location}</span>
            <span>📅 {activity()?.start_time}</span>
            <span class={`status-badge status-${activity()?.status}`}>
              {activity()?.status === 'active' ? '进行中' : activity()?.status === 'completed' ? '已结束' : '草稿'}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button class="btn btn-primary" onClick={() => setShowRegisterModal(true)}>
            + 线上报名
          </button>
          <button class="btn btn-secondary" onClick={() => setShowCheckinModal(true)}>
            📱 线下核销
          </button>
          <button 
            class="btn btn-outline"
            onClick={() => {
              const link = `${window.location.origin}/register/${params.id}`;
              navigator.clipboard.writeText(link).then(() => {
                showToast('报名链接已复制');
              }).catch(() => {
                showToast('复制失败，请手动复制', 'error');
              });
            }}
          >
            🔗 复制报名链接
          </button>
          <button class="btn btn-outline" onClick={() => setShowROIModal(true)}>
            💰 ROI设置
          </button>
        </div>
      </div>

      <div class="cards-grid">
        <div class="card">
          <div class="card-icon primary">👥</div>
          <div class="card-title">报名人数</div>
          <div class="card-value">{stats()?.totalRegistrations || 0}</div>
        </div>
        <div class="card">
          <div class="card-icon secondary">✅</div>
          <div class="card-title">已签到</div>
          <div class="card-value">{stats()?.checkedIn || 0}</div>
        </div>
        <div class="card">
          <div class="card-icon warning">⏳</div>
          <div class="card-title">待签到</div>
          <div class="card-value">{stats()?.registered || 0}</div>
        </div>
        <div class="card">
          <div class="card-icon danger">❌</div>
          <div class="card-title">缺席</div>
          <div class="card-value">{stats()?.absent || 0}</div>
        </div>
      </div>

      <div class="card" style={{ marginBottom: '24px' }}>
        <div class="card-title" style={{ marginBottom: '12px' }}>报名进度</div>
        <div class="progress-container">
          <div class="progress-bar">
            <div class="progress-fill" style={{ width: `${Math.min(progressPercent(), 100)}%` }} />
          </div>
          <div class="progress-text">
            <span>{activity()?.current_participants} / {activity()?.max_participants}</span>
            <span>{progressPercent().toFixed(1)}%</span>
          </div>
        </div>
      </div>

      <div class="tabs">
        <button 
          class={`tab-item ${activeTab() === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          总览
        </button>
        <button 
          class={`tab-item ${activeTab() === 'registrations' ? 'active' : ''}`}
          onClick={() => setActiveTab('registrations')}
        >
          报名管理
        </button>
        <button 
          class={`tab-item ${activeTab() === 'interactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('interactions')}
        >
          互动数据
        </button>
        <button 
          class={`tab-item ${activeTab() === 'roi' ? 'active' : ''}`}
          onClick={() => setActiveTab('roi')}
        >
          ROI分析
        </button>
      </div>

      {activeTab() === 'overview' && (
        <div>
          <div class="charts-grid">
            <div class="chart-card">
              <PieChart
                data={[
                  segments()?.highly_engaged || 0,
                  segments()?.moderately_engaged || 0,
                  segments()?.lightly_engaged || 0,
                  segments()?.passive || 0
                ]}
                labels={['高度活跃', '中度活跃', '轻度活跃', '被动用户']}
                colors={['#43e97b', '#4facfe', '#f093fb', '#f5576c']}
                title="用户参与分层"
              />
            </div>

            <div class="chart-card">
              <PieChart
                data={[
                  stats()?.checkedIn || 0,
                  stats()?.checkedOut || 0,
                  stats()?.registered || 0,
                  stats()?.absent || 0
                ]}
                labels={['已签到', '已完成', '待签到', '缺席']}
                colors={['#43e97b', '#4facfe', '#f093fb', '#f5576c']}
                title="签到状态分布"
              />
            </div>
          </div>

          <div class="charts-grid" style={{ marginTop: '24px' }}>
            <div class="chart-card">
              <BarChart
                data={[
                  segments()?.highly_engaged || 0,
                  segments()?.moderately_engaged || 0,
                  segments()?.lightly_engaged || 0,
                  segments()?.passive || 0
                ]}
                labels={['高度活跃', '中度活跃', '轻度活跃', '被动用户']}
                colors={[
                  'rgba(67, 233, 123, 0.8)',
                  'rgba(79, 172, 254, 0.8)',
                  'rgba(240, 147, 251, 0.8)',
                  'rgba(245, 87, 108, 0.8)'
                ]}
                title="用户分层柱状图"
              />
            </div>

            <div class="chart-card">
              <div class="chart-title">签到指标概览</div>
              <div class="stats-grid-2x2">
                <div class="stat-box success">
                  <div class="stat-box-value">
                    {stats()?.totalRegistrations > 0 
                      ? ((stats()?.checkedIn / stats()?.totalRegistrations) * 100).toFixed(1) 
                      : 0}%
                  </div>
                  <div class="stat-box-label">签到率</div>
                </div>
                <div class="stat-box danger">
                  <div class="stat-box-value">
                    {stats()?.totalRegistrations > 0 
                      ? ((stats()?.absent / stats()?.totalRegistrations) * 100).toFixed(1) 
                      : 0}%
                  </div>
                  <div class="stat-box-label">缺席率</div>
                </div>
                <div class="stat-box primary">
                  <div class="stat-box-value">
                    {stats()?.totalRegistrations > 0 
                      ? ((stats()?.checkedOut / stats()?.totalRegistrations) * 100).toFixed(1) 
                      : 0}%
                  </div>
                  <div class="stat-box-label">完成率</div>
                </div>
                <div class="stat-box warning">
                  <div class="stat-box-value">{totalUsers() || 0}</div>
                  <div class="stat-box-label">总用户数</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab() === 'registrations' && (
        <div>
          <div class="filter-bar">
            <input 
              type="text" 
              class="form-input" 
              placeholder="搜索姓名或手机号..."
              value={searchTerm()}
              onInput={(e) => setSearchTerm(e.target.value)}
            />
            <select 
              class="form-select" 
              value={filterStatus()}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">全部状态</option>
              <option value="registered">已报名</option>
              <option value="checked_in">已签到</option>
              <option value="completed">已完成</option>
              <option value="absent">缺席</option>
            </select>
          </div>

          <div class="tables-container">
            <table>
              <thead>
                <tr>
                  <th>姓名</th>
                  <th>手机号</th>
                  <th>公司</th>
                  <th>职位</th>
                  <th>互动次数</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredRegistrations().length === 0 ? (
                  <tr>
                    <td colSpan="7">
                      <div class="empty-state">
                        <div class="empty-icon">📭</div>
                        <div class="empty-text">暂无报名记录</div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRegistrations().map(r => {
                    const status = getStatusDisplay(r);
                    return (
                      <tr>
                        <td>{r.user_name}</td>
                        <td>{r.phone}</td>
                        <td>{r.company || '-'}</td>
                        <td>{r.position || '-'}</td>
                        <td>{r.interaction_count}</td>
                        <td>
                          <span class={`status-badge status-${status.class}`}>
                            {status.text}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {!r.checkin_time && r.status !== 'absent' && (
                              <>
                                <button 
                                  class="btn btn-sm btn-secondary"
                                  onClick={() => handleCheckin(r.id)}
                                >
                                  签到
                                </button>
                                <button 
                                  class="btn btn-sm btn-warning"
                                  onClick={() => handleAbsent(r.id)}
                                >
                                  缺席补录
                                </button>
                              </>
                            )}
                            {r.checkin_time && !r.checkout_time && (
                              <button 
                                class="btn btn-sm btn-primary"
                                onClick={() => handleCheckout(r.id)}
                              >
                                签退
                              </button>
                            )}
                            {r.checkin_time && (
                              <>
                                <button 
                                  class="btn btn-sm btn-outline"
                                  onClick={() => handleAddInteraction(r.id, 'question')}
                                  title="提问"
                                >
                                  ❓
                                </button>
                                <button 
                                  class="btn btn-sm btn-outline"
                                  onClick={() => handleAddInteraction(r.id, 'vote')}
                                  title="投票"
                                >
                                  🗳️
                                </button>
                                <button 
                                  class="btn btn-sm btn-outline"
                                  onClick={() => handleAddInteraction(r.id, 'comment')}
                                  title="评论"
                                >
                                  💬
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab() === 'interactions' && (
        <div class="tables-container">
          <table>
            <thead>
              <tr>
                <th>时间</th>
                <th>用户</th>
                <th>互动类型</th>
                <th>内容</th>
              </tr>
            </thead>
            <tbody>
              {interactions().length === 0 ? (
                <tr>
                  <td colSpan="4">
                    <div class="empty-state">
                      <div class="empty-icon">💭</div>
                      <div class="empty-text">暂无互动数据</div>
                    </div>
                  </td>
                </tr>
              ) : (
                interactions().map(i => (
                  <tr>
                    <td>{i.created_at}</td>
                    <td>{i.user_name || '匿名用户'}</td>
                    <td>
                      <span class="status-badge status-primary">
                        {i.type === 'question' ? '提问' : 
                         i.type === 'vote' ? '投票' : 
                         i.type === 'comment' ? '评论' : i.type}
                      </span>
                    </td>
                    <td>{i.content || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab() === 'roi' && (
        <div>
          <div class="roi-summary">
            <div class="roi-item">
              <div class="roi-label">投入预算</div>
              <div class="roi-value">¥{roi()?.actualCost?.toLocaleString() || 0}</div>
            </div>
            <div class="roi-item">
              <div class="roi-label">实际收益</div>
              <div class="roi-value">¥{roi()?.actualRevenue?.toLocaleString() || 0}</div>
            </div>
            <div class="roi-item">
              <div class="roi-label">ROI</div>
              <div class={`roi-value ${roi()?.roi >= 0 ? 'roi-positive' : 'roi-negative'}`}>
                {roi()?.roi?.toFixed(1) || 0}%
              </div>
            </div>
            <div class="roi-item">
              <div class="roi-label">转化率</div>
              <div class="roi-value roi-positive">{roi()?.conversionRate?.toFixed(1) || 0}%</div>
            </div>
          </div>

          <div class="cards-grid">
            <div class="card">
              <div class="card-icon primary">👥</div>
              <div class="card-title">实际参会</div>
              <div class="card-value">{roi()?.actualAttendees || 0}</div>
            </div>
            <div class="card">
              <div class="card-icon secondary">🎯</div>
              <div class="card-title">新增线索</div>
              <div class="card-value">{roi()?.newLeads || 0}</div>
            </div>
            <div class="card">
              <div class="card-icon warning">✅</div>
              <div class="card-title">转化客户</div>
              <div class="card-value">{roi()?.conversions || 0}</div>
            </div>
            <div class="card">
              <div class="card-icon danger">💬</div>
              <div class="card-title">互动总数</div>
              <div class="card-value">{roi()?.totalInteractions || 0}</div>
            </div>
          </div>
        </div>
      )}

      {showRegisterModal() && (
        <RegistrationForm
          activityId={params.id}
          onSubmit={handleRegister}
          onClose={() => setShowRegisterModal(false)}
        />
      )}

      {showCheckinModal() && (
        <CheckinModal
          registrations={registrations()}
          onCheckin={handleCheckinAction}
          onClose={() => setShowCheckinModal(false)}
        />
      )}

      {showROIModal() && (
        <ROIForm
          roi={roi()}
          onSubmit={handleUpdateROI}
          onClose={() => setShowROIModal(false)}
        />
      )}

      {toast().show && <Toast message={toast().message} type={toast().type} />}
    </div>
  );
};

export default ActivityDetail;
