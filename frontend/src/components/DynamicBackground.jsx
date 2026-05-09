import { useEffect, useState } from 'react';

const DynamicBackground = ({ weatherType, isNight = false }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (weatherType === 'rainy') {
      const drops = [];
      for (let i = 0; i < 50; i++) {
        drops.push({
          id: i,
          left: `${Math.random() * 100}%`,
          delay: `${Math.random() * 2}s`,
          duration: `${0.8 + Math.random() * 0.8}s`
        });
      }
      setParticles(drops);
    } else if (weatherType === 'snowy') {
      const flakes = [];
      for (let i = 0; i < 40; i++) {
        flakes.push({
          id: i,
          left: `${Math.random() * 100}%`,
          delay: `${Math.random() * 5}s`,
          duration: `${6 + Math.random() * 6}s`,
          size: `${4 + Math.random() * 8}px`
        });
      }
      setParticles(flakes);
    } else if (isNight) {
      const stars = [];
      for (let i = 0; i < 80; i++) {
        stars.push({
          id: i,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          delay: `${Math.random() * 3}s`,
          size: `${1 + Math.random() * 3}px`
        });
      }
      setParticles(stars);
    } else {
      setParticles([]);
    }
  }, [weatherType, isNight]);

  const getBgClass = () => {
    if (isNight) return 'night-bg';
    switch (weatherType) {
      case 'sunny': return 'sunny-bg';
      case 'rainy': return 'rainy-bg';
      case 'cloudy': return 'cloudy-bg';
      case 'overcast': return 'overcast-bg';
      case 'snowy': return 'snowy-bg';
      default: return 'sunny-bg';
    }
  };

  const renderSpecialEffects = () => {
    if (weatherType === 'sunny') {
      return <div className="light-rays" />;
    }
    if (weatherType === 'rainy') {
      return (
        <div className="rain-drops">
          {particles.map(drop => (
            <div
              key={drop.id}
              className="rain-drop"
              style={{
                left: drop.left,
                animationDelay: drop.delay,
                animationDuration: drop.duration
              }}
            />
          ))}
        </div>
      );
    }
    if (weatherType === 'cloudy' || weatherType === 'overcast') {
      return <div className="cloud-fog" />;
    }
    if (weatherType === 'snowy') {
      return (
        <div className="snow-flakes">
          {particles.map(flake => (
            <div
              key={flake.id}
              className="snow-flake"
              style={{
                left: flake.left,
                animationDelay: flake.delay,
                animationDuration: flake.duration,
                width: flake.size,
                height: flake.size
              }}
            />
          ))}
        </div>
      );
    }
    if (isNight) {
      return (
        <div className="stars">
          {particles.map(star => (
            <div
              key={star.id}
              className="star"
              style={{
                left: star.left,
                top: star.top,
                animationDelay: star.delay,
                width: star.size,
                height: star.size
              }}
            />
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`background-layer ${getBgClass()}`}>
      {renderSpecialEffects()}
    </div>
  );
};

export default DynamicBackground;