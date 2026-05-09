const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'data', 'weatherData.json');

function readData() {
  const rawData = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(rawData);
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

app.get('/api/cities', (req, res) => {
  const data = readData();
  res.json(data.cities);
});

app.get('/api/cities/:cityId/weather', (req, res) => {
  const cityId = parseInt(req.params.cityId);
  const data = readData();
  const cityWeather = data.weatherData.find(w => w.cityId === cityId);
  
  if (!cityWeather) {
    return res.status(404).json({ error: '城市未找到' });
  }
  
  res.json(cityWeather);
});

app.post('/api/cities', (req, res) => {
  const data = readData();
  const { name, country } = req.body;
  
  const newCity = {
    id: Date.now(),
    name,
    country: country || '中国',
    isDefault: false
  };
  
  data.cities.push(newCity);
  
  const cityWeather = {
    cityId: newCity.id,
    current: {
      temperature: 20 + Math.floor(Math.random() * 15),
      feelsLike: 19 + Math.floor(Math.random() * 15),
      weather: ['晴', '多云', '阴', '小雨'][Math.floor(Math.random() * 4)],
      weatherType: ['sunny', 'cloudy', 'overcast', 'rainy'][Math.floor(Math.random() * 4)],
      description: '天气良好',
      humidity: 40 + Math.floor(Math.random() * 40),
      windSpeed: 5 + Math.floor(Math.random() * 15),
      windDirection: ['东风', '南风', '西风', '北风'][Math.floor(Math.random() * 4)],
      uvIndex: Math.floor(Math.random() * 10),
      visibility: 8 + Math.floor(Math.random() * 5),
      pressure: 1010 + Math.floor(Math.random() * 10),
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5)
    },
    hourly: generateHourlyData(),
    daily: generateDailyData(),
    indices: {
      dressing: { level: '舒适', suggestion: '建议穿薄外套或牛仔裤等服装' },
      uv: { level: '中', suggestion: '涂擦SPF15以上防晒护肤品' },
      travel: { level: '适宜', suggestion: '天气较好，适宜旅游' },
      sport: { level: '适宜', suggestion: '天气较好，适合户外运动' },
      cold: { level: '低', suggestion: '感冒几率低，适当增减衣服' }
    },
    alerts: []
  };
  
  data.weatherData.push(cityWeather);
  writeData(data);
  
  res.json({ city: newCity, weather: cityWeather });
});

function generateHourlyData() {
  const hourly = [];
  for (let i = 0; i < 24; i++) {
    hourly.push({
      time: `${i.toString().padStart(2, '0')}:00`,
      temperature: 15 + Math.floor(Math.random() * 15),
      weather: ['晴', '多云', '阴'][Math.floor(Math.random() * 3)]
    });
  }
  return hourly;
}

function generateDailyData() {
  const days = ['今天', '明天', '后天', '周四', '周五', '周六', '周日'];
  const daily = [];
  for (let i = 0; i < 7; i++) {
    daily.push({
      day: days[i],
      high: 22 + Math.floor(Math.random() * 10),
      low: 12 + Math.floor(Math.random() * 10),
      weather: ['晴', '多云', '阴', '小雨'][Math.floor(Math.random() * 4)],
      weatherType: ['sunny', 'cloudy', 'overcast', 'rainy'][Math.floor(Math.random() * 4)]
    });
  }
  return daily;
}

app.delete('/api/cities/:cityId', (req, res) => {
  const cityId = parseInt(req.params.cityId);
  const data = readData();
  
  const cityIndex = data.cities.findIndex(c => c.id === cityId);
  if (cityIndex === -1) {
    return res.status(404).json({ error: '城市未找到' });
  }
  
  if (data.cities[cityIndex].isDefault) {
    return res.status(400).json({ error: '不能删除默认城市' });
  }
  
  data.cities.splice(cityIndex, 1);
  data.weatherData = data.weatherData.filter(w => w.cityId !== cityId);
  
  writeData(data);
  res.json({ success: true });
});

app.put('/api/cities/:cityId/default', (req, res) => {
  const cityId = parseInt(req.params.cityId);
  const data = readData();
  
  data.cities.forEach(city => {
    city.isDefault = city.id === cityId;
  });
  
  writeData(data);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`天气服务器运行在 http://localhost:${PORT}`);
});