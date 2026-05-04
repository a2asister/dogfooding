<template>
  <div class="user-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <el-button 
            type="primary" 
            @click="handleAddUser"
            v-if="userStore.hasPermission('system:user:create')"
          >
            新增用户
          </el-button>
        </div>
      </template>
      
      <el-table :data="users" v-loading="loading" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="150" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="roles" label="角色" width="150">
          <template #default="scope">
            <el-tag v-for="role in scope.row.roles" :key="role" size="small" style="margin-right: 4px;">
              {{ role }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="subsystems" label="可访问子系统">
          <template #default="scope">
            <el-tag v-for="subsystem in scope.row.subsystems" :key="subsystem" type="success" size="small" style="margin-right: 4px;">
              {{ subsystem }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button 
              type="primary" 
              link 
              @click="handleEditUser(scope.row)"
              v-if="userStore.hasPermission('system:user:update')"
            >
              编辑
            </el-button>
            <el-button 
              type="danger" 
              link 
              @click="handleDeleteUser(scope.row)"
              v-if="userStore.hasPermission('system:user:delete')"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog 
      v-model="dialogVisible" 
      :title="isEdit ? '编辑用户' : '新增用户'" 
      width="500px"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" :disabled="isEdit" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!isEdit">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="角色" prop="roles">
          <el-select v-model="form.roles" multiple placeholder="请选择角色">
            <el-option label="管理员" value="admin" />
            <el-option label="数据分析师" value="data-analyst" />
            <el-option label="内容编辑" value="content-editor" />
          </el-select>
        </el-form-item>
        <el-form-item label="权限" prop="permissions">
          <el-select v-model="form.permissions" multiple placeholder="请选择权限">
            <el-option label="系统管理所有权限" value="system:*" />
            <el-option label="用户读取" value="system:user:read" />
            <el-option label="用户创建" value="system:user:create" />
            <el-option label="用户更新" value="system:user:update" />
            <el-option label="用户删除" value="system:user:delete" />
            <el-option label="数据分析所有权限" value="data:*" />
            <el-option label="内容管理所有权限" value="content:*" />
          </el-select>
        </el-form-item>
        <el-form-item label="子系统" prop="subsystems">
          <el-select v-model="form.subsystems" multiple placeholder="请选择可访问子系统">
            <el-option label="系统管理" value="system-admin" />
            <el-option label="数据分析" value="data-analytics" />
            <el-option label="内容管理" value="content-management" />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '../store/userStore'
import { userAPI } from '../services/api'

const userStore = useUserStore()
const loading = ref(false)
const users = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref(null)

const form = reactive({
  id: '',
  username: '',
  password: '',
  name: '',
  roles: [],
  permissions: [],
  subsystems: []
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }]
}

const loadUsers = async () => {
  loading.value = true
  try {
    const response = await userAPI.getUsers()
    if (response.data.success) {
      users.value = response.data.data
    }
  } catch (error) {
    console.error('Load users error:', error)
    ElMessage.error('加载用户列表失败')
  } finally {
    loading.value = false
  }
}

const handleAddUser = () => {
  isEdit.value = false
  Object.assign(form, {
    id: '',
    username: '',
    password: '',
    name: '',
    roles: [],
    permissions: [],
    subsystems: []
  })
  dialogVisible.value = true
}

const handleEditUser = (row) => {
  isEdit.value = true
  Object.assign(form, {
    id: row.id,
    username: row.username,
    password: '',
    name: row.name,
    roles: [...row.roles],
    permissions: [...row.permissions],
    subsystems: [...row.subsystems]
  })
  dialogVisible.value = true
}

const handleDeleteUser = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除用户 "${row.name}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const response = await userAPI.deleteUser(row.id)
    if (response.data.success) {
      ElMessage.success('删除成功')
      loadUsers()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Delete user error:', error)
      ElMessage.error('删除失败')
    }
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitLoading.value = true
    
    const userData = {
      username: form.username,
      name: form.name,
      roles: form.roles,
      permissions: form.permissions,
      subsystems: form.subsystems
    }
    
    if (form.password) {
      userData.password = form.password
    }
    
    let response
    if (isEdit.value) {
      response = await userAPI.updateUser(form.id, userData)
    } else {
      response = await userAPI.createUser(userData)
    }
    
    if (response.data.success) {
      ElMessage.success(isEdit.value ? '编辑成功' : '新增成功')
      dialogVisible.value = false
      loadUsers()
    }
  } catch (error) {
    console.error('Submit error:', error)
    ElMessage.error(error.response?.data?.message || '操作失败')
  } finally {
    submitLoading.value = false
  }
}

onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.user-management {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
