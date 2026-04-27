import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { getTechNodeById } from '../data/techNodes';
import type { TechNode } from '../types';
import './NodeDetailPanel.css';

interface NodeDetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NodeDetailPanel({ isOpen, onClose }: NodeDetailPanelProps) {
  const { state, toggleBookmark, markCompleted } = useAppContext();
  const { selectedNodeId, userProgress } = state;

  const [activeVersionIndex, setActiveVersionIndex] = useState(0);
  const [activeCodeIndex, setActiveCodeIndex] = useState(0);
  const [showComparison, setShowComparison] = useState(false);

  const selectedNode = selectedNodeId ? getTechNodeById(selectedNodeId) : null;
  const progress = selectedNodeId ? userProgress[selectedNodeId] : undefined;

  if (!selectedNode) {
    return null;
  }

  const activeVersion = selectedNode.versions[activeVersionIndex] || selectedNode.versions[0];
  const activeCodeSnippet = activeVersion?.codeSnippets?.[activeCodeIndex];

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      vanilla: '原生',
      library: '库',
      framework: '框架',
      'build-tool': '构建工具',
      other: '其他',
    };
    return labels[category] || category;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      emerging: '新兴',
      popular: '流行',
      maintaining: '维护中',
      deprecated: '已过时',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      emerging: 'var(--accent-blue)',
      popular: 'var(--accent-green)',
      maintaining: 'var(--accent-yellow)',
      deprecated: 'var(--accent-red)',
    };
    return colors[status] || 'var(--text-muted)';
  };

  const influencedByNodes = selectedNode.influencedBy
    ?.map((id) => getTechNodeById(id))
    .filter(Boolean) as TechNode[];

  const influencedNodes = selectedNode.influenced
    ?.map((id) => getTechNodeById(id))
    .filter(Boolean) as TechNode[];

  return (
    <div className={`node-detail-panel ${isOpen ? 'open' : ''}`}>
      <div className="detail-header">
        <div className="detail-title-row">
          <div
            className="detail-icon"
            style={{ backgroundColor: selectedNode.color }}
          >
            <span>{selectedNode.iconEmoji}</span>
          </div>
          <div className="detail-title-info">
            <h2 className="detail-title">{selectedNode.displayName}</h2>
            <div className="detail-meta">
              <span
                className="detail-category"
                style={{ background: `${selectedNode.color}20`, color: selectedNode.color }}
              >
                {getCategoryLabel(selectedNode.category)}
              </span>
              <span
                className="detail-status"
                style={{ color: getStatusColor(selectedNode.status) }}
              >
                ● {getStatusLabel(selectedNode.status)}
              </span>
            </div>
          </div>
          <button className="detail-close-btn" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>

        <div className="detail-time-range">
          <span className="time-label">活跃时间</span>
          <span className="time-value">
            {selectedNode.timelineStart} — {selectedNode.timelineEnd || '至今'}
          </span>
        </div>

        <div className="detail-actions">
          <button
            className={`action-btn ${progress?.isBookmarked ? 'bookmarked' : ''}`}
            onClick={() => toggleBookmark(selectedNode.id)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={progress?.isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
            </svg>
            <span>{progress?.isBookmarked ? '已收藏' : '收藏'}</span>
          </button>
          <button
            className={`action-btn ${progress?.isCompleted ? 'completed' : ''}`}
            onClick={() => markCompleted(selectedNode.id)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20,6 9,17 4,12" />
            </svg>
            <span>{progress?.isCompleted ? '已学习' : '标记学习'}</span>
          </button>
        </div>
      </div>

      <div className="detail-content">
        <section className="detail-section">
          <h3 className="detail-section-title">概述</h3>
          <p className="detail-description">{selectedNode.longDescription}</p>
        </section>

        <section className="detail-section">
          <h3 className="detail-section-title">版本历史</h3>
          <div className="version-tabs">
            {selectedNode.versions.map((version, index) => (
              <button
                key={version.version}
                className={`version-tab ${activeVersionIndex === index ? 'active' : ''}`}
                onClick={() => {
                  setActiveVersionIndex(index);
                  setActiveCodeIndex(0);
                }}
              >
                <span className="version-tab-version">{version.version}</span>
                <span className="version-tab-date">{version.releaseDate}</span>
              </button>
            ))}
          </div>

          {activeVersion && (
            <div className="version-detail">
              <div className="version-features">
                <h4>主要特性</h4>
                <ul className="feature-list">
                  {activeVersion.features.map((feature, index) => (
                    <li key={index}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill={selectedNode.color}>
                        <circle cx="12" cy="12" r="4" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {activeVersion.breakingChanges && activeVersion.breakingChanges.length > 0 && (
                <div className="version-breaking">
                  <h4>破坏性变更</h4>
                  <ul className="breaking-list">
                    {activeVersion.breakingChanges.map((change, index) => (
                      <li key={index}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--accent-red)">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                        </svg>
                        {change}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </section>

        {activeCodeSnippet && (
          <section className="detail-section">
            <h3 className="detail-section-title">代码示例</h3>

            {activeVersion.codeSnippets && activeVersion.codeSnippets.length > 1 && (
              <div className="code-tabs">
                {activeVersion.codeSnippets.map((snippet, index) => (
                  <button
                    key={snippet.id}
                    className={`code-tab ${activeCodeIndex === index ? 'active' : ''}`}
                    onClick={() => setActiveCodeIndex(index)}
                  >
                    {snippet.title}
                  </button>
                ))}
              </div>
            )}

            <div className="code-container">
              <div className="code-header">
                <span className="code-language">{activeCodeSnippet.language.toUpperCase()}</span>
                <span className="code-title">{activeCodeSnippet.title}</span>
              </div>
              <pre className="code-block">
                <code>{activeCodeSnippet.code}</code>
              </pre>
            </div>

            {activeCodeSnippet.comparisonCode && (
              <>
                <button
                  className="toggle-comparison-btn"
                  onClick={() => setShowComparison(!showComparison)}
                >
                  {showComparison ? '隐藏对比' : '显示对比代码'}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ transform: showComparison ? 'rotate(180deg)' : 'none' }}
                  >
                    <polyline points="6,9 12,15 18,9" />
                  </svg>
                </button>

                {showComparison && (
                  <div className="code-container comparison animate-fade-in">
                    <div className="code-header">
                      <span className="code-language">
                        {activeCodeSnippet.language.toUpperCase()}
                      </span>
                      <span className="code-title">
                        {activeCodeSnippet.comparisonTitle || '对比代码'}
                      </span>
                    </div>
                    <pre className="code-block">
                      <code>{activeCodeSnippet.comparisonCode}</code>
                    </pre>
                  </div>
                )}
              </>
            )}
          </section>
        )}

        <section className="detail-section">
          <h3 className="detail-section-title">核心 API</h3>
          <div className="api-tags">
            {selectedNode.keyApis.map((api, index) => (
              <span
                key={index}
                className="api-tag"
                style={{
                  background: `${selectedNode.color}15`,
                  borderColor: `${selectedNode.color}40`,
                  color: selectedNode.color,
                }}
              >
                {api}
              </span>
            ))}
          </div>
        </section>

        <section className="detail-section">
          <h3 className="detail-section-title">适用场景</h3>
          <ul className="use-cases-list">
            {selectedNode.useCases.map((useCase, index) => (
              <li key={index}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <polyline points="22,4 12,14.01 9,11.01" />
                </svg>
                {useCase}
              </li>
            ))}
          </ul>
        </section>

        <section className="detail-section two-column">
          <div className="pros-col">
            <h3 className="detail-section-title pros">优点</h3>
            <ul className="pros-cons-list">
              {selectedNode.pros.map((pro, index) => (
                <li key={index}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--accent-green)">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                  {pro}
                </li>
              ))}
            </ul>
          </div>
          <div className="cons-col">
            <h3 className="detail-section-title cons">缺点</h3>
            <ul className="pros-cons-list">
              {selectedNode.cons.map((con, index) => (
                <li key={index}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--accent-red)">
                    <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
                  </svg>
                  {con}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {(influencedByNodes?.length || influencedNodes?.length) && (
          <section className="detail-section">
            <h3 className="detail-section-title">技术关联</h3>

            {influencedByNodes?.length > 0 && (
              <div className="relation-group">
                <span className="relation-label">受影响于</span>
                <div className="relation-nodes">
                  {influencedByNodes.map((node) => (
                    <div
                      key={node.id}
                      className="relation-node"
                      style={{ borderColor: node.color }}
                    >
                      <div
                        className="relation-node-icon"
                        style={{ backgroundColor: node.color }}
                      >
                        {node.iconEmoji}
                      </div>
                      <span className="relation-node-name">{node.displayName}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {influencedNodes?.length > 0 && (
              <div className="relation-group">
                <span className="relation-label">影响了</span>
                <div className="relation-nodes">
                  {influencedNodes.map((node) => (
                    <div
                      key={node.id}
                      className="relation-node"
                      style={{ borderColor: node.color }}
                    >
                      <div
                        className="relation-node-icon"
                        style={{ backgroundColor: node.color }}
                      >
                        {node.iconEmoji}
                      </div>
                      <span className="relation-node-name">{node.displayName}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
