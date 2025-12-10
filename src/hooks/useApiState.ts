import { useState, useCallback } from 'react';
import { AxiosError } from 'axios';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiStateReturn<T, P extends unknown[]> extends ApiState<T> {
  execute: (...args: P) => Promise<T | null>;
  setData: (data: T | null) => void;
  reset: () => void;
}

export function useApiState<T, P extends unknown[] = []>(
  apiFunction: (...args: P) => Promise<{ data: T }>
): UseApiStateReturn<T, P> {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: P): Promise<T | null> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await apiFunction(...args);
        setState({ data: response.data, loading: false, error: null });
        return response.data;
      } catch (err) {
        const error = err as AxiosError<{ message?: string; error?: string }>;
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          'An error occurred';
        setState({ data: null, loading: false, error: errorMessage });
        return null;
      }
    },
    [apiFunction]
  );

  const setData = useCallback((data: T | null) => {
    setState((prev) => ({ ...prev, data }));
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, execute, setData, reset };
}

export default useApiState;
