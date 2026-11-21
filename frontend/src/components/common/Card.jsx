import React from 'react';
import './Card.css';

export function Card({
  children,
  className = '',
  hover = false,
  glow = false,
  padding = 'normal', // 'none' | 'sm' | 'normal' | 'lg'
  onClick,
}) {
  return (
    <div
      className={`card ${hover ? 'card-hover' : ''} ${glow ? 'card-glow' : ''} card-p-${padding} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', title, subtitle, action }) {
  return (
    <div className={`card-header ${className}`}>
      {title && (
        <div className="card-header-text">
          <h3 className="card-title">{title}</h3>
          {subtitle && <p className="card-subtitle">{subtitle}</p>}
        </div>
      )}
      {children}
      {action && <div className="card-header-action">{action}</div>}
    </div>
  );
}

export function CardBody({ children, className = '' }) {
  return <div className={`card-body ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }) {
  return <div className={`card-footer ${className}`}>{children}</div>;
}

export default Card;
