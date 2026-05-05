<template>
  <div class="page-container">
    <div class="page-header">
      <h2>异常告警</h2>
      <p>查看和管理所有能耗异常告警信息</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-title">总告警数</div>
        <div class="stat-value">{{ totalAlerts }}</div>
        <div class="stat-unit">条</div>
        <div class="stat-change negative">系统记录</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">未处理</div>
        <div class="stat-value">{{ unresolvedAlerts }}</div>
        <div class="stat-unit">条</div>
        <div class="stat-change" :class="unresolvedAlerts > 0 ? 'positive' : 'negative'">
          {{ unresolvedAlerts > 0 ? '需要关注' : '全部处理完毕' }}
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-title">警告级别</div>
        <div class="stat-value">{{ warningAlerts }}</div>
        <div class="stat-unit">条</div>
        <div class="stat-change positive">需及时处理</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">已处理</div>
        <div class="stat-value">{{ resolvedAlerts }}</div>
        <div class="stat-unit">条</div>
        <div class="stat-change negative">已标记为解决</div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3 class="card-title">告警列表</h3>
        <div class="btn-group">
          <button class="btn btn-primary btn-small" @click="filterResolved = 'all'">全部</button>
          <button class="btn btn-danger btn-small" @click="filterResolved = 'false'">未处理</button>
          <button class="btn btn-success btn-small" @click="filterResolved = 'true'">已处理</button>
        </div>
      </div>

      <div v-if="filteredAlerts.length > 0">
        <div
          v-for="alert in filteredAlerts"
          :key="alert.id"
          class="alert-item"
          :class="[alert.type, alert.resolved ? 'resolved' : '']"
        >
          <div class="alert-header">
            <div style="display: flex; align-items: center; gap: 1rem;">
              <span class="alert-title">{{ alert.title }}</span>
              <span class="status-badge" :class="alert.resolved ? 'info' : 'warning'">
                {{ alert.resolved ? '已处理' : '未处理' }}
              </span>
            </div>
            <span class="alert-time">{{ formatTime(alert.timestamp) }}</span>
          </div>
          <div class="alert-message">{{ alert.message }}</div>
          <div style="margin-top: 1rem; display: flex; justify-content: flex-end; gap: 0.5rem;">
            <button
              v-if="!alert.resolved"
              class="btn btn-success btn-small"
              @click="resolveAlert(alert)"
              :disabled="alert.loading"
            >
              {{ alert.loading ? '处理中...' : '标记为已处理' }}
            </button>
            <button
              class="btn btn-primary btn-small"
              @click="viewDetails(alert)"
            >
              查看详情
            </button>
            <button
              class="btn btn-danger btn-small"
              @click="deleteAlert(alert)"
            >
              删除
            </button>
          </div>
        </div>
      </div>
      <div v-else class="empty">
        <div class="empty-icon">🔔</div>
        <p>暂无符合条件的告警记录</p>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3 class="card-title">告警统计分析</h3>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
        <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 12px;">
          <h4 style="color: #1e3c72; margin-bottom: 1rem;">告警类型分布</h4>
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span style="color: #666;">警告 (warning)</span>
                <span style="font-weight: 600; color: #ef6c00;">70%</span>
              </div>
              <div style="height: 8px; background: #eee; border-radius: 4px; overflow: hidden;">
                <div style="height: 100%; background: linear-gradient(90deg, #ff9800, #f57c00); width: 70%;"></div>
              </div>
            </div>
            <div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span style="color: #666;">信息 (info)</span>
                <span style="font-weight: 600; color: #1976d2;">30%</span>
              </div>
              <div style="height: 8px; background: #eee; border-radius: 4px; overflow: hidden;">
                <div style="height: 100%; background: linear-gradient(90deg, #2196f3, #1976d2); width: 30%;"></div>
              </div>
            </div>
          </div>
        </div>

        <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 12px;">
          <h4 style="color: #1e3c72; margin-bottom: 1rem;">告警处理时效</h4>
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span style="color: #666;">平均处理时间</span>
                <span style="font-weight: 600; color: #43a047;">2.3 小时</span>
              </div>
              <div style="height: 8px; background: #eee; border-radius: 4px; overflow: hidden;">
                <div style="height: 100%; background: linear-gradient(90deg, #4caf50, #388e3c); width: 85%;"></div>
              </div>
            </div>
            <div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span style="color: #666;">处理及时率</span>
                <span style="font-weight: 600; color: #43a047;">92%</span>
              </div>
              <div style="height: 8px; background: #eee; border-radius: 4px; overflow: hidden;">
                <div style="height: 100%; background: linear-gradient(90deg, #4caf50, #388e3c); width: 92%;"></div>
              </div>
            </div>
          </div>
        </div>

        <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 12px;">
          <h4 style="color: #1e3c72; margin-bottom: 1rem;">常见告警原因</h4>
          <ul style="list-style: none; padding: 0; margin: 0;">
            <li style="margin-bottom: 0.8rem; padding: 0.5rem 0; border-bottom: 1px solid #e0e0e0;">
              <span style="display: inline-flex; align-items: center; gap: 0.5rem;">
                <span style="width: 8px; height: 8px; background: #f44336; border-radius: 50%;"></span>
                <span style="color: #333;">能耗超出预期值</span>
              </span>
              <span style="float: right; color: #888; font-size: 0.9rem;">12 次</span>
            </li>
            <li style="margin-bottom: 0.8rem; padding: 0.5rem 0; border-bottom: 1px solid #e0e0e0;">
              <span style="display: inline-flex; align-items: center; gap: 0.5rem;">
                <span style="width: 8px; height: 8px; background: #ff9800; border-radius: 50%;"></span>
                <span style="color: #333;">设备运行异常</span>
              </span>
              <span style="float: right; color: #888; font-size: 0.9rem;">8 次</span>
            </li>
            <li style="margin-bottom: 0.8rem; padding: 0.5rem 0; border-bottom: 1px solid #e0e0e0;">
              <span style="display: inline-flex; align-items: center; gap: 0.5rem;">
                <span style="width: 8px; height: 8px; background: #2196f3; border-radius: 50%;"></span>
                <span style="color: #333;">设备离线</span>
              </span>
              <span style="float: right; color: #888; font-size: 0.9rem;">3 次</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3 class="card-title">告警规则配置</h3>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 1.5rem;">
        <div style="background: #fff8e1; padding: 1.5rem; border-radius: 12px; border-left: 4px solid #ff9800;">
          <h4 style="color: #e65100; margin-bottom: 0.8rem;">⚡ 能耗告警</h4>
          <p style="color: #666; line-height: 1.6; margin-bottom: 1rem;">
            当能耗超出预期值的 15% 时触发警告，超出 30% 时触发严重告警。
          </p>
          <button class="btn btn-warning btn-small">编辑规则</button>
        </div>
        <div style="background: #e3f2fd; padding: 1.5rem; border-radius: 12px; border-left: 4px solid #2196f3;">
          <h4 style="color: #1565c0; margin-bottom: 0.8rem;">📱 设备状态告警</h4>
          <p style="color: #666; line-height: 1.6; margin-bottom: 1rem;">
            设备离线超过 5 分钟触发告警，支持短信和邮件通知方式。
          </p>
          <button class="btn btn-primary btn-small">编辑规则</button>
        </div>
        <div style="background: #fce4ec; padding: 1.5rem; border-radius: 12px; border-left: 4px solid #e91e63;">
          <h4 style="color: #c2185b; margin-bottom: 0.8rem;">🔔 通知设置</h4>
          <p style="color: #666; line-height: 1.6; margin-bottom: 1rem;">
            高优先级告警即时通知，低优先级告警每日汇总发送。
          </p>
          <button class="btn btn-danger btn-small">编辑规则</button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading">数据加载中...</div>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import moment from 'moment'

export default {
  name: 'Alerts',
  setup() {
    const loading = ref(false)
    const error = ref(null)
    const alerts = ref([])
    const filterResolved = ref('all')

    const filteredAlerts = computed(() => {
      if (filterResolved.value === 'all') return alerts.value
      return alerts.value.filter(a => a.resolved === (filterResolved.value === 'true'))
    })

    const totalAlerts = computed(() => alerts.value.length)

    const unresolvedAlerts = computed(() => {
      return alerts.value.filter(a => !a.resolved).length
    })

    const resolvedAlerts = computed(() => {
      return alerts.value.filter(a => a.resolved).length
    })

    const warningAlerts = computed(() => {
      return alerts.value.filter(a => a.type === 'warning').length
    })

    const formatTime = (timestamp) => {
      return moment(timestamp).format('YYYY-MM-DD HH:mm:ss')
    }

    const fetchAlerts = async () => {
      loading.value = true
      error.value = null
      try {
        const response = await axios.get('/api/alerts')
        alerts.value = response.data
      } catch (err) {
        error.value = '加载告警数据失败，请稍后重试'
        console.error('Error fetching alerts:', err)
      } finally {
        loading.value = false
      }
    }

    const resolveAlert = async (alert) => {
      alert.loading = true
      try {
        await axios.put(`/api/alerts/${alert.id}/resolve`)
        alert.resolved = true
      } catch (err) {
        error.value = '处理告警失败，请稍后重试'
        console.error('Error resolving alert:', err)
      } finally {
        alert.loading = false
      }
    }

    const viewDetails = (alert) => {
      alert(`告警详情：\n\n标题：${alert.title}\n\n内容：${alert.message}\n\n时间：${formatTime(alert.timestamp)}\n\n状态：${alert.resolved ? '已处理' : '未处理'}`)
    }

    const deleteAlert = (alert) => {
      if (confirm(`确定要删除此告警吗？\n\n${alert.title}`)) {
        const index = alerts.value.indexOf(alert)
        if (index > -1) {
          alerts.value.splice(index, 1)
        }
      }
    }

    onMounted(() => {
      fetchAlerts()
    })

    return {
      loading,
      error,
      alerts,
      filterResolved,
      filteredAlerts,
      totalAlerts,
      unresolvedAlerts,
      resolvedAlerts,
      warningAlerts,
      formatTime,
      resolveAlert,
      viewDetails,
      deleteAlert
    }
  }
}
</script>
