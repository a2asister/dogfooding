import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className="home-page">
      {/* 游戏海报/横幅区域 */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="game-title">游戏公测预约</h1>
          <p className="game-tagline">精彩游戏，抢先体验</p>
          <div className="hero-actions">
            <Link to="/reservation" className="btn btn-primary">立即预约</Link>
            <Link to="/query" className="btn btn-secondary">预约查询</Link>
          </div>
        </div>
      </section>

      {/* 游戏简介区域 */}
      <section className="intro-section">
        <div className="container">
          <h2 className="section-title">游戏简介</h2>
          <p className="intro-text">
            这是一款令人期待的精彩游戏，拥有丰富的游戏内容、精美的画面表现和流畅的操作体验。
            公测即将开启，立即预约获取测试资格，抢先体验游戏的精彩内容！
          </p>
        </div>
      </section>

      {/* 公测信息区域 */}
      <section className="beta-section">
        <div className="container">
          <h2 className="section-title">公测信息</h2>
          <div className="beta-info">
            <div className="info-item">
              <h3>公测时间</h3>
              <p>2026年Q2</p>
            </div>
            <div className="info-item">
              <h3>预约截止</h3>
              <p>2026年5月31日</p>
            </div>
            <div className="info-item">
              <h3>资格通知</h3>
              <p>预约后3个工作日内</p>
            </div>
          </div>
        </div>
      </section>

      {/* 游戏特色区域 */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">游戏特色</h2>
          <div className="features-grid">
            <div className="feature-item">
              <h3>精美画面</h3>
              <p>采用最新引擎技术，打造沉浸式游戏体验</p>
            </div>
            <div className="feature-item">
              <h3>丰富玩法</h3>
              <p>多种游戏模式，满足不同玩家需求</p>
            </div>
            <div className="feature-item">
              <h3>社交互动</h3>
              <p>好友系统、公会系统，与好友一起冒险</p>
            </div>
            <div className="feature-item">
              <h3>持续更新</h3>
              <p>定期推出新内容，保持游戏新鲜感</p>
            </div>
          </div>
        </div>
      </section>

      {/* 预约礼包展示 */}
      <section className="rewards-section">
        <div className="container">
          <h2 className="section-title">预约礼包</h2>
          <div className="rewards-grid">
            <div className="reward-item">
              <h3>新手礼包</h3>
              <p>预约即可获得专属新手礼包</p>
            </div>
            <div className="reward-item">
              <h3>限定皮肤</h3>
              <p>公测专属限定角色皮肤</p>
            </div>
            <div className="reward-item">
              <h3>游戏道具</h3>
              <p>丰富的游戏内道具奖励</p>
            </div>
          </div>
        </div>
      </section>

      {/* 下载入口 */}
      <section className="download-section">
        <div className="container">
          <h2 className="section-title">游戏下载</h2>
          <p className="download-text">公测开启后，可在此下载游戏客户端</p>
          <div className="download-buttons">
            <button className="btn btn-download">Android 下载</button>
            <button className="btn btn-download">iOS 下载</button>
            <button className="btn btn-download">PC 下载</button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
