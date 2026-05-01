<template>
  <div>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="success" class="success">{{ success }}</div>

    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2 style="margin-bottom: 0; border: none; padding: 0;">库存管理</h2>
        <button class="btn btn-primary" @click="openCreateModal">
          ➕ 添加商品
        </button>
      </div>

      <div class="filter-section">
        <div class="form-group">
          <label>选择门店</label>
          <select v-model="selectedStoreId" @change="loadInventories">
            <option value="">所有门店</option>
            <option v-for="store in stores" :key="store.id" :value="store.id">
              {{ store.name }}
            </option>
          </select>
        </div>
        <button class="btn btn-secondary" @click="loadInventories">🔄 刷新</button>
      </div>

      <table v-if="inventories.length">
        <thead>
          <tr>
            <th>商品名称</th>
            <th>SKU</th>
            <th>门店</th>
            <th>库存数量</th>
            <th>单价</th>
            <th>库存价值</th>
            <th>单位</th>
            <th>更新时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in inventories" :key="item.id">
            <td>{{ item.productName }}</td>
            <td>{{ item.sku }}</td>
            <td>{{ getStoreName(item.storeId) }}</td>
            <td :style="{ color: item.quantity < 10 ? '#ef4444' : '#333' }">
              {{ item.quantity }}
              <span v-if="item.quantity < 10" style="color: #ef4444; font-size: 12px;">(库存低)</span>
            </td>
            <td>¥{{ item.price }}</td>
            <td>¥{{ item.quantity * item.price }}</td>
            <td>{{ item.unit }}</td>
            <td>{{ formatDate(item.updatedAt) }}</td>
            <td>
              <button class="btn btn-sm btn-success" @click="openEditModal(item)">
                编辑
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else class="loading">暂无库存数据</p>
    </div>

    <!-- 创建/编辑库存弹窗 -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ isEditing ? '编辑库存' : '添加商品' }}</h3>
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
            <label>商品名称 *</label>
            <input v-model="formData.productName" type="text" required placeholder="请输入商品名称" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>SKU *</label>
              <input v-model="formData.sku" type="text" required placeholder="请输入SKU编码" />
            </div>
            <div class="form-group">
              <label>单位</label>
              <select v-model="formData.unit">
                <option value="个">个</option>
                <option value="件">件</option>
                <option value="盒">盒</option>
                <option value="箱">箱</option>
                <option value="瓶">瓶</option>
                <option value="袋">袋</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>库存数量 *</label>
              <input v-model.number="formData.quantity" type="number" min="0" required placeholder="请输入库存数量" />
            </div>
            <div class="form-group">
              <label>单价（元） *</label>
              <input v-model.number="formData.price" type="number" min="0" step="0.01" required placeholder="请输入单价" />
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModal">
              取消
            </button>
            <button type="submit" class="btn btn-primary">
              {{ isEditing ? '保存修改' : '添加商品' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { inventoryApi } from '@/api/inventories';
import { storeApi } from '@/api/stores';
import { Inventory, Store } from '@/types';

const inventories = ref<Inventory[]>([]);
const stores = ref<Store[]>([]);
const selectedStoreId = ref('');
const error = ref('');
const success = ref('');
const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref<string | null>(null);

const defaultFormData = {
  storeId: '',
  productName: '',
  sku: '',
  quantity: 0,
  price: 0,
  unit: '个'
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

const loadInventories = async () => {
  try {
    const response = await inventoryApi.getAll(selectedStoreId.value || undefined);
    if (response.success && response.data) {
      inventories.value = response.data;
    }
  } catch (err) {
    console.error('加载库存数据失败:', err);
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

const openEditModal = (item: Inventory) => {
  isEditing.value = true;
  editingId.value = item.id;
  formData.value = {
    storeId: item.storeId,
    productName: item.productName,
    sku: item.sku,
    quantity: item.quantity,
    price: item.price,
    unit: item.unit
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
      response = await inventoryApi.update(editingId.value, formData.value);
    } else {
      response = await inventoryApi.create({
        storeId: formData.value.storeId,
        productName: formData.value.productName,
        sku: formData.value.sku,
        quantity: formData.value.quantity,
        price: formData.value.price,
        unit: formData.value.unit
      });
    }

    if (response.success) {
      success.value = isEditing.value ? '库存更新成功！' : '商品添加成功！';
      closeModal();
      loadInventories();
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
  loadInventories();
});
</script>
