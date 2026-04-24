import type { City, SunMoonData, WeatherData, TimeMode } from '../types';
import { formatTime } from '../utils/timeUtils';

interface InfoPanelProps {
  city: City;
  weather: WeatherData;
  sunMoon: SunMoonData;
  timeMode: TimeMode;
  currentTime: number;
  onTimeModeChange: (mode: TimeMode) => void;
  onRefresh: () => void;
  onFullscreen: () => void;
}

export default function InfoPanel({
  city,
  weather,
  sunMoon,
  timeMode,
  currentTime,
  onTimeModeChange,
  onRefresh,
  onFullscreen,
}: InfoPanelProps) {
  const formatDuration = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h}小时${m}分钟`;
  };

  return (
    <div className="app-ui">
      <div className="left-panel">
        <div className="city-info">
          <h2>{city.name}</h2>
          <p className="country">{city.country}</p>
        </div>
        <div className="current-time">
          <p className="label">当前时间</p>
          <p className="time">{formatTime(currentTime)}</p>
        </div>
        <div className="sun-moon-info">
          <div className="sun-info">
            <span className="icon">🌅</span>
            <div>
              <p className="label">日出</p>
              <p className="time">{sunMoon.sunrise}</p>
            </div>
          </div>
          <div className="moon-info">
            <span className="icon">🌇</span>
            <div>
              <p className="label">日落</p>
              <p className="time">{sunMoon.sunset}</p>
            </div>
          </div>
        </div>
        <div className="duration-info">
          <div className="day-duration">
            <p className="label">昼长</p>
            <p className="value">{formatDuration(sunMoon.dayLength)}</p>
          </div>
          <div className="night-duration">
            <p className="label">夜长</p>
            <p className="value">{formatDuration(sunMoon.nightLength)}</p>
          </div>
        </div>
      </div>

      <div className="right-panel">
        <div className="weather-main">
          <div className="weather-icon">{weather.icon}</div>
          <div className="temperature">{weather.temperature}°C</div>
        </div>
        <div className="weather-condition">{weather.weather}</div>
        <div className="weather-details">
          <div className="detail-item">
            <span className="detail-icon">💧</span>
            <div>
              <p className="detail-label">湿度</p>
              <p className="detail-value">{weather.humidity}%</p>
            </div>
          </div>
          <div className="detail-item">
            <span className="detail-icon">💨</span>
            <div>
              <p className="detail-label">风速</p>
              <p className="detail-value">{weather.windSpeed} m/s</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bottom-controls">
        <div className="mode-switch">
          <button
            className={`mode-btn ${timeMode === 'auto' ? 'active' : ''}`}
            onClick={() => onTimeModeChange('auto')}
          >
            自动
          </button>
          <button
            className={`mode-btn ${timeMode === 'manual' ? 'active' : ''}`}
            onClick={() => onTimeModeChange('manual')}
          >
            手动
          </button>
        </div>
        <div className="action-buttons">
          <button className="action-btn" onClick={onRefresh}>
            🔄 刷新
          </button>
          <button className="action-btn" onClick={onFullscreen}>
            ⛶ 全屏
          </button>
        </div>
      </div>
    </div>
  );
}
