import { createSignal, onMount } from 'solid-js'
import { api } from '../services/api.js'

export default function Distribution() {
  const [contents, setContents] = createSignal([])
  const [sortBy, setSortBy] = createSignal('weight')
  const [loading, setLoading] = createSignal(true)

  const loadContents = async () => {
    setLoading(true)
    try {
      const result = await api.getContents({ status: 'published', sort: sortBy() })
      if (result.success) {
        setContents(result.data)
      }
    } finally {
      setLoading(false)
    }
  }

  onMount(() => {
    loadContents()
  })

  const handleSortChange = (newSort) => {
    setSortBy(newSort)
    loadContents()
  }

  const getQualityClass = (score) => {
    if (!score) return 'quality-medium'
    if (score >= 80) return 'quality-high'
    if (score >= 60) return 'quality-medium'
    return 'quality-low'
  }

  const getWeightClass = (weight) => {
    if (!weight) return 'weight-normal'
    if (weight >= 1.5) return 'weight-high'
    if (weight >= 0.8) return 'weight-normal'
    return 'weight-low'
  }

  const isHotContent = (content) => {
    if (!content.publishedAt) return false
    const hours = (Date.now() - content.publishedAt) / 3600000
    return hours <= 24 && content.engagement.views >= 5000
  }

  const isLongTailContent = (content) => {
    if (!content.publishedAt) return false
    const hours = (Date.now() - content.publishedAt) / 3600000
    return hours > 168 && (content.qualityScore || 0) >= 70 && content.engagement.views < 5000
  }

  const stripHtml = (html) => {
    const tmp = document.createElement('div')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
  }

  return (
    <div>
      <div class="page-header">
        <h2>流量分发</h2>
        <p>管理内容流量权重，优化分发策略</p>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-card-header">
            <div><div class="stat-label">总发布内容</div></div>
            <div class="stat-icon primary">📄</div>
          </div>
          <div class="stat-value">{contents().length}</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-header">
            <div><div class="stat-label">爆款内容</div></div>
            <div class="stat-icon warning">🔥</div>
          </div>
          <div class="stat-value">{contents().filter(c => isHotContent(c)).length}</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-header">
            <div><div class="stat-label">长尾内容</div></div>
            <div class="stat-icon info">📚</div>
          </div>
          <div class="stat-value">{contents().filter(c => isLongTailContent(c)).length}</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-header">
            <div><div class="stat-label">低质内容</div></div>
            <div class="stat-icon danger">⚠️</div>
          </div>
          <div class="stat-value">{contents().filter(c => (c.qualityScore || 0) < 40).length}</div>
        </div>
      </div>

      <div class="card mb-6">
        <div class="card-header">
          <h3>已发布内容</h3>
          <div class="flex gap-2">
            <select 
              class="filter-select"
              value={sortBy()}
              onChange={(e) => handleSortChange(e.target.value)}
            >
              <option value="weight">按流量权重</option>
              <option value="views">按浏览量</option>
              <option value="quality">按质量评分</option>
              <option value="revenue">按收益</option>
            </select>
          </div>
        </div>
        <div class="card-body" style={{ padding: 0 }}>
          {loading() ? (
            <div class="empty-state">
              <div class="empty-state-icon">⏳</div>
              <p>加载中...</p>
            </div>
          ) : contents().length === 0 ? (
            <div class="empty-state">
              <div class="empty-state-icon">📭</div>
              <h3>暂无内容</h3>
              <p>暂无已发布的内容</p>
            </div>
          ) : (
            <div style={{ padding: '24px' }}>
              {contents().map(content => (
                <div 
                  class={`content-card mb-4 ${isHotContent(content) ? 'hot' : ''} ${isLongTailContent(content) ? 'long-tail' : ''}`}
                >
                  <div class="content-card-header">
                    <div>
                      <div class="content-card-title">{content.title}</div>
                      <div class="flex gap-2 mt-1" style={{ marginTop: '4px' }}>
                        {isHotContent(content) && <span class="badge badge-hot">🔥 爆款</span>}
                        {isLongTailContent(content) && <span class="badge badge-longtail">📚 长尾</span>}
                        {(content.qualityScore || 0) < 40 && <span class="badge" style={{ background: 'var(--danger)', color: 'white' }}>⚠️ 低质</span>}
                      </div>
                    </div>
                    <div class="traffic-indicator">
                      <span class={`weight-badge ${getWeightClass(content.trafficWeight)}`}>
                        权重 {content.trafficWeight?.toFixed(1) || 1.0}x
                      </span>
                    </div>
                  </div>
                  
                  <div class="content-card-meta">
                    <span>👤 {content.author}</span>
                    <span>📁 {content.category}</span>
                    <div class="tags">
                      {content.tags?.slice(0, 3).map(tag => (
                        <span class="tag">{tag}</span>
                      ))}
                    </div>
                  </div>

                  <div class="content-card-excerpt">
                    {stripHtml(content.content).substring(0, 150)}...
                  </div>

                  <div class="content-card-footer">
                    <div class="flex gap-4" style={{ gap: '24px' }}>
                      <div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>质量评分</div>
                        <div class="flex items-center gap-2" style={{ gap: '8px', marginTop: '4px' }}>
                          <div class="quality-bar" style={{ width: '80px' }}>
                            <div 
                              class={`quality-bar-fill ${getQualityClass(content.qualityScore)}`}
                              style={{ width: `${content.qualityScore || 0}%` }}
                            />
                          </div>
                          <span style={{ fontSize: '14px', fontWeight: 600 }}>{content.qualityScore || '-'}</span>
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>浏览量</div>
                        <div style={{ fontSize: '18px', fontWeight: 700 }}>
                          {content.engagement.views.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>互动量</div>
                        <div style={{ fontSize: '18px', fontWeight: 700 }}>
                          {(content.engagement.likes + content.engagement.comments + content.engagement.shares).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>收益</div>
                        <div style={{ fontSize: '18px', fontWeight: 700 }}>
                          ¥{content.monetization.revenue.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div class="grid-2">
        <div class="card">
          <div class="card-header">
            <h3>🔥 爆款加温策略</h3>
          </div>
          <div class="card-body">
            <div class="alert alert-success">
              <strong>自动加温已启用</strong>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '16px' }}>
              <li style={{ padding: '12px 0', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <span style={{ color: 'var(--warning)' }}>⚡</span>
                <div>
                  <strong>24小时内1万+浏览</strong>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>流量权重翻倍 (x2.0)</p>
                </div>
              </li>
              <li style={{ padding: '12px 0', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <span style={{ color: 'var(--warning)' }}>⚡</span>
                <div>
                  <strong>24小时内5千+浏览</strong>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>流量权重x1.5</p>
                </div>
              </li>
              <li style={{ padding: '12px 0', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <span style={{ color: 'var(--warning)' }}>⚡</span>
                <div>
                  <strong>高质量加分</strong>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>80分以上+0.5权重</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3>📚 长尾内容盘活</h3>
          </div>
          <div class="card-body">
            <div class="alert alert-info">
              <strong>智能推荐已启用</strong>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '16px' }}>
              <li style={{ padding: '12px 0', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <span style={{ color: 'var(--info)' }}>🔄</span>
                <div>
                  <strong>发布7天以上</strong>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>进入推荐池候选</p>
                </div>
              </li>
              <li style={{ padding: '12px 0', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <span style={{ color: 'var(--info)' }}>🔄</span>
                <div>
                  <strong>质量分70+</strong>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>优质内容自动复活</p>
                </div>
              </li>
              <li style={{ padding: '12px 0', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <span style={{ color: 'var(--info)' }}>🔄</span>
                <div>
                  <strong>流量权重+30%</strong>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>增加曝光机会</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
