import { useState, useEffect } from 'react'
import './App.css'

const API_BASE_URL = 'http://localhost:3333/api'

const WORD_COUNT_OPTIONS = [
  { value: 0, label: '不限' },
  { value: 20, label: '20字左右' },
  { value: 50, label: '50字左右' },
  { value: 100, label: '100字左右' },
  { value: 200, label: '200字左右' },
]

const COUNT_OPTIONS = [1, 2, 3, 4, 5]

function App() {
  const [styles, setStyles] = useState([])
  const [scenes, setScenes] = useState([])
  const [selectedStyle, setSelectedStyle] = useState('healing')
  const [selectedScene, setSelectedScene] = useState('moments')
  const [selectedWordCount, setSelectedWordCount] = useState(0)
  const [topic, setTopic] = useState('')
  const [generateCount, setGenerateCount] = useState(3)
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState([])
  const [showPolishModal, setShowPolishModal] = useState(false)
  const [polishContent, setPolishContent] = useState(null)
  const [isPolishing, setIsPolishing] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  useEffect(() => {
    fetchStyles()
    fetchScenes()
  }, [])

  const fetchStyles = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/styles`)
      const data = await response.json()
      setStyles(data)
    } catch (err) {
      console.error('Failed to fetch styles:', err)
    }
  }

  const fetchScenes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/scenes`)
      const data = await response.json()
      setScenes(data)
    } catch (err) {
      console.error('Failed to fetch scenes:', err)
    }
  }

  const handleGenerate = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topic.trim(),
          style: selectedStyle,
          scene: selectedScene,
          wordCount: selectedWordCount,
          count: generateCount,
        }),
      })

      await new Promise(resolve => setTimeout(resolve, 1500))

      const data = await response.json()
      if (data.success) {
        setResults(data.data)
      }
    } catch (err) {
      console.error('Generate failed:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePolish = async (content) => {
    setPolishContent({
      original: content,
      polished: null,
    })
    setShowPolishModal(true)
    setIsPolishing(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 1200))

      const response = await fetch(`${API_BASE_URL}/polish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          style: selectedStyle,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setPolishContent(data.data)
      }
    } catch (err) {
      console.error('Polish failed:', err)
    } finally {
      setIsPolishing(false)
    }
  }

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }

  const handleUsePolished = () => {
    if (polishContent?.polished) {
      handleCopy(polishContent.polished)
      setShowPolishModal(false)
    }
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">AI 氛围感文案生成器</h1>
        <p className="app-subtitle">零基础产出高级氛围感文案，支持多风格切换</p>
      </header>

      <main className="app-content">
        <section className="filter-section">
          <div className="filter-group">
            <div className="filter-label">选择风格</div>
            <div className="filter-tags">
              {styles.map((style) => (
                <span
                  key={style.id}
                  className={`filter-tag ${selectedStyle === style.id ? 'active' : ''}`}
                  onClick={() => setSelectedStyle(style.id)}
                >
                  {style.name}
                </span>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <div className="filter-label">选择场景</div>
            <div className="filter-tags">
              {scenes.map((scene) => (
                <span
                  key={scene.id}
                  className={`filter-tag ${selectedScene === scene.id ? 'active' : ''}`}
                  onClick={() => setSelectedScene(scene.id)}
                >
                  {scene.icon} {scene.name}
                </span>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <div className="filter-label">字数控制</div>
            <div className="filter-tags">
              {WORD_COUNT_OPTIONS.map((option) => (
                <span
                  key={option.value}
                  className={`filter-tag ${selectedWordCount === option.value ? 'active' : ''}`}
                  onClick={() => setSelectedWordCount(option.value)}
                >
                  {option.label}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="input-section">
          <div className="input-wrapper">
            <textarea
              className="input-box"
              placeholder="输入主题关键词，让 AI 为你创作氛围感文案...
例如：下午茶、周末生活、旅行感悟、生日祝福等"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <div className="input-row">
            <div className="count-selector">
              <label>生成数量</label>
              <select
                value={generateCount}
                onChange={(e) => setGenerateCount(Number(e.target.value))}
              >
                {COUNT_OPTIONS.map((num) => (
                  <option key={num} value={num}>{num} 条</option>
                ))}
              </select>
            </div>

            <button
              className="generate-btn"
              onClick={handleGenerate}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span>✨</span>
                  <span>生成中...</span>
                </>
              ) : (
                <>
                  <span>✨</span>
                  <span>生成文案</span>
                </>
              )}
            </button>
          </div>
        </section>

        <section className="results-section">
          {isLoading ? (
            <div className="loading-container">
              <div className="particles-loader">
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
                <span className="loading-text">AI 正在创作中...</span>
              </div>
            </div>
          ) : results.length > 0 ? (
            results.map((item) => (
              <div key={item.id} className="copy-card">
                <div className="copy-card-header">
                  <div className="copy-tags">
                    <span className="copy-tag">{item.style}</span>
                    <span className="copy-tag">{item.scene}</span>
                  </div>
                  <span className="copy-word-count">{item.wordCount} 字</span>
                </div>

                <div className="copy-content">{item.content}</div>

                <div className="copy-actions">
                  <button
                    className="action-btn"
                    onClick={() => handlePolish(item.content)}
                  >
                    <span>✨</span>
                    <span>AI 润色</span>
                  </button>
                  <button
                    className="action-btn primary"
                    onClick={() => handleCopy(item.content)}
                  >
                    <span>📋</span>
                    <span>复制</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">✍️</div>
              <div className="empty-state-text">
                选择风格和场景，输入主题，开始创作你的专属文案吧~
              </div>
            </div>
          )}
        </section>
      </main>

      {showPolishModal && polishContent && (
        <div className="polish-modal" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowPolishModal(false)
          }
        }}>
          <div className="polish-modal-content">
            <div className="polish-modal-header">
              <h2 className="polish-modal-title">✨ AI 润色优化</h2>
              <button
                className="close-btn"
                onClick={() => setShowPolishModal(false)}
              >
                ×
              </button>
            </div>

            <div className="polish-section">
              <div className="polish-section-title">原文案</div>
              <div className="polish-content-box">
                {polishContent.original}
              </div>
            </div>

            <div className="polish-section">
              <div className="polish-section-title">润色后</div>
              <div className="polish-content-box">
                {isPolishing ? (
                  <span style={{ color: 'var(--text-secondary)' }}>AI 正在润色中...</span>
                ) : polishContent.polished ? (
                  polishContent.polished
                ) : (
                  <span style={{ color: 'var(--text-secondary)' }}>准备开始润色...</span>
                )}
              </div>
            </div>

            <div className="polish-modal-footer">
              <button
                className="action-btn"
                onClick={() => setShowPolishModal(false)}
              >
                关闭
              </button>
              <button
                className="action-btn primary"
                onClick={handleUsePolished}
                disabled={!polishContent.polished}
              >
                <span>📋</span>
                <span>复制并使用</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {copySuccess && (
        <div className="copy-success">
          ✅ 已复制到剪贴板
        </div>
      )}
    </div>
  )
}

export default App
