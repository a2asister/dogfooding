import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          {/* Logo */}
          <Link to="/" className="logo">
            <div className="logo-icon">🎮</div>
            <span className="logo-text">游戏官网</span>
          </Link>

          {/* 导航菜单 - 桌面端 */}
          <nav className="nav-menu">
            <Link to="/" className="nav-link">首页</Link>
            <Link to="/reservation" className="nav-link">立即预约</Link>
            <Link to="/query" className="nav-link">资格查询</Link>
          </nav>

          {/* 移动端菜单按钮 */}
          <button 
            className="menu-toggle" 
            onClick={toggleMenu}
            aria-label="菜单"
          >
            <span className="menu-icon"></span>
            <span className="menu-icon"></span>
            <span className="menu-icon"></span>
          </button>
        </div>

        {/* 移动端导航菜单 */}
        {isMenuOpen && (
          <nav className="mobile-nav">
            <Link to="/" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>首页</Link>
            <Link to="/reservation" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>立即预约</Link>
            <Link to="/query" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>资格查询</Link>
          </nav>
        )}
      </div>
    </header>
  );
}

export default Header;
