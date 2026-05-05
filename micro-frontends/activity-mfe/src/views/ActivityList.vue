<template>
  <div class="activity-list-page">
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="filters">
        <el-form-item label="活动类型">
          <el-select v-model="filters.type" placeholder="全部类型" clearable style="width: 150px">
            <el-option label="促销活动" value="promotion" />
            <el-option label="新用户专享" value="new_user" />
            <el-option label="会员专享" value="member" />
            <el-option label="限时秒杀" value="flash_sale" />
          </el-select>
        </el-form-item>
        <el-form-item label="活动状态">
          <el-select v-model="filters.status" placeholder="全部状态" clearable style="width: 150px">
            <el-option label="活跃中" value="active" />
            <el-option label="已结束" value="ended" />
            <el-option label="待开始" value="scheduled" />
            <el-option label="草稿" value="draft" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input
            v-model="filters.keyword"
            placeholder="搜索活动名称或描述"
            clearable
            style="width: 250px"
            @keyup.enter="search"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="search">
            <el-icon><Search /></el-icon> 搜索
          </el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="list-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>活动列表</span>
          <el-button type="primary" @click="createActivity">
            <el-icon><Plus /></el-icon> 新建活动
          </el-button>
        </div>
      </template>

      <el-table :data="activities" v-loading="loading" stripe style="width: 100%">
        <el-table-column prop="name" label="活动名称" min-width="200">
          <template #default="scope">
            <div class="activity-name-cell">
              <img :src="scope.row.banner || defaultBanner" class="activity-banner" />
              <div>
                <div class="name">{{ scope.row.name }}</div>
                <div class="desc">{{ scope.row.description }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="120">
          <template #default="scope">
            <el-tag :type="getTypeTagType(scope.row.type)">
              {{ getTypeLabel(scope.row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">
              {{ getStatusLabel(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="活动时间" width="220">
          <template #default="scope">
            <div class="time-column">
              <div><el-icon><Timer /></el-icon> 开始: {{ scope.row.formattedStartTime }}</div>
              <div><el-icon><CircleClose /></el-icon> 结束: {{ scope.row.formattedEndTime }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级" width="80" align="center">
          <template #default="scope">
            <el-badge :value="scope.row.priority" :max="99" class="item">
              <span class="priority-badge">{{ scope.row.priority }}</span>
            </el-badge>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="scope">
            <el-button type="primary" link @click="viewDetail(scope.row)">
              <el-icon><View /></el-icon> 详情
            </el-button>
            <el-button type="primary" link @click="editActivity(scope.row)">
              <el-icon><Edit /></el-icon> 编辑
            </el-button>
            <el-button type="danger" link @click="deleteActivity(scope.row)">
              <el-icon><Delete /></el-icon> 删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadActivities"
        @current-change="loadActivities"
        style="margin-top: 20px; justify-content: flex-end; display: flex"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  Search, Plus, View, Edit, Delete, Timer, CircleClose
} from '@element-plus/icons-vue';
import axios from 'axios';

const router = useRouter();
const API_BASE = 'http://localhost:3002/api';

const loading = ref(false);
const activities = ref([]);
const defaultBanner = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=default%20promotion%20activity%20banner%20colorful&image_size=square';

const filters = ref({
  type: '',
  status: '',
  keyword: ''
});

const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
});

const getTypeLabel = (type) => {
  const labels = {
    promotion: '促销活动',
    new_user: '新用户专享',
    member: '会员专享',
    flash_sale: '限时秒杀'
  };
  return labels[type] || type;
};

const getTypeTagType = (type) => {
  const types = {
    promotion: 'danger',
    new_user: 'success',
    member: 'warning',
    flash_sale: 'primary'
  };
  return types[type] || 'info';
};

const getStatusLabel = (status) => {
  const labels = {
    active: '活跃中',
    ended: '已结束',
    scheduled: '待开始',
    draft: '草稿'
  };
  return labels[status] || status;
};

const getStatusTagType = (status) => {
  const types = {
    active: 'success',
    ended: 'info',
    scheduled: 'warning',
    draft: 'danger'
  };
  return types[status] || 'info';
};

const loadActivities = async () => {
  loading.value = true;
  try {
    const params = {
      limit: pagination.value.pageSize,
      offset: (pagination.value.currentPage - 1) * pagination.value.pageSize,
      ...(filters.value.type && { type: filters.value.type }),
      ...(filters.value.status && { status: filters.value.status }),
      ...(filters.value.keyword && { keyword: filters.value.keyword })
    };

    const response = await axios.get(`${API_BASE}/activities`, { params });
    if (response.data.success) {
      activities.value = response.data.data;
      pagination.value.total = response.data.pagination.total;
    }
  } catch (error) {
    ElMessage.error('加载活动列表失败');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const search = () => {
  pagination.value.currentPage = 1;
  loadActivities();
};

const resetFilters = () => {
  filters.value = {
    type: '',
    status: '',
    keyword: ''
  };
  pagination.value.currentPage = 1;
  loadActivities();
};

const createActivity = () => {
  router.push('/create');
};

const editActivity = (row) => {
  router.push(`/edit/${row.id}`);
};

const viewDetail = (row) => {
  router.push(`/detail/${row.id}`);
};

const deleteActivity = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除活动「${row.name}」吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    const response = await axios.delete(`${API_BASE}/activities/${row.id}`);
    if (response.data.success) {
      ElMessage.success('删除成功');
      loadActivities();
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败');
      console.error(error);
    }
  }
};

onMounted(() => {
  loadActivities();
});
</script>

<style scoped>
.activity-list-page {
  gap: 20px;
  display: flex;
  flex-direction: column;
}

.filter-card {
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.95);
}

.list-card {
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.95);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 16px;
}

.activity-name-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.activity-banner {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
}

.activity-name-cell .name {
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 4px;
}

.activity-name-cell .desc {
  font-size: 12px;
  color: #6c757d;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.time-column {
  font-size: 12px;
  color: #6c757d;
  line-height: 1.8;
}

.time-column .el-icon {
  margin-right: 4px;
}

.priority-badge {
  display: inline-block;
  width: 32px;
  height: 32px;
  line-height: 32px;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  font-weight: 600;
  font-size: 14px;
}
</style>
