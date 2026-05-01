import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FileText,
  FileSpreadsheet,
  FileCode,
  File,
  ArrowLeft,
  Edit3,
  Trash2,
  Eye,
  Clock,
  Tag,
  Shield,
  History,
  Share2,
  Loader2,
  Check,
  X,
  User,
  Settings,
  Plus,
  ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Document, User as UserType } from '@/types';
import { documentApi, authApi } from '@/services/api';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';

const DocumentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser, isAdmin } = useAuth();
  const [document, setDocument] = useState<Document | null>(null);
  const [relatedDocs, setRelatedDocs] = useState<Document[]>([]);
  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSavingPermissions, setIsSavingPermissions] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'history' | 'permissions'>('content');
  const [editMode, setEditMode] = useState(false);
  const [selectedReadPermissions, setSelectedReadPermissions] = useState<string[]>([]);
  const [selectedWritePermissions, setSelectedWritePermissions] = useState<string[]>([]);
  const [availableUsers, setAvailableUsers] = useState<UserType[]>([]);

  useEffect(() => {
    if (id) {
      fetchDocument(id);
      fetchRelatedDocs(id);
      fetchAllUsers();
    }
  }, [id]);

  useEffect(() => {
    if (document && allUsers.length > 0) {
      setSelectedReadPermissions([...document.readPermissions]);
      setSelectedWritePermissions([...document.writePermissions]);
      
      const currentUserInRead = allUsers.find(u => document.readPermissions.includes(u.id));
      const currentUserInWrite = allUsers.find(u => document.writePermissions.includes(u.id));
      
      setAvailableUsers([
        { id: 'admin', username: '管理员角色', role: 'admin', permissions: [], createdAt: '' },
        { id: 'user', username: '普通用户角色', role: 'user', permissions: [], createdAt: '' },
        ...allUsers
      ]);
    }
  }, [document, allUsers]);

  const fetchDocument = async (docId: string) => {
    try {
      const data = await documentApi.getById(docId);
      setDocument(data);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || '获取文档失败';
      toast.error(errorMessage);
      if (error.response?.status === 404) {
        navigate('/documents');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRelatedDocs = async (docId: string) => {
    try {
      const data = await documentApi.getRelated(docId);
      setRelatedDocs(data);
    } catch (error) {
      console.error('获取相关文档失败:', error);
    }
  };

  const fetchAllUsers = async () => {
    try {
      if (isAdmin) {
        const data = await authApi.getAllUsers();
        setAllUsers(data);
      }
    } catch (error) {
      console.error('获取用户列表失败:', error);
    }
  };

  const handleDelete = async () => {
    if (!document) return;
    setIsDeleting(true);
    try {
      await documentApi.delete(document.id);
      toast.success('文档已删除');
      navigate('/documents');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || '删除失败';
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async (status: Document['lifecycle']['status']) => {
    if (!document) return;
    try {
      const updated = await documentApi.updateLifecycle(document.id, status);
      setDocument(updated);
      toast.success('状态已更新');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || '更新状态失败';
      toast.error(errorMessage);
    }
  };

  const handleSavePermissions = async () => {
    if (!document) return;
    setIsSavingPermissions(true);
    try {
      const updated = await documentApi.updatePermissions(
        document.id,
        selectedReadPermissions,
        selectedWritePermissions
      );
      setDocument(updated);
      setEditMode(false);
      toast.success('权限已更新');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || '更新权限失败';
      toast.error(errorMessage);
    } finally {
      setIsSavingPermissions(false);
    }
  };

  const toggleReadPermission = (userId: string) => {
    setSelectedReadPermissions(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      }
      return [...prev, userId];
    });
  };

  const toggleWritePermission = (userId: string) => {
    setSelectedWritePermissions(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      }
      return [...prev, userId];
    });
  };

  const canEditPermissions = () => {
    if (!document || !currentUser) return false;
    if (isAdmin) return true;
    if (document.ownerId === currentUser.id) return true;
    return false;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-6 h-6 text-red-500" />;
      case 'excel':
        return <FileSpreadsheet className="w-6 h-6 text-green-500" />;
      case 'code':
        return <FileCode className="w-6 h-6 text-blue-500" />;
      default:
        return <File className="w-6 h-6 text-gray-500" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      pdf: 'PDF 文档',
      excel: 'Excel 表格',
      code: '代码文件',
      text: '文本文件',
    };
    return labels[type] || type.toUpperCase();
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: '草稿',
      review: '审核中',
      published: '已发布',
      archived: '已归档',
    };
    return labels[status] || status;
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-700',
      review: 'bg-yellow-100 text-yellow-700',
      published: 'bg-green-100 text-green-700',
      archived: 'bg-blue-100 text-blue-700',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status] || styles.draft}`}>
        {getStatusLabel(status)}
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN');
  };

  const getUserDisplay = (userId: string) => {
    if (userId === 'admin') return { username: '管理员角色', isRole: true };
    if (userId === 'user') return { username: '普通用户角色', isRole: true };
    const user = allUsers.find(u => u.id === userId);
    return { username: user?.username || userId, isRole: false };
  };

  const isRoleId = (id: string) => id === 'admin' || id === 'user';

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      </Layout>
    );
  }

  if (!document) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-64">
          <FileText className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">文档不存在</h3>
          <Link to="/documents" className="text-primary-600 hover:text-primary-700">
            返回文档列表
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/documents')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{document.title}</h1>
            <div className="flex items-center gap-3 mt-2">
              {getTypeIcon(document.type)}
              <span className="text-gray-500">{getTypeLabel(document.type)}</span>
              {getStatusBadge(document.lifecycle.status)}
              <span className="text-sm text-gray-400">
                版本 v{document.lifecycle.version}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to={`/documents/${document.id}/edit`}
              className="btn-secondary flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              <span>编辑</span>
            </Link>
            <button
              onClick={() => setDeleteConfirm(true)}
              className="btn-danger flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>删除</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              {[
                { key: 'content', label: '内容', icon: Eye },
                { key: 'history', label: '历史', icon: History },
                { key: 'permissions', label: '权限', icon: Shield },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.key
                      ? 'bg-white text-primary-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="card">
              {activeTab === 'content' && (
                <div>
                  <div className="prose max-w-none">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono bg-gray-50 p-4 rounded-lg overflow-auto max-h-[600px]">
                      {document.content}
                    </pre>
                  </div>
                </div>
              )}

              {activeTab === 'history' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-primary-50 rounded-lg">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <Clock className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">版本 v{document.lifecycle.version}</p>
                      <p className="text-sm text-gray-500">当前版本</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[
                      {
                        label: '创建时间',
                        value: formatDate(document.lifecycle.createdAt),
                        icon: FileText,
                      },
                      {
                        label: '最后更新',
                        value: formatDate(document.lifecycle.updatedAt),
                        icon: Edit3,
                      },
                      {
                        label: '发布时间',
                        value: document.lifecycle.publishedAt
                          ? formatDate(document.lifecycle.publishedAt)
                          : '未发布',
                        icon: Share2,
                      },
                      {
                        label: '归档时间',
                        value: document.lifecycle.archivedAt
                          ? formatDate(document.lifecycle.archivedAt)
                          : '未归档',
                        icon: File,
                      },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-600">{item.label}</span>
                        </div>
                        <span className="text-sm text-gray-900 font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-3">快速切换状态</h3>
                    <div className="flex flex-wrap gap-2">
                      {(['draft', 'review', 'published', 'archived'] as const).map(
                        (status) => (
                          <button
                            key={status}
                            onClick={() => handleStatusChange(status)}
                            disabled={document.lifecycle.status === status}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              document.lifecycle.status === status
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                : 'btn-secondary'
                            }`}
                          >
                            {status === 'draft'
                              ? '设为草稿'
                              : status === 'review'
                              ? '提交审核'
                              : status === 'published'
                              ? '发布文档'
                              : '归档文档'}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'permissions' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-primary-600" />
                      <span>权限设置</span>
                    </h3>
                    {canEditPermissions() && !editMode && (
                      <button
                        onClick={() => setEditMode(true)}
                        className="btn-secondary flex items-center gap-2 text-sm"
                      >
                        <Settings className="w-4 h-4" />
                        <span>编辑权限</span>
                      </button>
                    )}
                  </div>

                  {!editMode ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                          <Eye className="w-4 h-4 text-green-600" />
                          <span>读取权限</span>
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {document.readPermissions.length === 0 ? (
                            <span className="text-gray-400 text-sm">无读取权限设置</span>
                          ) : (
                            document.readPermissions.map((perm, index) => {
                              const userInfo = getUserDisplay(perm);
                              return (
                                <span
                                  key={index}
                                  className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
                                    userInfo.isRole
                                      ? 'bg-purple-100 text-purple-700'
                                      : 'bg-green-100 text-green-700'
                                  }`}
                                >
                                  {userInfo.isRole ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                                  <span>{userInfo.username}</span>
                                </span>
                              );
                            })
                          )}
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                          <Edit3 className="w-4 h-4 text-blue-600" />
                          <span>写入权限</span>
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {document.writePermissions.length === 0 ? (
                            <span className="text-gray-400 text-sm">无写入权限设置</span>
                          ) : (
                            document.writePermissions.map((perm, index) => {
                              const userInfo = getUserDisplay(perm);
                              return (
                                <span
                                  key={index}
                                  className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
                                    userInfo.isRole
                                      ? 'bg-purple-100 text-purple-700'
                                      : 'bg-blue-100 text-blue-700'
                                  }`}
                                >
                                  {userInfo.isRole ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                                  <span>{userInfo.username}</span>
                                </span>
                              );
                            })
                          )}
                        </div>
                      </div>

                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <h4 className="font-medium text-yellow-800 mb-2">权限说明</h4>
                        <ul className="text-sm text-yellow-700 space-y-1">
                          <li>• <strong>角色权限</strong>: 授予该角色的所有用户相应权限</li>
                          <li>• <strong>用户权限</strong>: 仅授予特定用户相应权限</li>
                          <li>• <strong>读取权限</strong>: 可以查看文档内容</li>
                          <li>• <strong>写入权限</strong>: 可以修改文档内容和设置</li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-700">
                          选择可以读取和写入此文档的用户或角色。拥有写入权限的用户也自动拥有读取权限。
                        </p>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                          <Eye className="w-4 h-4 text-green-600" />
                          <span>读取权限</span>
                        </h4>
                        <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-2">
                          {availableUsers.map((user) => (
                            <label
                              key={user.id}
                              className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={selectedReadPermissions.includes(user.id)}
                                onChange={() => toggleReadPermission(user.id)}
                                className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                              />
                              <div className="flex items-center gap-2">
                                {isRoleId(user.id) ? (
                                  <Shield className="w-4 h-4 text-purple-600" />
                                ) : (
                                  <User className="w-4 h-4 text-gray-400" />
                                )}
                                <span className="text-gray-700">{user.username}</span>
                                {isRoleId(user.id) && (
                                  <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                                    角色
                                  </span>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                          <Edit3 className="w-4 h-4 text-blue-600" />
                          <span>写入权限</span>
                        </h4>
                        <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-2">
                          {availableUsers.map((user) => (
                            <label
                              key={user.id}
                              className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={selectedWritePermissions.includes(user.id)}
                                onChange={() => toggleWritePermission(user.id)}
                                className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                              />
                              <div className="flex items-center gap-2">
                                {isRoleId(user.id) ? (
                                  <Shield className="w-4 h-4 text-purple-600" />
                                ) : (
                                  <User className="w-4 h-4 text-gray-400" />
                                )}
                                <span className="text-gray-700">{user.username}</span>
                                {isRoleId(user.id) && (
                                  <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                                    角色
                                  </span>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                        <button
                          onClick={() => {
                            setEditMode(false);
                            setSelectedReadPermissions([...document.readPermissions]);
                            setSelectedWritePermissions([...document.writePermissions]);
                          }}
                          className="btn-secondary flex items-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          <span>取消</span>
                        </button>
                        <button
                          onClick={handleSavePermissions}
                          disabled={isSavingPermissions}
                          className="btn-primary flex items-center gap-2"
                        >
                          {isSavingPermissions ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                          <span>保存权限</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5 text-primary-600" />
                <span>标签</span>
              </h3>
              {document.tags.length === 0 ? (
                <p className="text-gray-400 text-sm">暂无标签</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {document.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Share2 className="w-5 h-5 text-primary-600" />
                <span>相关文档推荐</span>
              </h3>
              {relatedDocs.length === 0 ? (
                <div className="text-center py-6">
                  <Share2 className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">暂无相关文档</p>
                  <p className="text-gray-400 text-xs mt-1">系统会根据内容相似度自动推荐相关文档</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {relatedDocs.map((doc) => (
                    <Link
                      key={doc.id}
                      to={`/documents/${doc.id}`}
                      className="flex items-center gap-3 p-3 hover:bg-primary-50 rounded-lg transition-colors group"
                    >
                      <div className="flex-shrink-0 p-2 bg-gray-100 rounded-lg group-hover:bg-white">
                        {getTypeIcon(doc.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate group-hover:text-primary-700">
                          {doc.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">
                            {new Date(doc.lifecycle.updatedAt).toLocaleDateString('zh-CN')}
                          </span>
                          {getStatusBadge(doc.lifecycle.status)}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary-600 flex-shrink-0" />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="card bg-gradient-to-br from-primary-50 to-white">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Info className="w-5 h-5 text-primary-600" />
                <span>关于关联推荐</span>
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>系统使用向量相似度算法自动计算文档之间的内容关联度。</p>
                <ul className="space-y-1 pl-4">
                  <li>• 基于文档内容的语义分析</li>
                  <li>• 标签和关键词匹配</li>
                  <li>• 自动更新关联关系</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">确认删除</h3>
            <p className="text-gray-500 mb-6">
              确定要删除文档 "<span className="font-medium text-gray-900">{document.title}</span>" 吗？此操作不可撤销。
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(false)}
                disabled={isDeleting}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="btn-danger flex items-center gap-2"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                <span>确认删除</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

function Info({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

export default DocumentDetail;
