import React, { useEffect, useState } from 'react';
import {
  User,
  Shield,
  Crown,
  Clock,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { User as UserType } from '@/types';
import { authApi } from '@/services/api';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';

const Users: React.FC = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      const data = await authApi.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('获取用户列表失败:', error);
      toast.error('获取用户列表失败');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    if (role === 'admin') {
      return (
        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium flex items-center gap-1">
          <Crown className="w-3 h-3" />
          <span>管理员</span>
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium flex items-center gap-1">
        <User className="w-3 h-3" />
        <span>普通用户</span>
      </span>
    );
  };

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

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">用户管理</h1>
            <p className="text-gray-500 mt-1">管理系统用户及其权限</p>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-4 p-4 bg-primary-50 rounded-lg mb-6">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="font-medium text-primary-700">管理员提示</p>
              <p className="text-sm text-primary-600">
                您可以通过 API 注册新用户。当前系统共有 {users.length} 个用户。
              </p>
            </div>
          </div>

          {users.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">暂无用户</h3>
              <p className="text-gray-500">通过 API 注册接口添加新用户</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">用户名</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">角色</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">权限</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">创建时间</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-primary-700">
                              {user.username[0].toUpperCase()}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900">{user.username}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1">
                          {user.permissions.slice(0, 3).map((perm, index) => (
                            <span
                              key={index}
                              className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                            >
                              {perm}
                            </span>
                          ))}
                          {user.permissions.length > 3 && (
                            <span className="text-gray-400 text-xs">
                              +{user.permissions.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(user.createdAt).toLocaleString('zh-CN')}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">API 接口说明</h3>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-mono font-bold">
                  POST
                </span>
                <code className="font-mono text-sm text-gray-700">/api/auth/register</code>
              </div>
              <p className="text-sm text-gray-500 mb-2">注册新用户</p>
              <div className="bg-gray-800 rounded p-3 text-sm">
                <pre className="text-green-400 overflow-x-auto">
{`{
  "username": "newuser",
  "password": "password123",
  "role": "user"  // 可选: "user" 或 "admin"
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Users;
