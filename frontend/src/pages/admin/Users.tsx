import { useState } from 'react'
import { useQuery } from 'react-query'
import { Search, User, Shield, CheckCircle, XCircle, Clock, Users } from 'lucide-react'
import axios from 'axios'

const AdminUsers = () => {
  const [searchKeyword, setSearchKeyword] = useState('')
  const [isAdminFilter, setIsAdminFilter] = useState<boolean | null>(null)

  const { data: usersData, isLoading } = useQuery(
    ['adminUsers', isAdminFilter],
    async () => {
      const params: Record<string, any> = {
        pageSize: 50,
      }
      const response = await axios.get('/api/admin/users', { params })
      return response.data.data
    }
  )

  const users = usersData?.items || []

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            <Users className="inline w-7 h-7 mr-2 text-primary-500" />
            用户管理
          </h1>
          <p className="mt-1 text-gray-600">
            查看和管理平台用户
          </p>
        </div>
      </div>

      <div className="card p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="搜索用户名、手机号、邮箱..."
              className="input pl-10"
            />
          </div>
          <select
            value={isAdminFilter === null ? '' : isAdminFilter ? 'admin' : 'user'}
            onChange={(e) => {
              const val = e.target.value
              setIsAdminFilter(val === '' ? null : val === 'admin')
            }}
            className="input lg:w-40"
          >
            <option value="">全部用户</option>
            <option value="admin">管理员</option>
            <option value="user">普通用户</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="card p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="card p-12 text-center">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            暂无用户
          </h3>
          <p className="text-gray-600">
            暂无用户数据
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    用户信息
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    联系方式
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    注册时间
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    最后登录
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user: any) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mr-4">
                          <User className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 flex items-center">
                            {user.username}
                            {user.is_admin && (
                              <Shield className="w-4 h-4 ml-2 text-orange-500" />
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {user.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {user.phone || '-'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user.email || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {user.is_verified ? (
                          <span className="badge badge-success flex items-center">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            已验证
                          </span>
                        ) : (
                          <span className="badge bg-gray-100 text-gray-600 flex items-center">
                            <XCircle className="w-3 h-3 mr-1" />
                            未验证
                          </span>
                        )}
                        {user.is_admin && (
                          <span className="badge bg-orange-50 text-orange-600">
                            管理员
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1 text-gray-400" />
                        {user.created_at ? formatDate(user.created_at) : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.last_login_at ? formatDate(user.last_login_at) : '从未登录'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button className="text-primary-600 hover:text-primary-900 mr-3">
                        查看详情
                      </button>
                      {user.is_admin ? (
                        <button className="text-orange-600 hover:text-orange-900">
                          取消管理员
                        </button>
                      ) : (
                        <button className="text-orange-600 hover:text-orange-900">
                          设为管理员
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminUsers
