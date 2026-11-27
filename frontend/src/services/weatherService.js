import apiConfig from '../utils/apiConfig';

// Helper to convert weather icon codes to MUI icon names
export const getWeatherIcon = (iconCode) => {
  const iconMap = {
    '01d': 'WbSunny',
    '01n': 'NightsStay',
    '02d': 'WbPartlyCloudy',
    '02n': 'Cloud',
    '03d': 'Cloud',
    '03n': 'Cloud',
    '04d': 'Cloud',
    '04n': 'Cloud',
    '09d': 'Grain',
    '09n': 'Grain',
    '10d': 'Umbrella',
    '10n': 'Umbrella',
    '11d': 'Thunderstorm',
    '11n': 'Thunderstorm',
    '13d': 'AcUnit',
    '13n': 'AcUnit',
    '50d': 'Cloud',
    '50n': 'Cloud',
  };
  return iconMap[iconCode] || 'DeviceThermostat';
};

// Get plant care suggestion based on weather
export const getPlantCareSuggestion = (weather) => {
  const temp = weather.temperature;
  const condition = weather.condition.toLowerCase();
  const humidity = weather.humidity;

  if (condition.includes('rain') || condition.includes('drizzle')) {
    return {
      title: 'Rainy Weather',
      message: 'Skip watering today. With rain coming, your plants get natural hydration. Focus on ensuring good drainage.',
      icon: 'Water',
    };
  }

  if (condition.includes('cloud') || condition.includes('mist')) {
    return {
      title: 'Cloudy Conditions',
      message: 'Water moderately. Lower light means less evaporation. Plants need less water today.',
      icon: 'Cloud',
    };
  }

  if (temp > 30) {
    return {
      title: 'Hot Weather',
      message: 'Increase watering frequency! High temperatures cause faster soil evaporation. Water early morning or evening.',
      icon: 'Hot',
    };
  }

  if (temp < 10) {
    return {
      title: 'Cold Weather',
      message: 'Reduce watering. Cold temperatures slow plant growth and water absorption. Water less frequently.',
      icon: 'Cold',
    };
  }

  if (humidity > 70) {
    return {
      title: 'High Humidity',
      message: 'Decrease watering. High humidity means slower soil drying. Watch for overwatering.',
      icon: 'Humidity',
    };
  }

  return {
    title: 'Ideal Conditions',
    message: 'Perfect weather for watering! Conditions are ideal for plant growth. Water as per schedule.',
    icon: 'CheckCircle',
  };
};

// Fetch weather data via backend OpenWeather proxy
export const fetchWeatherData = async (longitude, latitude) => {
  try {
    const response = await apiConfig.get(
      `/weather?lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}`
    );

    if (!response.success || !response.data?.weather) {
      throw new Error(response.error || 'Failed to fetch weather data');
    }

    const data = response.data.weather;

    return {
      city: data.name,
      temperature: Math.round(data.main.temp),
      humidity: data.main.humidity,
      condition: data.weather[0].main,
      feelsLike: Math.round(data.main.feels_like),
      windSpeed: Math.round(data.wind.speed),
      uvIndex: 6, // UV Index needs a separate API call, using placeholder
      weatherIcon: getWeatherIcon(data.weather[0].icon),
      description: data.weather[0].description,
    };
  } catch (error) {
    console.error('Error fetching weather:', error);
    throw error;
  }
};

// Get user's current location
export const getCurrentLocation = () => {
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
export const getWeatherForCurrentLocation = async () => {
  const location = await getCurrentLocation();
  return fetchWeatherData(location.longitude, location.latitude);
};
