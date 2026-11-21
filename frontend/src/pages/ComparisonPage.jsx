import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  GitCompare,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  FileText,
  Scale,
  RotateCcw,
  Plus,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import api from '../services/api';
import Card, { CardHeader, CardBody } from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import ProgressBar from '../components/common/ProgressBar';
import Skeleton from '../components/common/Skeleton';
import './ComparisonPage.css';

export function ComparisonPage() {
  const { id1, id2 } = useParams();
  const navigate = useNavigate();
  const { resumes, addToast } = useApp();

  // Extract flat list of all analyses from user's resumes
  const allAnalyses = [];
  resumes.forEach((r) => {
    (r.analyses || []).forEach((a) => {
      allAnalyses.push({
        id: a.id,
        resumeId: r.id,
        resumeTitle: r.title || r.fileName,
        candidateName: r.candidateName,
        targetRole: r.targetRole,
        score: a.overallScore,
        createdAt: a.createdAt,
      });
    });
  });

  const [selectedA, setSelectedA] = useState(id1 || '');
  const [selectedB, setSelectedB] = useState(id2 || '');
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);

  // Set initial selections if not in URL
  useEffect(() => {
    if (allAnalyses.length >= 2) {
      if (!selectedA) setSelectedA(allAnalyses[allAnalyses.length - 1].id);
      if (!selectedB) setSelectedB(allAnalyses[0].id);
    } else if (allAnalyses.length === 1) {
      if (!selectedA) setSelectedA(allAnalyses[0].id);
      if (!selectedB) setSelectedB(allAnalyses[0].id);
    }
  }, [allAnalyses.length]);

  // Fetch comparison from PostgreSQL
  useEffect(() => {
    if (selectedA && selectedB && selectedA !== selectedB) {
      setLoading(true);
      api
        .compareAnalyses(selectedA, selectedB)
        .then((res) => {
          if (res.success && res.data) {
            setComparison(res.data);
          }
        })
        .catch((err) => {
          console.error('Failed to compare:', err);
          addToast('Comparison notice', 'info', err.message);
        })
        .finally(() => setLoading(false));
    } else if (selectedA && selectedB && selectedA === selectedB) {
      setComparison(null);
    }
  }, [selectedA, selectedB]);

  return (
    <div className="comparison-page-root">
      {/* Header */}
      <div className="comp-header-row">
        <div>
          <div className="comp-badge-row">
            <Badge variant="purple" size="sm" icon={GitCompare}>
              VERSION AUDIT COMPARISON
            </Badge>
          </div>
          <h1 className="comp-page-title">Resume Version Differential</h1>
          <p className="comp-page-desc">
            Compare two historical scans side-by-side to track keyword resolution, ATS index gains, and skill progress.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={RotateCcw}
          onClick={() => navigate('/dashboard/history')}
        >
          Back to History
        </Button>
      </div>

      {/* Selectors Bar */}
      <Card className="comp-selectors-card">
        <div className="selectors-grid">
          <div className="selector-group">
            <label className="selector-label" htmlFor="selectVerA">
              <span className="dot dot-a" />
              Baseline Scan (Version A):
            </label>
            <select
              id="selectVerA"
              className="comp-select"
              value={selectedA}
              onChange={(e) => setSelectedA(e.target.value)}
            >
              <option value="">Select baseline scan...</option>
              {allAnalyses.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.resumeTitle} • Score: {a.score}/100 ({new Date(a.createdAt).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          <div className="selector-swap-icon">
            <GitCompare size={20} />
          </div>

          <div className="selector-group">
            <label className="selector-label" htmlFor="selectVerB">
              <span className="dot dot-b" />
              Comparison Scan (Version B):
            </label>
            <select
              id="selectVerB"
              className="comp-select"
              value={selectedB}
              onChange={(e) => setSelectedB(e.target.value)}
            >
              <option value="">Select updated scan...</option>
              {allAnalyses.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.resumeTitle} • Score: {a.score}/100 ({new Date(a.createdAt).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Content Area */}
      {loading ? (
        <div className="comp-loading-state">
          <Skeleton width="100%" height="140px" />
          <Skeleton width="100%" height="280px" />
        </div>
      ) : selectedA === selectedB && selectedA ? (
        <Card className="comp-empty-card">
          <Scale size={40} className="empty-icon text-muted" />
          <h3 className="empty-title">Select Two Different Scans</h3>
          <p className="empty-desc">
            You currently have the same version selected for both Version A and Version B. Select two distinct resumes or scans to view the comparison delta.
          </p>
        </Card>
      ) : !comparison ? (
        <Card className="comp-empty-card">
          <Scale size={40} className="empty-icon text-muted" />
          <h3 className="empty-title">Ready for Version Comparison</h3>
          <p className="empty-desc">
            Choose two scans from your audit history above to calculate progress deltas and skill improvements.
          </p>
        </Card>
      ) : (
        <div className="comp-results-layout animate-fade-in">
          {/* Top Scorecard Delta Banner */}
          <Card className="comp-delta-hero" glow>
            <div className="delta-hero-grid">
              <div className="delta-metric-box">
                <span className="delta-metric-label">Overall Match Delta</span>
                <div className={`delta-metric-value ${comparison.comparisonDelta.overallDelta >= 0 ? 'positive' : 'negative'}`}>
                  {comparison.comparisonDelta.overallDelta >= 0 ? (
                    <TrendingUp size={24} />
                  ) : (
                    <TrendingDown size={24} />
                  )}
                  <span>
                    {comparison.comparisonDelta.overallDelta >= 0 ? `+${comparison.comparisonDelta.overallDelta}` : comparison.comparisonDelta.overallDelta}%
                  </span>
                </div>
                <span className="delta-metric-sub">
                  From {comparison.versionA.overallScore}% to {comparison.versionB.overallScore}%
                </span>
              </div>

              <div className="delta-metric-box">
                <span className="delta-metric-label">ATS Parseability Delta</span>
                <div className={`delta-metric-value ${comparison.comparisonDelta.atsDelta >= 0 ? 'positive' : 'negative'}`}>
                  <span>
                    {comparison.comparisonDelta.atsDelta >= 0 ? `+${comparison.comparisonDelta.atsDelta}` : comparison.comparisonDelta.atsDelta}%
                  </span>
                </div>
                <span className="delta-metric-sub">
                  From {comparison.versionA.atsScore}% to {comparison.versionB.atsScore}%
                </span>
              </div>

              <div className="delta-metric-box">
                <span className="delta-metric-label">Job Relevancy Delta</span>
                <div className={`delta-metric-value ${comparison.comparisonDelta.jobMatchDelta >= 0 ? 'positive' : 'negative'}`}>
                  <span>
                    {comparison.comparisonDelta.jobMatchDelta >= 0 ? `+${comparison.comparisonDelta.jobMatchDelta}` : comparison.comparisonDelta.jobMatchDelta}%
                  </span>
                </div>
                <span className="delta-metric-sub">
                  From {comparison.versionA.jobMatchScore}% to {comparison.versionB.jobMatchScore}%
                </span>
              </div>

              <div className="delta-metric-box">
                <span className="delta-metric-label">Skill Gaps Resolved</span>
                <div className="delta-metric-value positive">
                  <CheckCircle2 size={24} />
                  <span>{comparison.comparisonDelta.resolvedGaps.length}</span>
                </div>
                <span className="delta-metric-sub">Target competencies added</span>
              </div>
            </div>
          </Card>

          {/* Side by side dimensional breakdown */}
          <div className="comp-side-by-side-grid">
            {/* Version A Card */}
            <Card className="comp-version-card">
              <CardHeader
                title={`Version A: ${comparison.versionA.resumeTitle}`}
                subtitle={`Target: ${comparison.versionA.targetRole} • ${new Date(comparison.versionA.createdAt).toLocaleDateString()}`}
                action={
                  <Link to={`/dashboard/results/${comparison.versionA.id}`} className="view-report-link">
                    View Report <ArrowUpRight size={14} />
                  </Link>
                }
              />
              <CardBody>
                <div className="version-score-summary">
                  <div className="v-score-row">
                    <span>Overall Score:</span>
                    <strong>{comparison.versionA.overallScore}/100</strong>
                  </div>
                  <div className="v-score-row">
                    <span>ATS Compatibility:</span>
                    <strong>{comparison.versionA.atsScore}%</strong>
                  </div>
                  <div className="v-score-row">
                    <span>Job Relevancy:</span>
                    <strong>{comparison.versionA.jobMatchScore}%</strong>
                  </div>
                  <div className="v-score-row">
                    <span>Keyword Density:</span>
                    <strong>{comparison.versionA.keywordScore}%</strong>
                  </div>
                </div>

                <div className="version-gaps-block">
                  <span className="v-gaps-title">Unresolved Gaps ({comparison.versionA.missingKeywords.length}):</span>
                  <div className="v-tags-wrap">
                    {comparison.versionA.missingKeywords.map((kw, i) => (
                      <span key={i} className="gap-tag-pill">{kw}</span>
                    ))}
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Version B Card */}
            <Card className="comp-version-card highlight">
              <CardHeader
                title={`Version B: ${comparison.versionB.resumeTitle}`}
                subtitle={`Target: ${comparison.versionB.targetRole} • ${new Date(comparison.versionB.createdAt).toLocaleDateString()}`}
                action={
                  <Link to={`/dashboard/results/${comparison.versionB.id}`} className="view-report-link">
                    View Report <ArrowUpRight size={14} />
                  </Link>
                }
              />
              <CardBody>
                <div className="version-score-summary">
                  <div className="v-score-row">
                    <span>Overall Score:</span>
                    <strong className="text-emerald">{comparison.versionB.overallScore}/100</strong>
                  </div>
                  <div className="v-score-row">
                    <span>ATS Compatibility:</span>
                    <strong className="text-emerald">{comparison.versionB.atsScore}%</strong>
                  </div>
                  <div className="v-score-row">
                    <span>Job Relevancy:</span>
                    <strong className="text-emerald">{comparison.versionB.jobMatchScore}%</strong>
                  </div>
                  <div className="v-score-row">
                    <span>Keyword Density:</span>
                    <strong className="text-emerald">{comparison.versionB.keywordScore}%</strong>
                  </div>
                </div>

                <div className="version-gaps-block">
                  <span className="v-gaps-title">Current Gaps ({comparison.versionB.missingKeywords.length}):</span>
                  <div className="v-tags-wrap">
                    {comparison.versionB.missingKeywords.map((kw, i) => (
                      <span key={i} className="gap-tag-pill">{kw}</span>
                    ))}
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Resolved Gaps Section */}
          {comparison.comparisonDelta.resolvedGaps.length > 0 && (
            <Card className="resolved-gaps-card">
              <CardHeader
                title="Successfully Resolved Competency Gaps"
                subtitle="Keywords present in Version B that were missing in Version A"
              />
              <CardBody>
                <div className="resolved-tags-grid">
                  {comparison.comparisonDelta.resolvedGaps.map((gap, i) => (
                    <div key={i} className="resolved-pill">
                      <CheckCircle2 size={16} className="text-emerald" />
                      <span>{gap}</span>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

export default ComparisonPage;
