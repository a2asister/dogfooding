import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import {
  Folder,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  ArrowLeft,
  Palette,
} from 'lucide-react'
import { categoriesApi } from '../lib/api'
import { cn } from '../lib/utils'

const DEFAULT_COLORS = [
  '#3b82f6',
  '#ef4444',
  '#22c55e',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#64748b',
]

export default function CategoryPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(DEFAULT_COLORS[0])
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState(DEFAULT_COLORS[0])

  const { data: categories, isLoading } = useQuery('categories', () =>
    categoriesApi.getAll().then((res) => res.data)
  )

  const createMutation = useMutation(
    (data: { name: string; color: string }) => categoriesApi.create(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('categories')
        setIsCreating(false)
        setNewName('')
        setNewColor(DEFAULT_COLORS[0])
      },
    }
  )

  const updateMutation = useMutation(
    ({ id, data }: { id: number; data: { name: string; color: string } }) =>
      categoriesApi.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('categories')
        setEditingId(null)
      },
    }
  )

  const deleteMutation = useMutation((id: number) => categoriesApi.delete(id), {
    onSuccess: () => {
      queryClient.invalidateQueries('categories')
    },
  })

  const handleCreate = () => {
    if (!newName.trim()) return
    createMutation.mutate({ name: newName.trim(), color: newColor })
  }

  const handleEdit = (category: any) => {
    setEditingId(category.id)
    setEditName(category.name)
    setEditColor(category.color)
  }

  const handleSaveEdit = () => {
    if (!editName.trim() || editingId === null) return
    updateMutation.mutate({ id: editingId, data: { name: editName.trim(), color: editColor } })
  }

  const handleDelete = (id: number) => {
    if (confirm('确定要删除这个分类吗？')) {
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
            <Folder className="w-6 h-6 text-primary-600" />
            分类管理
          </h1>
        </div>

        <div className="mb-6">
          {!isCreating ? (
            <button
              onClick={() => setIsCreating(true)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg',
                'bg-primary-600 text-white hover:bg-primary-700',
                'transition-colors font-medium'
              )}
            >
              <Plus className="w-4 h-4" />
              添加分类
            </button>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <h3 className="font-medium text-slate-800 mb-4">新建分类</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    分类名称
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="输入分类名称"
                    className={cn(
                      'w-full px-4 py-2 border rounded-lg',
                      'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                      'border-slate-200 placeholder:text-slate-400'
                    )}
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    选择颜色
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {DEFAULT_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setNewColor(color)}
                        className={cn(
                          'w-8 h-8 rounded-full transition-transform hover:scale-110',
                          newColor === color && 'ring-2 ring-offset-2 ring-primary-500'
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
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
                    <Check className="w-4 h-4" />
                    确认
                  </button>
                  <button
                    onClick={() => {
                      setIsCreating(false)
                      setNewName('')
                      setNewColor(DEFAULT_COLORS[0])
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    取消
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {!categories || categories.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Folder className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-700 mb-2">暂无分类</h3>
            <p className="text-slate-500">创建分类来更好地管理您的笔记</p>
          </div>
        ) : (
          <div className="space-y-2">
            {categories.map((category: any) => (
              <div
                key={category.id}
                className="bg-white border border-slate-200 rounded-xl p-4 hover:border-primary-300 transition-colors"
              >
                {editingId === category.id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className={cn(
                        'w-full px-3 py-2 border rounded-lg',
                        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                        'border-slate-200'
                      )}
                      autoFocus
                    />
                    <div className="flex flex-wrap gap-2">
                      {DEFAULT_COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() => setEditColor(color)}
                          className={cn(
                            'w-6 h-6 rounded-full transition-transform hover:scale-110',
                            editColor === color && 'ring-2 ring-offset-1 ring-primary-500'
                          )}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSaveEdit}
                        disabled={!editName.trim() || updateMutation.isLoading}
                        className={cn(
                          'flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm',
                          'bg-primary-600 text-white hover:bg-primary-700',
                          'transition-colors',
                          'disabled:opacity-50 disabled:cursor-not-allowed'
                        )}
                      >
                        <Check className="w-4 h-4" />
                        保存
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        取消
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="font-medium text-slate-800">{category.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(category)}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        title="编辑"
                      >
                        <Edit2 className="w-4 h-4 text-slate-500" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        disabled={deleteMutation.isLoading}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
