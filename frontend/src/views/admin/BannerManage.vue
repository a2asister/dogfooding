<template>
  <div class="banner-manage">
    <div class="page-header">
      <h2>Banner管理</h2>
      <div class="filter-bar">
        <el-select v-model="filterPosition" placeholder="展示位置" style="width: 140px" @change="fetchBanners">
          <el-option label="全部" value="" />
          <el-option label="首页顶部" value="home_top" />
          <el-option label="首页中部" value="home_middle" />
          <el-option label="话题顶部" value="topic_top" />
        </el-select>
        <el-switch
          v-model="includeInactive"
          active-text="包含已禁用"
          inactive-text="仅启用"
          @change="fetchBanners"
        />
        <el-button type="primary" @click="fetchBanners">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
        <el-button type="success" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增Banner
        </el-button>
      </div>
    </div>

    <div v-loading="loading" class="banner-list">
      <el-table :data="banners" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="图片" width="120">
          <template #default="{ row }">
            <el-image
              :src="row.image"
              :preview-src-list="[row.image]"
              fit="cover"
              style="width: 100px; height: 50px; border-radius: 4px"
            />
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="150" show-overflow-tooltip />
        <el-table-column prop="position" label="位置" width="120">
          <template #default="{ row }">
            <el-tag :type="getPositionTagType(row.position)">{{ getPositionName(row.position) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="跳转类型" width="100">
          <template #default="{ row }">
            {{ getTypeName(row.type) }}
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column prop="clickCount" label="点击量" width="100" />
        <el-table-column prop="isActive" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isActive ? 'success' : 'info'">
              {{ row.isActive ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="有效期" width="200">
          <template #default="{ row }">
            <span v-if="row.startTime || row.endTime">
              <span v-if="row.startTime">{{ formatDate(row.startTime) }}</span>
              <span> ~ </span>
              <span v-if="row.endTime">{{ formatDate(row.endTime) }}</span>
              <span v-else>永久</span>
            </span>
            <span v-else>永久有效</span>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="warning" size="small" @click="handleToggle(row)">
              {{ row.isActive ? '禁用' : '启用' }}
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑Banner' : '新增Banner'" width="600px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入Banner标题" />
        </el-form-item>
        <el-form-item label="图片" prop="image">
          <el-upload
            class="banner-upload"
            :action="uploadUrl"
            :headers="uploadHeaders"
            :show-file-list="false"
            :on-success="handleUploadSuccess"
            :before-upload="beforeUpload"
            accept="image/*"
          >
            <el-image
              v-if="form.image"
              :src="form.image"
              fit="cover"
              style="width: 200px; height: 100px; border-radius: 4px"
            />
            <el-icon v-else class="upload-icon"><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">建议尺寸: 1080 x 300 像素</div>
        </el-form-item>
        <el-form-item label="展示位置" prop="position">
          <el-select v-model="form.position" placeholder="请选择展示位置" style="width: 100%">
            <el-option label="首页顶部" value="home_top" />
            <el-option label="首页中部" value="home_middle" />
            <el-option label="话题顶部" value="topic_top" />
          </el-select>
        </el-form-item>
        <el-form-item label="跳转类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择跳转类型" style="width: 100%" @change="handleTypeChange">
            <el-option label="笔记" value="note" />
            <el-option label="话题" value="topic" />
            <el-option label="链接" value="url" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="form.type === 'note'" label="目标笔记ID" prop="targetId">
          <el-input v-model="form.targetId" placeholder="请输入笔记ID" />
        </el-form-item>
        <el-form-item v-if="form.type === 'topic'" label="目标话题ID" prop="targetId">
          <el-input v-model="form.targetId" placeholder="请输入话题ID" />
        </el-form-item>
        <el-form-item v-if="form.type === 'url'" label="目标链接" prop="targetUrl">
          <el-input v-model="form.targetUrl" placeholder="请输入跳转链接" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="2" placeholder="请输入描述（选填）" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" :max="999" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.isActive" />
        </el-form-item>
        <el-form-item label="有效期">
          <el-date-picker
            v-model="form.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
          <div class="form-tip">不填则永久有效</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox, type FormInstance, type UploadProps } from 'element-plus';
import { getBanners, createBanner, updateBanner, deleteBanner } from '@/api/operation';
import type { Banner } from '@/types';
import { Refresh, Plus } from '@element-plus/icons-vue';
import dayjs from 'dayjs';

const loading = ref(false);
const banners = ref<Banner[]>([]);
const filterPosition = ref('');
const includeInactive = ref(false);
const dialogVisible = ref(false);
const isEdit = ref(false);
const formRef = ref<FormInstance>();
const currentId = ref('');
const uploadUrl = '/api/files/image';
const uploadHeaders = {
  Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
};

const form = reactive({
  title: '',
  image: '',
  position: 'home_top',
  type: 'note' as 'note' | 'topic' | 'url',
  targetId: '',
  targetUrl: '',
  description: '',
  sort: 0,
  isActive: true,
  dateRange: [] as string[],
});

const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  image: [{ required: true, message: '请上传图片', trigger: 'change' }],
  position: [{ required: true, message: '请选择展示位置', trigger: 'change' }],
  type: [{ required: true, message: '请选择跳转类型', trigger: 'change' }],
};

const getPositionName = (position: string) => {
  const map: Record<string, string> = {
    home_top: '首页顶部',
    home_middle: '首页中部',
    topic_top: '话题顶部',
  };
  return map[position] || position;
};

const getPositionTagType = (position: string) => {
  const map: Record<string, string> = {
    home_top: 'primary',
    home_middle: 'success',
    topic_top: 'warning',
  };
  return map[position] || 'info';
};

const getTypeName = (type: string) => {
  const map: Record<string, string> = {
    note: '笔记',
    topic: '话题',
    url: '链接',
  };
  return map[type] || type;
};

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
};

const fetchBanners = async () => {
  loading.value = true;
  try {
    const res = await getBanners({
      position: filterPosition.value || undefined,
      includeInactive: includeInactive.value,
    });
    banners.value = res.banners;
  } catch (error) {
    console.error('获取Banner列表失败:', error);
  } finally {
    loading.value = false;
  }
};

const handleAdd = () => {
  isEdit.value = false;
  currentId.value = '';
  Object.assign(form, {
    title: '',
    image: '',
    position: 'home_top',
    type: 'note' as const,
    targetId: '',
    targetUrl: '',
    description: '',
    sort: 0,
    isActive: true,
    dateRange: [],
  });
  dialogVisible.value = true;
};

const handleEdit = (banner: Banner) => {
  isEdit.value = true;
  currentId.value = banner.id;
  Object.assign(form, {
    title: banner.title,
    image: banner.image,
    position: banner.position,
    type: banner.type,
    targetId: banner.targetId || '',
    targetUrl: banner.targetUrl || '',
    description: banner.description || '',
    sort: banner.sort,
    isActive: banner.isActive,
    dateRange: [],
  });
  if (banner.startTime && banner.endTime) {
    form.dateRange = [banner.startTime, banner.endTime];
  }
  dialogVisible.value = true;
};

const handleToggle = async (banner: Banner) => {
  try {
    await ElMessageBox.confirm(
      `确定要${banner.isActive ? '禁用' : '启用'}该Banner吗？`,
      '确认',
      { type: 'warning' }
    );
    await updateBanner(banner.id, { isActive: !banner.isActive });
    ElMessage.success('操作成功');
    fetchBanners();
  } catch (error) {
    console.error('切换状态失败:', error);
  }
};

const handleDelete = async (banner: Banner) => {
  try {
    await ElMessageBox.confirm('确定要删除该Banner吗？', '确认', { type: 'warning' });
    await deleteBanner(banner.id);
    ElMessage.success('删除成功');
    fetchBanners();
  } catch (error) {
    console.error('删除失败:', error);
  }
};

const handleTypeChange = () => {
  form.targetId = '';
  form.targetUrl = '';
};

const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  const isImage = file.type.startsWith('image/');
  if (!isImage) {
    ElMessage.error('只能上传图片文件!');
    return false;
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!');
    return false;
  }
  return true;
};

const handleUploadSuccess = (response: any) => {
  if (response.data?.url) {
    form.image = response.data.url;
  } else if (response.url) {
    form.image = response.url;
  }
  ElMessage.success('上传成功');
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const data: any = {
          title: form.title,
          image: form.image,
          position: form.position,
          type: form.type,
          description: form.description || undefined,
          sort: form.sort,
          isActive: form.isActive,
        };
        if (form.type === 'url') {
          data.targetUrl = form.targetUrl;
        } else {
          data.targetId = form.targetId;
        }
        if (form.dateRange && form.dateRange.length === 2) {
          data.startTime = form.dateRange[0];
          data.endTime = form.dateRange[1];
        }
        if (isEdit.value) {
          await updateBanner(currentId.value, data);
          ElMessage.success('更新成功');
        } else {
          await createBanner(data);
          ElMessage.success('创建成功');
        }
        dialogVisible.value = false;
        fetchBanners();
      } catch (error) {
        console.error('提交失败:', error);
      }
    }
  });
};

onMounted(() => {
  fetchBanners();
});
</script>

<style lang="scss" scoped>
.banner-manage {
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
      align-items: center;
    }
  }

  .banner-list {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
  }

  .banner-upload {
    :deep(.el-upload) {
      border: 1px dashed #d9d9d9;
      border-radius: 4px;
      cursor: pointer;
      position: relative;
      overflow: hidden;

      &:hover {
        border-color: #409eff;
      }
    }

    .upload-icon {
      font-size: 28px;
      color: #8c939d;
      width: 200px;
      height: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .upload-tip {
    margin-top: 8px;
    font-size: 12px;
    color: #999;
  }

  .form-tip {
    margin-top: 4px;
    font-size: 12px;
    color: #999;
  }
}
</style>
