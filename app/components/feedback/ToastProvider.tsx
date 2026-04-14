"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";

type ToastType = "success" | "error" | "info";

type ToastPayload = {
  type?: ToastType;
  title: string;
  message?: string;
  durationMs?: number;
};

type ToastItem = {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
};

type ToastContextValue = {
  showToast: (payload: ToastPayload) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function resolveToneClasses(type: ToastType) {
  if (type === "success") {
    return "border-emerald-200 bg-emerald-50 text-emerald-900";
  }

  if (type === "error") {
    return "border-rose-200 bg-rose-50 text-rose-900";
  }

  return "border-slate-200 bg-white text-slate-900";
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timeoutIdsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const removeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));

    const timeoutId = timeoutIdsRef.current[id];
    if (timeoutId) {
      clearTimeout(timeoutId);
      delete timeoutIdsRef.current[id];
    }
  }, []);

  const showToast = useCallback((payload: ToastPayload) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const type = payload.type ?? "info";
    const durationMs = payload.durationMs ?? 4200;

    setToasts((current) => [
      ...current,
      {
        id,
        type,
        title: payload.title,
        message: payload.message,
      },
    ]);

    timeoutIdsRef.current[id] = setTimeout(() => {
      removeToast(id);
    }, durationMs);
  }, [removeToast]);

  const contextValue = useMemo<ToastContextValue>(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      <div className="pointer-events-none fixed right-4 top-4 z-[120] grid w-[min(92vw,26rem)] gap-2">
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className={`pointer-events-auto rounded-2xl border p-4 shadow-sm ring-1 ring-black/5 ${resolveToneClasses(toast.type)}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="grid gap-1">
                  <p className="text-sm font-semibold">{toast.title}</p>
                  {toast.message ? <p className="text-sm opacity-90">{toast.message}</p> : null}
                </div>
                <button
                  type="button"
                  onClick={() => removeToast(toast.id)}
                  className="rounded-full border border-current/20 px-2 py-0.5 text-xs font-semibold opacity-80 transition hover:opacity-100"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider.");
  }

  return context;
}
