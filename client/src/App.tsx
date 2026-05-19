import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import PatientLayout from '@/layouts/PatientLayout';
import MedicalLayout from '@/layouts/MedicalLayout';
import AdminLayout from '@/layouts/AdminLayout';

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const user = useAuthStore((state) => state.user);

  const getDefaultRoute = () => {
    if (!isAuthenticated) return '/login';
    switch (user?.role) {
      case 'patient':
        return '/patient';
      case 'doctor':
      case 'nurse':
        return '/medical';
      case 'super_admin':
      case 'hospital_admin':
      case 'finance':
      case 'pharmacist':
      case 'technician':
        return '/admin';
      default:
        return '/login';
    }
  };

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/patient/*" element={<PatientLayout />} />
      <Route path="/medical/*" element={<MedicalLayout />} />
      <Route path="/admin/*" element={<AdminLayout />} />
      <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />
      <Route path="*" element={<Navigate to={getDefaultRoute()} replace />} />
    </Routes>
  );
}

export default App;
