import { createSignal, onMount } from 'solid-js'
import { api } from '../api'

const sourceNames = {
  dingtalk: '钉钉',
  wechat_work: '企业微信',
  email: '邮件',
  ticket: '工单',
  customer_service: '客服消息'
}

const priorityNames = {
  urgent: '紧急',
  high: '高',
  medium: '中',
  low: '低'
}

const availableTags = ['审批', '待处理', '客户', '紧急', '订单', '已确认', '技术问题', '高优先级', '会议通知', '系统通知', '日常提醒', '投诉', '待跟进']

function Rules() {
  const [rules, setRules] = createSignal([])
  const [loading, setLoading] = createSignal(false)
  const [showModal, setShowModal] = createSignal(false)
  const [editingRule, setEditingRule] = createSignal(null)
  const [formData, setFormData] = createSignal({
    name: '',
    description: '',
    conditions: {
      keywords: [],
      sources: []
    },
    actions: {
      setPriority: '',
      addTags: [],
      notify: false
    },
    enabled: true,
    order: 0
  })
  
  const [keywordInput, setKeywordInput] = createSignal('')
  const [tagInput, setTagInput] = createSignal('')

  async function loadRules() {
    setLoading(true)
    try {
      const data = await api.getRules()
      setRules(data)
    } catch (error) {
      console.error('加载规则失败:', error)
    } finally {
      setLoading(false)
    }
  }

  onMount(() => {
    loadRules()
  })

  function openCreateModal() {
    setEditingRule(null)
    setFormData({
      name: '',
      description: '',
      conditions: {
        keywords: [],
        sources: []
      },
      actions: {
        setPriority: '',
        addTags: [],
        notify: false
      },
      enabled: true,
      order: rules().length + 1
    })
    setShowModal(true)
  }

  function openEditModal(rule) {
    setEditingRule(rule)
    setFormData({
      ...rule,
      conditions: {
        keywords: rule.conditions.keywords || [],
        sources: rule.conditions.sources || []
      },
      actions: {
        setPriority: rule.actions.setPriority || '',
        addTags: rule.actions.addTags || [],
        notify: rule.actions.notify || false
      }
    })
    setShowModal(true)
  }

  async function handleSubmit() {
    try {
      if (editingRule()) {
        await api.updateRule(editingRule().id, formData())
      } else {
        await api.createRule(formData())
      }
      setShowModal(false)
      loadRules()
    } catch (error) {
      console.error('保存规则失败:', error)
      alert('保存失败：' + error.message)
    }
  }

  async function handleDelete(rule) {
    if (confirm(`确定要删除规则"${rule.name}"吗？`)) {
      try {
        await api.deleteRule(rule.id)
        loadRules()
      } catch (error) {
        console.error('删除规则失败:', error)
        alert('删除失败：' + error.message)
      }
    }
  }

  async function toggleEnabled(rule) {
    try {
      await api.updateRule(rule.id, {
        ...rule,
        enabled: !rule.enabled
      })
      loadRules()
    } catch (error) {
      console.error('更新规则失败:', error)
    }
  }

  function addKeyword() {
    const keyword = keywordInput().trim()
    if (keyword && !formData().conditions.keywords.includes(keyword)) {
      setFormData(prev => ({
        ...prev,
        conditions: {
          ...prev.conditions,
          keywords: [...prev.conditions.keywords, keyword]
        }
      }))
      setKeywordInput('')
    }
  }

  function removeKeyword(keyword) {
    setFormData(prev => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        keywords: prev.conditions.keywords.filter(k => k !== keyword)
      }
    }))
  }

  function addTag() {
    const tag = tagInput().trim()
    if (tag && !formData().actions.addTags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        actions: {
          ...prev.actions,
          addTags: [...prev.actions.addTags, tag]
        }
      }))
      setTagInput('')
    }
  }

  function removeTag(tag) {
    setFormData(prev => ({
      ...prev,
      actions: {
        ...prev.actions,
        addTags: prev.actions.addTags.filter(t => t !== tag)
      }
    }))
  }

  function toggleSource(source) {
    const sources = formData().conditions.sources
    if (sources.includes(source)) {
      setFormData(prev => ({
        ...prev,
        conditions: {
          ...prev.conditions,
          sources: prev.conditions.sources.filter(s => s !== source)
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        conditions: {
          ...prev.conditions,
          sources: [...prev.conditions.sources, source]
        }
      }))
    }
  }

  return (
    <div>
      {/* 页面头部 */}
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">消息流转规则</h1>
          <p class="text-gray-500 mt-1">配置消息自动处理规则，实现智能分流和分级</p>
        </div>
        <button
          class="btn btn-primary flex items-center gap-2"
          onClick={openCreateModal}
        >
          <span class="i-mdi:plus"></span>
          <span>新建规则</span>
        </button>
      </div>

      {/* 规则列表 */}
      {loading() ? (
        <div class="flex items-center justify-center py-12">
          <div class="text-gray-500">加载中...</div>
        </div>
      ) : rules().length === 0 ? (
        <div class="card text-center py-12">
          <span class="i-mdi:rule text-6xl text-gray-300 mb-4"></span>
          <h3 class="text-lg font-medium text-gray-900 mb-2">暂无规则</h3>
          <p class="text-gray-500 mb-4">创建规则来自动处理消息</p>
          <button
            class="btn btn-primary"
            onClick={openCreateModal}
          >
            创建第一个规则
          </button>
        </div>
      ) : (
        <div class="grid gap-4">
          {rules()
            .sort((a, b) => a.order - b.order)
            .map(rule => (
              <div class={`card ${!rule.enabled ? 'opacity-60' : ''}`}>
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    {/* 规则名称和状态 */}
                    <div class="flex items-center gap-3 mb-2">
                      <div class={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        rule.enabled ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        <span class={`i-mdi:rule text-xl ${
                          rule.enabled ? 'text-blue-600' : 'text-gray-500'
                        }`}></span>
                      </div>
                      <div>
                        <div class="flex items-center gap-2">
                          <h3 class="font-medium text-gray-900">{rule.name}</h3>
                          <span class={`badge ${rule.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {rule.enabled ? '已启用' : '已禁用'}
                          </span>
                        </div>
                        <p class="text-sm text-gray-500">{rule.description}</p>
                      </div>
                    </div>

                    {/* 条件和动作 */}
                    <div class="grid grid-cols-2 gap-6 mt-4">
                      {/* 条件 */}
                      <div>
                        <h4 class="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <span class="i-mdi:filter text-gray-500"></span>
                          触发条件
                        </h4>
                        <div class="space-y-2 text-sm">
                          {rule.conditions.sources?.length > 0 && (
                            <div class="flex items-start gap-2">
                              <span class="text-gray-500">消息源：</span>
                              <div class="flex flex-wrap gap-1">
                                {rule.conditions.sources.map(source => (
                                  <span class="badge bg-gray-100 text-gray-600">
                                    {sourceNames[source]}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {rule.conditions.keywords?.length > 0 && (
                            <div class="flex items-start gap-2">
                              <span class="text-gray-500">关键词：</span>
                              <div class="flex flex-wrap gap-1">
                                {rule.conditions.keywords.map(keyword => (
                                  <span class="badge bg-yellow-100 text-yellow-700">
                                    {keyword}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {!rule.conditions.sources?.length && !rule.conditions.keywords?.length && (
                            <span class="text-gray-400">无限制（匹配所有消息）</span>
                          )}
                        </div>
                      </div>

                      {/* 动作 */}
                      <div>
                        <h4 class="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <span class="i-mdi:play text-gray-500"></span>
                          执行动作
                        </h4>
                        <div class="space-y-2 text-sm">
                          {rule.actions.setPriority && (
                            <div class="flex items-center gap-2">
                              <span class="text-gray-500">设置优先级：</span>
                              <span class={`badge ${
                                rule.actions.setPriority === 'urgent' ? 'bg-red-100 text-red-700' :
                                rule.actions.setPriority === 'high' ? 'bg-orange-100 text-orange-700' :
                                rule.actions.setPriority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {priorityNames[rule.actions.setPriority]}
                              </span>
                            </div>
                          )}
                          {rule.actions.addTags?.length > 0 && (
                            <div class="flex items-start gap-2">
                              <span class="text-gray-500">添加标签：</span>
                              <div class="flex flex-wrap gap-1">
                                {rule.actions.addTags.map(tag => (
                                  <span class="badge bg-blue-100 text-blue-700">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {rule.actions.notify && (
                            <div class="flex items-center gap-2">
                              <span class="text-gray-500">发送通知：</span>
                              <span class="badge bg-purple-100 text-purple-700">是</span>
                            </div>
                          )}
                          {!rule.actions.setPriority && !rule.actions.addTags?.length && !rule.actions.notify && (
                            <span class="text-gray-400">无动作</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div class="flex flex-col gap-2 ml-4">
                    <button
                      class={`p-2 rounded-lg transition-colors ${
                        rule.enabled
                          ? 'bg-green-100 text-green-600 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                      onClick={() => toggleEnabled(rule)}
                      title={rule.enabled ? '禁用规则' : '启用规则'}
                    >
                      <span class={`i-mdi:${rule.enabled ? 'power-on' : 'power-off'}`}></span>
                    </button>
                    <button
                      class="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                      onClick={() => openEditModal(rule)}
                      title="编辑规则"
                    >
                      <span class="i-mdi:pencil"></span>
                    </button>
                    <button
                      class="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                      onClick={() => handleDelete(rule)}
                      title="删除规则"
                    >
                      <span class="i-mdi:delete"></span>
                    </button>
                  </div>
                </div>

                {/* 规则顺序 */}
                <div class="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                  <span>执行顺序：第 {rule.order} 位</span>
                  <span>最后更新：{new Date(rule.updatedAt).toLocaleString('zh-CN')}</span>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* 创建/编辑规则弹窗 */}
      {showModal() && (
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            {/* 弹窗头部 */}
            <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 class="text-lg font-semibold text-gray-900">
                {editingRule() ? '编辑规则' : '新建规则'}
              </h2>
              <button
                class="p-2 rounded-lg hover:bg-gray-100"
                onClick={() => setShowModal(false)}
              >
                <span class="i-mdi:close text-xl text-gray-500"></span>
              </button>
            </div>

            {/* 弹窗内容 */}
            <div class="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* 基本信息 */}
              <div class="space-y-4 mb-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">规则名称 *</label>
                  <input
                    type="text"
                    class="input"
                    placeholder="例如：紧急消息自动标记"
                    value={formData().name}
                    onInput={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">规则描述</label>
                  <textarea
                    class="input h-20 resize-none"
                    placeholder="描述这个规则的作用..."
                    value={formData().description}
                    onInput={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div class="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="rule-enabled"
                    checked={formData().enabled}
                    onChange={(e) => setFormData(prev => ({ ...prev, enabled: e.target.checked }))}
                    class="w-4 h-4 text-blue-600 rounded"
                  />
                  <label for="rule-enabled" class="text-sm text-gray-700">启用此规则</label>
                </div>
              </div>

              {/* 触发条件 */}
              <div class="mb-6">
                <h3 class="text-base font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <span class="i-mdi:filter text-blue-500"></span>
                  触发条件
                </h3>
                <div class="space-y-4 bg-gray-50 rounded-lg p-4">
                  {/* 消息源选择 */}
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">适用消息源（不选则匹配所有）</label>
                    <div class="flex flex-wrap gap-2">
                      {Object.entries(sourceNames).map(([key, name]) => (
                        <button
                          type="button"
                          class={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                            formData().conditions.sources.includes(key)
                              ? 'bg-blue-500 text-white'
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                          onClick={() => toggleSource(key)}
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 关键词 */}
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">匹配关键词（不填则不限制）</label>
                    <div class="flex gap-2 mb-2">
                      <input
                        type="text"
                        class="input flex-1"
                        placeholder="输入关键词后按回车添加"
                        value={keywordInput()}
                        onInput={(e) => setKeywordInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addKeyword()
                          }
                        }}
                      />
                      <button
                        type="button"
                        class="btn btn-secondary"
                        onClick={addKeyword}
                      >
                        添加
                      </button>
                    </div>
                    <div class="flex flex-wrap gap-2">
                      {formData().conditions.keywords.map(keyword => (
                        <span class="badge bg-yellow-100 text-yellow-700 flex items-center gap-1">
                          {keyword}
                          <button
                            type="button"
                            onClick={() => removeKeyword(keyword)}
                          >
                            <span class="i-mdi:close"></span>
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 执行动作 */}
              <div>
                <h3 class="text-base font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <span class="i-mdi:play text-green-500"></span>
                  执行动作
                </h3>
                <div class="space-y-4 bg-gray-50 rounded-lg p-4">
                  {/* 设置优先级 */}
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">设置优先级（可选）</label>
                    <select
                      class="input"
                      value={formData().actions.setPriority}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        actions: { ...prev.actions, setPriority: e.target.value }
                      }))}
                    >
                      <option value="">不修改</option>
                      {Object.entries(priorityNames).map(([key, name]) => (
                        <option value={key}>{name}</option>
                      ))}
                    </select>
                  </div>

                  {/* 添加标签 */}
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">添加标签</label>
                    <div class="flex gap-2 mb-2">
                      <select
                        class="input flex-1"
                        value={tagInput()}
                        onChange={(e) => setTagInput(e.target.value)}
                      >
                        <option value="">选择标签...</option>
                        {availableTags
                          .filter(tag => !formData().actions.addTags.includes(tag))
                          .map(tag => (
                            <option value={tag}>{tag}</option>
                          ))}
                      </select>
                      <button
                        type="button"
                        class="btn btn-secondary"
                        onClick={addTag}
                      >
                        添加
                      </button>
                    </div>
                    <div class="flex flex-wrap gap-2">
                      {formData().actions.addTags.map(tag => (
                        <span class="badge bg-blue-100 text-blue-700 flex items-center gap-1">
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                          >
                            <span class="i-mdi:close"></span>
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 发送通知 */}
                  <div class="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="action-notify"
                      checked={formData().actions.notify}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        actions: { ...prev.actions, notify: e.target.checked }
                      }))}
                      class="w-4 h-4 text-blue-600 rounded"
                    />
                    <label for="action-notify" class="text-sm text-gray-700">发送通知提醒</label>
                  </div>
                </div>
              </div>
            </div>

            {/* 弹窗底部 */}
            <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                class="btn btn-secondary"
                onClick={() => setShowModal(false)}
              >
                取消
              </button>
              <button
                class="btn btn-primary"
                onClick={handleSubmit}
                disabled={!formData().name}
              >
                {editingRule() ? '保存' : '创建'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Rules
