import React from 'react';
import './ProgressBar.css';

export function ProgressBar({
  value = 0,
  max = 100,
  label = '',
  color = 'purple', // 'purple' | 'green' | 'amber' | 'rose' | 'cyan'
  showValue = true,
  size = 'md', // 'sm' | 'md'
}) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  return (
    <div className={`progress-bar-container progress-${size}`}>
      {(label || showValue) && (
        <div className="progress-bar-header">
          {label && <span className="progress-bar-label">{label}</span>}
          {showValue && <span className="progress-bar-value">{percentage}%</span>}
        </div>
      )}
      <div className="progress-bar-track">
        <div
          className={`progress-bar-fill progress-fill-${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
