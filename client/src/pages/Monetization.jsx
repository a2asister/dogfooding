import { createSignal, onMount, createEffect } from 'solid-js'
import { Chart, registerables } from 'chart.js'
import { api } from '../services/api.js'

Chart.register(...registerables)

export default function Monetization() {
  const [contents, setContents] = createSignal([])
  const [loading, setLoading] = createSignal(true)
  let revenueChart

  const loadContents = async () => {
    setLoading(true)
    try {
      const result = await api.getContents({ status: 'published', sort: 'revenue' })
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

  createEffect(() => {
    if (!loading() && revenueChart) {
      new Chart(revenueChart, {
        type: 'line',
        data: {
          labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
          datasets: [
            {
              label: '日收益 (¥)',
              data: [1250, 1890, 1560, 2340, 2100, 3200, 2800],
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              fill: true,
              tension: 0.4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'top' } }
        }
      })
    }
  })

  const formatNumber = (num) => {
    if (num >= 10000) return (num / 10000).toFixed(2) + 'w'
    return num.toFixed(2)
  }

  const totalRevenue = () => contents().reduce((sum, c) => sum + c.monetization.revenue, 0)
  const totalClicks = () => contents().reduce((sum, c) => sum + c.monetization.clicks, 0)
  const totalViews = () => contents().reduce((sum, c) => sum + c.engagement.views, 0)
  const avgCpm = () => totalViews() > 0 ? (totalRevenue() / (totalViews() / 1000)).toFixed(2) : 0
  const avgCtr = () => totalViews() > 0 ? ((totalClicks() / totalViews()) * 100).toFixed(2) : 0

  return (
    <div>
      <div class="page-header">
        <h2>变现数据</h2>
        <p>追踪内容变现效果，优化收益策略</p>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-card-header">
            <div><div class="stat-label">总收益</div></div>
            <div class="stat-icon success">💰</div>
          </div>
          <div class="stat-value">¥{formatNumber(totalRevenue())}</div>
          <div class="stat-change up"><span>↑</span> 18.5% 较上周</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-header">
            <div><div class="stat-label">平均 CPM</div></div>
            <div class="stat-icon info">📈</div>
          </div>
          <div class="stat-value">¥{avgCpm()}</div>
          <div class="stat-change up"><span>↑</span> 5.2% 较上周</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-header">
            <div><div class="stat-label">总点击量</div></div>
            <div class="stat-icon warning">👆</div>
          </div>
          <div class="stat-value">{totalClicks().toLocaleString()}</div>
          <div class="stat-change up"><span>↑</span> 12.3% 较上周</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-header">
            <div><div class="stat-label">平均 CTR</div></div>
            <div class="stat-icon primary">🎯</div>
          </div>
          <div class="stat-value">{avgCtr()}%</div>
          <div class="stat-change up"><span>↑</span> 2.1% 较上周</div>
        </div>
      </div>

      <div class="card mb-6">
        <div class="card-header">
          <h3>收益趋势</h3>
        </div>
        <div class="card-body">
          <div class="chart-container">
            <canvas ref={revenueChart}></canvas>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3>内容变现排行</h3>
        </div>
        <div class="card-body" style={{ padding: 0 }}>
          {loading() ? (
            <div class="empty-state">
              <div class="empty-state-icon">⏳</div>
              <p>加载中...</p>
            </div>
          ) : contents().length === 0 ? (
            <div class="empty-state">
              <div class="empty-state-icon">💰</div>
              <h3>暂无数据</h3>
              <p>暂无变现数据</p>
            </div>
          ) : (
            <div class="table-responsive" style={{ overflowX: 'auto' }}>
              <table class="table">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'center' }}>排名</th>
                    <th>标题</th>
                    <th>作者</th>
                    <th>浏览量</th>
                    <th>点击量</th>
                    <th>CTR</th>
                    <th>CPM</th>
                    <th>收益</th>
                  </tr>
                </thead>
                <tbody>
                  {contents().map((content, idx) => {
                    const ctr = content.engagement.views > 0 
                      ? ((content.monetization.clicks / content.engagement.views) * 100).toFixed(2) 
                      : 0
                    return (
                      <tr>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            width: '28px', 
                            height: '28px', 
                            borderRadius: '50%',
                            background: idx < 3 ? 'var(--secondary)' : 'var(--bg)',
                            color: idx < 3 ? 'white' : 'var(--text-secondary)',
                            fontWeight: 600,
                            fontSize: idx < 3 ? '14px' : '12px'
                          }}>
                            {idx + 1}
                          </span>
                        </td>
                        <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {content.title}
                        </td>
                        <td>{content.author}</td>
                        <td>{content.engagement.views.toLocaleString()}</td>
                        <td>{content.monetization.clicks.toLocaleString()}</td>
                        <td>
                          <span style={{ 
                            color: ctr > 5 ? 'var(--secondary)' : ctr > 2 ? 'var(--warning)' : 'var(--danger)',
                            fontWeight: 600
                          }}>
                            {ctr}%
                          </span>
                        </td>
                        <td>¥{content.monetization.cpm.toFixed(2)}</td>
                        <td style={{ fontWeight: 600, color: 'var(--secondary)' }}>
                          ¥{content.monetization.revenue.toFixed(2)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div class="grid-2 mt-6">
        <div class="card">
          <div class="card-header">
            <h3>变现建议</h3>
          </div>
          <div class="card-body">
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ padding: '12px 0', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <span style={{ color: 'var(--info)' }}>💡</span>
                <div>
                  <strong>优化标题吸引力</strong>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>高 CTR 内容通常有更吸引人的标题</p>
                </div>
              </li>
              <li style={{ padding: '12px 0', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <span style={{ color: 'var(--info)' }}>💡</span>
                <div>
                  <strong>关注 CPM 较高分类</strong>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>科技、财经类内容 CPM 通常更高</p>
                </div>
              </li>
              <li style={{ padding: '12px 0', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <span style={{ color: 'var(--info)' }}>💡</span>
                <div>
                  <strong>提升内容质量</strong>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>高质量内容获得更多流量和转化</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3>收益构成</h3>
          </div>
          <div class="card-body">
            <div class="mb-4">
              <div class="flex justify-between mb-2">
                <span>广告收入</span>
                <span style={{ color: 'var(--secondary)', fontWeight: 600 }}>75%</span>
              </div>
              <div class="quality-bar"><div class="quality-bar-fill quality-high" style={{ width: '75%' }}></div></div>
            </div>
            <div class="mb-4">
              <div class="flex justify-between mb-2">
                <span>付费内容</span>
                <span style={{ color: 'var(--primary)', fontWeight: 600 }}>15%</span>
              </div>
              <div class="quality-bar"><div class="quality-bar-fill" style={{ width: '15%', background: 'var(--primary)' }}></div></div>
            </div>
            <div>
              <div class="flex justify-between mb-2">
                <span>打赏收入</span>
                <span style={{ color: 'var(--warning)', fontWeight: 600 }}>10%</span>
              </div>
              <div class="quality-bar"><div class="quality-bar-fill quality-medium" style={{ width: '10%' }}></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
