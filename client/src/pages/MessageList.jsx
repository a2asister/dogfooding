import { createSignal, createEffect, onMount } from 'solid-js'
import { api } from '../api'

const priorityColors = {
  urgent: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500', label: '紧急' },
  high: { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500', label: '高' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500', label: '中' },
  low: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500', label: '低' }
}

const sourceIcons = {
  dingtalk: 'i-mdi:message-text',
  wechat_work: 'i-mdi:wechat',
  email: 'i-mdi:email',
  ticket: 'i-mdi:ticket-confirmation',
  customer_service: 'i-mdi:headset'
}

const sourceNames = {
  dingtalk: '钉钉',
  wechat_work: '企业微信',
  email: '邮件',
  ticket: '工单',
  customer_service: '客服消息'
}

const availableTags = ['审批', '待处理', '客户', '紧急', '订单', '已确认', '技术问题', '高优先级', '会议通知', '系统通知', '日常提醒', '投诉', '待跟进']

function MessageList() {
  const [messages, setMessages] = createSignal([])
  const [loading, setLoading] = createSignal(false)
  const [selectedMessage, setSelectedMessage] = createSignal(null)
  const [filters, setFilters] = createSignal({
    source: '',
    tag: '',
    priority: '',
    status: ''
  })
  const [pagination, setPagination] = createSignal({
    page: 1,
    pageSize: 20,
    total: 0
  })

  function formatTime(dateString) {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    if (days < 7) return `${days}天前`
    
    return date.toLocaleDateString('zh-CN')
  }

  async function loadMessages() {
    setLoading(true)
    try {
      const params = {
        ...filters(),
        page: pagination().page,
        pageSize: pagination().pageSize
      }
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key]
      })
      
      const result = await api.getMessages(params)
      console.log('加载消息成功:', result)
      setMessages(result.items || [])
      setPagination(prev => ({
        ...prev,
        total: result.total || 0
      }))
    } catch (error) {
      console.error('加载消息失败:', error)
    } finally {
      setLoading(false)
    }
  }

  onMount(() => {
    loadMessages()
    window.addEventListener('message-added', loadMessages)
    return () => {
      window.removeEventListener('message-added', loadMessages)
    }
  })

  createEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }))
    loadMessages()
  })

  async function handleMarkAsRead(message) {
    try {
      await api.markAsRead(message.id)
      setMessages(prev => prev.map(m => 
        m.id === message.id ? { ...m, status: 'read' } : m
      ))
      if (selectedMessage()?.id === message.id) {
        setSelectedMessage(prev => prev ? { ...prev, status: 'read' } : null)
      }
    } catch (error) {
      console.error('标记已读失败:', error)
    }
  }

  async function handleUpdateTags(messageId, tags) {
    try {
      await api.updateTags(messageId, tags)
      setMessages(prev => prev.map(m => 
        m.id === messageId ? { ...m, tags } : m
      ))
      if (selectedMessage()?.id === messageId) {
        setSelectedMessage(prev => prev ? { ...prev, tags } : null)
      }
    } catch (error) {
      console.error('更新标签失败:', error)
    }
  }

  async function handleUpdatePriority(messageId, priority) {
    try {
      await api.updatePriority(messageId, priority)
      setMessages(prev => prev.map(m => 
        m.id === messageId ? { ...m, priority } : m
      ))
      if (selectedMessage()?.id === messageId) {
        setSelectedMessage(prev => prev ? { ...prev, priority } : null)
      }
    } catch (error) {
      console.error('更新优先级失败:', error)
    }
  }

  function handleMessageClick(message) {
    console.log('点击消息:', message.id, message.title)
    setSelectedMessage({ ...message })
    if (message.status === 'unread') {
      handleMarkAsRead(message)
    }
  }

  return (
    <div class="flex h-full gap-6">
      <div class="flex-1 flex flex-col min-w-0">
        <div class="bg-white rounded-xl shadow-md p-6 mb-4 flex-shrink-0">
          <div class="flex flex-wrap gap-4 items-end">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">消息来源</label>
              <select
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters().source}
                onChange={(e) => setFilters(prev => ({ ...prev, source: e.target.value }))}
              >
                <option value="">全部来源</option>
                {Object.entries(sourceNames).map(([key, name]) => (
                  <option value={key}>{name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">标签</label>
              <select
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters().tag}
                onChange={(e) => setFilters(prev => ({ ...prev, tag: e.target.value }))}
              >
                <option value="">全部标签</option>
                {availableTags.map(tag => (
                  <option value={tag}>{tag}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">优先级</label>
              <select
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters().priority}
                onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
              >
                <option value="">全部优先级</option>
                {Object.entries(priorityColors).map(([key, value]) => (
                  <option value={key}>{value.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">状态</label>
              <select
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters().status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="">全部状态</option>
                <option value="unread">未读</option>
                <option value="read">已读</option>
              </select>
            </div>
            
            <button
              class="px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300 transition-all"
              onClick={() => {
                setFilters({ source: '', tag: '', priority: '', status: '' })
              }}
            >
              重置筛选
            </button>
          </div>
        </div>
        
        <div class="flex-1 overflow-auto min-h-0">
          {loading() ? (
            <div class="flex items-center justify-center h-full">
              <div class="text-gray-500">加载中...</div>
            </div>
          ) : messages().length === 0 ? (
            <div class="flex flex-col items-center justify-center h-full text-gray-500">
              <span class="i-mdi:inbox text-6xl mb-4 opacity-30"></span>
              <p>暂无消息</p>
            </div>
          ) : (
            <div class="space-y-3">
              {messages().map(message => {
                const priority = priorityColors[message.priority]
                const isSelected = selectedMessage()?.id === message.id
                
                return (
                  <div
                    class={`bg-white rounded-xl shadow-md p-6 cursor-pointer transition-all hover:shadow-lg ${
                      isSelected ? 'ring-2 ring-blue-500 ring-inset' : ''
                    } ${message.status === 'unread' ? 'border-l-4 border-l-blue-500' : ''}`}
                    onClick={() => handleMessageClick(message)}
                  >
                    <div class="flex items-start justify-between mb-2">
                      <div class="flex items-center gap-3">
                        <div class={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          message.source === 'dingtalk' ? 'bg-blue-100' :
                          message.source === 'wechat_work' ? 'bg-green-100' :
                          message.source === 'email' ? 'bg-yellow-100' :
                          message.source === 'ticket' ? 'bg-purple-100' :
                          'bg-pink-100'
                        }`}>
                          <span class={`${sourceIcons[message.source]} text-xl ${
                            message.source === 'dingtalk' ? 'text-blue-600' :
                            message.source === 'wechat_work' ? 'text-green-600' :
                            message.source === 'email' ? 'text-yellow-600' :
                            message.source === 'ticket' ? 'text-purple-600' :
                            'text-pink-600'
                          }`}></span>
                        </div>
                        
                        <div class="min-w-0">
                          <div class="flex items-center gap-2">
                            <h3 class={`font-medium truncate ${message.status === 'unread' ? 'text-gray-900' : 'text-gray-700'}`}>
                              {message.title}
                            </h3>
                            {message.status === 'unread' && (
                              <span class="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                            )}
                          </div>
                          <div class="flex items-center gap-2 text-sm text-gray-500">
                            <span class="truncate">{message.sender}</span>
                            <span>·</span>
                            <span class="flex-shrink-0">{formatTime(message.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <span class={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 flex items-center gap-1 ${priority.bg} ${priority.text}`}>
                        <span class={`w-2 h-2 ${priority.dot} rounded-full`}></span>
                        {priority.label}
                      </span>
                    </div>
                    
                    <p class="text-sm text-gray-600 mb-3 line-clamp-2">
                      {message.summary || message.content.substring(0, 100)}...
                    </p>
                    
                    {message.tags && message.tags.length > 0 && (
                      <div class="flex flex-wrap gap-2">
                        {message.tags.map(tag => (
                          <span class="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
          
          {pagination().total > 0 && (
            <div class="mt-4 flex items-center justify-between">
              <div class="text-sm text-gray-500">
                共 {pagination().total} 条消息
              </div>
              <div class="flex gap-2">
                <button
                  class="px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={pagination().page <= 1}
                  onClick={() => {
                    setPagination(prev => ({ ...prev, page: prev.page - 1 }))
                    loadMessages()
                  }}
                >
                  上一页
                </button>
                <button
                  class="px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={pagination().page * pagination().pageSize >= pagination().total}
                  onClick={() => {
                    setPagination(prev => ({ ...prev, page: prev.page + 1 }))
                    loadMessages()
                  }}
                >
                  下一页
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {selectedMessage() && (
        <div class="w-96 flex flex-col flex-shrink-0 border-l border-gray-200 pl-6">
          <div class="bg-white rounded-xl shadow-md p-6 flex-1 overflow-auto">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-bold text-gray-900 truncate pr-4">
                {selectedMessage().title}
              </h2>
              <button
                class="p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
                onClick={() => setSelectedMessage(null)}
              >
                <span class="i-mdi:close text-xl text-gray-500"></span>
              </button>
            </div>
            
            <div class="space-y-3 mb-6 pb-6 border-b border-gray-200">
              <div class="flex items-center gap-2">
                <span class="i-mdi:source-start text-gray-500"></span>
                <span class="text-sm text-gray-600">来源：</span>
                <span class="text-sm font-medium text-gray-900">
                  {selectedMessage().sourceName}
                </span>
              </div>
              
              <div class="flex items-center gap-2">
                <span class="i-mdi:account text-gray-500"></span>
                <span class="text-sm text-gray-600">发送者：</span>
                <span class="text-sm font-medium text-gray-900">
                  {selectedMessage().sender}
                </span>
              </div>
              
              <div class="flex items-center gap-2">
                <span class="i-mdi:clock text-gray-500"></span>
                <span class="text-sm text-gray-600">时间：</span>
                <span class="text-sm font-medium text-gray-900">
                  {new Date(selectedMessage().createdAt).toLocaleString('zh-CN')}
                </span>
              </div>
              
              <div class="flex items-center gap-4">
                <div class="flex items-center gap-2">
                  <span class="i-mdi:flag text-gray-500"></span>
                  <span class="text-sm text-gray-600">优先级：</span>
                </div>
                <select
                  class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={selectedMessage().priority}
                  onChange={(e) => handleUpdatePriority(selectedMessage().id, e.target.value)}
                >
                  {Object.entries(priorityColors).map(([key, value]) => (
                    <option value={key}>{value.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div class="mb-6">
              <h3 class="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <span class="i-mdi:lightbulb text-yellow-500"></span>
                智能摘要
              </h3>
              <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p class="text-sm text-yellow-800">
                  {selectedMessage().summary}
                </p>
              </div>
            </div>
            
            <div class="mb-6">
              <h3 class="text-sm font-medium text-gray-700 mb-2">消息内容</h3>
              <div class="bg-gray-50 rounded-lg p-4">
                <p class="text-sm text-gray-700 whitespace-pre-wrap">
                  {selectedMessage().content}
                </p>
              </div>
            </div>
            
            <div>
              <h3 class="text-sm font-medium text-gray-700 mb-2">标签</h3>
              <div class="flex flex-wrap gap-2 mb-3">
                {selectedMessage().tags && selectedMessage().tags.length > 0 ? (
                  selectedMessage().tags.map(tag => (
                    <span class="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 flex items-center gap-1">
                      {tag}
                      <button
                        class="hover:text-blue-900"
                        onClick={() => {
                          const newTags = selectedMessage().tags.filter(t => t !== tag)
                          handleUpdateTags(selectedMessage().id, newTags)
                        }}
                      >
                        <span class="i-mdi:close"></span>
                      </button>
                    </span>
                  ))
                ) : (
                  <span class="text-sm text-gray-400">暂无标签</span>
                )}
              </div>
              
              <div class="flex gap-2">
                <select
                  class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  id="new-tag-select-detail"
                  onChange={(e) => {
                    const tag = e.target.value
                    if (tag && !selectedMessage().tags.includes(tag)) {
                      const newTags = [...selectedMessage().tags, tag]
                      handleUpdateTags(selectedMessage().id, newTags)
                    }
                    e.target.value = ''
                  }}
                >
                  <option value="">添加标签...</option>
                  {availableTags
                    .filter(tag => !selectedMessage().tags.includes(tag))
                    .map(tag => (
                      <option value={tag}>{tag}</option>
                    ))}
                </select>
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-xl shadow-md p-6 mt-4 flex gap-3">
            {selectedMessage().status === 'unread' && (
              <button
                class="flex-1 px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300 transition-all flex items-center justify-center gap-2"
                onClick={() => handleMarkAsRead(selectedMessage())}
              >
                <span class="i-mdi:email-open"></span>
                标记已读
              </button>
            )}
            <button
              class={`flex-1 px-4 py-2 rounded-lg font-medium bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700 transition-all flex items-center justify-center gap-2 ${
                selectedMessage().status === 'unread' ? '' : 'w-full'
              }`}
              onClick={() => {
                alert('回复功能开发中...')
              }}
            >
              <span class="i-mdi:reply"></span>
              回复
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default MessageList
