import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import {
  Tag,
  Plus,
  Trash2,
  X,
  Check,
  ArrowLeft,
} from 'lucide-react'
import { tagsApi } from '../lib/api'
import { cn } from '../lib/utils'

export default function TagPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [newName, setNewName] = useState('')

  const { data: tags, isLoading } = useQuery('tags', () =>
    tagsApi.getAll().then((res) => res.data)
  )

  const createMutation = useMutation(
    (name: string) => tagsApi.create({ name }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('tags')
        setNewName('')
      },
    }
  )

  const deleteMutation = useMutation((id: number) => tagsApi.delete(id), {
    onSuccess: () => {
      queryClient.invalidateQueries('tags')
    },
  })

  const handleCreate = () => {
    if (!newName.trim()) return
    createMutation.mutate(newName.trim())
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreate()
    }
  }

  const handleDelete = (id: number) => {
    if (confirm('确定要删除这个标签吗？')) {
      deleteMutation.mutate(id)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Tag className="w-6 h-6 text-primary-600" />
            标签管理
          </h1>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入标签名称..."
              className={cn(
                'flex-1 px-4 py-2 border rounded-lg',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                'border-slate-200 placeholder:text-slate-400'
              )}
            />
            <button
              onClick={handleCreate}
              disabled={!newName.trim() || createMutation.isLoading}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg',
                'bg-primary-600 text-white hover:bg-primary-700',
                'transition-colors font-medium',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              <Plus className="w-4 h-4" />
              添加
            </button>
          </div>
        </div>

        {!tags || tags.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Tag className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-700 mb-2">暂无标签</h3>
            <p className="text-slate-500">创建标签来更好地组织您的笔记</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {tags.map((tag: any) => (
              <div
                key={tag.id}
                className="bg-white border border-slate-200 rounded-xl p-3 hover:border-primary-300 transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-primary-500" />
                  <span className="font-medium text-slate-800 truncate">{tag.name}</span>
                </div>
                <button
                  onClick={() => handleDelete(tag.id)}
                  disabled={deleteMutation.isLoading}
                  className="p-1.5 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  title="删除标签"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
