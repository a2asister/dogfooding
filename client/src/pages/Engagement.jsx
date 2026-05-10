import { createSignal, onMount, createEffect } from 'solid-js'
import { Chart, registerables } from 'chart.js'
import { api } from '../services/api.js'

Chart.register(...registerables)

export default function Engagement() {
  const [contents, setContents] = createSignal([])
  const [loading, setLoading] = createSignal(true)
  let engagementChart

  const loadContents = async () => {
    setLoading(true)
    try {
      const result = await api.getContents({ status: 'published', sort: 'views' })
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
    if (!loading() && engagementChart) {
      new Chart(engagementChart, {
        type: 'bar',
        data: {
          labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
          datasets: [
            {
              label: '点赞',
              data: [1200, 1900, 1500, 2500, 2200, 3000, 2800],
              backgroundColor: 'rgba(99, 102, 241, 0.8)'
            },
            {
              label: '评论',
              data: [500, 800, 600, 900, 750, 1200, 1000],
              backgroundColor: 'rgba(16, 185, 129, 0.8)'
            },
            {
              label: '分享',
              data: [200, 350, 280, 450, 400, 550, 500],
              backgroundColor: 'rgba(245, 158, 11, 0.8)'
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
    if (num >= 10000) return (num / 10000).toFixed(1) + 'w'
    return num.toLocaleString()
  }

  const totalViews = () => contents().reduce((sum, c) => sum + c.engagement.views, 0)
  const totalLikes = () => contents().reduce((sum, c) => sum + c.engagement.likes, 0)
  const totalComments = () => contents().reduce((sum, c) => sum + c.engagement.comments, 0)
  const totalShares = () => contents().reduce((sum, c) => sum + c.engagement.shares, 0)

  return (
    <div>
      <div class="page-header">
        <h2>互动数据</h2>
        <p>跟踪内容互动表现，优化内容策略</p>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-card-header">
            <div><div class="stat-label">总浏览量</div></div>
            <div class="stat-icon primary">👁</div>
          </div>
          <div class="stat-value">{formatNumber(totalViews())}</div>
          <div class="stat-change up"><span>↑</span> 15.2% 较上周</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-header">
            <div><div class="stat-label">总点赞数</div></div>
            <div class="stat-icon success">❤️</div>
          </div>
          <div class="stat-value">{formatNumber(totalLikes())}</div>
          <div class="stat-change up"><span>↑</span> 12.8% 较上周</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-header">
            <div><div class="stat-label">总评论数</div></div>
            <div class="stat-icon warning">💬</div>
          </div>
          <div class="stat-value">{formatNumber(totalComments())}</div>
          <div class="stat-change up"><span>↑</span> 8.5% 较上周</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-header">
            <div><div class="stat-label">总分享数</div></div>
            <div class="stat-icon info">🔗</div>
          </div>
          <div class="stat-value">{formatNumber(totalShares())}</div>
          <div class="stat-change up"><span>↑</span> 22.3% 较上周</div>
        </div>
      </div>

      <div class="card mb-6">
        <div class="card-header">
          <h3>互动趋势</h3>
        </div>
        <div class="card-body">
          <div class="chart-container">
            <canvas ref={engagementChart}></canvas>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3>内容互动排行</h3>
        </div>
        <div class="card-body" style={{ padding: 0 }}>
          {loading() ? (
            <div class="empty-state">
              <div class="empty-state-icon">⏳</div>
              <p>加载中...</p>
            </div>
          ) : contents().length === 0 ? (
            <div class="empty-state">
              <div class="empty-state-icon">📊</div>
              <h3>暂无数据</h3>
              <p>暂无互动数据</p>
            </div>
          ) : (
            <div class="table-responsive" style={{ overflowX: 'auto' }}>
              <table class="table">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'center' }}>排名</th>
                    <th>标题</th>
                    <th>作者</th>
                    <th>浏览</th>
                    <th>点赞</th>
                    <th>评论</th>
                    <th>分享</th>
                    <th>互动率</th>
                  </tr>
                </thead>
                <tbody>
                  {contents().map((content, idx) => {
                    const totalEngagement = content.engagement.likes + content.engagement.comments + content.engagement.shares
                    const engagementRate = content.engagement.views > 0 
                      ? ((totalEngagement / content.engagement.views) * 100).toFixed(1) 
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
                            background: idx < 3 ? 'var(--warning)' : 'var(--bg)',
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
                        <td>{formatNumber(content.engagement.views)}</td>
                        <td>{formatNumber(content.engagement.likes)}</td>
                        <td>{formatNumber(content.engagement.comments)}</td>
                        <td>{formatNumber(content.engagement.shares)}</td>
                        <td>
                          <span style={{ 
                            color: engagementRate > 10 ? 'var(--secondary)' : engagementRate > 5 ? 'var(--warning)' : 'var(--danger)',
                            fontWeight: 600
                          }}>
                            {engagementRate}%
                          </span>
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
    </div>
  )
}
