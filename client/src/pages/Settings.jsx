import { createSignal, onMount } from 'solid-js'
import { api } from '../api'

const sourceNames = {
  dingtalk: '钉钉',
  wechat_work: '企业微信',
  email: '邮件',
  ticket: '工单',
  customer_service: '客服消息'
}

const sourceIcons = {
  dingtalk: 'i-mdi:message-text',
  wechat_work: 'i-mdi:wechat',
  email: 'i-mdi:email',
  ticket: 'i-mdi:ticket-confirmation',
  customer_service: 'i-mdi:headset'
}

function Settings() {
  const [statistics, setStatistics] = createSignal(null)
  const [sourceSettings, setSourceSettings] = createSignal({
    dingtalk: { enabled: true, autoSync: true, syncInterval: 5 },
    wechat_work: { enabled: true, autoSync: true, syncInterval: 5 },
    email: { enabled: true, autoSync: true, syncInterval: 10 },
    ticket: { enabled: true, autoSync: true, syncInterval: 3 },
    customer_service: { enabled: true, autoSync: true, syncInterval: 2 }
  })

  const [notificationSettings, setNotificationSettings] = createSignal({
    sound: true,
    desktop: true,
    urgentOnly: false,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    }
  })

  onMount(async () => {
    try {
      const stats = await api.getStatistics()
      setStatistics(stats)
    } catch (error) {
      console.error('加载统计数据失败:', error)
    }
  })

  function toggleSource(source, field) {
    setSourceSettings(prev => ({
      ...prev,
      [source]: {
        ...prev[source],
        [field]: !prev[source][field]
      }
    }))
  }

  function toggleNotification(field) {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setNotificationSettings(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: !prev[parent][child]
        }
      }))
    } else {
      setNotificationSettings(prev => ({
        ...prev,
        [field]: !prev[field]
      }))
    }
  }

  function saveSettings() {
    alert('设置已保存！')
  }

  return (
    <div class="max-w-4xl mx-auto space-y-6">
      {/* 系统状态 */}
      <div class="card">
        <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span class="i-mdi:monitor-dashboard text-blue-500"></span>
          系统状态
        </h2>
        
        {statistics() && (
          <div class="grid grid-cols-4 gap-4">
            <div class="bg-blue-50 rounded-lg p-4 text-center">
              <div class="text-3xl font-bold text-blue-600">{statistics().total}</div>
              <div class="text-sm text-blue-600">总消息数</div>
            </div>
            <div class="bg-red-50 rounded-lg p-4 text-center">
              <div class="text-3xl font-bold text-red-600">{statistics().unread}</div>
              <div class="text-sm text-red-600">未读消息</div>
            </div>
            <div class="bg-orange-50 rounded-lg p-4 text-center">
              <div class="text-3xl font-bold text-orange-600">{statistics().urgent}</div>
              <div class="text-sm text-orange-600">紧急消息</div>
            </div>
            <div class="bg-green-50 rounded-lg p-4 text-center">
              <div class="text-3xl font-bold text-green-600">5</div>
              <div class="text-sm text-green-600">已连接源</div>
            </div>
          </div>
        )}
      </div>

      {/* 消息源配置 */}
      <div class="card">
        <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span class="i-mdi:source-start text-green-500"></span>
          消息源配置
        </h2>
        
        <div class="space-y-4">
          {Object.entries(sourceSettings()).map(([source, settings]) => (
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center gap-4">
                <div class={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  settings.enabled ? 'bg-blue-100' : 'bg-gray-200'
                }`}>
                  <span class={`${sourceIcons[source]} text-2xl ${
                    settings.enabled ? 'text-blue-600' : 'text-gray-400'
                  }`}></span>
                </div>
                <div>
                  <div class="font-medium text-gray-900">{sourceNames[source]}</div>
                  <div class="text-sm text-gray-500">
                    {settings.autoSync 
                      ? `自动同步，每 ${settings.syncInterval} 分钟` 
                      : '手动同步'}
                  </div>
                </div>
              </div>
              
              <div class="flex items-center gap-6">
                {/* 自动同步开关 */}
                <label class="flex items-center gap-2 cursor-pointer">
                  <span class="text-sm text-gray-600">自动同步</span>
                  <button
                    class={`relative w-11 h-6 rounded-full transition-colors ${
                      settings.autoSync ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                    onClick={() => toggleSource(source, 'autoSync')}
                    disabled={!settings.enabled}
                  >
                    <span
                      class={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        settings.autoSync ? 'left-6' : 'left-1'
                      }`}
                    ></span>
                  </button>
                </label>
                
                {/* 启用/禁用开关 */}
                <label class="flex items-center gap-2 cursor-pointer">
                  <span class="text-sm text-gray-600">{settings.enabled ? '已启用' : '已禁用'}</span>
                  <button
                    class={`relative w-11 h-6 rounded-full transition-colors ${
                      settings.enabled ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                    onClick={() => toggleSource(source, 'enabled')}
                  >
                    <span
                      class={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        settings.enabled ? 'left-6' : 'left-1'
                      }`}
                    ></span>
                  </button>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 通知设置 */}
      <div class="card">
        <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span class="i-mdi:bell-ring text-purple-500"></span>
          通知设置
        </h2>
        
        <div class="space-y-4">
          <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div class="font-medium text-gray-900">声音提醒</div>
              <div class="text-sm text-gray-500">收到新消息时播放提示音</div>
            </div>
            <button
              class={`relative w-11 h-6 rounded-full transition-colors ${
                notificationSettings().sound ? 'bg-blue-500' : 'bg-gray-300'
              }`}
              onClick={() => toggleNotification('sound')}
            >
              <span
                class={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  notificationSettings().sound ? 'left-6' : 'left-1'
                }`}
              ></span>
            </button>
          </div>

          <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div class="font-medium text-gray-900">桌面通知</div>
              <div class="text-sm text-gray-500">收到新消息时显示桌面弹窗</div>
            </div>
            <button
              class={`relative w-11 h-6 rounded-full transition-colors ${
                notificationSettings().desktop ? 'bg-blue-500' : 'bg-gray-300'
              }`}
              onClick={() => toggleNotification('desktop')}
            >
              <span
                class={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  notificationSettings().desktop ? 'left-6' : 'left-1'
                }`}
              ></span>
            </button>
          </div>

          <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div class="font-medium text-gray-900">仅紧急消息提醒</div>
              <div class="text-sm text-gray-500">只对紧急和高优先级消息发送通知</div>
            </div>
            <button
              class={`relative w-11 h-6 rounded-full transition-colors ${
                notificationSettings().urgentOnly ? 'bg-blue-500' : 'bg-gray-300'
              }`}
              onClick={() => toggleNotification('urgentOnly')}
            >
              <span
                class={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  notificationSettings().urgentOnly ? 'left-6' : 'left-1'
                }`}
              ></span>
            </button>
          </div>

          {/* 免打扰设置 */}
          <div class="p-4 bg-gray-50 rounded-lg">
            <div class="flex items-center justify-between mb-4">
              <div>
                <div class="font-medium text-gray-900">免打扰时段</div>
                <div class="text-sm text-gray-500">在指定时段内不发送通知</div>
              </div>
              <button
                class={`relative w-11 h-6 rounded-full transition-colors ${
                  notificationSettings().quietHours.enabled ? 'bg-blue-500' : 'bg-gray-300'
                }`}
                onClick={() => toggleNotification('quietHours.enabled')}
              >
                <span
                  class={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    notificationSettings().quietHours.enabled ? 'left-6' : 'left-1'
                  }`}
                ></span>
              </button>
            </div>
            
            {notificationSettings().quietHours.enabled && (
              <div class="flex items-center gap-4">
                <div class="flex-1">
                  <label class="block text-sm text-gray-600 mb-1">开始时间</label>
                  <input
                    type="time"
                    class="input"
                    value={notificationSettings().quietHours.start}
                    onInput={(e) => setNotificationSettings(prev => ({
                      ...prev,
                      quietHours: { ...prev.quietHours, start: e.target.value }
                    }))}
                  />
                </div>
                <div class="text-gray-400">至</div>
                <div class="flex-1">
                  <label class="block text-sm text-gray-600 mb-1">结束时间</label>
                  <input
                    type="time"
                    class="input"
                    value={notificationSettings().quietHours.end}
                    onInput={(e) => setNotificationSettings(prev => ({
                      ...prev,
                      quietHours: { ...prev.quietHours, end: e.target.value }
                    }))}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 保存按钮 */}
      <div class="flex justify-end gap-3">
        <button class="btn btn-secondary">
          恢复默认
        </button>
        <button class="btn btn-primary" onClick={saveSettings}>
          保存设置
        </button>
      </div>

      {/* 关于信息 */}
      <div class="card">
        <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span class="i-mdi:information text-gray-500"></span>
          关于
        </h2>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div class="text-gray-500">版本</div>
            <div class="font-medium text-gray-900">1.0.0</div>
          </div>
          <div>
            <div class="text-gray-500">技术栈</div>
            <div class="font-medium text-gray-900">SolidJS + Koa + UnoCSS</div>
          </div>
          <div>
            <div class="text-gray-500">数据存储</div>
            <div class="font-medium text-gray-900">本地 JSON 文件</div>
          </div>
          <div>
            <div class="text-gray-500">最后更新</div>
            <div class="font-medium text-gray-900">{new Date().toLocaleDateString('zh-CN')}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
