import { createSignal, onMount, createEffect } from 'solid-js'
import { useNavigate } from '@solidjs/router'
import { Chart, registerables } from 'chart.js'
import { api } from '../services/api.js'

Chart.register(...registerables)

export default function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = createSignal(null)
  const [loading, setLoading] = createSignal(true)
  let chartCanvas
  let doughnutCanvas

  const loadData = async () => {
    try {
      const result = await api.getStatistics()
      if (result.success) {
        setStats(result.data)
      }
    } finally {
      setLoading(false)
    }
  }

  onMount(() => {
    loadData()
  })

  createEffect(() => {
    if (!loading() && stats() && chartCanvas) {
      new Chart(chartCanvas, {
        type: 'line',
        data: {
          labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
          datasets: [
            {
              label: '浏览量',
              data: [12000, 19000, 15000, 25000, 22000, 30000, 28000],
              borderColor: '#6366f1',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              fill: true,
              tension: 0.4
            },
            {
              label: '互动量',
              data: [2000, 3500, 2800, 4500, 4000, 5500, 5000],
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

    if (!loading() && stats() && doughnutCanvas) {
      new Chart(doughnutCanvas, {
        type: 'doughnut',
        data: {
          labels: ['高质量', '中等', '低质量'],
          datasets: [{
            data: [
              stats()?.quality.high || 0,
              stats()?.quality.medium || 0,
              stats()?.quality.low || 0
            ],
            backgroundColor: ['#10b981', '#f59e0b', '#ef4444']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' } }
        }
      })
    }
  })

  const formatNumber = (num) => {
    if (num >= 10000) return (num / 10000).toFixed(1) + 'w'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
    return num.toString()
  }

  return (
    <div>
      <div class="page-header">
        <h2>数据概览</h2>
        <p>内容生态系统整体运行状况</p>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-card-header">
            <div>
              <div class="stat-label">总内容数</div>
            </div>
            <div class="stat-icon primary">📄</div>
          </div>
          <div class="stat-value">{formatNumber(stats()?.overview.total || 0)}</div>
          <div class="stat-change up">
            <span>↑</span> 已发布 {stats()?.overview.published || 0} 篇
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card-header">
            <div>
              <div class="stat-label">总浏览量</div>
            </div>
            <div class="stat-icon success">👁</div>
          </div>
          <div class="stat-value">{formatNumber(stats()?.engagement.views || 0)}</div>
          <div class="stat-change up">
            <span>↑</span> 12.5% 较上周
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card-header">
            <div>
              <div class="stat-label">总互动量</div>
            </div>
            <div class="stat-icon warning">💬</div>
          </div>
          <div class="stat-value">
            {formatNumber((stats()?.engagement.likes || 0) + (stats()?.engagement.comments || 0) + (stats()?.engagement.shares || 0))}
          </div>
          <div class="stat-change up">
            <span>↑</span> 8.3% 较上周
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card-header">
            <div>
              <div class="stat-label">待审核</div>
            </div>
            <div class="stat-icon danger">⏳</div>
          </div>
          <div class="stat-value">{stats()?.overview.reviewing || 0}</div>
          <div class="stat-change down">
            <span>↓</span> 需要处理
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card-header">
            <div>
              <div class="stat-label">爆款内容</div>
            </div>
            <div class="stat-icon info">🔥</div>
          </div>
          <div class="stat-value">{stats()?.traffic.viral || 0}</div>
          <div class="stat-change up">
            <span>↑</span> 正在加温
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card-header">
            <div>
              <div class="stat-label">总收益</div>
            </div>
            <div class="stat-icon success">💰</div>
          </div>
          <div class="stat-value">¥{formatNumber(stats()?.monetization.totalRevenue || 0)}</div>
          <div class="stat-change up">
            <span>↑</span> 15.2% 较上周
          </div>
        </div>
      </div>

      <div class="grid-2 mb-6">
        <div class="card">
          <div class="card-header">
            <h3>流量趋势</h3>
          </div>
          <div class="card-body">
            <div class="chart-container">
              <canvas ref={chartCanvas}></canvas>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3>内容质量分布</h3>
          </div>
          <div class="card-body">
            <div class="chart-container">
              <canvas ref={doughnutCanvas}></canvas>
            </div>
          </div>
        </div>
      </div>

      <div class="grid-3">
        <div class="card">
          <div class="card-header">
            <h3>内容状态</h3>
          </div>
          <div class="card-body">
            <div class="mb-4 flex justify-between items-center">
              <div>
                <div style={{ fontWeight: 600 }}>已发布</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>正在分发</div>
              </div>
              <span class="status-badge status-published">
                {stats()?.overview.published || 0} 篇
              </span>
            </div>
            <div class="mb-4 flex justify-between items-center">
              <div>
                <div style={{ fontWeight: 600 }}>审核中</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>等待处理</div>
              </div>
              <span class="status-badge status-reviewing">
                {stats()?.overview.reviewing || 0} 篇
              </span>
            </div>
            <div class="flex justify-between items-center">
              <div>
                <div style={{ fontWeight: 600 }}>已拒绝</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>未通过审核</div>
              </div>
              <span class="status-badge status-rejected">
                {stats()?.overview.rejected || 0} 篇
              </span>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3>流量策略</h3>
          </div>
          <div class="card-body">
            <div class="mb-4">
              <div class="flex justify-between mb-2">
                <span>爆款加温</span>
                <span class="badge badge-hot">已启用</span>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                24小时内高流量内容自动加权
              </div>
            </div>
            <div class="mb-4">
              <div class="flex justify-between mb-2">
                <span>长尾盘活</span>
                <span class="badge badge-longtail">已启用</span>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                7天以上优质内容推荐复活
              </div>
            </div>
            <div>
              <div class="flex justify-between mb-2">
                <span>低质限流</span>
                <span class="badge" style={{ background: 'var(--danger)', color: 'white' }}>已启用</span>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                40分以下内容流量降至0.2
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3>快速操作</h3>
          </div>
          <div class="card-body">
            <button 
              class="btn btn-primary w-full mb-3" 
              style={{ width: '100%' }}
              onClick={() => navigate('/publish')}
            >
              ✍️ 发布新内容
            </button>
            <button 
              class="btn btn-secondary w-full mb-3" 
              style={{ width: '100%' }}
              onClick={() => navigate('/review')}
            >
              🔍 处理审核
            </button>
            <button 
              class="btn btn-secondary w-full" 
              style={{ width: '100%' }}
              onClick={() => navigate('/analytics')}
            >
              📈 查看报告
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
