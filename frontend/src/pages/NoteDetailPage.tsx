import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from 'react-query'
import {
  ArrowLeft,
  Save,
  Trash2,
  Lock,
  Unlock,
  History,
  Check,
  X,
  Plus,
  ChevronDown,
} from 'lucide-react'
import { notesApi, noteVersionsApi, categoriesApi, tagsApi } from '../lib/api'
import { formatDateTime, debounce, cn } from '../lib/utils'

export default function NoteDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isNew = id === 'new'

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [tagIds, setTagIds] = useState<number[]>([])
  const [isEncrypted, setIsEncrypted] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [showTagDropdown, setShowTagDropdown] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [savingStatus, setSavingStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved')

  const titleRef = useRef<HTMLInputElement>(null)

  const { data: note, isLoading: isLoadingNote } = useQuery(
    ['note', id],
    async () => {
      if (isNew) return null
      const res = await notesApi.getById(parseInt(id!))
      return res.data
    },
    {
      enabled: !isNew,
    }
  )

  const { data: categories } = useQuery('categories', () =>
    categoriesApi.getAll().then((res) => res.data)
  )

  const { data: tags } = useQuery('tags', () =>
    tagsApi.getAll().then((res) => res.data)
  )

  const { data: versions } = useQuery(
    ['noteVersions', id],
    async () => {
      if (isNew) return []
      const res = await noteVersionsApi.getByNoteId(parseInt(id!))
      return res.data
    },
    {
      enabled: !isNew && showHistory,
    }
  )

  useEffect(() => {
    if (note) {
      setTitle(note.title || '')
      setContent(note.content || '')
      setCategoryId(note.categoryId || null)
      setTagIds(note.tags?.map((t: any) => t.id) || [])
      setIsEncrypted(note.isEncrypted || false)
    }
  }, [note])

  useEffect(() => {
    if (!isNew && titleRef.current) {
      titleRef.current.focus()
    }
  }, [isNew])

  const saveNote = async () => {
    if (!title.trim() && !content.trim()) {
      return
    }

    setIsSaving(true)
    setSavingStatus('saving')

    try {
      const noteData = {
        title: title.trim() || '无标题',
        content: content,
        categoryId: categoryId || undefined,
        tagIds: tagIds.length > 0 ? tagIds : undefined,
        isEncrypted,
      }

      if (isNew) {
        const res = await notesApi.create(noteData)
        navigate(`/notes/${res.data.id}`, { replace: true })
      } else {
        await notesApi.update(parseInt(id!), noteData)
      }

      setSavingStatus('saved')
      queryClient.invalidateQueries('notes')
      queryClient.invalidateQueries(['note', id])
    } catch (error) {
      console.error('保存失败:', error)
      setSavingStatus('unsaved')
    } finally {
      setIsSaving(false)
    }
  }

  const debouncedSave = debounce(saveNote, 1000)

  useEffect(() => {
    if (!isNew || title.trim() || content.trim()) {
      setSavingStatus('unsaved')
      debouncedSave()
    }
    return () => debouncedSave.cancel()
  }, [title, content, categoryId, tagIds, isEncrypted])

  const handleDelete = async () => {
    if (isNew) {
      navigate(-1)
      return
    }

    if (confirm('确定要删除这条笔记吗？')) {
      await notesApi.delete(parseInt(id!))
      queryClient.invalidateQueries('notes')
      navigate('/notes')
    }
  }

  const toggleTag = (tagId: number) => {
    if (tagIds.includes(tagId)) {
      setTagIds(tagIds.filter((id) => id !== tagId))
    } else {
      setTagIds([...tagIds, tagId])
    }
  }

  const handleSaveClick = () => {
    saveNote()
  }

  const selectedCategory = categories?.find((c: any) => c.id === categoryId)
  const selectedTags = tags?.filter((t: any) => tagIds.includes(t.id)) || []

  if (!isNew && isLoadingNote) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div className="flex items-center gap-2">
            {savingStatus === 'saving' && (
              <span className="text-sm text-amber-600 flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                保存中...
              </span>
            )}
            {savingStatus === 'saved' && (
              <span className="text-sm text-emerald-600 flex items-center gap-1">
                <Check className="w-4 h-4" />
                已保存
              </span>
            )}
            {savingStatus === 'unsaved' && !isSaving && (
              <span className="text-sm text-slate-500">未保存</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEncrypted(!isEncrypted)}
            className={cn(
              'flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors',
              isEncrypted
                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
          >
            {isEncrypted ? (
              <>
                <Lock className="w-4 h-4" />
                已加密
              </>
            ) : (
              <>
                <Unlock className="w-4 h-4" />
                未加密
              </>
            )}
          </button>

          {!isNew && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={cn(
                'flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors',
                showHistory
                  ? 'bg-primary-50 text-primary-700'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              <History className="w-4 h-4" />
              历史
            </button>
          )}

          <button
            onClick={handleSaveClick}
            disabled={isSaving}
            className="flex items-center gap-1 px-4 py-1.5 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            保存
          </button>

          <button
            onClick={handleDelete}
            className="flex items-center gap-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-sm transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="输入标题..."
              className="w-full text-3xl font-bold text-slate-800 placeholder:text-slate-300 border-none outline-none bg-transparent mb-6"
            />

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="开始记录你的想法..."
              className="w-full h-96 text-slate-700 placeholder:text-slate-300 border-none outline-none bg-transparent resize-none text-lg leading-relaxed"
            />
          </div>
        </div>

        <div className="w-64 bg-white border-l border-slate-200 p-4 overflow-y-auto">
          <div className="space-y-6">
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                分类
              </h4>
              <div className="relative">
                <button
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm hover:bg-slate-100 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    {selectedCategory ? (
                      <>
                        <div
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: selectedCategory.color }}
                        />
                        {selectedCategory.name}
                      </>
                    ) : (
                      <span className="text-slate-400">选择分类</span>
                    )}
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {showCategoryDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                    <button
                      onClick={() => {
                        setCategoryId(null)
                        setShowCategoryDropdown(false)
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
                    >
                      <X className="w-4 h-4 text-slate-400" />
                      无分类
                    </button>
                    {categories?.map((category: any) => (
                      <button
                        key={category.id}
                        onClick={() => {
                          setCategoryId(category.id)
                          setShowCategoryDropdown(false)
                        }}
                        className={cn(
                          'w-full px-3 py-2 text-left text-sm hover:bg-slate-50 flex items-center justify-between',
                          categoryId === category.id && 'bg-primary-50'
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded"
                            style={{ backgroundColor: category.color }}
                          />
                          {category.name}
                        </span>
                        {categoryId === category.id && (
                          <Check className="w-4 h-4 text-primary-600" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                标签
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tag: any) => (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs hover:bg-primary-200 transition-colors"
                  >
                    {tag.name}
                    <X className="w-3 h-3" />
                  </button>
                ))}
                <button
                  onClick={() => setShowTagDropdown(!showTagDropdown)}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs hover:bg-slate-200 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  添加标签
                </button>
              </div>

              {showTagDropdown && (
                <div className="mt-2 bg-white border border-slate-200 rounded-lg shadow-lg p-2">
                  {tags?.map((tag: any) => (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(tag.id)}
                      className={cn(
                        'w-full px-2 py-1.5 text-left text-sm rounded flex items-center justify-between transition-colors',
                        tagIds.includes(tag.id)
                          ? 'bg-primary-50 text-primary-700'
                          : 'hover:bg-slate-50 text-slate-700'
                      )}
                    >
                      {tag.name}
                      {tagIds.includes(tag.id) && (
                        <Check className="w-4 h-4" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {!isNew && note && (
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  信息
                </h4>
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex justify-between">
                    <span>创建时间</span>
                    <span className="text-slate-500">
                      {formatDateTime(note.createdAt)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>修改时间</span>
                    <span className="text-slate-500">
                      {formatDateTime(note.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {showHistory && versions && (
          <div className="w-72 bg-white border-l border-slate-200 overflow-y-auto">
            <div className="p-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">历史版本</h3>
              <p className="text-sm text-slate-500 mt-1">
                共 {versions.length} 个版本
              </p>
            </div>
            <div className="divide-y divide-slate-100">
              {versions.map((version: any, index: number) => (
                <button
                  key={version.id}
                  className="w-full p-4 text-left hover:bg-slate-50 transition-colors"
                  onClick={() => {
                    setTitle(version.title)
                    setContent(version.content)
                    setSavingStatus('unsaved')
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-800">
                      版本 {version.version}
                    </span>
                    {index === 0 && (
                      <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded">
                        当前
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {version.title}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {formatDateTime(version.createdAt)}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
