import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';

const API_BASE = 'http://localhost:8765/api';

const COLOR_THEMES = [
  { name: '奶绿', bg: '#E8F4E8', text: '#3D5C3D' },
  { name: '浅粉', bg: '#FDEEF2', text: '#5C3D4A' },
  { name: '米白', bg: '#F5F0E6', text: '#4A4A4A' },
  { name: '浅蓝', bg: '#E6F0F5', text: '#3D4A5C' }
];

function getTodayThemeIndex() {
  const today = new Date();
  return today.getDate() % COLOR_THEMES.length;
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  return `${year}.${month}.${day} ${weekDays[date.getDay()]}`;
}

function App() {
  const [quote, setQuote] = useState(null);
  const [themeIndex, setThemeIndex] = useState(getTodayThemeIndex());
  const [loading, setLoading] = useState(true);
  const [favoriting, setFavoriting] = useState(false);
  const [favToast, setFavToast] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showWallpaper, setShowWallpaper] = useState(false);
  
  const longPressTimer = useRef(null);
  const lastTapTime = useRef(0);
  const wallpaperCanvas = useRef(null);
  const menuPressTimer = useRef(null);

  const theme = COLOR_THEMES[themeIndex];

  const fetchRandomQuote = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/quote/random`);
      const data = await response.json();
      setQuote(data);
    } catch (error) {
      setQuote({
        id: 0,
        text: "愿你每天都有好心情。",
        author: "治愈语录",
        category: "情感"
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRandomQuote();
  }, [fetchRandomQuote]);

  const handleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapTime.current < 300) {
      fetchRandomQuote();
    }
    lastTapTime.current = now;
  }, [fetchRandomQuote]);

  const handleLongPressStart = useCallback((e) => {
    e.preventDefault();
    longPressTimer.current = setTimeout(() => {
      handleFavorite();
    }, 500);
  }, [quote]);

  const handleLongPressEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleFavorite = async () => {
    if (!quote || favoriting) return;
    setFavoriting(true);
    try {
      await fetch(`${API_BASE}/favorites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quote, category: quote.category })
      });
      setFavToast(true);
      setTimeout(() => setFavToast(false), 1500);
    } finally {
      setFavoriting(false);
    }
  };

  const handleMenuPressStart = useCallback((e) => {
    e.stopPropagation();
    menuPressTimer.current = setTimeout(() => {
      setShowMenu(true);
    }, 500);
  }, []);

  const handleMenuPressEnd = useCallback(() => {
    if (menuPressTimer.current) {
      clearTimeout(menuPressTimer.current);
      menuPressTimer.current = null;
    }
  }, []);

  const handleSearch = async () => {
    if (!searchKeyword.trim()) return;
    try {
      const response = await fetch(`${API_BASE}/search?keyword=${encodeURIComponent(searchKeyword)}`);
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      setSearchResults([]);
    }
  };

  const selectSearchResult = (result) => {
    setQuote(result);
    setShowSearch(false);
    setSearchKeyword('');
    setSearchResults([]);
  };

  const generateWallpaper = useCallback(() => {
    if (!quote || !wallpaperCanvas.current) return;
    const canvas = wallpaperCanvas.current;
    const ctx = canvas.getContext('2d');
    const width = 1080;
    const height = 1920;
    
    canvas.width = width;
    canvas.height = height;
    
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, width, height);
    
    ctx.fillStyle = theme.text;
    ctx.font = 'lighter 64px -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const maxWidth = 800;
    const lineHeight = 120;
    const chars = quote.text.split('');
    const lines = [];
    let currentLine = '';
    
    chars.forEach(char => {
      const testLine = currentLine + char;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = char;
      } else {
        currentLine = testLine;
      }
    });
    if (currentLine) lines.push(currentLine);
    
    const totalHeight = lines.length * lineHeight;
    const startY = (height - totalHeight) / 2;
    
    lines.forEach((line, index) => {
      ctx.fillText(line, width / 2, startY + index * lineHeight);
    });
    
    ctx.font = 'lighter 36px -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillText(`—— ${quote.author}`, width / 2, height - 200);
    
    setShowWallpaper(true);
  }, [quote, theme]);

  const downloadWallpaper = () => {
    if (!wallpaperCanvas.current) return;
    const link = document.createElement('a');
    link.download = `healing-quote-${Date.now()}.png`;
    link.href = wallpaperCanvas.current.toDataURL('image/png');
    link.click();
    setShowWallpaper(false);
  };

  return (
    <div 
      className="app"
      style={{ backgroundColor: theme.bg, color: theme.text }}
      onClick={handleTap}
      onMouseDown={handleLongPressStart}
      onMouseUp={handleLongPressEnd}
      onMouseLeave={handleLongPressEnd}
      onTouchStart={handleLongPressStart}
      onTouchEnd={handleLongPressEnd}
    >
      <div className="content">
        {loading ? (
          <div className="loading">
            <div className="loading-spinner" style={{ borderColor: theme.text }}></div>
          </div>
        ) : quote ? (
          <div className="quote-container">
            <p className="quote-text">{quote.text}</p>
            <p className="quote-author">—— {quote.author}</p>
            <p className="quote-category">{quote.category}</p>
          </div>
        ) : null}
      </div>

      <div 
        className="bottom-bar"
        onClick={(e) => {
          e.stopPropagation();
          handleMenuPressStart(e);
        }}
        onMouseDown={handleMenuPressStart}
        onMouseUp={handleMenuPressEnd}
        onMouseLeave={handleMenuPressEnd}
        onTouchStart={handleMenuPressStart}
        onTouchEnd={handleMenuPressEnd}
      >
        <span className="date-text">{formatDate(new Date())}</span>
      </div>

      {favToast && (
        <div className="toast">
          <span>✓ 已收藏到「{quote?.category}」</span>
        </div>
      )}

      {showMenu && (
        <div 
          className="menu-overlay"
          style={{ backgroundColor: theme.bg + 'F0' }}
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(false);
          }}
        >
          <div className="menu" style={{ backgroundColor: theme.bg, borderColor: theme.text + '30' }}>
            <h3 style={{ color: theme.text }}>菜单</h3>
            
            <div className="menu-section">
              <p className="menu-label" style={{ color: theme.text + '90' }}>配色主题</p>
              <div className="theme-grid">
                {COLOR_THEMES.map((t, i) => (
                  <button
                    key={t.name}
                    className={`theme-btn ${themeIndex === i ? 'active' : ''}`}
                    style={{ backgroundColor: t.bg, borderColor: themeIndex === i ? theme.text : 'transparent' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setThemeIndex(i);
                    }}
                  >
                    <span style={{ color: t.text }}>{t.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="menu-section">
              <button 
                className="menu-btn"
                style={{ color: theme.text }}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSearch(true);
                  setShowMenu(false);
                }}
              >
                🔍 搜索语录
              </button>
            </div>

            <div className="menu-section">
              <button 
                className="menu-btn"
                style={{ color: theme.text }}
                onClick={(e) => {
                  e.stopPropagation();
                  generateWallpaper();
                  setShowMenu(false);
                }}
              >
                📷 生成壁纸
              </button>
            </div>

            <p className="hint-text" style={{ color: theme.text + '60' }}>
              双击屏幕切换语录 · 长按收藏
            </p>
          </div>
        </div>
      )}

      {showSearch && (
        <div 
          className="search-overlay"
          style={{ backgroundColor: theme.bg + 'F5' }}
          onClick={(e) => {
            e.stopPropagation();
            setShowSearch(false);
            setSearchKeyword('');
            setSearchResults([]);
          }}
        >
          <div className="search-container" onClick={(e) => e.stopPropagation()}>
            <input
              type="text"
              className="search-input"
              style={{ backgroundColor: theme.bg, color: theme.text, borderColor: theme.text + '30' }}
              placeholder="输入关键词搜索..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              autoFocus
            />
            
            <button 
              className="search-btn"
              style={{ backgroundColor: theme.text, color: theme.bg }}
              onClick={handleSearch}
            >
              搜索
            </button>

            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map((result, index) => (
                  <div 
                    key={`${result.id}-${index}`}
                    className="search-result-item"
                    style={{ borderColor: theme.text + '20' }}
                    onClick={() => selectSearchResult(result)}
                  >
                    <p className="result-text" style={{ color: theme.text }}>{result.text}</p>
                    <p className="result-meta" style={{ color: theme.text + '70' }}>
                      —— {result.author} · {result.category}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showWallpaper && (
        <div 
          className="wallpaper-overlay"
          onClick={(e) => {
            e.stopPropagation();
            setShowWallpaper(false);
          }}
        >
          <div className="wallpaper-container" onClick={(e) => e.stopPropagation()}>
            <img 
              src={wallpaperCanvas.current?.toDataURL()} 
              alt="语录壁纸"
              className="wallpaper-preview"
            />
            <div className="wallpaper-actions">
              <button 
                className="wallpaper-btn"
                style={{ backgroundColor: theme.bg, color: theme.text }}
                onClick={() => setShowWallpaper(false)}
              >
                取消
              </button>
              <button 
                className="wallpaper-btn primary"
                style={{ backgroundColor: theme.text, color: theme.bg }}
                onClick={downloadWallpaper}
              >
                下载壁纸
              </button>
            </div>
          </div>
        </div>
      )}

      <canvas ref={wallpaperCanvas} style={{ display: 'none' }} />
    </div>
  );
}

export default App;
