import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { RouterProvider } from 'react-router-dom'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { initializeDatabase } from '@/db/init'
import { router } from '@/router'
import '@/styles/index.css'

dayjs.locale('zh-cn')

const App: React.FC = () => {
  useEffect(() => {
    initializeDatabase()
  }, [])

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 6,
        },
        components: {
          Layout: {
            siderBg: '#fff',
          },
          Menu: {
            darkItemBg: '#001529',
          },
        },
      }}
    >
      <RouterProvider router={router} />
    </ConfigProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
