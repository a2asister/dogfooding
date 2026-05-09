import { useState } from 'react';

const CitySidebar = ({ isOpen, onClose, cities, currentCityId, onSelectCity, onAddCity, onDeleteCity, weatherDataMap }) => {
  const [newCityName, setNewCityName] = useState('');

  const handleAdd = () => {
    if (newCityName.trim()) {
      onAddCity(newCityName.trim());
      setNewCityName('');
    }
  };

  return (
    <div className={`city-sidebar ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className="city-sidebar-content" onClick={e => e.stopPropagation()}>
        <div className="city-sidebar-header">
          <div className="city-sidebar-title">城市管理</div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="city-list">
          {cities.map(city => {
            const weather = weatherDataMap[city.id];
            return (
              <div
                key={city.id}
                className={`city-item ${city.id === currentCityId ? 'active' : ''}`}
                onClick={() => onSelectCity(city.id)}
              >
                <div className="city-item-info">
                  <div className="city-item-name">{city.name}</div>
                  <div className="city-item-country">{city.country}</div>
                </div>
                {weather && (
                  <div className="city-item-temp">{weather.current.temperature}°</div>
                )}
              </div>
            );
          })}
        </div>

        <div className="add-city-section">
          <input
            type="text"
            className="add-city-input"
            placeholder="输入城市名称"
            value={newCityName}
            onChange={e => setNewCityName(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleAdd()}
          />
          <button className="add-city-btn" onClick={handleAdd}>
            添加城市
          </button>
        </div>
      </div>
    </div>
  );
};

export default CitySidebar;