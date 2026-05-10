import React, { useState, useEffect } from 'react'
import { schedulerApi, workflowApi } from '../services/api'

const Schedule = () => {
  const [jobs, setJobs] = useState([])
  const [workflows, setWorkflows] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    workflowId: '',
    scheduleType: 'cron',
    cronExpression: '* * * * *',
    runAt: ''
  })

  const loadData = async () => {
    try {
      const [jobsData, workflowsData] = await Promise.all([
        schedulerApi.list(),
        workflowApi.list()
      ])
      setJobs(jobsData)
      setWorkflows(workflowsData)
    } catch (error) {
      console.error('Failed to load data:', error)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const requestData = {
        workflowId: formData.workflowId
      }

      if (formData.scheduleType === 'cron') {
        requestData.cronExpression = formData.cronExpression
      } else {
        requestData.runAt = formData.runAt
      }

      await schedulerApi.schedule(requestData)
      setShowModal(false)
      setFormData({
        workflowId: '',
        scheduleType: 'cron',
        cronExpression: '* * * * *',
        runAt: ''
      })
      loadData()
    } catch (error) {
      console.error('Failed to schedule:', error)
      alert('调度失败: ' + error.message)
    }
  }

  const handleCancelJob = async (jobId) => {
    try {
      await schedulerApi.cancel(jobId)
      loadData()
    } catch (error) {
      console.error('Failed to cancel job:', error)
    }
  }

  const getWorkflowName = (workflowId) => {
    const wf = workflows.find(w => w.id === workflowId)
    return wf?.name || workflowId
  }

  return (
    <div>
      <header className="header">
        <div className="header-title">定时任务</div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + 新建任务
        </button>
      </header>

      <div className="content-area">
        <div className="card">
          {jobs.length === 0 ? (
            <div className="empty-state">
              <h3>还没有定时任务</h3>
              <p>点击上方按钮创建第一个定时任务</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {jobs.map(job => (
                <div 
                  key={job.jobId}
                  style={{
                    padding: '16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                      {getWorkflowName(job.workflowId)}
                    </div>
                    <div style={{ fontSize: '13px', color: '#6b7280' }}>
                      {job.isOneTime ? (
                        <>一次性任务: {new Date(job.date).toLocaleString('zh-CN')}</>
                      ) : (
                        <>Cron表达式: {job.cronExpression}</>
                      )}
                    </div>
                  </div>
                  <button
                    className="btn btn-danger"
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                    onClick={() => handleCancelJob(job.jobId)}
                  >
                    取消
                  </button>
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
              <h3>创建定时任务</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>选择工作流 *</label>
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

              <div className="form-group">
                <label>调度类型</label>
                <select
                  value={formData.scheduleType}
                  onChange={(e) => setFormData({ ...formData, scheduleType: e.target.value })}
                >
                  <option value="cron">周期性执行 (Cron)</option>
                  <option value="once">一次性执行</option>
                </select>
              </div>

              {formData.scheduleType === 'cron' && (
                <div className="form-group">
                  <label>Cron 表达式</label>
                  <input
                    type="text"
                    value={formData.cronExpression}
                    onChange={(e) => setFormData({ ...formData, cronExpression: e.target.value })}
                    placeholder="例如: 0 9 * * * (每天9点执行)"
                  />
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                    格式: 秒 分 时 日 月 周
                  </div>
                </div>
              )}

              {formData.scheduleType === 'once' && (
                <div className="form-group">
                  <label>执行时间</label>
                  <input
                    type="datetime-local"
                    value={formData.runAt}
                    onChange={(e) => setFormData({ ...formData, runAt: e.target.value })}
                  />
                </div>
              )}

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  取消
                </button>
                <button type="submit" className="btn btn-primary" disabled={!formData.workflowId}>
                  创建
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Schedule