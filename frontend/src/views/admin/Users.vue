<template>
  <div class="admin-users">
    <div class="page-header">
      <h2>用户管理</h2>
      <el-input
        v-model="keyword"
        placeholder="搜索用户"
        style="width: 250px"
        @keyup.enter="fetchUsers"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>
    
    <div v-if="loading" class="loading">
      <el-skeleton :rows="5" animated />
    </div>
    
    <template v-else>
      <el-table :data="users" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="nickname" label="昵称" width="150">
          <template #default="{ row }">
            <div class="user-cell">
              <el-avatar :size="32" :src="row.avatar">
                {{ row.nickname?.charAt(0) }}
              </el-avatar>
              <span>{{ row.nickname }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="username" label="用户名" width="150" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="role" label="角色" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.role === 'admin'" type="danger">管理员</el-tag>
            <el-tag v-else type="info">普通用户</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="isActive" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isActive ? 'success' : 'danger'">
              {{ row.isActive ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="noteCount" label="笔记数" width="100" />
        <el-table-column prop="followerCount" label="粉丝数" width="100" />
        <el-table-column prop="createdAt" label="注册时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button
              v-if="row.role !== 'admin'"
              :type="row.isActive ? 'danger' : 'success'"
              size="small"
              @click="toggleStatus(row.id, row.isActive)"
            >
              {{ row.isActive ? '禁用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div v-if="total > pageSize" class="pagination">
        <el-pagination
          v-model:current-page="page"
          :page-size="pageSize"
          :total="total"
          layout="total, prev, pager, next"
          @current-change="fetchUsers"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getUserList, toggleUserStatus } from '@/api/admin';
import { ElMessage } from 'element-plus';
import { Search } from '@element-plus/icons-vue';
import type { User } from '@/types';
import dayjs from 'dayjs';

const loading = ref(false);
const page = ref(1);
const pageSize = ref(10);
const total = ref(0);
const keyword = ref('');
const users = ref<User[]>([]);

const formatTime = (time: string) => {
  return dayjs(time).format('YYYY-MM-DD HH:mm');
};

const fetchUsers = async () => {
  loading.value = true;
  try {
    const res = await getUserList({
      page: page.value,
      pageSize: pageSize.value,
      keyword: keyword.value,
    });
    users.value = res.list;
    total.value = res.total;
  } catch (error) {
    console.error('获取用户列表失败:', error);
  } finally {
    loading.value = false;
  }
};

const toggleStatus = async (id: string, currentStatus: boolean) => {
  try {
    const res = await toggleUserStatus(id);
    const user = users.value.find(u => u.id === id);
    if (user) {
      user.isActive = res.isActive;
    }
    ElMessage.success(res.isActive ? '已启用' : '已禁用');
  } catch (error) {
    console.error('操作失败:', error);
  }
};

onMounted(() => {
  fetchUsers();
});
</script>

<style lang="scss" scoped>
.admin-users {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h2 {
      font-size: 20px;
      font-weight: 600;
      color: #333;
    }
  }
  
  .user-cell {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .pagination {
    text-align: center;
    margin-top: 20px;
  }
  
  .loading {
    background: #fff;
    border-radius: 12px;
    padding: 30px;
  }
}

:deep(.el-table) {
  border-radius: 12px;
  overflow: hidden;
}
</style>
