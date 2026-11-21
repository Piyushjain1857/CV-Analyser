import React from 'react';
import { useApp } from '../../context/AppContext';
import { Activity, Database, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import './HealthBadge.css';

export function HealthBadge({ showDetails = false, showRefresh = true }) {
  const { health, checkHealth } = useApp();
  const [checking, setChecking] = React.useState(false);

  const handleManualCheck = async (e) => {
    e.stopPropagation();
    setChecking(true);
    await checkHealth();
    setTimeout(() => setChecking(false), 400);
  };

  const isHealthy = health.status === 'operational';

  return (
    <div className={`health-badge-container ${isHealthy ? 'status-ok' : 'status-warn'}`}>
      <div className="health-badge-pill" title={`Backend: ${health.status} | DB: ${health.dbStatus}`}>
        <span className="health-pulse-dot" />
        <span className="health-label">
          {health.status === 'checking'
            ? 'Checking API...'
            : isHealthy
            ? 'Backend Live'
            : 'Backend Offline'}
        </span>
        {health.latencyMs !== null && (
          <span className="health-latency">{health.latencyMs}ms</span>
        )}
        {showRefresh && (
          <button
            className={`health-refresh-btn ${checking ? 'rotating' : ''}`}
            onClick={handleManualCheck}
            title="Refresh backend status check"
            aria-label="Refresh backend status"
          >
            <RefreshCw size={11} />
          </button>
        )}
      </div>

      {showDetails && (
        <div className="health-meta-details">
          <div className="health-meta-item">
            <Database size={12} className="meta-icon" />
            <span>PostgreSQL: <strong>{health.dbStatus}</strong></span>
          </div>
          <div className="health-meta-item">
            <Activity size={12} className="meta-icon" />
            <span>Health Ping: <strong>{health.latencyMs ?? '--'} ms</strong></span>
          </div>
        </div>
      )}
    </div>
  );
}

export default HealthBadge;
