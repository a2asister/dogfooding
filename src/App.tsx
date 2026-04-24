import { useState, useEffect, useCallback, useMemo } from 'react';
import Scene3D from './components/Scene3D';
import InfoPanel from './components/InfoPanel';
import Timeline from './components/Timeline';
import CitySearch from './components/CitySearch';
import LoadingScreen from './components/LoadingScreen';
import type { City, WeatherData, SunMoonData, TimeMode, WeatherType } from './types';
import { getTimeInTimezone, getWeatherTypeFromCondition } from './utils/timeUtils';
import './styles/global.css';

const DEFAULT_CITY: City = {
  name: '北京',
  country: '中国',
  latitude: 39.9042,
  longitude: 116.4074,
  timezone: 'Asia/Shanghai',
};

const DEFAULT_WEATHER: WeatherData = {
  temperature: 22,
  weather: '晴',
  humidity: 45,
  windSpeed: 3.2,
  icon: '☀️',
  weatherType: 'sunny',
};

const DEFAULT_SUN_MOON: SunMoonData = {
  sunrise: '05:32',
  sunset: '19:15',
  dayLength: 13.72,
  nightLength: 10.28,
};

const weatherIcons: Record<string, string> = {
  '晴': '☀️',
  '多云': '⛅',
  '阴': '☁️',
  '小雨': '🌧️',
  '中雨': '🌧️',
  '大雨': '🌧️',
  '雷阵雨': '⛈️',
  '小雪': '🌨️',
  '中雪': '🌨️',
  '大雪': '🌨️',
  '雾': '🌫️',
  '霾': '🌫️',
};

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [city, setCity] = useState<City>(DEFAULT_CITY);
  const [weather, setWeather] = useState<WeatherData>(DEFAULT_WEATHER);
  const [sunMoon, setSunMoon] = useState<SunMoonData>(DEFAULT_SUN_MOON);
  const [timeMode, setTimeMode] = useState<TimeMode>('auto');
  const [manualTime, setManualTime] = useState<number>(12);
  const [, setCurrentTime] = useState<Date>(new Date());

  const currentDisplayTime = useMemo(() => {
    if (timeMode === 'auto') {
      try {
        return getTimeInTimezone(city.timezone);
      } catch {
        const now = new Date();
        return now.getHours() + now.getMinutes() / 60;
      }
    }
    return manualTime;
  }, [timeMode, manualTime, city.timezone]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (timeMode !== 'auto') return;

    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, [timeMode]);

  const handleCitySelect = useCallback((newCity: City) => {
    setCity(newCity);
    setIsLoading(true);

    setTimeout(() => {      
      const dayLength = 12 + Math.sin((new Date().getMonth() + 1) / 12 * Math.PI * 2) * 2;
      const nightLength = 24 - dayLength;
      
      const sunriseHour = 6 - (dayLength - 12) / 4;
      const sunsetHour = 18 + (dayLength - 12) / 4;
      
      const formatTime = (hour: number) => {
        const h = Math.floor(hour);
        const m = Math.floor((hour - h) * 60);
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      };

      const weatherConditions: { condition: string; type: WeatherType }[] = [
        { condition: '晴', type: 'sunny' },
        { condition: '多云', type: 'cloudy' },
        { condition: '阴', type: 'overcast' },
        { condition: '小雨', type: 'rainy' },
      ];
      const randomWeather = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
      const weatherType = getWeatherTypeFromCondition(randomWeather.condition);

      setSunMoon({
        sunrise: formatTime(sunriseHour),
        sunset: formatTime(sunsetHour),
        dayLength,
        nightLength,
      });

      setWeather({
        temperature: Math.floor(15 + Math.random() * 20),
        weather: randomWeather.condition,
        humidity: Math.floor(30 + Math.random() * 50),
        windSpeed: Math.round((1 + Math.random() * 8) * 10) / 10,
        icon: weatherIcons[randomWeather.condition] || '☀️',
        weatherType,
      });

      setIsLoading(false);
    }, 800);
  }, []);

  const handleRefresh = useCallback(() => {
    handleCitySelect(city);
  }, [city, handleCitySelect]);

  const handleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.log('全屏请求失败:', err);
      });
    } else {
      document.exitFullscreen();
    }
  }, []);

  const handleTimeModeChange = useCallback((mode: TimeMode) => {
    setTimeMode(mode);
    if (mode === 'manual') {
      const now = new Date();
      setManualTime(now.getHours() + now.getMinutes() / 60);
    }
  }, []);

  const handleTimeChange = useCallback((time: number) => {
    setManualTime(time);
  }, []);

  if (isLoading) {
    return <LoadingScreen message="正在加载三维场景..." />;
  }

  return (
    <div className="app-container">
      <Scene3D
        timeMode={timeMode}
        manualTime={manualTime}
        sunrise={sunMoon.sunrise}
        sunset={sunMoon.sunset}
        weatherType={weather.weatherType}
        timezone={city.timezone}
      />
      
      <div className="app-ui">
        <CitySearch
          currentCity={city}
          onCitySelect={handleCitySelect}
        />
        
        <InfoPanel
          city={city}
          weather={weather}
          sunMoon={sunMoon}
          timeMode={timeMode}
          currentTime={currentDisplayTime}
          onTimeModeChange={handleTimeModeChange}
          onRefresh={handleRefresh}
          onFullscreen={handleFullscreen}
        />
        
        {timeMode === 'manual' && (
          <Timeline
            currentTime={manualTime}
            onTimeChange={handleTimeChange}
            sunrise={sunMoon.sunrise}
            sunset={sunMoon.sunset}
          />
        )}
      </div>
    </div>
  );
}

export default App
