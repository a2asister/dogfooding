import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import styled from 'styled-components'

const NavContainer = styled.nav`
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 30px;
  flex-wrap: wrap;
`

const StyledNavLink = styled(NavLink)`
  padding: 12px 30px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 30px;
  color: #fff;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.2);

  &:hover {
    background: rgba(79, 172, 254, 0.3);
    transform: translateY(-2px);
  }

  &.active {
    background: linear-gradient(135deg, #4facfe, #00f2fe);
    box-shadow: 0 4px 15px rgba(79, 172, 254, 0.4);
  }
`

const Navigation = () => {
  return (
    <NavContainer>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <StyledNavLink to="/">方程式配平</StyledNavLink>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <StyledNavLink to="/records">练习记录</StyledNavLink>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
      >
        <StyledNavLink to="/statistics">数据统计</StyledNavLink>
      </motion.div>
    </NavContainer>
  )
}

export default Navigation
