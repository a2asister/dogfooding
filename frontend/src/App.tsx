import { Routes, Route, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, PlusCircle, BarChart3, Home } from 'lucide-react';
import SurveyList from './pages/SurveyList';
import SurveyEditor from './pages/SurveyEditor';
import SurveyTake from './pages/SurveyTake';
import SurveyAnalytics from './pages/SurveyAnalytics';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <FileText className="w-8 h-8 text-primary-500" />
                <span className="font-bold text-xl text-gray-900">在线问卷系统</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-1 px-4 py-2 text-gray-700 hover:text-primary-600"
                >
                  <Home className="w-5 h-5" />
                  <span>首页</span>
                </motion.button>
              </Link>
              <Link to="/surveys/new">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                >
                  <PlusCircle className="w-5 h-5" />
                  <span>创建问卷</span>
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<SurveyList />} />
          <Route path="/surveys/new" element={<SurveyEditor />} />
          <Route path="/surveys/:id/edit" element={<SurveyEditor />} />
          <Route path="/surveys/:id/take" element={<SurveyTake />} />
          <Route path="/surveys/:id/analytics" element={<SurveyAnalytics />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
