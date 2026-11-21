import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Award,
  Link as LinkIcon,
  ExternalLink,
  Save,
  Clock,
  Copy as CopyIcon,
  ArrowUp,
  ArrowDown,
  Target,
  Sliders,
  Check,
  X,
  AlertTriangle,
  RefreshCw,
  FileText,
  Eye,
  Edit3,
  HelpCircle,
  Lightbulb,
  Smartphone,
  Monitor,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Card from '../components/common/Card';
import './AIResumeBuilder.css';

export function AIResumeBuilder() {
  const { user } = useAuth();
  const { activeAnalysis, resumes, addToast } = useApp();

  // Active Resume Record State
  const [resumeId, setResumeId] = useState(null);
  const [resumeTitle, setResumeTitle] = useState('Untitled Resume');
  const [template, setTemplate] = useState('modern-minimal');
  const [fontFamily, setFontFamily] = useState('sans');
  const [fontSize, setFontSize] = useState('medium');
  const [accentColor, setAccentColor] = useState('#8B5CF6');

  // Section Ordering
  const [sectionOrder, setSectionOrder] = useState([
    'personal',
    'summary',
    'experience',
    'skills',
    'projects',
    'education',
    'certifications',
    'achievements',
    'links',
  ]);

  // Active Editor Tab
  const [activeTab, setActiveTab] = useState('personal');

  // Mobile View Switcher ('editor' | 'preview')
  const [mobileView, setMobileView] = useState('editor');

  // Autosave & Version State
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState(null);
  const [isDraft, setIsDraft] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [versionList, setVersionList] = useState([]);
  const [newVersionName, setNewVersionName] = useState('');
  const [savingVersion, setSavingVersion] = useState(false);

  // Import Modal State
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedImportId, setSelectedImportId] = useState('');

  // AI Writing Assistant State
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiTarget, setAiTarget] = useState(null); // { type, path, originalText, context }
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [userSuppliedMetric, setUserSuppliedMetric] = useState('');
  const [editableAiText, setEditableAiText] = useState('');
  const [isEditingAiText, setIsEditingAiText] = useState(false);

  // Targeted Job Optimization State
  const [showJobOptModal, setShowJobOptModal] = useState(false);
  const [targetJobDesc, setTargetJobDesc] = useState('');
  const [jobOptLoading, setJobOptLoading] = useState(false);
  const [jobOptResult, setJobOptResult] = useState(null);

  // Resume Content State
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
      website: '',
    },
    summary:
      'Accomplished Staff Software Engineer with 7+ years architecting high-throughput distributed systems in Node.js, React, and PostgreSQL. Proven track record reducing API latency by 42% and driving 99.99% system availability across enterprise SaaS platforms.',
    experiences: [
      {
        id: 'exp-1',
        role: 'Staff Software Engineer',
        company: 'Acme Cloud Systems',
        location: 'San Francisco, CA',
        startDate: '2022',
        endDate: '',
        current: true,
        bullets: [
          'Spearheaded enterprise migration to microservices, reducing API latency by 42% and cloud hosting costs by $180,000 annually.',
          'Architected distributed Kafka event streaming pipeline processing 12M daily transactions in Node.js and PostgreSQL with 99.99% uptime.',
          'Engineered real-time reactive telemetry dashboards with React and Vite, accelerating customer issue resolution times by 3.5x.',
        ],
      },
      {
        id: 'exp-2',
        role: 'Senior Full-Stack Developer',
        company: 'Vanguard FinTech Labs',
        location: 'New York, NY',
        startDate: '2019',
        endDate: '2022',
        current: false,
        bullets: [
          'Engineered transaction processing pipeline handling $45M in monthly transaction volume with sub-200ms API response times.',
          'Implemented PostgreSQL database partitioning and connection pooling, boosting query execution throughput by 65%.',
        ],
      },
    ],
    skills: {
      languages: ['JavaScript (ESNext)', 'TypeScript', 'Node.js', 'Python', 'SQL (PostgreSQL)'],
      frameworks: ['React', 'Express.js', 'Vite', 'Next.js', 'Prisma ORM'],
      databases: ['PostgreSQL', 'Redis'],
      tools: ['AWS (ECS, S3, RDS)', 'Docker', 'Kubernetes', 'GitHub Actions CI/CD', 'Kafka'],
      other: ['Distributed Systems', 'System Design', 'REST APIs', 'WCAG Accessibility'],
    },
    education: [
      {
        id: 'edu-1',
        degree: 'Bachelor of Science in Computer Science',
        school: 'University of California, Berkeley',
        field: 'Computer Science',
        startDate: '2015',
        endDate: '2019',
        gpa: '3.85',
        honors: 'Magna Cum Laude',
      },
    ],
    projects: [
      {
        id: 'proj-1',
        name: 'Distributed ATS Ingestion Pipeline',
        techStack: ['Node.js', 'PostgreSQL', 'Docker', 'Gemini AI'],
        link: 'github.com/alexmorgan/ats-engine',
        description: 'High-resilience resume analysis service validating binary signatures and scoring against Workday ATS rubrics.',
        bullets: [
          'Engineered binary magic-byte parser verifying %PDF- and PK zip container signatures with zero cloud leakage.',
        ],
      },
    ],
    certifications: [
      {
        id: 'cert-1',
        name: 'AWS Certified Solutions Architect – Professional',
        issuer: 'Amazon Web Services',
        date: '2023',
        credentialUrl: 'aws.amazon.com/verify',
      },
    ],
    achievements: [
      {
        id: 'ach-1',
        title: 'Tech Excellence Award 2023',
        description: 'Recognized for leading enterprise zero-downtime microservices migration.',
        date: '2023',
      },
    ],
    links: [
      { id: 'link-1', label: 'Technical Blog', url: 'https://alexmorgan.dev/blog' },
    ],
  });

  const autosaveTimerRef = useRef(null);
  const isInitialMount = useRef(true);

  // Initialize or fetch latest resume from PostgreSQL on mount
  useEffect(() => {
    async function loadInitialResume() {
      try {
        const res = await api.getBuilderResumes();
        if (res.success && res.data && res.data.length > 0) {
          const first = res.data[0];
          const fullRes = await api.getBuilderResume(first.id);
          if (fullRes.success && fullRes.data) {
            populateFromRecord(fullRes.data);
          }
        }
      } catch (err) {
        console.warn('Initial loadBuilderResumes error:', err.message);
      }
    }
    loadInitialResume();
  }, []);

  function populateFromRecord(record) {
    setResumeId(record.id);
    setResumeTitle(record.title || 'Untitled Resume');
    setTemplate(record.template || 'modern-minimal');
    setFontFamily(record.fontFamily || 'sans');
    setFontSize(record.fontSize || 'medium');
    setAccentColor(record.accentColor || '#8B5CF6');
    if (record.sectionOrder && Array.isArray(record.sectionOrder)) {
      setSectionOrder(record.sectionOrder);
    }
    setResumeData({
      personalInfo: record.personalInfo || {},
      summary: record.summary || '',
      experiences: record.experiences || [],
      education: record.education || [],
      projects: record.projects || [],
      skills: record.skills || { languages: [], frameworks: [], databases: [], tools: [], other: [] },
      certifications: record.certifications || [],
      achievements: record.achievements || [],
      links: record.links || [],
    });
    setIsDraft(Boolean(record.isDraft));
    setLastSavedTime(new Date(record.updatedAt || Date.now()));
  }

  // Debounced Autosave Trigger
  const triggerDebouncedAutosave = useCallback(
    (updatedResumeData, extraFields = {}) => {
      if (!resumeId) return;

      setIsDraft(true);
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }

      autosaveTimerRef.current = setTimeout(async () => {
        try {
          setIsSaving(true);
          const payload = {
            title: resumeTitle,
            template,
            fontFamily,
            fontSize,
            accentColor,
            sectionOrder,
            ...updatedResumeData,
            ...extraFields,
          };
          const res = await api.autosaveBuilderResume(resumeId, payload);
          if (res.success) {
            setLastSavedTime(new Date());
            setIsDraft(false);
          }
        } catch (err) {
          console.warn('Autosave error:', err.message);
        } finally {
          setIsSaving(false);
        }
      }, 1500);
    },
    [resumeId, resumeTitle, template, fontFamily, fontSize, accentColor, sectionOrder]
  );

  // Manual explicit save
  const handleManualSave = async () => {
    try {
      setIsSaving(true);
      const payload = {
        title: resumeTitle,
        template,
        fontFamily,
        fontSize,
        accentColor,
        sectionOrder,
        ...resumeData,
      };

      let res;
      if (resumeId) {
        res = await api.updateBuilderResume(resumeId, payload);
      } else {
        res = await api.createBuilderResume(payload);
        if (res.success && res.data) {
          setResumeId(res.data.id);
        }
      }

      if (res.success) {
        setIsDraft(false);
        setLastSavedTime(new Date());
        addToast('Resume saved securely to PostgreSQL!', 'success');
      }
    } catch (err) {
      console.error('Save failed:', err);
      addToast('Failed to save resume', 'error', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Import from an uploaded resume
  const handleImportResume = async (importResumeId) => {
    if (!importResumeId) return;
    try {
      setIsSaving(true);
      const res = await api.importBuilderResume(importResumeId);
      if (res.success && res.data) {
        populateFromRecord(res.data);
        setShowImportModal(false);
        addToast('Imported resume content successfully!', 'success');
      }
    } catch (err) {
      console.error('Import failed:', err);
      addToast('Import failed', 'error', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Duplicate current resume
  const handleDuplicate = async () => {
    if (!resumeId) {
      await handleManualSave();
    }
    try {
      setIsSaving(true);
      const res = await api.duplicateBuilderResume(resumeId);
      if (res.success && res.data) {
        populateFromRecord(res.data);
        addToast(`Duplicated as "${res.data.title}"`, 'success');
      }
    } catch (err) {
      addToast('Duplication failed', 'error', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Version Snapshots
  const handleOpenVersions = async () => {
    setShowVersionModal(true);
    if (!resumeId) return;
    try {
      const res = await api.getBuilderVersions(resumeId);
      if (res.success && res.data) {
        setVersionList(res.data);
      }
    } catch (err) {
      console.warn('Failed to load versions:', err.message);
    }
  };

  const handleSaveVersionSnapshot = async (e) => {
    e.preventDefault();
    if (!resumeId) return;
    const name = newVersionName.trim() || `v${versionList.length + 1}.0 Snapshot`;
    try {
      setSavingVersion(true);
      const res = await api.saveBuilderVersion(resumeId, name);
      if (res.success) {
        setNewVersionName('');
        addToast(`Snapshot "${name}" saved!`, 'success');
        const updatedList = await api.getBuilderVersions(resumeId);
        if (updatedList.success) setVersionList(updatedList.data);
      }
    } catch (err) {
      addToast('Failed to save snapshot', 'error', err.message);
    } finally {
      setSavingVersion(false);
    }
  };

  const handleRestoreVersion = async (versionId, versionName) => {
    if (!window.confirm(`Restore version "${versionName}"? Current unsaved changes will be overwritten.`)) {
      return;
    }
    try {
      setIsSaving(true);
      const res = await api.restoreBuilderVersion(resumeId, versionId);
      if (res.success && res.data) {
        populateFromRecord(res.data);
        setShowVersionModal(false);
        addToast(`Restored version "${versionName}"`, 'success');
      }
    } catch (err) {
      addToast('Restore failed', 'error', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // AI Writing Assistant Launch
  const openAiAssistant = (type, path, originalText, context = {}) => {
    setAiTarget({ type, path, originalText, context });
    setUserSuppliedMetric('');
    setAiResult(null);
    setIsEditingAiText(false);
    setShowAiModal(true);

    // Automatically trigger initial AI improvement
    triggerAiImprovement(type, originalText, context, '');
  };

  const triggerAiImprovement = async (type, content, context, userMetric) => {
    setAiLoading(true);
    try {
      const res = await api.improveBuilderText({
        type,
        content,
        context: {
          ...context,
          userMetric: userMetric || undefined,
        },
      });

      if (res.success && res.data) {
        setAiResult(res.data);
        setEditableAiText(res.data.improved);
      }
    } catch (err) {
      console.error('AI improvement failed:', err);
      addToast('AI rewrite failed', 'error', err.message);
    } finally {
      setAiLoading(false);
    }
  };

  // Accept AI suggestion
  const handleAcceptAiText = () => {
    if (!aiTarget || !editableAiText) return;
    const { path } = aiTarget;

    if (path.startsWith('summary')) {
      setResumeData((prev) => {
        const next = { ...prev, summary: editableAiText };
        triggerDebouncedAutosave(next);
        return next;
      });
    } else if (path.startsWith('experience-bullet-')) {
      const [, , expId, bIdx] = path.split('-');
      setResumeData((prev) => {
        const next = {
          ...prev,
          experiences: prev.experiences.map((exp) => {
            if (exp.id !== expId) return exp;
            const newBullets = [...exp.bullets];
            newBullets[parseInt(bIdx, 10)] = editableAiText;
            return { ...exp, bullets: newBullets };
          }),
        };
        triggerDebouncedAutosave(next);
        return next;
      });
    } else if (path.startsWith('project-desc-')) {
      const [, , projId] = path.split('-');
      setResumeData((prev) => {
        const next = {
          ...prev,
          projects: prev.projects.map((proj) => {
            if (proj.id !== projId) return proj;
            return { ...proj, description: editableAiText };
          }),
        };
        triggerDebouncedAutosave(next);
        return next;
      });
    }

    setShowAiModal(false);
    addToast('Accepted AI enhancement!', 'success');
  };

  // Targeted Job Optimization Launch
  const handleRunJobOptimization = async (e) => {
    e.preventDefault();
    if (!targetJobDesc || targetJobDesc.trim().length < 30) {
      addToast('Please provide a job description with at least 30 characters', 'error');
      return;
    }

    setJobOptLoading(true);
    try {
      const res = await api.optimizeBuilderForJob({
        resumeContent: resumeData,
        jobDescription: targetJobDesc,
      });

      if (res.success && res.data) {
        setJobOptResult(res.data);
        addToast('Targeted Job Optimization complete!', 'success');
      }
    } catch (err) {
      console.error('Job optimization failed:', err);
      addToast('Targeted optimization failed', 'error', err.message);
    } finally {
      setJobOptLoading(false);
    }
  };

  const handleApplyTailoredSummary = () => {
    if (!jobOptResult?.roleSpecificSummary) return;
    setResumeData((prev) => {
      const next = { ...prev, summary: jobOptResult.roleSpecificSummary };
      triggerDebouncedAutosave(next);
      return next;
    });
    addToast('Applied tailored role summary to resume!', 'success');
  };

  const handleAddSuggestedKeywords = (keywords) => {
    if (!Array.isArray(keywords) || keywords.length === 0) return;
    setResumeData((prev) => {
      const existingTools = prev.skills?.tools || [];
      const newTools = [...new Set([...existingTools, ...keywords])];
      const next = {
        ...prev,
        skills: { ...prev.skills, tools: newTools },
      };
      triggerDebouncedAutosave(next);
      return next;
    });
    addToast(`Added ${keywords.length} priority keywords to Skills!`, 'success');
  };

  // PDF Export
  const handleDownloadPdf = async () => {
    if (!resumeId) {
      await handleManualSave();
    }
    try {
      addToast('Generating selectable-text vector PDF...', 'info');
      await api.downloadBuilderPdf(resumeId, {
        template,
        fontFamily,
        fontSize,
        accentColor,
        fileName: `${resumeData.personalInfo?.fullName || 'Resume'}_CV.pdf`,
      });
      addToast('Downloaded PDF successfully!', 'success');
    } catch (err) {
      console.error('PDF download failed:', err);
      addToast('PDF download failed', 'error', err.message);
    }
  };

  // Copy Plain Text / Markdown
  const handleCopyFormattedText = () => {
    const p = resumeData.personalInfo || {};
    let text = `${p.fullName || ''}\n${p.targetTitle || ''}\n${p.email || ''} | ${p.phone || ''} | ${p.location || ''}\n\n`;

    if (resumeData.summary) {
      text += `PROFESSIONAL SUMMARY\n${resumeData.summary}\n\n`;
    }

    if (resumeData.experiences?.length > 0) {
      text += `WORK EXPERIENCE\n`;
      resumeData.experiences.forEach((exp) => {
        text += `${exp.role} — ${exp.company} (${exp.startDate} - ${exp.current ? 'Present' : exp.endDate})\n`;
        exp.bullets?.forEach((b) => {
          text += `• ${b}\n`;
        });
        text += `\n`;
      });
    }

    if (resumeData.skills) {
      text += `TECHNICAL SKILLS\n`;
      Object.entries(resumeData.skills).forEach(([cat, list]) => {
        const items = Array.isArray(list) ? list.join(', ') : list;
        if (items) text += `${cat.toUpperCase()}: ${items}\n`;
      });
      text += `\n`;
    }

    if (resumeData.education?.length > 0) {
      text += `EDUCATION\n`;
      resumeData.education.forEach((edu) => {
        text += `${edu.degree} — ${edu.school} (${edu.startDate} - ${edu.endDate})\n`;
      });
      text += `\n`;
    }

    navigator.clipboard.writeText(text);
    addToast('Copied full formatted resume text to clipboard!', 'success');
  };

  // Backward compatibility aliases
  const handlePrint = () => window.print();
  const handleCopyText = handleCopyFormattedText;
  const applyXyzTransform = openAiAssistant;

  // Reorder Sections Helper
  const moveSection = (idx, direction) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= sectionOrder.length) return;
    const newOrder = [...sectionOrder];
    const [moved] = newOrder.splice(idx, 1);
    newOrder.splice(targetIdx, 0, moved);
    setSectionOrder(newOrder);
    triggerDebouncedAutosave(resumeData, { sectionOrder: newOrder });
  };

  // Reorder Entries Helper
  const moveEntry = (sectionKey, idx, direction) => {
    const items = resumeData[sectionKey];
    if (!Array.isArray(items)) return;
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= items.length) return;
    const newItems = [...items];
    const [moved] = newItems.splice(idx, 1);
    newItems.splice(targetIdx, 0, moved);
    setResumeData((prev) => {
      const next = { ...prev, [sectionKey]: newItems };
      triggerDebouncedAutosave(next);
      return next;
    });
  };

  // Delete Entry Helper
  const deleteEntry = (sectionKey, idx) => {
    const items = resumeData[sectionKey];
    if (!Array.isArray(items)) return;
    const newItems = items.filter((_, i) => i !== idx);
    setResumeData((prev) => {
      const next = { ...prev, [sectionKey]: newItems };
      triggerDebouncedAutosave(next);
      return next;
    });
    addToast('Entry removed', 'info');
  };

  return (
    <div className="resume-builder-root animate-fade-in">
      {/* Top Application Bar */}
      <div className="builder-header-bar">
        <div className="builder-title-group">
          <input
            type="text"
            className="builder-inline-title-input"
            value={resumeTitle}
            onChange={(e) => {
              setResumeTitle(e.target.value);
              triggerDebouncedAutosave(resumeData, { title: e.target.value });
            }}
            placeholder="Name your resume version..."
            title="Click to rename resume"
          />

          <div className="builder-save-status-indicator">
            {isSaving ? (
              <span className="save-status saving">
                <span className="btn-spinner" /> Autosaving draft...
              </span>
            ) : isDraft ? (
              <span className="save-status draft">
                <Clock size={13} /> Unsaved edits
              </span>
            ) : (
              <span className="save-status saved">
                <CheckCircle2 size={13} className="text-emerald" />
                {lastSavedTime ? `Saved to PostgreSQL at ${lastSavedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Saved'}
              </span>
            )}
          </div>
        </div>

        {/* Action Controls Cluster */}
        <div className="builder-top-controls">
          {/* Mobile View Toggle Button */}
          <div className="mobile-view-toggle">
            <button
              type="button"
              className={`view-toggle-btn ${mobileView === 'editor' ? 'active' : ''}`}
              onClick={() => setMobileView('editor')}
            >
              <Edit3 size={14} /> Editor
            </button>
            <button
              type="button"
              className={`view-toggle-btn ${mobileView === 'preview' ? 'active' : ''}`}
              onClick={() => setMobileView('preview')}
            >
              <Eye size={14} /> Live A4
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            icon={Target}
            onClick={() => setShowJobOptModal(true)}
            title="Target optimization against a job description"
          >
            Target JD
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={Clock}
            onClick={handleOpenVersions}
            title="View version history & restore snapshots"
          >
            Versions
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={RotateCcw}
            onClick={() => setShowImportModal(true)}
            title="Import content from an existing uploaded resume"
          >
            Import
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={CopyIcon}
            onClick={handleDuplicate}
            title="Duplicate as a new resume version"
          >
            Duplicate
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={Copy}
            onClick={handleCopyFormattedText}
            title="Copy plain formatted text"
          >
            Copy Text
          </Button>

          <Button
            variant="secondary"
            size="sm"
            icon={Printer}
            onClick={() => window.print()}
            title="Browser print with A4 layout"
          >
            Print
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={Download}
            onClick={handleDownloadPdf}
            title="Export selectable-text vector PDF"
          >
            Download PDF
          </Button>
        </div>
      </div>

      {/* Template & Styling Toolbar */}
      <div className="builder-styling-bar">
        <div className="styling-group">
          <span className="styling-label">Template:</span>
          <div className="button-group">
            <button
              type="button"
              className={`styling-pill ${template === 'classic-professional' ? 'active' : ''}`}
              onClick={() => {
                setTemplate('classic-professional');
                triggerDebouncedAutosave(resumeData, { template: 'classic-professional' });
              }}
            >
              Classic Professional
            </button>
            <button
              type="button"
              className={`styling-pill ${template === 'modern-minimal' ? 'active' : ''}`}
              onClick={() => {
                setTemplate('modern-minimal');
                triggerDebouncedAutosave(resumeData, { template: 'modern-minimal' });
              }}
            >
              Modern Minimal
            </button>
            <button
              type="button"
              className={`styling-pill ${template === 'technical-developer' ? 'active' : ''}`}
              onClick={() => {
                setTemplate('technical-developer');
                triggerDebouncedAutosave(resumeData, { template: 'technical-developer' });
              }}
            >
              Technical Developer
            </button>
          </div>
        </div>

        <div className="styling-group">
          <span className="styling-label">Typography:</span>
          <select
            value={fontFamily}
            onChange={(e) => {
              setFontFamily(e.target.value);
              triggerDebouncedAutosave(resumeData, { fontFamily: e.target.value });
            }}
            className="styling-select"
          >
            <option value="sans">Inter / Modern Sans</option>
            <option value="serif">Merriweather / Classic Serif</option>
            <option value="mono">JetBrains / Tech Monospace</option>
          </select>
        </div>

        <div className="styling-group">
          <span className="styling-label">Spacing:</span>
          <select
            value={fontSize}
            onChange={(e) => {
              setFontSize(e.target.value);
              triggerDebouncedAutosave(resumeData, { fontSize: e.target.value });
            }}
            className="styling-select"
          >
            <option value="compact">Compact (Fit 1 Page)</option>
            <option value="medium">Medium (Standard)</option>
            <option value="spacious">Spacious (Relaxed)</option>
          </select>
        </div>

        <div className="styling-group">
          <span className="styling-label">Accent:</span>
          <div className="color-swatch-row">
            {[
              { hex: '#8B5CF6', label: 'Violet' },
              { hex: '#6366F1', label: 'Indigo' },
              { hex: '#10B981', label: 'Emerald' },
              { hex: '#1E293B', label: 'Slate' },
              { hex: '#991B1B', label: 'Burgundy' },
              { hex: '#0D9488', label: 'Teal' },
            ].map((col) => (
              <button
                key={col.hex}
                type="button"
                className={`color-swatch-dot ${accentColor === col.hex ? 'active' : ''}`}
                style={{ backgroundColor: col.hex }}
                onClick={() => {
                  setAccentColor(col.hex);
                  triggerDebouncedAutosave(resumeData, { accentColor: col.hex });
                }}
                title={col.label}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Split-Screen Workspace */}
      <div className={`builder-workspace-grid ${mobileView === 'preview' ? 'mobile-preview-active' : ''}`}>
        {/* Left Side: Section Navigation & Editors */}
        <div className="builder-editor-pane">
          {/* Section Navigation Tabs */}
          <div className="editor-nav-bar">
            {[
              { key: 'personal', label: 'Personal', icon: User },
              { key: 'summary', label: 'Summary', icon: Sparkles },
              { key: 'experience', label: 'Experience', icon: Briefcase, count: resumeData.experiences?.length },
              { key: 'skills', label: 'Skills', icon: Code },
              { key: 'projects', label: 'Projects', icon: FolderGit2, count: resumeData.projects?.length },
              { key: 'education', label: 'Education', icon: GraduationCap, count: resumeData.education?.length },
              { key: 'certifications', label: 'Certifications', icon: Award, count: resumeData.certifications?.length },
              { key: 'achievements', label: 'Achievements', icon: Award, count: resumeData.achievements?.length },
              { key: 'links', label: 'Links', icon: LinkIcon, count: resumeData.links?.length },
              { key: 'reorder', label: 'Sections', icon: Sliders },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  type="button"
                  className={`editor-tab-item ${activeTab === tab.key ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                  {typeof tab.count === 'number' && tab.count > 0 && (
                    <span className="tab-count-pill">{tab.count}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Form Scroll Container */}
          <div className="editor-form-scroll-container">
            {/* 1. PERSONAL INFORMATION */}
            {activeTab === 'personal' && (
              <div className="editor-section-card animate-fade-in">
                <div className="section-card-title-row">
                  <div>
                    <h3 className="section-card-title">Personal Details & Header</h3>
                    <p className="section-card-subtitle">Essential candidate identification and portfolio links</p>
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-field">
                    <label>Full Legal Name</label>
                    <input
                      type="text"
                      value={resumeData.personalInfo?.fullName || ''}
                      onChange={(e) => {
                        const next = {
                          ...resumeData,
                          personalInfo: { ...resumeData.personalInfo, fullName: e.target.value },
                        };
                        setResumeData(next);
                        triggerDebouncedAutosave(next);
                      }}
                    />
                  </div>
                  <div className="form-field">
                    <label>Target Professional Title</label>
                    <input
                      type="text"
                      value={resumeData.personalInfo?.targetTitle || ''}
                      onChange={(e) => {
                        const next = {
                          ...resumeData,
                          personalInfo: { ...resumeData.personalInfo, targetTitle: e.target.value },
                        };
                        setResumeData(next);
                        triggerDebouncedAutosave(next);
                      }}
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-field">
                    <label>Email Address</label>
                    <input
                      type="email"
                      value={resumeData.personalInfo?.email || ''}
                      onChange={(e) => {
                        const next = {
                          ...resumeData,
                          personalInfo: { ...resumeData.personalInfo, email: e.target.value },
                        };
                        setResumeData(next);
                        triggerDebouncedAutosave(next);
                      }}
                    />
                  </div>
                  <div className="form-field">
                    <label>Phone Number</label>
                    <input
                      type="text"
                      value={resumeData.personalInfo?.phone || ''}
                      onChange={(e) => {
                        const next = {
                          ...resumeData,
                          personalInfo: { ...resumeData.personalInfo, phone: e.target.value },
                        };
                        setResumeData(next);
                        triggerDebouncedAutosave(next);
                      }}
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-field">
                    <label>Location (City, State / Remote)</label>
                    <input
                      type="text"
                      value={resumeData.personalInfo?.location || ''}
                      onChange={(e) => {
                        const next = {
                          ...resumeData,
                          personalInfo: { ...resumeData.personalInfo, location: e.target.value },
                        };
                        setResumeData(next);
                        triggerDebouncedAutosave(next);
                      }}
                    />
                  </div>
                  <div className="form-field">
                    <label>LinkedIn URL</label>
                    <input
                      type="text"
                      value={resumeData.personalInfo?.linkedin || ''}
                      onChange={(e) => {
                        const next = {
                          ...resumeData,
                          personalInfo: { ...resumeData.personalInfo, linkedin: e.target.value },
                        };
                        setResumeData(next);
                        triggerDebouncedAutosave(next);
                      }}
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-field">
                    <label>GitHub Profile</label>
                    <input
                      type="text"
                      value={resumeData.personalInfo?.github || ''}
                      onChange={(e) => {
                        const next = {
                          ...resumeData,
                          personalInfo: { ...resumeData.personalInfo, github: e.target.value },
                        };
                        setResumeData(next);
                        triggerDebouncedAutosave(next);
                      }}
                    />
                  </div>
                  <div className="form-field">
                    <label>Portfolio / Personal Website</label>
                    <input
                      type="text"
                      value={resumeData.personalInfo?.portfolio || ''}
                      onChange={(e) => {
                        const next = {
                          ...resumeData,
                          personalInfo: { ...resumeData.personalInfo, portfolio: e.target.value },
                        };
                        setResumeData(next);
                        triggerDebouncedAutosave(next);
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. PROFESSIONAL SUMMARY */}
            {activeTab === 'summary' && (
              <div className="editor-section-card animate-fade-in">
                <div className="section-card-title-row">
                  <div>
                    <h3 className="section-card-title">Professional Executive Summary</h3>
                    <p className="section-card-subtitle">Concise statement of technical mastery and measurable career impact</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Sparkles}
                    onClick={() =>
                      openAiAssistant('summary', 'summary', resumeData.summary, {
                        role: resumeData.personalInfo?.targetTitle,
                      })
                    }
                  >
                    AI Enhance Summary
                  </Button>
                </div>

                <div className="form-field">
                  <textarea
                    rows={6}
                    className="editor-textarea"
                    value={resumeData.summary}
                    onChange={(e) => {
                      const next = { ...resumeData, summary: e.target.value };
                      setResumeData(next);
                      triggerDebouncedAutosave(next);
                    }}
                    placeholder="Highlight your seniority, signature technologies, and measurable scale achievements..."
                  />
                </div>
              </div>
            )}

            {/* 3. WORK EXPERIENCE */}
            {activeTab === 'experience' && (
              <div className="editor-section-card animate-fade-in">
                <div className="section-card-title-row">
                  <div>
                    <h3 className="section-card-title">Work Experience</h3>
                    <p className="section-card-subtitle">Employment history with Google XYZ accomplishment bullet points</p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Plus}
                    onClick={() => {
                      const newExp = {
                        id: `exp-${Date.now()}`,
                        role: 'Software Engineer',
                        company: 'Company Name',
                        location: 'Location',
                        startDate: '2023',
                        endDate: '',
                        current: true,
                        bullets: ['Accomplished [X] as measured by [Y] by implementing [Z].'],
                      };
                      const next = { ...resumeData, experiences: [newExp, ...resumeData.experiences] };
                      setResumeData(next);
                      triggerDebouncedAutosave(next);
                    }}
                  >
                    Add Position
                  </Button>
                </div>

                {resumeData.experiences?.map((exp, idx) => (
                  <div key={exp.id} className="entry-card-block">
                    <div className="entry-header-row">
                      <div className="entry-title-meta">
                        <span className="entry-index-badge">#{idx + 1}</span>
                        <strong>{exp.role || 'Role'}</strong> at <span>{exp.company || 'Company'}</span>
                      </div>
                      <div className="entry-reorder-actions">
                        <button
                          type="button"
                          className="reorder-btn"
                          disabled={idx === 0}
                          onClick={() => moveEntry('experiences', idx, -1)}
                          title="Move up"
                        >
                          <ArrowUp size={13} />
                        </button>
                        <button
                          type="button"
                          className="reorder-btn"
                          disabled={idx === resumeData.experiences.length - 1}
                          onClick={() => moveEntry('experiences', idx, 1)}
                          title="Move down"
                        >
                          <ArrowDown size={13} />
                        </button>
                        <button
                          type="button"
                          className="delete-btn"
                          onClick={() => deleteEntry('experiences', idx)}
                          title="Delete position"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    <div className="form-grid-2">
                      <div className="form-field">
                        <label>Job Title</label>
                        <input
                          type="text"
                          value={exp.role}
                          onChange={(e) => {
                            const newExp = [...resumeData.experiences];
                            newExp[idx].role = e.target.value;
                            const next = { ...resumeData, experiences: newExp };
                            setResumeData(next);
                            triggerDebouncedAutosave(next);
                          }}
                        />
                      </div>
                      <div className="form-field">
                        <label>Company Name</label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => {
                            const newExp = [...resumeData.experiences];
                            newExp[idx].company = e.target.value;
                            const next = { ...resumeData, experiences: newExp };
                            setResumeData(next);
                            triggerDebouncedAutosave(next);
                          }}
                        />
                      </div>
                    </div>

                    <div className="form-grid-3">
                      <div className="form-field">
                        <label>Location</label>
                        <input
                          type="text"
                          value={exp.location}
                          onChange={(e) => {
                            const newExp = [...resumeData.experiences];
                            newExp[idx].location = e.target.value;
                            const next = { ...resumeData, experiences: newExp };
                            setResumeData(next);
                            triggerDebouncedAutosave(next);
                          }}
                        />
                      </div>
                      <div className="form-field">
                        <label>Start Date</label>
                        <input
                          type="text"
                          value={exp.startDate}
                          onChange={(e) => {
                            const newExp = [...resumeData.experiences];
                            newExp[idx].startDate = e.target.value;
                            const next = { ...resumeData, experiences: newExp };
                            setResumeData(next);
                            triggerDebouncedAutosave(next);
                          }}
                        />
                      </div>
                      <div className="form-field">
                        <label>End Date</label>
                        <input
                          type="text"
                          disabled={exp.current}
                          value={exp.current ? 'Present' : exp.endDate}
                          onChange={(e) => {
                            const newExp = [...resumeData.experiences];
                            newExp[idx].endDate = e.target.value;
                            const next = { ...resumeData, experiences: newExp };
                            setResumeData(next);
                            triggerDebouncedAutosave(next);
                          }}
                        />
                      </div>
                    </div>

                    {/* Bullet Points */}
                    <div className="entry-bullets-section">
                      <label className="bullets-heading">Accomplishment Bullets:</label>
                      {exp.bullets?.map((bullet, bIdx) => (
                        <div key={bIdx} className="bullet-row-wrapper">
                          <textarea
                            rows={2}
                            className="bullet-input"
                            value={bullet}
                            onChange={(e) => {
                              const newExp = [...resumeData.experiences];
                              newExp[idx].bullets[bIdx] = e.target.value;
                              const next = { ...resumeData, experiences: newExp };
                              setResumeData(next);
                              triggerDebouncedAutosave(next);
                            }}
                          />
                          <div className="bullet-btn-group">
                            <button
                              type="button"
                              className="ai-bullet-btn"
                              onClick={() =>
                                openAiAssistant('bullet', `experience-bullet-${exp.id}-${bIdx}`, bullet, {
                                  role: exp.role,
                                  company: exp.company,
                                })
                              }
                              title="Improve bullet with Gemini Google XYZ formula"
                            >
                              <Sparkles size={12} />
                              <span>AI XYZ</span>
                            </button>
                            <button
                              type="button"
                              className="bullet-del-btn"
                              onClick={() => {
                                const newExp = [...resumeData.experiences];
                                newExp[idx].bullets = newExp[idx].bullets.filter((_, i) => i !== bIdx);
                                const next = { ...resumeData, experiences: newExp };
                                setResumeData(next);
                                triggerDebouncedAutosave(next);
                              }}
                              title="Delete bullet"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      ))}

                      <Button
                        variant="outline"
                        size="sm"
                        icon={Plus}
                        onClick={() => {
                          const newExp = [...resumeData.experiences];
                          newExp[idx].bullets = [
                            ...(newExp[idx].bullets || []),
                            'Accomplished [X] as measured by [Y] by doing [Z].',
                          ];
                          const next = { ...resumeData, experiences: newExp };
                          setResumeData(next);
                          triggerDebouncedAutosave(next);
                        }}
                        className="add-sub-item-btn"
                      >
                        Add Bullet Point
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 4. TECHNICAL SKILLS */}
            {activeTab === 'skills' && (
              <div className="editor-section-card animate-fade-in">
                <div className="section-card-title-row">
                  <div>
                    <h3 className="section-card-title">Technical Skills & Competencies</h3>
                    <p className="section-card-subtitle">Categorized skills parsed with 100% accuracy by ATS keyword engines</p>
                  </div>
                </div>

                {['languages', 'frameworks', 'databases', 'tools', 'other'].map((catKey) => {
                  const labelMap = {
                    languages: 'Languages & Runtimes',
                    frameworks: 'Frameworks & Libraries',
                    databases: 'Databases & Storage',
                    tools: 'Cloud, DevOps & Tools',
                    other: 'Methodologies & Core Competencies',
                  };
                  const currentItems = Array.isArray(resumeData.skills?.[catKey])
                    ? resumeData.skills[catKey].join(', ')
                    : (resumeData.skills?.[catKey] || '');

                  return (
                    <div key={catKey} className="form-field">
                      <label>{labelMap[catKey]}</label>
                      <input
                        type="text"
                        value={currentItems}
                        onChange={(e) => {
                          const items = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                          const next = {
                            ...resumeData,
                            skills: { ...resumeData.skills, [catKey]: items },
                          };
                          setResumeData(next);
                          triggerDebouncedAutosave(next);
                        }}
                        placeholder="Comma separated values (e.g. React, Node.js, PostgreSQL)"
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {/* 5. PROJECTS */}
            {activeTab === 'projects' && (
              <div className="editor-section-card animate-fade-in">
                <div className="section-card-title-row">
                  <div>
                    <h3 className="section-card-title">Projects & Open Source</h3>
                    <p className="section-card-subtitle">Notable software applications, architecture designs, and repos</p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Plus}
                    onClick={() => {
                      const newProj = {
                        id: `proj-${Date.now()}`,
                        name: 'Project Name',
                        techStack: ['Node.js', 'React'],
                        link: 'github.com/user/repo',
                        description: 'Architected and built full-stack platform with automated CI/CD.',
                        bullets: [],
                      };
                      const next = { ...resumeData, projects: [newProj, ...resumeData.projects] };
                      setResumeData(next);
                      triggerDebouncedAutosave(next);
                    }}
                  >
                    Add Project
                  </Button>
                </div>

                {resumeData.projects?.map((proj, idx) => (
                  <div key={proj.id} className="entry-card-block">
                    <div className="entry-header-row">
                      <div className="entry-title-meta">
                        <span className="entry-index-badge">#{idx + 1}</span>
                        <strong>{proj.name}</strong>
                      </div>
                      <div className="entry-reorder-actions">
                        <button
                          type="button"
                          className="reorder-btn"
                          disabled={idx === 0}
                          onClick={() => moveEntry('projects', idx, -1)}
                        >
                          <ArrowUp size={13} />
                        </button>
                        <button
                          type="button"
                          className="reorder-btn"
                          disabled={idx === resumeData.projects.length - 1}
                          onClick={() => moveEntry('projects', idx, 1)}
                        >
                          <ArrowDown size={13} />
                        </button>
                        <button
                          type="button"
                          className="delete-btn"
                          onClick={() => deleteEntry('projects', idx)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    <div className="form-grid-2">
                      <div className="form-field">
                        <label>Project Name</label>
                        <input
                          type="text"
                          value={proj.name}
                          onChange={(e) => {
                            const newProjects = [...resumeData.projects];
                            newProjects[idx].name = e.target.value;
                            const next = { ...resumeData, projects: newProjects };
                            setResumeData(next);
                            triggerDebouncedAutosave(next);
                          }}
                        />
                      </div>
                      <div className="form-field">
                        <label>Live URL / GitHub Repo</label>
                        <input
                          type="text"
                          value={proj.link || ''}
                          onChange={(e) => {
                            const newProjects = [...resumeData.projects];
                            newProjects[idx].link = e.target.value;
                            const next = { ...resumeData, projects: newProjects };
                            setResumeData(next);
                            triggerDebouncedAutosave(next);
                          }}
                        />
                      </div>
                    </div>

                    <div className="form-field">
                      <label>Tech Stack (Comma-separated)</label>
                      <input
                        type="text"
                        value={Array.isArray(proj.techStack) ? proj.techStack.join(', ') : (proj.techStack || '')}
                        onChange={(e) => {
                          const newProjects = [...resumeData.projects];
                          newProjects[idx].techStack = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                          const next = { ...resumeData, projects: newProjects };
                          setResumeData(next);
                          triggerDebouncedAutosave(next);
                        }}
                      />
                    </div>

                    <div className="form-field">
                      <div className="label-with-ai-btn">
                        <label>Overview Description</label>
                        <button
                          type="button"
                          className="ai-tiny-btn"
                          onClick={() =>
                            openAiAssistant('project', `project-desc-${proj.id}`, proj.description, {
                              role: proj.name,
                            })
                          }
                        >
                          <Sparkles size={11} /> AI Polish
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        className="editor-textarea"
                        value={proj.description}
                        onChange={(e) => {
                          const newProjects = [...resumeData.projects];
                          newProjects[idx].description = e.target.value;
                          const next = { ...resumeData, projects: newProjects };
                          setResumeData(next);
                          triggerDebouncedAutosave(next);
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 6. EDUCATION */}
            {activeTab === 'education' && (
              <div className="editor-section-card animate-fade-in">
                <div className="section-card-title-row">
                  <div>
                    <h3 className="section-card-title">Education</h3>
                    <p className="section-card-subtitle">Academic degrees and universities</p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Plus}
                    onClick={() => {
                      const newEdu = {
                        id: `edu-${Date.now()}`,
                        degree: 'Bachelor of Science',
                        school: 'University Name',
                        field: 'Computer Science',
                        startDate: '2016',
                        endDate: '2020',
                        gpa: '',
                        honors: '',
                      };
                      const next = { ...resumeData, education: [...resumeData.education, newEdu] };
                      setResumeData(next);
                      triggerDebouncedAutosave(next);
                    }}
                  >
                    Add Degree
                  </Button>
                </div>

                {resumeData.education?.map((edu, idx) => (
                  <div key={edu.id} className="entry-card-block">
                    <div className="entry-header-row">
                      <div className="entry-title-meta">
                        <span className="entry-index-badge">#{idx + 1}</span>
                        <strong>{edu.degree}</strong> — {edu.school}
                      </div>
                      <div className="entry-reorder-actions">
                        <button
                          type="button"
                          className="reorder-btn"
                          disabled={idx === 0}
                          onClick={() => moveEntry('education', idx, -1)}
                        >
                          <ArrowUp size={13} />
                        </button>
                        <button
                          type="button"
                          className="reorder-btn"
                          disabled={idx === resumeData.education.length - 1}
                          onClick={() => moveEntry('education', idx, 1)}
                        >
                          <ArrowDown size={13} />
                        </button>
                        <button
                          type="button"
                          className="delete-btn"
                          onClick={() => deleteEntry('education', idx)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    <div className="form-grid-2">
                      <div className="form-field">
                        <label>Degree Title</label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => {
                            const newEdu = [...resumeData.education];
                            newEdu[idx].degree = e.target.value;
                            const next = { ...resumeData, education: newEdu };
                            setResumeData(next);
                            triggerDebouncedAutosave(next);
                          }}
                        />
                      </div>
                      <div className="form-field">
                        <label>University / Institution</label>
                        <input
                          type="text"
                          value={edu.school}
                          onChange={(e) => {
                            const newEdu = [...resumeData.education];
                            newEdu[idx].school = e.target.value;
                            const next = { ...resumeData, education: newEdu };
                            setResumeData(next);
                            triggerDebouncedAutosave(next);
                          }}
                        />
                      </div>
                    </div>

                    <div className="form-grid-3">
                      <div className="form-field">
                        <label>Graduation Year</label>
                        <input
                          type="text"
                          value={edu.endDate}
                          onChange={(e) => {
                            const newEdu = [...resumeData.education];
                            newEdu[idx].endDate = e.target.value;
                            const next = { ...resumeData, education: newEdu };
                            setResumeData(next);
                            triggerDebouncedAutosave(next);
                          }}
                        />
                      </div>
                      <div className="form-field">
                        <label>GPA (Optional)</label>
                        <input
                          type="text"
                          value={edu.gpa || ''}
                          onChange={(e) => {
                            const newEdu = [...resumeData.education];
                            newEdu[idx].gpa = e.target.value;
                            const next = { ...resumeData, education: newEdu };
                            setResumeData(next);
                            triggerDebouncedAutosave(next);
                          }}
                        />
                      </div>
                      <div className="form-field">
                        <label>Honors / Awards</label>
                        <input
                          type="text"
                          value={edu.honors || ''}
                          onChange={(e) => {
                            const newEdu = [...resumeData.education];
                            newEdu[idx].honors = e.target.value;
                            const next = { ...resumeData, education: newEdu };
                            setResumeData(next);
                            triggerDebouncedAutosave(next);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 7. CERTIFICATIONS */}
            {activeTab === 'certifications' && (
              <div className="editor-section-card animate-fade-in">
                <div className="section-card-title-row">
                  <div>
                    <h3 className="section-card-title">Certifications & Accreditations</h3>
                    <p className="section-card-subtitle">Industry qualifications (AWS, GCP, CKA, CISSP, etc.)</p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Plus}
                    onClick={() => {
                      const newCert = {
                        id: `cert-${Date.now()}`,
                        name: 'Certificate Name',
                        issuer: 'Issuing Organization',
                        date: '2023',
                        credentialUrl: '',
                      };
                      const next = { ...resumeData, certifications: [...resumeData.certifications, newCert] };
                      setResumeData(next);
                      triggerDebouncedAutosave(next);
                    }}
                  >
                    Add Certification
                  </Button>
                </div>

                {resumeData.certifications?.map((cert, idx) => (
                  <div key={cert.id} className="entry-card-block">
                    <div className="entry-header-row">
                      <strong>{cert.name}</strong>
                      <button
                        type="button"
                        className="delete-btn"
                        onClick={() => deleteEntry('certifications', idx)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <div className="form-grid-3">
                      <div className="form-field">
                        <label>Certification Name</label>
                        <input
                          type="text"
                          value={cert.name}
                          onChange={(e) => {
                            const newCerts = [...resumeData.certifications];
                            newCerts[idx].name = e.target.value;
                            const next = { ...resumeData, certifications: newCerts };
                            setResumeData(next);
                            triggerDebouncedAutosave(next);
                          }}
                        />
                      </div>
                      <div className="form-field">
                        <label>Issuer (e.g. AWS, Microsoft)</label>
                        <input
                          type="text"
                          value={cert.issuer}
                          onChange={(e) => {
                            const newCerts = [...resumeData.certifications];
                            newCerts[idx].issuer = e.target.value;
                            const next = { ...resumeData, certifications: newCerts };
                            setResumeData(next);
                            triggerDebouncedAutosave(next);
                          }}
                        />
                      </div>
                      <div className="form-field">
                        <label>Date Attained</label>
                        <input
                          type="text"
                          value={cert.date}
                          onChange={(e) => {
                            const newCerts = [...resumeData.certifications];
                            newCerts[idx].date = e.target.value;
                            const next = { ...resumeData, certifications: newCerts };
                            setResumeData(next);
                            triggerDebouncedAutosave(next);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 8. ACHIEVEMENTS & LINKS */}
            {activeTab === 'achievements' && (
              <div className="editor-section-card animate-fade-in">
                <div className="section-card-title-row">
                  <div>
                    <h3 className="section-card-title">Honors & Awards</h3>
                    <p className="section-card-subtitle">Key distinctions, patents, or hackathon wins</p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Plus}
                    onClick={() => {
                      const newAch = {
                        id: `ach-${Date.now()}`,
                        title: 'Achievement Title',
                        description: 'Details of the distinction',
                        date: '2023',
                      };
                      const next = { ...resumeData, achievements: [...resumeData.achievements, newAch] };
                      setResumeData(next);
                      triggerDebouncedAutosave(next);
                    }}
                  >
                    Add Honor
                  </Button>
                </div>

                {resumeData.achievements?.map((ach, idx) => (
                  <div key={ach.id} className="entry-card-block">
                    <div className="entry-header-row">
                      <strong>{ach.title}</strong>
                      <button
                        type="button"
                        className="delete-btn"
                        onClick={() => deleteEntry('achievements', idx)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <div className="form-grid-2">
                      <div className="form-field">
                        <label>Distinction Title</label>
                        <input
                          type="text"
                          value={ach.title}
                          onChange={(e) => {
                            const newAchs = [...resumeData.achievements];
                            newAchs[idx].title = e.target.value;
                            const next = { ...resumeData, achievements: newAchs };
                            setResumeData(next);
                            triggerDebouncedAutosave(next);
                          }}
                        />
                      </div>
                      <div className="form-field">
                        <label>Description</label>
                        <input
                          type="text"
                          value={ach.description}
                          onChange={(e) => {
                            const newAchs = [...resumeData.achievements];
                            newAchs[idx].description = e.target.value;
                            const next = { ...resumeData, achievements: newAchs };
                            setResumeData(next);
                            triggerDebouncedAutosave(next);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 9. CUSTOM LINKS */}
            {activeTab === 'links' && (
              <div className="editor-section-card animate-fade-in">
                <div className="section-card-title-row">
                  <div>
                    <h3 className="section-card-title">Custom Links</h3>
                    <p className="section-card-subtitle">Personal sites, technical publications, or social channels</p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Plus}
                    onClick={() => {
                      const newLink = {
                        id: `link-${Date.now()}`,
                        label: 'Medium Blog',
                        url: 'https://',
                      };
                      const next = { ...resumeData, links: [...resumeData.links, newLink] };
                      setResumeData(next);
                      triggerDebouncedAutosave(next);
                    }}
                  >
                    Add Link
                  </Button>
                </div>

                {resumeData.links?.map((lnk, idx) => (
                  <div key={lnk.id} className="entry-card-block">
                    <div className="entry-header-row">
                      <strong>{lnk.label}</strong>
                      <button
                        type="button"
                        className="delete-btn"
                        onClick={() => deleteEntry('links', idx)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <div className="form-grid-2">
                      <div className="form-field">
                        <label>Label</label>
                        <input
                          type="text"
                          value={lnk.label}
                          onChange={(e) => {
                            const newLinks = [...resumeData.links];
                            newLinks[idx].label = e.target.value;
                            const next = { ...resumeData, links: newLinks };
                            setResumeData(next);
                            triggerDebouncedAutosave(next);
                          }}
                        />
                      </div>
                      <div className="form-field">
                        <label>URL</label>
                        <input
                          type="text"
                          value={lnk.url}
                          onChange={(e) => {
                            const newLinks = [...resumeData.links];
                            newLinks[idx].url = e.target.value;
                            const next = { ...resumeData, links: newLinks };
                            setResumeData(next);
                            triggerDebouncedAutosave(next);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 10. REORDER SECTIONS */}
            {activeTab === 'reorder' && (
              <div className="editor-section-card animate-fade-in">
                <div className="section-card-title-row">
                  <div>
                    <h3 className="section-card-title">Reorder Resume Sections</h3>
                    <p className="section-card-subtitle">Customize the vertical section hierarchy on your exported resume</p>
                  </div>
                </div>

                <div className="section-reorder-list">
                  {sectionOrder.map((sKey, sIdx) => {
                    const labelMap = {
                      personal: 'Personal Information (Header)',
                      summary: 'Professional Summary',
                      experience: 'Work Experience',
                      skills: 'Technical Skills & Competencies',
                      projects: 'Projects & Initiatives',
                      education: 'Education',
                      certifications: 'Certifications',
                      achievements: 'Honors & Achievements',
                      links: 'Custom Links & Portfolio',
                    };
                    return (
                      <div key={sKey} className="reorder-item-row">
                        <span className="reorder-index-badge">#{sIdx + 1}</span>
                        <span className="reorder-section-name">{labelMap[sKey] || sKey}</span>
                        <div className="reorder-btn-cluster">
                          <button
                            type="button"
                            className="reorder-btn"
                            disabled={sIdx === 0}
                            onClick={() => moveSection(sIdx, -1)}
                            title="Move section up"
                          >
                            <ArrowUp size={13} />
                          </button>
                          <button
                            type="button"
                            className="reorder-btn"
                            disabled={sIdx === sectionOrder.length - 1}
                            onClick={() => moveSection(sIdx, 1)}
                            title="Move section down"
                          >
                            <ArrowDown size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Live A4 Document Preview */}
        <div className="builder-preview-pane">
          <div className="preview-top-status-bar">
            <div className="status-badge-flex">
              <span className="a4-pill">A4 Dimension (210 × 297 mm)</span>
              <span className="ats-badge">
                <CheckCircle2 size={13} className="text-emerald" /> Single-Column ATS Clean
              </span>
            </div>
            <div className="preview-zoom-indicator">
              <span>{template.replace('-', ' ').toUpperCase()}</span>
            </div>
          </div>

          <div className="live-a4-viewport">
            {/* The Actual Printable Resume Paper */}
            <div
              className={`a4-paper-sheet template-${template} font-${fontFamily} spacing-${fontSize}`}
              style={{ '--accent': accentColor }}
              id="resume-printable-doc"
            >
              {/* Header Render */}
              <div className="paper-header-block">
                <h1 className="paper-name">{resumeData.personalInfo?.fullName || 'Applicant Name'}</h1>
                {resumeData.personalInfo?.targetTitle && (
                  <p className="paper-target-title">{resumeData.personalInfo.targetTitle}</p>
                )}

                <div className="paper-contact-ribbon">
                  {[
                    resumeData.personalInfo?.email,
                    resumeData.personalInfo?.phone,
                    resumeData.personalInfo?.location,
                    resumeData.personalInfo?.linkedin,
                    resumeData.personalInfo?.github,
                    resumeData.personalInfo?.portfolio,
                  ]
                    .filter(Boolean)
                    .map((item, idx) => (
                      <span key={idx} className="ribbon-item">
                        {idx > 0 && <span className="ribbon-sep">•</span>}
                        {item}
                      </span>
                    ))}
                </div>
              </div>

              {/* Dynamic Section Ordering */}
              {sectionOrder.map((sectionKey) => {
                if (sectionKey === 'summary' && resumeData.summary?.trim()) {
                  return (
                    <div key="summary" className="paper-section-block">
                      <h2 className="paper-section-heading">
                        {template === 'technical-developer' ? '// PROFESSIONAL SUMMARY' : 'PROFESSIONAL SUMMARY'}
                      </h2>
                      <div className="paper-section-divider-line" />
                      <p className="paper-summary-paragraph">{resumeData.summary}</p>
                    </div>
                  );
                }

                if (sectionKey === 'experience' && resumeData.experiences?.length > 0) {
                  return (
                    <div key="experience" className="paper-section-block">
                      <h2 className="paper-section-heading">
                        {template === 'technical-developer' ? '// WORK EXPERIENCE' : 'WORK EXPERIENCE'}
                      </h2>
                      <div className="paper-section-divider-line" />
                      {resumeData.experiences.map((exp) => (
                        <div key={exp.id} className="paper-item-card">
                          <div className="item-header-flex">
                            <div className="item-role-company">
                              <strong className="item-role">{exp.role}</strong>
                              <span className="item-sep"> — </span>
                              <span className="item-company">{exp.company}</span>
                            </div>
                            <div className="item-dates-loc">
                              <span>{[exp.startDate, exp.current ? 'Present' : exp.endDate].filter(Boolean).join(' - ')}</span>
                              {exp.location && <span> | {exp.location}</span>}
                            </div>
                          </div>
                          {exp.bullets?.length > 0 && (
                            <ul className="paper-bullet-list">
                              {exp.bullets.map((b, bIdx) => (
                                <li key={bIdx} className="paper-bullet-item">{b}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                }

                if (sectionKey === 'skills' && Object.keys(resumeData.skills || {}).length > 0) {
                  return (
                    <div key="skills" className="paper-section-block">
                      <h2 className="paper-section-heading">
                        {template === 'technical-developer' ? '// TECHNICAL COMPETENCIES' : 'TECHNICAL COMPETENCIES'}
                      </h2>
                      <div className="paper-section-divider-line" />
                      <div className="paper-skills-layout">
                        {Object.entries(resumeData.skills).map(([catKey, list]) => {
                          const items = Array.isArray(list) ? list.join(', ') : list;
                          if (!items || !items.trim()) return null;
                          const labelMap = {
                            languages: 'Languages & Runtimes',
                            frameworks: 'Frameworks & Libraries',
                            databases: 'Databases & Storage',
                            tools: 'Cloud, DevOps & Tools',
                            other: 'Methodologies & Other',
                          };
                          return (
                            <div key={catKey} className="paper-skill-row">
                              <strong className="skill-cat-title">{labelMap[catKey] || catKey}: </strong>
                              <span className="skill-items-text">{items}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                if (sectionKey === 'projects' && resumeData.projects?.length > 0) {
                  return (
                    <div key="projects" className="paper-section-block">
                      <h2 className="paper-section-heading">
                        {template === 'technical-developer' ? '// NOTABLE PROJECTS' : 'PROJECTS & INITIATIVES'}
                      </h2>
                      <div className="paper-section-divider-line" />
                      {resumeData.projects.map((proj) => (
                        <div key={proj.id} className="paper-item-card">
                          <div className="item-header-flex">
                            <div>
                              <strong className="item-role">{proj.name}</strong>
                              {proj.techStack && (
                                <span className="item-tech-tag">
                                  {' '}
                                  [{Array.isArray(proj.techStack) ? proj.techStack.join(', ') : proj.techStack}]
                                </span>
                              )}
                            </div>
                            {proj.link && <span className="item-dates-loc">{proj.link}</span>}
                          </div>
                          {proj.description && <p className="paper-summary-paragraph">{proj.description}</p>}
                        </div>
                      ))}
                    </div>
                  );
                }

                if (sectionKey === 'education' && resumeData.education?.length > 0) {
                  return (
                    <div key="education" className="paper-section-block">
                      <h2 className="paper-section-heading">
                        {template === 'technical-developer' ? '// EDUCATION' : 'EDUCATION'}
                      </h2>
                      <div className="paper-section-divider-line" />
                      {resumeData.education.map((edu) => (
                        <div key={edu.id} className="paper-item-card">
                          <div className="item-header-flex">
                            <div className="item-role-company">
                              <strong className="item-role">{edu.degree}</strong>
                              {edu.school && <span className="item-company"> — {edu.school}</span>}
                            </div>
                            <div className="item-dates-loc">
                              <span>{[edu.startDate, edu.endDate].filter(Boolean).join(' - ')}</span>
                            </div>
                          </div>
                          {(edu.honors || edu.gpa) && (
                            <p className="paper-honors-text">
                              {[edu.gpa ? `GPA: ${edu.gpa}` : null, edu.honors].filter(Boolean).join(' • ')}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                }

                if (sectionKey === 'certifications' && resumeData.certifications?.length > 0) {
                  return (
                    <div key="certifications" className="paper-section-block">
                      <h2 className="paper-section-heading">
                        {template === 'technical-developer' ? '// CERTIFICATIONS' : 'CERTIFICATIONS & CREDENTIALS'}
                      </h2>
                      <div className="paper-section-divider-line" />
                      <div className="paper-cert-list">
                        {resumeData.certifications.map((cert) => (
                          <div key={cert.id} className="paper-cert-row">
                            <strong>{cert.name}</strong>
                            {cert.issuer && <span> — {cert.issuer}</span>}
                            {cert.date && <span className="item-dates-loc"> ({cert.date})</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                if (sectionKey === 'achievements' && resumeData.achievements?.length > 0) {
                  return (
                    <div key="achievements" className="paper-section-block">
                      <h2 className="paper-section-heading">
                        {template === 'technical-developer' ? '// HONORS & AWARDS' : 'HONORS & AWARDS'}
                      </h2>
                      <div className="paper-section-divider-line" />
                      {resumeData.achievements.map((ach) => (
                        <div key={ach.id} className="paper-item-card">
                          <strong>{ach.title}</strong>
                          {ach.description && <span>: {ach.description}</span>}
                        </div>
                      ))}
                    </div>
                  );
                }

                if (sectionKey === 'links' && resumeData.links?.length > 0) {
                  return (
                    <div key="links" className="paper-section-block">
                      <h2 className="paper-section-heading">
                        {template === 'technical-developer' ? '// LINKS & PORTFOLIO' : 'LINKS & PORTFOLIO'}
                      </h2>
                      <div className="paper-section-divider-line" />
                      <p className="paper-links-row">
                        {resumeData.links.map((lnk, idx) => (
                          <span key={lnk.id}>
                            {idx > 0 && '  •  '}
                            <strong>{lnk.label}:</strong> {lnk.url}
                          </span>
                        ))}
                      </p>
                    </div>
                  );
                }

                return null;
              })}
            </div>
          </div>
        </div>
      </div>

      {/* AI Writing Assistant Modal Drawer */}
      {showAiModal && (
        <div className="builder-modal-backdrop" onClick={() => setShowAiModal(false)}>
          <div className="builder-modal-card animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top-header">
              <div className="modal-title-with-badge">
                <Sparkles size={18} className="text-violet" />
                <h3>Gemini AI Writing Assistant</h3>
                <span className="anti-fab-badge">Anti-Fabrication Verified</span>
              </div>
              <button
                type="button"
                className="modal-close-icon-btn"
                onClick={() => setShowAiModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-content-scroll">
              <p className="modal-explainer">
                Elevates wording and impact using Google’s XYZ framework (<strong>Accomplished [X], measured by [Y], by doing [Z]</strong>). No employers, degrees, or metrics are fabricated.
              </p>

              {/* Side-by-Side Original vs AI-Improved Comparison */}
              <div className="ai-comparison-grid">
                <div className="ai-comp-box original">
                  <div className="box-label">ORIGINAL CONTENT</div>
                  <div className="box-text">{aiTarget?.originalText || ''}</div>
                </div>

                <div className="ai-comp-box improved">
                  <div className="box-label">
                    <span>AI-IMPROVED REWRITE</span>
                    {aiLoading && <span className="btn-spinner" />}
                  </div>
                  {isEditingAiText ? (
                    <textarea
                      rows={4}
                      className="ai-edit-textarea"
                      value={editableAiText}
                      onChange={(e) => setEditableAiText(e.target.value)}
                    />
                  ) : (
                    <div className="box-text highlight">{editableAiText || 'Generating rewrite...'}</div>
                  )}
                </div>
              </div>

              {/* Explanation Note */}
              {aiResult?.explanation && (
                <div className="ai-explanation-note">
                  <Lightbulb size={15} className="text-amber" />
                  <p>{aiResult.explanation}</p>
                </div>
              )}

              {/* Missing Measurable Metric Prompt */}
              {aiResult?.missingMetricPrompt && (
                <div className="ai-metric-prompt-box">
                  <div className="prompt-header">
                    <HelpCircle size={15} className="text-violet" />
                    <strong>Want to strengthen this with a real measurable metric?</strong>
                  </div>
                  <p className="prompt-sub">{aiResult.missingMetricPrompt}</p>
                  <div className="prompt-input-row">
                    <input
                      type="text"
                      className="metric-input"
                      value={userSuppliedMetric}
                      onChange={(e) => setUserSuppliedMetric(e.target.value)}
                      placeholder="e.g. 42% latency reduction, $180K cloud savings, or 50K daily users"
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        triggerAiImprovement(
                          aiTarget.type,
                          aiTarget.originalText,
                          aiTarget.context,
                          userSuppliedMetric
                        )
                      }
                      disabled={!userSuppliedMetric.trim() || aiLoading}
                    >
                      Enhance with Metric
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Actions */}
            <div className="modal-bottom-actions">
              <div className="left-actions">
                <Button
                  variant="outline"
                  size="sm"
                  icon={RotateCcw}
                  onClick={() =>
                    triggerAiImprovement(
                      aiTarget.type,
                      aiTarget.originalText,
                      aiTarget.context,
                      userSuppliedMetric
                    )
                  }
                  disabled={aiLoading}
                >
                  Regenerate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  icon={Edit3}
                  onClick={() => setIsEditingAiText(!isEditingAiText)}
                >
                  {isEditingAiText ? 'Preview' : 'Edit Manually'}
                </Button>
              </div>

              <div className="right-actions">
                <Button variant="ghost" size="sm" onClick={() => setShowAiModal(false)}>
                  Reject
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={Check}
                  onClick={handleAcceptAiText}
                  disabled={aiLoading || !editableAiText}
                >
                  Accept & Apply
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Targeted Job Optimization Modal */}
      {showJobOptModal && (
        <div className="builder-modal-backdrop" onClick={() => setShowJobOptModal(false)}>
          <div className="builder-modal-card large animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top-header">
              <div className="modal-title-with-badge">
                <Target size={18} className="text-violet" />
                <h3>Targeted Job Description Optimization</h3>
              </div>
              <button
                type="button"
                className="modal-close-icon-btn"
                onClick={() => setShowJobOptModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-content-scroll">
              <p className="modal-explainer">
                Paste the target job description. Gemini will calculate keyword saturation, highlight your verified matching skills, and draft a role-specific summary without inventing achievements.
              </p>

              <form onSubmit={handleRunJobOptimization}>
                <div className="form-field">
                  <label>Paste Target Job Posting</label>
                  <textarea
                    rows={6}
                    className="editor-textarea"
                    value={targetJobDesc}
                    onChange={(e) => setTargetJobDesc(e.target.value)}
                    placeholder="Paste job requirements and qualifications from Greenhouse, Lever, Workday, or LinkedIn..."
                  />
                </div>
                <Button
                  variant="primary"
                  type="submit"
                  icon={Sparkles}
                  disabled={jobOptLoading}
                  style={{ marginTop: '10px' }}
                >
                  {jobOptLoading ? 'Analyzing Job Alignment...' : 'Analyze Alignment & Generate Suggestions'}
                </Button>
              </form>

              {/* Optimization Results */}
              {jobOptResult && (
                <div className="job-opt-results-box animate-fade-in">
                  <div className="opt-score-row">
                    <div className="score-stat-chip">
                      <span className="stat-label">Estimated Match</span>
                      <span className="stat-number">{jobOptResult.jobMatchScore}%</span>
                    </div>
                    <div className="score-stat-chip">
                      <span className="stat-label">Keyword Coverage</span>
                      <span className="stat-number">{jobOptResult.keywordCoverage}%</span>
                    </div>
                  </div>

                  {/* Role Specific Summary */}
                  <div className="tailored-summary-card">
                    <div className="tailored-summary-header">
                      <strong>Role-Specific Summary (Verified Facts Only):</strong>
                      <Button variant="outline" size="sm" onClick={handleApplyTailoredSummary}>
                        Apply to Resume
                      </Button>
                    </div>
                    <p className="tailored-summary-p">{jobOptResult.roleSpecificSummary}</p>
                  </div>

                  {/* Matching Skills vs Missing Keywords */}
                  <div className="skills-gap-grid">
                    <div className="skills-col matched">
                      <strong>Relevant Existing Skills ({jobOptResult.relevantExistingSkills?.length || 0}):</strong>
                      <div className="tags-row">
                        {jobOptResult.relevantExistingSkills?.map((s, idx) => (
                          <span key={idx} className="skill-chip matched">{s}</span>
                        ))}
                      </div>
                    </div>

                    <div className="skills-col missing">
                      <div className="missing-header">
                        <strong>Keywords to Highlight ({jobOptResult.highPriorityKeywordsToHighlight?.length || 0}):</strong>
                        {jobOptResult.highPriorityKeywordsToHighlight?.length > 0 && (
                          <button
                            type="button"
                            className="add-keywords-btn"
                            onClick={() => handleAddSuggestedKeywords(jobOptResult.highPriorityKeywordsToHighlight)}
                          >
                            + Add All to Skills
                          </button>
                        )}
                      </div>
                      <div className="tags-row">
                        {jobOptResult.highPriorityKeywordsToHighlight?.map((s, idx) => (
                          <span key={idx} className="skill-chip missing">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Version History Modal */}
      {showVersionModal && (
        <div className="builder-modal-backdrop" onClick={() => setShowVersionModal(false)}>
          <div className="builder-modal-card animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top-header">
              <div className="modal-title-with-badge">
                <Clock size={18} className="text-violet" />
                <h3>Version History & Snapshots</h3>
              </div>
              <button
                type="button"
                className="modal-close-icon-btn"
                onClick={() => setShowVersionModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-content-scroll">
              <form onSubmit={handleSaveVersionSnapshot} className="new-snapshot-form">
                <input
                  type="text"
                  className="styling-select"
                  value={newVersionName}
                  onChange={(e) => setNewVersionName(e.target.value)}
                  placeholder="Snapshot name (e.g. Google Staff Engineer v2.1)..."
                />
                <Button variant="primary" size="sm" type="submit" disabled={savingVersion}>
                  {savingVersion ? 'Saving...' : 'Save Current Snapshot'}
                </Button>
              </form>

              <div className="version-snapshots-list">
                {versionList.length === 0 ? (
                  <p className="empty-text">No snapshots saved yet. Save one above to create a milestone!</p>
                ) : (
                  versionList.map((ver) => (
                    <div key={ver.id} className="version-item-row">
                      <div className="version-info">
                        <strong>{ver.versionName}</strong>
                        <span className="version-time">{new Date(ver.createdAt).toLocaleString()}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestoreVersion(ver.id, ver.versionName)}
                      >
                        Restore
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="builder-modal-backdrop" onClick={() => setShowImportModal(false)}>
          <div className="builder-modal-card animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top-header">
              <div className="modal-title-with-badge">
                <RotateCcw size={18} className="text-violet" />
                <h3>Import Content from Uploaded Resume</h3>
              </div>
              <button
                type="button"
                className="modal-close-icon-btn"
                onClick={() => setShowImportModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-content-scroll">
              <p className="modal-explainer">
                Select an uploaded PDF or DOCX resume. The builder will automatically parse your authentic contact info, career achievements, skills, and education into this resume.
              </p>

              {resumes.length === 0 ? (
                <div className="empty-import-box">
                  <p>You have not uploaded any resumes yet.</p>
                  <Button variant="primary" size="sm" onClick={() => (window.location.href = '/dashboard/upload')}>
                    Upload a Resume First
                  </Button>
                </div>
              ) : (
                <div className="import-resume-list">
                  {resumes.map((r) => (
                    <div
                      key={r.id}
                      className={`import-resume-card ${selectedImportId === r.id ? 'selected' : ''}`}
                      onClick={() => setSelectedImportId(r.id)}
                    >
                      <FileText size={20} className="text-violet" />
                      <div className="import-card-meta">
                        <strong>{r.title || r.fileName}</strong>
                        <span>Role: {r.targetRole || 'Software Engineer'} • {new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}

                  <div className="import-actions">
                    <Button
                      variant="primary"
                      size="md"
                      disabled={!selectedImportId}
                      onClick={() => handleImportResume(selectedImportId)}
                    >
                      Import Selected Resume
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AIResumeBuilder;
