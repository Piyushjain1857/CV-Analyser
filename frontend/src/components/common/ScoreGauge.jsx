import React from 'react';
import './ScoreGauge.css';

export function ScoreGauge({
  score = 85,
  size = 140,
  strokeWidth = 12,
  label = 'ATS Index',
  showRating = true,
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.min(100, Math.max(0, score));
  const offset = circumference - (clampedScore / 100) * circumference;

  let color = '#8b5cf6'; // purple default
  let grade = 'Fair Fit';
  let gradeColor = 'var(--accent-amber)';

  if (clampedScore >= 85) {
    color = '#10b981'; // emerald
    grade = 'Interview Ready';
    gradeColor = 'var(--accent-emerald)';
  } else if (clampedScore >= 70) {
    color = '#8b5cf6'; // purple
    grade = 'Strong Match';
    gradeColor = 'var(--primary)';
  } else if (clampedScore >= 55) {
    color = '#f59e0b'; // amber
    grade = 'Needs Optimization';
    gradeColor = 'var(--accent-amber)';
  } else {
    color = '#ef4444'; // rose
    grade = 'High ATS Risk';
    gradeColor = 'var(--accent-rose)';
  }

  return (
    <div className="score-gauge-wrapper" style={{ width: size, height: size }}>
      <svg className="score-gauge-svg" width={size} height={size}>
        {/* Background Track */}
        <circle
          className="score-gauge-track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        {/* Animated Fill Circle */}
        <circle
          className="score-gauge-fill"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="score-gauge-content">
        <span className="score-gauge-number" style={{ color: '#ffffff' }}>
          {clampedScore}
        </span>
        <span className="score-gauge-sublabel">/100</span>
        {label && <span className="score-gauge-title">{label}</span>}
      </div>
      {showRating && (
        <div className="score-gauge-badge" style={{ color: gradeColor, borderColor: gradeColor }}>
          {grade}
        </div>
      )}
    </div>
  );
}

export default ScoreGauge;
