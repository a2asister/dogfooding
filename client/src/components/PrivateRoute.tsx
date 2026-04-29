import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/store';
import type { UserRole } from '@/types';
import { Spin } from 'antd';

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const storedToken = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');

  if (!isAuthenticated && !storedToken) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    const currentUser = user || (storedUser ? JSON.parse(storedUser) : null);
    if (currentUser && currentUser.role !== requiredRole) {
      const redirectPath = {
        admin: '/admin',
        teacher: '/teacher',
        student: '/student',
      }[currentUser.role as UserRole];

      return <Navigate to={redirectPath || '/login'} replace />;
    }
  }

  if (!isAuthenticated && storedToken && storedUser) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return <>{children}</>;
};

export default PrivateRoute;
