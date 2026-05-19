<template>
  <div class="role-permissions">
    <div class="page-header">
      <h2>角色权限管理</h2>
      <div class="filter-bar">
        <el-button type="primary" @click="fetchData">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
        <el-button type="success" @click="handleAddRole">
          <el-icon><Plus /></el-icon>
          新增角色
        </el-button>
      </div>
    </div>

    <div v-loading="loading" class="content">
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="role-list-card">
            <h3>角色列表</h3>
            <el-table :data="roles" border stripe @row-click="handleRoleClick" highlight-current-row>
              <el-table-column prop="name" label="角色名称" min-width="120" />
              <el-table-column prop="code" label="角色编码" min-width="120" />
              <el-table-column prop="isActive" label="状态" width="80">
                <template #default="{ row }">
                  <el-tag :type="row.isActive ? 'success' : 'info'" size="small">
                    {{ row.isActive ? '启用' : '禁用' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120">
                <template #default="{ row }">
                  <el-button type="primary" size="small" @click.stop="handleEditRole(row)">
                    编辑
                  </el-button>
                  <el-button
                    type="danger"
                    size="small"
                    @click.stop="handleDeleteRole(row)"
                    :disabled="row.isSystem"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-col>
        <el-col :span="16">
          <div class="permission-list-card">
            <h3>
              <span v-if="currentRole">「{{ currentRole.name }}」权限配置</span>
              <span v-else>请选择角色查看权限</span>
            </h3>
            <div v-if="currentRole" class="permission-tree-wrapper">
              <el-tree
                ref="treeRef"
                :data="permissionTree"
                :props="{ children: 'children', label: 'name' }"
                show-checkbox
                node-key="id"
                default-expand-all
                :default-checked-keys="checkedKeys"
              />
              <div class="permission-actions">
                <el-button type="primary" @click="handleSavePermissions">保存权限</el-button>
                <el-button @click="resetCheckedKeys">重置</el-button>
              </div>
            </div>
            <el-empty v-else description="请选择左侧角色查看权限配置" />
          </div>
        </el-col>
      </el-row>
    </div>

    <el-dialog v-model="dialogVisible" :title="isEditRole ? '编辑角色' : '新增角色'" width="500px">
      <el-form :model="roleForm" :rules="roleRules" ref="roleFormRef" label-width="80px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="roleForm.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色编码" prop="code">
          <el-input v-model="roleForm.code" placeholder="请输入角色编码" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="roleForm.description" type="textarea" :rows="3" placeholder="请输入描述（选填）" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="roleForm.isActive" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitRole">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue';
import { ElMessage, ElMessageBox, type FormInstance, type TreeInstance } from 'element-plus';
import { getRoles, getPermissions, createRole, updateRole, deleteRole } from '@/api/adminRole';
import type { Role, Permission } from '@/types';
import { Refresh, Plus } from '@element-plus/icons-vue';

const loading = ref(false);
const roles = ref<Role[]>([]);
const permissions = ref<Permission[]>([]);
const permissionTree = ref<Permission[]>([]);
const currentRole = ref<Role | null>(null);
const checkedKeys = ref<string[]>([]);
const dialogVisible = ref(false);
const isEditRole = ref(false);
const currentRoleId = ref('');
const roleFormRef = ref<FormInstance>();
const treeRef = ref<TreeInstance>();

const roleForm = reactive({
  name: '',
  code: '',
  description: '',
  isActive: true,
});

const roleRules = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入角色编码', trigger: 'blur' }],
};

const buildPermissionTree = (perms: Permission[]): Permission[] => {
  const map = new Map<string, Permission>();
  const roots: Permission[] = [];

  perms.forEach(perm => {
    map.set(perm.id, { ...perm, children: [] });
  });

  perms.forEach(perm => {
    const node = map.get(perm.id)!;
    if (perm.parentId && map.has(perm.parentId)) {
      const parent = map.get(perm.parentId)!;
      if (!parent.children) parent.children = [];
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots.sort((a, b) => a.sort - b.sort);
};

const fetchData = async () => {
  loading.value = true;
  try {
    const [rolesRes, permsRes] = await Promise.all([getRoles(), getPermissions()]);
    roles.value = rolesRes;
    permissions.value = permsRes;
    permissionTree.value = buildPermissionTree(permsRes);
  } catch (error) {
    console.error('获取数据失败:', error);
  } finally {
    loading.value = false;
  }
};

const handleRoleClick = (row: Role) => {
  currentRole.value = row;
  checkedKeys.value = row.permissions?.map(p => p.id) || [];
  nextTick(() => {
    treeRef.value?.setCheckedKeys(checkedKeys.value);
  });
};

const handleAddRole = () => {
  isEditRole.value = false;
  currentRoleId.value = '';
  Object.assign(roleForm, {
    name: '',
    code: '',
    description: '',
    isActive: true,
  });
  dialogVisible.value = true;
};

const handleEditRole = (role: Role) => {
  isEditRole.value = true;
  currentRoleId.value = role.id;
  Object.assign(roleForm, {
    name: role.name,
    code: role.code,
    description: role.description || '',
    isActive: role.isActive,
  });
  dialogVisible.value = true;
};

const handleDeleteRole = async (role: Role) => {
  try {
    await ElMessageBox.confirm('确定要删除该角色吗？', '确认', { type: 'warning' });
    await deleteRole(role.id);
    ElMessage.success('删除成功');
    if (currentRole.value?.id === role.id) {
      currentRole.value = null;
    }
    fetchData();
  } catch (error) {
    console.error('删除失败:', error);
  }
};

const handleSubmitRole = async () => {
  if (!roleFormRef.value) return;
  await roleFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const data = {
          name: roleForm.name,
          code: roleForm.code,
          description: roleForm.description || undefined,
          isActive: roleForm.isActive,
          permissionIds: [],
        };
        if (isEditRole.value) {
          await updateRole(currentRoleId.value, data);
          ElMessage.success('更新成功');
        } else {
          await createRole(data);
          ElMessage.success('创建成功');
        }
        dialogVisible.value = false;
        fetchData();
      } catch (error) {
        console.error('提交失败:', error);
      }
    }
  });
};

const handleSavePermissions = async () => {
  if (!currentRole.value) return;
  const checkedNodes = treeRef.value?.getCheckedNodes() as Permission[] || [];
  const permissionIds = checkedNodes.map(p => p.id);
  try {
    await updateRole(currentRole.value.id, { permissionIds });
    ElMessage.success('权限保存成功');
    if (currentRole.value) {
      currentRole.value.permissions = checkedNodes;
    }
  } catch (error) {
    console.error('保存权限失败:', error);
  }
};

const resetCheckedKeys = () => {
  if (currentRole.value) {
    checkedKeys.value = currentRole.value.permissions?.map(p => p.id) || [];
    treeRef.value?.setCheckedKeys(checkedKeys.value);
  }
};

onMounted(() => {
  fetchData();
});
</script>

<style lang="scss" scoped>
.role-permissions {
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

  .content {
    .role-list-card,
    .permission-list-card {
      background: #fff;
      border-radius: 8px;
      padding: 20px;

      h3 {
        margin: 0 0 16px 0;
        font-size: 16px;
        font-weight: 600;
      }
    }

    .permission-tree-wrapper {
      .permission-tree {
        max-height: 500px;
        overflow: auto;
      }

      .permission-actions {
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid #f0f0f0;
        display: flex;
        gap: 12px;
        justify-content: flex-end;
      }
    }
  }
}
</style>
