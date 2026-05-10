import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { workflowApi } from '../services/api'
import CreateWorkflowModal from '../components/CreateWorkflowModal'

const WorkflowList = () => {
  const navigate = useNavigate()
  const [workflows, setWorkflows] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const loadWorkflows = async () => {
    try {
      setLoading(true)
      const data = await workflowApi.list()
      setWorkflows(data)
    } catch (error) {
      console.error('Failed to load workflows:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWorkflows()
  }, [])

  const handleCreateWorkflow = async (data) => {
    try {
      const newWorkflow = await workflowApi.create(data)
      setShowModal(false)
      navigate(`/workflows/${newWorkflow.id}/edit`)
    } catch (error) {
      console.error('Failed to create workflow:', error)
    }
  }

  const handleDeleteWorkflow = async (id, e) => {
    e.stopPropagation()
    if (confirm('确定要删除此工作流吗？')) {
      try {
        await workflowApi.delete(id)
        loadWorkflows()
      } catch (error) {
        console.error('Failed to delete workflow:', error)
      }
    }
  }

  const getStatusClass = (status) => {
    switch (status) {
      case 'active': return 'status-active'
      case 'paused': return 'status-paused'
      default: return 'status-draft'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return '运行中'
      case 'paused': return '已暂停'
      default: return '草稿'
    }
  }

  return (
    <div>
      <header className="header">
        <div className="header-title">流程管理</div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + 新建流程
        </button>
      </header>

      <div className="content-area">
        {loading ? (
          <div className="empty-state">
            <p>加载中...</p>
          </div>
        ) : workflows.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <h3>还没有工作流</h3>
              <p>点击上方按钮创建第一个工作流</p>
            </div>
          </div>
        ) : (
          <div className="workflow-list">
            {workflows.map(workflow => (
              <div
                key={workflow.id}
                className="workflow-card"
                onClick={() => navigate(`/workflows/${workflow.id}`)}
              >
                <h3>{workflow.name}</h3>
                <p>{workflow.description || '暂无描述'}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className={`workflow-status ${getStatusClass(workflow.status)}`}>
                    {getStatusText(workflow.status)}
                  </span>
                  <button
                    className="btn btn-danger"
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                    onClick={(e) => handleDeleteWorkflow(workflow.id, e)}
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <CreateWorkflowModal
          onClose={() => setShowModal(false)}
          onSubmit={handleCreateWorkflow}
        />
      )}
    </div>
  )
}

export default WorkflowList