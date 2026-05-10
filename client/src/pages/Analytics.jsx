import { createSignal, onMount, createEffect } from 'solid-js'
import { Chart, registerables } from 'chart.js'
import { api } from '../services/api.js'

Chart.register(...registerables)

export default function Analytics() {
  const [stats, setStats] = createSignal(null)
  const [loading, setLoading] = createSignal(true)
  let qualityChart
  let performanceChart

  const loadData = async () => {
    setLoading(true)
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
    if (!loading() && qualityChart) {
      new Chart(qualityChart, {
        type: 'radar',
        data: {
          labels: ['内容完整性', '排版质量', '原创性', '用户价值', '互动潜力'],
          datasets: [{
            label: '本周平均',
            data: [85, 78, 82, 75, 88],
            backgroundColor: 'rgba(99, 102, 241, 0.2)',
            borderColor: '#6366f1',
            borderWidth: 2
          }, {
            label: '上周平均',
            data: [72, 75, 70, 68, 75],
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            borderColor: '#10b981',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: { r: { beginAtZero: true, max: 100 } }
        }
      })
    }

    if (!loading() && performanceChart) {
      new Chart(performanceChart, {
        type: 'bar',
        data: {
          labels: ['发布', '审核', '分发', '互动', '变现'],
          datasets: [{
            label: '当前效率',
            data: [95, 88, 92, 85, 78],
            backgroundColor: [
              'rgba(99, 102, 241, 0.8)',
              'rgba(16, 185, 129, 0.8)',
              'rgba(245, 158, 11, 0.8)',
              'rgba(59, 130, 246, 0.8)',
              'rgba(239, 68, 68, 0.8)'
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, max: 100 } }
        }
      })
    }
  })

  return (
    <div>
      <div class="page-header">
        <h2>数据复盘</h2>
        <p>全链路数据洞察，持续优化流量规则</p>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-card-header">
            <div><div class="stat-label">内容发布效率</div></div>
            <div class="stat-icon primary">⚡</div>
          </div>
          <div class="stat-value">95%</div>
          <div class="stat-change up"><span>↑</span> 5.2% 较上周</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-header">
            <div><div class="stat-label">审核通过率</div></div>
            <div class="stat-icon success">✅</div>
          </div>
          <div class="stat-value">88%</div>
          <div class="stat-change up"><span>↑</span> 3.1% 较上周</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-header">
            <div><div class="stat-label">流量利用率</div></div>
            <div class="stat-icon warning">📊</div>
          </div>
          <div class="stat-value">92%</div>
          <div class="stat-change up"><span>↑</span> 8.7% 较上周</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-header">
            <div><div class="stat-label">规则迭代次数</div></div>
            <div class="stat-icon info">🔄</div>
          </div>
          <div class="stat-value">12次</div>
          <div class="stat-change up"><span>↑</span> 本周</div>
        </div>
      </div>

      <div class="grid-2 mb-6">
        <div class="card">
          <div class="card-header">
            <h3>质量评分对比</h3>
          </div>
          <div class="card-body">
            <div class="chart-container">
              <canvas ref={qualityChart}></canvas>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3>全链路效率</h3>
          </div>
          <div class="card-body">
            <div class="chart-container">
              <canvas ref={performanceChart}></canvas>
            </div>
          </div>
        </div>
      </div>

      <div class="grid-2 mb-6">
        <div class="card">
          <div class="card-header">
            <h3>流量规则效果分析</h3>
          </div>
          <div class="card-body">
            <div class="mb-4">
              <div class="flex justify-between mb-2">
                <span>爆款加温效果</span>
                <span style={{ color: 'var(--secondary)', fontWeight: 600 }}>+156% 流量增长</span>
              </div>
              <div class="quality-bar"><div class="quality-bar-fill quality-high" style={{ width: '78%' }}></div></div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                24小时内高流量内容获得额外曝光机会
              </p>
            </div>
            <div class="mb-4">
              <div class="flex justify-between mb-2">
                <span>长尾内容盘活</span>
                <span style={{ color: 'var(--info)', fontWeight: 600 }}>+89% 再次曝光</span>
              </div>
              <div class="quality-bar"><div class="quality-bar-fill" style={{ width: '65%', background: 'var(--info)' }}></div></div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                7天以上优质内容获得推荐复活
              </p>
            </div>
            <div>
              <div class="flex justify-between mb-2">
                <span>低质内容限流</span>
                <span style={{ color: 'var(--danger)', fontWeight: 600 }}>-85% 劣质流量</span>
              </div>
              <div class="quality-bar"><div class="quality-bar-fill quality-low" style={{ width: '15%' }}></div></div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                40分以下内容流量权重降至0.2
              </p>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3>质量分布统计</h3>
          </div>
          <div class="card-body">
            <div class="metrics-row mb-6">
              <div class="metric-item">
                <div class="num" style={{ color: 'var(--secondary)' }}>{stats()?.quality.high || 0}</div>
                <div class="label">高质量</div>
              </div>
              <div class="metric-item">
                <div class="num" style={{ color: 'var(--warning)' }}>{stats()?.quality.medium || 0}</div>
                <div class="label">中等</div>
              </div>
              <div class="metric-item">
                <div class="num" style={{ color: 'var(--danger)' }}>{stats()?.quality.low || 0}</div>
                <div class="label">低质量</div>
              </div>
              <div class="metric-item">
                <div class="num" style={{ color: 'var(--info)' }}>{stats()?.traffic.viral || 0}</div>
                <div class="label">爆款</div>
              </div>
            </div>
            
            <div class="alert alert-success">
              <strong>📈 质量趋势向上</strong>
              <p style={{ margin: '8px 0 0 0', fontSize: '13px' }}>
                本周高质量内容占比提升 12%，低质内容下降 5%，整体内容生态健康度良好。
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3>规则迭代优化建议</h3>
        </div>
        <div class="card-body">
          <div class="grid-3">
            <div class="alert alert-success">
              <strong>✅ 效果良好</strong>
              <ul style={{ marginTop: '8px', paddingLeft: '20px', fontSize: '14px' }}>
                <li>爆款加温策略：建议保持</li>
                <li>质量评分模型：准确率高</li>
                <li>流量权重计算：符合预期</li>
              </ul>
            </div>
            <div class="alert alert-warning">
              <strong>⚠️ 需要优化</strong>
              <ul style={{ marginTop: '8px', paddingLeft: '20px', fontSize: '14px' }}>
                <li>长尾内容识别：增加标签权重</li>
                <li>变现数据追踪：细化维度</li>
                <li>审核效率：引入AI预审</li>
              </ul>
            </div>
            <div class="alert alert-info">
              <strong>💡 新规则建议</strong>
              <ul style={{ marginTop: '8px', paddingLeft: '20px', fontSize: '14px' }}>
                <li>周末流量加权策略</li>
                <li>用户标签匹配度</li>
                <li>时效性内容优先级</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
