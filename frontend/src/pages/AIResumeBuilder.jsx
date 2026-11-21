import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Printer,
  Copy,
  Download,
  RotateCcw,
  Plus,
  Trash2,
  FileCheck2,
  CheckCircle2,
  Layers,
  ChevronRight,
  User,
  Briefcase,
  GraduationCap,
  Code,
  FolderGit2,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Card from '../components/common/Card';
import './AIResumeBuilder.css';

export function AIResumeBuilder() {
  const { user } = useAuth();
  const { activeAnalysis, resumes, addToast } = useApp();

  // Selected Template: 'modern' | 'executive' | 'minimalist'
  const [template, setTemplate] = useState('modern');

  // Active Editor Section Tab
  const [activeTab, setActiveTab] = useState('contact');

  // Resume Model State
  const [resumeData, setResumeData] = useState({
    personalInfo: {
      fullName: user?.name || 'Alex Morgan',
      targetTitle: user?.role || 'Staff Full-Stack Engineer',
      email: user?.email || 'alex.morgan@cvinsight.ai',
      phone: '+1 (555) 349-8201',
      location: 'San Francisco, CA',
      linkedin: 'linkedin.com/in/alexmorgan-tech',
      github: 'github.com/alexmorgan',
      portfolio: 'alexmorgan.dev',
    },
    summary:
      'Staff Software Engineer with 7+ years architecting high-throughput distributed systems and enterprise React/Node.js SaaS platforms. Proven leader in optimizing database throughput, reducing API latency by 42%, and mentoring engineering teams in production-grade reliability.',
    experience: [
      {
        id: 'exp-1',
        title: 'Staff Software Engineer',
        company: 'Acme Cloud Systems',
        location: 'San Francisco, CA',
        period: '2022 - Present',
        bullets: [
          'Spearheaded enterprise migration to microservices, reducing API latency by 42% and cloud hosting costs by $180,000 annually.',
          'Architected distributed Kafka event streaming platform processing 12M daily transactions using Node.js, TypeScript, and PostgreSQL with 99.99% uptime.',
          'Engineered real-time reactive dashboards with React, Vite, and WebSocket state pipelines, improving customer audit velocities by 3.5x.',
          'Mentored 8 mid-level and junior engineers in system design principles, resulting in 4 promotions within 18 months.',
        ],
      },
      {
        id: 'exp-2',
        title: 'Senior Full-Stack Developer',
        company: 'Vanguard FinTech Labs',
        location: 'New York, NY',
        period: '2019 - 2022',
        bullets: [
          'Delivered customer transaction analytics dashboard handling $45M in monthly transaction volume with sub-200ms latency.',
          'Implemented database partitioning and indexing strategy in PostgreSQL, reducing query execution times across heavy reporting endpoints by 65%.',
          'Authored comprehensive automated test suites (Vitest, Cypress) boosting coverage from 45% to 88% and eliminating production regressions.',
        ],
      },
    ],
    skills: {
      languages: 'JavaScript (ESNext), TypeScript, Node.js, Python, SQL (PostgreSQL), HTML5, CSS3',
      frameworks: 'React, Express.js, Vite, Next.js, Redux Toolkit, Tailwind/Plain CSS, Prisma ORM',
      cloud: 'AWS (ECS, S3, RDS, CloudFront), Docker, Kubernetes, Redis, GitHub Actions CI/CD, Kafka',
      methodologies: 'Distributed Systems, System Design, REST APIs, Microservices, WCAG Accessibility, Agile/Scrum',
    },
    education: [
      {
        id: 'edu-1',
        degree: 'Bachelor of Science in Computer Science',
        institution: 'University of California, Berkeley',
        period: '2015 - 2019',
        honors: 'Magna Cum Laude • GPA 3.85 / 4.0',
      },
    ],
    projects: [
      {
        id: 'proj-1',
        name: 'Distributed ATS Ingestion Pipeline',
        technologies: 'Node.js, PostgreSQL, Docker, Gemini AI',
        description:
          'High-resilience resume analysis service extracting text via magic-byte signatures and scoring against enterprise ATS rubrics.',
      },
    ],
  });

  // Pre-fill from activeAnalysis if available
  const handleAutoFillFromAnalysis = () => {
    if (!activeAnalysis) {
      addToast('No active analysis loaded yet. You can upload a resume to auto-fill!', 'info');
      return;
    }

    const factual = activeAnalysis.factualExtraction || {};
    const parsedSkills = activeAnalysis.skillsAndKeywords?.technicalSkills || [];

    setResumeData((prev) => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        fullName: activeAnalysis.resume?.candidateName || factual.contactInformation?.name || prev.personalInfo.fullName,
        targetTitle: activeAnalysis.resume?.targetRole || factual.contactInformation?.title || prev.personalInfo.targetTitle,
        email: factual.contactInformation?.email || prev.personalInfo.email,
        phone: factual.contactInformation?.phone || prev.personalInfo.phone,
        location: factual.contactInformation?.location || prev.personalInfo.location,
        linkedin: factual.contactInformation?.linkedin || prev.personalInfo.linkedin,
      },
      summary: activeAnalysis.executiveSummary || activeAnalysis.summaryAlternatives?.executive || prev.summary,
      skills: {
        ...prev.skills,
        languages: parsedSkills.slice(0, 8).join(', ') || prev.skills.languages,
        frameworks: parsedSkills.slice(8, 16).join(', ') || prev.skills.frameworks,
      },
    }));

    addToast('Resume Builder populated with your latest analysis data!', 'success');
  };

  // Section Update Helpers
  const updatePersonalInfo = (field, value) => {
    setResumeData((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value },
    }));
  };

  const updateSummary = (value) => {
    setResumeData((prev) => ({ ...prev, summary: value }));
  };

  const updateSkillCategory = (category, value) => {
    setResumeData((prev) => ({
      ...prev,
      skills: { ...prev.skills, [category]: value },
    }));
  };

  const updateExperienceBullet = (expId, bulletIdx, value) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) => {
        if (exp.id !== expId) return exp;
        const newBullets = [...exp.bullets];
        newBullets[bulletIdx] = value;
        return { ...exp, bullets: newBullets };
      }),
    }));
  };

  const addExperienceBullet = (expId) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) => {
        if (exp.id !== expId) return exp;
        return {
          ...exp,
          bullets: [...exp.bullets, 'Accomplished [X] as measured by [Y] by implementing [Z].'],
        };
      }),
    }));
  };

  const removeExperienceBullet = (expId, bulletIdx) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) => {
        if (exp.id !== expId) return exp;
        return {
          ...exp,
          bullets: exp.bullets.filter((_, idx) => idx !== bulletIdx),
        };
      }),
    }));
  };

  // Google XYZ Impact Rewriter Helper for Bullets
  const applyXyzTransform = (expId, bulletIdx) => {
    const current = resumeData.experience.find((e) => e.id === expId)?.bullets[bulletIdx] || '';
    const transformed = current.startsWith('Spearheaded')
      ? current.replace('Spearheaded', 'Engineered and scaled')
      : `Spearheaded delivery of ${current.toLowerCase().replace(/^(responsible for|worked on|helped with|built)\s*/i, '')}, improving throughput by 35%.`;

    updateExperienceBullet(expId, bulletIdx, transformed);
    addToast('Transformed with Google XYZ impact framing!', 'info');
  };

  // Copy Formatted Text to Clipboard
  const handleCopyText = () => {
    const p = resumeData.personalInfo;
    let text = `${p.fullName}\n${p.targetTitle}\n${p.email} | ${p.phone} | ${p.location}\n${p.linkedin} | ${p.github}\n\n`;
    text += `PROFESSIONAL SUMMARY\n${resumeData.summary}\n\n`;
    text += `WORK EXPERIENCE\n`;
    resumeData.experience.forEach((exp) => {
      text += `${exp.title} | ${exp.company} (${exp.period})\n`;
      exp.bullets.forEach((b) => {
        text += `• ${b}\n`;
      });
      text += `\n`;
    });
    text += `TECHNICAL SKILLS\n`;
    text += `Languages: ${resumeData.skills.languages}\n`;
    text += `Frameworks: ${resumeData.skills.frameworks}\n`;
    text += `Cloud & DevOps: ${resumeData.skills.cloud}\n`;
    text += `Methodologies: ${resumeData.skills.methodologies}\n\n`;
    text += `EDUCATION\n`;
    resumeData.education.forEach((edu) => {
      text += `${edu.degree} - ${edu.institution} (${edu.period}) ${edu.honors}\n`;
    });

    navigator.clipboard.writeText(text);
    addToast('Copied full formatted resume text to clipboard!', 'success');
  };

  // Print / Save to PDF Trigger
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="resume-builder-root">
      {/* Top Controls Header */}
      <div className="builder-top-bar">
        <div className="builder-header-info">
          <div className="builder-badge-group">
            <Badge variant="purple" size="sm" icon={Sparkles}>
              AI RESUME STUDIO
            </Badge>
            <span className="builder-tagline">Single-Column ATS Optimized</span>
          </div>
          <h1 className="builder-title">Interactive AI Resume Builder</h1>
        </div>

        <div className="builder-header-actions">
          {/* Template Selector */}
          <div className="template-picker-group">
            <span className="picker-label">Template:</span>
            <button
              type="button"
              className={`template-pill ${template === 'modern' ? 'active' : ''}`}
              onClick={() => setTemplate('modern')}
            >
              Modern Tech
            </button>
            <button
              type="button"
              className={`template-pill ${template === 'executive' ? 'active' : ''}`}
              onClick={() => setTemplate('executive')}
            >
              Executive
            </button>
            <button
              type="button"
              className={`template-pill ${template === 'minimalist' ? 'active' : ''}`}
              onClick={() => setTemplate('minimalist')}
            >
              Minimalist ATS
            </button>
          </div>

          <Button
            variant="secondary"
            size="sm"
            icon={Sparkles}
            onClick={handleAutoFillFromAnalysis}
            title="Auto-populate with latest analysis data"
          >
            Auto-Fill
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={Copy}
            onClick={handleCopyText}
          >
            Copy Text
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={Printer}
            onClick={handlePrint}
          >
            Print / PDF
          </Button>
        </div>
      </div>

      {/* Split-Screen Workspace */}
      <div className="builder-workspace-grid">
        {/* Left Panel: Section Editors */}
        <div className="builder-editor-pane">
          <div className="editor-nav-tabs">
            <button
              type="button"
              className={`editor-tab-btn ${activeTab === 'contact' ? 'active' : ''}`}
              onClick={() => setActiveTab('contact')}
            >
              <User size={15} />
              <span>Contact</span>
            </button>
            <button
              type="button"
              className={`editor-tab-btn ${activeTab === 'summary' ? 'active' : ''}`}
              onClick={() => setActiveTab('summary')}
            >
              <Sparkles size={15} />
              <span>Summary</span>
            </button>
            <button
              type="button"
              className={`editor-tab-btn ${activeTab === 'experience' ? 'active' : ''}`}
              onClick={() => setActiveTab('experience')}
            >
              <Briefcase size={15} />
              <span>Experience</span>
            </button>
            <button
              type="button"
              className={`editor-tab-btn ${activeTab === 'skills' ? 'active' : ''}`}
              onClick={() => setActiveTab('skills')}
            >
              <Code size={15} />
              <span>Skills</span>
            </button>
            <button
              type="button"
              className={`editor-tab-btn ${activeTab === 'education' ? 'active' : ''}`}
              onClick={() => setActiveTab('education')}
            >
              <GraduationCap size={15} />
              <span>Education</span>
            </button>
          </div>

          <div className="editor-form-scroll">
            {/* Contact Tab */}
            {activeTab === 'contact' && (
              <div className="editor-card animate-fade-in">
                <h3 className="editor-card-heading">Contact & Header Information</h3>
                <p className="editor-card-desc">
                  Essential header details. Single-column format ensures 100% parseability by Workday, Greenhouse, and Lever.
                </p>

                <div className="form-grid-2">
                  <div className="form-field">
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={resumeData.personalInfo.fullName}
                      onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                    />
                  </div>
                  <div className="form-field">
                    <label>Target Job Title</label>
                    <input
                      type="text"
                      value={resumeData.personalInfo.targetTitle}
                      onChange={(e) => updatePersonalInfo('targetTitle', e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-field">
                    <label>Email Address</label>
                    <input
                      type="email"
                      value={resumeData.personalInfo.email}
                      onChange={(e) => updatePersonalInfo('email', e.target.value)}
                    />
                  </div>
                  <div className="form-field">
                    <label>Phone Number</label>
                    <input
                      type="text"
                      value={resumeData.personalInfo.phone}
                      onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-field">
                    <label>Location (City, State / Remote)</label>
                    <input
                      type="text"
                      value={resumeData.personalInfo.location}
                      onChange={(e) => updatePersonalInfo('location', e.target.value)}
                    />
                  </div>
                  <div className="form-field">
                    <label>LinkedIn Profile URL</label>
                    <input
                      type="text"
                      value={resumeData.personalInfo.linkedin}
                      onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-field">
                    <label>GitHub Profile</label>
                    <input
                      type="text"
                      value={resumeData.personalInfo.github}
                      onChange={(e) => updatePersonalInfo('github', e.target.value)}
                    />
                  </div>
                  <div className="form-field">
                    <label>Portfolio / Personal Site</label>
                    <input
                      type="text"
                      value={resumeData.personalInfo.portfolio}
                      onChange={(e) => updatePersonalInfo('portfolio', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Summary Tab */}
            {activeTab === 'summary' && (
              <div className="editor-card animate-fade-in">
                <div className="editor-card-header-flex">
                  <div>
                    <h3 className="editor-card-heading">Executive Professional Summary</h3>
                    <p className="editor-card-desc">
                      Highlight your core competencies, seniority tier, and signature achievements.
                    </p>
                  </div>
                </div>

                <textarea
                  className="editor-textarea"
                  rows={5}
                  value={resumeData.summary}
                  onChange={(e) => updateSummary(e.target.value)}
                  placeholder="Summarize your engineering expertise and measurable outcomes..."
                />

                <div className="ai-suggestion-box">
                  <div className="suggestion-top">
                    <Sparkles size={14} className="text-violet" />
                    <span className="suggestion-title">AI Summary Injections:</span>
                  </div>
                  <div className="summary-quick-chips">
                    <button
                      type="button"
                      className="summary-chip"
                      onClick={() =>
                        updateSummary(
                          `Results-driven ${resumeData.personalInfo.targetTitle} with 7+ years architecting scalable cloud platforms. Specializes in Node.js, React, and PostgreSQL, achieving 40%+ latency reductions and leading high-velocity engineering squads.`
                        )
                      }
                    >
                      Staff / Leadership Framing
                    </button>
                    <button
                      type="button"
                      className="summary-chip"
                      onClick={() =>
                        updateSummary(
                          `Full-Stack Architect with deep expertise in distributed microservices, low-latency API design, and modern front-end state management. Demonstrated track record delivering zero-downtime database migrations and enterprise cloud solutions.`
                        )
                      }
                    >
                      Systems & Architecture Framing
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Experience Tab */}
            {activeTab === 'experience' && (
              <div className="editor-card animate-fade-in">
                <h3 className="editor-card-heading">Work Experience & Accomplishments</h3>
                <p className="editor-card-desc">
                  Transform duties into quantified Google XYZ bullets: Accomplished [X], measured by [Y], by doing [Z].
                </p>

                {resumeData.experience.map((exp, expIdx) => (
                  <div key={exp.id} className="experience-editor-block">
                    <div className="exp-block-header">
                      <span className="exp-num-badge">#{expIdx + 1}</span>
                      <span className="exp-role-title">
                        {exp.title} at {exp.company}
                      </span>
                    </div>

                    <div className="form-grid-2">
                      <div className="form-field">
                        <label>Job Title</label>
                        <input
                          type="text"
                          value={exp.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            setResumeData((prev) => ({
                              ...prev,
                              experience: prev.experience.map((item) =>
                                item.id === exp.id ? { ...item, title: val } : item
                              ),
                            }));
                          }}
                        />
                      </div>
                      <div className="form-field">
                        <label>Company</label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => {
                            const val = e.target.value;
                            setResumeData((prev) => ({
                              ...prev,
                              experience: prev.experience.map((item) =>
                                item.id === exp.id ? { ...item, company: val } : item
                              ),
                            }));
                          }}
                        />
                      </div>
                    </div>

                    <div className="form-grid-2">
                      <div className="form-field">
                        <label>Location</label>
                        <input
                          type="text"
                          value={exp.location}
                          onChange={(e) => {
                            const val = e.target.value;
                            setResumeData((prev) => ({
                              ...prev,
                              experience: prev.experience.map((item) =>
                                item.id === exp.id ? { ...item, location: val } : item
                              ),
                            }));
                          }}
                        />
                      </div>
                      <div className="form-field">
                        <label>Dates / Period</label>
                        <input
                          type="text"
                          value={exp.period}
                          onChange={(e) => {
                            const val = e.target.value;
                            setResumeData((prev) => ({
                              ...prev,
                              experience: prev.experience.map((item) =>
                                item.id === exp.id ? { ...item, period: val } : item
                              ),
                            }));
                          }}
                        />
                      </div>
                    </div>

                    {/* Bullet Points */}
                    <div className="bullets-editor-list">
                      <label className="bullets-label">Accomplishment Bullets:</label>
                      {exp.bullets.map((bullet, bIdx) => (
                        <div key={bIdx} className="bullet-edit-row">
                          <textarea
                            rows={2}
                            className="bullet-textarea"
                            value={bullet}
                            onChange={(e) => updateExperienceBullet(exp.id, bIdx, e.target.value)}
                          />
                          <div className="bullet-row-actions">
                            <button
                              type="button"
                              className="bullet-xyz-btn"
                              onClick={() => applyXyzTransform(exp.id, bIdx)}
                              title="Rewrite with Google XYZ impact framing"
                            >
                              <Sparkles size={13} />
                              <span>XYZ</span>
                            </button>
                            <button
                              type="button"
                              className="bullet-del-btn"
                              onClick={() => removeExperienceBullet(exp.id, bIdx)}
                              title="Delete bullet"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))}

                      <Button
                        variant="outline"
                        size="sm"
                        icon={Plus}
                        onClick={() => addExperienceBullet(exp.id)}
                        className="add-bullet-btn"
                      >
                        Add Accomplishment Bullet
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Skills Tab */}
            {activeTab === 'skills' && (
              <div className="editor-card animate-fade-in">
                <h3 className="editor-card-heading">Categorized Technical Skills</h3>
                <p className="editor-card-desc">
                  Organizing skills by category helps ATS keyword scanners match your profile with recruiter requirements.
                </p>

                <div className="form-field">
                  <label>Languages & Runtimes</label>
                  <input
                    type="text"
                    value={resumeData.skills.languages}
                    onChange={(e) => updateSkillCategory('languages', e.target.value)}
                  />
                </div>

                <div className="form-field">
                  <label>Frameworks & Libraries</label>
                  <input
                    type="text"
                    value={resumeData.skills.frameworks}
                    onChange={(e) => updateSkillCategory('frameworks', e.target.value)}
                  />
                </div>

                <div className="form-field">
                  <label>Cloud, Databases & DevOps</label>
                  <input
                    type="text"
                    value={resumeData.skills.cloud}
                    onChange={(e) => updateSkillCategory('cloud', e.target.value)}
                  />
                </div>

                <div className="form-field">
                  <label>Architecture & Methodologies</label>
                  <input
                    type="text"
                    value={resumeData.skills.methodologies}
                    onChange={(e) => updateSkillCategory('methodologies', e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Education Tab */}
            {activeTab === 'education' && (
              <div className="editor-card animate-fade-in">
                <h3 className="editor-card-heading">Education & Certifications</h3>
                <p className="editor-card-desc">
                  Degrees, institutions, and academic honors.
                </p>

                {resumeData.education.map((edu) => (
                  <div key={edu.id} className="education-editor-block">
                    <div className="form-grid-2">
                      <div className="form-field">
                        <label>Degree / Major</label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => {
                            const val = e.target.value;
                            setResumeData((prev) => ({
                              ...prev,
                              education: prev.education.map((item) =>
                                item.id === edu.id ? { ...item, degree: val } : item
                              ),
                            }));
                          }}
                        />
                      </div>
                      <div className="form-field">
                        <label>University / Institution</label>
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={(e) => {
                            const val = e.target.value;
                            setResumeData((prev) => ({
                              ...prev,
                              education: prev.education.map((item) =>
                                item.id === edu.id ? { ...item, institution: val } : item
                              ),
                            }));
                          }}
                        />
                      </div>
                    </div>

                    <div className="form-grid-2">
                      <div className="form-field">
                        <label>Graduation Year / Period</label>
                        <input
                          type="text"
                          value={edu.period}
                          onChange={(e) => {
                            const val = e.target.value;
                            setResumeData((prev) => ({
                              ...prev,
                              education: prev.education.map((item) =>
                                item.id === edu.id ? { ...item, period: val } : item
                              ),
                            }));
                          }}
                        />
                      </div>
                      <div className="form-field">
                        <label>Honors / GPA / Awards</label>
                        <input
                          type="text"
                          value={edu.honors}
                          onChange={(e) => {
                            const val = e.target.value;
                            setResumeData((prev) => ({
                              ...prev,
                              education: prev.education.map((item) =>
                                item.id === edu.id ? { ...item, honors: val } : item
                              ),
                            }));
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Live Formatted Resume Preview */}
        <div className="builder-preview-pane">
          <div className="preview-top-controls">
            <div className="preview-status-pill">
              <CheckCircle2 size={13} className="text-emerald" />
              <span>ATS Compliant Format</span>
            </div>
            <span className="preview-template-label">
              Active: <strong>{template.toUpperCase()}</strong>
            </span>
          </div>

          <div className="preview-paper-container">
            {/* The printable paper document */}
            <div className={`resume-paper template-${template}`} id="resume-printable-doc">
              {/* Header */}
              <div className="paper-header">
                <h1 className="paper-name">{resumeData.personalInfo.fullName}</h1>
                <p className="paper-title">{resumeData.personalInfo.targetTitle}</p>
                <div className="paper-contact-row">
                  <span>{resumeData.personalInfo.email}</span>
                  <span className="dot">•</span>
                  <span>{resumeData.personalInfo.phone}</span>
                  <span className="dot">•</span>
                  <span>{resumeData.personalInfo.location}</span>
                  {resumeData.personalInfo.linkedin && (
                    <>
                      <span className="dot">•</span>
                      <span>{resumeData.personalInfo.linkedin}</span>
                    </>
                  )}
                  {resumeData.personalInfo.github && (
                    <>
                      <span className="dot">•</span>
                      <span>{resumeData.personalInfo.github}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Summary Section */}
              {resumeData.summary && (
                <div className="paper-section">
                  <h2 className="paper-section-title">PROFESSIONAL SUMMARY</h2>
                  <div className="paper-section-divider" />
                  <p className="paper-summary-text">{resumeData.summary}</p>
                </div>
              )}

              {/* Experience Section */}
              <div className="paper-section">
                <h2 className="paper-section-title">WORK EXPERIENCE</h2>
                <div className="paper-section-divider" />
                {resumeData.experience.map((exp) => (
                  <div key={exp.id} className="paper-experience-item">
                    <div className="paper-exp-header">
                      <div className="paper-exp-left">
                        <strong className="paper-exp-role">{exp.title}</strong>
                        <span className="paper-exp-sep"> — </span>
                        <span className="paper-exp-company">{exp.company}</span>
                      </div>
                      <div className="paper-exp-right">
                        <span className="paper-exp-period">{exp.period}</span>
                        {exp.location && <span className="paper-exp-loc"> | {exp.location}</span>}
                      </div>
                    </div>
                    <ul className="paper-bullet-list">
                      {exp.bullets.map((b, idx) => (
                        <li key={idx} className="paper-bullet-item">
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Skills Section */}
              <div className="paper-section">
                <h2 className="paper-section-title">TECHNICAL COMPETENCIES</h2>
                <div className="paper-section-divider" />
                <div className="paper-skills-block">
                  {resumeData.skills.languages && (
                    <div className="paper-skill-row">
                      <strong>Languages & Runtimes: </strong>
                      <span>{resumeData.skills.languages}</span>
                    </div>
                  )}
                  {resumeData.skills.frameworks && (
                    <div className="paper-skill-row">
                      <strong>Frameworks & Libraries: </strong>
                      <span>{resumeData.skills.frameworks}</span>
                    </div>
                  )}
                  {resumeData.skills.cloud && (
                    <div className="paper-skill-row">
                      <strong>Cloud & Databases: </strong>
                      <span>{resumeData.skills.cloud}</span>
                    </div>
                  )}
                  {resumeData.skills.methodologies && (
                    <div className="paper-skill-row">
                      <strong>Methodologies: </strong>
                      <span>{resumeData.skills.methodologies}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Education Section */}
              <div className="paper-section">
                <h2 className="paper-section-title">EDUCATION</h2>
                <div className="paper-section-divider" />
                {resumeData.education.map((edu) => (
                  <div key={edu.id} className="paper-edu-item">
                    <div className="paper-exp-header">
                      <div className="paper-exp-left">
                        <strong className="paper-exp-role">{edu.degree}</strong>
                        <span className="paper-exp-sep"> — </span>
                        <span className="paper-exp-company">{edu.institution}</span>
                      </div>
                      <div className="paper-exp-right">
                        <span className="paper-exp-period">{edu.period}</span>
                      </div>
                    </div>
                    {edu.honors && <p className="paper-edu-honors">{edu.honors}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIResumeBuilder;
