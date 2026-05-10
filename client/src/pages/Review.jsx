import { createSignal, onMount } from 'solid-js'
import { api } from '../services/api.js'

export default function Review() {
  const [contents, setContents] = createSignal([])
  const [selectedContent, setSelectedContent] = createSignal(null)
  const [filter, setFilter] = createSignal('reviewing')
  const [loading, setLoading] = createSignal(true)

  const loadContents = async () => {
    setLoading(true)
    try {
      const result = await api.getContents({ status: filter() })
      if (result.success) {
        setContents(result.data)
      }
    } finally {
      setLoading(false)
    }
  }

  onMount(() => {
    loadContents()
  })

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter)
    loadContents()
  }

  const handleReview = async (contentId, action, reason = '') => {
    try {
      const result = await api.reviewContent(contentId, action, reason)
      if (result.success) {
        setSelectedContent(null)
        loadContents()
      }
    } catch (error) {
      console.error('审核操作失败:', error)
    }
  }

  const getStatusLabel = (status) => {
    const labels = {
      reviewing: '待审核',
      published: '已通过',
      rejected: '已拒绝'
    }
    return labels[status] || status
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('zh-CN')
  }

  return (
    <div>
      <div class="page-header">
        <h2>内容审核</h2>
        <p>审核待发布内容，控制内容质量</p>
      </div>

      <div class="tabs mb-6">
        <button
          class={`tab-item ${filter() === 'reviewing' ? 'active' : ''}`}
          onClick={() => handleFilterChange('reviewing')}
        >
          待审核
        </button>
        <button
          class={`tab-item ${filter() === 'published' ? 'active' : ''}`}
          onClick={() => handleFilterChange('published')}
        >
          已通过
        </button>
        <button
          class={`tab-item ${filter() === 'rejected' ? 'active' : ''}`}
          onClick={() => handleFilterChange('rejected')}
        >
          已拒绝
        </button>
      </div>

      <div class="grid-2">
        <div class="card">
          <div class="card-header">
            <h3>内容列表</h3>
          </div>
          <div class="card-body" style={{ padding: 0 }}>
            {loading() ? (
              <div class="empty-state">
                <div class="empty-state-icon">⏳</div>
                <p>加载中...</p>
              </div>
            ) : contents().length === 0 ? (
              <div class="empty-state">
                <div class="empty-state-icon">📭</div>
                <h3>暂无内容</h3>
                <p>当前筛选条件下没有内容</p>
              </div>
            ) : (
              <div class="table-responsive" style={{ overflowX: 'auto' }}>
                <table class="table">
                  <thead>
                    <tr>
                      <th>标题</th>
                      <th>作者</th>
                      <th>分类</th>
                      <th>提交时间</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contents().map(content => (
                      <tr onClick={() => setSelectedContent(content)} style={{ cursor: 'pointer' }}>
                        <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {content.title}
                        </td>
                        <td>{content.author}</td>
                        <td>{content.category}</td>
                        <td>{formatDate(content.createdAt)}</td>
                        <td>
                          {filter() === 'reviewing' ? (
                            <div class="action-buttons">
                              <button 
                                class="btn btn-sm btn-success"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleReview(content.id, 'approve', '质量达标')
                                }}
                              >
                                通过
                              </button>
                              <button 
                                class="btn btn-sm btn-danger"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleReview(content.id, 'reject', '内容质量不达标')
                                }}
                              >
                                拒绝
                              </button>
                            </div>
                          ) : (
                            <span class={`status-badge status-${content.status}`}>
                              {getStatusLabel(content.status)}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3>内容详情</h3>
          </div>
          <div class="card-body">
            {!selectedContent() ? (
              <div class="empty-state">
                <div class="empty-state-icon">👈</div>
                <h3>选择内容</h3>
                <p>点击左侧列表中的内容查看详情</p>
              </div>
            ) : (
              <div>
                <h3 style={{ fontSize: '20px', marginBottom: '16px', fontWeight: 600 }}>
                  {selectedContent().title}
                </h3>
                
                <div class="flex gap-4 mb-4" style={{ flexWrap: 'wrap' }}>
                  <div class="flex items-center gap-2">
                    <span>👤</span>
                    <span>{selectedContent().author}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span>📁</span>
                    <span>{selectedContent().category}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span>⏰</span>
                    <span>{formatDate(selectedContent().createdAt)}</span>
                  </div>
                </div>

                <div class="tags mb-4">
                  {selectedContent().tags?.map(tag => (
                    <span class="tag">{tag}</span>
                  ))}
                </div>

                <div class="content-detail">
                  <h4>内容预览</h4>
                  <div 
                    class="content-preview"
                    innerHTML={selectedContent().content}
                  />
                </div>

                {filter() === 'reviewing' && (
                  <div class="mt-6 flex gap-4">
                    <button 
                      class="btn btn-success"
                      onClick={() => handleReview(selectedContent().id, 'approve', '质量达标')}
                    >
                      ✅ 通过审核
                    </button>
                    <button 
                      class="btn btn-warning"
                      onClick={() => handleReview(selectedContent().id, 'restrict', '需要限流')}
                    >
                      🚧 限流发布
                    </button>
                    <button 
                      class="btn btn-danger"
                      onClick={() => handleReview(selectedContent().id, 'reject', '内容质量不达标')}
                    >
                      ❌ 拒绝
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div class="card mt-6">
        <div class="card-header">
          <h3>审核标准</h3>
        </div>
        <div class="card-body">
          <div class="grid-3">
            <div class="alert alert-success">
              <strong>✅ 通过标准</strong>
              <ul style={{ marginTop: '8px', paddingLeft: '20px', fontSize: '14px' }}>
                <li>内容完整，结构清晰</li>
                <li>质量评分 >= 60分</li>
                <li>无违规内容</li>
                <li>排版规范</li>
              </ul>
            </div>
            <div class="alert alert-warning">
              <strong>🚧 限流标准</strong>
              <ul style={{ marginTop: '8px', paddingLeft: '20px', fontSize: '14px' }}>
                <li>质量评分 40-60分</li>
                <li>内容有争议</li>
                <li>可能存在标题党</li>
                <li>流量权重降至0.3</li>
              </ul>
            </div>
            <div class="alert" style={{ background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid var(--danger)' }}>
              <strong>❌ 拒绝标准</strong>
              <ul style={{ marginTop: '8px', paddingLeft: '20px', fontSize: '14px' }}>
                <li>抄袭或低质量</li>
                <li>违规违法内容</li>
                <li>虚假信息</li>
                <li>严重标题党</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
