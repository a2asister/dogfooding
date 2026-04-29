import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useQuery } from 'react-query'
import {
  FileText,
  Folder,
  Tag,
  Calendar,
  Plus,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import { categoriesApi, tagsApi, notesApi } from '../lib/api'
import { cn, formatMonthYear } from '../lib/utils'

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [expandedCategories, setExpandedCategories] = useState(true)
  const [expandedTags, setExpandedTags] = useState(true)
  const [expandedArchive, setExpandedArchive] = useState(true)

  const { data: categories } = useQuery('categories', () =>
    categoriesApi.getAll().then((res) => res.data)
  )

  const { data: tags } = useQuery('tags', () =>
    tagsApi.getAll().then((res) => res.data)
  )

  const { data: archive } = useQuery('archive', () =>
    notesApi.getArchive().then((res) => res.data)
  )

  const navItems = [
    {
      path: '/notes',
      label: '全部笔记',
      icon: FileText,
      active: location.pathname === '/notes',
    },
  ]

  const toggleCategory = (e: React.MouseEvent) => {
    e.preventDefault()
    setExpandedCategories(!expandedCategories)
  }

  const toggleTag = (e: React.MouseEvent) => {
    e.preventDefault()
    setExpandedTags(!expandedTags)
  }

  const toggleArchive = (e: React.MouseEvent) => {
    e.preventDefault()
    setExpandedArchive(!expandedArchive)
  }

  return (
    <aside
      className={cn(
        'w-64 bg-white border-r border-slate-200 flex flex-col',
        'hidden lg:flex',
        isOpen && 'fixed inset-y-0 left-0 z-50 flex'
      )}
    >
      <div className="h-16 flex items-center px-6 border-b border-slate-200">
        <Link to="/notes" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-slate-800">每日笔记</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                item.active
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-slate-600 hover:bg-slate-100'
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between px-3 mb-2">
            <button
              onClick={toggleCategory}
              className="flex items-center gap-1 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-700"
            >
              {expandedCategories ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
              分类
            </button>
            <Link
              to="/categories"
              className="p-1 hover:bg-slate-100 rounded"
              title="管理分类"
            >
              <Plus className="w-3 h-3 text-slate-500" />
            </Link>
          </div>

          {expandedCategories && categories && (
            <div className="space-y-0.5">
              {categories.length === 0 ? (
                <p className="px-3 py-2 text-xs text-slate-400">暂无分类</p>
              ) : (
                categories.map((category: any) => (
                  <Link
                    key={category.id}
                    to={`/notes?category=${category.id}`}
                    className={cn(
                      'flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors',
                      location.search.includes(`category=${category.id}`)
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-slate-600 hover:bg-slate-100'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="truncate">{category.name}</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between px-3 mb-2">
            <button
              onClick={toggleTag}
              className="flex items-center gap-1 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-700"
            >
              {expandedTags ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
              标签
            </button>
            <Link
              to="/tags"
              className="p-1 hover:bg-slate-100 rounded"
              title="管理标签"
            >
              <Plus className="w-3 h-3 text-slate-500" />
            </Link>
          </div>

          {expandedTags && tags && (
            <div className="flex flex-wrap gap-1.5 px-3">
              {tags.length === 0 ? (
                <p className="text-xs text-slate-400 py-2">暂无标签</p>
              ) : (
                tags.map((tag: any) => (
                  <Link
                    key={tag.id}
                    to={`/notes?tag=${tag.id}`}
                    className={cn(
                      'px-2 py-1 text-xs rounded-full transition-colors',
                      location.search.includes(`tag=${tag.id}`)
                        ? 'bg-primary-500 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    )}
                  >
                    {tag.name}
                  </Link>
                ))
              )}
            </div>
          )}
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between px-3 mb-2">
            <button
              onClick={toggleArchive}
              className="flex items-center gap-1 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-700"
            >
              {expandedArchive ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
              归档
            </button>
          </div>

          {expandedArchive && archive && (
            <div className="space-y-0.5">
              {archive.length === 0 ? (
                <p className="px-3 py-2 text-xs text-slate-400">暂无归档</p>
              ) : (
                archive.map((item: any) => (
                  <Link
                    key={`${item.year}-${item.month}`}
                    to={`/archive?year=${item.year}&month=${item.month}`}
                    className={cn(
                      'flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors',
                      'text-slate-600 hover:bg-slate-100'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{formatMonthYear(item.year, item.month)}</span>
                    </div>
                    <span className="text-xs text-slate-400">{item.count}</span>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>
      </nav>
    </aside>
  )
}
