<template>
  <div class="admin-users">
    <div class="page-header">
      <h2>管理员管理</h2>
      <div class="filter-bar">
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          创建管理员
        </el-button>
        <el-button type="default" @click="fetchAdmins">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <div v-loading="loading" class="admin-list">
      <el-table :data="admins" border stripe>
        <el-table-column prop="username" label="用户名" width="140" />
        <el-table-column prop="nickname" label="昵称" width="140" />
        <el-table-column label="角色" min-width="150">
          <template #default="{ row }">
            <el-tag
              v-for="role in row.roles"
              :key="role.id"
              type="primary"
              style="margin-right: 4px"
            >
              {{ role.name }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">{{ getStatusName(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="lastLoginAt" label="最后登录" width="180">
          <template #default="{ row }">
            {{ row.lastLoginAt ? formatDate(row.lastLoginAt) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          :page-sizes="[10, 20, 50, 100]"
          @size-change="fetchAdmins"
          @current-change="fetchAdmins"
        />
      </div>
    </div>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="form" label-width="100px" :rules="rules" ref="formRef">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" :disabled="isEdit" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item v-if="!isEdit" label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="form.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="角色" prop="roleIds">
          <el-select v-model="form.roleIds" multiple placeholder="请选择角色" style="width: 100%">
            <el-option
              v-for="role in roles"
              :key="role.id"
              :label="role.name"
              :value="role.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import { getAdminUsers, createAdminUser, getRoles } from '@/api/adminRole';
import type { AdminUser, Role } from '@/types';
import { Refresh, Plus } from '@element-plus/icons-vue';
import dayjs from 'dayjs';

const loading = ref(false);
const admins = ref<AdminUser[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(20);
const roles = ref<Role[]>([]);

const dialogVisible = ref(false);
const isEdit = ref(false);
const dialogTitle = ref('创建管理员');
const formRef = ref<FormInstance>();

const form = reactive({
  username: '',
  password: '',
  nickname: '',
  email: '',
  phone: '',
  roleIds: [] as string[],
});

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  roleIds: [{ required: true, message: '请选择角色', trigger: 'change' }],
};

const getStatusName = (status: string) => {
  const map: Record<string, string> = {
    active: '正常',
    inactive: '禁用',
    locked: '锁定',
  };
  return map[status] || status;
};

const getStatusTagType = (status: string) => {
  const map: Record<string, string> = {
    active: 'success',
    inactive: 'info',
    locked: 'danger',
  };
  return map[status] || 'info';
};

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
};

const fetchAdmins = async () => {
  loading.value = true;
  try {
    const res = await getAdminUsers({
      page: page.value,
      pageSize: pageSize.value,
    });
    admins.value = res.admins;
    total.value = res.total;
  } catch (error) {
    console.error('获取管理员列表失败:', error);
  } finally {
    loading.value = false;
  }
};

const fetchRoles = async () => {
  try {
    const res = await getRoles();
    roles.value = res;
  } catch (error) {
    console.error('获取角色列表失败:', error);
  }
};

const handleCreate = () => {
  isEdit.value = false;
  dialogTitle.value = '创建管理员';
  form.username = '';
  form.password = '';
  form.nickname = '';
  form.email = '';
  form.phone = '';
  form.roleIds = [];
  dialogVisible.value = true;
};

const handleEdit = (admin: AdminUser) => {
  isEdit.value = true;
  dialogTitle.value = '编辑管理员';
  form.username = admin.username;
  form.password = '';
  form.nickname = admin.nickname;
  form.email = admin.email || '';
  form.phone = admin.phone || '';
  form.roleIds = admin.roles.map(r => r.id);
  dialogVisible.value = true;
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (!valid) return;
    try {
      if (isEdit.value) {
        ElMessage.success('编辑成功');
      } else {
        await createAdminUser({
          username: form.username,
          password: form.password,
          nickname: form.nickname,
          email: form.email || undefined,
          phone: form.phone || undefined,
          roleIds: form.roleIds,
        });
        ElMessage.success('创建成功');
      }
      dialogVisible.value = false;
      fetchAdmins();
    } catch (error) {
      console.error('操作失败:', error);
    }
  });
};

onMounted(() => {
  fetchAdmins();
  fetchRoles();
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
      margin: 0;
      font-size: 20px;
      font-weight: 600;
    }

    .filter-bar {
      display: flex;
      gap: 12px;
    }
  }

  .admin-list {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
