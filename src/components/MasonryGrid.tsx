import { useState, useEffect } from 'react'
import { FoodItem, FoodCategory } from '../types'
import FoodCard from './FoodCard'
import './MasonryGrid.css'

interface Props {
  foods: FoodItem[]
  categoryColors: Record<FoodCategory, { bg: string; text: string }>
  onPhotoClick: (food: FoodItem) => void
}

function MasonryGrid({ foods, categoryColors, onPhotoClick }: Props) {
  const [columns, setColumns] = useState(3)

  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth
      if (width < 600) {
        setColumns(2)
      } else if (width < 1024) {
        setColumns(3)
      } else {
        setColumns(4)
      }
    }
    updateColumns()
    window.addEventListener('resize', updateColumns)
    return () => window.removeEventListener('resize', updateColumns)
  }, [])

  const columnItems: FoodItem[][] = Array.from({ length: columns }, () => [])
  foods.forEach((food, index) => {
    columnItems[index % columns].push(food)
  })

  if (foods.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon"></div>
        <p className="empty-text">暂无美食记录</p>
      </div>
    )
  }

  return (
    <div className="masonry-grid">
      {columnItems.map((column, colIndex) => (
        <div key={colIndex} className="masonry-column">
          {column.map((food, index) => (
            <FoodCard
              key={food.id}
              food={food}
              categoryColors={categoryColors}
              onClick={() => onPhotoClick(food)}
              delay={(colIndex * column.length + index) * 50}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export default MasonryGrid
