import { useState, useEffect, useCallback } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import AnimatedNumber from './AnimatedNumber';
import CoinStack from './CoinStack';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface YearlyData {
  year: number;
  amount: number;
  interest: number;
}

interface CalculationResult {
  finalAmount: number;
  totalInterest: number;
  yearlyData: YearlyData[];
  planType: string;
}

const plans = [
  { id: 'conservative', name: '保守型', rate: 2.5, color: '#10b981' },
  { id: 'balanced', name: '平衡型', rate: 5.0, color: '#f59e0b' },
  { id: 'aggressive', name: '进取型', rate: 8.5, color: '#ef4444' },
];

const API_BASE = 'http://localhost:7856';

const calculateLocal = (principal: number, rate: number, years: number, planType: string): CalculationResult => {
  const yearlyData: YearlyData[] = [];
  let currentAmount = principal;

  for (let year = 1; year <= years; year++) {
    const interest = currentAmount * (rate / 100);
    currentAmount += interest;
    yearlyData.push({
      year,
      amount: Math.round(currentAmount * 100) / 100,
      interest: Math.round(interest * 100) / 100,
    });
  }

  return {
    finalAmount: Math.round(currentAmount * 100) / 100,
    totalInterest: Math.round((currentAmount - principal) * 100) / 100,
    yearlyData,
    planType,
  };
};

export default function FinanceCalculator() {
  const [principal, setPrincipal] = useState(100000);
  const [years, setYears] = useState(10);
  const [selectedPlans, setSelectedPlans] = useState<string[]>(['balanced']);
  const [results, setResults] = useState<Map<string, CalculationResult>>(new Map());
  const [isAnimating, setIsAnimating] = useState(false);

  const fetchResults = useCallback(async () => {
    setIsAnimating(true);
    const newResults = new Map<string, CalculationResult>();

    for (const plan of selectedPlans) {
      const planInfo = plans.find(p => p.id === plan);
      try {
        const response = await fetch(`${API_BASE}/api/finance/calculate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ principal, rate: 0, years, planType: plan }),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        newResults.set(plan, data);
      } catch (e) {
        console.log('Using local calculation, API failed:', e);
        if (planInfo) {
          newResults.set(plan, calculateLocal(principal, planInfo.rate, years, plan));
        }
      }
    }

    setResults(newResults);
    setTimeout(() => setIsAnimating(false), 500);
  }, [principal, years, selectedPlans]);

  useEffect(() => {
    const initialResults = new Map<string, CalculationResult>();
    for (const plan of selectedPlans) {
      const planInfo = plans.find(p => p.id === plan);
      if (planInfo) {
        initialResults.set(plan, calculateLocal(principal, planInfo.rate, years, plan));
      }
    }
    setResults(initialResults);
    fetchResults();
  }, [fetchResults]);

  const togglePlan = (planId: string) => {
    setSelectedPlans(prev => {
      if (prev.includes(planId)) {
        return prev.length > 1 ? prev.filter(p => p !== planId) : prev;
      }
      return [...prev, planId];
    });
  };

  const getChartData = () => {
    const labels = Array.from({ length: years }, (_, i) => `第${i + 1}年`);
    const datasets = selectedPlans.map(planId => {
      const plan = plans.find(p => p.id === planId);
      const result = results.get(planId);
      return {
        label: plan?.name || '',
        data: result?.yearlyData.map(d => d.amount) || [],
        borderColor: plan?.color || '',
        backgroundColor: `${plan?.color}20`,
        tension: 0.4,
        fill: true,
      };
    });
    return { labels, datasets };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1500,
      easing: 'easeInOutQuart' as const,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: { size: 14 },
          padding: 20,
        },
      },
      title: {
        display: true,
        text: '收益增长曲线',
        font: { size: 18, weight: 'bold' as const },
        padding: 20,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: function(tickValue: string | number) {
            const value = typeof tickValue === 'number' ? tickValue : parseFloat(tickValue);
            return `¥${(value / 10000).toFixed(1)}万`;
          },
        },
      },
    },
  };

  return (
    <div className="calculator">
      <h1 className="title">💰 理财计算器</h1>

      <div className="grid">
        <div className="card controls-card">
          <h2 className="card-title">投资设置</h2>

          <div className="slider-group">
            <label>
              投资本金: <span className="value"><AnimatedNumber value={principal} prefix="¥" /></span>
            </label>
            <input
              type="range"
              min="10000"
              max="1000000"
              step="10000"
              value={principal}
              onChange={(e) => setPrincipal(Number(e.target.value))}
              className="slider"
            />
            <div className="slider-labels">
              <span>¥1万</span>
              <span>¥100万</span>
            </div>
          </div>

          <div className="slider-group">
            <label>
              投资期限: <span className="value"><AnimatedNumber value={years} suffix="年" /></span>
            </label>
            <input
              type="range"
              min="1"
              max="30"
              step="1"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="slider"
            />
            <div className="slider-labels">
              <span>1年</span>
              <span>30年</span>
            </div>
          </div>

          <h3 className="plan-title">选择理财方案</h3>
          <div className="plans-grid">
            {plans.map(plan => (
              <button
                key={plan.id}
                className={`plan-button ${selectedPlans.includes(plan.id) ? 'active' : ''}`}
                onClick={() => togglePlan(plan.id)}
                style={{
                  backgroundColor: selectedPlans.includes(plan.id) ? plan.color : 'white',
                  color: selectedPlans.includes(plan.id) ? 'white' : '#333',
                  borderColor: plan.color,
                }}
              >
                <div className="plan-name">{plan.name}</div>
                <div className="plan-rate">年利率 {plan.rate}%</div>
              </button>
            ))}
          </div>
        </div>

        <div className="card chart-card">
          <div style={{ height: '400px' }}>
            <Line data={getChartData()} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="results-section">
        <h2 className="section-title">📊 收益对比</h2>
        <div className="results-grid">
          {selectedPlans.map(planId => {
            const plan = plans.find(p => p.id === planId);
            const result = results.get(planId);
            return (
              <div
                key={planId}
                className="result-card"
                style={{ borderTop: `4px solid ${plan?.color}` }}
              >
                <h3 className="result-plan-name" style={{ color: plan?.color }}>
                  {plan?.name}
                </h3>

                <div className="coin-stack-wrapper">
                  <CoinStack amount={result?.totalInterest || 0} maxAmount={1000000} />
                </div>

                <div className="result-stats">
                  <div className="stat">
                    <div className="stat-label">最终金额</div>
                    <div className="stat-value" style={{ color: plan?.color }}>
                      <AnimatedNumber value={result?.finalAmount || 0} prefix="¥" decimals={2} />
                    </div>
                  </div>
                  <div className="stat">
                    <div className="stat-label">总收益</div>
                    <div className="stat-value" style={{ color: '#10b981' }}>
                      <AnimatedNumber value={result?.totalInterest || 0} prefix="¥" decimals={2} />
                    </div>
                  </div>
                  <div className="stat">
                    <div className="stat-label">收益率</div>
                    <div className="stat-value" style={{ color: '#f59e0b' }}>
                      <AnimatedNumber
                        value={((result?.totalInterest || 0) / principal) * 100}
                        suffix="%"
                        decimals={2}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .calculator {
          min-height: 100vh;
          padding: 20px 0;
        }
        .title {
          text-align: center;
          color: white;
          font-size: 2.5rem;
          margin-bottom: 2rem;
          text-shadow: 0 2px 10px rgba(0,0,0,0.2);
        }
        .grid {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        .card {
          background: white;
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 10px 40px rgba(0,0,0,0.15);
        }
        .controls-card {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .card-title {
          font-size: 1.5rem;
          color: #333;
          margin-bottom: 0.5rem;
        }
        .slider-group {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .slider-group label {
          font-weight: 600;
          color: #555;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .value {
          color: #667eea;
          font-weight: 700;
          font-size: 1.1rem;
        }
        .slider {
          width: 100%;
          height: 10px;
          border-radius: 5px;
          background: linear-gradient(to right, #667eea, #764ba2);
          outline: none;
          -webkit-appearance: none;
          cursor: pointer;
        }
        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: white;
          border: 4px solid #667eea;
          cursor: pointer;
          box-shadow: 0 2px 10px rgba(102, 126, 234, 0.4);
          transition: transform 0.2s;
        }
        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
        }
        .slider-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          color: #888;
        }
        .plan-title {
          font-size: 1.1rem;
          color: #555;
          margin-top: 0.5rem;
        }
        .plans-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
        }
        .plan-button {
          padding: 1rem;
          border: 2px solid;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          text-align: center;
        }
        .plan-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.15);
        }
        .plan-name {
          font-weight: 700;
          font-size: 1rem;
        }
        .plan-rate {
          font-size: 0.85rem;
          opacity: 0.9;
          margin-top: 4px;
        }
        .chart-card {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .results-section {
          margin-top: 2rem;
        }
        .section-title {
          color: white;
          font-size: 1.8rem;
          margin-bottom: 1.5rem;
          text-align: center;
        }
        .results-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        .result-card {
          background: white;
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 10px 40px rgba(0,0,0,0.15);
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .result-card:hover {
          transform: translateY(-5px);
        }
        .result-plan-name {
          font-size: 1.4rem;
          font-weight: 700;
          text-align: center;
          margin-bottom: 1.5rem;
        }
        .coin-stack-wrapper {
          display: flex;
          justify-content: center;
          margin: 1.5rem 0;
          min-height: 120px;
        }
        .result-stats {
          display: grid;
          gap: 1rem;
        }
        .stat {
          background: #f8fafc;
          padding: 1rem;
          border-radius: 12px;
          text-align: center;
        }
        .stat-label {
          font-size: 0.9rem;
          color: #666;
          margin-bottom: 0.5rem;
        }
        .stat-value {
          font-size: 1.4rem;
          font-weight: 700;
        }
        @media (max-width: 968px) {
          .grid {
            grid-template-columns: 1fr;
          }
          .plans-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
