import React, { useState } from 'react'

const CreateWorkflowModal = ({ onClose, onSubmit }) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('general')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit({ name: name.trim(), description: description.trim(), category })
  }

  const categories = [
    { value: 'general', label: '通用' },
    { value: 'office', label: '办公自动化' },
    { value: 'operations', label: '运营自动化' },
    { value: 'devops', label: '研发自动化' }
  ]

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>创建新工作流</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>工作流名称 *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="请输入工作流名称"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="请输入工作流描述"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>分类</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              取消
            </button>
            <button type="submit" className="btn btn-primary" disabled={!name.trim()}>
              创建
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateWorkflowModal