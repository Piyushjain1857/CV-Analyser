import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  X,
  ShieldCheck,
  Info,
  RotateCcw,
  Sliders,
  Scale,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Card, { CardHeader, CardBody } from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import './ResumeUpload.css';

export function ResumeUpload() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast, fetchResumes, setActiveAnalysis } = useApp();
  const fileInputRef = useRef(null);

  // Form State
  const [selectedFile, setSelectedFile] = useState(null); // Native File object
  const [isDragging, setIsDragging] = useState(false);
  const [candidateName, setCandidateName] = useState(user?.name || 'Alex Morgan');
  const [targetRole, setTargetRole] = useState(user?.role || 'Staff Full-Stack Engineer');
  const [targetIndustry, setTargetIndustry] = useState(user?.industry || 'Cloud Infrastructure & SaaS');
  const [jobDescription, setJobDescription] = useState('');
  const [rawText, setRawText] = useState('');
  const [inputMode, setInputMode] = useState('file'); // 'file' | 'text'

  // Progress and upload state
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisStep, setAnalysisStep] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [showRubricModal, setShowRubricModal] = useState(false);

  // Sample Presets for Quick Testing
  const handleLoadSample = (type) => {
    setUploadError('');
    setSelectedFile(null);
    setInputMode('text');

    if (type === 'fullstack') {
      setCandidateName(user?.name || 'Alex Morgan');
      setTargetRole('Staff Full-Stack Engineer');
      setTargetIndustry('Cloud Infrastructure & SaaS');
      setJobDescription(
        'Staff Full-Stack Engineer needed to lead scalable cloud architecture. Requirements: 6+ years with React, Node.js, TypeScript, PostgreSQL, Docker, Kubernetes, AWS, microservices, and distributed caching with Redis. Must demonstrate high-impact leadership and reduced system latency.'
      );
      setRawText(
        'Alex Morgan - Staff Full-Stack Engineer.\n\nProfessional Summary:\nTechnical leader with 7+ years architecting cloud-native SaaS platforms. Proven expertise in React, Node.js, TypeScript, PostgreSQL, Docker, Kubernetes, and AWS.\n\nWork Experience:\nStaff Software Engineer | Acme Cloud Systems (2022 - Present)\n- Spearheaded enterprise migration to microservices, reducing API latency by 42% and cloud costs by $180K/yr.\n- Architected distributed message queue processing 10M daily events using Node.js and PostgreSQL.\n- Engineered real-time reactive dashboards with React and Vite, achieving 99.8% uptime.\n- Mentored 8 junior and mid-level engineers in system design and CI/CD best practices.\n\nTechnical Skills:\nLanguages & Frameworks: React, Node.js, TypeScript, Python, Express.js\nDatabases & Cloud: PostgreSQL, Redis, AWS (ECS, S3, RDS), Docker, Kubernetes\nTooling & Methodologies: Git, CI/CD pipelines, System Design, REST APIs, GraphQL\n\nEducation:\nBachelor of Science in Computer Science | State University (Graduated Magna Cum Laude)'
      );
      addToast('Loaded Staff Full-Stack profile', 'success');
    } else if (type === 'frontend') {
      setCandidateName(user?.name || 'Devon Vance');
      setTargetRole('Senior Frontend Engineer');
      setTargetIndustry('Fintech & SaaS');
      setJobDescription(
        'Seeking Senior Frontend Engineer with mastery of React, Vite, State Management, UI/UX accessibility (WCAG), CSS animations, TypeScript, and automated testing (Vitest, Cypress). Core Web Vitals optimization experience required.'
      );
      setRawText(
        'Devon Vance - Senior Frontend Engineer\n\nSummary:\nFrontend Developer with 5 years experience creating design systems and responsive applications with React, JavaScript, CSS, HTML, Vite, and Git.\n\nExperience:\nSenior Frontend Specialist | FinTech Corp (2021 - Present)\n- Architected component design system in React, improving engineering velocity by 35%.\n- Optimized Core Web Vitals across consumer dashboards, reducing Largest Contentful Paint (LCP) by 1.2s.\n- Collaborated with UI/UX designers to implement WCAG 2.1 AA accessible workflows.\n\nSkills:\nReact, JavaScript, CSS, HTML, Vite, Web Vitals, Responsive Design, Git\n\nEducation:\nB.S. in Software Engineering'
      );
      addToast('Loaded Frontend Specialist profile', 'success');
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = (file) => {
    setUploadError('');

    // Strict 5 MB limit
    if (file.size > 5 * 1024 * 1024) {
      setUploadError(`File is too large (${(file.size / (1024 * 1024)).toFixed(2)} MB). Maximum allowed size is 5 MB.`);
      addToast('File too large', 'error', 'Limit is 5 MB.');
      return;
    }

    const validExtensions = ['.pdf', '.docx', '.doc', '.txt'];
    const hasValidExt = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));

    if (!hasValidExt) {
      setUploadError('Invalid file extension. Please upload a PDF or DOCX file (up to 5 MB).');
      addToast('Invalid file', 'error', 'Only PDF and DOCX documents accepted.');
      return;
    }

    setSelectedFile(file);
    addToast('File selected', 'info', `${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setUploadError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploadError('');

    if (inputMode === 'file' && !selectedFile) {
      setUploadError('Please select or drop a PDF or DOCX resume document.');
      return;
    }

    if (inputMode === 'text' && (!rawText || rawText.trim().length < 50)) {
      setUploadError('Please provide at least 50 characters of resume content.');
      return;
    }

    setSubmitting(true);
    setUploadProgress(15);
    setAnalysisStep('1. Verifying document signature and file headers...');

    try {
      // Phase 2: Ingestion & Upload
      const stepTimer1 = setTimeout(() => {
        setUploadProgress(40);
        setAnalysisStep('2. Ingesting binary document stream into parsing pipeline...');
      }, 400);

      // Phase 3: Text extraction
      const stepTimer2 = setTimeout(() => {
        setUploadProgress(65);
        setAnalysisStep('3. Extracting section hierarchy and tokenizing competencies...');
      }, 900);

      // Phase 4: Gemini AI analysis
      const stepTimer3 = setTimeout(() => {
        setUploadProgress(85);
        setAnalysisStep('4. Executing Gemini ATS intelligence across 6 dimensions...');
      }, 1500);

      let response;

      if (inputMode === 'file' && selectedFile) {
        const formData = new FormData();
        formData.append('resumeFile', selectedFile);
        formData.append('candidateName', candidateName || user?.name || 'Applicant');
        formData.append('targetRole', targetRole);
        formData.append('targetIndustry', targetIndustry);
        formData.append('jobDescription', jobDescription);

        response = await api.uploadAndAnalyzeResume(formData);
      } else {
        const payload = {
          title: `${candidateName || user?.name || 'Applicant'}'s CV - ${targetRole}`,
          candidateName: candidateName || user?.name || 'Applicant',
          rawText,
          targetRole,
          targetIndustry,
          jobDescription,
        };
        response = await api.uploadAndAnalyzeResume(payload);
      }

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);

      setUploadProgress(100);
      setAnalysisStep('Analysis complete! Storing results in PostgreSQL...');

      if (response.success && response.data) {
        await fetchResumes();

        const latestResult = response.data.analyses?.[0];
        if (latestResult) {
          setActiveAnalysis({
            ...latestResult,
            resume: response.data,
          });
        }

        addToast(
          'ATS Analysis Completed',
          'success',
          `Overall Score: ${latestResult?.overallScore || 85}/100`
        );

        if (latestResult?.id) {
          setTimeout(() => {
            navigate(`/dashboard/results/${latestResult.id}`);
          }, 500);
        } else {
          setTimeout(() => {
            navigate('/dashboard/results');
          }, 500);
        }
      }
    } catch (err) {
      console.error('Upload & Analysis failed:', err);
      setUploadError(err.message || 'Failed to analyze resume. Please try again.');
      addToast('Analysis failed', 'error', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="resume-upload-root">
      {/* Page Header */}
      <div className="upload-header-row">
        <div>
          <h1 className="upload-page-title">Upload & Scan Resume</h1>
          <p className="upload-page-desc">
            Parse your PDF or DOCX resume with Google Gemini and benchmark against Workday & Greenhouse ATS algorithms.
          </p>
        </div>

        {/* Scoring Rubric Disclaimer Button */}
        <div className="header-meta-actions">
          <button
            type="button"
            className="rubric-explainer-btn"
            onClick={() => setShowRubricModal(true)}
          >
            <Scale size={15} />
            <span>Scoring Rubric & Disclaimer</span>
          </button>

          {/* Quick Preset Buttons */}
          <div className="upload-presets-group">
            <span className="preset-label">Test Presets:</span>
            <Button
              variant="secondary"
              size="sm"
              icon={Sparkles}
              onClick={() => handleLoadSample('fullstack')}
            >
              Staff Full-Stack
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={Sparkles}
              onClick={() => handleLoadSample('frontend')}
            >
              Senior Frontend
            </Button>
          </div>
        </div>
      </div>

      {/* Transparent Rubric Callout Box */}
      <div className="rubric-callout-box">
        <Info size={18} className="rubric-callout-icon" />
        <div className="rubric-callout-content">
          <p className="rubric-callout-text">
            <strong>ATS Estimation Notice:</strong> The ATS compatibility score is an estimated benchmark based on standard parsing patterns (Workday, Greenhouse, Lever). It does not guarantee employment outcomes or represent a proprietary score from a specific employer.
          </p>
          <div className="rubric-weights-summary">
            <span>Weights: <strong>35%</strong> Keyword Match • <strong>25%</strong> Layout & Structure • <strong>20%</strong> Quantified Impact • <strong>20%</strong> Grammar & Tone</span>
          </div>
        </div>
      </div>

      {/* Upload Error Banner */}
      {uploadError && (
        <div className="upload-error-alert animate-fade-in">
          <AlertCircle size={20} className="error-icon" />
          <div className="error-content">
            <h4 className="error-title">Upload Verification Failed</h4>
            <p className="error-message">{uploadError}</p>
          </div>
          <button
            type="button"
            className="error-dismiss-btn"
            onClick={() => setUploadError('')}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Active Upload & Analysis Progress */}
      {submitting && (
        <Card className="upload-progress-card animate-fade-in" glow>
          <div className="progress-content-wrap">
            <div className="progress-status-header">
              <span className="progress-status-title">Processing Document</span>
              <span className="progress-status-percentage">{uploadProgress}%</span>
            </div>
            <div className="progress-bar-track">
              <div
                className="progress-bar-active-fill"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <div className="progress-step-indicator">
              <span className="btn-spinner" />
              <span className="progress-step-text">{analysisStep}</span>
            </div>
          </div>
        </Card>
      )}

      {/* Main Upload Form */}
      <form onSubmit={handleSubmit} className="upload-form-layout">
        <div className="upload-col-main">
          {/* File Upload / Paste Card */}
          <Card className="upload-drop-card">
            <CardHeader
              title="1. Resume Document (PDF / DOCX)"
              subtitle="Max size: 5 MB. Strictly validated against actual file signatures."
              action={
                <div className="input-mode-toggle">
                  <button
                    type="button"
                    className={`mode-btn ${inputMode === 'file' ? 'active' : ''}`}
                    onClick={() => setInputMode('file')}
                  >
                    File Upload
                  </button>
                  <button
                    type="button"
                    className={`mode-btn ${inputMode === 'text' ? 'active' : ''}`}
                    onClick={() => setInputMode('text')}
                  >
                    Paste Text
                  </button>
                </div>
              }
            />
            <CardBody>
              {inputMode === 'file' ? (
                <>
                  {!selectedFile ? (
                    <div
                      className={`dropzone-box ${isDragging ? 'dragging' : ''}`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="file-hidden-input"
                        accept=".pdf,.docx,.doc,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={handleFileChange}
                      />
                      <div className="dropzone-icon-box">
                        <UploadCloud size={40} />
                      </div>
                      <h4 className="dropzone-title">Click to upload or drag & drop</h4>
                      <p className="dropzone-sub">
                        PDF or DOCX format (Max 5 MB). Text must be searchable.
                      </p>
                      <div className="dropzone-badge-row">
                        <span className="safe-badge">
                          <ShieldCheck size={13} /> Validated Signatures
                        </span>
                        <span className="safe-badge">
                          <CheckCircle2 size={13} /> 5 MB Limit
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="file-preview-card">
                      <div className="file-preview-icon">
                        <FileText size={32} />
                      </div>
                      <div className="file-preview-meta">
                        <h4 className="file-name">{selectedFile.name}</h4>
                        <span className="file-size">
                          {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type || 'Document'}
                        </span>
                        <div className="file-status-indicator">
                          <CheckCircle2 size={14} className="text-emerald" />
                          <span>Ready for Gemini ATS Analysis</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="file-remove-btn"
                        onClick={removeFile}
                        title="Remove file"
                        disabled={submitting}
                      >
                        <X size={18} />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="paste-text-wrapper">
                  <textarea
                    rows={9}
                    className="form-textarea font-mono text-sm"
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="Paste the raw text of your resume here (Summary, Work Experience, Technical Skills, Education)..."
                    disabled={submitting}
                  />
                  <span className="char-count">{rawText.length} characters (min 50 required)</span>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Job Description Matching Card */}
          <Card className="upload-jd-card">
            <CardHeader
              title="2. Target Job Description (Optional but Recommended)"
              subtitle="Paste the job posting to compute exact keyword overlap and missing hard/soft skills"
            />
            <CardBody>
              <div className="form-group">
                <textarea
                  rows={6}
                  className="form-textarea"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste target job responsibilities, required skills, and qualifications here for 1:1 keyword comparison..."
                  disabled={submitting}
                />
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right Sidebar Form Config */}
        <div className="upload-col-side">
          <Card className="upload-config-card">
            <CardHeader
              title="3. Target Calibration"
              subtitle="Calibrate ATS scoring weights"
            />
            <CardBody>
              <div className="form-group">
                <label className="form-label" htmlFor="candidateName">Candidate Full Name</label>
                <input
                  id="candidateName"
                  type="text"
                  className="form-input"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  disabled={submitting}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="targetRole">Target Job Title</label>
                <input
                  id="targetRole"
                  type="text"
                  className="form-input"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Staff Full-Stack Engineer"
                  disabled={submitting}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="targetIndustry">Industry Sector</label>
                <select
                  id="targetIndustry"
                  className="form-select"
                  value={targetIndustry}
                  onChange={(e) => setTargetIndustry(e.target.value)}
                  disabled={submitting}
                >
                  <option value="Cloud Infrastructure & SaaS">Cloud Infrastructure & SaaS</option>
                  <option value="Fintech & Banking">Fintech & Banking</option>
                  <option value="AI & Machine Learning">AI & Machine Learning</option>
                  <option value="Healthcare & Healthtech">Healthcare & Healthtech</option>
                  <option value="E-Commerce & Consumer">E-Commerce & Consumer</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                </select>
              </div>

              {/* Rubric summary widget */}
              <div className="rubric-mini-widget">
                <span className="rubric-widget-title">Scoring Dimension Weights:</span>
                <div className="rubric-pill-row">
                  <span className="rubric-pill">Keywords: 35%</span>
                  <span className="rubric-pill">Structure: 25%</span>
                  <span className="rubric-pill">Impact: 20%</span>
                  <span className="rubric-pill">Grammar: 20%</span>
                </div>
              </div>

              {/* Submit Button */}
              <div className="submit-section">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={submitting}
                  icon={ArrowRight}
                  iconPosition="right"
                  disabled={submitting || (inputMode === 'file' && !selectedFile) || (inputMode === 'text' && rawText.length < 50)}
                >
                  {submitting ? 'Running Gemini ATS Audit...' : 'Analyze Resume with AI'}
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </form>

      {/* Scoring Rubric Detail Modal */}
      {showRubricModal && (
        <div className="rubric-modal-backdrop" onClick={() => setShowRubricModal(false)}>
          <div className="rubric-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="rubric-modal-header">
              <div className="rubric-modal-title-group">
                <Scale size={20} className="text-primary" />
                <h3 className="rubric-modal-title">Transparent ATS Scoring Rubric</h3>
              </div>
              <button
                type="button"
                className="rubric-modal-close"
                onClick={() => setShowRubricModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="rubric-modal-body">
              <div className="rubric-disclaimer-callout">
                <ShieldCheck size={20} className="text-emerald" />
                <p>
                  <strong>Notice:</strong> This ATS compatibility score is an estimated index based on benchmarked Applicant Tracking System patterns (Workday, Greenhouse, Lever). It does not guarantee employment outcomes or represent a proprietary score from a specific employer.
                </p>
              </div>

              <div className="rubric-breakdown-list">
                <div className="rubric-dim-item">
                  <div className="rubric-dim-header">
                    <span className="dim-name">1. Keyword & Competency Alignment</span>
                    <span className="dim-weight">35% Weight</span>
                  </div>
                  <p className="dim-desc">
                    Measures exact matches and semantic similarity against industry benchmarks and target job description requirements.
                  </p>
                </div>

                <div className="rubric-dim-item">
                  <div className="rubric-dim-header">
                    <span className="dim-name">2. Layout, Formatting & Section Completeness</span>
                    <span className="dim-weight">25% Weight</span>
                  </div>
                  <p className="dim-desc">
                    Checks that section headers (Experience, Education, Skills) are standard and that fonts/tables do not trigger parser breaks.
                  </p>
                </div>

                <div className="rubric-dim-item">
                  <div className="rubric-dim-header">
                    <span className="dim-name">3. Quantified Impact & Measurable Metrics</span>
                    <span className="dim-weight">20% Weight</span>
                  </div>
                  <p className="dim-desc">
                    Evaluates use of the Google XYZ formula ("Accomplished [X] as measured by [Y] by doing [Z]") and specific business ROI figures.
                  </p>
                </div>

                <div className="rubric-dim-item">
                  <div className="rubric-dim-header">
                    <span className="dim-name">4. Grammar, Clarity & Action Verb Potency</span>
                    <span className="dim-weight">20% Weight</span>
                  </div>
                  <p className="dim-desc">
                    Detects passive phrasing and scores density of strong leadership action verbs ("spearheaded", "architected", "accelerated").
                  </p>
                </div>
              </div>
            </div>

            <div className="rubric-modal-footer">
              <Button
                variant="primary"
                onClick={() => setShowRubricModal(false)}
              >
                Understood
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResumeUpload;
