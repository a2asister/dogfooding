import { Router, Route, Navigate } from '@solidjs/router';
import { render } from 'solid-js/web';
import authStore from './store/authStore';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardList from './pages/DashboardList';
import Editor from './pages/Editor';
import Preview from './pages/Preview';
import './index.css';

function ProtectedRoute(props: { children: any }) {
  const { authState } = authStore;
  if (!authState().isAuthenticated) {
    return <Navigate href="/login" />;
  }
  return props.children;
}

function App() {
  return (
    <>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route
        path="/"
        component={() => (
          <ProtectedRoute>
            <DashboardList />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/editor/:id"
        component={() => (
          <ProtectedRoute>
            <Editor />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/preview/:id"
        component={() => (
          <ProtectedRoute>
            <Preview />
          </ProtectedRoute>
        )}
      />
    </>
  );
}

render(
  () => (
    <Router root={(props) => <>{props.children}</>}>
      <App />
    </Router>
  ),
  document.getElementById('root') as HTMLElement
);
