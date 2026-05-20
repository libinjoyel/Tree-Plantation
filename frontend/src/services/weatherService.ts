import type { WeatherData, GeoLocation, OpenWeatherResponse, WeatherSuggestion } from '../types';

// OpenWeather API Key from environment variables
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || 'demo_key';

// Helper to convert weather icon codes to emojis
const getWeatherEmoji = (iconCode: string): string => {
  const iconMap: Record<string, string> = {
    '01d': '☀️',
    '01n': '🌙',
    '02d': '⛅',
    '02n': '☁️',
    '03d': '☁️',
    '03n': '☁️',
    '04d': '☁️',
    '04n': '☁️',
    '09d': '🌧️',
    '09n': '🌧️',
    '10d': '🌧️',
    '10n': '🌧️',
    '11d': '⛈️',
    '11n': '⛈️',
    '13d': '❄️',
    '13n': '❄️',
    '50d': '🌫️',
    '50n': '🌫️',
  };
  return iconMap[iconCode] || '🌡️';
};

// Get plant care suggestion based on weather
export const getPlantCareSuggestion = (weather: WeatherData): WeatherSuggestion => {
  const temp = weather.temperature;
  const condition = weather.condition.toLowerCase();
  const humidity = weather.humidity;

  if (condition.includes('rain') || condition.includes('drizzle')) {
    return {
      title: '🌧️ Rainy Weather',
      message: 'Skip watering today. With rain coming, your plants get natural hydration. Focus on ensuring good drainage.',
      icon: '🌧️',
    };
  }

  if (condition.includes('cloud') || condition.includes('mist')) {
    return {
      title: '☁️ Cloudy Conditions',
      message: 'Water moderately. Lower light means less evaporation. Plants need less water today.',
      icon: '☁️',
    };
  }

  if (temp > 30) {
    return {
      title: '🔥 Hot Weather',
      message: 'Increase watering frequency! High temperatures cause faster soil evaporation. Water early morning or evening.',
      icon: '🔥',
    };
  }

  if (temp < 10) {
    return {
      title: '❄️ Cold Weather',
      message: 'Reduce watering. Cold temperatures slow plant growth and water absorption. Water less frequently.',
      icon: '❄️',
    };
  }

  if (humidity > 70) {
    return {
      title: '💧 High Humidity',
      message: 'Decrease watering. High humidity means slower soil drying. Watch for overwatering.',
      icon: '💧',
    };
  }

  return {
    title: '✅ Ideal Conditions',
    message: 'Perfect weather for watering! Conditions are ideal for plant growth. Water as per schedule.',
    icon: '✅',
  };
};

// Fetch weather data from OpenWeather API
export const fetchWeatherData = async (longitude: number, latitude: number): Promise<WeatherData> => {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }

    const data: OpenWeatherResponse = await response.json();

    return {
      city: data.name,
      temperature: Math.round(data.main.temp),
      humidity: data.main.humidity,
      condition: data.weather[0].main,
      feelsLike: Math.round(data.main.feels_like),
      windSpeed: Math.round(data.wind.speed),
      uvIndex: 6, // UV Index needs a separate API call, using placeholder
      weatherIcon: getWeatherEmoji(data.weather[0].icon),
      description: data.weather[0].description,
    };
  } catch (error) {
    console.error('Error fetching weather:', error);
    throw error;
  }
};

// Get user's current location
export const getCurrentLocation = (): Promise<GeoLocation> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        let errorMessage = 'Unable to retrieve location';
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = 'Location permission denied. Please enable it in browser settings.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = 'Location information is unavailable.';
        } else if (error.code === error.TIMEOUT) {
          errorMessage = 'Location request timed out.';
        }
        reject(new Error(errorMessage));
      }
    );
  });
};

// Complete flow: Get location and fetch weather
export const getWeatherForCurrentLocation = async (): Promise<WeatherData> => {
  const location = await getCurrentLocation();
  return fetchWeatherData(location.longitude, location.latitude);
};
