import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ExternalLink, MessageCircle, Users } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: '首页', path: '/' },
    { label: '作品展示', path: '/portfolio' },
    { label: '案例项目', path: '/cases' },
    { label: '设计服务', path: '/services' },
    { label: '素材资源', path: '/materials' },
    { label: '关于我', path: '/about' },
  ];

  const socialLinks = [
    { icon: ExternalLink, label: '官网', url: '#' },
    { icon: MessageCircle, label: '社交', url: '#' },
    { icon: Users, label: '社区', url: '#' },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">D</span>
              </div>
              <span className="text-xl font-semibold text-white">设计工作室</span>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              专业的设计师个人品牌展示平台，提供高质量的设计服务和作品展示。
            </p>
            <div className="flex space-x-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.url}
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">快速链接</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold mb-4">设计服务</h3>
            <ul className="space-y-2">
              <li className="text-gray-400 text-sm">UI/UX 设计</li>
              <li className="text-gray-400 text-sm">品牌设计</li>
              <li className="text-gray-400 text-sm">网页设计</li>
              <li className="text-gray-400 text-sm">插画设计</li>
              <li className="text-gray-400 text-sm">动效设计</li>
              <li className="text-gray-400 text-sm">产品咨询</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">联系方式</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm">designer@example.com</span>
              </li>
              <li className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm">+86 138 0013 8000</span>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm">北京市朝阳区</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              © {currentYear} 设计工作室. 保留所有权利.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacy" className="text-gray-500 hover:text-gray-300 text-sm">
                隐私政策
              </Link>
              <Link to="/terms" className="text-gray-500 hover:text-gray-300 text-sm">
                服务条款
              </Link>
              <Link to="/cookies" className="text-gray-500 hover:text-gray-300 text-sm">
                Cookie 政策
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
