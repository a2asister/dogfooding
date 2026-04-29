import { useState, useEffect } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from 'react-query'
import {
  Calendar,
  FileText,
  Lock,
  Folder,
  Tag,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react'
import { notesApi } from '../lib/api'
import { formatRelativeTime, extractPreview, formatMonthYear, cn } from '../lib/utils'
import { startOfMonth, endOfMonth, format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

export default function ArchivePage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null)

  const year = searchParams.get('year')
  const month = searchParams.get('month')

  useEffect(() => {
    if (year) {
      setSelectedYear(parseInt(year))
    }
    if (month) {
      setSelectedMonth(parseInt(month))
    }
  }, [year, month])

  const { data: archiveSummary, isLoading: isLoadingSummary } = useQuery(
    'archiveSummary',
    async () => {
      const res = await notesApi.getArchive()
      return res.data
    }
  )

  const { data: monthNotes, isLoading: isLoadingNotes } = useQuery(
    ['archiveNotes', selectedYear, selectedMonth],
    async () => {
      if (!selectedYear || !selectedMonth) return []

      const startDate = startOfMonth(new Date(selectedYear, selectedMonth - 1))
      const endDate = endOfMonth(new Date(selectedYear, selectedMonth - 1))

      const res = await notesApi.getByDateRange(
        format(startDate, 'yyyy-MM-dd'),
        format(endDate, 'yyyy-MM-dd')
      )
      return res.data
    },
    {
      enabled: selectedYear !== null && selectedMonth !== null,
    }
  )

  const handleSelectMonth = (year: number, month: number) => {
    setSelectedYear(year)
    setSelectedMonth(month)
    navigate(`/archive?year=${year}&month=${month}`)
  }

  const handleBackToSummary = () => {
    setSelectedYear(null)
    setSelectedMonth(null)
    navigate('/archive')
  }

  // 按年份分组归档数据
  const groupedByYear = (archiveSummary || []).reduce((acc: Record<number, any[]>, item: any) => {
    if (!acc[item.year]) {
      acc[item.year] = []
    }
    acc[item.year].push(item)
    return acc
  }, {})

  const sortedYears = Object.keys(groupedByYear)
    .map(Number)
    .sort((a, b) => b - a)

  if (isLoadingSummary) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (selectedYear && selectedMonth) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={handleBackToSummary}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            返回归档
          </button>

          <h1 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary-600" />
            {formatMonthYear(selectedYear, selectedMonth)}
            <span className="text-sm font-normal text-slate-500">
              ({monthNotes?.length || 0} 条笔记)
            </span>
          </h1>

          {isLoadingNotes ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : !monthNotes || monthNotes.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-700 mb-2">暂无笔记</h3>
              <p className="text-slate-500">
                {formatMonthYear(selectedYear, selectedMonth)} 没有笔记
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {monthNotes.map((note: any) => (
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
                      {note.title || '无标题'}
                    </h3>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                    {note.content ? extractPreview(note.content, 200) : '暂无内容'}
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
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-primary-600" />
          时间归档
        </h1>

        {!archiveSummary || archiveSummary.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-700 mb-2">暂无归档</h3>
            <p className="text-slate-500">
              创建笔记后，它们将按时间自动归档
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {sortedYears.map((year) => (
              <div key={year}>
                <h2 className="text-xl font-semibold text-slate-700 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary-500" />
                  {year} 年
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {groupedByYear[year].map((item: any) => (
                    <button
                      key={`${item.year}-${item.month}`}
                      onClick={() => handleSelectMonth(item.year, item.month)}
                      className={cn(
                        'p-4 bg-white rounded-xl border border-slate-200',
                        'hover:border-primary-300 hover:shadow-md transition-all',
                        'text-left flex items-center justify-between'
                      )}
                    >
                      <div>
                        <p className="font-medium text-slate-800">
                          {formatMonthYear(item.year, item.month)}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                          {item.count} 条笔记
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
