<template>
  <div class="logs-page">
    <div class="page-header">
      <h2>日志管理</h2>
      <div class="tabs">
        <button
          :class="['tab-btn', { active: activeTab === 'operation' }]"
          @click="activeTab = 'operation'"
        >
          操作日志
        </button>
        <button
          :class="['tab-btn', { active: activeTab === 'access' }]"
          @click="activeTab = 'access'"
        >
          访问日志
        </button>
      </div>
    </div>

    <div class="filter-bar">
      <div class="filter-left">
        <el-select v-model="filters.user" placeholder="操作用户" clearable size="default" class="filter-select">
          <el-option label="全部用户" value="" />
          <el-option label="admin" value="admin" />
          <el-option label="operator" value="operator" />
          <el-option label="viewer" value="viewer" />
        </el-select>
        <el-select v-if="activeTab === 'operation'" v-model="filters.module" placeholder="操作模块" clearable size="default" class="filter-select">
          <el-option label="全部模块" value="" />
          <el-option label="资讯管理" value="news" />
          <el-option label="活动管理" value="events" />
          <el-option label="用户管理" value="users" />
          <el-option label="系统设置" value="settings" />
          <el-option label="媒体库" value="media" />
        </el-select>
        <el-select v-if="activeTab === 'access'" v-model="filters.page" placeholder="访问页面" clearable size="default" class="filter-select">
          <el-option label="全部页面" value="" />
          <el-option label="首页" value="/" />
          <el-option label="资讯" value="/news" />
          <el-option label="活动" value="/events" />
          <el-option label="下载" value="/download" />
        </el-select>
        <el-date-picker
          v-model="filters.date"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          size="default"
        />
      </div>
      <button class="btn btn-secondary btn-sm" @click="handleSearch">
        🔍 查询
      </button>
    </div>

    <div class="logs-table" v-if="activeTab === 'operation'" v-scroll-animate>
      <table>
        <thead>
          <tr>
            <th>时间</th>
            <th>操作用户</th>
            <th>操作模块</th>
            <th>操作类型</th>
            <th>操作详情</th>
            <th>IP地址</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in operationLogs" :key="log.id">
            <td class="time">{{ log.created_at }}</td>
            <td>
              <span class="user-tag" :class="'role-' + log.role">{{ log.username }}</span>
            </td>
            <td><span class="module-tag">{{ getModuleLabel(log.module) }}</span></td>
            <td><span class="action-tag" :class="'action-' + log.action">{{ getActionLabel(log.action) }}</span></td>
            <td class="details">{{ log.details }}</td>
            <td class="ip">{{ log.ip_address }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="logs-table" v-if="activeTab === 'access'" v-scroll-animate>
      <table>
        <thead>
          <tr>
            <th>时间</th>
            <th>访问路径</th>
            <th>IP地址</th>
            <th>User Agent</th>
            <th>会话ID</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in accessLogs" :key="log.id">
            <td class="time">{{ log.created_at }}</td>
            <td class="path">{{ log.path }}</td>
            <td class="ip">{{ log.ip_address }}</td>
            <td class="ua">{{ log.user_agent }}</td>
            <td class="session">{{ log.session_id }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next"
        background
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { OperationLog, AccessLog } from '@/types'

const activeTab = ref<'operation' | 'access'>('operation')

const filters = ref({
  user: '',
  module: '',
  page: '',
  date: [] as string[]
})

const pagination = ref({
  page: 1,
  pageSize: 20,
  total: 156
})

const operationLogs = ref<OperationLog[]>([
  {
    id: 1,
    user_id: 1,
    username: 'admin',
    role: 'admin',
    module: 'news',
    action: 'create',
    details: '创建资讯：新版本1.5.0上线公告',
    ip_address: '192.168.1.100',
    created_at: '2024-01-15 14:32:18'
  },
  {
    id: 2,
    user_id: 2,
    username: 'operator',
    role: 'operator',
    module: 'events',
    action: 'update',
    details: '更新活动：周末双倍经验活动',
    ip_address: '192.168.1.101',
    created_at: '2024-01-15 13:45:22'
  },
  {
    id: 3,
    user_id: 1,
    username: 'admin',
    role: 'admin',
    module: 'settings',
    action: 'update',
    details: '更新系统设置：首页轮播图配置',
    ip_address: '192.168.1.100',
    created_at: '2024-01-15 11:20:05'
  },
  {
    id: 4,
    user_id: 2,
    username: 'operator',
    role: 'operator',
    module: 'media',
    action: 'upload',
    details: '批量上传媒体文件：10张游戏截图',
    ip_address: '192.168.1.101',
    created_at: '2024-01-15 10:15:33'
  },
  {
    id: 5,
    user_id: 1,
    username: 'admin',
    role: 'admin',
    module: 'users',
    action: 'create',
    details: '创建用户：运营人员 operator2',
    ip_address: '192.168.1.100',
    created_at: '2024-01-14 16:30:41'
  }
])

const accessLogs = ref<AccessLog[]>([
  {
    id: 1,
    path: '/',
    ip_address: '114.234.56.78',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    session_id: 'abc123xyz789',
    created_at: '2024-01-15 15:02:33'
  },
  {
    id: 2,
    path: '/news',
    ip_address: '114.234.56.78',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    session_id: 'abc123xyz789',
    created_at: '2024-01-15 15:03:12'
  },
  {
    id: 3,
    path: '/download',
    ip_address: '120.132.45.90',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    session_id: 'def456uvw012',
    created_at: '2024-01-15 15:01:45'
  },
  {
    id: 4,
    path: '/events',
    ip_address: '182.139.67.34',
    user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
    session_id: 'ghi789rst345',
    created_at: '2024-01-15 14:58:22'
  },
  {
    id: 5,
    path: '/news/detail/123',
    ip_address: '114.234.56.78',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    session_id: 'abc123xyz789',
    created_at: '2024-01-15 14:55:10'
  }
])

const getModuleLabel = (module: string): string => {
  const map: Record<string, string> = {
    news: '资讯管理',
    events: '活动管理',
    users: '用户管理',
    settings: '系统设置',
    media: '媒体库',
    tickets: '工单管理'
  }
  return map[module] || module
}

const getActionLabel = (action: string): string => {
  const map: Record<string, string> = {
    create: '创建',
    update: '更新',
    delete: '删除',
    upload: '上传',
    login: '登录',
    logout: '登出',
    export: '导出'
  }
  return map[action] || action
}

const handleSearch = (): void => {
  console.log('Search with filters:', filters.value)
}
</script>

<style scoped lang="scss">
.logs-page {
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  h2 {
    color: var(--text-primary);
    font-size: 24px;
    margin: 0;
  }

  .tabs {
    display: flex;
    gap: 8px;
  }

  .tab-btn {
    padding: 8px 20px;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    color: var(--text-secondary);
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s var(--ease-smooth);

    &:hover {
      border-color: var(--primary-color);
      color: var(--primary-color);
    }

    &.active {
      background: var(--gradient-primary);
      border-color: transparent;
      color: white;
    }
  }
}

.filter-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  align-items: center;

  .filter-left {
    display: flex;
    gap: 12px;
    flex: 1;
    flex-wrap: wrap;
  }

  .filter-select {
    width: 160px;
  }
}

.logs-table {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;

  table {
    width: 100%;
    border-collapse: collapse;

    th, td {
      padding: 14px 16px;
      text-align: left;
      font-size: 13px;
    }

    th {
      background: var(--bg-card-hover);
      color: var(--text-secondary);
      font-weight: 600;
      border-bottom: 1px solid var(--border-color);
    }

    td {
      border-bottom: 1px solid var(--border-color);
      color: var(--text-primary);
    }

    tr:last-child td {
      border-bottom: none;
    }

    tr:hover td {
      background: var(--bg-card-hover);
    }

    .time {
      color: var(--text-muted);
      font-variant-numeric: tabular-nums;
    }

    .details {
      max-width: 300px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .ip, .session {
      font-family: 'Courier New', monospace;
      color: var(--text-muted);
    }

    .path {
      color: var(--secondary-color);
    }

    .ua {
      max-width: 250px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: var(--text-muted);
      font-size: 12px;
    }
  }
}

.user-tag, .module-tag, .action-tag {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.user-tag {
  background: var(--bg-input);
  color: var(--text-primary);
  border: 1px solid var(--border-color);

  &.role-admin {
    background: linear-gradient(135deg, rgba(108, 60, 230, 0.8), rgba(108, 60, 230, 0.6));
    color: #ffffff;
    border-color: rgba(108, 60, 230, 0.8);
    font-weight: 600;
  }

  &.role-operator {
    background: linear-gradient(135deg, rgba(0, 245, 255, 0.8), rgba(0, 200, 255, 0.6));
    color: #0a1628;
    border-color: rgba(0, 245, 255, 0.8);
    font-weight: 600;
  }

  &.role-viewer {
    background: linear-gradient(135deg, rgba(120, 120, 120, 0.7), rgba(100, 100, 100, 0.5));
    color: #ffffff;
    border-color: rgba(120, 120, 120, 0.7);
    font-weight: 600;
  }
}

.module-tag {
  background: var(--bg-input);
  color: var(--text-secondary);
}

.action-tag {
  background: var(--bg-input);
  color: var(--text-secondary);

  &.action-create {
    background: rgba(76, 175, 80, 0.15);
    color: var(--accent-green);
  }

  &.action-update {
    background: rgba(33, 150, 243, 0.15);
    color: var(--accent-blue);
  }

  &.action-delete {
    background: rgba(244, 67, 54, 0.15);
    color: var(--accent-red);
  }

  &.action-upload {
    background: rgba(255, 193, 7, 0.15);
    color: var(--accent-orange);
  }
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
