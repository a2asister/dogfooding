<template>
  <div class="admin-notes">
    <div class="page-header">
      <h2>笔记审核</h2>
    </div>
    
    <div v-if="loading" class="loading">
      <el-skeleton :rows="5" animated />
    </div>
    
    <template v-else-if="notes.length > 0">
      <div v-for="note in notes" :key="note.id" class="note-item">
        <div class="note-info">
          <h3>{{ note.title }}</h3>
          <p class="content">{{ note.content }}</p>
          <div class="meta">
            <span>作者：{{ note.author.nickname }}</span>
            <span>发布时间：{{ formatTime(note.createdAt) }}</span>
            <span v-if="note.images && note.images.length > 0">
              {{ note.images.length }} 张图片
            </span>
          </div>
          <div v-if="note.images && note.images.length > 0" class="images">
            <img v-for="(img, idx) in note.images.slice(0, 3)" :key="idx" :src="img" />
          </div>
        </div>
        <div class="actions">
          <el-button type="success" size="small" @click="handleApprove(note.id)">通过</el-button>
          <el-button type="danger" size="small" @click="showRejectDialog(note.id)">拒绝</el-button>
        </div>
      </div>
      
      <div v-if="total > pageSize" class="pagination">
        <el-pagination
          v-model:current-page="page"
          :page-size="pageSize"
          :total="total"
          layout="total, prev, pager, next"
          @current-change="fetchNotes"
        />
      </div>
    </template>
    
    <div v-else class="empty">
      <el-empty description="暂无待审核笔记" />
    </div>
    
    <el-dialog v-model="rejectDialogVisible" title="拒绝原因" width="500px">
      <el-form :model="rejectForm">
        <el-form-item label="原因">
          <el-input v-model="rejectForm.reason" type="textarea" :rows="4" placeholder="请输入拒绝原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleReject" :loading="processing">确认拒绝</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { getPendingNotes, approveNote, rejectNote } from '@/api/admin';
import { ElMessage } from 'element-plus';
import type { Note } from '@/types';
import dayjs from 'dayjs';

const loading = ref(false);
const processing = ref(false);
const page = ref(1);
const pageSize = ref(10);
const total = ref(0);
const notes = ref<Note[]>([]);
const rejectDialogVisible = ref(false);
const currentNoteId = ref('');

const rejectForm = reactive({
  reason: '',
});

const formatTime = (time: string) => {
  return dayjs(time).format('YYYY-MM-DD HH:mm');
};

const fetchNotes = async () => {
  loading.value = true;
  try {
    const res = await getPendingNotes({ page: page.value, pageSize: pageSize.value });
    notes.value = res.list;
    total.value = res.total;
  } catch (error) {
    console.error('获取待审核笔记失败:', error);
  } finally {
    loading.value = false;
  }
};

const handleApprove = async (id: string) => {
  processing.value = true;
  try {
    await approveNote(id);
    ElMessage.success('审核通过');
    notes.value = notes.value.filter(n => n.id !== id);
  } catch (error) {
    console.error('审核失败:', error);
  } finally {
    processing.value = false;
  }
};

const showRejectDialog = (id: string) => {
  currentNoteId.value = id;
  rejectForm.reason = '';
  rejectDialogVisible.value = true;
};

const handleReject = async () => {
  if (!rejectForm.reason) {
    ElMessage.warning('请输入拒绝原因');
    return;
  }
  
  processing.value = true;
  try {
    await rejectNote(currentNoteId.value, rejectForm.reason);
    ElMessage.success('已拒绝');
    rejectDialogVisible.value = false;
    notes.value = notes.value.filter(n => n.id !== currentNoteId.value);
  } catch (error) {
    console.error('拒绝失败:', error);
  } finally {
    processing.value = false;
  }
};

onMounted(() => {
  fetchNotes();
});
</script>

<style lang="scss" scoped>
.admin-notes {
  .page-header {
    margin-bottom: 20px;
    
    h2 {
      font-size: 20px;
      font-weight: 600;
      color: #333;
    }
  }
  
  .note-item {
    background: #fff;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
    gap: 20px;
    
    .note-info {
      flex: 1;
      
      h3 {
        font-size: 16px;
        font-weight: 600;
        color: #333;
        margin-bottom: 12px;
      }
      
      .content {
        font-size: 14px;
        color: #666;
        line-height: 1.6;
        margin-bottom: 12px;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      
      .meta {
        font-size: 12px;
        color: #999;
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
        margin-bottom: 12px;
      }
      
      .images {
        display: flex;
        gap: 8px;
        
        img {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 4px;
        }
      }
    }
    
    .actions {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
  }
  
  .pagination {
    text-align: center;
    margin-top: 20px;
    padding: 20px;
    background: #fff;
    border-radius: 12px;
  }
  
  .loading {
    background: #fff;
    border-radius: 12px;
    padding: 30px;
  }
  
  .empty {
    background: #fff;
    border-radius: 12px;
    padding: 60px;
    text-align: center;
  }
}
</style>
