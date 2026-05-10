import { render } from 'solid-js/web';
import { Router, Route, A, useLocation } from '@solidjs/router';
import Dashboard from './pages/Dashboard.jsx';
import Activities from './pages/Activities.jsx';
import ActivityDetail from './pages/ActivityDetail.jsx';
import PublicRegister from './pages/PublicRegister.jsx';
import './styles.css';

const Layout = (props) => {
  const location = useLocation();
  
  return (
    <div class="app">
      <aside class="sidebar">
        <div class="logo">📊 活动运营系统</div>
        <nav class="nav">
          <A 
            href="/" 
            class={`nav-item ${location.pathname === '/' ? 'active' : ''}`}
            end
          >
            📈 统一看板
          </A>
          <A 
            href="/activities" 
            class={`nav-item ${location.pathname.startsWith('/activities') ? 'active' : ''}`}
          >
            🎯 活动管理
          </A>
        </nav>
      </aside>
      <main class="main-content">
        {props.children}
      </main>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Route path="/register/:id" component={PublicRegister} />
      <Route path="/" component={Layout}>
        <Route path="/" component={Dashboard} />
        <Route path="/activities" component={Activities} />
        <Route path="/activities/:id" component={ActivityDetail} />
      </Route>
    </Router>
  );
};

render(() => <App />, document.getElementById('root'));
