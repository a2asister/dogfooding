<script setup lang="ts">
import { ref, onMounted, nextTick, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import { useChatStore, CHAT_TYPE_PRIVATE, CHAT_TYPE_GROUP, MESSAGE_TYPE_TEXT, MESSAGE_TYPE_IMAGE, MESSAGE_TYPE_FILE, type Message } from '../stores/chat';
import request from '../utils/request';

const router = useRouter();
const userStore = useUserStore();
const chatStore = useChatStore();

const messageInput = ref('');
const messagesContainer = ref<HTMLElement | null>(null);
const searchKeyword = ref('');
const searchResults = ref<any[]>([]);
const showSearchResults = ref(false);

const sidebarTab = ref<'friends' | 'groups'>('friends');
const showEmojiPanel = ref(false);
const showCreateGroupModal = ref(false);
const showGroupInfoModal = ref(false);
const showImagePreview = ref(false);
const previewImageUrl = ref('');
const showContextMenu = ref(false);
const contextMenuPosition = ref({ x: 0, y: 0 });
const contextMenuMessage = ref<Message | null>(null);

const newGroupName = ref('');
const selectedMembers = ref<number[]>([]);

const emojiList = [
  '😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉',
  '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😜', '🤪', '😝',
  '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒',
  '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢',
  '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐',
  '👍', '👎', '👏', '🙌', '🤝', '🙏', '✌️', '🤞', '🤟', '🤘', '👌', '🤌',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕'
];

const groupedFriends = computed(() => {
  const result: any[] = [];
  
  const grouped: any = {};
  chatStore.friends.forEach(friend => {
    const groupId = friend.groupId || 0;
    if (!grouped[groupId]) {
      const group = chatStore.friendGroups.find(g => g.id === groupId);
      grouped[groupId] = {
        id: groupId,
        name: group ? group.groupName : '未分组',
        expanded: group ? group.expanded : chatStore.ungroupedExpanded,
        friends: []
      };
    }
    grouped[groupId].friends.push(friend);
  });
  
  chatStore.friendGroups.forEach(g => {
    if (grouped[g.id]) {
      grouped[g.id].expanded = g.expanded;
    }
  });
  
  if (grouped[0]) {
    grouped[0].expanded = chatStore.ungroupedExpanded;
  }
  
  Object.values(grouped).forEach(g => result.push(g));
  return result.sort((a, b) => {
    if (a.id === 0) return 1;
    if (b.id === 0) return -1;
    return a.id - b.id;
  });
});

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

const loadFriends = async () => {
  try {
    const res: any = await request.get('/friends');
    if (res.code === 200) {
      chatStore.setFriends(res.data.map((f: any) => ({ ...f, unreadCount: f.unread_count || 0 })));
    }
  } catch (e) {
    console.error('加载好友列表失败:', e);
  }
};

const loadFriendGroups = async () => {
  try {
    const res: any = await request.get('/friends/groups');
    if (res.code === 200) {
      chatStore.setFriendGroups(res.data.groups);
    }
  } catch (e) {
    console.error('加载好友分组失败:', e);
  }
};

const loadGroups = async () => {
  try {
    const res: any = await request.get('/groups');
    if (res.code === 200) {
      chatStore.setGroups(res.data);
    }
  } catch (e) {
    console.error('加载群聊列表失败:', e);
  }
};

const selectFriend = async (friend: any) => {
  chatStore.setCurrentFriend(friend);
  await loadHistoryMessages(friend.id);
  await markAsRead(friend.id);
};

const selectGroup = async (group: any) => {
  chatStore.setCurrentGroup(group);
  await loadGroupHistoryMessages(group.groupId);
  await loadGroupInfo(group.groupId);
};

const loadHistoryMessages = async (friendId: number) => {
  try {
    const res: any = await request.get(`/messages/history?friendId=${friendId}&chatType=${CHAT_TYPE_PRIVATE}`);
    if (res.code === 200) {
      chatStore.setMessages(res.data);
      scrollToBottom();
    }
  } catch (e) {
    console.error('加载历史消息失败:', e);
  }
};

const loadGroupHistoryMessages = async (groupId: string) => {
  try {
    const res: any = await request.get(`/messages/history?groupId=${groupId}&chatType=${CHAT_TYPE_GROUP}`);
    if (res.code === 200) {
      chatStore.setMessages(res.data);
      scrollToBottom();
    }
  } catch (e) {
    console.error('加载群历史消息失败:', e);
  }
};

const loadGroupInfo = async (groupId: string) => {
  try {
    const res: any = await request.get(`/groups/info?groupId=${groupId}`);
    if (res.code === 200) {
      chatStore.setCurrentGroupMembers(res.data.members);
    }
  } catch (e) {
    console.error('加载群信息失败:', e);
  }
};

const markAsRead = async (fromUserId: number) => {
  try {
    await request.post('/messages/read', { fromUserId, chatType: CHAT_TYPE_PRIVATE });
  } catch (e) {
    console.error('标记已读失败:', e);
  }
};

const sendMessage = () => {
  if (!messageInput.value.trim()) return;
  
  if (chatStore.currentChatType === CHAT_TYPE_PRIVATE && chatStore.currentFriend) {
    chatStore.sendPrivateMessage(chatStore.currentFriend.id, messageInput.value.trim());
  } else if (chatStore.currentChatType === CHAT_TYPE_GROUP && chatStore.currentGroup) {
    chatStore.sendGroupMessage(chatStore.currentGroup.groupId, messageInput.value.trim());
  }
  
  messageInput.value = '';
  scrollToBottom();
};

const insertEmoji = (emoji: string) => {
  messageInput.value += emoji;
  showEmojiPanel.value = false;
};

const handleImageUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const res: any = await request.post('/upload/image', formData);
    
    if (res.code === 200) {
      if (chatStore.currentChatType === CHAT_TYPE_PRIVATE && chatStore.currentFriend) {
        chatStore.sendPrivateMessage(
          chatStore.currentFriend.id,
          '',
          MESSAGE_TYPE_IMAGE,
          { url: res.data.url, name: res.data.name, size: res.data.size }
        );
      } else if (chatStore.currentChatType === CHAT_TYPE_GROUP && chatStore.currentGroup) {
        chatStore.sendGroupMessage(
          chatStore.currentGroup.groupId,
          '',
          MESSAGE_TYPE_IMAGE,
          { url: res.data.url, name: res.data.name, size: res.data.size }
        );
      }
      scrollToBottom();
    }
  } catch (e) {
    console.error('上传图片失败:', e);
    userStore.showToast('error', '上传图片失败');
  }
  
  input.value = '';
};

const handleFileUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const res: any = await request.post('/upload/file', formData);
    
    if (res.code === 200) {
      if (chatStore.currentChatType === CHAT_TYPE_PRIVATE && chatStore.currentFriend) {
        chatStore.sendPrivateMessage(
          chatStore.currentFriend.id,
          file.name,
          MESSAGE_TYPE_FILE,
          { url: res.data.url, name: res.data.name, size: res.data.size }
        );
      } else if (chatStore.currentChatType === CHAT_TYPE_GROUP && chatStore.currentGroup) {
        chatStore.sendGroupMessage(
          chatStore.currentGroup.groupId,
          file.name,
          MESSAGE_TYPE_FILE,
          { url: res.data.url, name: res.data.name, size: res.data.size }
        );
      }
      scrollToBottom();
    }
  } catch (e) {
    console.error('上传文件失败:', e);
    userStore.showToast('error', '上传文件失败');
  }
  
  input.value = '';
};

const openImagePreview = (url: string) => {
  previewImageUrl.value = url;
  showImagePreview.value = true;
};

const openContextMenu = (event: MouseEvent, message: Message) => {
  event.preventDefault();
  contextMenuPosition.value = { x: event.clientX, y: event.clientY };
  contextMenuMessage.value = message;
  showContextMenu.value = true;
};

const closeContextMenu = () => {
  showContextMenu.value = false;
  contextMenuMessage.value = null;
};

const recallMessage = async () => {
  if (!contextMenuMessage.value) return;
  
  const canRecall = contextMenuMessage.value.fromUserId === chatStore.currentUserId &&
    !contextMenuMessage.value.isRecalled;
  
  if (!canRecall) {
    userStore.showToast('error', '无法撤回此消息');
    closeContextMenu();
    return;
  }
  
  const success = chatStore.recallMessage(contextMenuMessage.value.messageId);
  if (success) {
    userStore.showToast('success', '撤回成功');
  }
  
  closeContextMenu();
};

const deleteMessage = async () => {
  if (!contextMenuMessage.value) return;
  
  try {
    const res: any = await request.post('/messages/delete', {
      messageId: contextMenuMessage.value.messageId
    });
    if (res.code === 200) {
      chatStore.setMessages(chatStore.messages.filter(m => m.messageId !== contextMenuMessage.value!.messageId));
      userStore.showToast('success', '删除成功');
    }
  } catch (e) {
    console.error('删除失败:', e);
    userStore.showToast('error', '删除失败');
  }
  
  closeContextMenu();
};

const searchUser = async () => {
  if (!searchKeyword.value.trim()) {
    searchResults.value = [];
    showSearchResults.value = false;
    return;
  }
  
  try {
    const res: any = await request.get(`/user/search?keyword=${searchKeyword.value}`);
    if (res.code === 200) {
      searchResults.value = res.data.filter((u: any) => u.id !== userStore.user?.id);
      showSearchResults.value = true;
    }
  } catch (e) {
    console.error('搜索用户失败:', e);
  }
};

const addFriend = async (user: any) => {
  try {
    const res: any = await request.post('/friends/add', { friendId: user.id });
    if (res.code === 200) {
      userStore.showToast('success', '添加好友成功');
      showSearchResults.value = false;
      searchKeyword.value = '';
      await loadFriends();
    } else {
      userStore.showToast('error', res.message);
    }
  } catch (e) {
    userStore.showToast('error', '添加好友失败');
  }
};

const createGroup = async () => {
  if (!newGroupName.value.trim()) {
    userStore.showToast('error', '请输入群名称');
    return;
  }
  
  try {
    const res: any = await request.post('/groups/create', {
      groupName: newGroupName.value,
      memberIds: selectedMembers.value
    });
    if (res.code === 200) {
      userStore.showToast('success', '创建群聊成功');
      showCreateGroupModal.value = false;
      newGroupName.value = '';
      selectedMembers.value = [];
      await loadGroups();
    } else {
      userStore.showToast('error', res.message);
    }
  } catch (e) {
    userStore.showToast('error', '创建群聊失败');
  }
};

const logout = () => {
  chatStore.disconnectWebSocket();
  userStore.logout();
  router.push('/login');
};

const formatTime = (timeStr: string) => {
  const date = new Date(timeStr);
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const getDisplayName = (msg: Message) => {
  if (msg.chatType === CHAT_TYPE_GROUP) {
    return msg.fromUsername || '未知用户';
  }
  if (msg.fromUserId === chatStore.currentUserId) {
    return userStore.user?.username || '我';
  }
  return chatStore.currentFriend?.remark || chatStore.currentFriend?.username || '未知用户';
};

onMounted(async () => {
  await Promise.all([loadFriends(), loadFriendGroups(), loadGroups()]);
  if (userStore.token) {
    chatStore.connectWebSocket(userStore.token);
  }
  
  document.addEventListener('click', closeContextMenu);
});

watch(() => chatStore.messages, () => {
  scrollToBottom();
}, { deep: true });
</script>

<template>
  <div class="chat-container">
    <div class="sidebar">
      <div class="user-header">
        <div class="user-info">
          <div class="user-avatar">{{ userStore.user?.username?.charAt(0) }}</div>
          <span class="username">{{ userStore.user?.username }}</span>
        </div>
        <button class="logout-btn" @click="logout">退出</button>
      </div>
      
      <div class="search-box">
        <input
          v-model="searchKeyword"
          type="text"
          class="input"
          placeholder="搜索用户添加好友"
          @input="searchUser"
          @focus="searchKeyword && searchUser()"
        />
        <div v-if="showSearchResults && searchResults.length" class="search-results">
          <div
            v-for="user in searchResults"
            :key="user.id"
            class="search-result-item"
          >
            <span class="username">{{ user.username }}</span>
            <button class="add-btn" @click="addFriend(user)">添加</button>
          </div>
        </div>
      </div>

      <div class="sidebar-tabs">
        <button
          class="tab-btn"
          :class="{ active: sidebarTab === 'friends' }"
          @click="sidebarTab = 'friends'"
        >
          好友
        </button>
        <button
          class="tab-btn"
          :class="{ active: sidebarTab === 'groups' }"
          @click="sidebarTab = 'groups'"
        >
          群聊
        </button>
        <button
          v-if="sidebarTab === 'groups'"
          class="create-group-btn"
          @click="showCreateGroupModal = true"
        >
          +
        </button>
      </div>

      <div class="friends-list" v-if="sidebarTab === 'friends'">
        <div v-for="group in groupedFriends" :key="group.id" class="friend-group">
          <div class="group-header" @click="chatStore.toggleGroupExpand(group.id)">
            <span class="expand-icon">{{ group.expanded ? '▼' : '▶' }}</span>
            <span class="group-name">{{ group.name }}</span>
            <span class="group-count">({{ group.friends.length }})</span>
          </div>
          <div v-if="group.expanded" class="group-members">
            <div
              v-for="friend in group.friends"
              :key="friend.id"
              class="friend-item"
              :class="{ active: chatStore.currentFriend?.id === friend.id }"
              @click="selectFriend(friend)"
            >
              <div class="friend-avatar">{{ (friend.remark || friend.username).charAt(0) }}</div>
              <div class="friend-info">
                <span class="friend-name">{{ friend.remark || friend.username }}</span>
              </div>
              <span v-if="friend.unreadCount > 0" class="unread-badge">
                {{ friend.unreadCount }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="groups-list" v-else>
        <div
          v-for="group in chatStore.groups"
          :key="group.groupId"
          class="group-item"
          :class="{ active: chatStore.currentGroup?.groupId === group.groupId }"
          @click="selectGroup(group)"
        >
          <div class="group-avatar">{{ group.groupName.charAt(0) }}</div>
          <div class="group-info">
            <span class="group-name">{{ group.groupName }}</span>
            <span class="group-members">{{ group.memberCount }}人</span>
          </div>
          <span v-if="group.unreadCount > 0" class="unread-badge">
            {{ group.unreadCount }}
          </span>
        </div>
      </div>
    </div>

    <div class="main-content">
      <div v-if="chatStore.currentChatTarget" class="chat-content">
        <div class="chat-header">
          <span v-if="chatStore.currentChatType === CHAT_TYPE_PRIVATE">
            {{ chatStore.currentFriend?.remark || chatStore.currentFriend?.username }}
          </span>
          <span v-else>
            {{ chatStore.currentGroup?.groupName }}
          </span>
          <button
            v-if="chatStore.currentChatType === CHAT_TYPE_GROUP"
            class="group-info-btn"
            @click="showGroupInfoModal = true"
          >
            ⓘ
          </button>
        </div>

        <div
          ref="messagesContainer"
          class="messages-list"
          @click.self="closeContextMenu"
        >
          <div
            v-for="msg in chatStore.messages"
            :key="msg.messageId"
            class="message-item"
            :class="{
              'message-self': msg.fromUserId === chatStore.currentUserId,
              'message-recalled': msg.isRecalled
            }"
            @contextmenu="openContextMenu($event, msg)"
          >
            <div class="message-avatar">
              {{ msg.fromUserId === chatStore.currentUserId
                ? userStore.user?.username?.charAt(0)
                : (chatStore.currentChatType === CHAT_TYPE_GROUP
                    ? (msg.fromUsername?.charAt(0) || '?')
                    : (chatStore.currentFriend?.username.charAt(0) || '?'))
              }}
            </div>
            <div class="message-content">
              <div v-if="msg.chatType === CHAT_TYPE_GROUP && msg.fromUserId !== chatStore.currentUserId" class="message-sender">
                {{ msg.fromUsername }}
              </div>
              <div v-if="msg.isRecalled" class="message-recalled-text">
                {{ msg.fromUserId === chatStore.currentUserId ? '你' : '对方' }}撤回了一条消息
              </div>
              <template v-else>
                <div v-if="msg.messageType === MESSAGE_TYPE_IMAGE" class="message-image" @click.stop="openImagePreview(msg.mediaUrl!)">
                  <img :src="'http://localhost:4524' + msg.mediaUrl" alt="图片" />
                </div>
                <div v-else-if="msg.messageType === MESSAGE_TYPE_FILE" class="message-file">
                  <div class="file-icon">📄</div>
                  <div class="file-info">
                    <div class="file-name">{{ msg.mediaName }}</div>
                    <div class="file-size">{{ formatFileSize(msg.mediaSize || 0) }}</div>
                  </div>
                  <a
                    class="download-btn"
                    :href="'http://localhost:4524' + msg.mediaUrl"
                    :download="msg.mediaName"
                    @click.stop
                  >
                    下载
                  </a>
                </div>
                <div v-else class="message-text">{{ msg.content }}</div>
              </template>
              <div class="message-time">
                {{ formatTime(msg.createdAt) }}
                <span v-if="msg._sending" class="sending-indicator">发送中...</span>
              </div>
            </div>
          </div>
        </div>

        <div class="input-area">
          <div class="toolbar">
            <button class="toolbar-btn" @click="showEmojiPanel = !showEmojiPanel">😊</button>
            <label class="toolbar-btn">
              🖼️
              <input type="file" accept="image/*" hidden @change="handleImageUpload" />
            </label>
            <label class="toolbar-btn">
              📎
              <input type="file" hidden @change="handleFileUpload" />
            </label>
          </div>
          
          <div v-if="showEmojiPanel" class="emoji-panel">
            <span
              v-for="emoji in emojiList"
              :key="emoji"
              class="emoji-item"
              @click="insertEmoji(emoji)"
            >
              {{ emoji }}
            </span>
          </div>
          
          <textarea
            v-model="messageInput"
            class="message-input"
            placeholder="输入消息..."
            @keyup.enter.exact="sendMessage"
          ></textarea>
          <button class="send-btn btn btn-primary" @click="sendMessage">
            发送
          </button>
        </div>
      </div>

      <div v-else class="empty-state">
        <div class="empty-icon">💬</div>
        <p>选择一个好友或群聊开始聊天</p>
      </div>
    </div>

    <div v-if="showContextMenu" class="context-menu" :style="{ left: contextMenuPosition.x + 'px', top: contextMenuPosition.y + 'px' }">
      <button
        v-if="contextMenuMessage && contextMenuMessage.fromUserId === chatStore.currentUserId && !contextMenuMessage.isRecalled"
        class="context-menu-item"
        @click="recallMessage"
      >
        撤回
      </button>
      <button class="context-menu-item" @click="deleteMessage">删除</button>
    </div>

    <div v-if="showCreateGroupModal" class="modal-overlay" @click.self="showCreateGroupModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3>创建群聊</h3>
          <button class="close-btn" @click="showCreateGroupModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>群名称</label>
            <input v-model="newGroupName" type="text" class="input" placeholder="请输入群名称" />
          </div>
          <div class="form-group">
            <label>选择成员</label>
            <div class="member-select">
              <label v-for="friend in chatStore.friends" :key="friend.id" class="member-item">
                <input
                  type="checkbox"
                  :value="friend.id"
                  v-model="selectedMembers"
                />
                <span>{{ friend.remark || friend.username }}</span>
              </label>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showCreateGroupModal = false">取消</button>
          <button class="btn btn-primary" @click="createGroup">创建</button>
        </div>
      </div>
    </div>

    <div v-if="showGroupInfoModal && chatStore.currentGroup" class="modal-overlay" @click.self="showGroupInfoModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3>群信息</h3>
          <button class="close-btn" @click="showGroupInfoModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="group-info-detail">
            <div class="info-item">
              <span class="label">群名称:</span>
              <span class="value">{{ chatStore.currentGroup.groupName }}</span>
            </div>
            <div class="info-item">
              <span class="label">成员数:</span>
              <span class="value">{{ chatStore.currentGroup.memberCount }}</span>
            </div>
            <div v-if="chatStore.currentGroup.announcement" class="info-item">
              <span class="label">群公告:</span>
              <span class="value">{{ chatStore.currentGroup.announcement }}</span>
            </div>
          </div>
          <div class="group-members-list">
            <h4>群成员</h4>
            <div class="member-list">
              <div v-for="member in chatStore.currentGroupMembers" :key="member.userId" class="member-card">
                <div class="member-avatar">{{ member.username.charAt(0) }}</div>
                <div class="member-name">{{ member.username }}</div>
                <div v-if="member.role === 1" class="member-role">群主</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showImagePreview" class="image-preview-overlay" @click="showImagePreview = false">
      <div class="image-preview-container">
        <img :src="'http://localhost:4524' + previewImageUrl" alt="预览" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-container {
  display: flex;
  height: 100vh;
  background: #f5f5f5;
}

.sidebar {
  width: 300px;
  background: white;
  border-right: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
}

.user-header {
  padding: 20px;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #1890ff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.user-header .username {
  font-weight: 600;
  font-size: 16px;
}

.logout-btn {
  padding: 6px 12px;
  border: 1px solid #d9d9d9;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}

.logout-btn:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.search-box {
  padding: 15px 20px;
  position: relative;
}

.input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.input:focus {
  outline: none;
  border-color: #1890ff;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 20px;
  right: 20px;
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 100;
  max-height: 200px;
  overflow-y: auto;
}

.search-result-item {
  padding: 12px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
}

.search-result-item:last-child {
  border-bottom: none;
}

.add-btn {
  padding: 4px 12px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.add-btn:hover {
  background: #40a9ff;
}

.sidebar-tabs {
  display: flex;
  padding: 0 20px;
  border-bottom: 1px solid #e8e8e8;
}

.tab-btn {
  padding: 12px 20px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 14px;
  border-bottom: 2px solid transparent;
}

.tab-btn.active {
  border-bottom-color: #1890ff;
  color: #1890ff;
  font-weight: 600;
}

.create-group-btn {
  margin-left: auto;
  padding: 12px;
  font-size: 18px;
  background: none;
  border: none;
  cursor: pointer;
  color: #1890ff;
}

.friends-list, .groups-list {
  flex: 1;
  overflow-y: auto;
}

.friend-group {
  border-bottom: 1px solid #f0f0f0;
}

.group-header {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 13px;
  color: #666;
}

.expand-icon {
  margin-right: 8px;
  font-size: 10px;
}

.group-name {
  flex: 1;
}

.group-count {
  color: #999;
}

.friend-item, .group-item {
  display: flex;
  align-items: center;
  padding: 15px 20px 15px 40px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
}

.friend-item:hover, .group-item:hover {
  background: #f5f5f5;
}

.friend-item.active, .group-item.active {
  background: #e6f7ff;
}

.friend-avatar, .group-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #1890ff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-right: 12px;
}

.friend-info, .group-info {
  flex: 1;
}

.friend-name, .group-name {
  font-size: 14px;
  font-weight: 500;
}

.group-members {
  font-size: 12px;
  color: #999;
}

.unread-badge {
  background: #ff4d4f;
  color: white;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chat-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-header {
  padding: 20px;
  background: white;
  border-bottom: 1px solid #e8e8e8;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.group-info-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: #f0f0f0;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
}

.group-info-btn:hover {
  background: #e8e8e8;
}

.messages-list {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.message-item {
  display: flex;
  margin-bottom: 20px;
  align-items: flex-start;
}

.message-self {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #1890ff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
}

.message-self .message-avatar {
  background: #52c41a;
}

.message-content {
  max-width: 60%;
  margin: 0 12px;
}

.message-sender {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.message-text {
  background: white;
  padding: 10px 15px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  word-break: break-word;
}

.message-self .message-text {
  background: #95de64;
}

.message-recalled-text {
  color: #999;
  font-style: italic;
  padding: 10px 15px;
}

.message-image img {
  max-width: 300px;
  max-height: 300px;
  border-radius: 8px;
  cursor: pointer;
}

.message-file {
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  padding: 12px 15px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.file-icon {
  font-size: 32px;
}

.file-info {
  flex: 1;
}

.file-name {
  font-size: 14px;
  font-weight: 500;
}

.file-size {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.download-btn {
  padding: 6px 12px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  text-decoration: none;
}

.message-time {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.sending-indicator {
  margin-left: 8px;
  color: #1890ff;
}

.input-area {
  padding: 20px;
  background: white;
  border-top: 1px solid #e8e8e8;
  position: relative;
}

.toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.toolbar-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #f0f0f0;
  border-radius: 4px;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toolbar-btn:hover {
  background: #e8e8e8;
}

.emoji-panel {
  position: absolute;
  bottom: 100%;
  left: 20px;
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 8px;
  z-index: 10;
}

.emoji-item {
  font-size: 24px;
  cursor: pointer;
  text-align: center;
  padding: 4px;
  border-radius: 4px;
}

.emoji-item:hover {
  background: #f0f0f0;
}

.message-input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  resize: none;
  height: 80px;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
  margin-bottom: 10px;
}

.message-input:focus {
  border-color: #1890ff;
}

.send-btn {
  width: 100%;
  padding: 10px;
  font-size: 16px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-primary {
  background: #1890ff;
  color: white;
}

.btn-primary:hover {
  background: #40a9ff;
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
}

.btn-secondary:hover {
  background: #e8e8e8;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #999;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 120px;
}

.context-menu-item {
  display: block;
  width: 100%;
  padding: 10px 15px;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
}

.context-menu-item:hover {
  background: #f5f5f5;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 8px;
  width: 500px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e8e8e8;
}

.modal-header h3 {
  margin: 0;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #e8e8e8;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.member-select {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 10px;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  cursor: pointer;
}

.member-item:hover {
  background: #f5f5f5;
}

.group-info-detail {
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  margin-bottom: 12px;
}

.info-item .label {
  width: 80px;
  color: #666;
}

.info-item .value {
  flex: 1;
  font-weight: 500;
}

.group-members-list h4 {
  margin: 0 0 15px 0;
}

.member-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.member-card {
  text-align: center;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 8px;
}

.member-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #1890ff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin: 0 auto 8px;
}

.member-name {
  font-size: 14px;
  font-weight: 500;
}

.member-role {
  font-size: 12px;
  color: #fa8c16;
  margin-top: 4px;
}

.image-preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.image-preview-container img {
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
}
</style>
