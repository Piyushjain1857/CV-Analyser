import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History,
  Search,
  Filter,
  FileText,
  Trash2,
  ArrowUpRight,
  Sparkles,
  Calendar,
  Layers,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  ArrowUpDown,
  GitCompare,
  X,
  Target,
  ShieldCheck,
  Download,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import api from '../services/api';
import Card, { CardHeader, CardBody } from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import './HistoryPage.css';

export function HistoryPage() {
  const navigate = useNavigate();
  const { resumes, loadingResumes, fetchResumes, setActiveAnalysis, addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterScore, setFilterScore] = useState('all'); // 'all' | 'high' | 'mid' | 'low'
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'score_desc' | 'score_asc'
  const [deletingId, setDeletingId] = useState(null);
  const [selectedForCompare, setSelectedForCompare] = useState([]); // array of analysis IDs

  // Filter and sort resumes
  const processedResumes = useMemo(() => {
    let result = resumes.filter((r) => {
      const matchesSearch =
        (r.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.targetRole || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.candidateName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.fileName || '').toLowerCase().includes(searchQuery.toLowerCase());

      const analysis = r.analyses?.[0] || r.analysisResults?.[0];
      const score = analysis?.overallScore || analysis?.atsScore || 80;

      let matchesScore = true;
      if (filterScore === 'high') matchesScore = score >= 85;
      if (filterScore === 'mid') matchesScore = score >= 70 && score < 85;
      if (filterScore === 'low') matchesScore = score < 70;

      return matchesSearch && matchesScore;
    });

    // Sorting
    result.sort((a, b) => {
      const aAnalysis = a.analyses?.[0] || a.analysisResults?.[0] || {};
      const bAnalysis = b.analyses?.[0] || b.analysisResults?.[0] || {};

      const aScore = aAnalysis.overallScore || aAnalysis.atsScore || 0;
      const bScore = bAnalysis.overallScore || bAnalysis.atsScore || 0;

      const aDate = new Date(a.createdAt).getTime();
      const bDate = new Date(b.createdAt).getTime();

      switch (sortBy) {
        case 'oldest':
          return aDate - bDate;
        case 'score_desc':
          return bScore - aScore;
        case 'score_asc':
          return aScore - bScore;
        case 'newest':
        default:
          return bDate - aDate;
      }
    });

    return result;
  }, [resumes, searchQuery, filterScore, sortBy]);

  const handleView = (resume) => {
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

  const handleToggleCompare = (e, analysisId) => {
    e.stopPropagation();
    if (!analysisId) return;

    if (selectedForCompare.includes(analysisId)) {
      setSelectedForCompare(selectedForCompare.filter((id) => id !== analysisId));
    } else {
      if (selectedForCompare.length >= 2) {
        // Replace second item
        setSelectedForCompare([selectedForCompare[0], analysisId]);
      } else {
        setSelectedForCompare([...selectedForCompare, analysisId]);
      }
    }
  };

  const handleLaunchCompare = () => {
    if (selectedForCompare.length === 2) {
      navigate(`/dashboard/compare/${selectedForCompare[0]}/${selectedForCompare[1]}`);
    } else if (selectedForCompare.length === 1) {
      navigate(`/dashboard/compare?id1=${selectedForCompare[0]}`);
    } else {
      navigate('/dashboard/compare');
    }
  };

  const handleDownloadPdf = async (analysisId, title) => {
    try {
      addToast('Preparing PDF download...', 'info');
      const safeTitle = (title || 'CV_Insight_Report').replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 30);
      await api.downloadAnalysisPdf(analysisId, `${safeTitle}.pdf`);
      addToast('PDF downloaded', 'success');
    } catch (err) {
      addToast('PDF download failed', 'error', err.message);
    }
  };

  const handleDelete = async (e, id, title) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${title || 'this resume'}"?`)) return;

    setDeletingId(id);
    try {
      await api.deleteResume(id);
      addToast('Resume deleted', 'info', 'Record removed from PostgreSQL');
      await fetchResumes();
    } catch (err) {
      addToast('Delete failed', 'error', err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="history-page-root">
      {/* Header */}
      <div className="history-header-row">
        <div>
          <h1 className="history-page-title">Resume Audit History</h1>
          <p className="history-page-desc">
            All previously scanned documents stored in PostgreSQL. Filter, sort, view individual scorecards, or select two versions to compare differentials.
          </p>
        </div>

        <div className="history-top-actions">
          <Button
            variant="outline"
            icon={GitCompare}
            onClick={() => navigate('/dashboard/compare')}
          >
            Version Comparison
          </Button>
          <Button
            variant="primary"
            icon={UploadCloud}
            onClick={() => navigate('/dashboard/upload')}
          >
            Upload New CV
          </Button>
        </div>
      </div>

      {/* Floating Comparison Selection Bar when items selected */}
      {selectedForCompare.length > 0 && (
        <div className="comp-selection-banner animate-fade-in">
          <div className="comp-selection-info">
            <GitCompare size={18} className="text-primary" />
            <span>
              <strong>{selectedForCompare.length} of 2</strong> scans selected for differential analysis.
              {selectedForCompare.length === 1 && ' Select one more to compare.'}
            </span>
          </div>
          <div className="comp-selection-actions">
            <Button
              variant="primary"
              size="sm"
              icon={GitCompare}
              disabled={selectedForCompare.length < 2}
              onClick={handleLaunchCompare}
            >
              Compare Side-by-Side
            </Button>
            <button
              type="button"
              className="comp-clear-btn"
              onClick={() => setSelectedForCompare([])}
              title="Clear selection"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Search, Filter & Sort Controls Bar */}
      <div className="history-controls-bar">
        <div className="history-search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="history-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by candidate name, target role, or document title..."
          />
          {searchQuery && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearchQuery('')}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="history-filter-sort-group">
          {/* Filter Pills */}
          <div className="history-filter-pills">
            <button
              className={`filter-pill ${filterScore === 'all' ? 'active' : ''}`}
              onClick={() => setFilterScore('all')}
            >
              All ({resumes.length})
            </button>
            <button
              className={`filter-pill ${filterScore === 'high' ? 'active' : ''}`}
              onClick={() => setFilterScore('high')}
            >
              High (&ge;85)
            </button>
            <button
              className={`filter-pill ${filterScore === 'mid' ? 'active' : ''}`}
              onClick={() => setFilterScore('mid')}
            >
              Medium (70-84)
            </button>
            <button
              className={`filter-pill ${filterScore === 'low' ? 'active' : ''}`}
              onClick={() => setFilterScore('low')}
            >
              Needs Work (&lt;70)
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="history-sort-box">
            <ArrowUpDown size={15} className="sort-icon" />
            <select
              className="history-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort resumes by"
            >
              <option value="newest">Newest Scans First</option>
              <option value="oldest">Oldest Scans First</option>
              <option value="score_desc">Highest Overall Score</option>
              <option value="score_asc">Lowest Overall Score</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resumes Grid */}
      {loadingResumes ? (
        <div className="history-loading-box">
          <span className="btn-spinner" />
          <span>Fetching historical records from PostgreSQL...</span>
        </div>
      ) : processedResumes.length === 0 ? (
        <Card className="history-empty-card">
          <FileText size={44} className="empty-icon text-muted" />
          <h3 className="empty-title">No Audit Records Found</h3>
          <p className="empty-desc">
            {searchQuery
              ? `No resumes match your search query "${searchQuery}".`
              : 'You have not analyzed any resumes yet. Start by uploading your first document.'}
          </p>
          <Button
            variant="primary"
            icon={UploadCloud}
            onClick={() => navigate('/dashboard/upload')}
          >
            Scan a Resume
          </Button>
        </Card>
      ) : (
        <div className="history-grid">
          {processedResumes.map((resume) => {
            const analysis = resume.analyses?.[0] || resume.analysisResults?.[0] || {};
            const overallScore = analysis.overallScore || 82;
            const atsScore = analysis.atsScore || overallScore;
            const jobMatchScore = analysis.jobMatchScore || overallScore;
            const analysisId = analysis.id;
            const isSelected = selectedForCompare.includes(analysisId);

            let badgeVariant = 'green';
            if (overallScore < 60) badgeVariant = 'red';
            else if (overallScore < 80) badgeVariant = 'yellow';

            return (
              <Card
                key={resume.id}
                hover
                className={`history-resume-card ${isSelected ? 'selected-for-compare' : ''}`}
                onClick={() => handleView(resume)}
              >
                <div className="history-card-header">
                  <div className="doc-icon-box">
                    <FileText size={20} />
                  </div>

                  <div className="history-card-header-actions">
                    {analysisId && (
                      <label
                        className={`compare-select-label ${isSelected ? 'active' : ''}`}
                        onClick={(e) => handleToggleCompare(e, analysisId)}
                        title="Select for comparison"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="compare-checkbox"
                        />
                        <span>Compare</span>
                      </label>
                    )}
                    <Badge variant={badgeVariant} size="md">
                      {overallScore}/100 Match
                    </Badge>
                  </div>
                </div>

                <h3 className="resume-card-title">{resume.title || resume.fileName}</h3>

                {/* Dual Score Badges */}
                <div className="history-dual-badges">
                  <span className="mini-score-pill ats">
                    <ShieldCheck size={12} /> ATS: {atsScore}
                  </span>
                  <span className="mini-score-pill job">
                    <Target size={12} /> Job: {jobMatchScore}
                  </span>
                </div>

                <div className="resume-card-meta-list">
                  <div className="meta-item">
                    <span className="meta-label">Role:</span>
                    <span className="meta-val">{resume.targetRole || 'Software Engineer'}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Candidate:</span>
                    <span className="meta-val">{resume.candidateName || 'Applicant'}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Industry:</span>
                    <span className="meta-val">{resume.targetIndustry || 'Tech & SaaS'}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Scanned:</span>
                    <span className="meta-val">
                      {new Date(resume.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {analysis.missingKeywords && analysis.missingKeywords.length > 0 && (
                  <div className="history-card-keywords">
                    <span className="keywords-label">Gaps:</span>
                    <div className="keywords-tags">
                      {analysis.missingKeywords.slice(0, 3).map((kw, i) => (
                        <span key={i} className="mini-gap-tag">{kw}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="history-card-footer">
                  <div className="card-footer-buttons">
                    <Button
                      variant="primary"
                      size="sm"
                      icon={ArrowUpRight}
                      iconPosition="right"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleView(resume);
                      }}
                    >
                      View Report
                    </Button>
                    {analysisId && (
                      <button
                        type="button"
                        className="quick-pdf-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadPdf(analysisId, resume.title);
                        }}
                        title="Download PDF Audit Report"
                        aria-label="Download PDF"
                      >
                        <Download size={14} />
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    className="delete-record-btn"
                    onClick={(e) => handleDelete(e, resume.id, resume.title)}
                    disabled={deletingId === resume.id}
                    title="Delete record from database"
                    aria-label="Delete resume"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default HistoryPage;
