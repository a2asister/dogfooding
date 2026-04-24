import { z } from 'zod';

export const CitySchema = z.object({
  name: z.string(),
  country: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  timezone: z.string(),
});

export type City = z.infer<typeof CitySchema>;

export type WeatherType = 'sunny' | 'cloudy' | 'overcast' | 'rainy' | 'snowy' | 'foggy';

export const WeatherDataSchema = z.object({
  temperature: z.number(),
  weather: z.string(),
  humidity: z.number(),
  windSpeed: z.number(),
  icon: z.string(),
  weatherType: z.enum(['sunny', 'cloudy', 'overcast', 'rainy', 'snowy', 'foggy']),
});

export type WeatherData = z.infer<typeof WeatherDataSchema>;

export const SunMoonDataSchema = z.object({
  sunrise: z.string(),
  sunset: z.string(),
  dayLength: z.number(),
  nightLength: z.number(),
});

export type SunMoonData = z.infer<typeof SunMoonDataSchema>;

export const AppStateSchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('idle') }),
  z.object({ status: z.literal('loading') }),
  z.object({ 
    status: z.literal('success'), 
    city: CitySchema, 
    weather: WeatherDataSchema, 
    sunMoon: SunMoonDataSchema 
  }),
  z.object({ status: z.literal('error'), error: z.instanceof(Error) }),
]);

export type AppState = z.infer<typeof AppStateSchema>;

export type TimeMode = 'auto' | 'manual';

export interface TimeContext {
  currentTime: Date;
  timeMode: TimeMode;
  manualTime: number;
  setTimeMode: (mode: TimeMode) => void;
  setManualTime: (time: number) => void;
}

export interface SkyColors {
  top: string;
  bottom: string;
  ambientLight: string;
  sunLight: string;
  moonLight: string;
}
