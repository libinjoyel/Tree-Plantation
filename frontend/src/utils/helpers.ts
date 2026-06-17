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

// Plant health calculation — dynamic percentage based on lastWatered vs wateringSchedule
export const calculateHealth = (lastWatered: Date | string, wateringSchedule: number): number => {
  const elapsed = Date.now() - new Date(lastWatered).getTime();
  const scheduleMs = wateringSchedule * 24 * 60 * 60 * 1000;
  const health = 100 - (elapsed / scheduleMs) * 100;
  return Math.max(0, Math.min(100, Math.round(health)));
};

// Human-readable time since last watered (e.g. "2 days ago")
export const formatTimeSince = (lastWatered: Date | string): string => {
  return dayjs(lastWatered).fromNow();
};

// Human-readable next watering date (e.g. "Tomorrow", "Today", "Wednesday")
export const getNextWatering = (lastWatered: Date | string, scheduleDays: number): string => {
  return dayjs(lastWatered).add(scheduleDays, 'day').calendar();
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
