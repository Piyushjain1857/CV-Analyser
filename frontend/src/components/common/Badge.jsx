import React from 'react';
import './Badge.css';

export function Badge({
  children,
  variant = 'purple', // 'purple' | 'green' | 'yellow' | 'red' | 'cyan' | 'gray'
  size = 'md',        // 'sm' | 'md'
  dot = false,
  className = '',
  icon: Icon,
}) {
  return (
    <span className={`badge badge-${variant} badge-${size} ${className}`}>
      {dot && <span className="badge-dot" />}
      {Icon && <Icon size={size === 'sm' ? 12 : 14} className="badge-icon" />}
      <span className="badge-label">{children}</span>
    </span>
  );
}

export default Badge;
