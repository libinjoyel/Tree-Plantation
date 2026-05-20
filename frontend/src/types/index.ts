// User types
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
  confirmPassword: string;
}

// Plant types
export interface Plant {
  id: string;
  name: string;
  species: string;
  wateringSchedule: string;
  lastWatered: Date;
}

// Weather types
export interface WeatherData {
  city: string;
  temperature: number;
  humidity: number;
  condition: string;
  uvIndex: number;
  windSpeed: number;
  feelsLike: number;
  weatherIcon: string;
  description: string;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
}

export interface WeatherSuggestion {
  title: string;
  message: string;
  icon: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// OpenWeather API Response
export interface OpenWeatherResponse {
  name: string;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
}
