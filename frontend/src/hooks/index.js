// Custom hooks
import { useState, useCallback, useEffect } from 'react';
import { formatTimeSince } from '../utils/helpers';

/**
 * Custom hook for managing form state
 */
export const useForm = (initialState) => {
  const [values, setValues] = useState(initialState);

  const handleChange = useCallback((e) => {
    const { name, value, type } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? e.target.checked : value,
    }));
  }, []);

  const reset = useCallback(() => {
    setValues(initialState);
  }, [initialState]);

  return { values, handleChange, reset, setValues };
};

/**
 * Custom hook for handling async operations
 */
export const useAsync = (asyncFunction, immediate = true) => {
  const [status, setStatus] = useState('idle');
  const [value, setValue] = useState(null);
  const [error, setError] = useState(null);

  const execute = useCallback(async () => {
    setStatus('pending');
    setValue(null);
    setError(null);
    try {
      const response = await asyncFunction();
      setValue(response);
      setStatus('success');
      return response;
    } catch (err) {
      setError(err);
      setStatus('error');
    }
  }, [asyncFunction]);

  // Call immediately if specified
  useEffect(() => {
    if (!immediate) return;
    let cancelled = false;
    Promise.resolve().then(() => {
      if (!cancelled) {
        execute();
      }
    });
    return () => {
      cancelled = true;
    };
  }, [execute, immediate]);

  return { execute, status, value, error };
};

/**
 * Custom hook that returns a live-updating "time since" string
 * Re-renders every 30 seconds to keep the timer current
 */
export const useRealtimeTimer = (lastWatered) => {
  const [display, setDisplay] = useState('');

  useEffect(() => {
    const update = () => setDisplay(formatTimeSince(lastWatered));
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, [lastWatered]);

  return display;
};
