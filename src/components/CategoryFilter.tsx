import { FoodCategory } from '../types'
import './CategoryFilter.css'

interface Props {
  categories: FoodCategory[]
  categoryColors: Record<FoodCategory, { bg: string; text: string }>
  activeCategory: FoodCategory | null
  onCategoryChange: (category: FoodCategory | null) => void
}

function CategoryFilter({ categories, categoryColors, activeCategory, onCategoryChange }: Props) {
  return (
    <div className="category-filter">
      <button
        className={`category-btn ${activeCategory === null ? 'active' : ''}`}
        onClick={() => onCategoryChange(null)}
        style={activeCategory === null ? {
          background: 'rgba(45, 45, 45, 0.9)',
          color: '#fff'
        } : undefined}
      >
        全部
      </button>
      {categories.map((category) => (
        <button
          key={category}
          className={`category-btn ${activeCategory === category ? 'active' : ''}`}
          onClick={() => onCategoryChange(activeCategory === category ? null : category)}
          style={activeCategory === category ? {
            background: categoryColors[category].text,
            color: '#fff'
          } : {
            background: categoryColors[category].bg,
            color: categoryColors[category].text
          }}
        >
          {category}
        </button>
      ))}
    </div>
  )
}

export default CategoryFilter
