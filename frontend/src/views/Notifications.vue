<template>
  <Layout>
    <div class="notification-page">
      <div class="page-header">
        <h1 class="title">消息通知</h1>
        <el-button
          v-if="unreadCount > 0"
          type="text"
          @click="markAllAsRead"
        >
          全部已读
        </el-button>
      </div>

      <div class="notification-tabs">
        <el-tabs v-model="activeType" @tab-change="handleTabChange">
          <el-tab-pane label="全部" name="all">
            <template #title>
              <span>全部</span>
              <el-badge v-if="unreadCount > 0" :value="unreadCount" class="badge" />
            </template>
          </el-tab-pane>
          <el-tab-pane label="点赞" name="like" />
          <el-tab-pane label="评论" name="comment" />
          <el-tab-pane label="回复" name="reply" />
          <el-tab-pane label="关注" name="follow" />
          <el-tab-pane label="收藏" name="favorite" />
          <el-tab-pane label="系统" name="system" />
        </el-tabs>
      </div>

      <div class="notification-list">
        <div v-if="loading" class="loading">
          <el-skeleton :rows="8" animated />
        </div>

        <div v-else-if="notifications.length > 0" class="list-container">
          <div
            v-for="notification in notifications"
            :key="notification.id"
            class="notification-item"
            :class="{ unread: !notification.isRead }"
            @click="handleNotificationClick(notification)"
          >
            <el-avatar :size="44" :src="notification.fromUser?.avatar">
              {{ notification.fromUser?.nickname?.charAt(0) || '系' }}
            </el-avatar>
            <div class="notification-content">
              <div class="notification-header">
                <span class="username" v-if="notification.fromUser">
                  {{ notification.fromUser.nickname }}
                </span>
                <span class="type-text">{{ getTypeText(notification.type) }}</span>
                <span class="time">{{ formatTime(notification.createdAt) }}</span>
              </div>
              <div class="notification-body" v-html="notification.content" />
              <div class="notification-preview" v-if="(notification as any).note">
                <img
                  v-if="(notification as any).note.images?.[0]"
                  :src="(notification as any).note.images[0]"
                  class="preview-img"
                />
                <span class="preview-text">{{ (notification as any).note.title }}</span>
              </div>
            </div>
            <div v-if="!notification.isRead" class="unread-dot" />
          </div>
        </div>

        <div v-else class="no-notifications">
          <el-empty description="暂无消息通知" />
        </div>
      </div>

      <div v-if="hasMore" class="load-more">
        <el-button :loading="loading" @click="loadMore">加载更多</el-button>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted, onActivated } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import {
  getNotificationList,
  markAsRead,
  markAllAsRead as markAll,
  getUnreadCount,
} from '@/api/notification';
import { ElMessage } from 'element-plus';
import Layout from '@/components/Layout.vue';
import type { Notification } from '@/types';
import dayjs from 'dayjs';

const router = useRouter();
const userStore = useUserStore();

const activeType = ref('all');
const notifications = ref<Notification[]>([]);
const loading = ref(false);
const page = ref(1);
const pageSize = ref(20);
const hasMore = ref(true);
const unreadCount = ref(0);

const getTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    like: '赞了你的笔记',
    comment: '评论了你的笔记',
    reply: '回复了你的评论',
    follow: '关注了你',
    favorite: '收藏了你的笔记',
    system: '系统消息',
  };
  return typeMap[type] || type;
};

const formatTime = (time: string) => {
  const now = dayjs();
  const target = dayjs(time);
  const diffMinutes = now.diff(target, 'minute');
  if (diffMinutes < 1) return '刚刚';
  if (diffMinutes < 60) return `${diffMinutes}分钟前`;
  const diffHours = now.diff(target, 'hour');
  if (diffHours < 24) return `${diffHours}小时前`;
  const diffDays = now.diff(target, 'day');
  if (diffDays < 7) return `${diffDays}天前`;
  return target.format('MM-DD');
};

const fetchNotifications = async (reset = false) => {
  if (!userStore.isLoggedIn) return;
  if (reset) {
    page.value = 1;
    hasMore.value = true;
    notifications.value = [];
  }
  loading.value = true;
  try {
    const res = await getNotificationList({
      type: activeType.value as any,
      page: page.value,
      pageSize: pageSize.value,
    });
    notifications.value = reset ? res.list : [...notifications.value, ...res.list];
    hasMore.value = res.list.length >= pageSize.value;
    page.value++;
  } catch (error) {
    console.error('获取通知列表失败:', error);
  } finally {
    loading.value = false;
  }
};

const fetchUnreadCount = async () => {
  if (!userStore.isLoggedIn) return;
  try {
    const res = await getUnreadCount();
    unreadCount.value = res.count;
  } catch (error) {
    console.error('获取未读计数失败:', error);
  }
};

const handleTabChange = () => {
  fetchNotifications(true);
};

const loadMore = () => {
  fetchNotifications();
};

const handleNotificationClick = async (notification: Notification) => {
  if (!notification.isRead) {
    try {
      await markAsRead(notification.id);
      notification.isRead = true;
      unreadCount.value = Math.max(0, unreadCount.value - 1);
    } catch (error) {
      console.error('标记已读失败:', error);
    }
  }

  if (notification.type === 'follow' && notification.fromUser) {
    router.push(`/user/${notification.fromUser.id}`);
  } else if ((notification as any).noteId) {
    router.push(`/note/${(notification as any).noteId}`);
  }
};

const markAllAsRead = async () => {
  try {
    await markAll();
    notifications.value.forEach(n => (n.isRead = true));
    unreadCount.value = 0;
    ElMessage.success('已全部标记为已读');
  } catch (error) {
    console.error('标记全部已读失败:', error);
  }
};

onMounted(() => {
  fetchNotifications(true);
  fetchUnreadCount();
});

onActivated(() => {
  fetchNotifications(true);
  fetchUnreadCount();
});
</script>

<style lang="scss" scoped>
.notification-page {
  max-width: 700px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  .title {
    font-size: 24px;
    font-weight: 700;
    color: #333;
    margin: 0;
  }
}

.notification-tabs {
  background: #fff;
  border-radius: 12px;
  padding: 0 20px;
  margin-bottom: 20px;

  :deep(.el-tabs__header) {
    margin-bottom: 0;
  }

  .badge {
    margin-left: 6px;
  }
}

.notification-list {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;

  .loading {
    padding: 30px;
  }

  .no-notifications {
    padding: 60px 20px;
  }

  .list-container {
    display: flex;
    flex-direction: column;
  }

  .notification-item {
    display: flex;
    gap: 12px;
    padding: 16px 20px;
    cursor: pointer;
    transition: background 0.3s;
    position: relative;
    border-bottom: 1px solid #f5f5f5;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background: #fafafa;
    }

    &.unread {
      background: #f5f9ff;
    }

    .notification-content {
      flex: 1;
      min-width: 0;

      .notification-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 4px;

        .username {
          font-weight: 600;
          color: #333;
        }

        .type-text {
          color: #666;
        }

        .time {
          margin-left: auto;
          font-size: 12px;
          color: #999;
        }
      }

      .notification-body {
        color: #666;
        font-size: 14px;
        margin-bottom: 8px;
      }

      .notification-preview {
        display: flex;
        align-items: center;
        gap: 8px;
        background: #f5f5f5;
        padding: 8px;
        border-radius: 6px;

        .preview-img {
          width: 40px;
          height: 40px;
          border-radius: 4px;
          object-fit: cover;
          flex-shrink: 0;
        }

        .preview-text {
          font-size: 12px;
          color: #666;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }

    .unread-dot {
      width: 8px;
      height: 8px;
      background: #409eff;
      border-radius: 50%;
      flex-shrink: 0;
      margin-top: 16px;
    }
  }
}

.load-more {
  text-align: center;
  margin-top: 20px;
}
</style>
