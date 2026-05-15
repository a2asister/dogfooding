import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import styled from 'styled-components'
import axios from 'axios'
import type { EquationRecord } from '../types'

const RecordsContainer = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 30px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
`

const SectionTitle = styled(motion.h2)`
  font-size: 1.5rem;
  margin-bottom: 20px;
  color: #4facfe;
`

const TabContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 15px;
`

const Tab = styled.button<{ $active: boolean }>`
  padding: 10px 20px;
  background: ${props => props.$active ? 'linear-gradient(135deg, #4facfe, #00f2fe)' : 'rgba(255, 255, 255, 0.1)'};
  border: none;
  border-radius: 20px;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
`

const RecordList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-height: 500px;
  overflow-y: auto;
  padding-right: 10px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #4facfe, #00f2fe);
    border-radius: 3px;
  }
`

const RecordItem = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`

const EquationText = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 10px;
  color: #fff;
`

const BalancedText = styled.div`
  font-size: 1rem;
  color: #00f2fe;
  margin-bottom: 10px;
`

const MetaInfo = styled.div`
  display: flex;
  gap: 20px;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
  flex-wrap: wrap;
`

const StatusBadge = styled.span<{ $correct: boolean }>`
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 0.85rem;
  font-weight: 600;
  background: ${props => props.$correct ? 'rgba(0, 255, 128, 0.2)' : 'rgba(255, 100, 100, 0.2)'};
  color: ${props => props.$correct ? '#00ff80' : '#ff6464'};
`

const EmptyState = styled(motion.div)`
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 1.1rem;
`

const PracticeRecords = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'difficult'>('all')
  const [records, setRecords] = useState<EquationRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecords()
  }, [])

  const fetchRecords = async () => {
    try {
      const res = await axios.get('/api/records')
      setRecords(res.data)
    } catch (err) {
      console.error('Failed to fetch records:', err)
      setRecords([
        {
          id: 1,
          equation: 'H2 + O2 = H2O',
          balancedEquation: '2H2 + O2 = 2H2O',
          isCorrect: true,
          attempts: 1,
          timeSpent: 5,
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          equation: 'Fe + O2 = Fe2O3',
          balancedEquation: '4Fe + 3O2 = 2Fe2O3',
          isCorrect: true,
          attempts: 2,
          timeSpent: 8,
          createdAt: new Date(Date.now() - 86400000).toISOString()
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const filteredRecords = activeTab === 'difficult'
    ? records.filter(r => r.attempts > 1 || !r.isCorrect)
    : records

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <RecordsContainer>
      <SectionTitle
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        📝 练习记录
      </SectionTitle>

      <TabContainer>
        <Tab
          $active={activeTab === 'all'}
          onClick={() => setActiveTab('all')}
        >
          全部记录 ({records.length})
        </Tab>
        <Tab
          $active={activeTab === 'difficult'}
          onClick={() => setActiveTab('difficult')}
        >
          易错归档 ({records.filter(r => r.attempts > 1 || !r.isCorrect).length})
        </Tab>
      </TabContainer>

      {loading ? (
        <EmptyState>加载中...</EmptyState>
      ) : filteredRecords.length === 0 ? (
        <EmptyState
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          暂无{activeTab === 'difficult' ? '易错' : ''}记录，开始练习吧！
        </EmptyState>
      ) : (
        <RecordList>
          {filteredRecords.map((record, index) => (
            <RecordItem
              key={record.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <EquationText>{record.equation}</EquationText>
              <BalancedText>✅ 配平结果: {record.balancedEquation}</BalancedText>
              <MetaInfo>
                <StatusBadge $correct={record.isCorrect}>
                  {record.isCorrect ? '✓ 正确' : '✗ 错误'}
                </StatusBadge>
                <span>尝试次数: {record.attempts}</span>
                <span>耗时: {record.timeSpent}秒</span>
                <span>{formatDate(record.createdAt)}</span>
              </MetaInfo>
            </RecordItem>
          ))}
        </RecordList>
      )}
    </RecordsContainer>
  )
}

export default PracticeRecords
