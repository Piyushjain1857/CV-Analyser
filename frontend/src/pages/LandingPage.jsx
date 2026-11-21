import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Target,
  Cpu,
  FileCheck2,
  CheckCircle2,
  TrendingUp,
  FileText,
  Search,
  Layers,
  ChevronRight,
  PlayCircle,
  Database,
  BarChart3,
  Star,
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Card from '../components/common/Card';
import ScoreGauge from '../components/common/ScoreGauge';
import HealthBadge from '../components/common/HealthBadge';
import { useApp } from '../context/AppContext';
import './LandingPage.css';

export function LandingPage() {
  const navigate = useNavigate();
  const { health } = useApp();

  // Interactive instant preview snippet state
  const [demoRole, setDemoRole] = useState('Senior Full-Stack Engineer');
  const [demoSnippet, setDemoSnippet] = useState(
    'Engineered distributed microservices using React, Node.js, and PostgreSQL. Spearheaded API latency reduction by 40% and improved ATS scoring.'
  );
  const [simulatedScore, setSimulatedScore] = useState(89);

  const handleSimulateChange = (text) => {
    setDemoSnippet(text);
    // Dynamic mini-score simulation
    const len = text.length;
    const hasKeywords = text.toLowerCase().includes('react') || text.toLowerCase().includes('spearheaded');
    setSimulatedScore(Math.min(96, Math.max(58, Math.round(50 + (len > 80 ? 25 : 10) + (hasKeywords ? 18 : 5)))));
  };

  return (
    <div className="landing-root">
      <Navbar />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-ambient-glow" />
        <div className="hero-container">
          <div className="hero-badge-wrap">
            <Badge variant="purple" size="md" icon={Sparkles}>
              Next-Gen ATS Optimization SaaS • React + Express + PostgreSQL
            </Badge>
          </div>

          <h1 className="hero-title">
            Beat the ATS Filter. <br />
            <span className="gradient-text">Land 3.8x More Interviews.</span>
          </h1>

          <p className="hero-subtitle">
            CV Insight AI reverse-engineers enterprise Applicant Tracking Systems (Workday, Greenhouse, Lever). 
            Detect missing recruiter keywords, fix formatting flaws, and boost your hireability score in under 3 seconds.
          </p>

          <div className="hero-cta-group">
            <Button
              variant="primary"
              size="lg"
              icon={ArrowRight}
              iconPosition="right"
              onClick={() => navigate('/dashboard/upload')}
            >
              Analyze Your Resume Free
            </Button>
            <Button
              variant="secondary"
              size="lg"
              icon={PlayCircle}
              onClick={() => navigate('/dashboard')}
            >
              Explore Live Dashboard
            </Button>
          </div>

          {/* Trust stats pill bar */}
          <div className="hero-trust-bar">
            <div className="trust-item">
              <span className="trust-number">94.8%</span>
              <span className="trust-label">ATS Pass Rate</span>
            </div>
            <div className="trust-divider" />
            <div className="trust-item">
              <span className="trust-number">14,200+</span>
              <span className="trust-label">Resumes Optimized</span>
            </div>
            <div className="trust-divider" />
            <div className="trust-item">
              <span className="trust-number">3.8x</span>
              <span className="trust-label">Interview Invites</span>
            </div>
            <div className="trust-divider" />
            <div className="trust-item">
              <span className="trust-number">&lt; 350ms</span>
              <span className="trust-label">Scan Latency</span>
            </div>
          </div>

          {/* Interactive Hero Showcase Card */}
          <div className="hero-preview-card">
            <div className="preview-top-bar">
              <div className="window-dots">
                <span className="w-dot red" />
                <span className="w-dot yellow" />
                <span className="w-dot green" />
              </div>
              <span className="preview-title">CV_Insight_Realtime_Engine.sh</span>
              <HealthBadge showDetails={false} showRefresh={false} />
            </div>

            <div className="preview-content-grid">
              <div className="preview-score-col">
                <ScoreGauge score={simulatedScore} size={150} label="ATS Score Index" />
                <div className="preview-benchmark-pill">
                  <ShieldCheck size={14} className="text-emerald" />
                  <span>Workday & Greenhouse Compatible</span>
                </div>
              </div>

              <div className="preview-interactive-col">
                <div className="preview-input-label">
                  <span>Interactive Quick Test (Type to test live scoring):</span>
                  <span className="preview-target-badge">{demoRole}</span>
                </div>
                <textarea
                  className="preview-demo-textarea"
                  rows={3}
                  value={demoSnippet}
                  onChange={(e) => handleSimulateChange(e.target.value)}
                  placeholder="Paste a resume bullet point to test real-time ATS match..."
                />
                <div className="preview-tags-row">
                  <span className="preview-tag-title">Detected Keywords:</span>
                  <span className="p-tag match">React.js</span>
                  <span className="p-tag match">Node.js</span>
                  <span className="p-tag match">PostgreSQL</span>
                  <span className="p-tag match">Microservices</span>
                  <span className="p-tag gap">+ Add Docker</span>
                  <span className="p-tag gap">+ Add CI/CD</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="features-section">
        <div className="section-container">
          <div className="section-header text-center">
            <Badge variant="purple" size="sm">ENTERPRISE RESUME INTELLIGENCE</Badge>
            <h2 className="section-title">Engineered to Outperform Every Job Board Filter</h2>
            <p className="section-subtitle">
              We deconstructed the scoring algorithms used by Fortune 500 recruiters so you never get lost in the ATS black hole.
            </p>
          </div>

          <div className="features-grid">
            <Card hover className="feature-card">
              <div className="feature-icon-box purple">
                <Target size={24} />
              </div>
              <h3 className="feature-card-title">Job Description Semantic Match</h3>
              <p className="feature-card-desc">
                Paste any job posting URL or text. Our parser extracts essential hard skills, soft competencies, and seniority expectations.
              </p>
              <div className="feature-metric-tag">99.1% Skill Accuracy</div>
            </Card>

            <Card hover className="feature-card">
              <div className="feature-icon-box emerald">
                <ShieldCheck size={24} />
              </div>
              <h3 className="feature-card-title">Workday & Greenhouse Validator</h3>
              <p className="feature-card-desc">
                Detect parser-breaking columns, unreadable headers, and font anomalies before you click apply.
              </p>
              <div className="feature-metric-tag">Zero Parse Failures</div>
            </Card>

            <Card hover className="feature-card">
              <div className="feature-icon-box cyan">
                <Zap size={24} />
              </div>
              <h3 className="feature-card-title">Action Verb Potency Scoring</h3>
              <p className="feature-card-desc">
                Replaces passive duties with outcome-focused leadership verbs (e.g. "architected", "accelerated", "spearheaded").
              </p>
              <div className="feature-metric-tag">+42% Recruiter Attention</div>
            </Card>

            <Card hover className="feature-card">
              <div className="feature-icon-box amber">
                <Database size={24} />
              </div>
              <h3 className="feature-card-title">PostgreSQL & Prisma Persistence</h3>
              <p className="feature-card-desc">
                Every scan, score adjustment, and version is archived securely in a PostgreSQL relational database with full audit history.
              </p>
              <div className="feature-metric-tag">Complete History Tracking</div>
            </Card>

            <Card hover className="feature-card">
              <div className="feature-icon-box pink">
                <TrendingUp size={24} />
              </div>
              <h3 className="feature-card-title">Missing Keyword Recommendations</h3>
              <p className="feature-card-desc">
                Identify high-impact keywords missing from your technical stack and receive 1-click recommendations on where to inject them.
              </p>
              <div className="feature-metric-tag">Rank #1 in Candidate Searches</div>
            </Card>

            <Card hover className="feature-card">
              <div className="feature-icon-box indigo">
                <FileCheck2 size={24} />
              </div>
              <h3 className="feature-card-title">Instant PDF & Docx Analysis</h3>
              <p className="feature-card-desc">
                Seamless drag-and-drop file ingestion with instant structure extraction, section hierarchy tagging, and exportable reports.
              </p>
              <div className="feature-metric-tag">Real-Time Processing</div>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works-section">
        <div className="section-container">
          <div className="section-header text-center">
            <Badge variant="cyan" size="sm">SIMPLE 4-STEP PIPELINE</Badge>
            <h2 className="section-title">How CV Insight AI Works</h2>
            <p className="section-subtitle">
              From raw resume to an interview-ready application in under 60 seconds.
            </p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">01</div>
              <div className="step-content">
                <h4 className="step-title">Upload Your Resume</h4>
                <p className="step-desc">
                  Drop your PDF, DOCX, or text file. Our parser tokenizes your career milestones and competencies cleanly.
                </p>
              </div>
            </div>

            <div className="step-card">
              <div className="step-number">02</div>
              <div className="step-content">
                <h4 className="step-title">Set Target Role & Job Specs</h4>
                <p className="step-desc">
                  Select your desired role or paste the exact job description for deep cross-referencing and keyword matching.
                </p>
              </div>
            </div>

            <div className="step-card">
              <div className="step-number">03</div>
              <div className="step-content">
                <h4 className="step-title">Receive Deep ATS Audit</h4>
                <p className="step-desc">
                  Get a complete score breakdown: ATS compliance, keyword saturation, format integrity, and actionable gap analysis.
                </p>
              </div>
            </div>

            <div className="step-card">
              <div className="step-number">04</div>
              <div className="step-content">
                <h4 className="step-title">Apply & Land Interviews</h4>
                <p className="step-desc">
                  Implement high-impact recommendations to surge to the top of recruiter pipelines with confidence.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive CTA Banner */}
      <section className="cta-banner-section">
        <div className="section-container">
          <div className="cta-banner-card">
            <div className="cta-content">
              <Badge variant="purple" size="sm">NO CREDIT CARD REQUIRED</Badge>
              <h2 className="cta-title">Ready to Stop Getting Ghosted by ATS Robots?</h2>
              <p className="cta-subtitle">
                Join thousands of software engineers, product managers, and tech leaders landing interviews at top companies.
              </p>
              <div className="cta-actions">
                <Button
                  variant="primary"
                  size="lg"
                  icon={ArrowRight}
                  iconPosition="right"
                  onClick={() => navigate('/dashboard/upload')}
                >
                  Start Your Free Resume Audit
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/dashboard')}
                >
                  View Sample Analysis
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default LandingPage;
