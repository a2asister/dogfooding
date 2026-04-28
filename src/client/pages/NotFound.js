import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

function NotFound() {
  return (
    <div className="not-found-page">
      <div className="container">
        <div className="not-found-content">
          <h1 className="error-code">404</h1>
          <h2 className="error-title">页面未找到</h2>
          <p className="error-description">
            抱歉，您访问的页面不存在或已被移除。
          </p>
          <div className="error-actions">
            <Link to="/" className="btn btn-primary">
              返回首页
            </Link>
            <Link to="/reservation" className="btn btn-secondary">
              立即预约
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
