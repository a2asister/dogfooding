<template>
  <Layout>
    <div class="note-detail-page">
      <div class="note-main">
        <div v-if="loading" class="loading">
          <el-skeleton :rows="10" animated />
        </div>

        <template v-else-if="note">
          <div class="note-header">
            <div class="author">
              <el-avatar :size="50" :src="note.author.avatar">
                {{ note.author.nickname?.charAt(0) }}
              </el-avatar>
              <div class="info">
                <div class="name">{{ note.author.nickname }}</div>
                <div class="meta">
                  <span>{{ formatTime(note.createdAt) }}</span>
                  <span v-if="note.location"> · {{ note.location }}</span>
                </div>
              </div>
              <el-button
                v-if="userStore.isLoggedIn && userStore.user?.id !== note.author.id"
                :type="note.author.isFollowing ? '' : 'primary'"
                @click="handleFollow"
              >
                {{ note.author.isFollowing ? '已关注' : '关注' }}
              </el-button>
              <el-dropdown
                v-if="userStore.isLoggedIn"
                trigger="click"
                @command="handleMoreAction"
              >
                <el-button type="text" circle>
                  <el-icon><MoreFilled /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="edit" v-if="userStore.user?.id === note.author.id">
                      <el-icon><Edit /></el-icon>
                      编辑笔记
                    </el-dropdown-item>
                    <el-dropdown-item command="delete" v-if="userStore.user?.id === note.author.id">
                      <el-icon><Delete /></el-icon>
                      删除笔记
                    </el-dropdown-item>
                    <el-dropdown-item command="report">
                      <el-icon><Warning /></el-icon>
                      举报
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
            <div v-if="note.topics && note.topics.length > 0" class="topics">
              <el-tag
                v-for="topic in note.topics"
                :key="topic"
                type="info"
                class="topic-tag"
                @click="$router.push(`/topic?name=${topic}`)"
              >
                #{{ topic }}
              </el-tag>
            </div>
          </div>

          <h1 class="title">{{ note.title }}</h1>
          <div class="content">{{ note.content }}</div>

          <div v-if="note.images && note.images.length > 0" class="images">
            <el-image
              v-for="(img, idx) in note.images"
              :key="idx"
              :src="img"
              :preview-src-list="note.images"
              fit="cover"
              class="image-item"
            />
          </div>

          <div class="note-stats" v-if="noteStats">
            <div class="stat-item">
              <span class="label">浏览</span>
              <span class="value">{{ noteStats.viewCount }}</span>
            </div>
            <div class="stat-item">
              <span class="label">点赞</span>
              <span class="value">{{ noteStats.likeCount }}</span>
            </div>
            <div class="stat-item">
              <span class="label">收藏</span>
              <span class="value">{{ noteStats.favoriteCount }}</span>
            </div>
            <div class="stat-item">
              <span class="label">评论</span>
              <span class="value">{{ noteStats.commentCount }}</span>
            </div>
            <div class="stat-item">
              <span class="label">热度</span>
              <span class="value hot">{{ noteStats.hotScore?.toFixed(1) }}</span>
            </div>
          </div>

          <div class="actions">
            <el-button :type="note.isLiked ? 'primary' : ''" @click="handleLike">
              <el-icon><Star /></el-icon>
              点赞 ({{ note.likeCount }})
            </el-button>
            <el-button :type="note.isFavorited ? 'primary' : ''" @click="handleFavorite">
              <el-icon><CollectionIcon /></el-icon>
              收藏 ({{ note.favoriteCount }})
            </el-button>
            <el-button @click="handleCollectTo">
              <el-icon><FolderAdd /></el-icon>
              加入合集
            </el-button>
            <el-dropdown trigger="click" @command="handleShareCommand">
              <el-button>
                <el-icon><Share /></el-icon>
                分享 ({{ note.shareCount }})
                <el-icon><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="copy">
                    <el-icon><Link /></el-icon>
                    复制链接
                  </el-dropdown-item>
                  <el-dropdown-item command="qrcode">
                    <el-icon><PictureFilled /></el-icon>
                    生成二维码
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </template>

        <div class="comments-section">
          <div class="comment-input">
            <el-avatar v-if="userStore.user" :size="40" :src="userStore.user.avatar">
              {{ userStore.user?.nickname?.charAt(0) }}
            </el-avatar>
            <div class="input-area">
              <el-input
                v-model="commentContent"
                type="textarea"
                :rows="2"
                :placeholder="userStore.isLoggedIn ? '写下你的评论...' : '请先登录后发表评论'"
                :disabled="!userStore.isLoggedIn"
                maxlength="500"
                show-word-limit
                @keydown.ctrl.enter="submitComment"
              />
              <div class="input-actions">
                <span class="tip">Ctrl+Enter 发布</span>
                <el-button
                  type="primary"
                  :disabled="!commentContent.trim() || !userStore.isLoggedIn || submittingComment"
                  :loading="submittingComment"
                  @click="submitComment"
                >
                  发布评论
                </el-button>
              </div>
            </div>
          </div>

          <div class="comments-list">
            <div class="comments-header">
              <span class="title">全部评论 ({{ comments.length }})</span>
            </div>

            <div v-if="commentsLoading" class="comments-loading">
              <el-skeleton :rows="3" animated />
            </div>

            <div v-else-if="comments.length > 0" class="comment-items">
              <div
                v-for="comment in comments"
                :key="comment.id"
                class="comment-item"
                :class="{ pinned: comment.isPinned }"
              >
                <div v-if="comment.isPinned" class="pinned-badge">
                  <el-icon><Top /></el-icon>
                  作者置顶
                </div>
                <el-avatar :size="40" :src="comment.author.avatar">
                  {{ comment.author.nickname?.charAt(0) }}
                </el-avatar>
                <div class="comment-content">
                  <div class="comment-header">
                    <span class="author-name" @click="$router.push(`/user/${comment.author.id}`)">
                      {{ comment.author.nickname }}
                    </span>
                    <span class="comment-time">{{ formatTime(comment.createdAt) }}</span>
                  </div>
                  <div class="comment-text">{{ comment.content }}</div>
                  <div class="comment-actions">
                    <div
                      class="action-btn"
                      :class="{ active: comment.isLiked }"
                      @click="handleLikeComment(comment)"
                    >
                      <el-icon><Star /></el-icon>
                      {{ comment.likeCount }}
                    </div>
                    <div class="action-btn" @click="startReply(comment)">
                      <el-icon><ChatDotRound /></el-icon>
                      回复
                    </div>
                    <el-dropdown
                      v-if="userStore.isLoggedIn"
                      trigger="click"
                      @command="(cmd: string) => handleCommentAction(cmd, comment)"
                    >
                      <div class="action-btn">
                        <el-icon><MoreFilled /></el-icon>
                      </div>
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item
                            command="pin"
                            v-if="userStore.user?.id === note?.author.id || userStore.isAdmin"
                          >
                            {{ comment.isPinned ? '取消置顶' : '置顶评论' }}
                          </el-dropdown-item>
                          <el-dropdown-item
                            command="delete"
                            v-if="userStore.user?.id === comment.author.id || userStore.isAdmin"
                          >
                            删除评论
                          </el-dropdown-item>
                          <el-dropdown-item command="report">
                            举报评论
                          </el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                  </div>

                  <div v-if="replyingTo && replyingTo.id === comment.id" class="reply-input">
                    <el-input
                      v-model="replyContent"
                      :placeholder="`回复 ${replyingTo.author.nickname}...`"
                      size="small"
                      maxlength="500"
                      show-word-limit
                    />
                    <div class="reply-actions">
                      <el-button size="small" @click="cancelReply">取消</el-button>
                      <el-button
                        size="small"
                        type="primary"
                        :disabled="!replyContent.trim() || submittingReply"
                        :loading="submittingReply"
                        @click="submitReply(comment)"
                      >
                        回复
                      </el-button>
                    </div>
                  </div>

                  <div v-if="comment.replies && comment.replies.length > 0" class="replies">
                    <div
                      v-for="reply in comment.replies"
                      :key="reply.id"
                      class="reply-item"
                    >
                      <el-avatar :size="28" :src="reply.author.avatar">
                        {{ reply.author.nickname?.charAt(0) }}
                      </el-avatar>
                      <div class="reply-content">
                        <div class="reply-header">
                          <span class="author-name" @click="$router.push(`/user/${reply.author.id}`)">
                            {{ reply.author.nickname }}
                          </span>
                          <span
                            v-if="reply.replyToUser"
                            class="reply-to"
                          >
                            回复
                            <span @click.stop="$router.push(`/user/${reply.replyToUser.id}`)">
                              {{ reply.replyToUser.nickname }}
                            </span>
                          </span>
                        </div>
                        <div class="reply-text">{{ reply.content }}</div>
                        <div class="reply-footer">
                          <span class="time">{{ formatTime(reply.createdAt) }}</span>
                          <div
                            class="action-btn small"
                            :class="{ active: reply.isLiked }"
                            @click="handleLikeComment(reply)"
                          >
                            <el-icon><Star /></el-icon>
                            {{ reply.likeCount }}
                          </div>
                          <div
                            class="action-btn small"
                            @click="startReply(reply, comment)"
                          >
                            回复
                          </div>
                        </div>
                      </div>
                    </div>
                    <div
                      v-if="comment.replyCount > comment.replies.length"
                      class="load-more-replies"
                      @click="loadMoreReplies(comment)"
                    >
                      查看全部 {{ comment.replyCount }} 条回复
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="no-comments">
              <el-empty description="暂无评论，快来抢沙发吧~" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <el-dialog v-model="qrcodeVisible" title="分享二维码" width="400px" center>
      <div class="qrcode-container">
        <img :src="qrcodeDataUrl" alt="二维码" class="qrcode-img" />
        <p class="qrcode-tip">扫描二维码分享笔记</p>
      </div>
      <template #footer>
        <el-button @click="qrcodeVisible = false">关闭</el-button>
        <el-button type="primary" @click="downloadQrcode">下载二维码</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="reportDialogVisible" title="举报" width="500px">
      <el-form :model="reportForm" label-width="80px">
        <el-form-item label="举报类型">
          <el-radio-group v-model="reportForm.reason">
            <el-radio label="低俗色情">低俗色情</el-radio>
            <el-radio label="广告垃圾">广告垃圾</el-radio>
            <el-radio label="违法违规">违法违规</el-radio>
            <el-radio label="侵权抄袭">侵权抄袭</el-radio>
            <el-radio label="其他">其他</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="补充说明">
          <el-input
            v-model="reportForm.description"
            type="textarea"
            :rows="4"
            placeholder="请详细描述举报原因（选填）"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="reportDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submittingReport" @click="submitReport">提交举报</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="collectDialogVisible" title="加入合集" width="400px">
      <div v-if="collectionsLoading" class="collections-loading">
        <el-skeleton :rows="3" animated />
      </div>
      <div v-else-if="collections.length > 0" class="collections-list">
        <div
          v-for="collection in collections"
          :key="collection.id"
          class="collection-item"
          @click="addToCollection(collection.id)"
        >
          <el-icon class="collection-icon"><Folder /></el-icon>
          <div class="collection-info">
            <div class="collection-name">{{ collection.name }}</div>
            <div class="collection-count">{{ collection.itemCount }} 个内容</div>
          </div>
        </div>
      </div>
      <div v-else class="no-collections">
        <el-empty description="暂无合集，去创建一个吧" />
      </div>
      <template #footer>
        <el-button @click="collectDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="$router.push('/collections')">创建合集</el-button>
      </template>
    </el-dialog>
  </Layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { getNoteDetail, likeNote, favoriteNote, shareNote, getNoteStats } from '@/api/note';
import { followUser } from '@/api/user';
import {
  getCommentList,
  createComment,
  likeComment,
  deleteComment,
  pinComment,
} from '@/api/comment';
import { createReport } from '@/api/report';
import { getCollectionList, addNoteToCollection } from '@/api/collection';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  Star,
  Collection as CollectionIcon,
  Share,
  ArrowDown,
  Link,
  ChatDotRound,
  PictureFilled,
  MoreFilled,
  Edit,
  Delete,
  Warning,
  FolderAdd,
  Folder,
  Top,
} from '@element-plus/icons-vue';
import QRCode from 'qrcode';
import Layout from '@/components/Layout.vue';
import type { Note, Comment, NoteStats, Collection } from '@/types';
import dayjs from 'dayjs';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const loading = ref(false);
const note = ref<Note | null>(null);
const noteStats = ref<NoteStats | null>(null);
const comments = ref<Comment[]>([]);
const commentsLoading = ref(false);
const commentContent = ref('');
const submittingComment = ref(false);
const replyingTo = ref<Comment | null>(null);
const replyContent = ref('');
const submittingReply = ref(false);
const qrcodeVisible = ref(false);
const qrcodeDataUrl = ref('');
const reportDialogVisible = ref(false);
const submittingReport = ref(false);
const reportForm = ref({
  reason: '',
  description: '',
});
const collectDialogVisible = ref(false);
const collections = ref<Collection[]>([]);
const collectionsLoading = ref(false);

const shareUrl = computed(() => {
  return note.value ? `${window.location.origin}/note/${note.value.id}` : '';
});

const formatTime = (time: string) => {
  return dayjs(time).format('YYYY-MM-DD HH:mm');
};

const fetchNote = async () => {
  loading.value = true;
  try {
    const res = await getNoteDetail(route.params.id as string);
    note.value = res.note;
    fetchNoteStats();
    fetchComments();
  } catch (error) {
    console.error('获取笔记详情失败:', error);
  } finally {
    loading.value = false;
  }
};

const fetchNoteStats = async () => {
  if (!note.value) return;
  try {
    const res = await getNoteStats(note.value.id);
    noteStats.value = res.stats;
  } catch (error) {
    console.error('获取笔记统计失败:', error);
  }
};

const fetchComments = async () => {
  if (!note.value) return;
  commentsLoading.value = true;
  try {
    const res = await getCommentList({
      noteId: note.value.id,
      page: 1,
      pageSize: 50,
    });
    comments.value = res.list;
  } catch (error) {
    console.error('获取评论列表失败:', error);
  } finally {
    commentsLoading.value = false;
  }
};

const handleLike = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录');
    router.push('/login');
    return;
  }
  if (!note.value) return;

  try {
    const res = await likeNote(note.value.id);
    note.value.isLiked = res.liked;
    note.value.likeCount = res.likeCount;
    if (noteStats.value) noteStats.value.likeCount = res.likeCount;
  } catch (error) {
    console.error('点赞失败:', error);
  }
};

const handleFavorite = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录');
    router.push('/login');
    return;
  }
  if (!note.value) return;

  try {
    const res = await favoriteNote(note.value.id);
    note.value.isFavorited = res.favorited;
    note.value.favoriteCount = res.favoriteCount;
    if (noteStats.value) noteStats.value.favoriteCount = res.favoriteCount;
  } catch (error) {
    console.error('收藏失败:', error);
  }
};

const handleCollectTo = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录');
    router.push('/login');
    return;
  }
  collectDialogVisible.value = true;
  await fetchCollections();
};

const fetchCollections = async () => {
  collectionsLoading.value = true;
  try {
    const res = await getCollectionList({
      userId: userStore.user!.id,
      page: 1,
      pageSize: 100,
    });
    collections.value = res.list;
  } catch (error) {
    console.error('获取合集列表失败:', error);
  } finally {
    collectionsLoading.value = false;
  }
};

const addToCollection = async (collectionId: string) => {
  if (!note.value) return;
  try {
    await addNoteToCollection({
      collectionId,
      noteId: note.value.id,
    });
    ElMessage.success('已加入合集');
    collectDialogVisible.value = false;
  } catch (error) {
    console.error('加入合集失败:', error);
  }
};

const handleShareCommand = async (command: string) => {
  if (!note.value) return;

  try {
    const res = await shareNote(note.value.id);
    note.value.shareCount = res.shareCount;
  } catch (error) {
    console.error('分享计数失败:', error);
  }

  switch (command) {
    case 'copy':
      await copyLink();
      break;
    case 'qrcode':
      await generateQrcode();
      qrcodeVisible.value = true;
      break;
  }
};

const generateQrcode = async () => {
  try {
    qrcodeDataUrl.value = await QRCode.toDataURL(shareUrl.value, {
      width: 256,
      margin: 2,
    });
  } catch (error) {
    console.error('生成二维码失败:', error);
    ElMessage.error('生成二维码失败');
  }
};

const copyLink = async () => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(shareUrl.value);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = shareUrl.value;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    ElMessage.success('链接已复制到剪贴板');
  } catch (error) {
    console.error('复制链接失败:', error);
    ElMessage.error('复制链接失败');
  }
};

const downloadQrcode = () => {
  if (!qrcodeDataUrl.value) return;
  const link = document.createElement('a');
  link.download = `分享二维码_${note.value?.id || 'note'}.png`;
  link.href = qrcodeDataUrl.value;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  ElMessage.success('二维码已下载');
};

const handleFollow = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录');
    router.push('/login');
    return;
  }
  if (!note.value) return;

  try {
    const res = await followUser(note.value.author.id);
    note.value.author.isFollowing = res.following;
    ElMessage.success(res.following ? '关注成功' : '取消关注');
  } catch (error) {
    console.error('关注失败:', error);
  }
};

const handleMoreAction = async (command: string) => {
  if (!note.value) return;

  switch (command) {
    case 'edit':
      router.push(`/note/${note.value.id}/edit`);
      break;
    case 'delete':
      await ElMessageBox.confirm('确定删除这篇笔记吗？删除后可在回收站恢复。', '提示', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
      });
      try {
        await import('@/api/note').then(({ deleteNoteToTrash }) => deleteNoteToTrash(note.value!.id));
        ElMessage.success('已移入回收站');
        router.push('/');
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除失败:', error);
        }
      }
      break;
    case 'report':
      reportDialogVisible.value = true;
      break;
  }
};

const submitComment = async () => {
  if (!commentContent.value.trim() || !note.value) return;
  submittingComment.value = true;
  try {
    await createComment({
      noteId: note.value.id,
      content: commentContent.value,
    });
    commentContent.value = '';
    ElMessage.success('评论成功');
    fetchComments();
  } catch (error) {
    console.error('评论失败:', error);
  } finally {
    submittingComment.value = false;
  }
};

const startReply = (comment: Comment, parentComment?: Comment) => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录');
    router.push('/login');
    return;
  }
  replyingTo.value = parentComment || comment;
  replyContent.value = `@${comment.author.nickname} `;
};

const cancelReply = () => {
  replyingTo.value = null;
  replyContent.value = '';
};

const submitReply = async (parentComment: Comment) => {
  if (!replyContent.value.trim() || !note.value) return;
  submittingReply.value = true;
  try {
    await createComment({
      noteId: note.value.id,
      content: replyContent.value,
      parentId: replyingTo.value!.id,
      replyToUserId: replyingTo.value!.author.id,
    });
    replyContent.value = '';
    replyingTo.value = null;
    ElMessage.success('回复成功');
    fetchComments();
  } catch (error) {
    console.error('回复失败:', error);
  } finally {
    submittingReply.value = false;
  }
};

const handleLikeComment = async (comment: Comment) => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录');
    router.push('/login');
    return;
  }
  try {
    const res = await likeComment(comment.id);
    comment.isLiked = res.liked;
    comment.likeCount = res.likeCount;
  } catch (error) {
    console.error('点赞评论失败:', error);
  }
};

const handleCommentAction = async (command: string, comment: Comment) => {
  switch (command) {
    case 'pin':
      try {
        const res = await pinComment(comment.id);
        comment.isPinned = res.isPinned;
        ElMessage.success(res.isPinned ? '已置顶' : '已取消置顶');
        fetchComments();
      } catch (error) {
        console.error('置顶失败:', error);
      }
      break;
    case 'delete':
      await ElMessageBox.confirm('确定删除这条评论吗？', '提示', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
      });
      try {
        await deleteComment(comment.id);
        ElMessage.success('删除成功');
        fetchComments();
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除失败:', error);
        }
      }
      break;
    case 'report':
      reportDialogVisible.value = true;
      break;
  }
};

const loadMoreReplies = async (comment: Comment) => {
  console.log('加载更多回复:', comment.id);
};

const submitReport = async () => {
  if (!reportForm.value.reason) {
    ElMessage.warning('请选择举报原因');
    return;
  }
  submittingReport.value = true;
  try {
    await createReport({
      type: 'note',
      targetId: note.value!.id,
      reason: reportForm.value.reason,
      description: reportForm.value.description,
    });
    ElMessage.success('举报已提交，我们将尽快处理');
    reportDialogVisible.value = false;
    reportForm.value = { reason: '', description: '' };
  } catch (error) {
    console.error('举报失败:', error);
  } finally {
    submittingReport.value = false;
  }
};

onMounted(() => {
  fetchNote();
});
</script>

<style lang="scss" scoped>
.note-detail-page {
  max-width: 800px;
  margin: 0 auto;
}

.note-main {
  background: #fff;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 20px;
}

.note-header {
  margin-bottom: 30px;

  .author {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 16px;

    .info {
      flex: 1;

      .name {
        font-weight: 600;
        font-size: 16px;
        color: #333;
      }

      .meta {
        font-size: 12px;
        color: #999;
        margin-top: 4px;
      }
    }
  }

  .topics {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;

    .topic-tag {
      cursor: pointer;
    }
  }
}

.title {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin-bottom: 20px;
  line-height: 1.4;
}

.content {
  font-size: 16px;
  color: #333;
  line-height: 1.8;
  margin-bottom: 30px;
  white-space: pre-wrap;
}

.images {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 30px;

  .image-item {
    width: 100%;
    height: 300px;
    cursor: pointer;
    border-radius: 8px;
  }
}

.note-stats {
  display: flex;
  gap: 32px;
  padding: 20px 0;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 20px;

  .stat-item {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .label {
      font-size: 12px;
      color: #999;
    }

    .value {
      font-size: 18px;
      font-weight: 600;
      color: #333;

      &.hot {
        color: #ff6b6b;
      }
    }
  }
}

.actions {
  display: flex;
  gap: 16px;
}

.loading {
  padding: 30px;
}

.comments-section {
  background: #fff;
  border-radius: 12px;
  padding: 30px;
}

.comment-input {
  display: flex;
  gap: 16px;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;

  .input-area {
    flex: 1;

    .input-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 12px;

      .tip {
        font-size: 12px;
        color: #999;
      }
    }
  }
}

.comments-list {
  .comments-header {
    margin-bottom: 20px;

    .title {
      font-weight: 600;
      font-size: 16px;
      color: #333;
    }
  }

  .comments-loading {
    padding: 20px 0;
  }

  .no-comments {
    padding: 40px 0;
  }

  .comment-items {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .comment-item {
    display: flex;
    gap: 12px;
    position: relative;

    &.pinned {
      background: #f5f9ff;
      border-radius: 8px;
      padding: 16px;
      margin: -16px -16px 16px;
    }

    .pinned-badge {
      position: absolute;
      top: 0;
      right: 0;
      display: flex;
      align-items: center;
      gap: 4px;
      background: linear-gradient(135deg, #409eff, #667eea);
      color: #fff;
      padding: 2px 8px;
      border-radius: 0 8px 0 8px;
      font-size: 12px;
    }
  }

  .comment-content {
    flex: 1;

    .comment-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 6px;

      .author-name {
        font-weight: 600;
        color: #333;
        cursor: pointer;
      }

      .comment-time {
        font-size: 12px;
        color: #999;
      }
    }

    .comment-text {
      color: #333;
      line-height: 1.6;
      margin-bottom: 8px;
    }

    .comment-actions {
      display: flex;
      gap: 24px;
      font-size: 12px;
      color: #999;

      .action-btn {
        display: flex;
        align-items: center;
        gap: 4px;
        cursor: pointer;
        transition: color 0.3s;

        &:hover,
        &.active {
          color: #409eff;
        }

        &.small {
          font-size: 12px;
          gap: 2px;
        }
      }
    }

    .reply-input {
      margin-top: 12px;
      padding-left: 12px;
      border-left: 2px solid #f0f0f0;

      .reply-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 8px;
      }
    }

    .replies {
      margin-top: 16px;
      padding-left: 12px;
      border-left: 2px solid #f0f0f0;

      .reply-item {
        display: flex;
        gap: 10px;
        margin-bottom: 16px;

        &:last-child {
          margin-bottom: 0;
        }
      }

      .reply-content {
        flex: 1;

        .reply-header {
          font-size: 12px;
          margin-bottom: 4px;

          .author-name {
            font-weight: 600;
            color: #409eff;
            cursor: pointer;
          }

          .reply-to {
            color: #999;

            span {
              color: #409eff;
              cursor: pointer;
            }
          }
        }

        .reply-text {
          color: #333;
          line-height: 1.5;
          margin-bottom: 4px;
        }

        .reply-footer {
          display: flex;
          align-items: center;
          gap: 16px;
          font-size: 12px;
          color: #999;

          .time {
            flex: 1;
          }
        }
      }

      .load-more-replies {
        color: #409eff;
        font-size: 12px;
        cursor: pointer;
        margin-top: 8px;
      }
    }
  }
}

.qrcode-container {
  text-align: center;
  padding: 20px 0;

  .qrcode-img {
    width: 256px;
    height: 256px;
    margin: 0 auto;
    display: block;
    border: 1px solid #e8e8e8;
    border-radius: 8px;
  }

  .qrcode-tip {
    margin-top: 16px;
    color: #666;
    font-size: 14px;
  }
}

.collections-list {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .collection-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.3s;

    &:hover {
      background: #f5f5f5;
    }

    .collection-icon {
      font-size: 32px;
      color: #409eff;
    }

    .collection-info {
      flex: 1;

      .collection-name {
        font-weight: 600;
        color: #333;
      }

      .collection-count {
        font-size: 12px;
        color: #999;
      }
    }
  }
}

.collections-loading,
.no-collections {
  padding: 20px 0;
}
</style>
