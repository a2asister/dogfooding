import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styled from 'styled-components'
import Particle from './Particle'
import axios from 'axios'

const BalancerContainer = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 30px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
`

const InputSection = styled.div`
  margin-bottom: 30px;
`

const Label = styled.label`
  display: block;
  font-size: 1.1rem;
  margin-bottom: 10px;
  color: rgba(255, 255, 255, 0.9);
`

const EquationInput = styled.input`
  width: 100%;
  padding: 15px 20px;
  font-size: 1.2rem;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(79, 172, 254, 0.3);
  border-radius: 10px;
  color: #fff;
  outline: none;
  transition: all 0.3s ease;

  &:focus {
    border-color: #4facfe;
    box-shadow: 0 0 20px rgba(79, 172, 254, 0.3);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 20px;
  flex-wrap: wrap;
`

const ActionButton = styled(motion.button)`
  padding: 12px 30px;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s ease;

  &.primary {
    background: linear-gradient(135deg, #4facfe, #00f2fe);
    color: #fff;
  }

  &.secondary {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
`

const DisplayArea = styled.div`
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
  padding: 40px 20px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 15px;
  position: relative;
  overflow: hidden;
`

const ProgressBar = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 4px;
  background: linear-gradient(90deg, #4facfe, #00f2fe, #4facfe);
  background-size: 200% auto;
  animation: flowLight 2s ease infinite;
  transition: width 0.5s ease;
`

const Substance = styled(motion.span)`
  font-size: 1.8rem;
  font-weight: 700;
  padding: 10px 15px;
  border-radius: 10px;
  position: relative;
`

const Coefficient = styled(motion.span)`
  display: inline-block;
  font-size: 1.5rem;
  font-weight: 900;
  color: #4facfe;
  margin-right: 5px;
  min-width: 30px;
  text-align: center;
`

const PlusSign = styled.span`
  font-size: 2rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 10px;
`

const Arrow = styled(motion.span)`
  font-size: 2rem;
  color: #00f2fe;
  margin: 0 20px;
`

const HintText = styled(motion.p)`
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  font-size: 1rem;
`

const presetEquations = [
  'H2 + O2 = H2O',
  'Fe + O2 = Fe2O3',
  'Na + Cl2 = NaCl',
  'CH4 + O2 = CO2 + H2O',
  'Al + HCl = AlCl3 + H2'
]

const EquationBalancer = () => {
  const [inputEquation, setInputEquation] = useState('')
  const [displayEquation, setDisplayEquation] = useState<{
    reactants: { formula: string; coefficient: number }[]
    products: { formula: string; coefficient: number }[]
  } | null>(null)
  const [isBalancing, setIsBalancing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([])
  const [startTime, setStartTime] = useState<number | null>(null)

  const parseEquation = (equation: string) => {
    const [reactantsStr, productsStr] = equation.split('=').map(s => s.trim())
    const reactants = reactantsStr.split('+').map(s => ({
      formula: s.trim(),
      coefficient: 1
    }))
    const products = productsStr.split('+').map(s => ({
      formula: s.trim(),
      coefficient: 1
    }))
    return { reactants, products }
  }

  const balanceEquation = (equation: string) => {
    const balanced: Record<string, number> = {
      'H2 + O2 = H2O': [2, 1, 2],
      'Fe + O2 = Fe2O3': [4, 3, 2],
      'Na + Cl2 = NaCl': [2, 1, 2],
      'CH4 + O2 = CO2 + H2O': [1, 2, 1, 2],
      'Al + HCl = AlCl3 + H2': [2, 6, 2, 3]
    }

    const coefficients = balanced[equation.trim()] || [1, 1, 1, 1]
    const parsed = parseEquation(equation)

    parsed.reactants.forEach((r, i) => {
      if (coefficients[i]) r.coefficient = coefficients[i]
    })
    parsed.products.forEach((p, i) => {
      const idx = parsed.reactants.length + i
      if (coefficients[idx]) p.coefficient = coefficients[idx]
    })

    return parsed
  }

  const triggerParticles = () => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      y: Math.random() * 100
    }))
    setParticles(newParticles)
    setTimeout(() => setParticles([]), 1500)
  }

  const handleBalance = useCallback(async () => {
    if (!inputEquation.trim()) return

    setIsBalancing(true)
    setProgress(0)
    setStartTime(Date.now())
    triggerParticles()

    const parsed = parseEquation(inputEquation)
    setDisplayEquation(parsed)

    const steps = [20, 40, 60, 80, 100]
    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 400))
      setProgress(step)
      triggerParticles()
    }

    const balanced = balanceEquation(inputEquation)
    setDisplayEquation(balanced)
    setIsBalancing(false)

    const timeSpent = Math.round((Date.now() - (startTime || Date.now())) / 1000)

    try {
      await axios.post('/api/records', {
        equation: inputEquation,
        balancedEquation: balanced.reactants.map(r => `${r.coefficient}${r.formula}`).join(' + ') + 
          ' = ' + balanced.products.map(p => `${p.coefficient}${p.formula}`).join(' + '),
        isCorrect: true,
        attempts: 1,
        timeSpent
      })
    } catch (err) {
      console.error('Failed to save record:', err)
    }
  }, [inputEquation, startTime])

  const handleReset = () => {
    setInputEquation('')
    setDisplayEquation(null)
    setProgress(0)
  }

  return (
    <BalancerContainer>
      <InputSection>
        <Label>输入化学方程式（例如：H2 + O2 = H2O）</Label>
        <EquationInput
          type="text"
          value={inputEquation}
          onChange={(e) => setInputEquation(e.target.value)}
          placeholder="请输入化学方程式..."
          onKeyDown={(e) => e.key === 'Enter' && handleBalance()}
        />
        <div style={{ marginTop: '10px' }}>
          <Label style={{ fontSize: '0.9rem', opacity: 0.7 }}>快速选择：</Label>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '5px' }}>
            {presetEquations.map((eq) => (
              <button
                key={eq}
                onClick={() => setInputEquation(eq)}
                style={{
                  padding: '5px 12px',
                  background: 'rgba(79, 172, 254, 0.2)',
                  border: '1px solid rgba(79, 172, 254, 0.4)',
                  borderRadius: '15px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                {eq}
              </button>
            ))}
          </div>
        </div>
        <ButtonGroup>
          <ActionButton
            className="primary"
            onClick={handleBalance}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isBalancing}
          >
            {isBalancing ? '配平中...' : '开始配平'}
          </ActionButton>
          <ActionButton
            className="secondary"
            onClick={handleReset}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            重置
          </ActionButton>
        </ButtonGroup>
      </InputSection>

      <DisplayArea>
        <ProgressBar style={{ width: `${progress}%` }} />
        {particles.map(p => (
          <Particle key={p.id} x={p.x} y={p.y} />
        ))}

        <AnimatePresence mode="wait">
          {displayEquation ? (
            <motion.div
              key="equation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', gap: '10px' }}
            >
              {displayEquation.reactants.map((reactant, idx) => (
                <React.Fragment key={`r-${idx}`}>
                  {idx > 0 && <PlusSign>+</PlusSign>}
                  <Substance
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    style={{ background: `linear-gradient(135deg, rgba(79, 172, 254, 0.3), rgba(0, 242, 254, 0.1))` }}
                  >
                    <Coefficient
                      animate={isBalancing ? {
                        y: [0, -10, 0],
                        scale: [1, 1.3, 1],
                        transition: { duration: 0.5, repeat: Infinity }
                      } : {}}
                    >
                      {reactant.coefficient}
                    </Coefficient>
                    {reactant.formula}
                  </Substance>
                </React.Fragment>
              ))}

              <Arrow
                animate={{
                  scale: isBalancing ? [1, 1.2, 1] : 1,
                  transition: { duration: 0.5, repeat: isBalancing ? Infinity : 0 }
                }}
              >
                →
              </Arrow>

              {displayEquation.products.map((product, idx) => (
                <React.Fragment key={`p-${idx}`}>
                  {idx > 0 && <PlusSign>+</PlusSign>}
                  <Substance
                    initial={{ scale: 0.5, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ delay: displayEquation.reactants.length * 0.1 + idx * 0.15 + 0.3 }}
                    style={{ background: `linear-gradient(135deg, rgba(0, 242, 254, 0.3), rgba(79, 172, 254, 0.1))` }}
                  >
                    <Coefficient
                      animate={!isBalancing ? {
                        y: [0, -10, 0],
                        scale: [1, 1.3, 1],
                        transition: { duration: 0.5, delay: idx * 0.1 }
                      } : {}}
                    >
                      {product.coefficient}
                    </Coefficient>
                    {product.formula}
                  </Substance>
                </React.Fragment>
              ))}
            </motion.div>
          ) : (
            <HintText
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              👆 输入化学方程式并点击"开始配平"，观察动态配平动画效果
            </HintText>
          )}
        </AnimatePresence>
      </DisplayArea>
    </BalancerContainer>
  )
}

export default EquationBalancer
