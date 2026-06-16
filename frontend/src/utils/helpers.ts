// Validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

// Storage utilities
export const getFromStorage = (key: string): string | null => {
  return localStorage.getItem(key);
};

export const setInStorage = (key: string, value: string): void => {
  localStorage.setItem(key, value);
};

export const removeFromStorage = (key: string): void => {
  localStorage.removeItem(key);
};

// Plant health calculation — dynamic percentage based on lastWatered vs wateringSchedule
export const calculateHealth = (lastWatered: Date | string, wateringSchedule: number): number => {
  const elapsed = Date.now() - new Date(lastWatered).getTime();
  const scheduleMs = wateringSchedule * 24 * 60 * 60 * 1000;
  const health = 100 - (elapsed / scheduleMs) * 100;
  return Math.max(0, Math.min(100, Math.round(health)));
};

// Real-time human-readable time since last watered
export const formatTimeSince = (lastWatered: Date | string): string => {
  const elapsed = Date.now() - new Date(lastWatered).getTime();
  const totalSeconds = Math.floor(elapsed / 1000);
  if (totalSeconds < 0) return 'just now';

  const totalMinutes = Math.floor(totalSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const days = Math.floor(hours / 24);

  if (days > 0) {
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours}h ago`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m ago`;
  }
  return `${minutes}m ago`;
};

// Date utilities
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const getDaysSince = (date: Date): number => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};
