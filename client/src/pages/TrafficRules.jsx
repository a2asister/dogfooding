import { createSignal, onMount } from 'solid-js'
import { api } from '../services/api.js'

export default function TrafficRules() {
  const [rules, setRules] = createSignal([])
  const [logs, setLogs] = createSignal([])
  const [showAddModal, setShowAddModal] = createSignal(false)
  const [newRule, setNewRule] = createSignal({ name: '', description: '' })
  const [loading, setLoading] = createSignal(true)

  const loadData = async () => {
    setLoading(true)
    try {
      const [rulesResult, logsResult] = await Promise.all([
        api.getTrafficRules(),
        api.getAuditLogs()
      ])
      if (rulesResult.success) setRules(rulesResult.data)
      if (logsResult.success) setLogs(logsResult.data)
    } finally {
      setLoading(false)
    }
  }

  onMount(() => {
    loadData()
  })

  const toggleRule = async (ruleId) => {
    api.toggleTrafficRule(ruleId).then(() => loadData())
  }

  const addRule = async () => {
    if (!newRule().name || !newRule().description) return
    api.addTrafficRule(newRule().name, newRule().description).then(() => {
      setNewRule({ name: '', description: '' })
      setShowAddModal(false)
      loadData()
    })
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('zh-CN')
  }

  const getLogIcon = (action) => {
    if (action.includes('通过')) return '✅'
    if (action.includes('拒绝')) return '❌'
    if (action.includes('限流')) return '🚧'
    return '📋'
  }

  return (
    <div>
      <div class="page-header">
        <h2>流量规则</h2>
        <p>管理流量分配规则，优化内容分发策略</p>
      </div>

      <div class="grid-2">
        <div class="card">
          <div class="card-header">
            <h3>流量规则列表</h3>
            <button class="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
              + 添加规则
            </button>
          </div>
          <div class="card-body">
            {loading() ? (
              <div class="empty-state">
                <div class="empty-state-icon">⏳</div>
                <p>加载中...</p>
              </div>
            ) : rules().length === 0 ? (
              <div class="empty-state">
                <div class="empty-state-icon">⚙️</div>
                <h3>暂无规则</h3>
                <p>点击上方按钮添加规则</p>
              </div>
            ) : (
              rules().map(rule => (
                <div class={`rule-card ${!rule.active ? 'inactive' : ''}`}>
                  <div class="rule-info">
                    <h4>{rule.name}</h4>
                    <p>{rule.description}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      创建时间: {formatDate(rule.createdAt)}
                    </p>
                  </div>
                  <div 
                    class={`toggle-switch ${rule.active ? 'active' : ''}`}
                    onClick={() => toggleRule(rule.id)}
                  />
                </div>
              ))
            )}
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3>操作日志</h3>
          </div>
          <div class="card-body" style={{ padding: 0 }}>
            {loading() ? (
              <div class="empty-state">
                <div class="empty-state-icon">⏳</div>
                <p>加载中...</p>
              </div>
            ) : logs().length === 0 ? (
              <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <h3>暂无日志</h3>
                <p>暂无操作记录</p>
              </div>
            ) : (
              <div style={{ padding: '0 24px' }}>
                {logs().map(log => (
                  <div class="log-item">
                    <div class="log-icon" style={{ background: log.action.includes('通过') ? 'rgba(16, 185, 129, 0.1)' : log.action.includes('拒绝') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)' }}>
                      {getLogIcon(log.action)}
                    </div>
                    <div class="log-content">
                      <h4>{log.action}</h4>
                      <p>{log.reason} - {log.reviewer}</p>
                    </div>
                    <div class="log-time">
                      {formatDate(log.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showAddModal() && (
        <div class="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div class="modal" onClick={(e) => e.stopPropagation()}>
            <div class="modal-header">
              <h3>添加流量规则</h3>
              <button class="modal-close" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">规则名称</label>
                <input 
                  type="text" 
                  class="form-input"
                  placeholder="例如：周末流量加倍"
                  value={newRule().name}
                  onInput={(e) => setNewRule({ ...newRule(), name: e.target.value })}
                />
              </div>
              <div class="form-group">
                <label class="form-label">规则描述</label>
                <textarea 
                  class="form-textarea"
                  placeholder="详细描述规则内容..."
                  value={newRule().description}
                  onInput={(e) => setNewRule({ ...newRule(), description: e.target.value })}
                  style={{ minHeight: '100px' }}
                />
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                取消
              </button>
              <button class="btn btn-primary" onClick={addRule}>
                添加规则
              </button>
            </div>
          </div>
        </div>
      )}

      <div class="card mt-6">
        <div class="card-header">
          <h3>规则说明</h3>
        </div>
        <div class="card-body">
          <div class="grid-3">
            <div>
              <h4 style={{ marginBottom: '12px', color: 'var(--text-secondary)' }}>流量权重计算</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <strong>基础权重</strong>: 1.0
                </li>
                <li style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <strong>质量80+</strong>: +0.5
                </li>
                <li style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <strong>质量60+</strong>: +0.2
                </li>
                <li style={{ padding: '8px 0' }}>
                  <strong>质量40-</strong>: 0.2
                </li>
              </ul>
            </div>
            <div>
              <h4 style={{ marginBottom: '12px', color: 'var(--text-secondary)' }}>爆款加温</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <strong>24h 1万+</strong>: x2.0
                </li>
                <li style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <strong>24h 5千+</strong>: x1.5
                </li>
                <li style={{ padding: '8px 0' }}>
                  <strong>实时计算</strong>: 动态调整
                </li>
              </ul>
            </div>
            <div>
              <h4 style={{ marginBottom: '12px', color: 'var(--text-secondary)' }}>长尾盘活</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <strong>发布7天+</strong>: 进入候选
                </li>
                <li style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <strong>质量70+</strong>: 自动复活
                </li>
                <li style={{ padding: '8px 0' }}>
                  <strong>流量+30%</strong>: 增加曝光
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
