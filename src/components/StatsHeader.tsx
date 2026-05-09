import { Stats } from '../types'
import './StatsHeader.css'

interface Props {
  stats: Stats
}

function StatsHeader({ stats }: Props) {
  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-')
    return `${year}年${parseInt(month)}月`
  }

  const getCurrentMonthStr = () => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  }

  return (
    <div className="stats-header">
      <div className="stats-card stats-main">
        <div className="stats-value">{stats.currentMonth}</div>
        <div className="stats-label">{formatMonth(getCurrentMonthStr())}探店</div>
      </div>
      
      <div className="stats-card">
        <div className="stats-value">{stats.total}</div>
        <div className="stats-label">累计记录</div>
      </div>
    </div>
  )
}

export default StatsHeader
