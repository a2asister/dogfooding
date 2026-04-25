import { useEffect } from 'react';
import { Navigate, Outlet, useRoutes } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { initializeData } from './data/initialData';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import DepartmentManagement from './pages/admin/DepartmentManagement';
import DoctorManagement from './pages/admin/DoctorManagement';
import MedicationManagement from './pages/admin/MedicationManagement';
import EquipmentManagement from './pages/admin/EquipmentManagement';
import OperationLogs from './pages/admin/OperationLogs';
import MedicalDashboard from './pages/medical/Dashboard';
import PatientList from './pages/medical/PatientList';
import AppointmentList from './pages/medical/AppointmentList';
import MedicalRecordPage from './pages/medical/MedicalRecordPage';
import PrescriptionPage from './pages/medical/PrescriptionPage';
import LabTestPage from './pages/medical/LabTestPage';
import ImagingPage from './pages/medical/ImagingPage';
import InpatientPage from './pages/medical/InpatientPage';
import NursingPage from './pages/medical/NursingPage';
import InfectionControlPage from './pages/medical/InfectionControlPage';
import ChargeDashboard from './pages/charge/Dashboard';
import OrderManagement from './pages/charge/OrderManagement';
import InventoryManagement from './pages/charge/InventoryManagement';
import PharmacyPage from './pages/charge/PharmacyPage';
import ReportPage from './pages/charge/ReportPage';
import PatientDashboard from './pages/patient/Dashboard';
import MyAppointments from './pages/patient/MyAppointments';
import MyRecords from './pages/patient/MyRecords';
import MyOrders from './pages/patient/MyOrders';
import AdminLayout from './layouts/AdminLayout';
import MedicalLayout from './layouts/MedicalLayout';
import ChargeLayout from './layouts/ChargeLayout';
import PatientLayout from './layouts/PatientLayout';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function RoleRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: string[];
}) {
  const { currentUser, isAuthenticated } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (currentUser && allowedRoles.includes(currentUser.role)) {
    return <>{children}</>;
  }
  return <Navigate to="/login" replace />;
}

function RedirectByRole() {
  const { currentUser, isAuthenticated } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  switch (currentUser?.role) {
    case 'admin':
      return <Navigate to="/admin/dashboard" replace />;
    case 'medical':
      return <Navigate to="/medical/dashboard" replace />;
    case 'charge':
      return <Navigate to="/charge/dashboard" replace />;
    case 'patient':
      return <Navigate to="/patient/dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}

export default function App() {
  useEffect(() => {
    initializeData();
  }, []);

  const routes = useRoutes([
    {
      path: '/login',
      element: <Login />,
    },
    {
      path: '/',
      element: <RedirectByRole />,
    },
    {
      path: '/admin',
      element: (
        <RoleRoute allowedRoles={['admin']}>
          <AdminLayout />
        </RoleRoute>
      ),
      children: [
        { index: true, element: <Navigate to="dashboard" replace /> },
        { path: 'dashboard', element: <AdminDashboard /> },
        { path: 'users', element: <UserManagement /> },
        { path: 'departments', element: <DepartmentManagement /> },
        { path: 'doctors', element: <DoctorManagement /> },
        { path: 'medications', element: <MedicationManagement /> },
        { path: 'equipment', element: <EquipmentManagement /> },
        { path: 'logs', element: <OperationLogs /> },
      ],
    },
    {
      path: '/medical',
      element: (
        <RoleRoute allowedRoles={['medical']}>
          <MedicalLayout />
        </RoleRoute>
      ),
      children: [
        { index: true, element: <Navigate to="dashboard" replace /> },
        { path: 'dashboard', element: <MedicalDashboard /> },
        { path: 'patients', element: <PatientList /> },
        { path: 'appointments', element: <AppointmentList /> },
        { path: 'medical-records', element: <MedicalRecordPage /> },
        { path: 'prescriptions', element: <PrescriptionPage /> },
        { path: 'lab-tests', element: <LabTestPage /> },
        { path: 'imaging', element: <ImagingPage /> },
        { path: 'inpatient', element: <InpatientPage /> },
        { path: 'nursing', element: <NursingPage /> },
        { path: 'infection-control', element: <InfectionControlPage /> },
      ],
    },
    {
      path: '/charge',
      element: (
        <RoleRoute allowedRoles={['charge']}>
          <ChargeLayout />
        </RoleRoute>
      ),
      children: [
        { index: true, element: <Navigate to="dashboard" replace /> },
        { path: 'dashboard', element: <ChargeDashboard /> },
        { path: 'orders', element: <OrderManagement /> },
        { path: 'inventory', element: <InventoryManagement /> },
        { path: 'pharmacy', element: <PharmacyPage /> },
        { path: 'reports', element: <ReportPage /> },
      ],
    },
    {
      path: '/patient',
      element: (
        <RoleRoute allowedRoles={['patient']}>
          <PatientLayout />
        </RoleRoute>
      ),
      children: [
        { index: true, element: <Navigate to="dashboard" replace /> },
        { path: 'dashboard', element: <PatientDashboard /> },
        { path: 'appointments', element: <MyAppointments /> },
        { path: 'records', element: <MyRecords /> },
        { path: 'orders', element: <MyOrders /> },
      ],
    },
  ]);

  return routes;
}
