import React, { useEffect, useState, useRef } from 'react';
import {
  Send,
  Check,
  CheckCheck,
  MessageSquare,
  Loader2,
  X
} from 'lucide-react';
import {
  getChatSessions,
  getChatMessages,
  addChatMessage,
  markMessagesAsRead,
  getQuickReplies
} from '../../data/services';
import { QUICK_REPLY_CATEGORIES } from '../../types';
import type { ChatSession, ChatMessage, QuickReply } from '../../types';

const AdminMessages: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [selectedQuickReplyCategory, setSelectedQuickReplyCategory] = useState<string>('all');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [sessionsData, quickRepliesData] = await Promise.all([
          getChatSessions(),
          getQuickReplies()
        ]);
        setSessions(sessionsData);
        setQuickReplies(quickRepliesData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectSession = async (session: ChatSession) => {
    setSelectedSession(session);
    setShowQuickReplies(false);
    try {
      const messagesData = await getChatMessages(session.id);
      setMessages(messagesData);
      if (session.unreadCount > 0) {
        await markMessagesAsRead(session.id);
        setSessions(sessions.map(s => 
          s.id === session.id ? { ...s, unreadCount: 0 } : s
        ));
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedSession || !messageInput.trim()) return;
    
    setSending(true);
    try {
      await addChatMessage({
        sessionId: selectedSession.id,
        sender: 'designer',
        content: messageInput.trim(),
        messageType: 'text'
      });
      
      const messagesData = await getChatMessages(selectedSession.id);
      setMessages(messagesData);
      setMessageInput('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleQuickReply = (reply: QuickReply) => {
    setMessageInput(reply.content);
    setShowQuickReplies(false);
  };

  const filteredQuickReplies = quickReplies.filter(reply => 
    reply.isActive && (selectedQuickReplyCategory === 'all' || reply.category === selectedQuickReplyCategory)
  );

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today.getTime() - 86400000);
    
    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);
    
    const messageDate = new Date(date);
    messageDate.setHours(0, 0, 0, 0);
    
    if (messageDate.getTime() === today.getTime()) {
      return '今天';
    } else if (messageDate.getTime() === yesterday.getTime()) {
      return '昨天';
    } else {
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">消息中心</h2>
          <p className="text-gray-500 mt-1">与客户实时在线沟通，管理所有咨询消息</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {sessions.reduce((sum, s) => sum + s.unreadCount, 0)} 条未读消息
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">会话列表</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {sessions.length > 0 ? (
              sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => handleSelectSession(session)}
                  className={`w-full p-4 flex items-start space-x-3 hover:bg-gray-50 transition-colors ${
                    selectedSession?.id === session.id ? 'bg-purple-50' : ''
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {session.participantName.charAt(0)}
                      </span>
                    </div>
                    {session.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {session.unreadCount}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900 truncate">
                        {session.participantName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDate(session.lastMessageTime)}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-gray-500 truncate max-w-[150px]">
                        {session.lastMessage}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-8 text-center">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">暂无会话</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm flex flex-col">
          {selectedSession ? (
            <>
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {selectedSession.participantName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{selectedSession.participantName}</p>
                    <p className="text-xs text-gray-500">{selectedSession.participantEmail}</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.length > 0 ? (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'designer' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] ${message.sender === 'designer' ? 'order-2' : ''}`}>
                        <div
                          className={`px-4 py-2.5 rounded-2xl ${
                            message.sender === 'designer'
                              ? 'bg-purple-600 text-white rounded-br-sm'
                              : 'bg-white text-gray-900 rounded-bl-sm shadow-sm'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                        </div>
                        <div
                          className={`flex items-center space-x-1 mt-1 text-xs text-gray-400 ${
                            message.sender === 'designer' ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <span>{formatTime(message.createdAt)}</span>
                          {message.sender === 'designer' && (
                            <span>
                              {message.isRead ? (
                                <CheckCheck className="w-3 h-3 text-blue-500" />
                              ) : (
                                <Check className="w-3 h-3" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-400">开始对话吧</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {showQuickReplies && (
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-gray-700">快捷回复</p>
                    <button
                      onClick={() => setShowQuickReplies(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <button
                      onClick={() => setSelectedQuickReplyCategory('all')}
                      className={`px-3 py-1 rounded-full text-sm ${
                        selectedQuickReplyCategory === 'all'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      全部
                    </button>
                    {QUICK_REPLY_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedQuickReplyCategory(cat)}
                        className={`px-3 py-1 rounded-full text-sm ${
                          selectedQuickReplyCategory === cat
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {filteredQuickReplies.map((reply) => (
                      <button
                        key={reply.id}
                        onClick={() => handleQuickReply(reply)}
                        className="text-left p-3 bg-white rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                      >
                        <p className="font-medium text-sm text-gray-900">{reply.title}</p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{reply.content}</p>
                      </button>
                    ))}
                    {filteredQuickReplies.length === 0 && (
                      <p className="text-sm text-gray-400 col-span-2">暂无快捷回复</p>
                    )}
                  </div>
                </div>
              )}

              <div className="p-4 border-t border-gray-200">
                <div className="flex items-end space-x-3">
                  <button
                    onClick={() => setShowQuickReplies(!showQuickReplies)}
                    className={`p-2 rounded-lg transition-colors ${
                      showQuickReplies ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:bg-gray-100'
                    }`}
                    title="快捷回复"
                  >
                    <MessageSquare className="w-5 h-5" />
                  </button>
                  <div className="flex-1 relative">
                    <textarea
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="输入消息... (Enter发送，Shift+Enter换行)"
                      rows={1}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    />
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={sending || !messageInput.trim()}
                    className="p-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">选择一个会话开始聊天</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminMessages;
