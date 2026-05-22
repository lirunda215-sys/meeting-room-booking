import { createContext, useContext, useState, useCallback } from 'react';

const DialogContext = createContext();

export function DialogProvider({ children }) {
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [dialogStack, setDialogStack] = useState([]);

  const showConfirm = useCallback(({ title, message, onConfirm, onCancel, confirmText, cancelText, confirmColor }) => {
    return new Promise((resolve) => {
      const id = Date.now();
      setDialogStack(prev => [...prev, {
        id,
        title,
        message,
        confirmText,
        cancelText,
        confirmColor,
        onConfirm: () => {
          resolve(true);
          if (onConfirm) onConfirm();
          closeDialog(id);
        },
        onCancel: () => {
          resolve(false);
          if (onCancel) onCancel();
          closeDialog(id);
        }
      }]);
    });
  }, []);

  const closeDialog = useCallback((id) => {
    setDialogStack(prev => prev.filter(d => d.id !== id));
  }, []);

  const currentDialog = dialogStack.length > 0 ? dialogStack[dialogStack.length - 1] : null;

  return (
    <DialogContext.Provider value={{ showConfirm }}>
      {children}
      {currentDialog && (
        <ConfirmDialog
          key={currentDialog.id}
          dialog={currentDialog}
          onClose={() => closeDialog(currentDialog.id)}
        />
      )}
    </DialogContext.Provider>
  );
}

function ConfirmDialog({ dialog, onClose }) {
  const defaultConfirmText = '确定';
  const defaultCancelText = '取消';
  const defaultTitle = '确认';
  
  const confirmColor = dialog.confirmColor || '#2563eb';
  
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h3 style={styles.title}>{dialog.title || defaultTitle}</h3>
        </div>
        <div style={styles.content}>
          <p style={styles.message}>{dialog.message}</p>
        </div>
        <div style={styles.footer}>
          <button 
            style={styles.cancelButton}
            onClick={() => dialog.onCancel()}
          >
            {dialog.cancelText || defaultCancelText}
          </button>
          <button 
            style={{ ...styles.confirmButton, backgroundColor: confirmColor }}
            onClick={() => dialog.onConfirm()}
          >
            {dialog.confirmText || defaultConfirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '8px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
  header: {
    padding: '16px 20px',
    borderBottom: '1px solid #e5e7eb',
  },
  title: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
  },
  content: {
    padding: '20px',
  },
  message: {
    margin: 0,
    fontSize: '14px',
    color: '#4b5563',
    lineHeight: '1.5',
  },
  footer: {
    padding: '16px 20px',
    borderTop: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
  },
  cancelButton: {
    padding: '8px 20px',
    backgroundColor: '#f3f4f6',
    color: '#4b5563',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background-color 0.2s',
  },
  confirmButton: {
    padding: '8px 20px',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background-color 0.2s',
  },
};

export function useDialog() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
}
