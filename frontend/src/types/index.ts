// User types
export interface User {
  id: string;
  _id?: string;
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

// Plant types — wateringSchedule is a number (days), matching backend model
export interface Plant {
  id: string;
  _id?: string;
  userId?: string;
  name: string;
  species: string;
  wateringSchedule: number; // number of days between waterings
  lastWatered: Date;
  health?: number;
  createdAt?: Date;
}

// Schedule types
export interface ScheduleItem {
  id: string;
  _id?: string;
  userId?: string;
  plantId: string;
  plantName: string;
  task: string;
  dueDate: string; // YYYY-MM-DD
  time: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

// Settings types
export interface AppSettings {
  notificationsEnabled: boolean;
  emailAlerts: boolean;
  wateringReminders: boolean;
  weeklyReports: boolean;
  darkMode: boolean;
  language: string;
  timezone: string;
}

export interface UserInfo {
  username: string;
  email: string;
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
  message?: string;
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
