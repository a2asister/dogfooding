<template>
  <Layout>
    <div class="message-page">
      <div class="page-header">
        <h1>消息中心</h1>
        <p>与创作者和粉丝实时互动</p>
      </div>

      <div class="message-container">
        <div class="conversation-sidebar">
          <div class="search-bar">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索联系人"
              clearable
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>

          <div class="conversation-tabs">
            <el-tabs v-model="activeTab" @tab-change="fetchConversations">
              <el-tab-pane label="全部消息" name="all" />
              <el-tab-pane label="未读消息" name="unread" />
            </el-tabs>
          </div>

          <div v-loading="loading" class="conversation-list">
            <div
              v-for="conv in conversations"
              :key="conv.id"
              class="conversation-item"
              :class="{ active: selectedConversation?.id === conv.id, unread: conv.unreadCount > 0 }"
              @click="selectConversation(conv)"
            >
              <div class="avatar-wrapper">
                <el-avatar :size="48" :src="getConversationAvatar(conv)">
                  {{ getConversationName(conv)?.charAt(0) }}
                </el-avatar>
                <div v-if="conv.unreadCount > 0" class="unread-badge">
                  {{ conv.unreadCount > 99 ? '99+' : conv.unreadCount }}
                </div>
              </div>
              <div class="conversation-info">
                <div class="conversation-header">
                  <span class="conversation-name">{{ getConversationName(conv) }}</span>
                  <span class="conversation-time">{{ formatTime(conv.lastMessageAt) }}</span>
                </div>
                <div class="last-message">
                  <span v-if="conv.lastMessage">
                    {{ conv.lastMessage.type !== 'text' ? `[${getMessageTypeText(conv.lastMessage.type)}]` : '' }}
                    {{ conv.lastMessage.content }}
                  </span>
                  <span v-else>暂无消息</span>
                </div>
              </div>
            </div>

            <div v-if="!loading && conversations.length === 0" class="empty">
              <el-empty description="暂无消息" />
            </div>
          </div>
        </div>

        <div class="chat-area">
          <div v-if="!selectedConversation" class="chat-placeholder">
            <el-icon size="64" color="#ddd"><ChatDotRound /></el-icon>
            <p>选择一个会话开始聊天</p>
          </div>

          <div v-else class="chat-content">
            <div class="chat-header">
              <div class="chat-user">
                <el-avatar :size="40" :src="getConversationAvatar(selectedConversation)">
                  {{ getConversationName(selectedConversation)?.charAt(0) }}
                </el-avatar>
                <div class="user-info">
                  <div class="user-name">{{ getConversationName(selectedConversation) }}</div>
                  <div class="user-status">
                    <span class="status-dot online"></span>
                    在线
                  </div>
                </div>
              </div>
              <div class="chat-actions">
                <el-button type="text" circle @click="handleMore">
                  <el-icon><MoreFilled /></el-icon>
                </el-button>
              </div>
            </div>

            <div class="messages-container" ref="messagesContainer">
              <div
                v-for="message in messages"
                :key="message.id"
                class="message-item"
                :class="{ 'is-mine': message.senderId === userStore.user?.id }"
              >
                <el-avatar
                  v-if="message.senderId !== userStore.user?.id"
                  :size="36"
                  :src="message.sender?.avatar"
                >
                  {{ message.sender?.nickname?.charAt(0) }}
                </el-avatar>
                <div class="message-content">
                  <div
                    class="message-bubble"
                    :class="{
                      'type-image': message.type === 'image',
                      'type-note': message.type === 'note_share',
                      'type-product': message.type === 'product_share',
                    }"
                  >
                    <template v-if="message.type === 'text'">
                      {{ message.content }}
                    </template>
                    <template v-else-if="message.type === 'image'">
                      <el-image :src="message.metadata?.imageUrl" fit="cover" style="max-width: 200px; border-radius: 8px" />
                    </template>
                    <template v-else-if="message.type === 'note_share'">
                      <div class="share-card" @click="$router.push(`/note/${message.metadata?.noteId}`)">
                        <div class="share-type">
                          <el-icon><Document /></el-icon>
                          分享笔记
                        </div>
                        <div class="share-title">{{ message.metadata?.noteTitle }}</div>
                      </div>
                    </template>
                    <template v-else-if="message.type === 'product_share'">
                      <div class="share-card product">
                        <div class="share-type">
                          <el-icon><Goods /></el-icon>
                          分享商品
                        </div>
                        <div class="share-title">{{ message.metadata?.productTitle }}</div>
                      </div>
                    </template>
                    <template v-else-if="message.type === 'link'">
                      <div class="link-card">
                        <div class="link-title">{{ message.metadata?.linkTitle }}</div>
                        <div class="link-url">{{ message.metadata?.linkUrl }}</div>
                      </div>
                    </template>
                  </div>
                  <div class="message-time">
                    {{ formatTime(message.createdAt) }}
                    <span v-if="message.status === 'recalled'" class="recalled-tip">已撤回</span>
                  </div>
                </div>
                <el-avatar
                  v-if="message.senderId === userStore.user?.id"
                  :size="36"
                  :src="userStore.user?.avatar"
                >
                  {{ userStore.user?.nickname?.charAt(0) }}
                </el-avatar>
              </div>

              <div v-if="loadingMessages" class="loading-more">
                <el-icon class="is-loading"><Loading /></el-icon>
                加载中...
              </div>
            </div>

            <div class="chat-input-area">
              <div class="input-actions">
                <el-button type="text" circle @click="showEmojiPicker = !showEmojiPicker">
                  <el-icon><Smile /></el-icon>
                </el-button>
                <el-button type="text" circle @click="handleImageUpload">
                  <el-icon><Picture /></el-icon>
                </el-button>
                <el-dropdown trigger="click" @command="handleShare">
                  <el-button type="text" circle>
                    <el-icon><Plus /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="note">分享笔记</el-dropdown-item>
                      <el-dropdown-item command="product">分享商品</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
              <el-input
                v-model="messageInput"
                type="textarea"
                :rows="2"
                placeholder="输入消息..."
                resize="none"
                @keyup.enter.ctrl="sendMessage"
              />
              <el-button type="primary" :disabled="!messageInput.trim()" @click="sendMessage">
                发送
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue';
import { ElMessage } from 'element-plus';
import {
  Search,
  ChatDotRound,
  MoreFilled,
  Document,
  Goods,
  Smile,
  Picture,
  Plus,
  Loading,
} from '@element-plus/icons-vue';
import Layout from '@/components/Layout.vue';
import { useUserStore } from '@/stores/user';
import {
  getConversationList,
  getMessageList,
  sendMessage,
  markAsRead,
  recallMessage,
} from '@/api/message';
import type { Conversation, Message } from '@/types';
import dayjs from 'dayjs';

const userStore = useUserStore();

const loading = ref(false);
const loadingMessages = ref(false);
const conversations = ref<Conversation[]>([]);
const selectedConversation = ref<Conversation | null>(null);
const messages = ref<Message[]>([]);
const searchKeyword = ref('');
const activeTab = ref('all');
const messageInput = ref('');
const showEmojiPicker = ref(false);
const messagesContainer = ref<HTMLElement | null>(null);

const formatTime = (time: string) => {
  const now = dayjs();
  const messageTime = dayjs(time);
  if (now.diff(messageTime, 'day') === 0) {
    return messageTime.format('HH:mm');
  } else if (now.diff(messageTime, 'day') === 1) {
    return '昨天';
  } else if (now.diff(messageTime, 'year') === 0) {
    return messageTime.format('MM-DD');
  }
  return messageTime.format('YYYY-MM-DD');
};

const getMessageTypeText = (type: string) => {
  const map: Record<string, string> = {
    image: '图片',
    link: '链接',
    note_share: '笔记',
    product_share: '商品',
  };
  return map[type] || '消息';
};

const getConversationName = (conv: Conversation) => {
  if (conv.type === 'group') {
    return conv.name || '群聊';
  }
  const otherParticipant = conv.participants?.find(p => p.userId !== userStore.user?.id);
  return otherParticipant?.user?.nickname || '用户';
};

const getConversationAvatar = (conv: Conversation) => {
  if (conv.type === 'group') {
    return conv.avatar;
  }
  const otherParticipant = conv.participants?.find(p => p.userId !== userStore.user?.id);
  return otherParticipant?.user?.avatar;
};

const fetchConversations = async () => {
  loading.value = true;
  try {
    const res = await getConversationList({ page: 1, pageSize: 50 });
    if (activeTab.value === 'unread') {
      conversations.value = res?.list?.filter(c => c.unreadCount > 0) || [];
    } else {
      conversations.value = res?.list || [];
    }
  } catch (error) {
    console.error('获取会话列表失败:', error);
  } finally {
    loading.value = false;
  }
};

const fetchMessages = async () => {
  if (!selectedConversation.value) return;
  loadingMessages.value = true;
  try {
    const res = await getMessageList(selectedConversation.value.id, { page: 1, pageSize: 50 });
    messages.value = res?.list?.reverse() || [];
    nextTick(() => {
      scrollToBottom();
    });
  } catch (error) {
    console.error('获取消息列表失败:', error);
  } finally {
    loadingMessages.value = false;
  }
};

const selectConversation = async (conv: Conversation) => {
  selectedConversation.value = conv;
  if (conv.unreadCount > 0) {
    try {
      await markAsRead(conv.id);
      conv.unreadCount = 0;
    } catch (error) {
      console.error('标记已读失败:', error);
    }
  }
  fetchMessages();
};

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

const sendMessage = async () => {
  if (!selectedConversation.value || !messageInput.value.trim()) return;
  try {
    const receiverId = selectedConversation.value.participants?.find(
      p => p.userId !== userStore.user?.id
    )?.userId;
    if (!receiverId) return;

    await sendMessage(selectedConversation.value.id, {
      type: 'text',
      content: messageInput.value.trim(),
    });
    messageInput.value = '';
    fetchMessages();
  } catch (error) {
    console.error('发送消息失败:', error);
    ElMessage.error('发送失败');
  }
};

const handleMore = () => {
  // 更多操作菜单
};

const handleImageUpload = () => {
  // 图片上传
};

const handleShare = (type: string) => {
  // 分享操作
};

const handleRecall = async (message: Message) => {
  try {
    await recallMessage(message.id);
    ElMessage.success('消息已撤回');
    fetchMessages();
  } catch (error) {
    console.error('撤回失败:', error);
    ElMessage.error('撤回失败');
  }
};

onMounted(() => {
  fetchConversations();
});
</script>

<style lang="scss" scoped>
.message-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;

  h1 {
    font-size: 28px;
    font-weight: 700;
    color: #333;
    margin-bottom: 8px;
  }

  p {
    color: #999;
    font-size: 14px;
    margin: 0;
  }
}

.message-container {
  display: flex;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  height: calc(100vh - 180px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.conversation-sidebar {
  width: 320px;
  border-right: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;

  .search-bar {
    padding: 16px;
    border-bottom: 1px solid #f0f0f0;
  }

  .conversation-tabs {
    padding: 0 16px;
    border-bottom: 1px solid #f0f0f0;
  }

  .conversation-list {
    flex: 1;
    overflow-y: auto;

    .conversation-item {
      display: flex;
      gap: 12px;
      padding: 12px 16px;
      cursor: pointer;
      transition: all 0.2s;
      border-bottom: 1px solid #f5f5f5;

      &:hover {
        background: #f9f9f9;
      }

      &.active {
        background: #f0f7ff;
      }

      &.unread {
        .conversation-name {
          font-weight: 600;
        }
        .last-message {
          color: #333;
        }
      }

      .avatar-wrapper {
        position: relative;

        .unread-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          min-width: 18px;
          height: 18px;
          padding: 0 4px;
          background: #f56c6c;
          color: #fff;
          border-radius: 9px;
          font-size: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
        }
      }

      .conversation-info {
        flex: 1;
        min-width: 0;

        .conversation-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;

          .conversation-name {
            font-size: 14px;
            color: #333;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            max-width: 160px;
          }

          .conversation-time {
            font-size: 11px;
            color: #999;
            flex-shrink: 0;
          }
        }

        .last-message {
          font-size: 12px;
          color: #999;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }

    .empty {
      padding: 40px 20px;
    }
  }
}

.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;

  .chat-placeholder {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #999;
    gap: 16px;
  }
}

.chat-content {
  display: flex;
  flex-direction: column;
  height: 100%;

  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #f0f0f0;

    .chat-user {
      display: flex;
      gap: 12px;
      align-items: center;

      .user-info {
        .user-name {
          font-size: 15px;
          font-weight: 600;
          color: #333;
          margin-bottom: 2px;
        }

        .user-status {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #999;

          .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #dcdfe6;

            &.online {
              background: #67c23a;
            }
          }
        }
      }
    }
  }

  .messages-container {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    background: #f9f9f9;

    .message-item {
      display: flex;
      gap: 12px;
      margin-bottom: 20px;

      &.is-mine {
        flex-direction: row-reverse;

        .message-content {
          align-items: flex-end;

          .message-bubble {
            background: #409eff;
            color: #fff;

            &.type-image,
            &.type-note,
            &.type-product {
              background: #fff;
              color: #333;
            }
          }
        }
      }

      .message-content {
        max-width: 60%;
        display: flex;
        flex-direction: column;
        gap: 4px;

        .message-bubble {
          background: #fff;
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 14px;
          line-height: 1.6;
          color: #333;
          word-break: break-word;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

          &.type-image {
            padding: 4px;
          }
        }

        .share-card {
          min-width: 200px;
          padding: 12px;
          background: #f5f5f5;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;

          &:hover {
            background: #ebebeb;
          }

          &.product {
            background: #fff5e6;
          }

          .share-type {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 12px;
            color: #999;
            margin-bottom: 4px;
          }

          .share-title {
            font-size: 14px;
            color: #333;
            font-weight: 500;
          }
        }

        .link-card {
          padding: 12px;
          background: #f5f5f5;
          border-radius: 8px;

          .link-title {
            font-size: 14px;
            color: #409eff;
            margin-bottom: 4px;
          }

          .link-url {
            font-size: 12px;
            color: #999;
          }
        }

        .message-time {
          font-size: 11px;
          color: #bbb;

          .recalled-tip {
            color: #f56c6c;
            margin-left: 8px;
          }
        }
      }
    }

    .loading-more {
      text-align: center;
      color: #999;
      font-size: 13px;
      padding: 20px;
    }
  }

  .chat-input-area {
    padding: 16px 20px;
    border-top: 1px solid #f0f0f0;
    background: #fff;

    .input-actions {
      display: flex;
      gap: 4px;
      margin-bottom: 8px;
    }

    .el-input {
      margin-bottom: 12px;

      textarea {
        resize: none;
      }
    }

    .el-button {
      float: right;
    }
  }
}

.empty {
  padding: 40px 0;
  text-align: center;
}
</style>
