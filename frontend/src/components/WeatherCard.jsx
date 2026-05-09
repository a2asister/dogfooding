const WeatherCard = ({ title, value, subtitle }) => {
  return (
    <div className="index-card">
      <div className="index-title">{title}</div>
      <div className="index-value">{value}</div>
      <div className="index-subtitle">{subtitle}</div>
    </div>
  );
};

export default WeatherCard;