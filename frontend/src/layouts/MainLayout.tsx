import { Layout, Menu, Dropdown, Avatar, Badge } from 'antd'
import {
  DashboardOutlined,
  TeamOutlined,
  AppstoreOutlined,
  ProjectOutlined,
  FileTextOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined
} from '@ant-design/icons'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import { isSuperAdmin, isGroupAdmin } from '@/utils/permission'

const { Header, Sider, Content } = Layout

export default function MainLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()

  const selectedKey = location.pathname.split('/')[1] || 'dashboard'

  const menuItems = [
    { key: 'dashboard', icon: <DashboardOutlined />, label: '仪表盘' },
    { key: 'projects', icon: <ProjectOutlined />, label: '项目管理' },
    { key: 'apis', icon: <FileTextOutlined />, label: '接口管理' },
    { key: 'profile', icon: <UserOutlined />, label: '个人中心' }
  ]

  if (isGroupAdmin(user?.role)) {
    menuItems.splice(2, 0, { key: 'groups', icon: <AppstoreOutlined />, label: '分组管理' })
    menuItems.splice(1, 0, { key: 'users', icon: <TeamOutlined />, label: '用户管理' })
  }

  if (isSuperAdmin(user?.role)) {
    menuItems.splice(5, 0, { key: 'logs', icon: <FileTextOutlined />, label: '登录日志' })
  }

  const handleMenuClick = (key: string) => {
    if (key === 'apis') {
      navigate('/projects')
    } else if (key === 'logs') {
      navigate('/logs/login')
    } else {
      navigate(`/${key}`)
    }
  }

  const userMenuItems = [
    {
      key: 'profile',
      icon: <SettingOutlined />,
      label: '个人设置',
      onClick: () => navigate('/profile')
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: () => {
        logout()
        navigate('/login')
      }
    }
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header className="layout-header">
        <div className="layout-logo">API接口管理平台</div>
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <div className="layout-user">
            <Avatar size="small" src={user?.avatar} icon={<UserOutlined />} />
            <span style={{ marginLeft: 8 }}>{user?.nickname || user?.username}</span>
            <Badge
              color={user?.status === 'active' ? 'green' : 'red'}
              style={{ marginLeft: 8 }}
            />
          </div>
        </Dropdown>
      </Header>
      <Layout>
        <Sider width={200} theme="dark">
          <Menu
            mode="inline"
            theme="dark"
            selectedKeys={[selectedKey]}
            items={menuItems}
            onClick={({ key }) => handleMenuClick(key)}
            style={{ height: '100%', borderRight: 0 }}
          />
        </Sider>
        <Layout style={{ padding: '24px' }}>
          <Content className="page-container">
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  )
}
