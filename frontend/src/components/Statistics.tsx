import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import styled from 'styled-components'
import axios from 'axios'
import type { StatisticsData } from '../types'

const StatsContainer = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 30px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
`

const SectionTitle = styled(motion.h2)`
  font-size: 1.5rem;
  margin-bottom: 30px;
  color: #4facfe;
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
`

const StatCard = styled(motion.div)`
  background: linear-gradient(135deg, rgba(79, 172, 254, 0.15), rgba(0, 242, 254, 0.05));
  border-radius: 15px;
  padding: 25px;
  text-align: center;
  border: 1px solid rgba(79, 172, 254, 0.2);
`

const StatValue = styled(motion.div)`
  font-size: 2.5rem;
  font-weight: 900;
  background: linear-gradient(135deg, #4facfe, #00f2fe);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 8px;
`

const StatLabel = styled.div`
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.7);
`

const ProgressRingContainer = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 15px;
`

const ProgressRing = styled.svg`
  transform: rotate(-90deg);
`

const ProgressCircle = styled.circle<{ $progress: number }>`
  fill: none;
  stroke: url(#gradient);
  stroke-width: 8;
  stroke-linecap: round;
  stroke-dasharray: 314;
  stroke-dashoffset: ${props => 314 - (314 * props.$progress / 100)};
  transition: stroke-dashoffset 1s ease;
`

const CenterText = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
`

const SubSection = styled.div`
  margin-top: 30px;
`

const SubTitle = styled.h3`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`

const DifficultList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const DifficultItem = styled(motion.div)`
  background: rgba(255, 100, 100, 0.1);
  border: 1px solid rgba(255, 100, 100, 0.2);
  border-radius: 10px;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
`

const EquationName = styled.span`
  font-weight: 600;
  color: #fff;
`

const AttemptBadge = styled.span`
  padding: 4px 12px;
  background: rgba(255, 100, 100, 0.2);
  color: #ff6464;
  border-radius: 15px;
  font-size: 0.85rem;
  font-weight: 600;
`

const Statistics = () => {
  const [data, setData] = useState<StatisticsData | null>(null)
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    fetchStatistics()
    setTimeout(() => setAnimated(true), 300)
  }, [])

  const fetchStatistics = async () => {
    try {
      const res = await axios.get('/api/statistics')
      setData(res.data)
    } catch (err) {
      console.error('Failed to fetch statistics:', err)
      setData({
        totalAttempts: 15,
        correctCount: 12,
        accuracy: 80,
        avgTimeSpent: 6,
        difficultEquations: [
          {
            id: 1,
            equation: 'Fe + O2 = Fe2O3',
            balancedEquation: '4Fe + 3O2 = 2Fe2O3',
            isCorrect: true,
            attempts: 3,
            timeSpent: 12,
            createdAt: new Date().toISOString()
          },
          {
            id: 2,
            equation: 'Al + HCl = AlCl3 + H2',
            balancedEquation: '2Al + 6HCl = 2AlCl3 + 3H2',
            isCorrect: false,
            attempts: 4,
            timeSpent: 15,
            createdAt: new Date().toISOString()
          }
        ],
        recentRecords: []
      })
    }
  }

  if (!data) {
    return (
      <StatsContainer>
        <SectionTitle>📊 数据统计</SectionTitle>
        <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.5)' }}>
          加载中...
        </div>
      </StatsContainer>
    )
  }

  return (
    <StatsContainer>
      <SectionTitle
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        📊 数据统计
      </SectionTitle>

      <StatsGrid>
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <StatValue
            initial={{ scale: 0 }}
            animate={{ scale: animated ? 1 : 0 }}
            transition={{ duration: 0.5 }}
          >
            {data.totalAttempts}
          </StatValue>
          <StatLabel>总练习次数</StatLabel>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StatValue
            initial={{ scale: 0 }}
            animate={{ scale: animated ? 1 : 0 }}
            transition={{ duration: 0.5 }}
          >
            {data.correctCount}
          </StatValue>
          <StatLabel>正确次数</StatLabel>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <ProgressRingContainer>
            <ProgressRing width="120" height="120">
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#4facfe" />
                  <stop offset="100%" stopColor="#00f2fe" />
                </linearGradient>
              </defs>
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="8"
              />
              <ProgressCircle
                cx="60"
                cy="60"
                r="50"
                $progress={animated ? data.accuracy : 0}
              />
            </ProgressRing>
            <CenterText>{data.accuracy}%</CenterText>
          </ProgressRingContainer>
          <StatLabel>正确率</StatLabel>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <StatValue
            initial={{ scale: 0 }}
            animate={{ scale: animated ? 1 : 0 }}
            transition={{ duration: 0.5 }}
          >
            {data.avgTimeSpent}s
          </StatValue>
          <StatLabel>平均耗时</StatLabel>
        </StatCard>
      </StatsGrid>

      <SubSection>
        <SubTitle>⚠️ 易错方程式（需重点练习）</SubTitle>
        {data.difficultEquations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: 'rgba(255,255,255,0.5)' }}>
            太棒了！暂无易错方程式 🎉
          </div>
        ) : (
          <DifficultList>
            {data.difficultEquations.map((eq, index) => (
              <DifficultItem
                key={eq.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <EquationName>{eq.equation}</EquationName>
                <AttemptBadge>尝试 {eq.attempts} 次</AttemptBadge>
              </DifficultItem>
            ))}
          </DifficultList>
        )}
      </SubSection>
    </StatsContainer>
  )
}

export default Statistics
