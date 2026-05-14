import { Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { GameLevel } from './pages/GameLevel';
import { WrongAnswers } from './pages/WrongAnswers';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/level/:id" element={<GameLevel />} />
      <Route path="/wrong-answers" element={<WrongAnswers />} />
    </Routes>
  );
}

export default App;
