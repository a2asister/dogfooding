import { useState, useEffect, useCallback } from 'react'
import { FoodItem, Stats, FoodCategory, CATEGORIES, CATEGORY_COLORS } from './types'
import { getFoods, getStats, updateFood, deleteFood } from './api'
import StatsHeader from './components/StatsHeader'
import CategoryFilter from './components/CategoryFilter'
import MasonryGrid from './components/MasonryGrid'
import PhotoModal from './components/PhotoModal'
import './App.css'

function App() {
  const [foods, setFoods] = useState<FoodItem[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [activeCategory, setActiveCategory] = useState<FoodCategory | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<FoodItem | null>(null)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [foodsData, statsData] = await Promise.all([
        getFoods(activeCategory || undefined),
        getStats()
      ])
      setFoods(foodsData)
      setStats(statsData)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }, [activeCategory])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleCategoryChange = (category: FoodCategory | null) => {
    setActiveCategory(category)
  }

  const handlePhotoClick = (food: FoodItem) => {
    setSelectedPhoto(food)
  }

  const handleCloseModal = () => {
    setSelectedPhoto(null)
  }

  const handleUpdateFood = async (id: string, data: Partial<FoodItem>) => {
    try {
      await updateFood(id, data)
      await loadData()
      if (selectedPhoto?.id === id) {
        setSelectedPhoto(prev => prev ? { ...prev, ...data } : null)
      }
    } catch (error) {
      console.error('Failed to update food:', error)
    }
  }

  const handleDeleteFood = async (id: string) => {
    try {
      await deleteFood(id)
      setSelectedPhoto(null)
      await loadData()
    } catch (error) {
      console.error('Failed to delete food:', error)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">美食质感相册</h1>
        <p className="app-subtitle">记录每一次味蕾的邂逅</p>
      </header>

      {stats && <StatsHeader stats={stats} />}
      
      <CategoryFilter
        categories={CATEGORIES}
        categoryColors={CATEGORY_COLORS}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />

      {loading ? (
        <div className="loading">加载中...</div>
      ) : (
        <MasonryGrid
          foods={foods}
          categoryColors={CATEGORY_COLORS}
          onPhotoClick={handlePhotoClick}
        />
      )}

      {selectedPhoto && (
        <PhotoModal
          food={selectedPhoto}
          categoryColors={CATEGORY_COLORS}
          onClose={handleCloseModal}
          onUpdate={handleUpdateFood}
          onDelete={handleDeleteFood}
        />
      )}
    </div>
  )
}

export default App
