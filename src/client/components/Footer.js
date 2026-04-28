import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* 底部导航 */}
          <div className="footer-nav">
            <Link to="/" className="footer-link">首页</Link>
            <Link to="/reservation" className="footer-link">立即预约</Link>
            <Link to="/query" className="footer-link">资格查询</Link>
            <a href="#" className="footer-link">用户协议</a>
            <a href="#" className="footer-link">隐私政策</a>
          </div>

          {/* 游戏信息 */}
          <div className="footer-info">
            <div className="game-info">
              <p className="game-name">游戏官方公测预约页面</p>
              <p className="copyright">
                © {currentYear} 游戏公司版权所有 | 
                <a href="#" className="icp-link">京ICP备XXXXXXXX号</a>
              </p>
            </div>

            {/* 联系方式 */}
            <div className="contact-info">
              <p className="contact-item">客服热线：400-XXX-XXXX</p>
              <p className="contact-item">工作时间：9:00 - 18:00</p>
              <p className="contact-item">客服邮箱：support@game.com</p>
            </div>
          </div>

          {/* 健康游戏忠告 */}
          <div className="health-warning">
            <p className="warning-text">
              抵制不良游戏，拒绝盗版游戏。注意自我保护，谨防受骗上当。
              适度游戏益脑，沉迷游戏伤身。合理安排时间，享受健康生活。
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
