import { create } from 'zustand';
import type { Message, ChatSession, MessageType } from '@/types';
import { mockMessages, mockChatSessions } from '@/data/mockData';

interface MessageState {
  messages: Message[];
  chatSessions: ChatSession[];
  loading: boolean;

  fetchMessages: (type?: MessageType) => Promise<Message[]>;
  fetchChatSessions: () => Promise<ChatSession[]>;
  sendMessage: (sessionId: string, content: string) => void;
  markAsRead: (messageId: string) => void;
  markAllAsRead: (sessionId?: string) => void;
  togglePin: (sessionId: string) => void;
  toggleMute: (sessionId: string) => void;
  blockHR: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
  deleteMessage: (messageId: string) => void;
  getUnreadCount: () => number;
}

export const useMessageStore = create<MessageState>((set, get) => ({
  messages: [...mockMessages],
  chatSessions: [...mockChatSessions],
  loading: false,

  fetchMessages: async (type) => {
    set({ loading: true });
    await new Promise((resolve) => setTimeout(resolve, 200));

    let msgs = get().messages;
    if (type) {
      msgs = msgs.filter((msg) => msg.type === type);
    }

    set({ loading: false });
    return msgs;
  },

  fetchChatSessions: async () => {
    set({ loading: true });
    await new Promise((resolve) => setTimeout(resolve, 200));
    set({ loading: false });
    return get().chatSessions;
  },

  sendMessage: (sessionId, content) => {
    const session = get().chatSessions.find((s) => s.id === sessionId);
    if (!session) return;

    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      type: 'hr',
      from: 'user_001',
      fromAvatar: '',
      fromName: '我',
      to: session.hrId,
      content,
      isRead: true,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      messages: [...state.messages, newMessage],
      chatSessions: state.chatSessions.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              lastMessage: content,
              lastMessageTime: new Date().toISOString(),
            }
          : s
      ),
    }));
  },

  markAsRead: (messageId) => {
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId ? { ...m, isRead: true } : m
      ),
    }));
  },

  markAllAsRead: (sessionId) => {
    if (sessionId) {
      set((state) => ({
        chatSessions: state.chatSessions.map((s) =>
          s.id === sessionId ? { ...s, unreadCount: 0 } : s
        ),
      }));
    } else {
      set((state) => ({
        messages: state.messages.map((m) => ({ ...m, isRead: true })),
        chatSessions: state.chatSessions.map((s) => ({ ...s, unreadCount: 0 })),
      }));
    }
  },

  togglePin: (sessionId) => {
    set((state) => ({
      chatSessions: state.chatSessions.map((s) =>
        s.id === sessionId ? { ...s, isPinned: !s.isPinned } : s
      ),
    }));
  },

  toggleMute: (sessionId) => {
    set((state) => ({
      chatSessions: state.chatSessions.map((s) =>
        s.id === sessionId ? { ...s, isMuted: !s.isMuted } : s
      ),
    }));
  },

  blockHR: (sessionId) => {
    set((state) => ({
      chatSessions: state.chatSessions.map((s) =>
        s.id === sessionId ? { ...s, isBlocked: true } : s
      ),
    }));
  },

  deleteSession: (sessionId) => {
    set((state) => ({
      chatSessions: state.chatSessions.filter((s) => s.id !== sessionId),
    }));
  },

  deleteMessage: (messageId) => {
    set((state) => ({
      messages: state.messages.filter((m) => m.id !== messageId),
    }));
  },

  getUnreadCount: () => {
    const state = get();
    return (
      state.messages.filter((m) => !m.isRead).length +
      state.chatSessions.reduce((acc, s) => acc + s.unreadCount, 0)
    );
  },
}));
