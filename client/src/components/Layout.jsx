import { createSignal, onMount } from 'solid-js'
import { api } from '../api'

function Layout(props) {
  const [statistics, setStatistics] = createSignal(null)
  const [sidebarOpen, setSidebarOpen] = createSignal(true)
  const [currentPage, setCurrentPage] = createSignal('messages')
  
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
  
  onMount(async () => {
    try {
      const stats = await api.getStatistics()
      setStatistics(stats)
    } catch (error) {
      console.error('加载统计数据失败:', error)
    }
  })
  
  const navItems = [
    { id: 'messages', label: '消息列表', icon: 'i-mdi:inbox' },
    { id: 'rules', label: '流转规则', icon: 'i-mdi:rule' },
    { id: 'settings', label: '系统设置', icon: 'i-mdi:cog' }
  ]
  
  const pageLabels = {
    messages: '消息列表',
    rules: '流转规则',
    settings: '系统设置'
  }
  
  return (
    <div class="flex h-screen bg-gray-50">
      {/* 侧边栏 */}
      <aside class={`${sidebarOpen() ? 'w-64' : 'w-20'} bg-white shadow-lg transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div class="p-4 border-b border-gray-200">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span class="i-mdi:message-badge text-white text-xl"></span>
            </div>
            {sidebarOpen() && (
              <div>
                <h1 class="font-bold text-gray-800">消息聚合中台</h1>
                <p class="text-xs text-gray-500">Message Aggregation</p>
              </div>
            )}
          </div>
        </div>
        
        {/* 导航菜单 */}
        <nav class="flex-1 p-4 space-y-2">
          {navItems.map(item => (
            <button
              onClick={() => setCurrentPage(item.id)}
              class={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                currentPage() === item.id
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span class={`${item.icon} text-xl`}></span>
              {sidebarOpen() && <span>{item.label}</span>}
              {sidebarOpen() && item.id === 'messages' && statistics() && (
                <span class="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {statistics().unread}
                </span>
              )}
            </button>
          ))}
        </nav>
        
        {/* 消息源统计 */}
        {sidebarOpen() && statistics() && (
          <div class="p-4 border-t border-gray-200">
            <h3 class="text-sm font-medium text-gray-500 mb-3">消息来源</h3>
            <div class="space-y-2">
              {Object.entries(statistics().bySource).map(([source, count]) => (
                <div class="flex items-center justify-between text-sm">
                  <div class="flex items-center gap-2">
                    <span class={`${sourceIcons[source]} text-gray-500`}></span>
                    <span class="text-gray-600">{sourceNames[source]}</span>
                  </div>
                  <span class="text-gray-500">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* 底部统计 */}
        {sidebarOpen() && statistics() && (
          <div class="p-4 border-t border-gray-200 bg-gray-50">
            <div class="grid grid-cols-2 gap-3 text-center">
              <div class="bg-white p-3 rounded-lg shadow-sm">
                <div class="text-2xl font-bold text-blue-600">{statistics().total}</div>
                <div class="text-xs text-gray-500">总消息</div>
              </div>
              <div class="bg-white p-3 rounded-lg shadow-sm">
                <div class="text-2xl font-bold text-red-600">{statistics().urgent}</div>
                <div class="text-xs text-gray-500">紧急消息</div>
              </div>
            </div>
          </div>
        )}
      </aside>
      
      {/* 主内容区 */}
      <main class="flex-1 flex flex-col overflow-hidden">
        {/* 顶部栏 */}
        <header class="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div class="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen())}
              class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span class="i-mdi:menu text-xl text-gray-600"></span>
            </button>
            <h2 class="text-xl font-semibold text-gray-800">
              {pageLabels[currentPage()] || '消息聚合中台'}
            </h2>
          </div>
          
          <div class="flex items-center gap-3">
            <button
              onClick={async () => {
                try {
                  await api.simulateMessage()
                  const stats = await api.getStatistics()
                  setStatistics(stats)
                  window.dispatchEvent(new CustomEvent('message-added'))
                } catch (error) {
                  console.error('模拟消息失败:', error)
                }
              }}
              class="btn btn-primary flex items-center gap-2"
            >
              <span class="i-mdi:plus"></span>
              <span>模拟新消息</span>
            </button>
            
            <div class="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-medium">
              管
            </div>
          </div>
        </header>
        
        {/* 内容区 */}
        <div class="flex-1 overflow-auto p-6">
          {props.children && currentPage() === 'messages' && props.children}
          {currentPage() === 'rules' && (
            <div class="text-center py-12">
              <span class="i-mdi:rule text-6xl text-gray-300 mb-4 block"></span>
              <h3 class="text-lg font-medium text-gray-900 mb-2">流转规则页面</h3>
              <p class="text-gray-500">请在导航菜单中切换查看消息列表</p>
            </div>
          )}
          {currentPage() === 'settings' && (
            <div class="text-center py-12">
              <span class="i-mdi:cog text-6xl text-gray-300 mb-4 block"></span>
              <h3 class="text-lg font-medium text-gray-900 mb-2">系统设置页面</h3>
              <p class="text-gray-500">请在导航菜单中切换查看消息列表</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Layout
