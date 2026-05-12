import { useState, useEffect } from 'react';

interface CoinStackProps {
  amount: number;
  maxAmount: number;
}

export default function CoinStack({ amount, maxAmount }: CoinStackProps) {
  const [renderedCoins, setRenderedCoins] = useState<number[]>([]);

  useEffect(() => {
    const ratio = Math.min(amount / maxAmount, 1);
    const coinCount = Math.max(1, Math.floor(ratio * 12));

    setRenderedCoins([]);

    const delays = Array.from({ length: coinCount }, (_, i) => i * 80);

    delays.forEach((delay, index) => {
      setTimeout(() => {
        setRenderedCoins(prev => [...prev, index]);
      }, delay);
    });
  }, [amount, maxAmount]);

  return (
    <div className="coin-stack">
      {renderedCoins.map((index) => (
        <div
          key={index}
          className="coin"
          style={{
            transform: `translateY(${-index * 10}px)`,
            zIndex: renderedCoins.length - index,
            animationDelay: `${index * 0.05}s`,
          }}
        >
          <div className="coin-face">
            <span className="coin-symbol">¥</span>
          </div>
          <div className="coin-edge"></div>
        </div>
      ))}

      <style jsx>{`
        .coin-stack {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: flex-end;
          min-height: 100px;
        }
        .coin {
          position: absolute;
          animation: coinDrop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.2));
        }
        @keyframes coinDrop {
          0% {
            opacity: 0;
            transform: translateY(-100px) scale(0.5) rotate(-20deg);
          }
          50% {
            transform: translateY(10px) scale(1.1) rotate(5deg);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1) rotate(0deg);
          }
        }
        .coin-face {
          width: 70px;
          height: 14px;
          background: linear-gradient(180deg, #ffd700 0%, #ffb700 50%, #ff9500 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          border: 2px solid #cc8800;
        }
        .coin-face::before {
          content: '';
          position: absolute;
          top: 2px;
          left: 5px;
          right: 5px;
          height: 4px;
          background: linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%);
          border-radius: 50%;
        }
        .coin-symbol {
          font-size: 10px;
          font-weight: bold;
          color: #8b6914;
          text-shadow: 0 1px 0 rgba(255, 255, 255, 0.5);
        }
        .coin-edge {
          position: absolute;
          top: 100%;
          left: 5px;
          right: 5px;
          height: 6px;
          background: linear-gradient(180deg, #cc8800 0%, #996600 100%);
          border-radius: 0 0 50% 50%;
        }
      `}</style>
    </div>
  );
}
