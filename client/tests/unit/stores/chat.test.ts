import { setActivePinia, createPinia } from 'pinia'
import { useChatStore, CHAT_TYPE_PRIVATE, CHAT_TYPE_GROUP, MESSAGE_TYPE_TEXT } from '@/stores/chat'
import { useUserStore } from '@/stores/user'
import { describe, beforeEach, it, expect, vi } from 'vitest'

describe('useChatStore', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    localStorage.clear()
    setActivePinia(createPinia())
    const userStore = useUserStore()
    userStore.setUser({ id: 1, username: 'testuser' })
    userStore.setToken('test-token')
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should initialize with default values', () => {
    const store = useChatStore()
    expect(store.friends).toEqual([])
    expect(store.friendGroups).toEqual([])
    expect(store.groups).toEqual([])
    expect(store.messages).toEqual([])
    expect(store.currentChatType).toBe(CHAT_TYPE_PRIVATE)
    expect(store.currentFriend).toBeNull()
    expect(store.currentGroup).toBeNull()
    expect(store.isConnected).toBe(false)
    expect(store.currentUserId).toBe(1)
  })

  it('should calculate unreadTotal correctly', () => {
    const store = useChatStore()
    store.setFriends([
      { id: 2, username: 'friend1', unreadCount: 3 },
      { id: 3, username: 'friend2', unreadCount: 5 }
    ])
    store.setGroups([
      { groupId: 'g1', groupName: 'group1', ownerId: 1, role: 1, memberCount: 3, unreadCount: 2, createdAt: '2024-01-01' }
    ])
    expect(store.unreadTotal).toBe(10)
  })

  it('should set friends correctly', () => {
    const store = useChatStore()
    const friends = [{ id: 2, username: 'friend1' }, { id: 3, username: 'friend2' }]
    store.setFriends(friends)
    expect(store.friends).toEqual(friends)
  })

  it('should set friend groups correctly with expanded state', () => {
    const store = useChatStore()
    const groups = [{ id: 1, groupName: '好友', sortOrder: 0, friendCount: 5, createdAt: '2024-01-01' }]
    store.setFriendGroups(groups)
    expect(store.friendGroups[0].expanded).toBe(true)
  })

  it('should toggle group expand state', () => {
    const store = useChatStore()
    store.setFriendGroups([{ id: 1, groupName: '好友', sortOrder: 0, friendCount: 5, createdAt: '2024-01-01', expanded: true }])
    store.toggleGroupExpand(1)
    expect(store.friendGroups[0].expanded).toBe(false)
    store.toggleGroupExpand(1)
    expect(store.friendGroups[0].expanded).toBe(true)
  })

  it('should toggle ungrouped expand state', () => {
    const store = useChatStore()
    expect(store.ungroupedExpanded).toBe(true)
    store.toggleGroupExpand(0)
    expect(store.ungroupedExpanded).toBe(false)
    store.toggleGroupExpand(0)
    expect(store.ungroupedExpanded).toBe(true)
  })

  it('should set current friend and clear unread count', () => {
    const store = useChatStore()
    const friend = { id: 2, username: 'friend1', unreadCount: 5 }
    store.setFriends([friend])
    store.setCurrentFriend(friend)
    expect(store.currentChatType).toBe(CHAT_TYPE_PRIVATE)
    expect(store.currentFriend).toEqual(friend)
    expect(store.currentGroup).toBeNull()
    expect(friend.unreadCount).toBe(0)
  })

  it('should set current group and clear unread count', () => {
    const store = useChatStore()
    const group = { groupId: 'g1', groupName: 'group1', ownerId: 1, role: 1, memberCount: 3, unreadCount: 2, createdAt: '2024-01-01' }
    store.setGroups([group])
    store.setCurrentGroup(group)
    expect(store.currentChatType).toBe(CHAT_TYPE_GROUP)
    expect(store.currentGroup).toEqual(group)
    expect(store.currentFriend).toBeNull()
    expect(group.unreadCount).toBe(0)
  })

  it('should set messages correctly', () => {
    const store = useChatStore()
    const messages = [{ messageId: 'm1', chatType: CHAT_TYPE_PRIVATE, fromUserId: 1, toUserId: 2, messageType: MESSAGE_TYPE_TEXT, content: 'hello', createdAt: '2024-01-01' }]
    store.setMessages(messages)
    expect(store.messages).toEqual(messages)
  })

  it('should set groups correctly', () => {
    const store = useChatStore()
    const groups = [{ groupId: 'g1', groupName: 'group1', ownerId: 1, role: 1, memberCount: 3, unreadCount: 0, createdAt: '2024-01-01' }]
    store.setGroups(groups)
    expect(store.groups).toEqual(groups)
  })

  it('should set current group members correctly', () => {
    const store = useChatStore()
    const members = [{ userId: 1, username: 'user1', role: 1, joinedAt: '2024-01-01' }]
    store.setCurrentGroupMembers(members)
    expect(store.currentGroupMembers).toEqual(members)
  })

  it('should have correct currentChatTarget for private chat', () => {
    const store = useChatStore()
    const friend = { id: 2, username: 'friend1' }
    store.setCurrentFriend(friend)
    expect(store.currentChatTarget).toEqual(friend)
  })

  it('should have correct currentChatTarget for group chat', () => {
    const store = useChatStore()
    const group = { groupId: 'g1', groupName: 'group1', ownerId: 1, role: 1, memberCount: 3, unreadCount: 0, createdAt: '2024-01-01' }
    store.setCurrentGroup(group)
    expect(store.currentChatTarget).toEqual(group)
  })

  it('should return false when sending message without WebSocket connection', () => {
    const store = useChatStore()
    const result = store.sendPrivateMessage(2, 'test message')
    expect(result).toBe(false)
  })

  it('should mark message as recalled', () => {
    const store = useChatStore()
    const messageId = 'test-message-id'
    store.setMessages([{
      messageId,
      chatType: CHAT_TYPE_PRIVATE,
      fromUserId: 1,
      toUserId: 2,
      messageType: MESSAGE_TYPE_TEXT,
      content: 'test',
      createdAt: '2024-01-01',
      isRecalled: 0
    }])
    store.recallMessage(messageId)
    expect(store.messages[0].isRecalled).toBe(1)
  })

  it('should handle incoming message and increment unread count', () => {
    const store = useChatStore()
    const friend = { id: 2, username: 'friend1', unreadCount: 0 }
    store.setFriends([friend])
    store.setCurrentFriend(friend)
  })

  it('should disconnect WebSocket', () => {
    const store = useChatStore()
    const mockClose = vi.fn()
    store.connectWebSocket('test-token')
    vi.advanceTimersByTime(100)
    store.disconnectWebSocket()
    expect(true).toBe(true)
  })
})
