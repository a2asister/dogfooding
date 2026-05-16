<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { useChatStore } from '../stores/chat'
import request from '../utils/request'

const router = useRouter()
const userStore = useUserStore()
const chatStore = useChatStore()

const messageInput = ref('')
const messagesContainer = ref<HTMLElement | null>(null)
const searchKeyword = ref('')
const searchResults = ref<any[]>([])
const showSearchResults = ref(false)

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const loadFriends = async () => {
  try {
    const currentFriendId = chatStore.currentFriend?.id
    const res: any = await request.get('/friends')
    if (res.code === 200) {
      chatStore.setFriends(res.data)
      if (currentFriendId) {
        const updatedFriend = res.data.find((f: any) => f.id === currentFriendId)
        if (updatedFriend) {
          chatStore.setCurrentFriend(updatedFriend)
        }
      }
    }
  } catch (e) {
    console.error('加载好友列表失败:', e)
  }
}

const selectFriend = async (friend: any) => {
  chatStore.setCurrentFriend(friend)
  await loadHistoryMessages(friend.id)
  await markAsRead(friend.id)
}

const loadHistoryMessages = async (friendId: number) => {
  try {
    const res: any = await request.get(`/messages/history?friendId=${friendId}`)
    if (res.code === 200) {
      chatStore.setMessages(res.data)
      scrollToBottom()
    }
  } catch (e) {
    console.error('加载历史消息失败:', e)
  }
}

const markAsRead = async (fromUserId: number) => {
  try {
    await request.post('/messages/read', { fromUserId })
  } catch (e) {
    console.error('标记已读失败:', e)
  }
}

const sendMessage = () => {
  if (!messageInput.value.trim() || !chatStore.currentFriend) {
    return
  }

  const success = chatStore.sendMessage(
    chatStore.currentFriend.id,
    messageInput.value.trim()
  )

  if (success) {
    messageInput.value = ''
    scrollToBottom()
  }
}

const searchUser = async () => {
  if (!searchKeyword.value.trim()) {
    searchResults.value = []
    showSearchResults.value = false
    return
  }

  try {
    const res: any = await request.get(`/user/search?keyword=${searchKeyword.value}`)
    if (res.code === 200) {
      searchResults.value = res.data.filter((u: any) => u.id !== userStore.user?.id)
      showSearchResults.value = true
    }
  } catch (e) {
    console.error('搜索用户失败:', e)
  }
}

const addFriend = async (user: any) => {
  try {
    const res: any = await request.post('/friends/add', { friendId: user.id })
    if (res.code === 200) {
      alert('添加好友成功')
      showSearchResults.value = false
      searchKeyword.value = ''
      await loadFriends()
    } else {
      alert(res.message)
    }
  } catch (e) {
    alert('添加好友失败')
  }
}

const logout = () => {
  chatStore.disconnectWebSocket()
  userStore.logout()
  router.push('/login')
}

const formatTime = (timeStr: string) => {
  const date = new Date(timeStr)
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

onMounted(async () => {
  await loadFriends()
  if (userStore.token) {
    chatStore.connectWebSocket(userStore.token)
  }
})

watch(() => chatStore.messages, () => {
  scrollToBottom()
}, { deep: true })
</script>

<template>
  <div class="chat-container">
    <div class="sidebar">
      <div class="user-header">
        <span class="username">{{ userStore.user?.username }}</span>
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

      <div class="friends-header">
        <span>好友列表</span>
        <button class="refresh-btn" @click="loadFriends">刷新</button>
      </div>

      <div class="friends-list">
        <div
          v-for="friend in chatStore.friends"
          :key="friend.id"
          class="friend-item"
          :class="{ active: chatStore.currentFriend?.id === friend.id }"
          @click="selectFriend(friend)"
        >
          <div class="friend-avatar">{{ friend.username.charAt(0) }}</div>
          <div class="friend-info">
            <span class="friend-name">{{ friend.username }}</span>
          </div>
          <span v-if="friend.unread_count > 0" class="unread-badge">
            {{ friend.unread_count }}
          </span>
        </div>
      </div>
    </div>

    <div class="main-content">
      <div v-if="chatStore.currentFriend" class="chat-content">
        <div class="chat-header">
          <span>{{ chatStore.currentFriend.username }}</span>
        </div>

        <div ref="messagesContainer" class="messages-list">
          <div
            v-for="msg in chatStore.messages"
            :key="msg.messageId"
            class="message-item"
            :class="{ 'message-self': msg.fromUserId === chatStore.currentUserId }"
          >
            <div class="message-avatar">
              {{ msg.fromUserId === chatStore.currentUserId
                ? userStore.user?.username?.charAt(0)
                : chatStore.currentFriend.username.charAt(0) }}
            </div>
            <div class="message-content">
              <div class="message-text">{{ msg.content }}</div>
              <div class="message-time">{{ formatTime(msg.createdAt) }}</div>
            </div>
          </div>
        </div>

        <div class="input-area">
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
        <p>选择一个好友开始聊天</p>
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

.friends-header {
  padding: 10px 20px;
  font-size: 14px;
  color: #666;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.refresh-btn {
  padding: 4px 10px;
  border: 1px solid #d9d9d9;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.refresh-btn:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.friends-list {
  flex: 1;
  overflow-y: auto;
}

.friend-item {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
}

.friend-item:hover {
  background: #f5f5f5;
}

.friend-item.active {
  background: #e6f7ff;
}

.friend-avatar {
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

.friend-info {
  flex: 1;
}

.friend-name {
  font-size: 14px;
  font-weight: 500;
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

.message-time {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.input-area {
  padding: 20px;
  background: white;
  border-top: 1px solid #e8e8e8;
  display: flex;
  gap: 15px;
}

.message-input {
  flex: 1;
  padding: 12px 15px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  resize: none;
  height: 80px;
  font-size: 14px;
  outline: none;
}

.message-input:focus {
  border-color: #1890ff;
}

.send-btn {
  align-self: flex-end;
  padding: 10px 30px;
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
</style>
