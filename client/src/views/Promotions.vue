<template>
  <div>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="success" class="success">{{ success }}</div>

    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2 style="margin-bottom: 0; border: none; padding: 0;">营销活动</h2>
        <button class="btn btn-primary" @click="openCreateModal">
          ➕ 创建活动
        </button>
      </div>

      <div class="filter-section">
        <div class="form-group">
          <label>选择门店</label>
          <select v-model="selectedStoreId" @change="loadPromotions">
            <option value="">所有门店</option>
            <option v-for="store in stores" :key="store.id" :value="store.id">
              {{ store.name }}
            </option>
          </select>
        </div>
        <button class="btn btn-secondary" @click="loadPromotions">🔄 刷新</button>
      </div>

      <table v-if="promotions.length">
        <thead>
          <tr>
            <th>活动名称</th>
            <th>门店</th>
            <th>折扣类型</th>
            <th>折扣值</th>
            <th>最低消费</th>
            <th>开始日期</th>
            <th>结束日期</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="promo in promotions" :key="promo.id">
            <td>{{ promo.name }}</td>
            <td>{{ getStoreName(promo.storeId) }}</td>
            <td>
              <span :class="`discount-${promo.discountType}`">
                {{ getDiscountTypeName(promo.discountType) }}
              </span>
            </td>
            <td>{{ formatDiscountValue(promo) }}</td>
            <td>¥{{ promo.minPurchase }}</td>
            <td>{{ promo.startDate }}</td>
            <td>{{ promo.endDate }}</td>
            <td :class="getStatusClass(promo.status)">
              {{ getStatusName(promo.status) }}
            </td>
            <td>
              <button class="btn btn-sm btn-success" @click="openEditModal(promo)">
                编辑
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else class="loading">暂无营销活动</p>
    </div>

    <!-- 创建/编辑营销活动弹窗 -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ isEditing ? '编辑活动' : '创建活动' }}</h3>
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
            <label>活动名称 *</label>
            <input v-model="formData.name" type="text" required placeholder="请输入活动名称" />
          </div>
          <div class="form-group">
            <label>活动描述</label>
            <textarea v-model="formData.description" rows="3" placeholder="请输入活动描述"></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>折扣类型 *</label>
              <select v-model="formData.discountType" required>
                <option value="percentage">百分比折扣</option>
                <option value="fixed">固定金额减免</option>
                <option value="buyXGetY">买X送Y</option>
              </select>
            </div>
            <div class="form-group">
              <label>折扣值 *</label>
              <input v-model.number="formData.discountValue" type="number" min="0" required :placeholder="getDiscountPlaceholder()" />
            </div>
          </div>
          <div class="form-group">
            <label>最低消费金额（元）</label>
            <input v-model.number="formData.minPurchase" type="number" min="0" placeholder="0 表示无最低消费" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>开始日期 *</label>
              <input v-model="formData.startDate" type="date" required />
            </div>
            <div class="form-group">
              <label>结束日期 *</label>
              <input v-model="formData.endDate" type="date" required />
            </div>
          </div>
          <div class="form-group">
            <label>状态</label>
            <select v-model="formData.status">
              <option value="active">启用</option>
              <option value="inactive">禁用</option>
              <option value="expired">已过期</option>
            </select>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModal">
              取消
            </button>
            <button type="submit" class="btn btn-primary">
              {{ isEditing ? '保存修改' : '创建活动' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { promotionApi } from '@/api/promotions';
import { storeApi } from '@/api/stores';
import { Promotion, Store } from '@/types';

const promotions = ref<Promotion[]>([]);
const stores = ref<Store[]>([]);
const selectedStoreId = ref('');
const error = ref('');
const success = ref('');
const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref<string | null>(null);

const today = new Date().toISOString().split('T')[0];

const defaultFormData = {
  storeId: '',
  name: '',
  description: '',
  discountType: 'percentage' as const,
  discountValue: 10,
  minPurchase: 0,
  startDate: today,
  endDate: today,
  status: 'active' as const
};

const formData = ref({ ...defaultFormData });

const getStoreName = (storeId: string) => {
  const store = stores.value.find(s => s.id === storeId);
  return store ? store.name : '未知门店';
};

const getDiscountTypeName = (type: string) => {
  const typeMap: Record<string, string> = {
    percentage: '百分比折扣',
    fixed: '固定减免',
    buyXGetY: '买X送Y'
  };
  return typeMap[type] || type;
};

const getDiscountPlaceholder = () => {
  if (formData.value.discountType === 'percentage') {
    return '折扣百分比（如 10 表示 9 折）';
  } else if (formData.value.discountType === 'fixed') {
    return '减免金额（元）';
  } else {
    return '送Y件（买X送Y）';
  }
};

const formatDiscountValue = (promo: Promotion) => {
  if (promo.discountType === 'percentage') {
    return `${100 - promo.discountValue}折`;
  } else if (promo.discountType === 'fixed') {
    return `¥${promo.discountValue}`;
  } else {
    return `买X送${promo.discountValue}`;
  }
};

const getStatusClass = (status: string) => {
  if (status === 'active') return 'status-active';
  if (status === 'expired') return 'status-expired';
  return 'status-inactive';
};

const getStatusName = (status: string) => {
  const statusMap: Record<string, string> = {
    active: '启用',
    inactive: '禁用',
    expired: '已过期'
  };
  return statusMap[status] || status;
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

const loadPromotions = async () => {
  try {
    const response = await promotionApi.getAll(selectedStoreId.value || undefined);
    if (response.success && response.data) {
      promotions.value = response.data;
    }
  } catch (err) {
    console.error('加载营销活动失败:', err);
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

const openEditModal = (promo: Promotion) => {
  isEditing.value = true;
  editingId.value = promo.id;
  formData.value = {
    storeId: promo.storeId,
    name: promo.name,
    description: promo.description,
    discountType: promo.discountType,
    discountValue: promo.discountValue,
    minPurchase: promo.minPurchase,
    startDate: promo.startDate,
    endDate: promo.endDate,
    status: promo.status
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
      response = await promotionApi.update(editingId.value, formData.value);
    } else {
      response = await promotionApi.create({
        storeId: formData.value.storeId,
        name: formData.value.name,
        description: formData.value.description,
        discountType: formData.value.discountType,
        discountValue: formData.value.discountValue,
        minPurchase: formData.value.minPurchase,
        startDate: formData.value.startDate,
        endDate: formData.value.endDate,
        status: formData.value.status
      });
    }

    if (response.success) {
      success.value = isEditing.value ? '活动更新成功！' : '活动创建成功！';
      closeModal();
      loadPromotions();
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
  loadPromotions();
});
</script>
