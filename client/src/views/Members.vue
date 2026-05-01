<template>
  <div>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="success" class="success">{{ success }}</div>

    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2 style="margin-bottom: 0; border: none; padding: 0;">会员管理</h2>
        <button class="btn btn-primary" @click="openCreateModal">
          ➕ 添加会员
        </button>
      </div>

      <div class="filter-section">
        <div class="form-group">
          <label>选择门店</label>
          <select v-model="selectedStoreId" @change="loadMembers">
            <option value="">所有门店</option>
            <option v-for="store in stores" :key="store.id" :value="store.id">
              {{ store.name }}
            </option>
          </select>
        </div>
        <button class="btn btn-secondary" @click="loadMembers">🔄 刷新</button>
      </div>

      <table v-if="members.length">
        <thead>
          <tr>
            <th>会员姓名</th>
            <th>手机号</th>
            <th>门店</th>
            <th>会员等级</th>
            <th>积分</th>
            <th>累计消费</th>
            <th>状态</th>
            <th>注册时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="member in members" :key="member.id">
            <td>{{ member.name }}</td>
            <td>{{ member.phone }}</td>
            <td>{{ getStoreName(member.storeId) }}</td>
            <td :class="`level-${member.level}`">
              {{ getLevelName(member.level) }}
            </td>
            <td>{{ member.points }}</td>
            <td>¥{{ member.totalSpent }}</td>
            <td :class="member.status === 'active' ? 'status-active' : 'status-inactive'">
              {{ member.status === 'active' ? '正常' : '禁用' }}
            </td>
            <td>{{ formatDate(member.createdAt) }}</td>
            <td>
              <button class="btn btn-sm btn-success" @click="openEditModal(member)">
                编辑
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else class="loading">暂无会员数据</p>
    </div>

    <!-- 创建/编辑会员弹窗 -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ isEditing ? '编辑会员' : '添加会员' }}</h3>
          <button class="modal-close" @click="closeModal">&times;</button>
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>选择门店 *</label>
            <select v-model="formData.storeId" required>
              <option value="">请选择门店</option>
              <option v-for="store in stores" :key="store.id" :value="store.id">
                {{ store.name }}
              </option>
            </select>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>会员姓名 *</label>
              <input v-model="formData.name" type="text" required placeholder="请输入会员姓名" />
            </div>
            <div class="form-group">
              <label>手机号 *</label>
              <input v-model="formData.phone" type="text" required placeholder="请输入手机号" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>会员等级</label>
              <select v-model="formData.level">
                <option value="bronze">青铜</option>
                <option value="silver">白银</option>
                <option value="gold">黄金</option>
                <option value="platinum">白金</option>
              </select>
            </div>
            <div class="form-group">
              <label>状态</label>
              <select v-model="formData.status">
                <option value="active">正常</option>
                <option value="inactive">禁用</option>
              </select>
            </div>
          </div>
          <div v-if="isEditing" class="form-row">
            <div class="form-group">
              <label>积分</label>
              <input v-model.number="editPoints" type="number" min="0" placeholder="请输入积分" />
            </div>
            <div class="form-group">
              <label>累计消费（元）</label>
              <input v-model.number="editTotalSpent" type="number" min="0" step="0.01" placeholder="请输入累计消费" />
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModal">
              取消
            </button>
            <button type="submit" class="btn btn-primary">
              {{ isEditing ? '保存修改' : '添加会员' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { memberApi } from '@/api/members';
import { storeApi } from '@/api/stores';
import { Member, Store } from '@/types';

const members = ref<Member[]>([]);
const stores = ref<Store[]>([]);
const selectedStoreId = ref('');
const error = ref('');
const success = ref('');
const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref<string | null>(null);
const editPoints = ref(0);
const editTotalSpent = ref(0);

const defaultFormData = {
  storeId: '',
  name: '',
  phone: '',
  level: 'bronze' as const,
  status: 'active' as const
};

const formData = ref({ ...defaultFormData });

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('zh-CN');
};

const getStoreName = (storeId: string) => {
  const store = stores.value.find(s => s.id === storeId);
  return store ? store.name : '未知门店';
};

const getLevelName = (level: string) => {
  const levelMap: Record<string, string> = {
    bronze: '青铜',
    silver: '白银',
    gold: '黄金',
    platinum: '白金'
  };
  return levelMap[level] || level;
};

const loadStores = async () => {
  try {
    const response = await storeApi.getAll();
    if (response.success && response.data) {
      stores.value = response.data;
    }
  } catch (err) {
    console.error('加载门店失败:', err);
  }
};

const loadMembers = async () => {
  try {
    const response = await memberApi.getAll(selectedStoreId.value || undefined);
    if (response.success && response.data) {
      members.value = response.data;
    }
  } catch (err) {
    console.error('加载会员数据失败:', err);
  }
};

const openCreateModal = () => {
  isEditing.value = false;
  editingId.value = null;
  formData.value = { ...defaultFormData };
  editPoints.value = 0;
  editTotalSpent.value = 0;
  if (stores.value.length > 0) {
    formData.value.storeId = stores.value[0].id;
  }
  showModal.value = true;
};

const openEditModal = (member: Member) => {
  isEditing.value = true;
  editingId.value = member.id;
  formData.value = {
    storeId: member.storeId,
    name: member.name,
    phone: member.phone,
    level: member.level,
    status: member.status
  };
  editPoints.value = member.points;
  editTotalSpent.value = member.totalSpent;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  error.value = '';
  success.value = '';
};

const handleSubmit = async () => {
  try {
    error.value = '';
    let response;
    
    if (isEditing.value && editingId.value) {
      const updateData = {
        ...formData.value,
        points: editPoints.value,
        totalSpent: editTotalSpent.value
      };
      response = await memberApi.update(editingId.value, updateData);
    } else {
      response = await memberApi.create({
        storeId: formData.value.storeId,
        name: formData.value.name,
        phone: formData.value.phone,
        level: formData.value.level,
        status: formData.value.status
      });
    }

    if (response.success) {
      success.value = isEditing.value ? '会员更新成功！' : '会员添加成功！';
      closeModal();
      loadMembers();
      setTimeout(() => {
        success.value = '';
      }, 3000);
    } else {
      error.value = response.message || '操作失败';
    }
  } catch (err) {
    error.value = '网络请求失败，请稍后重试';
    console.error(err);
  }
};

onMounted(() => {
  loadStores();
  loadMembers();
});
</script>
