const DailyForecast = ({ dailyData }) => {
  return (
    <div className="forecast-section">
      <div className="forecast-title">7日预报</div>
      <div className="daily-forecast">
        {dailyData.map((item, index) => (
          <div key={index} className="daily-item">
            <div className="daily-day">{item.day}</div>
            <div className="daily-weather">{item.weather}</div>
            <div className="daily-temps">
              <span className="daily-high">{item.high}°</span>
              <span className="daily-low">{item.low}°</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DailyForecast;