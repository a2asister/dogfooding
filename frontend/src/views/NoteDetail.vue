<template>
  <Layout>
    <div class="note-detail">
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
          </div>
          <div v-if="note.topics && note.topics.length > 0" class="topics">
            <el-tag v-for="topic in note.topics" :key="topic" type="info">
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
            @click="previewIndex = idx"
          />
        </div>
        
        <div class="actions">
          <el-button :type="note.isLiked ? 'primary' : ''" @click="handleLike">
            <el-icon><Star /></el-icon>
            点赞 ({{ note.likeCount }})
          </el-button>
          <el-button :type="note.isFavorited ? 'primary' : ''" @click="handleFavorite">
            <el-icon><Collection /></el-icon>
            收藏 ({{ note.favoriteCount }})
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
                <el-dropdown-item command="wechat">
                  <el-icon><ChatDotRound /></el-icon>
                  分享到微信
                </el-dropdown-item>
                <el-dropdown-item command="weibo">
                  <svg class="icon-weibo" viewBox="0 0 1024 1024" width="16" height="16" fill="#E6162D">
                    <path d="M512 0C229.23 0 0 229.23 0 512s229.23 512 512 512 512-229.23 512-512S794.77 0 512 0zm239.47 440.32c-18.34-8.02-38.4-14.61-59.74-19.47 13.44-32.43 20.05-67.52 18.77-102.6-1.75-48.5-17.6-94.16-45.01-130.54-55.35-73.81-155.25-99.52-243.84-63.36-91.52 37.55-152.96 122.67-159.68 221.87-0.85 12.59 8.75 23.47 21.34 24.32 12.58 0.84 23.46-8.75 24.32-21.34 5.12-75.52 51.2-141.44 122.88-170.67 68.27-27.95 147.63-9.6 199.89 46.93 25.6 27.95 40.11 62.93 41.6 99.84 1.07 26.67-3.84 52.9-13.87 77.44-2.56 6.19-6.61 11.31-11.95 14.51-10.67 6.4-23.89 3.52-30.29-7.1-20.69-34.99-29.65-75.73-24.96-116.27 3.63-31.79 14.93-62.51 32.85-89.39 21.33-31.79 51.2-55.47 86.61-67.42 6.61-2.13 13.65-1.49 19.85 1.71 11.52 5.97 15.79 20.05 9.81 31.57-12.8 24.53-20.05 51.84-20.69 80-0.85 40.11 11.73 79.57 34.56 111.36 5.97 8.32 6.61 19.2 1.71 28.16-4.69 8.53-13.65 13.65-22.83 13.65h-0.21c-8.32 0-16.43-3.2-22.61-8.96-21.97-20.27-50.99-31.36-81.28-30.29-45.65 1.49-88.53 20.48-116.48 52.05-27.52 31.15-38.83 72.11-30.93 113.49 3.84 20.05 10.88 39.04 20.69 56.11 9.6 16.85 22.4 31.36 37.55 42.67 27.31 20.48 60.37 30.72 94.16 28.59 23.47-1.49 46.51-7.89 66.99-18.56 47.36-24.96 83.63-71.47 97.28-124.59 3.2-12.59-4.27-25.17-16.85-28.37-12.59-3.2-25.17 4.27-28.37 16.85-10.24 40.11-37.55 75.31-73.39 94.16-16.85 8.75-35.63 13.44-54.61 13.44-5.55 0-11.09-0.43-16.43-1.28-23.47-3.63-45.23-14.08-61.87-29.87-12.37-11.73-22.61-25.6-30.08-40.96-7.25-14.93-12.16-30.5-14.51-46.51-2.13-14.93-0.85-30.08 3.84-44.38 5.55-16.85 14.93-32.43 27.73-45.65 23.89-24.96 56.32-39.47 90.45-40.53 24.32-0.85 48.08 5.55 68.91 17.92 19.41 11.31 35.84 27.52 47.36 46.51 4.05 6.61 10.45 10.88 17.49 11.95 3.2 0.43 6.4 0.64 9.6 0.64 4.27 0 8.53-0.85 12.37-2.56 6.83-2.98 11.52-9.39 12.37-16.85 0.85-7.47-2.77-14.93-8.53-19.2z"/>
                  </svg>
                  分享到微博
                </el-dropdown-item>
                <el-dropdown-item command="qq">
                  <svg class="icon-qq" viewBox="0 0 1024 1024" width="16" height="16" fill="#12B7F5">
                    <path d="M905.6 736.64c-22.02-32.64-46.08-61.44-49.15-98.3 0 0 7.68-35.84 11.26-80.38.08-1.28.08-2.56.08-3.84 0-234.5-106.5-424.96-367.1-424.96S133.63 319.62 133.63 554.12c0 1.28 0 2.56.08 3.84 3.58 44.54 11.26 80.38 11.26 80.38-3.07 36.86-27.13 65.66-49.15 98.3-26.62 39.51-41.98 83.97-36.78 118.02 4.96 32.34 30.72 53.33 67.58 53.33 47.1 0 86.02-31.66 116.48-59.56 23.63 3.48 48.36 5.38 73.56 5.38 25.88 0 50.86-1.98 74.99-5.67 30.46 27.9 69.38 59.56 116.48 59.56 36.86 0 62.63-20.99 67.58-53.33 5.2-34.05-10.15-78.51-36.77-118.02zM786.35 827.39c-2.56 14.34-19.97 24.58-41.98 24.58-27.82 0-54.79-17.49-77.9-41.98l-1.28-1.28c-.85-.85-1.71-2.13-2.56-2.98-25.81 6.83-53.33 10.67-82.26 10.67-29.35 0-57.3-3.84-83.41-10.83-.85.85-1.71 2.13-2.56 2.98l-1.28 1.28c-23.12 24.49-50.09 41.98-77.9 41.98-22.02 0-39.43-10.24-41.98-24.58-2.56-14.34 7.68-33.28 26.45-55.47 12.37-14.76 28.58-32.43 44.38-51.2 0 0-11.52-42.67-14.93-80.21-.08-.85-.08-1.7-.08-2.56 0-195.41 86.78-359.25 308.22-359.25 221.53 0 308.22 163.84 308.22 359.25 0 .85 0 1.71-.08 2.56-3.41 37.55-14.93 80.21-14.93 80.21 15.79 18.77 32 36.44 44.38 51.2 18.77 22.19 29.01 41.13 26.45 55.47z"/>
                  </svg>
                  分享到QQ
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
    
    <el-dialog v-model="wechatVisible" title="分享到微信" width="400px" center>
      <div class="wechat-share">
        <img :src="qrcodeDataUrl" alt="微信分享二维码" class="qrcode-img" />
        <p class="share-tip">请使用微信扫描二维码分享</p>
      </div>
      <template #footer>
        <el-button @click="wechatVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </Layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { getNoteDetail, likeNote, favoriteNote, shareNote } from '@/api/note';
import { followUser } from '@/api/user';
import { ElMessage } from 'element-plus';
import { Star, Collection, Share, ArrowDown, Link, ChatDotRound, PictureFilled } from '@element-plus/icons-vue';
import QRCode from 'qrcode';
import Layout from '@/components/Layout.vue';
import type { Note } from '@/types';
import dayjs from 'dayjs';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const loading = ref(false);
const note = ref<Note | null>(null);
const previewIndex = ref(0);
const qrcodeVisible = ref(false);
const wechatVisible = ref(false);
const qrcodeDataUrl = ref('');

const shareUrl = computed(() => {
  return note.value ? `${window.location.origin}/note/${note.value.id}` : '';
});

const shareTitle = computed(() => {
  return note.value ? note.value.title : '图文社区';
});

const shareContent = computed(() => {
  return note.value ? note.value.content.substring(0, 100) : '分享一篇精彩内容给你';
});

const generateQrcode = async () => {
  try {
    qrcodeDataUrl.value = await QRCode.toDataURL(shareUrl.value, {
      width: 256,
      margin: 2,
      color: {
        dark: '#333333',
        light: '#ffffff',
      },
    });
  } catch (error) {
    console.error('生成二维码失败:', error);
    ElMessage.error('生成二维码失败');
  }
};

const formatTime = (time: string) => {
  return dayjs(time).format('YYYY-MM-DD HH:mm');
};

const fetchNote = async () => {
  loading.value = true;
  try {
    const res = await getNoteDetail(route.params.id as string);
    note.value = res.note;
  } catch (error) {
    console.error('获取笔记详情失败:', error);
  } finally {
    loading.value = false;
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
  } catch (error) {
    console.error('收藏失败:', error);
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
    case 'wechat':
      await generateQrcode();
      wechatVisible.value = true;
      break;
    case 'weibo':
      shareToWeibo();
      break;
    case 'qq':
      shareToQQ();
      break;
    case 'qrcode':
      await generateQrcode();
      qrcodeVisible.value = true;
      break;
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

const shareToWeibo = () => {
  const url = encodeURIComponent(shareUrl.value);
  const title = encodeURIComponent(`${shareTitle.value} - 来自图文社区`);
  const image = note.value?.images?.[0] ? encodeURIComponent(note.value.images[0]) : '';
  const weiboUrl = `https://service.weibo.com/share/share.php?url=${url}&title=${title}${image ? `&pic=${image}` : ''}`;
  window.open(weiboUrl, '_blank', 'width=600,height=400');
  ElMessage.success('已打开微博分享');
};

const shareToQQ = () => {
  const url = encodeURIComponent(shareUrl.value);
  const title = encodeURIComponent(shareTitle.value);
  const content = encodeURIComponent(shareContent.value);
  const image = note.value?.images?.[0] ? encodeURIComponent(note.value.images[0]) : '';
  const qqUrl = `https://connect.qq.com/widget/shareqq/index.html?url=${url}&title=${title}&summary=${content}${image ? `&pics=${image}` : ''}&desc=图文社区`;
  window.open(qqUrl, '_blank', 'width=600,height=400');
  ElMessage.success('已打开QQ分享');
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

onMounted(() => {
  fetchNote();
});
</script>

<style lang="scss" scoped>
.note-detail {
  max-width: 800px;
  margin: 0 auto;
  background: #fff;
  border-radius: 12px;
  padding: 30px;
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
    transition: transform 0.3s;
    
    &:hover {
      transform: scale(1.02);
    }
  }
}

.actions {
  display: flex;
  gap: 16px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.loading {
  padding: 30px;
}

.qrcode-container,
.wechat-share {
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
  
  .qrcode-tip,
  .share-tip {
    margin-top: 16px;
    color: #666;
    font-size: 14px;
  }
}

.icon-weibo,
.icon-qq {
  vertical-align: middle;
  margin-right: 8px;
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
