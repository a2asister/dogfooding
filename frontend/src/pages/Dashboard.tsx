import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Search,
  Upload,
  Shield,
  TrendingUp,
  Clock,
  FileCode,
  FileSpreadsheet,
  File,
  ArrowRight,
} from 'lucide-react';
import { Document } from '@/types';
import { documentApi } from '@/services/api';
import Layout from '@/components/Layout';

const Dashboard: React.FC = () => {
  const [recentDocs, setRecentDocs] = useState<Document[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pdf: 0,
    excel: 0,
    code: 0,
    text: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const documents = await documentApi.getAll();
      const sorted = [...documents].sort(
        (a, b) => new Date(b.lifecycle.updatedAt).getTime() - new Date(a.lifecycle.updatedAt).getTime()
      );
      setRecentDocs(sorted.slice(0, 5));

      const typeStats = {
        total: documents.length,
        pdf: documents.filter(d => d.type === 'pdf').length,
        excel: documents.filter(d => d.type === 'excel').length,
        code: documents.filter(d => d.type === 'code').length,
        text: documents.filter(d => d.type === 'text').length,
      };
      setStats(typeStats);
    } catch (error) {
      console.error('获取数据失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'excel':
        return <FileSpreadsheet className="w-5 h-5 text-green-500" />;
      case 'code':
        return <FileCode className="w-5 h-5 text-blue-500" />;
      default:
        return <File className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-700',
      review: 'bg-yellow-100 text-yellow-700',
      published: 'bg-green-100 text-green-700',
      archived: 'bg-blue-100 text-blue-700',
    };
    const labels: Record<string, string> = {
      draft: '草稿',
      review: '审核中',
      published: '已发布',
      archived: '已归档',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.draft}`}>
        {labels[status] || status}
      </span>
    );
  };

  const quickActions = [
    { icon: Search, title: '语义检索', desc: '基于向量相似度搜索文档', path: '/search', color: 'bg-blue-500' },
    { icon: Upload, title: '上传文档', desc: '支持PDF、Excel、代码文件', path: '/upload', color: 'bg-green-500' },
    { icon: FileText, title: '文档管理', desc: '查看和管理所有文档', path: '/documents', color: 'bg-purple-500' },
    { icon: Shield, title: '权限管理', desc: '设置文档访问权限', path: '/settings', color: 'bg-orange-500' },
  ];

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">加载中...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">欢迎使用企业知识库</h1>
          <p className="text-gray-500 mt-1">通过语义检索快速找到所需信息</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: '文档总数', value: stats.total, icon: FileText, color: 'text-blue-500 bg-blue-50' },
            { label: 'PDF 文档', value: stats.pdf, icon: FileText, color: 'text-red-500 bg-red-50' },
            { label: 'Excel 文件', value: stats.excel, icon: FileSpreadsheet, color: 'text-green-500 bg-green-50' },
            { label: '代码文件', value: stats.code, icon: FileCode, color: 'text-blue-600 bg-blue-50' },
            { label: '文本文件', value: stats.text, icon: File, color: 'text-gray-500 bg-gray-50' },
          ].map((stat, index) => (
            <div key={index} className="card p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.color.split(' ')[1]}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color.split(' ')[0]}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.path}
              className="card hover:shadow-md transition-shadow duration-200 group"
            >
              <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mb-3`}>
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">
                {action.title}
              </h3>
              <p className="text-sm text-gray-500 mt-1">{action.desc}</p>
              <div className="mt-3 flex items-center text-primary-600 text-sm font-medium">
                <span>立即使用</span>
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">最近更新</h2>
              <Link to="/documents" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                查看全部
              </Link>
            </div>
            {recentDocs.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">暂无文档</p>
                <Link to="/upload" className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-2 inline-block">
                  上传第一个文档
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentDocs.map((doc) => (
                  <Link
                    key={doc.id}
                    to={`/documents/${doc.id}`}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {getTypeIcon(doc.type)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{doc.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <p className="text-xs text-gray-500">
                          {new Date(doc.lifecycle.updatedAt).toLocaleDateString('zh-CN')}
                        </p>
                        {getStatusBadge(doc.lifecycle.status)}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">平台特点</h2>
            </div>
            <div className="space-y-4">
              {[
                { title: '语义向量检索', desc: '基于文档内容语义相似度进行智能检索' },
                { title: '多格式支持', desc: '支持 PDF、Excel、代码文件等多种格式解析' },
                { title: '权限隔离', desc: '细粒度的读写权限控制，确保数据安全' },
                { title: '生命周期管理', desc: '草稿、审核、发布、归档全流程管理' },
                { title: '关联推荐', desc: '自动推荐相关文档，提升知识发现效率' },
                { title: '私有化部署', desc: '本地 JSON 存储，数据完全自主可控' },
              ].map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary-500 mt-2"></div>
                  <div>
                    <h3 className="font-medium text-gray-900">{feature.title}</h3>
                    <p className="text-sm text-gray-500">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
