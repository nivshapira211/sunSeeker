import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

type ToastContextValue = {
  showToast: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_DURATION_MS = 5000;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [message, setMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setMessage(msg);
  }, []);

  useEffect(() => {
    if (!message) return;
    const id = setTimeout(() => setMessage(null), TOAST_DURATION_MS);
    return () => clearTimeout(id);
  }, [message]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {message && (
        <div
          role="alert"
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            maxWidth: 'min(90vw, 420px)',
            padding: '14px 20px',
            background: 'rgba(220, 53, 69, 0.95)',
            color: 'white',
            borderRadius: 'var(--radius-md, 8px)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            zIndex: 10000,
            fontSize: '0.95rem',
            lineHeight: 1.4,
          }}
        >
          {message}
        </div>
      )}
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
