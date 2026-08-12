import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import LoadingScreen from "../components/Loading/LoadingScreen";

interface LoadingOptions {
  label?: string;
  hint?: string;
  /** Minimum duration (ms) the loader stays visible. Prevents flash on fast loads. Default 450ms */
  minDuration?: number;
}

interface LoadingContextValue {
  /** Show the full-page brand loader. Returns a token you pass to hide(token) */
  show: (opts?: LoadingOptions) => number;
  /** Hide the loader. Pass the token you got from show(), or call with no args to force-hide. */
  hide: (token?: number) => void;
  /**
   * Wrap an async/promise operation so the loader appears for its full duration,
   * with min-duration anti-flash built in. Errors are re-thrown after hiding.
   *
   *   const result = await withLoader(() => fetch(...), { label: "Loading..." });
   */
  withLoader: <T>(fn: () => Promise<T>, opts?: LoadingOptions) => Promise<T>;
  /** Current visible state — useful for conditional UI */
  isLoading: boolean;
}

const LoadingContext = createContext<LoadingContextValue | undefined>(undefined);

/**
 * Provider that mounts the full-page <LoadingScreen> once at the root, and exposes
 * `show` / `hide` / `withLoader` helpers to any component via `useLoading()`.
 *
 * Usage:
 *   const { withLoader, show, hide } = useLoading();
 *   const data = await withLoader(() => api.get('/things'));
 */
export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [label, setLabel] = useState<string | undefined>(undefined);
  const [hint, setHint] = useState<string | undefined>(undefined);

  // Token / nesting counter so multiple parallel callers don't close too early
  const tokenRef = useRef(0);
  const depthRef = useRef(0);
  const hideAtRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPendingTimer = () => {
    if (timerRef.current != null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const show = useCallback((opts: LoadingOptions = {}) => {
    tokenRef.current += 1;
    depthRef.current += 1;
    const token = tokenRef.current;

    const minDuration = opts.minDuration ?? 450;
    hideAtRef.current = Math.max(hideAtRef.current ?? 0, performance.now() + minDuration);

    setLabel((prev) => opts.label ?? prev);
    setHint((prev) => opts.hint ?? prev);
    setVisible(true);
    clearPendingTimer();
    return token;
  }, []);

  const hide = useCallback((_token?: number) => {
    depthRef.current = Math.max(0, depthRef.current - 1);
    if (depthRef.current > 0) return; // another caller still loading

    const now = performance.now();
    const remaining = Math.max(0, (hideAtRef.current ?? now) - now);

    clearPendingTimer();
    timerRef.current = setTimeout(() => {
      setVisible(false);
      setLabel(undefined);
      setHint(undefined);
      hideAtRef.current = null;
      clearPendingTimer();
    }, remaining);
  }, []);

  const withLoader = useCallback(
    async <T,>(fn: () => Promise<T>, opts?: LoadingOptions): Promise<T> => {
      show(opts);
      try {
        const result = await fn();
        return result;
      } finally {
        hide();
      }
    },
    [show, hide]
  );

  const value = useMemo<LoadingContextValue>(
    () => ({ show, hide, withLoader, isLoading: visible }),
    [show, hide, withLoader, visible]
  );

  return (
    <LoadingContext.Provider value={value}>
      {children}
      <LoadingScreen
        isLoading={visible}
        label={label}
        hint={hint}
        variant="wave"
      />
    </LoadingContext.Provider>
  );
}

/**
 * Hook to control the global loader anywhere in the app.
 *
 *   const { withLoader } = useLoading();
 *   const data = await withLoader(() => myApiCall());
 */
export function useLoading(): LoadingContextValue {
  const ctx = useContext(LoadingContext);
  if (!ctx) {
    // Graceful fallback so it doesn't break if mounted outside provider:
    // return a no-op shape.
    return {
      show: () => 0,
      hide: () => undefined,
      withLoader: <T,>(fn: () => Promise<T>) => fn(),
      isLoading: false,
    };
  }
  return ctx;
}
