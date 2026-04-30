import { useState } from 'react'
import { useQuery } from 'react-query'
import { FileText, Search, Clock, AlertCircle, CheckCircle, Info } from 'lucide-react'
import axios from 'axios'

type LogTypeKey = 'request' | 'operation' | 'error'
type LogColor = 'primary' | 'success' | 'danger'

interface LogType {
  key: LogTypeKey
  label: string
  icon: React.ComponentType<{ className?: string }>
  color: LogColor
}

const AdminLogs = () => {
  const [logType, setLogType] = useState<LogTypeKey>('request')
  const [searchKeyword, setSearchKeyword] = useState('')

  const { data: logsData, isLoading } = useQuery(
    ['adminLogs', logType],
    async () => {
      const response = await axios.get(`/api/admin/logs/${logType}`, {
        params: { pageSize: 50 },
      })
      return response.data.data
    }
  )

  const logs = logsData?.items || []

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const logTypes: LogType[] = [
    {
      key: 'request',
      label: '请求日志',
      icon: Info,
      color: 'primary',
    },
    {
      key: 'operation',
      label: '操作日志',
      icon: CheckCircle,
      color: 'success',
    },
    {
      key: 'error',
      label: '错误日志',
      icon: AlertCircle,
      color: 'danger',
    },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          <FileText className="inline w-7 h-7 mr-2 text-primary-500" />
          日志管理
        </h1>
        <p className="mt-1 text-gray-600">
          查看系统运行日志
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {logTypes.map((type) => {
          const Icon = type.icon
          const colorClasses = {
            primary: logType === type.key ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
            success: logType === type.key ? 'bg-success-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
            danger: logType === type.key ? 'bg-danger-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
          }
          return (
            <button
              key={type.key}
              onClick={() => setLogType(type.key)}
              className={`card p-4 text-left transition-colors ${colorClasses[type.color]}`}
            >
              <div className="flex items-center">
                <Icon className="w-6 h-6 mr-3" />
                <div>
                  <p className="font-medium">{type.label}</p>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <div className="card p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder={`搜索${logTypes.find(t => t.key === logType)?.label}...`}
            className="input pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="card p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            暂无日志
          </h3>
          <p className="text-gray-600">
            暂无{logTypes.find(t => t.key === logType)?.label}数据
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    时间
                  </th>
                  {logType === 'request' && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        方法
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        路径
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        状态码
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        响应时间
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        IP
                      </th>
                    </>
                  )}
                  {logType === 'operation' && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        操作人
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        操作类型
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        模块
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        IP
                      </th>
                    </>
                  )}
                  {logType === 'error' && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        级别
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        错误信息
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        路径
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log: any, index: number) => (
                  <tr key={log.id || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1 text-gray-400" />
                        {log.created_at ? formatDate(log.created_at) : '-'}
                      </div>
                    </td>
                    {logType === 'request' && (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`badge ${
                              log.method === 'GET'
                                ? 'bg-blue-50 text-blue-600'
                                : log.method === 'POST'
                                ? 'bg-green-50 text-green-600'
                                : log.method === 'PUT'
                                ? 'bg-yellow-50 text-yellow-600'
                                : 'bg-red-50 text-red-600'
                            }`}
                          >
                            {log.method || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                          {log.path || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`badge ${
                              (log.status_code || 0) >= 200 && (log.status_code || 0) < 300
                                ? 'badge-success'
                                : (log.status_code || 0) >= 300 && (log.status_code || 0) < 400
                                ? 'badge-primary'
                                : (log.status_code || 0) >= 400 && (log.status_code || 0) < 500
                                ? 'badge-warning'
                                : 'badge-danger'
                            }`}
                          >
                            {log.status_code || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {log.response_time !== undefined ? `${log.response_time}ms` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                          {log.ip_address || '-'}
                        </td>
                      </>
                    )}
                    {logType === 'operation' && (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.username || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.action || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {log.module || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                          {log.ip_address || '-'}
                        </td>
                      </>
                    )}
                    {logType === 'error' && (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`badge ${
                              log.level === 'error'
                                ? 'badge-danger'
                                : log.level === 'warn'
                                ? 'badge-warning'
                                : 'badge-primary'
                            }`}
                          >
                            {log.level || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-md">
                          <div className="line-clamp-2">
                            {log.message || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                          {log.request_path || '-'}
                        </td>
                      </>
                    )}
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

export default AdminLogs
