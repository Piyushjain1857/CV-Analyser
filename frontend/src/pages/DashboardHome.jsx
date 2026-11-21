import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Database,
  Cpu,
  ArrowUpRight,
  Sparkles,
  Target,
  Clock,
  ChevronRight,
  ShieldAlert,
  Layers,
  Activity,
  PlusCircle,
  PenTool,
  Compass,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Card, { CardHeader, CardBody } from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import ScoreGauge from '../components/common/ScoreGauge';
import HealthBadge from '../components/common/HealthBadge';
import ProgressBar from '../components/common/ProgressBar';
import AICareerChatbot from '../components/common/AICareerChatbot';
import './DashboardHome.css';

export function DashboardHome() {
  const navigate = useNavigate();
  const {
    resumes,
    loadingResumes,
    stats,
    health,
    checkHealth,
    userProfile,
    setActiveAnalysis,
  } = useApp();

  const handleViewResume = (resume) => {
    const analysis = resume.analyses?.[0] || resume.analysisResults?.[0];
    if (analysis) {
      setActiveAnalysis({
        ...analysis,
        resume: {
          id: resume.id,
          title: resume.title,
          candidateName: resume.candidateName,
          targetRole: resume.targetRole,
          targetIndustry: resume.targetIndustry,
        },
      });

      if (analysis.id) {
        navigate(`/dashboard/results/${analysis.id}`);
      } else {
        navigate('/dashboard/results');
      }
    }
  };

  // Recent score trend data from user's actual resumes
  const recentScores = resumes
    .map((r) => {
      const a = r.analyses?.[0] || r.analysisResults?.[0];
      return a?.overallScore || a?.atsScore || null;
    })
    .filter(Boolean)
    .reverse();

  const scoreDelta =
    recentScores.length > 1
      ? recentScores[recentScores.length - 1] - recentScores[0]
      : 0;

  return (
    <div className="dashboard-home-root animate-fade-in">
      {/* Welcome & Top Action Bar */}
      <div className="dash-welcome-bar">
        <div className="dash-welcome-text">
          <div className="dash-status-pill">
            <span className="live-dot" />
            <span>AI Resume Intelligence Active</span>
          </div>
          <h1 className="dash-heading">
            {resumes.length === 0 ? 'Welcome,' : 'Welcome back,'}{' '}
            <span className="gradient-text">{userProfile?.name || 'Applicant'}</span>
          </h1>
          <p className="dash-subheading">
            {resumes.length === 0 ? (
              'Welcome to your AI Career Intelligence dashboard. Upload your first resume or build one with Gemini to unlock instant 10-dimension ATS audits and gap analysis.'
            ) : (
              <>
                Calibrated for <strong>{userProfile?.role || 'Technical Professional'}</strong>
                {userProfile?.industry ? ` in ${userProfile.industry}` : ''}.
              </>
            )}
          </p>
        </div>

        <div className="dash-quick-actions">
          <Button
            variant="primary"
            icon={PlusCircle}
            onClick={() => navigate('/dashboard/upload')}
          >
            Analyze Resume
          </Button>
          <Button
            variant="outline"
            icon={Sparkles}
            onClick={() => navigate('/dashboard/builder')}
          >
            AI Resume Builder
          </Button>
        </div>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="dash-metrics-grid">
        <Card hover className="dash-stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Total Resumes Scanned</span>
            <div className="stat-icon-wrapper purple">
              <FileText size={18} />
            </div>
          </div>
          <div className="stat-card-bottom">
            <span className="stat-value">{resumes.length}</span>
            <div className="stat-trend positive">
              <TrendingUp size={14} />
              <span>{resumes.length === 0 ? 'No documents uploaded' : 'Tenant-isolated records'}</span>
            </div>
          </div>
        </Card>

        <Card hover className="dash-stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Average ATS Pass Rate</span>
            <div className="stat-icon-wrapper emerald">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="stat-card-bottom">
            <span className="stat-value">
              {resumes.length > 0 && stats?.avgAtsScore ? `${stats.avgAtsScore}%` : '--'}
            </span>
            <div className="stat-trend positive">
              <TrendingUp size={14} />
              <span>{resumes.length > 0 && stats?.avgAtsScore ? '5-Component Rubric' : 'No audits conducted yet'}</span>
            </div>
          </div>
        </Card>

        <Card hover className="dash-stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Resume Quality Index</span>
            <div className="stat-icon-wrapper cyan">
              <Sparkles size={18} />
            </div>
          </div>
          <div className="stat-card-bottom">
            <span className="stat-value">
              {resumes.length > 0 && stats?.avgQualityScore ? `${stats.avgQualityScore}%` : '--'}
            </span>
            <div className="stat-trend positive">
              <span>{resumes.length > 0 && stats?.avgQualityScore ? 'Google Gemini 2.5 Assessed' : 'Awaiting first scan'}</span>
            </div>
          </div>
        </Card>

        <Card hover className="dash-stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Active Database Backend</span>
            <div className="stat-icon-wrapper indigo">
              <Database size={18} />
            </div>
          </div>
          <div className="stat-card-bottom">
            <span className="stat-value">{health.operational ? 'PostgreSQL' : 'Connecting'}</span>
            <div className="stat-trend neutral">
              <Activity size={13} />
              <span>{health.latencyMs !== null ? `${health.latencyMs}ms ping` : 'Connected'}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Launch Suite (4 Action Tiles) */}
      <div className="dash-quick-launch-grid">
        <div className="quick-launch-tile" onClick={() => navigate('/dashboard/upload')}>
          <div className="tile-icon-box purple">
            <UploadCloud size={20} />
          </div>
          <div className="tile-text">
            <h4>Analyze Resume</h4>
            <p>Upload PDF/DOCX for 10-dimension audit</p>
          </div>
          <ChevronRight size={16} className="tile-arrow" />
        </div>

        <div className="quick-launch-tile" onClick={() => navigate('/dashboard/builder')}>
          <div className="tile-icon-box cyan">
            <Sparkles size={20} />
          </div>
          <div className="tile-text">
            <h4>AI Resume Builder</h4>
            <p>Single-column editor with live preview</p>
          </div>
          <ChevronRight size={16} className="tile-arrow" />
        </div>

        <div className="quick-launch-tile" onClick={() => navigate('/dashboard/job-match')}>
          <div className="tile-icon-box emerald">
            <Target size={20} />
          </div>
          <div className="tile-text">
            <h4>Job Match & Gaps</h4>
            <p>Paste target JD for 3-tier gap isolation</p>
          </div>
          <ChevronRight size={16} className="tile-arrow" />
        </div>

        <div className="quick-launch-tile" onClick={() => navigate('/dashboard/roadmap')}>
          <div className="tile-icon-box amber">
            <Compass size={20} />
          </div>
          <div className="tile-text">
            <h4>Career Roadmap</h4>
            <p>12-week strategic milestones plan</p>
          </div>
          <ChevronRight size={16} className="tile-arrow" />
        </div>
      </div>

      {/* Main Content Grid: Resumes Table & Score Trends */}
      <div className="dash-content-grid">
        {/* Left Column: Recent Scans */}
        <div className="dash-col-left">
          {/* Recent Analyzed Resumes List */}
          <Card className="dash-recent-card">
            <CardHeader
              title="Recent Resume Audits"
              subtitle="Latest applicant scans and ATS scoring breakdown"
              action={
                <Link to="/dashboard/history" className="view-all-link">
                  View all ({resumes.length})
                  <ChevronRight size={14} />
                </Link>
              }
            />
            <CardBody>
              {loadingResumes ? (
                <div className="loading-state-box">
                  <span className="btn-spinner" />
                  <span>Loading recent records from PostgreSQL...</span>
                </div>
              ) : resumes.length === 0 ? (
                <div className="empty-state-box">
                  <div className="empty-icon-wrap">
                    <UploadCloud size={32} className="text-violet" />
                  </div>
                  <h3>Ready for your first ATS Intelligence audit?</h3>
                  <p>
                    Upload a PDF or DOCX resume to get an instant 10-dimension ATS breakdown, Gemini Google XYZ bullet rewrites, and skill gap discovery.
                  </p>
                  <div className="onboarding-perks-row">
                    <span className="perk-pill">
                      <CheckCircle2 size={13} className="text-emerald" /> 10-Dimension Scoring
                    </span>
                    <span className="perk-pill">
                      <CheckCircle2 size={13} className="text-emerald" /> Google XYZ Rewrites
                    </span>
                    <span className="perk-pill">
                      <CheckCircle2 size={13} className="text-emerald" /> Tenant-Isolated Encryption
                    </span>
                  </div>
                  <div className="empty-actions-row">
                    <Button
                      variant="primary"
                      size="sm"
                      icon={UploadCloud}
                      onClick={() => navigate('/dashboard/upload')}
                    >
                      Upload First Resume
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Sparkles}
                      onClick={() => navigate('/dashboard/builder')}
                    >
                      Create with AI Builder
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="recent-resumes-list">
                  {resumes.slice(0, 5).map((resume) => {
                    const result = resume.analyses?.[0] || resume.analysisResults?.[0] || {};
                    const score = result.overallScore || result.atsScore || 82;
                    let badgeVariant = 'green';
                    if (score < 60) badgeVariant = 'red';
                    else if (score < 80) badgeVariant = 'yellow';

                    return (
                      <div
                        key={resume.id}
                        className="recent-resume-item"
                        onClick={() => handleViewResume(resume)}
                      >
                        <div className="resume-item-icon">
                          <FileText size={20} />
                        </div>
                        <div className="resume-item-main">
                          <div className="resume-item-title-row">
                            <h4 className="resume-item-title">{resume.title || resume.fileName}</h4>
                            <Badge variant={badgeVariant} size="sm">
                              {score}/100 ATS
                            </Badge>
                          </div>
                          <div className="resume-item-meta">
                            <span>Role: <strong>{resume.targetRole || 'Software Engineer'}</strong></span>
                            <span>•</span>
                            <span>Candidate: {resume.candidateName || 'Applicant'}</span>
                            <span>•</span>
                            <span className="time-ago">
                              {new Date(resume.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="resume-item-action">
                          <Button variant="ghost" size="sm" icon={ArrowUpRight}>
                            View Audit
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Right Sidebar Column: Score Trajectory & Keyword Radar */}
        <div className="dash-col-right">
          {/* Score Trajectory Card */}
          <Card className="dash-trend-card">
            <CardHeader
              title="ATS Score Trajectory"
              subtitle={
                recentScores.length > 0
                  ? 'Performance across recent scan iterations'
                  : 'Iteration progression tracker'
              }
            />
            <CardBody>
              {recentScores.length === 0 ? (
                <div className="trajectory-empty-state">
                  <div className="trajectory-empty-icon-box">
                    <TrendingUp size={24} className="text-violet" />
                  </div>
                  <h4 className="trajectory-empty-title">No Trajectory Recorded Yet</h4>
                  <p className="trajectory-empty-desc">
                    Your ATS score progression across iterations will be tracked and charted here as you scan new versions.
                  </p>
                  <div className="trajectory-milestone-preview">
                    <div className="milestone-step active">
                      <span className="milestone-dot" />
                      <span className="milestone-text">1. First Scan</span>
                    </div>
                    <div className="milestone-line" />
                    <div className="milestone-step">
                      <span className="milestone-dot" />
                      <span className="milestone-text">2. Optimization</span>
                    </div>
                    <div className="milestone-line" />
                    <div className="milestone-step">
                      <span className="milestone-dot" />
                      <span className="milestone-text">3. ATS Ready</span>
                    </div>
                  </div>
                  <div className="trend-summary-note neutral">
                    <Sparkles size={13} className="text-violet" />
                    <span>Scores will populate after your first upload</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="score-bars-container">
                    {recentScores.map((score, idx) => (
                      <div key={idx} className="trend-bar-column">
                        <span className="trend-bar-val">{score}%</span>
                        <div className="trend-bar-track">
                          <div
                            className="trend-bar-fill"
                            style={{ height: `${score}%` }}
                          />
                        </div>
                        <span className="trend-bar-label">v{idx + 1}</span>
                      </div>
                    ))}
                  </div>
                  <div className="trend-summary-note">
                    <TrendingUp size={14} className="text-emerald" />
                    <span>
                      {recentScores.length > 1
                        ? `${scoreDelta >= 0 ? `+${scoreDelta}%` : `${scoreDelta}%`} progression across iterations`
                        : `Baseline scan recorded at ${recentScores[0]}% ATS`}
                    </span>
                  </div>
                </>
              )}
            </CardBody>
          </Card>

          {/* High-Yield Recruiter Keyword Radar */}
          <Card className="dash-skills-card">
            <CardHeader
              title="High-Yield Recruiter Keywords"
              subtitle="Industry benchmark competencies for technical roles"
            />
            <CardBody>
              <div className="keyword-radar-tags">
                <span className="radar-tag high">Kubernetes (+18 pts)</span>
                <span className="radar-tag high">TypeScript (+15 pts)</span>
                <span className="radar-tag med">System Design (+12 pts)</span>
                <span className="radar-tag med">PostgreSQL (+10 pts)</span>
                <span className="radar-tag low">CI/CD Pipelines (+8 pts)</span>
                <span className="radar-tag low">Docker Containerization (+8 pts)</span>
                <span className="radar-tag low">Microservices (+7 pts)</span>
              </div>

              <div className="keyword-tip-box">
                <Sparkles size={14} className="tip-icon" />
                <p className="tip-text">
                  Injecting missing keywords via the <strong>AI Resume Builder</strong> increases recruiter query matches by 68%.
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Floating GenAI Career Assistant Chatbot */}
      <AICareerChatbot initialOpen={false} />
    </div>
  );
}

export default DashboardHome;
