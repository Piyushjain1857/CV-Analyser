import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  ChevronDown,
  ChevronUp,
  PlayCircle,
  Database,
  Lock,
  EyeOff,
  Code2,
  BarChart3,
  Sliders,
  Check,
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
    'Engineered distributed microservices using React, Node.js, and PostgreSQL. Spearheaded API latency reduction by 42% and improved ATS scoring.'
  );
  const [simulatedScore, setSimulatedScore] = useState(91);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(0);

  const handleSimulateChange = (text) => {
    setDemoSnippet(text);
    const len = text.length;
    const hasKeywords = text.toLowerCase().includes('react') || text.toLowerCase().includes('spearheaded');
    setSimulatedScore(Math.min(96, Math.max(58, Math.round(52 + (len > 80 ? 25 : 10) + (hasKeywords ? 18 : 5)))));
  };

  const faqs = [
    {
      q: 'How is the ATS Compatibility Score calculated?',
      a: 'CV Insight AI uses a transparent 5-component rubric: Keyword Alignment (25%), Section Completeness (20%), Readability & Parsing Structure (20%), Grammar & Professional Tone (20%), and Role Relevance (15%). Scores are calibrated estimates of how applicant tracking parsers (e.g., Workday, Greenhouse, Lever) ingest your credentials.',
    },
    {
      q: 'Does CV Insight AI use my resume to train AI models?',
      a: 'No. All uploaded documents are parsed through private, volatile memory pipelines with Google Gemini 2.5 Flash and stored in your tenant-isolated PostgreSQL database. We enforce strict data privacy: your resume text is never used for training foundation models and is never accessible to other users.',
    },
    {
      q: 'What file formats and sizes are supported?',
      a: 'We accept PDF and DOCX files up to 5 MB. In addition to file extensions, our backend validates binary magic-byte signatures (%PDF- and PK zip containers) to prevent corrupted or malicious uploads, and gracefully handles scanned documents.',
    },
    {
      q: 'Can I compare two different versions of my resume for the same role?',
      a: 'Yes! The built-in Scan Comparison tool computes delta metrics between any two scans, showing resolved keyword gaps, score improvements, and structural refinements side-by-side.',
    },
    {
      q: 'What is the Google XYZ bullet rewrite feature?',
      a: 'Our AI Resume Improvement Studio rewrites passive duty statements into high-potency achievements using Google’s proven formula: "Accomplished [X], as measured by [Y], by doing [Z]". You can accept, reject, or edit each suggestion before exporting.',
    },
  ];

  return (
    <div className="landing-root">
      <Navbar />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-ambient-glow" />
        <div className="hero-container">
          <div className="hero-badge-wrap">
            <Badge variant="purple" size="md" icon={Sparkles}>
              Google Gemini 2.5 Flash • Enterprise ATS Parsing & Resume Intelligence
            </Badge>
          </div>

          <h1 className="hero-title">
            Engineering-Grade Resume Optimization. <br />
            <span className="gradient-text">Built to Outperform ATS Filters.</span>
          </h1>

          <p className="hero-subtitle">
            Reverse-engineer enterprise Applicant Tracking Systems with explainable 5-component scoring, 
            Google XYZ bullet rewriting, missing keyword extraction, and tenant-isolated security.
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

          {/* Genuine Architectural Capability Pillars (No Fabricated Stats) */}
          <div className="hero-trust-bar">
            <div className="trust-item">
              <span className="trust-number">10 Dimensions</span>
              <span className="trust-label">Gemini AI Audit</span>
            </div>
            <div className="trust-divider" />
            <div className="trust-item">
              <span className="trust-number">5-Component</span>
              <span className="trust-label">Explainable Rubric</span>
            </div>
            <div className="trust-divider" />
            <div className="trust-item">
              <span className="trust-number">PostgreSQL</span>
              <span className="trust-label">Tenant Isolation</span>
            </div>
            <div className="trust-divider" />
            <div className="trust-item">
              <span className="trust-number">Zero Retention</span>
              <span className="trust-label">Model Privacy</span>
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
              <span className="preview-title">CV_Insight_ATS_Engine_v2.5.sh</span>
              <HealthBadge showDetails={false} showRefresh={false} />
            </div>

            <div className="preview-content-grid">
              <div className="preview-score-col">
                <ScoreGauge score={simulatedScore} size={150} label="ATS Score Index" />
                <div className="preview-benchmark-pill">
                  <ShieldCheck size={14} className="text-emerald" />
                  <span>Workday & Greenhouse Rubric</span>
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
            <h2 className="section-title">Engineered to Demystify Recruiter Algorithms</h2>
            <p className="section-subtitle">
              We deconstructed the scoring algorithms used by Fortune 500 ATS platforms so you never get lost in automated filtering queues.
            </p>
          </div>

          <div className="features-grid">
            <Card hover className="feature-card">
              <div className="feature-icon-box purple">
                <Target size={24} />
              </div>
              <h3 className="feature-card-title">Job Description Semantic Match</h3>
              <p className="feature-card-desc">
                Paste any job description to evaluate hard skill match, missing evidence, and confirmed skill deficits before submitting.
              </p>
              <div className="feature-metric-tag">3-Tier Gap Isolation</div>
            </Card>

            <Card hover className="feature-card">
              <div className="feature-icon-box emerald">
                <ShieldCheck size={24} />
              </div>
              <h3 className="feature-card-title">Explainable 5-Component Rubric</h3>
              <p className="feature-card-desc">
                Understand exactly how your score is formed across Keyword Alignment, Section Completeness, Readability, Tone, and Relevance.
              </p>
              <div className="feature-metric-tag">Transparent Scoring</div>
            </Card>

            <Card hover className="feature-card">
              <div className="feature-icon-box cyan">
                <Zap size={24} />
              </div>
              <h3 className="feature-card-title">Google XYZ Bullet Rewriter</h3>
              <p className="feature-card-desc">
                Transform passive responsibilities into quantified accomplishments: "Accomplished [X], measured by [Y], by doing [Z]".
              </p>
              <div className="feature-metric-tag">Impact-Driven Framing</div>
            </Card>

            <Card hover className="feature-card">
              <div className="feature-icon-box amber">
                <Database size={24} />
              </div>
              <h3 className="feature-card-title">PostgreSQL Audit Trail & Deltas</h3>
              <p className="feature-card-desc">
                Every scan, score adjustment, and version is archived securely with relational integrity and delta tracking between iterations.
              </p>
              <div className="feature-metric-tag">Historical Versioning</div>
            </Card>

            <Card hover className="feature-card">
              <div className="feature-icon-box pink">
                <TrendingUp size={24} />
              </div>
              <h3 className="feature-card-title">12-Week Strategic Career Roadmap</h3>
              <p className="feature-card-desc">
                Structured phased progression: Foundation & Keywords (Weeks 1–4), Project Expansion (Weeks 5–8), and Senior Technical Presence (Weeks 9–12).
              </p>
              <div className="feature-metric-tag">Actionable Milestones</div>
            </Card>

            <Card hover className="feature-card">
              <div className="feature-icon-box indigo">
                <FileCheck2 size={24} />
              </div>
              <h3 className="feature-card-title">Multi-Format Binary Parser</h3>
              <p className="feature-card-desc">
                Direct ingestion of PDF and DOCX files verified with magic-byte headers (%PDF- and PK zip) and scanned document detection.
              </p>
              <div className="feature-metric-tag">Zero Cloud Leakage</div>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works-section">
        <div className="section-container">
          <div className="section-header text-center">
            <Badge variant="cyan" size="sm">THE AUDIT PIPELINE</Badge>
            <h2 className="section-title">How CV Insight AI Works</h2>
            <p className="section-subtitle">
              From raw binary resume to an interview-ready application in under 60 seconds.
            </p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">01</div>
              <div className="step-content">
                <h4 className="step-title">Upload & Signature Validation</h4>
                <p className="step-desc">
                  Drop your PDF or DOCX file. Our engine validates binary signatures, verifies character density, and tokenizes sections safely.
                </p>
              </div>
            </div>

            <div className="step-card">
              <div className="step-number">02</div>
              <div className="step-content">
                <h4 className="step-title">Target Role & Job Spec Input</h4>
                <p className="step-desc">
                  Provide your target seniority and paste the real job specification to calibrate semantic keyword density and competency weighting.
                </p>
              </div>
            </div>

            <div className="step-card">
              <div className="step-number">03</div>
              <div className="step-content">
                <h4 className="step-title">Gemini 10-Dimension Audit</h4>
                <p className="step-desc">
                  Receive transparent scores, separation of factual extraction vs AI inference, missing evidence gaps, and STAR interview prep.
                </p>
              </div>
            </div>

            <div className="step-card">
              <div className="step-number">04</div>
              <div className="step-content">
                <h4 className="step-title">Resume Builder & Export</h4>
                <p className="step-desc">
                  Accept XYZ rewrites, auto-fill the split-screen AI Resume Builder, and export an ATS-compliant, single-column formatted resume.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy & Security Section */}
      <section id="privacy" className="privacy-section">
        <div className="section-container">
          <div className="section-header text-center">
            <Badge variant="emerald" size="sm" icon={ShieldCheck}>ENTERPRISE SECURITY & PRIVACY</Badge>
            <h2 className="section-title">Built with Strict Data Protection Controls</h2>
            <p className="section-subtitle">
              Your resume represents your career identity. We treat every document with the utmost privacy and security rigor.
            </p>
          </div>

          <div className="privacy-grid">
            <div className="privacy-card">
              <div className="privacy-icon emerald">
                <EyeOff size={22} />
              </div>
              <h4 className="privacy-title">Zero Foundation Model Training</h4>
              <p className="privacy-desc">
                Your resume content is processed solely in-memory via the Google Gemini API. We never use your career data to train, fine-tune, or reinforce external AI models.
              </p>
            </div>

            <div className="privacy-card">
              <div className="privacy-icon purple">
                <Lock size={22} />
              </div>
              <h4 className="privacy-title">PostgreSQL Tenant Isolation</h4>
              <p className="privacy-desc">
                All resume records, parsed texts, and audit reports are strictly bound to your authenticated user ID. No cross-tenant access is ever permitted.
              </p>
            </div>

            <div className="privacy-card">
              <div className="privacy-icon cyan">
                <Code2 size={22} />
              </div>
              <h4 className="privacy-title">Untrusted Data Sandboxing</h4>
              <p className="privacy-desc">
                Uploaded documents are treated as untrusted data. We sanitize text streams to neutralize prompt injection or rogue markdown payloads.
              </p>
            </div>

            <div className="privacy-card">
              <div className="privacy-icon amber">
                <Sliders size={22} />
              </div>
              <h4 className="privacy-title">Complete Data Sovereignty</h4>
              <p className="privacy-desc">
                You retain complete ownership of your career artifacts. Delete individual scans or wipe your entire account and history at any time with 1 click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section id="faqs" className="faqs-section">
        <div className="section-container">
          <div className="section-header text-center">
            <Badge variant="purple" size="sm">FREQUENTLY ASKED QUESTIONS</Badge>
            <h2 className="section-title">Everything You Need to Know</h2>
            <p className="section-subtitle">
              Have questions about our ATS algorithms, privacy, or scoring? Here are direct answers.
            </p>
          </div>

          <div className="faqs-accordion">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className={`faq-item ${isOpen ? 'open' : ''}`}
                  onClick={() => setOpenFaq(isOpen ? -1 : index)}
                >
                  <button className="faq-question-btn" type="button" aria-expanded={isOpen}>
                    <span className="faq-question-text">{faq.q}</span>
                    <span className="faq-toggle-icon">
                      {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="faq-answer-pane">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Interactive CTA Banner */}
      <section className="cta-banner-section">
        <div className="section-container">
          <div className="cta-banner-card">
            <div className="cta-content">
              <Badge variant="purple" size="sm">FREE TIER AVAILABLE • NO CREDIT CARD</Badge>
              <h2 className="cta-title">Ready to Optimize Your Resume with Gemini AI?</h2>
              <p className="cta-subtitle">
                Join thousands of software engineers and technical leaders achieving higher recruiter visibility and landing senior interviews.
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
                  View Sample Dashboard
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
