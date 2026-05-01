<template>
  <div>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="success" class="success">{{ success }}</div>

    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2 style="margin-bottom: 0; border: none; padding: 0;">门店管理</h2>
        <button class="btn btn-primary" @click="openCreateModal">
          ➕ 添加门店
        </button>
      </div>

      <table v-if="stores.length">
        <thead>
          <tr>
            <th>门店名称</th>
            <th>地址</th>
            <th>店长</th>
            <th>联系电话</th>
            <th>状态</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="store in stores" :key="store.id">
            <td>{{ store.name }}</td>
            <td>{{ store.address }}</td>
            <td>{{ store.manager }}</td>
            <td>{{ store.phone }}</td>
            <td :class="store.status === 'active' ? 'status-active' : 'status-inactive'">
              {{ store.status === 'active' ? '启用' : '禁用' }}
            </td>
            <td>{{ formatDate(store.createdAt) }}</td>
            <td>
              <button class="btn btn-sm btn-success" @click="openEditModal(store)">
                编辑
              </button>
              <button class="btn btn-sm btn-danger" style="margin-left: 8px;" @click="handleDelete(store)">
                删除
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else class="loading">暂无门店数据</p>
    </div>

    <!-- 创建/编辑门店弹窗 -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ isEditing ? '编辑门店' : '添加门店' }}</h3>
          <button class="modal-close" @click="closeModal">&times;</button>
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>门店名称 *</label>
            <input v-model="formData.name" type="text" required placeholder="请输入门店名称" />
          </div>
          <div class="form-group">
            <label>地址 *</label>
            <input v-model="formData.address" type="text" required placeholder="请输入门店地址" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>店长 *</label>
              <input v-model="formData.manager" type="text" required placeholder="请输入店长姓名" />
            </div>
            <div class="form-group">
              <label>联系电话 *</label>
              <input v-model="formData.phone" type="text" required placeholder="请输入联系电话" />
            </div>
          </div>
          <div class="form-group">
            <label>状态</label>
            <select v-model="formData.status">
              <option value="active">启用</option>
              <option value="inactive">禁用</option>
            </select>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModal">
              取消
            </button>
            <button type="submit" class="btn btn-primary">
              {{ isEditing ? '保存修改' : '创建门店' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { storeApi } from '@/api/stores';
import { Store } from '@/types';

const stores = ref<Store[]>([]);
const error = ref('');
const success = ref('');
const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref<string | null>(null);

const defaultFormData = {
  name: '',
  address: '',
  manager: '',
  phone: '',
  status: 'active' as const
};

const formData = ref({ ...defaultFormData });

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('zh-CN');
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

const openCreateModal = () => {
  isEditing.value = false;
  editingId.value = null;
  formData.value = { ...defaultFormData };
  showModal.value = true;
};

const openEditModal = (store: Store) => {
  isEditing.value = true;
  editingId.value = store.id;
  formData.value = {
    name: store.name,
    address: store.address,
    manager: store.manager,
    phone: store.phone,
    status: store.status
  };
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
      response = await storeApi.update(editingId.value, formData.value);
    } else {
      response = await storeApi.create(formData.value);
    }

    if (response.success) {
      success.value = isEditing.value ? '门店更新成功！' : '门店创建成功！';
      closeModal();
      loadStores();
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

const handleDelete = async (store: Store) => {
  if (!confirm(`确定要删除门店 "${store.name}" 吗？`)) {
    return;
  }

  try {
    const response = await storeApi.delete(store.id);
    if (response.success) {
      success.value = '门店删除成功！';
      loadStores();
      setTimeout(() => {
        success.value = '';
      }, 3000);
    } else {
      error.value = response.message || '删除失败';
    }
  } catch (err) {
    error.value = '网络请求失败，请稍后重试';
    console.error(err);
  }
};

onMounted(() => {
  loadStores();
});
</script>
