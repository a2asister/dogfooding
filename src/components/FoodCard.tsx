import { FoodItem, FoodCategory } from '../types'
import './FoodCard.css'

interface Props {
  food: FoodItem
  categoryColors: Record<FoodCategory, { bg: string; text: string }>
  onClick: () => void
  delay: number
}

function FoodCard({ food, categoryColors, onClick, delay }: Props) {
  const colors = categoryColors[food.category]

  const formatDate = (dateStr: string) => {
    const [, month, day] = dateStr.split('-')
    return `${parseInt(month)}月${parseInt(day)}日`
  }

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`star ${i < food.rating ? 'filled' : ''}`}>
        ★
      </span>
    ))
  }

  return (
    <div
      className="food-card"
      onClick={onClick}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="card-image-wrapper">
        <img
          src={food.imageUrl}
          alt={food.shopName}
          className="card-image"
          loading="lazy"
        />
        <div className="card-category-tag" style={{
          background: colors.bg,
          color: colors.text
        }}>
          {food.category}
        </div>
      </div>
      <div className="card-info">
        <div className="card-shop-name">{food.shopName}</div>
        <div className="card-meta">
          <span className="card-date">{formatDate(food.visitDate)}</span>
          <span className="card-rating">{renderStars()}</span>
        </div>
      </div>
    </div>
  )
}

export default FoodCard
