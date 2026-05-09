import { useState, useEffect, useCallback } from 'react';
import DynamicBackground from './components/DynamicBackground';
import WeatherCard from './components/WeatherCard';
import HourlyForecast from './components/HourlyForecast';
import DailyForecast from './components/DailyForecast';
import AlertModal from './components/AlertModal';
import CitySidebar from './components/CitySidebar';

function App() {
  const [cities, setCities] = useState([]);
  const [currentCityId, setCurrentCityId] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [weatherDataMap, setWeatherDataMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  const [currentAlert, setCurrentAlert] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [touchStart, setTouchStart] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchCities = async () => {
    try {
      const response = await fetch('/api/cities');
      const data = await response.json();
      setCities(data);
      
      const defaultCity = data.find(c => c.isDefault) || data[0];
      if (defaultCity) {
        setCurrentCityId(defaultCity.id);
      }
    } catch (error) {
      console.error('获取城市列表失败:', error);
    }
  };

  const fetchWeatherData = async (cityId) => {
    try {
      const response = await fetch(`/api/cities/${cityId}/weather`);
      const data = await response.json();
      setWeatherData(data);
      setWeatherDataMap(prev => ({ ...prev, [cityId]: data }));
      setLoading(false);

      if (data.alerts && data.alerts.length > 0) {
        setTimeout(() => {
          setCurrentAlert(data.alerts[0]);
        }, 1000);
      }
    } catch (error) {
      console.error('获取天气数据失败:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
  }, []);

  useEffect(() => {
    if (currentCityId) {
      setLoading(true);
      fetchWeatherData(currentCityId);
    }
  }, [currentCityId]);

  const handleSelectCity = (cityId) => {
    setCurrentCityId(cityId);
    setShowSidebar(false);
  };

  const handleAddCity = async (cityName) => {
    try {
      const response = await fetch('/api/cities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cityName })
      });
      const data = await response.json();
      setCities(prev => [...prev, data.city]);
      setWeatherDataMap(prev => ({ ...prev, [data.city.id]: data.weather }));
    } catch (error) {
      console.error('添加城市失败:', error);
    }
  };

  const handleDeleteCity = async (cityId) => {
    if (cities.length <= 1) {
      alert('至少需要保留一个城市');
      return;
    }
    try {
      await fetch(`/api/cities/${cityId}`, { method: 'DELETE' });
      const newCities = cities.filter(c => c.id !== cityId);
      setCities(newCities);
      setWeatherDataMap(prev => {
        const newMap = { ...prev };
        delete newMap[cityId];
        return newMap;
      });
      if (cityId === currentCityId) {
        setCurrentCityId(newCities[0].id);
      }
    } catch (error) {
      console.error('删除城市失败:', error);
    }
  };

  const handleSwipeNext = useCallback(() => {
    const currentIndex = cities.findIndex(c => c.id === currentCityId);
    if (currentIndex < cities.length - 1) {
      setCurrentCityId(cities[currentIndex + 1].id);
    }
  }, [cities, currentCityId]);

  const handleSwipePrev = useCallback(() => {
    const currentIndex = cities.findIndex(c => c.id === currentCityId);
    if (currentIndex > 0) {
      setCurrentCityId(cities[currentIndex - 1].id);
    }
  }, [cities, currentCityId]);

  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (!touchStart) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleSwipeNext();
      } else {
        handleSwipePrev();
      }
    }
    setTouchStart(null);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' });
  };

  const isNightTime = () => {
    const hour = currentTime.getHours();
    return hour < 6 || hour >= 19;
  };

  const isLightBackground = () => {
    if (!weatherData) return false;
    const weatherType = weatherData.current.weatherType;
    const isNight = isNightTime();
    if (isNight) return false;
    return weatherType === 'sunny' || weatherType === 'cloudy' || weatherType === 'snowy';
  };

  const currentCity = cities.find(c => c.id === currentCityId);
  const currentIndex = cities.findIndex(c => c.id === currentCityId);

  if (loading || !weatherData) {
    return (
      <div className="app-container sunny-bg">
        <div className="content-layer" style={{ justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ fontSize: '20px', opacity: 0.7 }}>加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="app-container"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <DynamicBackground
        weatherType={weatherData.current.weatherType}
        isNight={isNightTime()}
      />

      <div className={`content-layer ${isLightBackground() ? 'dark-text' : ''}`}>
        <div className="header">
          <div className="city-info">
            <div className="city-name">{currentCity?.name || '未知城市'}</div>
            <div className="current-time">
              {formatDate(currentTime)} {formatTime(currentTime)}
            </div>
          </div>
          <div className="header-actions">
            <button className="action-btn" onClick={() => setShowSidebar(true)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </button>
          </div>
        </div>

        <div className="main-weather">
          <div className="temperature-display">
            <span className="temperature-value">{weatherData.current.temperature}</span>
            <span className="temperature-unit">°</span>
          </div>
          <div className="weather-desc">{weatherData.current.weather}</div>
          <div className="feels-like">
            体感温度 {weatherData.current.feelsLike}° · {weatherData.current.description}
          </div>
        </div>

        <div className="cards-container">
          <WeatherCard
            title="湿度"
            value={`${weatherData.current.humidity}%`}
            subtitle="空气湿度适中"
          />
          <WeatherCard
            title="风力"
            value={`${weatherData.current.windSpeed}km/h`}
            subtitle={weatherData.current.windDirection}
          />
          <WeatherCard
            title="紫外线"
            value={weatherData.indices.uv.level}
            subtitle={weatherData.indices.uv.suggestion}
          />
          <WeatherCard
            title="穿衣指数"
            value={weatherData.indices.dressing.level}
            subtitle={weatherData.indices.dressing.suggestion}
          />
          <WeatherCard
            title="出行"
            value={weatherData.indices.travel.level}
            subtitle={weatherData.indices.travel.suggestion}
          />
          <WeatherCard
            title="运动"
            value={weatherData.indices.sport.level}
            subtitle={weatherData.indices.sport.suggestion}
          />
        </div>

        <HourlyForecast
          hourlyData={weatherData.hourly}
          weatherType={weatherData.current.weatherType}
        />

        <DailyForecast dailyData={weatherData.daily} />
      </div>

      {cities.length > 1 && (
        <div className="swipe-indicator">
          {cities.map((_, index) => (
            <div
              key={index}
              className={`swipe-dot ${index === currentIndex ? 'active' : ''}`}
            />
          ))}
        </div>
      )}

      <CitySidebar
        isOpen={showSidebar}
        onClose={() => setShowSidebar(false)}
        cities={cities}
        currentCityId={currentCityId}
        onSelectCity={handleSelectCity}
        onAddCity={handleAddCity}
        onDeleteCity={handleDeleteCity}
        weatherDataMap={weatherDataMap}
      />

      <AlertModal
        alert={currentAlert}
        onClose={() => setCurrentAlert(null)}
      />
    </div>
  );
}

export default App;