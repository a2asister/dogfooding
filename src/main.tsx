import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { initializeSeedData } from './data/seedData.ts'
import { useAppStore } from './store'

export function AppInitializer() {
  const setIsDataInitialized = useAppStore(state => state.setIsDataInitialized)
  const isDataInitialized = useAppStore(state => state.isDataInitialized)

  useEffect(() => {
    const initData = async () => {
      try {
        await initializeSeedData()
        setIsDataInitialized(true)
        console.log('Application initialized successfully')
      } catch (error) {
        console.error('Failed to initialize application:', error)
      }
    }

    if (!isDataInitialized) {
      initData()
    }
  }, [isDataInitialized, setIsDataInitialized])

  return <App />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AppInitializer />
    </BrowserRouter>
  </StrictMode>,
)
