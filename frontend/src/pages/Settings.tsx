import React from 'react';
import {
  Settings as SettingsIcon,
  Server,
  Database,
  Shield,
  FileText,
  Info,
} from 'lucide-react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';

const Settings: React.FC = () => {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-64">
          <Shield className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">权限不足</h3>
          <p className="text-gray-500">此页面仅管理员可访问</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">系统设置</h1>
          <p className="text-gray-500 mt-1">查看和配置系统参数</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Server className="w-5 h-5 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900">服务信息</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: '后端服务端口', value: '38765', color: 'text-blue-600' },
                { label: '前端服务端口', value: '39876', color: 'text-green-600' },
                { label: 'API 前缀', value: '/api', color: 'text-purple-600' },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <span className="text-gray-600">{item.label}</span>
                  <span className={`font-mono font-medium ${item.color}`}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Database className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">数据存储</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: '存储方式', value: '本地 JSON 文件' },
                { label: '用户数据', value: './data/users.json' },
                { label: '文档数据', value: './data/documents.json' },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <span className="text-gray-600">{item.label}</span>
                  <span className="font-mono text-sm text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">认证配置</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: '认证方式', value: 'JWT Token' },
                { label: 'Token 有效期', value: '24 小时' },
                { label: '密码加密', value: 'bcrypt' },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <span className="text-gray-600">{item.label}</span>
                  <span className="text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <FileText className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900">功能特性</h3>
            </div>
            <div className="space-y-2">
              {[
                '语义向量检索 (基于余弦相似度)',
                '多格式文档解析 (PDF, Excel, 代码)',
                '细粒度权限控制',
                '文档生命周期管理',
                '相关文档智能推荐',
                '私有化本地存储',
              ].map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2"
                >
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-gray-700 text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Info className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">API 接口列表</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">方法</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">路径</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">描述</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">认证</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { method: 'POST', path: '/api/auth/login', desc: '用户登录', auth: '否' },
                  { method: 'POST', path: '/api/auth/register', desc: '用户注册', auth: '否' },
                  { method: 'GET', path: '/api/auth/me', desc: '获取当前用户', auth: '是' },
                  { method: 'GET', path: '/api/auth/users', desc: '获取所有用户', auth: '管理员' },
                  { method: 'GET', path: '/api/documents', desc: '获取文档列表', auth: '是' },
                  { method: 'GET', path: '/api/documents/:id', desc: '获取文档详情', auth: '是' },
                  { method: 'POST', path: '/api/documents', desc: '创建文档', auth: '是' },
                  { method: 'POST', path: '/api/documents/upload', desc: '上传文件', auth: '是' },
                  { method: 'GET', path: '/api/documents/search', desc: '语义搜索', auth: '是' },
                  { method: 'GET', path: '/api/documents/:id/related', desc: '相关文档', auth: '是' },
                  { method: 'PUT', path: '/api/documents/:id', desc: '更新文档', auth: '是' },
                  { method: 'PUT', path: '/api/documents/:id/lifecycle', desc: '更新状态', auth: '是' },
                  { method: 'PUT', path: '/api/documents/:id/permissions', desc: '更新权限', auth: '是' },
                  { method: 'DELETE', path: '/api/documents/:id', desc: '删除文档', auth: '是' },
                ].map((api, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-mono font-bold ${
                          api.method === 'GET'
                            ? 'bg-blue-100 text-blue-700'
                            : api.method === 'POST'
                            ? 'bg-green-100 text-green-700'
                            : api.method === 'PUT'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {api.method}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-gray-700">{api.path}</td>
                    <td className="py-3 px-4 text-gray-600">{api.desc}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          api.auth === '否'
                            ? 'bg-gray-100 text-gray-600'
                            : api.auth === '管理员'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {api.auth}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
