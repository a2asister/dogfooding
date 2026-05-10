import React, { useState } from 'react'
import { useWorkflowStore } from '../store/workflowStore'
import { ScriptEditor, JsonEditor, ExpressionEditor, TemplateEditor } from './CodeEditor'
import pluginManager from '../plugins/pluginManager'

const PropertyPanel = () => {
  const {
    selectedNodes,
    nodes,
    updateNodeConfig,
    updateNode,
    debugMode,
    activeDebugNode,
    setActiveDebugNode
  } = useWorkflowStore()

  const [activeTab, setActiveTab] = useState('config')

  if (selectedNodes.length === 0) {
    return (
      <div className="property-panel">
        <div className="empty-state">
          <h3>选择一个节点</h3>
          <p>点击画布上的节点来查看和编辑其属性</p>
        </div>
      </div>
    )
  }

  if (selectedNodes.length > 1) {
    return (
      <div className="property-panel">
        <h3>已选择 {selectedNodes.length} 个节点</h3>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          使用 Delete 键删除，或使用 Ctrl+D 复制
        </p>
      </div>
    )
  }

  const node = nodes.find((n) => n.id === selectedNodes[0])
  if (!node) return null

  const nodeType = node.data.nodeType || node.type
  const config = node.data.config || {}

  const updateConfig = (key, value) => {
    updateNodeConfig(node.id, { [key]: value })
  }

  const updateName = (name) => {
    updateNode(node.id, { data: { ...node.data, name } })
  }

  const handleDebugClick = () => {
    if (debugMode) {
      setActiveDebugNode(node.id)
    }
  }

  const renderConfigPanel = () => {
    switch (nodeType) {
      case 'condition':
        return <ConditionConfig config={config} onChange={updateConfig} />
      case 'loop':
        return <LoopConfig config={config} onChange={updateConfig} />
      case 'delay':
        return <DelayConfig config={config} onChange={updateConfig} />
      case 'retry':
        return <RetryConfig config={config} onChange={updateConfig} />
      case 'merge':
        return <MergeConfig config={config} onChange={updateConfig} />
      case 'action':
        return <ActionConfig config={config} onChange={updateConfig} />
      case 'subworkflow':
        return <SubworkflowConfig config={config} onChange={updateConfig} />
      case 'plugin':
        return <PluginConfig config={config} onChange={updateConfig} />
      case 'fork':
        return <ForkConfig config={config} onChange={updateConfig} />
      case 'join':
        return <JoinConfig config={config} onChange={updateConfig} />
      default:
        return <div style={{ color: '#6b7280' }}>此节点无需配置</div>
    }
  }

  return (
    <div className="property-panel">
      <h3>节点配置</h3>

      <div className="form-group">
        <label>节点名称</label>
        <input
          type="text"
          value={node.data.name}
          onChange={(e) => updateName(e.target.value)}
        />
      </div>

      <div className="tabs">
        <div
          className={`tab ${activeTab === 'config' ? 'active' : ''}`}
          onClick={() => setActiveTab('config')}
        >
          配置
        </div>
        <div
          className={`tab ${activeTab === 'advanced' ? 'active' : ''}`}
          onClick={() => setActiveTab('advanced')}
        >
          高级
        </div>
        {debugMode && (
          <div
            className={`tab ${activeTab === 'debug' ? 'active' : ''}`}
            onClick={() => setActiveTab('debug')}
          >
            调试
          </div>
        )}
      </div>

      <div style={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
        {activeTab === 'config' && renderConfigPanel()}
        {activeTab === 'advanced' && (
          <AdvancedConfig nodeId={node.id} nodeType={nodeType} config={config} onChange={updateConfig} />
        )}
        {activeTab === 'debug' && debugMode && (
          <DebugPanel
            node={node}
            isActive={activeDebugNode === node.id}
            onActivate={handleDebugClick}
          />
        )}
      </div>
    </div>
  )
}

const ConditionConfig = ({ config, onChange }) => (
  <div>
    <div className="form-group">
      <label>条件逻辑</label>
      <select
        value={config.operator || 'and'}
        onChange={(e) => onChange('operator', e.target.value)}
      >
        <option value="and">所有条件满足 (AND)</option>
        <option value="or">任一条件满足 (OR)</option>
      </select>
    </div>
    <div className="form-group">
      <label>条件表达式 (JavaScript)</label>
      <ExpressionEditor
        value={config.condition || ''}
        onChange={(v) => onChange('condition', v)}
        height={120}
      />
      <small style={{ color: '#6b7280' }}>
        示例: value {'>'} 10 {'&&'} status === 'active'
      </small>
    </div>
  </div>
)

const LoopConfig = ({ config, onChange }) => (
  <div>
    <div className="form-group">
      <label>循环类型</label>
      <select
        value={config.loopType || 'count'}
        onChange={(e) => onChange('loopType', e.target.value)}
      >
        <option value="count">固定次数</option>
        <option value="condition">条件循环</option>
        <option value="iterator">遍历数组</option>
      </select>
    </div>
    {config.loopType === 'count' && (
      <div className="form-group">
        <label>循环次数</label>
        <input
          type="number"
          min="1"
          value={config.count || 1}
          onChange={(e) => onChange('count', parseInt(e.target.value))}
        />
      </div>
    )}
    {config.loopType === 'condition' && (
      <div className="form-group">
        <label>循环条件</label>
        <ExpressionEditor
          value={config.condition || ''}
          onChange={(v) => onChange('condition', v)}
          height={100}
        />
      </div>
    )}
    {config.loopType === 'iterator' && (
      <div className="form-group">
        <label>数组变量名</label>
        <input
          type="text"
          value={config.arrayVar || 'items'}
          onChange={(e) => onChange('arrayVar', e.target.value)}
          placeholder="items"
        />
      </div>
    )}
  </div>
)

const DelayConfig = ({ config, onChange }) => (
  <div>
    <div className="form-group">
      <label>延迟类型</label>
      <select
        value={config.delayType || 'fixed'}
        onChange={(e) => onChange('delayType', e.target.value)}
      >
        <option value="fixed">固定时间</option>
        <option value="variable">动态变量</option>
      </select>
    </div>
    <div className="form-group">
      <label>延迟时间</label>
      <input
        type="number"
        min="0"
        value={config.amount || 1}
        onChange={(e) => onChange('amount', parseFloat(e.target.value))}
      />
    </div>
    <div className="form-group">
      <label>时间单位</label>
      <select
        value={config.unit || 'seconds'}
        onChange={(e) => onChange('unit', e.target.value)}
      >
        <option value="milliseconds">毫秒</option>
        <option value="seconds">秒</option>
        <option value="minutes">分钟</option>
        <option value="hours">小时</option>
      </select>
    </div>
  </div>
)

const RetryConfig = ({ config, onChange }) => (
  <div>
    <div className="form-group">
      <label>最大重试次数</label>
      <input
        type="number"
        min="1"
        value={config.maxAttempts || 3}
        onChange={(e) => onChange('maxAttempts', parseInt(e.target.value))}
      />
    </div>
    <div className="form-group">
      <label>重试间隔 (毫秒)</label>
      <input
        type="number"
        min="0"
        value={config.retryDelay || 1000}
        onChange={(e) => onChange('retryDelay', parseInt(e.target.value))}
      />
    </div>
    <div className="form-group">
      <label>
        <input
          type="checkbox"
          checked={config.exponentialBackoff !== false}
          onChange={(e) => onChange('exponentialBackoff', e.target.checked)}
          style={{ marginRight: '8px' }}
        />
        指数退避
      </label>
    </div>
  </div>
)

const MergeConfig = ({ config, onChange }) => (
  <div>
    <div className="form-group">
      <label>合并策略</label>
      <select
        value={config.strategy || 'all'}
        onChange={(e) => onChange('strategy', e.target.value)}
      >
        <option value="all">等待所有分支</option>
        <option value="first">等待第一个分支</option>
        <option value="majority">等待多数分支</option>
      </select>
    </div>
    <div className="form-group">
      <label>数据合并模式</label>
      <select
        value={config.mergeMode || 'concat'}
        onChange={(e) => onChange('mergeMode', e.target.value)}
      >
        <option value="concat">合并数组</option>
        <option value="spread">展开对象</option>
        <option value="first">使用第一个</option>
        <option value="last">使用最后一个</option>
      </select>
    </div>
  </div>
)

const ActionConfig = ({ config, onChange }) => (
  <div>
    <div className="form-group">
      <label>动作类型</label>
      <select
        value={config.actionType || 'log'}
        onChange={(e) => onChange('actionType', e.target.value)}
      >
        <option value="log">日志记录</option>
        <option value="http">HTTP 请求</option>
        <option value="script">脚本执行</option>
        <option value="transform">数据转换</option>
        <option value="emitEvent">发送事件</option>
      </select>
    </div>

    {config.actionType === 'log' && (
      <div className="form-group">
        <label>日志消息</label>
        <TemplateEditor
          value={config.message || ''}
          onChange={(v) => onChange('message', v)}
          height={80}
        />
      </div>
    )}

    {config.actionType === 'http' && (
      <div>
        <div className="form-group">
          <label>请求方法</label>
          <select
            value={config.method || 'GET'}
            onChange={(e) => onChange('method', e.target.value)}
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>
        </div>
        <div className="form-group">
          <label>URL</label>
          <input
            type="text"
            value={config.url || ''}
            onChange={(e) => onChange('url', e.target.value)}
            placeholder="https://api.example.com/endpoint"
          />
        </div>
        <div className="form-group">
          <label>请求头 (JSON)</label>
          <JsonEditor
            value={config.headers || {}}
            onChange={(v) => {
              try {
                onChange('headers', JSON.parse(v))
              } catch {}
            }}
            height={100}
          />
        </div>
        <div className="form-group">
          <label>请求体</label>
          <JsonEditor
            value={config.body || {}}
            onChange={(v) => onChange('body', v)}
            height={120}
          />
        </div>
      </div>
    )}

    {config.actionType === 'script' && (
      <div className="form-group">
        <label>脚本代码</label>
        <ScriptEditor
          value={config.script || `// context 包含工作流上下文数据\n// 返回值会合并到工作流数据中\nreturn { message: 'Hello World' };`}
          onChange={(v) => onChange('script', v)}
          height={200}
        />
        <small style={{ color: '#6b7280' }}>
          可用变量: context, console, fetch
        </small>
      </div>
    )}

    {config.actionType === 'emitEvent' && (
      <div>
        <div className="form-group">
          <label>事件名称</label>
          <input
            type="text"
            value={config.eventName || ''}
            onChange={(e) => onChange('eventName', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>事件数据 (JSON)</label>
          <JsonEditor
            value={config.eventData || {}}
            onChange={(v) => onChange('eventData', v)}
            height={100}
          />
        </div>
      </div>
    )}
  </div>
)

const SubworkflowConfig = ({ config, onChange }) => (
  <div>
    <div className="form-group">
      <label>子流程 ID</label>
      <input
        type="text"
        value={config.workflowId || ''}
        onChange={(e) => onChange('workflowId', e.target.value)}
        placeholder="选择或输入子流程 ID"
      />
    </div>
    <div className="form-group">
      <label>版本 ID (可选)</label>
      <input
        type="text"
        value={config.versionId || ''}
        onChange={(e) => onChange('versionId', e.target.value)}
        placeholder="留空使用当前激活版本"
      />
    </div>
    <div className="form-group">
      <label>
        <input
          type="checkbox"
          checked={config.passData !== false}
          onChange={(e) => onChange('passData', e.target.checked)}
          style={{ marginRight: '8px' }}
        />
        传递当前上下文数据
      </label>
    </div>
    <div className="form-group">
      <label>
        <input
          type="checkbox"
          checked={config.waitForCompletion !== false}
          onChange={(e) => onChange('waitForCompletion', e.target.checked)}
          style={{ marginRight: '8px' }}
        />
        等待子流程完成
      </label>
    </div>
  </div>
)

const PluginConfig = ({ config, onChange }) => {
  const plugins = pluginManager.getPlugins()

  return (
    <div>
      <div className="form-group">
        <label>选择插件</label>
        <select
          value={config.pluginId || ''}
          onChange={(e) => onChange('pluginId', e.target.value)}
        >
          <option value="">-- 选择插件 --</option>
          {plugins.map((plugin) => (
            <option key={plugin.id} value={plugin.id}>
              {plugin.name} (v{plugin.version})
            </option>
          ))}
        </select>
      </div>

      {config.pluginId && (
        <div className="form-group">
          <label>插件配置 (JSON)</label>
          <JsonEditor
            value={config.pluginConfig || {}}
            onChange={(v) => onChange('pluginConfig', v)}
            height={150}
          />
        </div>
      )}
    </div>
  )
}

const ForkConfig = ({ config, onChange }) => (
  <div>
    <div className="form-group">
      <label>并行分支数</label>
      <input
        type="number"
        min="2"
        value={config.branchCount || 2}
        onChange={(e) => onChange('branchCount', parseInt(e.target.value))}
      />
    </div>
    <div className="form-group">
      <label>
        <input
          type="checkbox"
          checked={config.isolateContext !== false}
          onChange={(e) => onChange('isolateContext', e.target.checked)}
          style={{ marginRight: '8px' }}
        />
        隔离分支上下文
      </label>
    </div>
  </div>
)

const JoinConfig = ({ config, onChange }) => (
  <div>
    <div className="form-group">
      <label>汇合策略</label>
      <select
        value={config.strategy || 'all'}
        onChange={(e) => onChange('strategy', e.target.value)}
      >
        <option value="all">等待所有分支完成</option>
        <option value="first">等待第一个分支完成</option>
        <option value="majority">等待多数分支完成</option>
        <option value="count">等待指定数量</option>
      </select>
    </div>
    {config.strategy === 'count' && (
      <div className="form-group">
        <label>完成分支数</label>
        <input
          type="number"
          min="1"
          value={config.requiredCount || 1}
          onChange={(e) => onChange('requiredCount', parseInt(e.target.value))}
        />
      </div>
    )}
  </div>
)

const AdvancedConfig = ({ nodeId, nodeType, config, onChange }) => (
  <div>
    <div className="form-group">
      <label>超时时间 (毫秒)</label>
      <input
        type="number"
        min="0"
        value={config.timeout || 0}
        onChange={(e) => onChange('timeout', parseInt(e.target.value))}
        placeholder="0 表示无限制"
      />
    </div>
    <div className="form-group">
      <label>错误处理策略</label>
      <select
        value={config.errorStrategy || 'fail'}
        onChange={(e) => onChange('errorStrategy', e.target.value)}
      >
        <option value="fail">失败并终止</option>
        <option value="continue">忽略并继续</option>
        <option value="default">使用默认值</option>
        <option value="custom">自定义处理</option>
      </select>
    </div>
    {config.errorStrategy === 'custom' && (
      <div className="form-group">
        <label>错误处理脚本</label>
        <ScriptEditor
          value={config.errorHandler || ''}
          onChange={(v) => onChange('errorHandler', v)}
          height={100}
        />
      </div>
    )}
    <div className="form-group">
      <label>节点 ID</label>
      <input
        type="text"
        value={nodeId}
        readOnly
        style={{ background: '#f3f4f6' }}
      />
    </div>
  </div>
)

const DebugPanel = ({ node, isActive, onActivate }) => (
  <div>
    <div className="form-group">
      <button
        className={`btn ${isActive ? 'btn-success' : 'btn-secondary'}`}
        onClick={onActivate}
        style={{ width: '100%' }}
      >
        {isActive ? '✓ 设为断点' : '设为断点'}
      </button>
    </div>
    {isActive && (
      <div>
        <h4 style={{ marginBottom: '12px', color: '#374151' }}>断点信息</h4>
        <div className="form-group">
          <label>节点类型</label>
          <input
            type="text"
            value={node.data.nodeType || node.type}
            readOnly
            style={{ background: '#f3f4f6' }}
          />
        </div>
        <div className="form-group">
          <label>当前配置</label>
          <JsonEditor
            value={node.data.config || {}}
            height={150}
            readOnly
          />
        </div>
      </div>
    )}
  </div>
)

export default PropertyPanel
