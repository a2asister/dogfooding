import { useState, useEffect, useRef } from 'react'
import { FoodItem, FoodCategory } from '../types'
import './PhotoModal.css'

interface Props {
  food: FoodItem
  categoryColors: Record<FoodCategory, { bg: string; text: string }>
  onClose: () => void
  onUpdate: (id: string, data: Partial<FoodItem>) => void
  onDelete: (id: string) => void
}

function PhotoModal({ food, categoryColors, onClose, onUpdate, onDelete }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [editNotes, setEditNotes] = useState(food.notes)
  const [editRating, setEditRating] = useState(food.rating)
  const [longPressTimer, setLongPressTimer] = useState<number | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  const colors = categoryColors[food.category]

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleLongPressStart = () => {
    if (isEditing) return
    const timer = window.setTimeout(() => {
      setIsEditing(true)
    }, 500)
    setLongPressTimer(timer)
  }

  const handleLongPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      setLongPressTimer(null)
    }
  }

  const handleSave = () => {
    onUpdate(food.id, { notes: editNotes, rating: editRating })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditNotes(food.notes)
    setEditRating(food.rating)
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (window.confirm('确定要删除这条美食记录吗？')) {
      onDelete(food.id)
    }
  }

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-')
    return `${year}年${parseInt(month)}月${parseInt(day)}日`
  }

  const renderStars = (rating: number, interactive: boolean = false) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`modal-star ${i < rating ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
        onClick={interactive ? () => setEditRating(i + 1) : undefined}
      >
        ★
      </span>
    ))
  }

  return (
    <div
      className="modal-backdrop"
      onClick={handleBackdropClick}
      ref={modalRef}
    >
      <div className="modal-container">
        <button className="modal-close" onClick={onClose}>
          ×
        </button>

        <div
          className="modal-image-wrapper"
          onMouseDown={handleLongPressStart}
          onMouseUp={handleLongPressEnd}
          onMouseLeave={handleLongPressEnd}
          onTouchStart={handleLongPressStart}
          onTouchEnd={handleLongPressEnd}
        >
          <img
            src={food.imageUrl}
            alt={food.shopName}
            className="modal-image"
          />
          {!isEditing && (
            <div className="long-press-hint">长按编辑</div>
          )}
        </div>

        <div className="modal-content">
          <div className="modal-header">
            <span
              className="modal-category"
              style={{ background: colors.bg, color: colors.text }}
            >
              {food.category}
            </span>
            <span className="modal-date">{formatDate(food.visitDate)}</span>
          </div>

          <h2 className="modal-shop-name">{food.shopName}</h2>

          <div className="modal-rating">
            {isEditing ? renderStars(editRating, true) : renderStars(food.rating)}
          </div>

          {isEditing ? (
            <div className="modal-edit">
              <textarea
                className="modal-notes-edit"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="添加美食笔记..."
                rows={3}
                autoFocus
              />
              <div className="modal-actions">
                <button className="btn btn-cancel" onClick={handleCancel}>
                  取消
                </button>
                <button className="btn btn-save" onClick={handleSave}>
                  保存
                </button>
              </div>
            </div>
          ) : (
            <div className="modal-notes">
              {food.notes || <span className="notes-placeholder">点击长按图片添加笔记</span>}
            </div>
          )}
        </div>

        {!isEditing && (
          <button className="modal-delete" onClick={handleDelete}>
            删除记录
          </button>
        )}
      </div>
    </div>
  )
}

export default PhotoModal
