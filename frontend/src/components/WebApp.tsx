import React, { useState } from 'react';
import { WebApp as WebAppType } from '../types';

interface WebAppProps {
  app: WebAppType;
}

const WebApp: React.FC<WebAppProps> = ({ app }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [showAddressBar, setShowAddressBar] = useState(true);
  const [currentUrl, setCurrentUrl] = useState(app.url);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    const iframe = document.getElementById(`webapp-iframe-${app.id}`) as HTMLIFrameElement;
    if (iframe) {
      iframe.src = iframe.src;
    }
  };

  const handleGoBack = () => {
    const iframe = document.getElementById(`webapp-iframe-${app.id}`) as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.history.back();
    }
  };

  const handleGoForward = () => {
    const iframe = document.getElementById(`webapp-iframe-${app.id}`) as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.history.forward();
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
  };

  return (
    <div
      className="web-app-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#f0f0f0',
      }}
    >
      {showAddressBar && (
        <div
          className="web-app-toolbar"
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px 12px',
            background: '#fff',
            borderBottom: '1px solid #e0e0e0',
            gap: '8px',
          }}
        >
          <button
            onClick={handleGoBack}
            style={{
              width: '32px',
              height: '32px',
              border: 'none',
              borderRadius: '4px',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            ←
          </button>
          <button
            onClick={handleGoForward}
            style={{
              width: '32px',
              height: '32px',
              border: 'none',
              borderRadius: '4px',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            →
          </button>
          <button
            onClick={handleRefresh}
            style={{
              width: '32px',
              height: '32px',
              border: 'none',
              borderRadius: '4px',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            ↻
          </button>
          <form
            onSubmit={handleUrlSubmit}
            style={{
              flex: 1,
              display: 'flex',
            }}
          >
            <input
              type="url"
              value={currentUrl}
              onChange={(e) => setCurrentUrl(e.target.value)}
              style={{
                flex: 1,
                padding: '8px 12px',
                border: '1px solid #d0d0d0',
                borderRadius: '4px',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </form>
          <span style={{ fontSize: '20px' }}>{app.icon}</span>
        </div>
      )}

      <div
        className="web-app-content"
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {isLoading && (
          <div
            className="web-app-loading"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#fff',
              zIndex: 10,
            }}
          >
            <div
              style={{
                fontSize: '48px',
                marginBottom: '16px',
                animation: 'spin 1s linear infinite',
              }}
            >
              {app.icon}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              正在加载 {app.name}...
            </div>
            <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
              {currentUrl}
            </div>
          </div>
        )}

        <iframe
          id={`webapp-iframe-${app.id}`}
          src={currentUrl}
          onLoad={handleLoad}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
          }}
          title={app.name}
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-popups-to-escape-sandbox"
        />
      </div>

      <div
        className="web-app-footer"
        style={{
          padding: '6px 12px',
          background: '#fff',
          borderTop: '1px solid #e0e0e0',
          fontSize: '12px',
          color: '#666',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>{app.description}</span>
        <button
          onClick={() => setShowAddressBar(!showAddressBar)}
          style={{
            background: 'none',
            border: 'none',
            color: '#0078d4',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          {showAddressBar ? '隐藏地址栏' : '显示地址栏'}
        </button>
      </div>
    </div>
  );
};

export default WebApp;
