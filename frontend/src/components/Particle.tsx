import { motion } from 'framer-motion'
import styled from 'styled-components'

const ParticleContainer = styled(motion.div)`
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: radial-gradient(circle, #4facfe, #00f2fe);
  pointer-events: none;
  box-shadow: 0 0 10px rgba(79, 172, 254, 0.8);
`

interface ParticleProps {
  x: number
  y: number
}

const Particle = ({ x, y }: ParticleProps) => {
  const tx = (Math.random() - 0.5) * 200
  const ty = (Math.random() - 0.5) * 200

  return (
    <ParticleContainer
      initial={{ scale: 0, opacity: 0, x: `${x}%`, y: `${y}%` }}
      animate={{
        scale: [0, 1, 0],
        opacity: [0, 1, 0],
        x: [`${x}%`, `${x + tx / 5}%`],
        y: [`${y}%`, `${y + ty / 5}%`]
      }}
      transition={{ duration: 1.5, ease: 'easeOut' }}
    />
  )
}

export default Particle
