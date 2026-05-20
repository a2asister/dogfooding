import { Routes, Route, Link } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import ProjectList from './pages/ProjectList';
import ProjectDetail from './pages/ProjectDetail';

const { Header, Content } = Layout;

function App() {
  return (
    <Layout className="app-container">
      <Header className="app-header">
        <div className="app-logo">项目管理与任务追踪系统</div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[]}
          style={{ background: 'transparent', minWidth: 200 }}
        >
          <Menu.Item key="projects">
            <Link to="/">项目列表</Link>
          </Menu.Item>
        </Menu>
      </Header>
      <Content className="app-content">
        <Routes>
          <Route path="/" element={<ProjectList />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
        </Routes>
      </Content>
    </Layout>
  );
}

export default App;
