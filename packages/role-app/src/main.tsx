import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import App from './App'
import './index.css'

let root: ReactDOM.Root | null = null

function render(props: any = {}) {
  const { container, routerBase } = props
  const rootElement = container
    ? container.querySelector('#role-app-root')
    : document.getElementById('role-app-root')

  if (rootElement) {
    root = ReactDOM.createRoot(rootElement)
    root.render(
      <React.StrictMode>
        <ConfigProvider locale={zhCN}>
          <App routerBase={routerBase || '/role'} />
        </ConfigProvider>
      </React.StrictMode>,
    )
  }
}

if (!(window as any).__POWERED_BY_QIANKUN__) {
  render()
}

export async function bootstrap() {
  console.log('role-app bootstrap')
}

export async function mount(props: any) {
  console.log('role-app mount', props)
  render(props)
}

export async function unmount(props: any) {
  console.log('role-app unmount', props)
  if (root) {
    root.unmount()
    root = null
  }
}
