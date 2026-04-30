import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import RealTimeMonitoring from './pages/RealTimeMonitoring';
import PointManagement from './pages/PointManagement';
import DataRetrospective from './pages/DataRetrospective';
import DataAnalysis from './pages/DataAnalysis';
import AlertManagement from './pages/AlertManagement';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<RealTimeMonitoring />} />
          <Route path="/point-management" element={<PointManagement />} />
          <Route path="/data-retrospective" element={<DataRetrospective />} />
          <Route path="/data-analysis" element={<DataAnalysis />} />
          <Route path="/alert-management" element={<AlertManagement />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
