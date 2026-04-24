import { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import SkySphere from './SkySphere';
import Sun from './Sun';
import Moon from './Moon';
import Stars from './Stars';
import Clouds from './Clouds';
import Rain from './Rain';
import type { SkyColors, TimeMode, WeatherType } from '../types';
import { 
  getTimeOfDay, 
  getSkyColors, 
  calculateSunPosition, 
  calculateMoonPosition, 
  getStarCount,
  parseTimeString,
  getWeatherEffectConfig,
  getTimeInTimezone,
  adjustColorForWeather 
} from '../utils/timeUtils';

interface Scene3DProps {
  timeMode: TimeMode;
  manualTime: number;
  sunrise: string;
  sunset: string;
  weatherType: WeatherType;
  timezone: string;
}

export default function Scene3D({ 
  timeMode, 
  manualTime, 
  sunrise, 
  sunset,
  weatherType,
  timezone,
}: Scene3DProps) {
  const currentHour = useMemo(() => {
    if (timeMode === 'auto') {
      try {
        return getTimeInTimezone(timezone);
      } catch {
        const now = new Date();
        return now.getHours() + now.getMinutes() / 60;
      }
    }
    return manualTime;
  }, [timeMode, manualTime, timezone]);

  const sunriseHour = useMemo(() => parseTimeString(sunrise), [sunrise]);
  const sunsetHour = useMemo(() => parseTimeString(sunset), [sunset]);

  const timeOfDay = useMemo(() => {
    return getTimeOfDay(currentHour, sunriseHour, sunsetHour);
  }, [currentHour, sunriseHour, sunsetHour]);

  const progress = useMemo(() => {
    let progress = 0;
    if (timeOfDay === 'dawn') {
      const dawnStart = sunriseHour - 1;
      const dawnEnd = sunriseHour + 0.5;
      progress = (currentHour - dawnStart) / (dawnEnd - dawnStart);
    } else if (timeOfDay === 'day') {
      const dayStart = sunriseHour + 0.5;
      const dayEnd = sunsetHour - 0.5;
      progress = (currentHour - dayStart) / (dayEnd - dayStart);
    } else if (timeOfDay === 'dusk') {
      const duskStart = sunsetHour - 0.5;
      const duskEnd = sunsetHour + 1;
      progress = (currentHour - duskStart) / (duskEnd - duskStart);
    } else if (timeOfDay === 'night') {
      if (currentHour > sunsetHour) {
        const nightStart = sunsetHour + 1;
        const nightEnd = 24;
        progress = (currentHour - nightStart) / (nightEnd - nightStart);
      } else {
        const nightStart = 0;
        const nightEnd = sunriseHour - 1;
        progress = (currentHour - nightStart) / (nightEnd - nightStart);
      }
    }
    return Math.max(0, Math.min(1, progress));
  }, [currentHour, sunriseHour, sunsetHour, timeOfDay]);

  const weatherConfig = useMemo(() => {
    return getWeatherEffectConfig(weatherType);
  }, [weatherType]);

  const skyColors: SkyColors = useMemo(() => {
    const baseColors = getSkyColors(timeOfDay, progress);
    
    const isSunny = weatherConfig.maxLightAttenuation === 1.0 && 
                     weatherConfig.minLightAttenuation === 1.0 &&
                     weatherConfig.saturationFactor === 1.0;
    
    if (isSunny) {
      return baseColors;
    }
    
    return {
      top: adjustColorForWeather(baseColors.top, weatherConfig, timeOfDay),
      bottom: adjustColorForWeather(baseColors.bottom, weatherConfig, timeOfDay),
      ambientLight: adjustColorForWeather(baseColors.ambientLight, weatherConfig, timeOfDay),
      sunLight: adjustColorForWeather(baseColors.sunLight, weatherConfig, timeOfDay),
      moonLight: adjustColorForWeather(baseColors.moonLight, weatherConfig, timeOfDay),
    };
  }, [timeOfDay, progress, weatherConfig]);

  const sunPosition = useMemo(() => {
    return calculateSunPosition(currentHour, sunriseHour, sunsetHour);
  }, [currentHour, sunriseHour, sunsetHour]);

  const moonPosition = useMemo(() => {
    return calculateMoonPosition(currentHour, sunriseHour, sunsetHour);
  }, [currentHour, sunriseHour, sunsetHour]);

  const starCount = useMemo(() => {
    if (weatherConfig.showClouds || weatherConfig.showRain || weatherConfig.showFog) {
      return 0;
    }
    return getStarCount(timeOfDay);
  }, [timeOfDay, weatherConfig]);

  return (
    <Canvas
      camera={{ position: [0, 0, 30], fov: 60 }}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      gl={{ antialias: true, alpha: false }}
      dpr={[1, 2]}
    >
      <SkySphere skyColors={skyColors} />
      
      {starCount > 0 && <Stars count={starCount} />}
      
      {weatherConfig.showClouds && (
        <Clouds 
          density={weatherConfig.cloudDensity} 
          opacity={weatherConfig.cloudOpacity} 
        />
      )}
      
      {weatherConfig.showRain && (
        <Rain intensity={weatherConfig.rainIntensity} />
      )}
      
      <Sun position={sunPosition} color={skyColors.sunLight} />
      
      <Moon position={moonPosition} color={skyColors.moonLight} />
      
      <ambientLight color={skyColors.ambientLight} intensity={0.3} />
      
      <OrbitControls
        enablePan={false}
        minDistance={15}
        maxDistance={100}
        maxPolarAngle={Math.PI / 2 + 0.1}
        enableDamping
        dampingFactor={0.05}
      />
      
      <fog 
        attach="fog" 
        args={[
          skyColors.top, 
          weatherConfig.showFog ? 10 : 50, 
          weatherConfig.showFog ? 50 : 200
        ]} 
      />
    </Canvas>
  );
}
