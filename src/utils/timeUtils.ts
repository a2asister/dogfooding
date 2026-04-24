import type { SkyColors, WeatherType } from '../types';

export function parseTimeString(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours + minutes / 60;
}

export function getTimeInTimezone(timezone: string): number {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  
  const parts = formatter.formatToParts(now);
  const hour = parts.find(p => p.type === 'hour')?.value || '00';
  const minute = parts.find(p => p.type === 'minute')?.value || '00';
  
  return parseInt(hour) + parseInt(minute) / 60;
}

export function getWeatherEffectConfig(weatherType: WeatherType): {
  showClouds: boolean;
  cloudDensity: number;
  cloudOpacity: number;
  showRain: boolean;
  rainIntensity: number;
  showFog: boolean;
  fogDensity: number;
  maxLightAttenuation: number;
  minLightAttenuation: number;
  saturationFactor: number;
} {
  const configs: Record<WeatherType, ReturnType<typeof getWeatherEffectConfig>> = {
    sunny: {
      showClouds: false,
      cloudDensity: 0,
      cloudOpacity: 0,
      showRain: false,
      rainIntensity: 0,
      showFog: false,
      fogDensity: 0,
      maxLightAttenuation: 1.0,
      minLightAttenuation: 1.0,
      saturationFactor: 1.0,
    },
    cloudy: {
      showClouds: true,
      cloudDensity: 0.5,
      cloudOpacity: 0.6,
      showRain: false,
      rainIntensity: 0,
      showFog: false,
      fogDensity: 0,
      maxLightAttenuation: 0.85,
      minLightAttenuation: 0.95,
      saturationFactor: 0.85,
    },
    overcast: {
      showClouds: true,
      cloudDensity: 1.0,
      cloudOpacity: 0.8,
      showRain: false,
      rainIntensity: 0,
      showFog: false,
      fogDensity: 0,
      maxLightAttenuation: 0.7,
      minLightAttenuation: 0.9,
      saturationFactor: 0.7,
    },
    rainy: {
      showClouds: true,
      cloudDensity: 1.0,
      cloudOpacity: 0.9,
      showRain: true,
      rainIntensity: 1.0,
      showFog: false,
      fogDensity: 0,
      maxLightAttenuation: 0.6,
      minLightAttenuation: 0.85,
      saturationFactor: 0.65,
    },
    snowy: {
      showClouds: true,
      cloudDensity: 0.8,
      cloudOpacity: 0.7,
      showRain: true,
      rainIntensity: 0.5,
      showFog: false,
      fogDensity: 0,
      maxLightAttenuation: 0.75,
      minLightAttenuation: 0.92,
      saturationFactor: 0.75,
    },
    foggy: {
      showClouds: true,
      cloudDensity: 0.3,
      cloudOpacity: 0.5,
      showRain: false,
      rainIntensity: 0,
      showFog: true,
      fogDensity: 0.8,
      maxLightAttenuation: 0.65,
      minLightAttenuation: 0.88,
      saturationFactor: 0.6,
    },
  };
  
  return configs[weatherType] || configs.sunny;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(Math.max(0, Math.min(255, x))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return { h, s, l };
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

export function adjustColorForWeather(
  color: string,
  weatherConfig: { maxLightAttenuation: number; minLightAttenuation: number; saturationFactor: number },
  timeOfDay: string
): string {
  const rgb = hexToRgb(color);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  
  const isNight = timeOfDay === 'night';
  const isDuskOrDawn = timeOfDay === 'dusk' || timeOfDay === 'dawn';
  
  let lightAttenuation: number;
  if (isNight) {
    lightAttenuation = weatherConfig.minLightAttenuation;
  } else if (isDuskOrDawn) {
    lightAttenuation = (weatherConfig.maxLightAttenuation + weatherConfig.minLightAttenuation) / 2;
  } else {
    lightAttenuation = weatherConfig.maxLightAttenuation;
  }
  
  const newSaturation = hsl.s * weatherConfig.saturationFactor;
  
  let newLightness: number;
  if (isNight) {
    const nightBase = Math.max(0.05, hsl.l);
    newLightness = nightBase * lightAttenuation;
  } else if (isDuskOrDawn) {
    newLightness = hsl.l * lightAttenuation;
  } else {
    newLightness = hsl.l * lightAttenuation;
  }
  
  newLightness = Math.max(0.03, Math.min(0.97, newLightness));
  
  const newRgb = hslToRgb(hsl.h, newSaturation, newLightness);
  
  return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}

export function getWeatherTypeFromCondition(condition: string): WeatherType {
  const conditionLower = condition.toLowerCase();
  
  if (conditionLower.includes('晴')) return 'sunny';
  if (conditionLower.includes('多云') || conditionLower.includes('少云')) return 'cloudy';
  if (conditionLower.includes('阴') || conditionLower.includes('阴天')) return 'overcast';
  if (conditionLower.includes('雨') || conditionLower.includes('雷')) return 'rainy';
  if (conditionLower.includes('雪')) return 'snowy';
  if (conditionLower.includes('雾') || conditionLower.includes('霾')) return 'foggy';
  
  return 'sunny';
}

export function formatTime(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.floor((hours - h) * 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function getTimeOfDay(currentHour: number, sunriseHour: number, sunsetHour: number): string {
  const dawnStart = sunriseHour - 1;
  const dawnEnd = sunriseHour + 0.5;
  const duskStart = sunsetHour - 0.5;
  const duskEnd = sunsetHour + 1;

  if (currentHour >= dawnStart && currentHour < dawnEnd) {
    return 'dawn';
  } else if (currentHour >= dawnEnd && currentHour < duskStart) {
    return 'day';
  } else if (currentHour >= duskStart && currentHour < duskEnd) {
    return 'dusk';
  } else {
    return 'night';
  }
}

export function getSkyColors(timeOfDay: string, progress: number): SkyColors {
  const colorPalettes: Record<string, SkyColors[]> = {
    dawn: [
      { top: '#1a1a2e', bottom: '#16213e', ambientLight: '#1a1a2e', sunLight: '#ff6b35', moonLight: '#4a5568' },
      { top: '#2c1810', bottom: '#8b4513', ambientLight: '#4a3728', sunLight: '#ff8c00', moonLight: '#4a5568' },
      { top: '#ff6b35', bottom: '#ffa500', ambientLight: '#ff9966', sunLight: '#ffcc00', moonLight: '#4a5568' },
    ],
    day: [
      { top: '#87ceeb', bottom: '#b0e0e6', ambientLight: '#87ceeb', sunLight: '#ffffe0', moonLight: '#4a5568' },
      { top: '#4682b4', bottom: '#87ceeb', ambientLight: '#6aa8d1', sunLight: '#ffffff', moonLight: '#4a5568' },
      { top: '#4169e1', bottom: '#4682b4', ambientLight: '#5a7cc8', sunLight: '#ffffe0', moonLight: '#4a5568' },
    ],
    dusk: [
      { top: '#4169e1', bottom: '#ff6347', ambientLight: '#5a7cc8', sunLight: '#ff4500', moonLight: '#4a5568' },
      { top: '#2c1810', bottom: '#ff4500', ambientLight: '#4a3728', sunLight: '#ff6b35', moonLight: '#6b7280' },
      { top: '#1a1a2e', bottom: '#2c1810', ambientLight: '#1a1a2e', sunLight: '#ff8c00', moonLight: '#9ca3af' },
    ],
    night: [
      { top: '#0a0a1a', bottom: '#1a1a2e', ambientLight: '#0a0a1a', sunLight: '#4a5568', moonLight: '#e0e0ff' },
      { top: '#000011', bottom: '#0a0a1a', ambientLight: '#000011', sunLight: '#4a5568', moonLight: '#f0f0ff' },
      { top: '#000000', bottom: '#000011', ambientLight: '#000000', sunLight: '#4a5568', moonLight: '#ffffff' },
    ],
  };

  const palette = colorPalettes[timeOfDay] || colorPalettes.day;
  const index = Math.min(Math.floor(progress * palette.length), palette.length - 1);
  return palette[index];
}

export function calculateSunPosition(hour: number, sunriseHour: number, sunsetHour: number): { x: number; y: number; z: number } {
  const dayLength = sunsetHour - sunriseHour;
  const progress = (hour - sunriseHour) / dayLength;
  
  if (progress < 0 || progress > 1) {
    return { x: 0, y: -10, z: 0 };
  }

  const angle = progress * Math.PI;
  const radius = 15;
  
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;
  const z = 0;

  return { x, y, z };
}

export function calculateMoonPosition(hour: number, sunriseHour: number, sunsetHour: number): { x: number; y: number; z: number } {
  const nightStart = sunsetHour;
  const nightEnd = sunriseHour + 24;
  const nightLength = nightEnd - nightStart;
  
  let adjustedHour = hour;
  if (hour < sunriseHour) {
    adjustedHour = hour + 24;
  }
  
  const progress = (adjustedHour - nightStart) / nightLength;
  
  if (progress < 0 || progress > 1) {
    return { x: 0, y: -10, z: 0 };
  }

  const angle = progress * Math.PI;
  const radius = 12;
  
  const x = -Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;
  const z = 0;

  return { x, y, z };
}

export function getStarCount(timeOfDay: string): number {
  if (timeOfDay === 'night') {
    return 500;
  } else if (timeOfDay === 'dusk' || timeOfDay === 'dawn') {
    return 100;
  }
  return 0;
}
