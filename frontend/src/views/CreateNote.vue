<template>
  <Layout>
    <div class="create-note">
      <div class="form-card">
        <h2>发布新笔记</h2>
        
        <el-form ref="formRef" :model="form" label-width="80px">
          <el-form-item label="标题">
            <el-input v-model="form.title" placeholder="请输入标题" maxlength="100" show-word-limit />
          </el-form-item>
          
          <el-form-item label="内容">
            <el-input
              v-model="form.content"
              type="textarea"
              :rows="6"
              placeholder="请输入内容"
              maxlength="5000"
              show-word-limit
            />
          </el-form-item>
          
          <el-form-item label="图片">
            <el-upload
              :file-list="fileList"
              :on-change="handleUploadChange"
              :on-remove="handleRemove"
              :on-success="handleUploadSuccess"
              :before-upload="beforeUpload"
              list-type="picture-card"
              action="/api/files/image"
              name="image"
              :headers="{ Authorization: `Bearer ${userStore.token}` }"
              :limit="9"
              accept="image/*"
            >
              <el-icon><Plus /></el-icon>
            </el-upload>
          </el-form-item>
          
          <el-form-item label="话题">
            <el-select
              v-model="form.topics"
              multiple
              filterable
              allow-create
              placeholder="选择或创建话题"
              style="width: 100%"
            >
              <el-option v-for="topic in topicList" :key="topic" :label="topic" :value="topic" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="位置">
            <el-input v-model="form.location" placeholder="请输入位置（可选）" />
          </el-form-item>
          
          <el-form-item label="权限">
            <el-radio-group v-model="form.permission">
              <el-radio value="public">公开</el-radio>
              <el-radio value="followers_only">仅粉丝可见</el-radio>
              <el-radio value="private">仅自己可见</el-radio>
            </el-radio-group>
          </el-form-item>
          
          <el-form-item>
            <el-button @click="handleSaveDraft" :loading="saving">保存草稿</el-button>
            <el-button type="primary" @click="handlePublish" :loading="publishing">立即发布</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { createNote } from '@/api/note';
import { ElMessage } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import Layout from '@/components/Layout.vue';
import type { UploadProps, UploadFile } from 'element-plus';

const router = useRouter();
const userStore = useUserStore();

const saving = ref(false);
const publishing = ref(false);
const formRef = ref();
const fileList = ref<UploadFile[]>([]);
const topicList = ref(['生活', '美食', '旅行', '摄影', '学习', '工作', '运动', '音乐', '电影', '科技']);

const form = reactive({
  title: '',
  content: '',
  images: [] as string[],
  topics: [] as string[],
  location: '',
  permission: 'public' as 'public' | 'private' | 'followers_only',
});

const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  const isImage = file.type.startsWith('image/');
  const isLt10M = file.size / 1024 / 1024 < 10;
  
  if (!isImage) {
    ElMessage.error('只能上传图片文件!');
    return false;
  }
  if (!isLt10M) {
    ElMessage.error('图片大小不能超过 10MB!');
    return false;
  }
  return true;
};

const handleUploadSuccess: UploadProps['onSuccess'] = (response, file) => {
  if (response.url) {
    form.images.push(response.url);
    file.url = response.url;
  }
};

const handleUploadChange: UploadProps['onChange'] = (uploadFile) => {
  if (uploadFile.response?.url) {
    uploadFile.url = uploadFile.response.url;
  }
};

const handleRemove: UploadProps['onRemove'] = (file) => {
  const index = form.images.indexOf(file.url || '');
  if (index > -1) {
    form.images.splice(index, 1);
  }
};

const handleSaveDraft = async () => {
  if (!form.title && !form.content && form.images.length === 0) {
    ElMessage.warning('请至少填写一项内容');
    return;
  }
  
  saving.value = true;
  try {
    await createNote({ ...form, publish: false });
    ElMessage.success('草稿保存成功');
  } catch (error) {
    console.error('保存草稿失败:', error);
  } finally {
    saving.value = false;
  }
};

const handlePublish = async () => {
  if (!form.title || !form.content) {
    ElMessage.warning('请填写标题和内容');
    return;
  }
  
  publishing.value = true;
  try {
    await createNote({ ...form, publish: true });
    ElMessage.success('发布成功，等待审核');
    router.push('/');
  } catch (error) {
    console.error('发布失败:', error);
  } finally {
    publishing.value = false;
  }
};
</script>

<style lang="scss" scoped>
.create-note {
  max-width: 700px;
  margin: 0 auto;
}

.form-card {
  background: #fff;
  border-radius: 12px;
  padding: 30px;
  
  h2 {
    font-size: 20px;
    font-weight: 600;
    color: #333;
    margin-bottom: 30px;
  }
}

:deep(.el-upload-list--picture-card .el-upload-list__item),
:deep(.el-upload--picture-card) {
  width: 100px;
  height: 100px;
  line-height: 100px;
}
</style>
