import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import {
  Plus,
  MoreHorizontal,
  Trash2,
  Edit2,
  Lock,
  FileText,
  Folder,
  Tag,
} from 'lucide-react'
import { notesApi, categoriesApi, tagsApi } from '../lib/api'
import { formatRelativeTime, extractPreview, cn } from '../lib/utils'

export default function NotesPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [filterType, setFilterType] = useState<'all' | 'category' | 'tag'>('all')
  const [filterValue, setFilterValue] = useState<number | null>(null)

  useEffect(() => {
    const categoryId = searchParams.get('category')
    const tagId = searchParams.get('tag')

    if (categoryId) {
      setFilterType('category')
      setFilterValue(parseInt(categoryId))
    } else if (tagId) {
      setFilterType('tag')
      setFilterValue(parseInt(tagId))
    } else {
      setFilterType('all')
      setFilterValue(null)
    }
  }, [searchParams])

  const { data: notes, isLoading } = useQuery(
    ['notes', filterType, filterValue],
    async () => {
      if (filterType === 'category' && filterValue) {
        const res = await notesApi.getByCategory(filterValue)
        return res.data
      }
      if (filterType === 'tag' && filterValue) {
        const res = await notesApi.getByTag(filterValue)
        return res.data
      }
      const res = await notesApi.getAll()
      return res.data
    }
  )

  const { data: categories } = useQuery('categories', () =>
    categoriesApi.getAll().then((res) => res.data)
  )

  const { data: tags } = useQuery('tags', () =>
    tagsApi.getAll().then((res) => res.data)
  )

  const deleteMutation = useMutation((id: number) => notesApi.delete(id), {
    onSuccess: () => {
      queryClient.invalidateQueries('notes')
    },
  })

  const handleCreateNote = () => {
    navigate('/notes/new')
  }

  const handleDeleteNote = (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    if (confirm('确定要删除这条笔记吗？')) {
      deleteMutation.mutate(id)
    }
  }

  const getFilterLabel = () => {
    if (filterType === 'category' && filterValue && categories) {
      const category = categories.find((c: any) => c.id === filterValue)
      return category?.name || '未知分类'
    }
    if (filterType === 'tag' && filterValue && tags) {
      const tag = tags.find((t: any) => t.id === filterValue)
      return tag?.name || '未知标签'
    }
    return '全部笔记'
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            {filterType === 'category' && <Folder className="w-6 h-6 text-primary-600" />}
            {filterType === 'tag' && <Tag className="w-6 h-6 text-primary-600" />}
            {filterType === 'all' && <FileText className="w-6 h-6 text-primary-600" />}
            {getFilterLabel()}
          </h1>
          <p className="text-slate-500 mt-1">
            共 {notes?.length || 0} 条笔记
          </p>
        </div>

        <button
          onClick={handleCreateNote}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg',
            'bg-primary-600 text-white hover:bg-primary-700',
            'transition-colors font-medium'
          )}
        >
          <Plus className="w-4 h-4" />
          新建笔记
        </button>
      </div>

      {!notes || notes.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-700 mb-2">暂无笔记</h3>
          <p className="text-slate-500 mb-6">开始记录您的想法和灵感吧</p>
          <button
            onClick={handleCreateNote}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-lg',
              'bg-primary-600 text-white hover:bg-primary-700',
              'transition-colors font-medium'
            )}
          >
            <Plus className="w-4 h-4" />
            创建第一条笔记
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note: any) => (
            <Link
              key={note.id}
              to={`/notes/${note.id}`}
              className={cn(
                'group bg-white rounded-xl p-5 border border-slate-200',
                'hover:border-primary-300 hover:shadow-md transition-all',
                'cursor-pointer relative'
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-slate-800 line-clamp-1 flex-1 pr-2">
                  {note.title || '无标题'}
                </h3>
                <div className="flex items-center gap-1">
                  {note.isEncrypted && (
                    <Lock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  )}
                  <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                      }}
                      className="p-1 hover:bg-slate-100 rounded"
                    >
                      <MoreHorizontal className="w-4 h-4 text-slate-400" />
                    </button>
                    <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 min-w-[120px] z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/notes/${note.id}`)
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <Edit2 className="w-4 h-4" />
                        编辑
                      </button>
                      <button
                        onClick={(e) => handleDeleteNote(e, note.id)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-sm text-slate-600 line-clamp-3 mb-4">
                {note.content ? extractPreview(note.content, 150) : '暂无内容'}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {note.category && (
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs"
                      style={{ backgroundColor: `${note.category.color}20`, color: note.category.color }}
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: note.category.color }}
                      />
                      {note.category.name}
                    </span>
                  )}
                  {note.tags && note.tags.slice(0, 2).map((tag: any) => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs"
                    >
                      {tag.name}
                    </span>
                  ))}
                  {note.tags && note.tags.length > 2 && (
                    <span className="text-xs text-slate-400">
                      +{note.tags.length - 2}
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-400">
                  {formatRelativeTime(note.updatedAt || note.createdAt)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
