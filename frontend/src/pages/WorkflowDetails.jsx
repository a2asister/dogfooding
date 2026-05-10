import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { workflowApi, versionApi, executionApi } from '../services/api'

const WorkflowDetails = () => {
  const { id: workflowId } = useParams()
  const navigate = useNavigate()
  const [workflow, setWorkflow] = useState(null)
  const [versions, setVersions] = useState([])
  const [executions, setExecutions] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')

  const loadData = async () => {
    try {
      setLoading(true)
      const [wf, vers, exes] = await Promise.all([
        workflowApi.get(workflowId),
        versionApi.list(workflowId),
        executionApi.list(workflowId)
      ])
      
      setWorkflow(wf)
      setVersions(vers)
      setExecutions(exes)
    } catch (error) {
      console.error('Failed to load workflow details:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [workflowId])

  const handleRunWorkflow = async () => {
    try {
      const activeVersion = versions.find(v => v.isActive) || versions[versions.length - 1]
      if (!activeVersion) {
        alert('请先创建并保存一个版本')
        return
      }
      
      const execution = await workflowApi.run(workflowId, activeVersion.id)
      alert(`执行已启动! 执行ID: ${execution.id}`)
      loadData()
    } catch (error) {
      console.error('Failed to run workflow:', error)
      alert('执行失败: ' + error.message)
    }
  }

  const handleActivateVersion = async (versionId) => {
    try {
      await versionApi.activate(workflowId, versionId)
      loadData()
    } catch (error) {
      console.error('Failed to activate version:', error)
    }
  }

  const handleCancelExecution = async (executionId) => {
    try {
      await executionApi.cancel(executionId)
      loadData()
    } catch (error) {
      console.error('Failed to cancel execution:', error)
    }
  }

  const handleStartEdit = () => {
    setEditName(workflow?.name || '')
    setEditDescription(workflow?.description || '')
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
  }

  const handleSaveEdit = async () => {
    try {
      await workflowApi.update(workflowId, {
        name: editName,
        description: editDescription
      })
      setIsEditing(false)
      loadData()
    } catch (error) {
      console.error('Failed to update workflow:', error)
      alert('保存失败: ' + error.message)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'running':
        return <span className="badge badge-info">运行中</span>
      case 'completed':
        return <span className="badge badge-success">已完成</span>
      case 'failed':
        return <span className="badge badge-danger">失败</span>
      case 'cancelled':
        return <span className="badge badge-warning">已取消</span>
      case 'timeout':
        return <span className="badge badge-danger">超时</span>
      default:
        return <span className="badge badge-warning">{status}</span>
    }
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return '-'
    return new Date(timestamp).toLocaleString('zh-CN')
  }

  if (loading) {
    return (
      <div>
        <header className="header">
          <div className="header-title">加载中...</div>
        </header>
        <div className="content-area">
          <div className="empty-state"><p>加载中...</p></div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => navigate('/workflows')}
          >
            ← 返回
          </button>
          <div className="header-title">{workflow?.name || '工作流详情'}</div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => navigate(`/workflows/${workflowId}/edit`)}
          >
            ✏️ 编辑
          </button>
          <button className="btn btn-success" onClick={handleRunWorkflow}>
            ▶ 运行
          </button>
        </div>
      </header>

      <div className="content-area">
        <div className="card">
          <div className="tabs">
            <div 
              className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              概览
            </div>
            <div 
              className={`tab ${activeTab === 'versions' ? 'active' : ''}`}
              onClick={() => setActiveTab('versions')}
            >
              版本 ({versions.length})
            </div>
            <div 
              className={`tab ${activeTab === 'executions' ? 'active' : ''}`}
              onClick={() => setActiveTab('executions')}
            >
              执行记录 ({executions.length})
            </div>
          </div>

          {activeTab === 'overview' && (
            <div>
              {isEditing ? (
                <>
                  <div className="form-group">
                    <label>名称 *</label>
                    <input 
                      type="text" 
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="请输入工作流名称"
                    />
                  </div>
                  <div className="form-group">
                    <label>描述</label>
                    <textarea 
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="请输入工作流描述"
                      rows={3}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                    <button className="btn btn-primary" onClick={handleSaveEdit} disabled={!editName.trim()}>
                      ✓ 保存
                    </button>
                    <button className="btn btn-secondary" onClick={handleCancelEdit}>
                      取消
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label>名称</label>
                    <input type="text" value={workflow?.name || ''} readOnly />
                  </div>
                  <div className="form-group">
                    <label>描述</label>
                    <textarea value={workflow?.description || ''} readOnly rows={3} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label>创建时间</label>
                      <input type="text" value={formatDate(workflow?.createdAt)} readOnly />
                    </div>
                    <div className="form-group">
                      <label>最后更新</label>
                      <input type="text" value={formatDate(workflow?.updatedAt)} readOnly />
                    </div>
                  </div>
                  <button 
                    className="btn btn-secondary" 
                    style={{ marginTop: '16px' }}
                    onClick={handleStartEdit}
                  >
                    ✏️ 编辑基本信息
                  </button>
                </>
              )}
            </div>
          )}

          {activeTab === 'versions' && (
            <div>
              {versions.length === 0 ? (
                <div className="empty-state">
                  <h3>还没有版本</h3>
                  <p>点击编辑按钮创建第一个版本</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[...versions].reverse().map(version => (
                    <div 
                      key={version.id}
                      style={{
                        padding: '16px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        background: version.isActive ? '#f0fdf4' : 'white'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <strong>{version.name}</strong>
                            {version.isActive && <span className="badge badge-success">当前版本</span>}
                          </div>
                          <div style={{ fontSize: '13px', color: '#6b7280' }}>
                            {formatDate(version.createdAt)}
                          </div>
                          {version.canaryRatio < 100 && (
                            <div style={{ fontSize: '12px', color: '#f59e0b', marginTop: '4px' }}>
                              灰度发布: {version.canaryRatio}%
                            </div>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                            onClick={() => navigate(`/workflows/${workflowId}/edit?version=${version.id}`)}
                          >
                            查看
                          </button>
                          {!version.isActive && (
                            <button
                              className="btn btn-primary"
                              style={{ padding: '6px 12px', fontSize: '12px' }}
                              onClick={() => handleActivateVersion(version.id)}
                            >
                              激活
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'executions' && (
            <div>
              {executions.length === 0 ? (
                <div className="empty-state">
                  <h3>还没有执行记录</h3>
                  <p>点击运行按钮开始执行</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {executions.map(execution => (
                    <div 
                      key={execution.id}
                      style={{
                        padding: '12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <strong>{execution.id.slice(0, 8)}...</strong>
                          {getStatusBadge(execution.status)}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          触发方式: {execution.triggerType} | {formatDate(execution.startedAt)}
                          {execution.completedAt && ` → ${formatDate(execution.completedAt)}`}
                        </div>
                      </div>
                      {execution.status === 'running' && (
                        <button
                          className="btn btn-danger"
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                          onClick={() => handleCancelExecution(execution.id)}
                        >
                          取消
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default WorkflowDetails