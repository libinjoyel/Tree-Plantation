import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import calendar from 'dayjs/plugin/calendar';

dayjs.extend(relativeTime);
dayjs.extend(calendar, {
  sameDay: '[Today]',
  nextDay: '[Tomorrow]',
  nextWeek: 'dddd',
  lastDay: '[Yesterday]',
  lastWeek: '[Last] dddd',
  sameElse: 'MMM D, YYYY',
});

// Validation utilities
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

// Storage utilities
export const getFromStorage = (key) => {
  return localStorage.getItem(key);
};

export const setInStorage = (key, value) => {
  localStorage.setItem(key, value);
};

export const removeFromStorage = (key) => {
  localStorage.removeItem(key);
};

// Plant health calculation — dynamic percentage based on lastWatered vs wateringSchedule
export const calculateHealth = (lastWatered, wateringSchedule) => {
  const elapsed = Date.now() - new Date(lastWatered).getTime();
  const scheduleMs = wateringSchedule * 24 * 60 * 60 * 1000;
  const health = 100 - (elapsed / scheduleMs) * 100;
  return Math.max(0, Math.min(100, Math.round(health)));
};

// Human-readable time since last watered (e.g. "2 days ago")
export const formatTimeSince = (lastWatered) => {
  return dayjs(lastWatered).fromNow();
};

// Human-readable next watering date (e.g. "Tomorrow", "Today", "Wednesday")
export const getNextWatering = (lastWatered, scheduleDays) => {
  return dayjs(lastWatered).add(scheduleDays, 'day').calendar();
};

// Date utilities
export const formatDate = (date) => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const getDaysSince = (date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};
