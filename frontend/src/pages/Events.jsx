import React, { useState, useEffect } from 'react'
import { eventApi, workflowApi } from '../services/api'

const Events = () => {
  const [listeners, setListeners] = useState([])
  const [workflows, setWorkflows] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [triggerModal, setTriggerModal] = useState(false)
  const [formData, setFormData] = useState({
    eventName: '',
    workflowId: ''
  })
  const [triggerData, setTriggerData] = useState({
    eventName: '',
    data: '{}'
  })

  const loadData = async () => {
    try {
      const [listenersData, workflowsData] = await Promise.all([
        eventApi.list(),
        workflowApi.list()
      ])
      setListeners(listenersData)
      setWorkflows(workflowsData)
    } catch (error) {
      console.error('Failed to load data:', error)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleRegister = async (e) => {
    e.preventDefault()
    
    try {
      await eventApi.register(formData.eventName, formData.workflowId)
      setShowModal(false)
      setFormData({ eventName: '', workflowId: '' })
      loadData()
    } catch (error) {
      console.error('Failed to register:', error)
      alert('注册失败: ' + error.message)
    }
  }

  const handleTrigger = async (e) => {
    e.preventDefault()
    
    try {
      let data = {}
      try {
        data = JSON.parse(triggerData.data)
      } catch {
        alert('请输入有效的 JSON 格式数据')
        return
      }

      const result = await eventApi.trigger(triggerData.eventName, data)
      alert(`事件触发成功! 触发了 ${result.triggeredCount} 个工作流`)
      setTriggerModal(false)
      setTriggerData({ eventName: '', data: '{}' })
    } catch (error) {
      console.error('Failed to trigger:', error)
      alert('触发失败: ' + error.message)
    }
  }

  const handleRemoveListener = async (listenerId) => {
    try {
      await eventApi.remove(listenerId)
      loadData()
    } catch (error) {
      console.error('Failed to remove listener:', error)
    }
  }

  const getWorkflowName = (workflowId) => {
    const wf = workflows.find(w => w.id === workflowId)
    return wf?.name || workflowId
  }

  const allEvents = [...new Set(listeners.flatMap(l => l.listeners.map(li => li.eventName)))]

  return (
    <div>
      <header className="header">
        <div className="header-title">事件管理</div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={() => setTriggerModal(true)}>
            📡 触发事件
          </button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + 注册事件
          </button>
        </div>
      </header>

      <div className="content-area">
        <div className="card">
          <h3 style={{ marginBottom: '16px' }}>事件监听器</h3>
          {listeners.length === 0 ? (
            <div className="empty-state">
              <h3>还没有事件监听器</h3>
              <p>点击上方按钮注册第一个事件监听器</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {listeners.map(({ eventName, listeners: eventListeners }) => (
                <div 
                  key={eventName}
                  style={{
                    padding: '16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '12px'
                  }}>
                    <div>
                      <strong style={{ fontSize: '15px' }}>{eventName}</strong>
                      <span style={{ 
                        marginLeft: '8px', 
                        fontSize: '12px', 
                        color: '#6b7280' 
                      }}>
                        {eventListeners.length} 个监听器
                      </span>
                    </div>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                      onClick={() => {
                        setTriggerData({ ...triggerData, eventName })
                        setTriggerModal(true)
                      }}
                    >
                      触发
                    </button>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {eventListeners.map(listener => (
                      <div 
                        key={listener.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '8px 12px',
                          background: '#f9fafb',
                          borderRadius: '6px'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: '500' }}>
                            {getWorkflowName(listener.workflowId)}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            注册时间: {new Date(listener.createdAt).toLocaleString('zh-CN')}
                          </div>
                        </div>
                        <button
                          className="btn btn-danger"
                          style={{ padding: '4px 8px', fontSize: '11px' }}
                          onClick={() => handleRemoveListener(listener.id)}
                        >
                          移除
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>注册事件监听器</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label>事件名称 *</label>
                <input
                  type="text"
                  value={formData.eventName}
                  onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                  placeholder="例如: user.created, order.shipped"
                  required
                />
              </div>

              <div className="form-group">
                <label>触发工作流 *</label>
                <select
                  value={formData.workflowId}
                  onChange={(e) => setFormData({ ...formData, workflowId: e.target.value })}
                  required
                >
                  <option value="">请选择工作流</option>
                  {workflows.map(wf => (
                    <option key={wf.id} value={wf.id}>{wf.name}</option>
                  ))}
                </select>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  取消
                </button>
                <button type="submit" className="btn btn-primary" disabled={!formData.eventName || !formData.workflowId}>
                  注册
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {triggerModal && (
        <div className="modal-overlay" onClick={() => setTriggerModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>触发事件</h3>
              <button className="modal-close" onClick={() => setTriggerModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleTrigger}>
              <div className="form-group">
                <label>事件名称 *</label>
                <input
                  type="text"
                  value={triggerData.eventName}
                  onChange={(e) => setTriggerData({ ...triggerData, eventName: e.target.value })}
                  placeholder="输入事件名称"
                  list="eventNames"
                  required
                />
                <datalist id="eventNames">
                  {allEvents.map(name => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
              </div>

              <div className="form-group">
                <label>事件数据 (JSON)</label>
                <textarea
                  value={triggerData.data}
                  onChange={(e) => setTriggerData({ ...triggerData, data: e.target.value })}
                  placeholder='{"key": "value"}'
                  rows={5}
                  style={{ fontFamily: 'monospace' }}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setTriggerModal(false)}>
                  取消
                </button>
                <button type="submit" className="btn btn-primary" disabled={!triggerData.eventName}>
                  触发
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Events