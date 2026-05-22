import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    
    // 3秒后自动移除
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, removeToast }) {
  return (
    <div style={styles.container}>
      {toasts.map(toast => (
        <div key={toast.id} style={{ ...styles.toast, ...styles[toast.type] }}>
          <span style={styles.message}>{toast.message}</span>
          <button onClick={() => removeToast(toast.id)} style={styles.closeBtn}>×</button>
        </div>
      ))}
    </div>
  );
}

const styles = {
  container: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  toast: {
    padding: '12px 20px',
    borderRadius: '8px',
    color: 'white',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    minWidth: '300px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    animation: 'slideIn 0.3s ease',
  },
  success: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  },
  error: {
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  },
  warning: {
    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  },
  info: {
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
  },
  message: {
    flex: 1,
    fontSize: '14px',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'white',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '0 0 0 10px',
    lineHeight: 1,
  },
};

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
