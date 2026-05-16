import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import type { User } from './user';
import { useUserStore } from './user';

export const MESSAGE_TYPE_TEXT = 1;
export const MESSAGE_TYPE_IMAGE = 2;
export const MESSAGE_TYPE_FILE = 3;
export const MESSAGE_TYPE_EMOJI = 4;

export const CHAT_TYPE_PRIVATE = 1;
export const CHAT_TYPE_GROUP = 2;

export interface Message {
  messageId: string;
  chatType: number;
  fromUserId: number;
  toUserId?: number;
  groupId?: string;
  messageType: number;
  content: string;
  mediaUrl?: string;
  mediaName?: string;
  mediaSize?: number;
  isRead?: number;
  isRecalled?: number;
  createdAt: string;
  fromUsername?: string;
  fromAvatar?: string;
  _sending?: boolean;
}

export interface Friend extends User {
  remark?: string;
  groupId?: number;
  groupName?: string;
  unreadCount?: number;
  createdAt?: string;
}

export interface FriendGroup {
  id: number;
  groupName: string;
  sortOrder: number;
  friendCount: number;
  createdAt: string;
  expanded?: boolean;
}

export interface Group {
  groupId: string;
  groupName: string;
  groupAvatar?: string;
  ownerId: number;
  role: number;
  memberCount: number;
  unreadCount: number;
  announcement?: string;
  createdAt: string;
}

export interface GroupMember {
  userId: number;
  username: string;
  avatar?: string;
  role: number;
  groupRemark?: string;
  joinedAt: string;
}

export const useChatStore = defineStore('chat', () => {
  const userStore = useUserStore();
  
  const friends = ref<Friend[]>([]);
  const friendGroups = ref<FriendGroup[]>([]);
  const groups = ref<Group[]>([]);
  
  const currentChatType = ref(CHAT_TYPE_PRIVATE);
  const currentFriend = ref<Friend | null>(null);
  const currentGroup = ref<Group | null>(null);
  const currentGroupMembers = ref<GroupMember[]>([]);
  
  const messages = ref<Message[]>([]);
  const ws = ref<WebSocket | null>(null);
  const isConnected = ref(false);
  const reconnectAttempts = ref(0);
  const maxReconnectAttempts = 10;
  const reconnectDelay = 3000;

  const currentUserId = computed(() => userStore.user?.id ?? 0);
  
  const unreadTotal = computed(() => {
    const friendUnread = friends.value.reduce((sum, f) => sum + (f.unreadCount || 0), 0);
    const groupUnread = groups.value.reduce((sum, g) => sum + (g.unreadCount || 0), 0);
    return friendUnread + groupUnread;
  });

  const currentChatTarget = computed(() => {
    if (currentChatType.value === CHAT_TYPE_PRIVATE) {
      return currentFriend.value;
    }
    return currentGroup.value;
  });

  const connectWebSocket = (token: string) => {
    if (ws.value && (ws.value.readyState === WebSocket.OPEN || ws.value.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      ws.value = new WebSocket('ws://localhost:4525');
      
      ws.value.onopen = () => {
        isConnected.value = true;
        reconnectAttempts.value = 0;
        ws.value?.send(JSON.stringify({ type: 'auth', token }));
        userStore.showToast('success', 'WebSocket连接成功');
      };

      ws.value.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'auth_success') {
          console.log('WebSocket认证成功');
          return;
        }

        if (data.type === 'message') {
          messages.value.push({
            messageId: data.messageId,
            chatType: data.chatType,
            fromUserId: data.fromUserId,
            toUserId: data.toUserId,
            groupId: data.groupId,
            messageType: data.messageType,
            content: data.content,
            mediaUrl: data.mediaUrl,
            mediaName: data.mediaName,
            mediaSize: data.mediaSize,
            createdAt: data.createdAt,
            fromUsername: data.fromUsername,
            fromAvatar: data.fromAvatar
          });
          
          if (data.chatType === CHAT_TYPE_PRIVATE && currentFriend.value?.id !== data.fromUserId) {
            const friend = friends.value.find(f => f.id === data.fromUserId);
            if (friend) {
              friend.unreadCount = (friend.unreadCount || 0) + 1;
            }
          } else if (data.chatType === CHAT_TYPE_GROUP && currentGroup.value?.groupId !== data.groupId) {
            const group = groups.value.find(g => g.groupId === data.groupId);
            if (group) {
              group.unreadCount = (group.unreadCount || 0) + 1;
            }
          }
        }

        if (data.type === 'message_recalled') {
          const msg = messages.value.find(m => m.messageId === data.messageId);
          if (msg) {
            msg.isRecalled = 1;
          }
        }

        if (data.type === 'heartbeat_ping') {
          ws.value?.send(JSON.stringify({ type: 'heartbeat_pong' }));
        }
      };

      ws.value.onclose = () => {
        isConnected.value = false;
        if (reconnectAttempts.value < maxReconnectAttempts) {
          reconnectAttempts.value++;
          userStore.showToast('info', `连接断开，正在重连 (${reconnectAttempts.value}/${maxReconnectAttempts})...`);
          setTimeout(() => connectWebSocket(token), reconnectDelay);
        } else {
          userStore.showToast('error', 'WebSocket重连失败，请刷新页面');
        }
      };

      ws.value.onerror = () => {
        isConnected.value = false;
      };
    } catch (e) {
      console.error('WebSocket 连接失败:', e);
      userStore.showToast('error', 'WebSocket连接失败');
    }
  };

  const sendPrivateMessage = (toUserId: number, content: string, messageType = MESSAGE_TYPE_TEXT, mediaData?: any) => {
    if (!ws.value || ws.value.readyState !== WebSocket.OPEN) {
      userStore.showToast('error', 'WebSocket未连接');
      return false;
    }

    const messageId = uuidv4();
    const message: Message = {
      messageId,
      chatType: CHAT_TYPE_PRIVATE,
      fromUserId: currentUserId.value,
      fromUsername: userStore.user?.username || '我',
      fromAvatar: userStore.user?.avatar,
      toUserId,
      messageType,
      content,
      mediaUrl: mediaData?.url,
      mediaName: mediaData?.name,
      mediaSize: mediaData?.size,
      createdAt: new Date().toISOString(),
      _sending: true
    };

    ws.value.send(JSON.stringify({
      type: 'message',
      messageId,
      chatType: CHAT_TYPE_PRIVATE,
      toUserId,
      messageType,
      content,
      mediaUrl: mediaData?.url,
      mediaName: mediaData?.name,
      mediaSize: mediaData?.size
    }));

    messages.value.push(message);

    setTimeout(() => {
      const msg = messages.value.find(m => m.messageId === messageId);
      if (msg) {
        msg._sending = false;
      }
    }, 1000);

    return true;
  };

  const sendGroupMessage = (groupId: string, content: string, messageType = MESSAGE_TYPE_TEXT, mediaData?: any) => {
    if (!ws.value || ws.value.readyState !== WebSocket.OPEN) {
      userStore.showToast('error', 'WebSocket未连接');
      return false;
    }

    const messageId = uuidv4();
    const message: Message = {
      messageId,
      chatType: CHAT_TYPE_GROUP,
      fromUserId: currentUserId.value,
      fromUsername: userStore.user?.username || '我',
      fromAvatar: userStore.user?.avatar,
      groupId,
      messageType,
      content,
      mediaUrl: mediaData?.url,
      mediaName: mediaData?.name,
      mediaSize: mediaData?.size,
      createdAt: new Date().toISOString(),
      _sending: true
    };

    ws.value.send(JSON.stringify({
      type: 'message',
      messageId,
      chatType: CHAT_TYPE_GROUP,
      groupId,
      messageType,
      content,
      mediaUrl: mediaData?.url,
      mediaName: mediaData?.name,
      mediaSize: mediaData?.size
    }));

    messages.value.push(message);

    setTimeout(() => {
      const msg = messages.value.find(m => m.messageId === messageId);
      if (msg) {
        msg._sending = false;
      }
    }, 1000);

    return true;
  };

  const recallMessage = (messageId: string) => {
    if (!ws.value || ws.value.readyState !== WebSocket.OPEN) {
      userStore.showToast('error', 'WebSocket未连接');
      return false;
    }

    const msg = messages.value.find(m => m.messageId === messageId);
    if (msg) {
      msg.isRecalled = 1;
    }

    ws.value.send(JSON.stringify({
      type: 'recall_message',
      messageId
    }));

    return true;
  };

  const setFriends = (newFriends: Friend[]) => {
    friends.value = newFriends;
  };

  const ungroupedExpanded = ref(true);

  const setFriendGroups = (newGroups: FriendGroup[]) => {
    friendGroups.value = newGroups.map(g => ({ ...g, expanded: true }));
  };

  const toggleGroupExpand = (groupId: number) => {
    if (groupId === 0) {
      ungroupedExpanded.value = !ungroupedExpanded.value;
      return;
    }
    const group = friendGroups.value.find(g => g.id === groupId);
    if (group) {
      group.expanded = !group.expanded;
    }
  };

  const setCurrentFriend = (friend: Friend) => {
    currentChatType.value = CHAT_TYPE_PRIVATE;
    currentFriend.value = friend;
    currentGroup.value = null;
    friend.unreadCount = 0;
  };

  const setCurrentGroup = (group: Group) => {
    currentChatType.value = CHAT_TYPE_GROUP;
    currentGroup.value = group;
    currentFriend.value = null;
    group.unreadCount = 0;
  };

  const setMessages = (newMessages: Message[]) => {
    messages.value = newMessages;
  };

  const setGroups = (newGroups: Group[]) => {
    groups.value = newGroups;
  };

  const setCurrentGroupMembers = (members: GroupMember[]) => {
    currentGroupMembers.value = members;
  };

  const disconnectWebSocket = () => {
    if (ws.value) {
      ws.value.close();
      ws.value = null;
    }
  };

  return {
    friends,
    friendGroups,
    groups,
    ungroupedExpanded,
    currentChatType,
    currentFriend,
    currentGroup,
    currentGroupMembers,
    messages,
    isConnected,
    currentUserId,
    currentChatTarget,
    unreadTotal,
    connectWebSocket,
    disconnectWebSocket,
    sendPrivateMessage,
    sendGroupMessage,
    recallMessage,
    setFriends,
    setFriendGroups,
    toggleGroupExpand,
    setCurrentFriend,
    setCurrentGroup,
    setMessages,
    setGroups,
    setCurrentGroupMembers
  };
});
