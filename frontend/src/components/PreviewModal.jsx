import React from 'react';

const typeIcons = {
  document: '📄',
  image: '🖼️',
  video: '🎬',
  archive: '📦'
};

const getPlaceholderImage = (type) => {
  const prompts = {
    image: 'minimalist abstract landscape photography, soft colors, professional quality',
    document: 'professional document interface, clean white paper, minimalist design',
    video: 'video player interface with play button, dark theme, professional',
    archive: 'zip archive icon, modern minimalist design, blue gradient'
  };
  return `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompts[type] || 'minimalist abstract')}&image_size=square_hd`;
};

function PreviewModal({ file, onClose, formatSize }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="preview-modal" onClick={onClose}>
      <div className="preview-content" onClick={(e) => e.stopPropagation()}>
        <div className="preview-header">
          <div className="preview-title">{file.name}</div>
          <button className="preview-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="preview-body">
          {file.type === 'image' && (
            <img
              src={getPlaceholderImage('image')}
              alt={file.name}
              className="preview-image"
            />
          )}
          {file.type === 'video' && (
            <video
              src=""
              className="preview-video"
              controls
              poster={getPlaceholderImage('video')}
            >
              您的浏览器不支持视频播放
            </video>
          )}
          {(file.type === 'document' || file.type === 'archive') && (
            <div style={{ textAlign: 'center' }}>
              <img
                src={getPlaceholderImage(file.type)}
                alt={file.name}
                className="preview-image"
                style={{ display: 'block', marginBottom: '20px' }}
              />
              <div className="preview-icon" style={{ fontSize: '80px', marginBottom: '16px' }}>
                {typeIcons[file.type]}
              </div>
              <div style={{ color: '#666', fontSize: '14px' }}>
                文件大小: {formatSize(file.size)}
              </div>
              <div style={{ color: '#666', fontSize: '14px', marginTop: '8px' }}>
                修改时间: {formatDate(file.modifiedAt)}
              </div>
              <div style={{ color: '#666', fontSize: '14px', marginTop: '8px' }}>
                文件类型: {file.extension.toUpperCase()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PreviewModal;
