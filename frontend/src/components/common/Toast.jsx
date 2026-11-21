import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import './Toast.css';

export function ToastContainer() {
  const { toasts, removeToast } = useApp();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((toast) => {
        let Icon = Info;
        let iconClass = 'toast-info';
        if (toast.type === 'success') {
          Icon = CheckCircle2;
          iconClass = 'toast-success';
        } else if (toast.type === 'error') {
          Icon = AlertCircle;
          iconClass = 'toast-error';
        }

        return (
          <div key={toast.id} className={`toast-card toast-${toast.type || 'info'}`}>
            <Icon size={18} className={`toast-icon ${iconClass}`} />
            <div className="toast-content">
              <h4 className="toast-title">{toast.title}</h4>
              {toast.message && <p className="toast-msg">{toast.message}</p>}
            </div>
            <button
              className="toast-close"
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss toast"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default ToastContainer;
