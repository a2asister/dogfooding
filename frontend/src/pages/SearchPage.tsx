import { useState, useEffect } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from 'react-query'
import {
  Search,
  FileText,
  Lock,
  Folder,
  Tag,
  X,
} from 'lucide-react'
import { notesApi } from '../lib/api'
import { formatRelativeTime, extractPreview, cn } from '../lib/utils'

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [hasSearched, setHasSearched] = useState(false)

  const initialQuery = searchParams.get('q') || ''

  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery)
    }
  }, [initialQuery])

  const { data: results, isLoading } = useQuery(
    ['search', searchQuery],
    async () => {
      if (!searchQuery.trim()) return []
      const res = await notesApi.search(searchQuery)
      return res.data
    },
    {
      enabled: hasSearched && searchQuery.trim().length > 0,
    }
  )

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setHasSearched(true)
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setHasSearched(false)
    navigate('/search')
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">搜索笔记</h1>

        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="输入关键词搜索笔记..."
              className={cn(
                'w-full pl-12 pr-12 py-3 text-lg border rounded-xl',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                'border-slate-200 placeholder:text-slate-400'
              )}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className={cn(
              'mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg',
              'hover:bg-primary-700 transition-colors font-medium',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            disabled={!searchQuery.trim() || isLoading}
          >
            {isLoading ? '搜索中...' : '搜索'}
          </button>
        </form>

        {!hasSearched ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-700 mb-2">搜索您的笔记</h3>
            <p className="text-slate-500">
              输入关键词来搜索笔记标题和内容
            </p>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : !results || results.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-700 mb-2">未找到结果</h3>
            <p className="text-slate-500">
              没有找到包含 "{searchQuery}" 的笔记，请尝试其他关键词
            </p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-slate-500 mb-4">
              找到 {results.length} 条包含 "{searchQuery}" 的笔记
            </p>
            <div className="space-y-3">
              {results.map((note: any) => (
                <Link
                  key={note.id}
                  to={`/notes/${note.id}`}
                  className={cn(
                    'block p-5 bg-white rounded-xl border border-slate-200',
                    'hover:border-primary-300 hover:shadow-md transition-all'
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                      {note.isEncrypted && (
                        <Lock className="w-4 h-4 text-amber-500" />
                      )}
                      {highlightText(note.title, searchQuery)}
                    </h3>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                    {note.content ? highlightText(extractPreview(note.content, 200), searchQuery) : '暂无内容'}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-3">
                      {note.category && (
                        <span className="flex items-center gap-1">
                          <Folder className="w-3 h-3" />
                          {note.category.name}
                        </span>
                      )}
                      {note.tags && note.tags.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {note.tags.slice(0, 2).map((tag: any) => (
                            <span key={tag.id}>{tag.name}</span>
                          ))}
                          {note.tags.length > 2 && <span>+{note.tags.length - 2}</span>}
                        </div>
                      )}
                    </div>
                    <span>{formatRelativeTime(note.updatedAt || note.createdAt)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function highlightText(text: string, query: string): React.ReactNode {
  if (!query) return text

  const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi')
  const parts = text.split(regex)

  return parts.map((part, index) =>
    regex.test(part) ? (
      <mark key={index} className="bg-yellow-100 text-yellow-800 px-0.5 rounded">
        {part}
      </mark>
    ) : (
      <span key={index}>{part}</span>
    )
  )
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
