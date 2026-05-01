<template>
  <div>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="success" class="success">{{ success }}</div>

    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2 style="margin-bottom: 0; border: none; padding: 0;">员工考勤</h2>
        <button class="btn btn-primary" @click="openCreateModal">
          ➕ 添加考勤记录
        </button>
      </div>

      <div class="filter-section">
        <div class="form-group">
          <label>选择门店</label>
          <select v-model="selectedStoreId" @change="loadAttendances">
            <option value="">所有门店</option>
            <option v-for="store in stores" :key="store.id" :value="store.id">
              {{ store.name }}
            </option>
          </select>
        </div>
        <button class="btn btn-secondary" @click="loadAttendances">🔄 刷新</button>
      </div>

      <table v-if="attendances.length">
        <thead>
          <tr>
            <th>门店</th>
            <th>员工姓名</th>
            <th>日期</th>
            <th>上班打卡</th>
            <th>下班打卡</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="attendance in attendances" :key="attendance.id">
            <td>{{ getStoreName(attendance.storeId) }}</td>
            <td>{{ attendance.employeeName }}</td>
            <td>{{ attendance.date }}</td>
            <td>{{ attendance.checkIn }}</td>
            <td>{{ attendance.checkOut || '-' }}</td>
            <td :class="getStatusClass(attendance.status)">
              {{ getStatusName(attendance.status) }}
            </td>
            <td>
              <button class="btn btn-sm btn-success" @click="openEditModal(attendance)">
                编辑
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else class="loading">暂无考勤记录</p>
    </div>

    <!-- 创建/编辑考勤弹窗 -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ isEditing ? '编辑考勤' : '添加考勤记录' }}</h3>
          <button class="modal-close" @click="closeModal">&times;</button>
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>选择门店 *</label>
            <select v-model="formData.storeId" required @change="loadEmployees">
              <option value="">请选择门店</option>
              <option v-for="store in stores" :key="store.id" :value="store.id">
                {{ store.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>选择员工 *</label>
            <select v-model="selectedEmployeeId" required @change="updateEmployeeInfo">
              <option value="">请选择员工</option>
              <option v-for="emp in currentEmployees" :key="emp.id" :value="emp.id">
                {{ emp.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>日期 *</label>
            <input v-model="formData.date" type="date" required />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>上班打卡时间 *</label>
              <input v-model="formData.checkIn" type="time" required />
            </div>
            <div class="form-group">
              <label>下班打卡时间</label>
              <input v-model="formData.checkOut" type="time" />
            </div>
          </div>
          <div class="form-group">
            <label>状态</label>
            <select v-model="formData.status">
              <option value="pending">待确认</option>
              <option value="present">正常</option>
              <option value="absent">缺勤</option>
              <option value="late">迟到</option>
              <option value="early">早退</option>
            </select>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModal">
              取消
            </button>
            <button type="submit" class="btn btn-primary">
              {{ isEditing ? '保存修改' : '添加记录' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { attendanceApi } from '@/api/attendances';
import { storeApi } from '@/api/stores';
import { employeeApi } from '@/api/employees';
import { Attendance, Store, Employee } from '@/types';

const attendances = ref<Attendance[]>([]);
const stores = ref<Store[]>([]);
const employees = ref<Employee[]>([]);
const selectedStoreId = ref('');
const selectedEmployeeId = ref('');
const error = ref('');
const success = ref('');
const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref<string | null>(null);

const today = new Date().toISOString().split('T')[0];

const defaultFormData = {
  storeId: '',
  employeeId: '',
  employeeName: '',
  date: today,
  checkIn: '09:00',
  checkOut: null as string | null,
  status: 'pending' as const
};

const formData = ref({ ...defaultFormData });

const currentEmployees = computed(() => {
  if (!formData.value.storeId) return [];
  return employees.value.filter(e => e.storeId === formData.value.storeId);
});

const getStoreName = (storeId: string) => {
  const store = stores.value.find(s => s.id === storeId);
  return store ? store.name : '未知门店';
};

const getStatusClass = (status: string) => {
  const classMap: Record<string, string> = {
    pending: 'status-pending',
    present: 'status-active',
    absent: 'status-expired',
    late: 'status-pending',
    early: 'status-pending'
  };
  return classMap[status] || '';
};

const getStatusName = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: '待确认',
    present: '正常',
    absent: '缺勤',
    late: '迟到',
    early: '早退'
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

const loadEmployees = async () => {
  try {
    const response = await employeeApi.getAll();
    if (response.success && response.data) {
      employees.value = response.data;
    }
  } catch (err) {
    console.error('加载员工失败:', err);
  }
};

const updateEmployeeInfo = () => {
  const emp = employees.value.find(e => e.id === selectedEmployeeId.value);
  if (emp) {
    formData.value.employeeId = emp.id;
    formData.value.employeeName = emp.name;
  }
};

const loadAttendances = async () => {
  try {
    const response = await attendanceApi.getAll(selectedStoreId.value || undefined);
    if (response.success && response.data) {
      attendances.value = response.data.sort((a, b) => 
        b.date.localeCompare(a.date)
      );
    }
  } catch (err) {
    console.error('加载考勤数据失败:', err);
  }
};

const openCreateModal = () => {
  isEditing.value = false;
  editingId.value = null;
  formData.value = { ...defaultFormData };
  selectedEmployeeId.value = '';
  if (stores.value.length > 0) {
    formData.value.storeId = stores.value[0].id;
  }
  showModal.value = true;
};

const openEditModal = (attendance: Attendance) => {
  isEditing.value = true;
  editingId.value = attendance.id;
  formData.value = {
    storeId: attendance.storeId,
    employeeId: attendance.employeeId,
    employeeName: attendance.employeeName,
    date: attendance.date,
    checkIn: attendance.checkIn,
    checkOut: attendance.checkOut,
    status: attendance.status
  };
  selectedEmployeeId.value = attendance.employeeId;
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
    if (!formData.value.employeeId) {
      error.value = '请选择员工';
      return;
    }
    
    let response;
    
    if (isEditing.value && editingId.value) {
      response = await attendanceApi.update(editingId.value, formData.value);
    } else {
      response = await attendanceApi.create({
        storeId: formData.value.storeId,
        employeeId: formData.value.employeeId,
        employeeName: formData.value.employeeName,
        date: formData.value.date,
        checkIn: formData.value.checkIn,
        checkOut: formData.value.checkOut,
        status: formData.value.status
      });
    }

    if (response.success) {
      success.value = isEditing.value ? '考勤更新成功！' : '考勤记录添加成功！';
      closeModal();
      loadAttendances();
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
  loadAttendances();
});
</script>
