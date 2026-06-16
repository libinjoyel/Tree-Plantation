// Custom hooks
import { useState, useCallback, useEffect } from 'react';
import { formatTimeSince } from '../utils/helpers';

/**
 * Custom hook for managing form state
 */
export const useForm = <T extends Record<string, any>>(initialState: T) => {
  const [values, setValues] = useState(initialState);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      setValues((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
      }));
    },
    []
  );

  const reset = useCallback(() => {
    setValues(initialState);
  }, [initialState]);

  return { values, handleChange, reset, setValues };
};

/**
 * Custom hook for handling async operations
 */
export const useAsync = <T,>(asyncFunction: () => Promise<T>, immediate = true) => {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [value, setValue] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async () => {
    setStatus('pending');
    setValue(null);
    setError(null);
    try {
      const response = await asyncFunction();
      setValue(response);
      setStatus('success');
      return response;
    } catch (error) {
      setError(error as Error);
      setStatus('error');
    }
  }, [asyncFunction]);

  // Call immediately if specified
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { execute, status, value, error };
};

/**
 * Custom hook that returns a live-updating "time since" string
 * Re-renders every 30 seconds to keep the timer current
 */
export const useRealtimeTimer = (lastWatered: Date | string): string => {
  const [display, setDisplay] = useState('');

  useEffect(() => {
    const update = () => setDisplay(formatTimeSince(lastWatered));
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, [lastWatered]);

  return display;
};
