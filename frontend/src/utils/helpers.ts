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
