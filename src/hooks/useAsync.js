import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Run an async API call and track loading / error state.
 *
 *   const { data, loading, error, reload, setData } = useAsync(() => api.classes.list(), []);
 */
export function useAsync(fn, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const callId = useRef(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(fn, deps);

  const reload = useCallback(async ({ silent = false } = {}) => {
    const id = ++callId.current;
    if (!silent) setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await run();
      if (id === callId.current) setState({ data, loading: false, error: null });
    } catch (error) {
      if (id === callId.current) setState({ data: null, loading: false, error });
    }
  }, [run]);

  useEffect(() => {
    reload();
    return () => {
      callId.current += 1; // ignore results that arrive after unmount / deps change
    };
  }, [reload]);

  const setData = useCallback((updater) => {
    setState((s) => ({ ...s, data: typeof updater === 'function' ? updater(s.data) : updater }));
  }, []);

  return { ...state, reload, setData };
}

/** Debounce a changing value (used for search inputs). */
export function useDebounce(value, delay = 250) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}
