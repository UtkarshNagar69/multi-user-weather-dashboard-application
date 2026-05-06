import axios from 'axios';
import NodeCache from 'node-cache';

const weatherCache = new NodeCache({ stdTTL: 600 }); // 10 minute cache

const WMO_CODES: Record<number, string> = {
  0: 'Clear Sky',
  1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
  45: 'Foggy', 48: 'Icy Fog',
  51: 'Light Drizzle', 53: 'Moderate Drizzle', 55: 'Dense Drizzle',
  61: 'Slight Rain', 63: 'Moderate Rain', 65: 'Heavy Rain',
  71: 'Slight Snow', 73: 'Moderate Snow', 75: 'Heavy Snow',
  77: 'Snow Grains',
  80: 'Slight Showers', 81: 'Moderate Showers', 82: 'Violent Showers',
  85: 'Slight Snow Showers', 86: 'Heavy Snow Showers',
  95: 'Thunderstorm', 96: 'Thunderstorm w/ Hail', 99: 'Thunderstorm w/ Heavy Hail',
};

export interface WeatherData {
  temperature: number;
  windspeed: number;
  winddirection: number;
  weatherCode: number;
  condition: string;
  isDay: number;
  time: string;
}

export interface GeoResult {
  name: string;
  country: string;
  country_code: string;
  latitude: number;
  longitude: number;
}

export async function geocodeCity(cityName: string): Promise<GeoResult | null> {
  try {
    const response = await axios.get(
      `https://geocoding-api.open-meteo.com/v1/search`,
      { params: { name: cityName, count: 1, language: 'en', format: 'json' } }
    );
    const results = response.data?.results;
    if (!results || results.length === 0) return null;
    const r = results[0];
    return {
      name: r.name,
      country: r.country || '',
      country_code: r.country_code || '',
      latitude: r.latitude,
      longitude: r.longitude,
    };
  } catch {
    return null;
  }
}

export async function fetchWeather(
  cityName: string,
  latitude: number,
  longitude: number
): Promise<WeatherData | null> {
  const cacheKey = `${latitude.toFixed(4)}_${longitude.toFixed(4)}`;
  const cached = weatherCache.get<WeatherData>(cacheKey);
  if (cached) return cached;

  try {
    const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude,
        longitude,
        current_weather: true,
        hourly: 'relativehumidity_2m,apparent_temperature',
        forecast_days: 1,
        timezone: 'auto',
      },
    });

    const cw = response.data.current_weather;
    const hourly = response.data.hourly;

    // Find humidity for current hour
    const currentTime = cw.time;
    const hourIndex = hourly?.time?.findIndex((t: string) => t === currentTime) ?? 0;
    const humidity = hourly?.relativehumidity_2m?.[hourIndex >= 0 ? hourIndex : 0] ?? null;
    const feelsLike = hourly?.apparent_temperature?.[hourIndex >= 0 ? hourIndex : 0] ?? null;

    const data: WeatherData & { humidity?: number; feelsLike?: number } = {
      temperature: cw.temperature,
      windspeed: cw.windspeed,
      winddirection: cw.winddirection,
      weatherCode: cw.weathercode,
      condition: WMO_CODES[cw.weathercode] ?? 'Unknown',
      isDay: cw.is_day,
      time: cw.time,
      humidity: humidity,
      feelsLike: feelsLike,
    };

    weatherCache.set(cacheKey, data);
    return data;
  } catch {
    return null;
  }
}
