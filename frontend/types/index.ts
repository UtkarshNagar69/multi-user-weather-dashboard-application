// Shared TypeScript interfaces between frontend components

export interface User {
  id: string;
  email: string;
}

export interface WeatherData {
  temperature: number;
  windspeed: number;
  winddirection: number;
  weatherCode: number;
  condition: string;
  isDay: number;
  time: string;
  humidity?: number;
  feelsLike?: number;
}

export interface CityWeatherData {
  cityName: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  isFavorite: boolean;
  addedAt: string;
  weather: WeatherData | null;
  weatherUnavailable: boolean;
}

export interface DashboardResponse {
  cities: CityWeatherData[];
}

export interface ApiError {
  message: string;
}

export interface AuthResponse {
  message: string;
  user: User;
}

// ─── AI Types ───
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIChatResponse {
  reply: string;
  action?: 'city_added' | 'city_removed';
  cityName?: string;
}

export interface SmartInsights {
  bestCity?: string;
  alerts?: string[];
  outfit?: string;
  tip?: string;
}

