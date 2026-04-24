import { useState, useEffect, useRef } from 'react';
import type { City } from '../types';

interface CitySearchProps {
  onCitySelect: (city: City) => void;
  currentCity: City;
}

const DEFAULT_CITIES: City[] = [
  { name: '北京', country: '中国', latitude: 39.9042, longitude: 116.4074, timezone: 'Asia/Shanghai' },
  { name: '上海', country: '中国', latitude: 31.2304, longitude: 121.4737, timezone: 'Asia/Shanghai' },
  { name: '东京', country: '日本', latitude: 35.6762, longitude: 139.6503, timezone: 'Asia/Tokyo' },
  { name: '纽约', country: '美国', latitude: 40.7128, longitude: -74.0060, timezone: 'America/New_York' },
  { name: '伦敦', country: '英国', latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London' },
  { name: '巴黎', country: '法国', latitude: 48.8566, longitude: 2.3522, timezone: 'Europe/Paris' },
  { name: '悉尼', country: '澳大利亚', latitude: -33.8688, longitude: 151.2093, timezone: 'Australia/Sydney' },
  { name: '莫斯科', country: '俄罗斯', latitude: 55.7558, longitude: 37.6176, timezone: 'Europe/Moscow' },
];

export default function CitySearch({ onCitySelect, currentCity }: CitySearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCities, setFilteredCities] = useState<City[]>(DEFAULT_CITIES);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const filtered = DEFAULT_CITIES.filter(city =>
      city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      city.country.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCities(filtered);
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCitySelect = (city: City) => {
    onCitySelect(city);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="city-search" ref={dropdownRef}>
      <div 
        className="search-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="city-name">{currentCity.name}</span>
        <span className="dropdown-arrow">▼</span>
      </div>
      
      {isOpen && (
        <div className="search-dropdown">
          <input
            type="text"
            className="search-input"
            placeholder="搜索城市..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
          <div className="city-list">
            {filteredCities.map((city, index) => (
              <div
                key={index}
                className={`city-item ${city.name === currentCity.name ? 'active' : ''}`}
                onClick={() => handleCitySelect(city)}
              >
                <span className="city-item-name">{city.name}</span>
                <span className="city-item-country">{city.country}</span>
              </div>
            ))}
            {filteredCities.length === 0 && (
              <div className="no-results">未找到匹配的城市</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
