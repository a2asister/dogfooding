<template>
  <Layout>
    <div class="edit-note-page">
      <div class="page-header">
        <h1 class="title">编辑笔记</h1>
      </div>

      <div v-if="loading" class="loading">
        <el-skeleton :rows="10" animated />
      </div>

      <div v-else class="edit-form">
        <el-form :model="form" label-width="80px">
          <el-form-item label="标题">
            <el-input v-model="form.title" placeholder="请输入标题" maxlength="100" show-word-limit />
          </el-form-item>
          <el-form-item label="内容">
            <el-input
              v-model="form.content"
              type="textarea"
              :rows="12"
              placeholder="记录你的想法..."
              maxlength="5000"
              show-word-limit
            />
          </el-form-item>
          <el-form-item label="话题">
            <el-input
              v-model="topicsInput"
              placeholder="多个话题用空格分隔，如：生活 旅行"
            />
          </el-form-item>
          <el-form-item>
            <div class="sensitive-warning" v-if="sensitiveResult && sensitiveResult.hasSensitive">
              <el-alert
                :title="`检测到敏感词：${sensitiveResult.foundWords.join(', ')}`"
                type="warning"
                show-icon
                :closable="false"
              />
            </div>
          </el-form-item>
          <el-form-item>
            <el-button :loading="saving" type="primary" @click="save">
              保存修改
            </el-button>
            <el-button @click="$router.back()">取消</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getNoteDetail, updateNote, checkSensitiveWords } from '@/api/note';
import { ElMessage } from 'element-plus';
import Layout from '@/components/Layout.vue';

const route = useRoute();
const router = useRouter();

const loading = ref(false);
const saving = ref(false);
const topicsInput = ref('');
const sensitiveResult = ref<any>(null);

const form = reactive({
  title: '',
  content: '',
  topics: [] as string[],
});

let checkTimer: any = null;

const fetchNote = async () => {
  loading.value = true;
  try {
    const res = await getNoteDetail(route.params.id as string);
    form.title = res.note.title;
    form.content = res.note.content;
    form.topics = res.note.topics || [];
    topicsInput.value = form.topics.join(' ');
  } catch (error) {
    console.error('获取笔记失败:', error);
  } finally {
    loading.value = false;
  }
};

const checkSensitive = async () => {
  if (!form.content.trim() && !form.title.trim()) {
    sensitiveResult.value = null;
    return;
  }
  try {
    const res = await checkSensitiveWords({
      content: `${form.title} ${form.content}`,
    });
    sensitiveResult.value = res;
  } catch (error) {
    console.error('敏感词检测失败:', error);
  }
};

watch(
  () => [form.title, form.content],
  () => {
    clearTimeout(checkTimer);
    checkTimer = setTimeout(checkSensitive, 500);
  }
);

const save = async () => {
  if (!form.title.trim()) {
    ElMessage.warning('请输入标题');
    return;
  }
  if (!form.content.trim()) {
    ElMessage.warning('请输入内容');
    return;
  }

  const topics = topicsInput.value
    .split(/[\s,，]+/)
    .map(t => t.trim())
    .filter(t => t.length > 0);

  saving.value = true;
  try {
    await updateNote(route.params.id as string, {
      title: form.title,
      content: form.content,
      topics,
    });
    ElMessage.success('保存成功');
    router.push(`/note/${route.params.id}`);
  } catch (error) {
    console.error('保存失败:', error);
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  fetchNote();
});
</script>

<style lang="scss" scoped>
.edit-note-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  margin-bottom: 24px;

  .title {
    font-size: 24px;
    font-weight: 700;
    color: #333;
    margin: 0;
  }
}

.edit-form {
  background: #fff;
  border-radius: 12px;
  padding: 30px;
}

.loading {
  background: #fff;
  border-radius: 12px;
  padding: 30px;
}

.sensitive-warning {
  margin-bottom: 16px;
}
</style>
