import { useLocation, useNavigate } from '@solidjs/router'
import { createMemo } from 'solid-js'

const navItems = [
  { id: 'dashboard', path: '/dashboard', label: '数据概览', icon: '📊' },
  { id: 'publish', path: '/publish', label: '内容发布', icon: '✍️' },
  { id: 'review', path: '/review', label: '内容审核', icon: '🔍' },
  { id: 'distribution', path: '/distribution', label: '流量分发', icon: '🚀' },
  { id: 'engagement', path: '/engagement', label: '互动数据', icon: '💬' },
  { id: 'monetization', path: '/monetization', label: '变现数据', icon: '💰' },
  { id: 'traffic-rules', path: '/traffic-rules', label: '流量规则', icon: '⚙️' },
  { id: 'analytics', path: '/analytics', label: '数据复盘', icon: '📈' }
]

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()

  const currentPage = createMemo(() => {
    const path = location.pathname
    if (path === '/' || path === '/dashboard') return 'dashboard'
    if (path === '/publish') return 'publish'
    if (path === '/review') return 'review'
    if (path === '/distribution') return 'distribution'
    if (path === '/engagement') return 'engagement'
    if (path === '/monetization') return 'monetization'
    if (path === '/traffic-rules') return 'traffic-rules'
    if (path === '/analytics') return 'analytics'
    return 'dashboard'
  })

  return (
    <aside class="sidebar">
      <div class="sidebar-header">
        <h1>内容生态系统</h1>
        <p>Content Ecosystem</p>
      </div>
      <nav class="nav-menu">
        {navItems.map(item => (
          <a
            href={item.path}
            onClick={(e) => {
              e.preventDefault()
              navigate(item.path)
            }}
            class={`nav-item ${currentPage() === item.id ? 'active' : ''}`}
          >
            <span class="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </a>
        ))}
      </nav>
    </aside>
  )
}
