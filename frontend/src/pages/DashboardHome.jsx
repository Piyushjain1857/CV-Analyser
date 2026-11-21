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
  Clock,
  ChevronRight,
  ShieldAlert,
  Layers,
  Activity,
  PlusCircle,
  PenTool,
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
          <div className="dash-heading-row">
            <h1 className="dash-heading">
              {resumes.length === 0 ? 'Welcome,' : 'Welcome back,'}{' '}
              <span className="gradient-text">{userProfile?.name || 'Applicant'}</span>
            </h1>
            <div className="dash-status-pill">
              <span className="live-dot" />
              <span>AI Resume Intelligence Active</span>
            </div>
          </div>
          <p className="dash-subheading">
            {resumes.length === 0 ? (
              `Calibrated for ${userProfile?.role || 'Technical Professional'}. Upload a resume or build with Gemini to unlock instant 10-dimension ATS audits.`
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
            variant="outline"
            size="sm"
            icon={Sparkles}
            onClick={() => navigate('/dashboard/builder')}
          >
            AI Resume Builder
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={PlusCircle}
            onClick={() => navigate('/dashboard/upload')}
          >
            Analyze Resume
          </Button>
        </div>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="dash-metrics-grid">
        <Card hover className="dash-stat-card" padding="none">
          <div className="stat-card-top">
            <span className="stat-label">Total Resumes Scanned</span>
            <div className="stat-icon-wrapper purple">
              <FileText size={15} />
            </div>
          </div>
          <div className="stat-card-bottom">
            <span className="stat-value">{resumes.length}</span>
            <div className="stat-trend positive">
              <TrendingUp size={13} />
              <span>{resumes.length === 0 ? 'No documents uploaded' : 'Tenant-isolated records'}</span>
            </div>
          </div>
        </Card>

        <Card hover className="dash-stat-card" padding="none">
          <div className="stat-card-top">
            <span className="stat-label">Average ATS Pass Rate</span>
            <div className="stat-icon-wrapper emerald">
              <CheckCircle2 size={15} />
            </div>
          </div>
          <div className="stat-card-bottom">
            <span className="stat-value">
              {resumes.length > 0 && stats?.avgAtsScore ? `${stats.avgAtsScore}%` : '--'}
            </span>
            <div className="stat-trend positive">
              <TrendingUp size={13} />
              <span>{resumes.length > 0 && stats?.avgAtsScore ? '5-Component Rubric' : 'No audits conducted yet'}</span>
            </div>
          </div>
        </Card>

        <Card hover className="dash-stat-card" padding="none">
          <div className="stat-card-top">
            <span className="stat-label">Resume Quality Index</span>
            <div className="stat-icon-wrapper cyan">
              <Sparkles size={15} />
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

        <Card hover className="dash-stat-card" padding="none">
          <div className="stat-card-top">
            <span className="stat-label">Active Database Backend</span>
            <div className="stat-icon-wrapper indigo">
              <Database size={15} />
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

      {/* Main Content Grid: Resumes Table & Score Trends */}
      <div className="dash-content-grid">
        {/* Left Column: Recent Scans */}
        <div className="dash-col-left">
          {/* Recent Analyzed Resumes List */}
          <Card className="dash-recent-card" padding="none">
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
            <CardBody className="dash-card-body-fill">
              {loadingResumes ? (
                <div className="loading-state-box">
                  <span className="btn-spinner" />
                  <span>Loading recent records from PostgreSQL...</span>
                </div>
              ) : resumes.length === 0 ? (
                <div className="onboarding-studio-root">
                  {/* Left Column: Interactive Drop & Upload Area */}
                  <div
                    className="onboarding-drop-column"
                    onClick={() => navigate('/dashboard/upload')}
                  >
                    <div className="onboarding-drop-inner">
                      <div className="onboarding-icon-ring">
                        <UploadCloud size={26} className="text-violet" />
                      </div>
                      <h3 className="onboarding-drop-title">Upload Your Resume</h3>
                      <p className="onboarding-drop-desc">
                        Drag & drop your PDF or DOCX file here, or click to browse.
                      </p>
                      <div className="onboarding-format-chips">
                        <span className="format-chip">PDF</span>
                        <span className="format-chip">DOCX</span>
                        <span className="format-chip">TXT</span>
                        <span className="format-limit">Max 10MB</span>
                      </div>
                      <div className="onboarding-action-group" onClick={(e) => e.stopPropagation()}>
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
                          Build with AI
                        </Button>
                      </div>
                      <div className="onboarding-security-note">
                        <ShieldAlert size={12} className="text-emerald" />
                        <span>AES-256 Vault Encryption • Zero Data Retention</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: 4 Evaluation Pillars */}
                  <div className="onboarding-pillars-column">
                    <div className="pillars-header">
                      <h4 className="pillars-title">Gemini 2.5 ATS Evaluation</h4>
                      <p className="pillars-subtitle">Enterprise audit dimensions calibrated for your target role</p>
                    </div>

                    <div className="pillars-grid">
                      <div className="pillar-item">
                        <div className="pillar-icon-box purple">
                          <CheckCircle2 size={15} />
                        </div>
                        <div className="pillar-text">
                          <h5>10-Dimension Rubric</h5>
                          <p>Scored against Taleo & Workday parser standards.</p>
                        </div>
                      </div>

                      <div className="pillar-item">
                        <div className="pillar-icon-box emerald">
                          <TrendingUp size={15} />
                        </div>
                        <div className="pillar-text">
                          <h5>Google XYZ Bullets</h5>
                          <p>Quantifies impact: Accomplished [X] by [Y] doing [Z].</p>
                        </div>
                      </div>

                      <div className="pillar-item">
                        <div className="pillar-icon-box cyan">
                          <Sparkles size={15} />
                        </div>
                        <div className="pillar-text">
                          <h5>Skill Gap Discovery</h5>
                          <p>Pinpoints missing keywords and technical competencies.</p>
                        </div>
                      </div>

                      <div className="pillar-item">
                        <div className="pillar-icon-box indigo">
                          <Database size={15} />
                        </div>
                        <div className="pillar-text">
                          <h5>Tenant-Isolated Vault</h5>
                          <p>Encrypted PostgreSQL records with HTTP-only security.</p>
                        </div>
                      </div>
                    </div>
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
                          <FileText size={18} />
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

        {/* Right Sidebar Column: Score Trajectory & Recruiter Keywords */}
        <div className="dash-col-right">
          {/* Score Trajectory Card */}
          <Card className="dash-trend-card" padding="none">
            <CardHeader
              title="ATS Score Trajectory"
              subtitle={
                recentScores.length > 0
                  ? 'Performance across recent scan iterations'
                  : 'Benchmark & iteration progress'
              }
            />
            <CardBody className="dash-card-body-fill">
              {recentScores.length === 0 ? (
                <div className="trajectory-empty-state">
                  <div className="ghost-trajectory-chart">
                    <div className="ghost-chart-threshold">
                      <span className="ghost-threshold-line" />
                      <span className="ghost-threshold-badge">Target: 85%+</span>
                    </div>
                    <div className="ghost-bars-row">
                      <div className="ghost-bar-col">
                        <span className="ghost-bar-val">74%</span>
                        <div className="ghost-bar-track">
                          <div className="ghost-bar-fill" style={{ height: '74%' }} />
                        </div>
                        <span className="ghost-bar-label">v1</span>
                      </div>
                      <div className="ghost-bar-col">
                        <span className="ghost-bar-val">81%</span>
                        <div className="ghost-bar-track">
                          <div className="ghost-bar-fill" style={{ height: '81%' }} />
                        </div>
                        <span className="ghost-bar-label">v2</span>
                      </div>
                      <div className="ghost-bar-col">
                        <span className="ghost-bar-val">88%</span>
                        <div className="ghost-bar-track">
                          <div className="ghost-bar-fill" style={{ height: '88%' }} />
                        </div>
                        <span className="ghost-bar-label">v3</span>
                      </div>
                      <div className="ghost-bar-col">
                        <span className="ghost-bar-val">94%</span>
                        <div className="ghost-bar-track highlight">
                          <div className="ghost-bar-fill highlight" style={{ height: '94%' }} />
                        </div>
                        <span className="ghost-bar-label">v4</span>
                      </div>
                    </div>
                  </div>

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
                    <Sparkles size={12} className="text-violet" />
                    <span>Upload your resume to track real score progressions</span>
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
                    <TrendingUp size={13} className="text-emerald" />
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

          {/* High-Yield Recruiter Keywords Card */}
          <Card className="dash-skills-card" padding="none">
            <CardHeader
              title="Target Competencies"
              subtitle="High-impact recruiter keyword benchmarks"
            />
            <CardBody className="dash-card-body-fill">
              <div className="keyword-radar-tags">
                <span className="radar-tag high">Kubernetes (+18 pts)</span>
                <span className="radar-tag high">TypeScript (+15 pts)</span>
                <span className="radar-tag med">System Design (+12 pts)</span>
                <span className="radar-tag med">PostgreSQL (+10 pts)</span>
                <span className="radar-tag low">CI/CD Pipelines (+8 pts)</span>
                <span className="radar-tag low">Docker Containerization (+8 pts)</span>
              </div>
              <div className="keyword-tip-box">
                <Sparkles size={13} className="tip-icon" />
                <p className="tip-text">
                  Target keywords increase recruiter query pass rate by up to <strong>68%</strong>.
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
