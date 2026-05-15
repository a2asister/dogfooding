import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { motion } from 'framer-motion'
import styled from 'styled-components'
import EquationBalancer from './components/EquationBalancer'
import PracticeRecords from './components/PracticeRecords'
import Statistics from './components/Statistics'
import Navigation from './components/Navigation'

const AppContainer = styled.div`
  min-height: 100vh;
  padding: 20px;
`

const Header = styled(motion.header)`
  text-align: center;
  margin-bottom: 30px;
  padding: 20px;
  background: linear-gradient(135deg, rgba(79, 172, 254, 0.2), rgba(0, 242, 254, 0.2));
  border-radius: 20px;
  backdrop-filter: blur(10px);
`

const Title = styled.h1`
  font-size: 2.5rem;
  background: linear-gradient(90deg, #4facfe, #00f2fe, #4facfe);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: flowLight 3s ease infinite;
`

const Content = styled.main`
  max-width: 1200px;
  margin: 0 auto;
`

function App() {
  return (
    <Router>
      <AppContainer>
        <Header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Title>⚗️ 化学方程式动态推演工具</Title>
        </Header>
        <Navigation />
        <Content>
          <Routes>
            <Route path="/" element={<EquationBalancer />} />
            <Route path="/records" element={<PracticeRecords />} />
            <Route path="/statistics" element={<Statistics />} />
          </Routes>
        </Content>
      </AppContainer>
    </Router>
  )
}

export default App
