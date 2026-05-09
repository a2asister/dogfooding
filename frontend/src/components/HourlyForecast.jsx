const HourlyForecast = ({ hourlyData, weatherType }) => {
  const getGradientColor = () => {
    switch (weatherType) {
      case 'sunny':
        return 'linear-gradient(180deg, #ffd89b 0%, #19547b 100%)';
      case 'rainy':
        return 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)';
      case 'cloudy':
        return 'linear-gradient(180deg, #89f7fe 0%, #66a6ff 100%)';
      case 'overcast':
        return 'linear-gradient(180deg, #a8c0ff 0%, #3f2b96 100%)';
      case 'snowy':
        return 'linear-gradient(180deg, #e0eafc 0%, #cfdef3 100%)';
      default:
        return 'linear-gradient(180deg, #ffd89b 0%, #19547b 100%)';
    }
  };

  return (
    <div className="forecast-section">
      <div className="forecast-title">24小时预报</div>
      <div className="hourly-forecast">
        {hourlyData.map((item, index) => (
          <div key={index} className="hourly-item">
            <div className="hourly-time">{item.time}</div>
            <div
              className="hourly-gradient-bar"
              style={{ background: getGradientColor() }}
            />
            <div className="hourly-temp">{item.temperature}°</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HourlyForecast;