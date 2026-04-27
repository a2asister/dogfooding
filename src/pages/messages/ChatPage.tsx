import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMessageStore } from '@/store';
import type { Message, MessageSession } from '@/types';

const ChatPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchMessageSessions, sendMessage } = useMessageStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [session, setSession] = useState<MessageSession | null>(null);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (id) {
      loadChat(id);
    }
  }, [id]);

  const loadChat = async (sessionId: string) => {
    setLoading(true);
    try {
      const sessions = await fetchMessageSessions();
      const foundSession = sessions.find((s) => s.id === sessionId);
      if (foundSession) {
        setSession(foundSession);
        setMessages([
          {
            id: '1',
            sessionId: sessionId,
            senderId: foundSession.participantId || 'hr_1',
            content: '您好，请问您对我们的这个职位感兴趣吗？',
            isOwn: false,
            timestamp: Date.now() - 3600000,
            read: true,
          },
          {
            id: '2',
            sessionId: sessionId,
            senderId: 'user_1',
            content: '是的，我对这个职位很感兴趣。我有5年相关经验，请问可以详细聊聊吗？',
            isOwn: true,
            timestamp: Date.now() - 3000000,
            read: true,
          },
        ]);
      }
    } catch (error) {
      console.error('Failed to load chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || !id) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sessionId: id,
      senderId: 'user_1',
      content: inputText.trim(),
      isOwn: true,
      timestamp: Date.now(),
      read: false,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText('');

    setTimeout(() => {
      const replyMessage: Message = {
        id: (Date.now() + 1).toString(),
        sessionId: id,
        senderId: session?.participantId || 'hr_1',
        content: '收到您的消息了，我稍后会详细回复您。感谢您的关注！',
        isOwn: false,
        timestamp: Date.now(),
        read: true,
      };
      setMessages((prev) => [...prev, replyMessage]);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <img
            src={session?.avatar || 'https://picsum.photos/48/48'}
            alt={session?.name || '聊天'}
            className="w-10 h-10 rounded-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://picsum.photos/48/48';
            }}
          />

          <div className="flex-1">
            <h1 className="font-semibold text-gray-900">{session?.name || '聊天'}</h1>
            <p className="text-xs text-green-500">在线</p>
          </div>

          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-4 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-gray-500">开始聊天吧</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
              >
                {!message.isOwn && (
                  <img
                    src={session?.avatar || 'https://picsum.photos/40/40'}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover mr-2 flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://picsum.photos/40/40';
                    }}
                  />
                )}

                <div className={`max-w-[70%] ${message.isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div
                    className={`px-4 py-2.5 rounded-2xl ${
                      message.isOwn
                        ? 'bg-primary-600 text-white rounded-br-md'
                        : 'bg-white text-gray-800 rounded-bl-md shadow-sm'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <span className={`text-xs text-gray-400 mt-1 ${message.isOwn ? 'text-right' : ''}`}>
                    {formatTime(message.timestamp)}
                  </span>
                </div>

                {message.isOwn && (
                  <img
                    src="https://picsum.photos/40/40"
                    alt=""
                    className="w-8 h-8 rounded-full object-cover ml-2 flex-shrink-0"
                  />
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="bg-white border-t border-gray-200 sticky bottom-0">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-end gap-3">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>

            <div className="flex-1 relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="输入消息..."
                rows={1}
                className="w-full px-4 py-2.5 bg-gray-100 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
              />
            </div>

            <button
              onClick={handleSend}
              disabled={!inputText.trim()}
              className={`p-2.5 rounded-full transition-colors ${
                inputText.trim()
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
