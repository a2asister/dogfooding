import { createSignal } from 'solid-js'
import RichTextEditor from '../components/RichTextEditor.jsx'
import { api } from '../services/api.js'

const categories = ['科技', '技术', '生活', '财经', '娱乐', '教育', '健康', '其他']

export default function Publish() {
  const [title, setTitle] = createSignal('')
  const [content, setContent] = createSignal('')
  const [author, setAuthor] = createSignal('')
  const [category, setCategory] = createSignal('科技')
  const [tags, setTags] = createSignal([])
  const [tagInput, setTagInput] = createSignal('')
  const [submitting, setSubmitting] = createSignal(false)
  const [message, setMessage] = createSignal(null)

  const addTag = (e) => {
    if (e.key === 'Enter' && tagInput().trim()) {
      e.preventDefault()
      if (!tags().includes(tagInput().trim())) {
        setTags([...tags(), tagInput().trim()])
      }
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove) => {
    setTags(tags().filter(t => t !== tagToRemove))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!title().trim() || !content().trim()) {
      setMessage({ type: 'error', text: '标题和内容不能为空' })
      return
    }

    setSubmitting(true)
    setMessage(null)

    try {
      const result = await api.createContent({
        title: title(),
        content: content(),
        author: author() || '匿名用户',
        category: category(),
        tags: tags()
      })

      if (result.success) {
        setMessage({ type: 'success', text: result.message })
        setTitle('')
        setContent('')
        setAuthor('')
        setCategory('科技')
        setTags([])
      } else {
        setMessage({ type: 'error', text: result.message })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '发布失败，请稍后重试' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <div class="page-header">
        <h2>内容发布</h2>
        <p>创建高质量内容，提交审核后即可分发</p>
      </div>

      <div class="card">
        <form onSubmit={handleSubmit}>
          <div class="card-body">
            {message() && (
              <div class={`alert ${message().type === 'success' ? 'alert-success' : 'alert-warning'}`}>
                {message().text}
              </div>
            )}

            <div class="grid-2 mb-4">
              <div class="form-group">
                <label class="form-label">文章标题 *</label>
                <input
                  type="text"
                  class="form-input"
                  placeholder="输入引人入胜的标题..."
                  value={title()}
                  onInput={(e) => setTitle(e.target.value)}
                />
              </div>
              <div class="form-group">
                <label class="form-label">作者</label>
                <input
                  type="text"
                  class="form-input"
                  placeholder="您的笔名"
                  value={author()}
                  onInput={(e) => setAuthor(e.target.value)}
                />
              </div>
            </div>

            <div class="grid-2 mb-4">
              <div class="form-group">
                <label class="form-label">内容分类</label>
                <select
                  class="form-select"
                  value={category()}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories.map(cat => (
                    <option value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">内容标签（回车添加）</label>
                <div class="tag-input">
                  {tags().map(tag => (
                    <span class="tag">
                      {tag}
                      <span class="tag-remove" onClick={() => removeTag(tag)}>×</span>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder="输入标签..."
                    value={tagInput()}
                    onInput={(e) => setTagInput(e.target.value)}
                    onKeyDown={addTag}
                  />
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">文章内容 *</label>
              <RichTextEditor value={content()} onChange={setContent} />
              <p class="text-sm text-gray-500 mt-2">
                支持富文本编辑：标题、加粗、斜体、列表、引用、代码块、表格等
              </p>
            </div>
          </div>

          <div class="card-footer flex justify-between items-center" style={{ padding: '20px 24px', borderTop: '1px solid var(--border)' }}>
            <div class="text-sm" style={{ color: 'var(--text-secondary)' }}>
              提交后将进入审核队列
            </div>
            <div class="flex gap-4">
              <button type="button" class="btn btn-secondary">
                保存草稿
              </button>
              <button type="submit" class="btn btn-primary" disabled={submitting()}>
                {submitting() ? '提交中...' : '提交审核'}
              </button>
            </div>
          </div>
        </form>
      </div>

      <div class="grid-2 mt-6">
        <div class="card">
          <div class="card-header">
            <h3>发布指南</h3>
          </div>
          <div class="card-body">
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ padding: '12px 0', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', flexShrink: 0 }}>1</span>
                <div>
                  <strong>原创内容</strong>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>确保内容原创性，避免抄袭</p>
                </div>
              </li>
              <li style={{ padding: '12px 0', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', flexShrink: 0 }}>2</span>
                <div>
                  <strong>高质量排版</strong>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>使用适当的标题、列表、引用格式</p>
                </div>
              </li>
              <li style={{ padding: '12px 0', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', flexShrink: 0 }}>3</span>
                <div>
                  <strong>准确标签</strong>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>添加3-5个相关标签有助于分发</p>
                </div>
              </li>
              <li style={{ padding: '12px 0', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', flexShrink: 0 }}>4</span>
                <div>
                  <strong>合规内容</strong>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>遵守社区规范和法律法规</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3>质量评分标准</h3>
          </div>
          <div class="card-body">
            <div class="mb-4">
              <div class="flex justify-between mb-2">
                <span>内容完整性</span>
                <span style={{ color: 'var(--secondary)' }}>30%</span>
              </div>
              <div class="quality-bar"><div class="quality-bar-fill quality-high" style={{ width: '30%' }}></div></div>
            </div>
            <div class="mb-4">
              <div class="flex justify-between mb-2">
                <span>排版格式</span>
                <span style={{ color: 'var(--secondary)' }}>25%</span>
              </div>
              <div class="quality-bar"><div class="quality-bar-fill quality-high" style={{ width: '25%' }}></div></div>
            </div>
            <div class="mb-4">
              <div class="flex justify-between mb-2">
                <span>原创性</span>
                <span style={{ color: 'var(--secondary)' }}>25%</span>
              </div>
              <div class="quality-bar"><div class="quality-bar-fill quality-high" style={{ width: '25%' }}></div></div>
            </div>
            <div>
              <div class="flex justify-between mb-2">
                <span>用户价值</span>
                <span style={{ color: 'var(--secondary)' }}>20%</span>
              </div>
              <div class="quality-bar"><div class="quality-bar-fill quality-high" style={{ width: '20%' }}></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
