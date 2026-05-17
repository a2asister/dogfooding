import { Route, Navigate } from '@solidjs/router';
import authStore from './store/authStore';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardList from './pages/DashboardList';
import Editor from './pages/Editor';
import Preview from './pages/Preview';

function App() {
  const { authState } = authStore;

  const ProtectedRoute = (props: { children: any }) => {
    if (!authState().isAuthenticated) {
      return <Navigate href="/login" />;
    }
    return props.children;
  };

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

export default App;
