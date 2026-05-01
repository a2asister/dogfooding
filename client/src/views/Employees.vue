<template>
  <div>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="success" class="success">{{ success }}</div>

    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2 style="margin-bottom: 0; border: none; padding: 0;">员工管理</h2>
        <button class="btn btn-primary" @click="openCreateModal">
          ➕ 添加员工
        </button>
      </div>

      <div class="filter-section">
        <div class="form-group">
          <label>选择门店</label>
          <select v-model="selectedStoreId" @change="loadEmployees">
            <option value="">所有门店</option>
            <option v-for="store in stores" :key="store.id" :value="store.id">
              {{ store.name }}
            </option>
          </select>
        </div>
        <button class="btn btn-secondary" @click="loadEmployees">🔄 刷新</button>
      </div>

      <table v-if="employees.length">
        <thead>
          <tr>
            <th>员工姓名</th>
            <th>门店</th>
            <th>职位</th>
            <th>电话</th>
            <th>邮箱</th>
            <th>状态</th>
            <th>入职时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="emp in employees" :key="emp.id">
            <td>{{ emp.name }}</td>
            <td>{{ getStoreName(emp.storeId) }}</td>
            <td>{{ emp.position }}</td>
            <td>{{ emp.phone }}</td>
            <td>{{ emp.email }}</td>
            <td :class="emp.status === 'active' ? 'status-active' : 'status-inactive'">
              {{ emp.status === 'active' ? '在职' : '离职' }}
            </td>
            <td>{{ formatDate(emp.createdAt) }}</td>
            <td>
              <button class="btn btn-sm btn-success" @click="openEditModal(emp)">
                编辑
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else class="loading">暂无员工数据</p>
    </div>

    <!-- 创建/编辑员工弹窗 -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ isEditing ? '编辑员工' : '添加员工' }}</h3>
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
          <div class="form-group">
            <label>员工姓名 *</label>
            <input v-model="formData.name" type="text" required placeholder="请输入员工姓名" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>职位 *</label>
              <select v-model="formData.position" required>
                <option value="">请选择职位</option>
                <option value="店长">店长</option>
                <option value="副店长">副店长</option>
                <option value="导购员">导购员</option>
                <option value="收银员">收银员</option>
                <option value="理货员">理货员</option>
                <option value="其他">其他</option>
              </select>
            </div>
            <div class="form-group">
              <label>状态</label>
              <select v-model="formData.status">
                <option value="active">在职</option>
                <option value="inactive">离职</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>电话 *</label>
              <input v-model="formData.phone" type="text" required placeholder="请输入联系电话" />
            </div>
            <div class="form-group">
              <label>邮箱</label>
              <input v-model="formData.email" type="email" placeholder="请输入邮箱" />
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModal">
              取消
            </button>
            <button type="submit" class="btn btn-primary">
              {{ isEditing ? '保存修改' : '添加员工' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { employeeApi } from '@/api/employees';
import { storeApi } from '@/api/stores';
import { Employee, Store } from '@/types';

const employees = ref<Employee[]>([]);
const stores = ref<Store[]>([]);
const selectedStoreId = ref('');
const error = ref('');
const success = ref('');
const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref<string | null>(null);

const defaultFormData = {
  storeId: '',
  name: '',
  position: '',
  phone: '',
  email: '',
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

const loadEmployees = async () => {
  try {
    const response = await employeeApi.getAll(selectedStoreId.value || undefined);
    if (response.success && response.data) {
      employees.value = response.data;
    }
  } catch (err) {
    console.error('加载员工数据失败:', err);
  }
};

const openCreateModal = () => {
  isEditing.value = false;
  editingId.value = null;
  formData.value = { ...defaultFormData };
  if (stores.value.length > 0) {
    formData.value.storeId = stores.value[0].id;
  }
  showModal.value = true;
};

const openEditModal = (emp: Employee) => {
  isEditing.value = true;
  editingId.value = emp.id;
  formData.value = {
    storeId: emp.storeId,
    name: emp.name,
    position: emp.position,
    phone: emp.phone,
    email: emp.email,
    status: emp.status
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
      response = await employeeApi.update(editingId.value, formData.value);
    } else {
      response = await employeeApi.create({
        storeId: formData.value.storeId,
        name: formData.value.name,
        position: formData.value.position,
        phone: formData.value.phone,
        email: formData.value.email,
        status: formData.value.status
      });
    }

    if (response.success) {
      success.value = isEditing.value ? '员工信息更新成功！' : '员工添加成功！';
      closeModal();
      loadEmployees();
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
  loadEmployees();
});
</script>
