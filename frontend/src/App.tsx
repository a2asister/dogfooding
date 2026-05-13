import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import Editor from './pages/Editor';
import Preview from './pages/Preview';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/editor/:id?" element={<Editor />} />
          <Route path="/preview/:id" element={<Preview />} />
        </Routes>
      </motion.div>
    </Router>
  );
}

export default App;
