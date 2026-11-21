import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  BookOpen,
  Target,
  ExternalLink,
  ChevronRight,
  Award,
  Layers,
  Circle,
  RotateCcw,
  Plus,
  HelpCircle,
  FolderGit2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Card, { CardHeader, CardBody } from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import ProgressBar from '../components/common/ProgressBar';
import './CareerRoadmapPage.css';

export function CareerRoadmapPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeAnalysis, addToast } = useApp();

  const [roadmapId, setRoadmapId] = useState(null);
  const [targetRole, setTargetRole] = useState(
    activeAnalysis?.resume?.targetRole || user?.role || 'Staff Full-Stack Engineer'
  );
  const [roadmapTitle, setRoadmapTitle] = useState('30-60-90 Day Career Acceleration Roadmap');
  const [loading, setLoading] = useState(true);
  const [savingTask, setSavingTask] = useState(false);

  // 3-Phase Structured Learning Plans
  const [plan30Day, setPlan30Day] = useState([]);
  const [plan60Day, setPlan60Day] = useState([]);
  const [plan90Day, setPlan90Day] = useState([]);
  const [overallProgress, setOverallProgress] = useState(0);

  // Custom Regeneration Dialog State
  const [showGenModal, setShowGenModal] = useState(false);
  const [customRole, setCustomRole] = useState(targetRole);
  const [customGaps, setCustomGaps] = useState('Kafka Event Streaming, PostgreSQL Query Partitioning, System Design');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchActiveRoadmap();
  }, []);

  const fetchActiveRoadmap = async () => {
    setLoading(true);
    try {
      const res = await api.getRoadmap();
      if (res.success && res.data) {
        populateRoadmapData(res.data);
      }
    } catch (err) {
      console.warn('Failed to load roadmap:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const populateRoadmapData = (data) => {
    setRoadmapId(data.id);
    setTargetRole(data.targetRole || 'Staff Full-Stack Engineer');
    setRoadmapTitle(data.title || '30-60-90 Day Career Acceleration Roadmap');
    setPlan30Day(Array.isArray(data.plan30Day) ? data.plan30Day : []);
    setPlan60Day(Array.isArray(data.plan60Day) ? data.plan60Day : []);
    setPlan90Day(Array.isArray(data.plan90Day) ? data.plan90Day : []);
    setOverallProgress(typeof data.overallProgress === 'number' ? data.overallProgress : 0);
  };

  // Toggle task completion and persist directly to PostgreSQL
  const handleToggleTask = async (taskId, currentCompleted) => {
    if (!roadmapId) return;

    const newCompleted = !currentCompleted;

    // Optimistic UI update
    const updateList = (list) =>
      list.map((t) => (t.id === taskId ? { ...t, completed: newCompleted } : t));

    const next30 = updateList(plan30Day);
    const next60 = updateList(plan60Day);
    const next90 = updateList(plan90Day);

    const all = [...next30, ...next60, ...next90];
    const doneCount = all.filter((t) => t.completed).length;
    const newProgress = all.length > 0 ? Math.round((doneCount / all.length) * 100) : 0;

    setPlan30Day(next30);
    setPlan60Day(next60);
    setPlan90Day(next90);
    setOverallProgress(newProgress);

    try {
      setSavingTask(true);
      const res = await api.toggleRoadmapTask(roadmapId, {
        taskId,
        completed: newCompleted,
      });

      if (res.success && res.data) {
        setOverallProgress(res.data.overallProgress);
        addToast(
          newCompleted ? 'Milestone marked complete!' : 'Milestone marked pending',
          'info'
        );
      }
    } catch (err) {
      console.error('Failed to persist task:', err);
      addToast('Failed to sync milestone', 'error', err.message);
      fetchActiveRoadmap(); // Rollback on error
    } finally {
      setSavingTask(false);
    }
  };

  // Generate tailored 30-60-90 roadmap with Gemini
  const handleGenerateRoadmap = async (e) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const gapsList = customGaps.split(',').map((s) => s.trim()).filter(Boolean);
      const res = await api.generateRoadmap({
        targetRole: customRole,
        skillGaps: gapsList,
        resumeId: activeAnalysis?.resume?.id || activeAnalysis?.resumeId || undefined,
      });

      if (res.success && res.data) {
        populateRoadmapData(res.data);
        setShowGenModal(false);
        addToast('Generated new personalized 30-60-90 day roadmap!', 'success');
      }
    } catch (err) {
      console.error('Roadmap generation failed:', err);
      addToast('Roadmap generation failed', 'error', err.message);
    } finally {
      setGenerating(false);
    }
  };

  const allTasks = [...plan30Day, ...plan60Day, ...plan90Day];
  const completedTasks = allTasks.filter((t) => t.completed).length;
  const totalTasks = allTasks.length;

  const phases = [
    {
      phase: 1,
      name: 'Phase 1: 30-Day Foundation & ATS Quick Wins',
      badge: '30-Day Plan',
      variant: 'emerald',
      tasks: plan30Day,
    },
    {
      phase: 2,
      name: 'Phase 2: 60-Day Technical Depth & Microservices',
      badge: '60-Day Plan',
      variant: 'cyan',
      tasks: plan60Day,
    },
    {
      phase: 3,
      name: 'Phase 3: 90-Day System Design & Interview Mastery',
      badge: '90-Day Plan',
      variant: 'purple',
      tasks: plan90Day,
    },
  ];

  return (
    <div className="career-roadmap-page-root animate-fade-in">
      {/* Top Header */}
      <div className="roadmap-header-row">
        <div>
          <div className="roadmap-badge-group">
            <Badge variant="purple" size="sm" icon={Compass}>
              30-60-90 DAY STRATEGY
            </Badge>
            <span className="roadmap-tagline">Persistent PostgreSQL Progress</span>
          </div>
          <h1 className="roadmap-page-title">{roadmapTitle}</h1>
          <p className="roadmap-page-desc">
            A structured, 3-phase strategic roadmap calibrated for <strong>{targetRole}</strong>.
            Track your weekly objectives, real-world projects, and verifiable milestones.
          </p>
        </div>

        <div className="roadmap-header-actions-col">
          <div className="roadmap-overall-progress">
            <div className="progress-meta">
              <span className="progress-label">Overall Completion</span>
              <span className="progress-num">
                {completedTasks} / {totalTasks} ({overallProgress}%)
              </span>
            </div>
            <ProgressBar value={overallProgress} color="purple" height={10} />
          </div>

          <Button
            variant="outline"
            size="sm"
            icon={Sparkles}
            onClick={() => setShowGenModal(true)}
          >
            Regenerate Roadmap
          </Button>
        </div>
      </div>

      {/* 3 Phases Detailed Timeline */}
      <div className="phases-timeline-list">
        {phases.map((phase) => {
          const phaseTasks = phase.tasks;
          const phaseCompleted = phaseTasks.filter((t) => t.completed).length;
          const phasePercent = phaseTasks.length > 0 ? Math.round((phaseCompleted / phaseTasks.length) * 100) : 0;

          return (
            <div key={phase.phase} className="phase-card">
              <div className="phase-card-header">
                <div className="phase-title-left">
                  <div className={`phase-num-box ${phase.variant}`}>{phase.phase}</div>
                  <div>
                    <div className="phase-meta-line">
                      <span className="phase-tag">{phase.badge}</span>
                    </div>
                    <h3 className="phase-name">{phase.name}</h3>
                  </div>
                </div>

                <div className="phase-progress-pill">
                  <span>
                    {phaseCompleted}/{phaseTasks.length} Complete ({phasePercent}%)
                  </span>
                </div>
              </div>

              <div className="phase-tasks-list">
                {phaseTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`task-row ${task.completed ? 'done' : ''}`}
                    onClick={() => handleToggleTask(task.id, task.completed)}
                  >
                    <button
                      type="button"
                      className="task-checkbox"
                      aria-label={`Mark task ${task.title}`}
                    >
                      {task.completed ? (
                        <CheckCircle2 size={20} className="text-emerald" />
                      ) : (
                        <Circle size={20} className="text-muted" />
                      )}
                    </button>

                    <div className="task-content-details">
                      <div className="task-header-line">
                        <span className="task-week-badge">{task.week}</span>
                        <strong className="task-title-text">{task.title}</strong>
                      </div>

                      {task.objective && (
                        <p className="task-objective-text">
                          <strong>Objective:</strong> {task.objective}
                        </p>
                      )}

                      {task.project && (
                        <div className="task-project-chip">
                          <FolderGit2 size={13} className="text-violet" />
                          <span>
                            <strong>Practical Project:</strong> {task.project}
                          </span>
                        </div>
                      )}

                      {task.milestone && (
                        <div className="task-milestone-chip">
                          <Award size={13} className="text-amber" />
                          <span>
                            <strong>Milestone:</strong> {task.milestone}
                          </span>
                        </div>
                      )}

                      {task.topics?.length > 0 && (
                        <div className="task-topics-row">
                          {task.topics.map((t, idx) => (
                            <span key={idx} className="topic-pill">{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Regeneration Modal */}
      {showGenModal && (
        <div className="roadmap-modal-backdrop" onClick={() => setShowGenModal(false)}>
          <div className="roadmap-modal-card animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-with-badge">
                <Sparkles size={18} className="text-violet" />
                <h3>Generate Tailored 30-60-90 Day Roadmap</h3>
              </div>
            </div>

            <form onSubmit={handleGenerateRoadmap} className="modal-form">
              <div className="form-field">
                <label>Target Role Title</label>
                <input
                  type="text"
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  placeholder="e.g. Staff Distributed Systems Engineer"
                  required
                />
              </div>

              <div className="form-field">
                <label>Priority Technical Gaps to Target (Comma-separated)</label>
                <textarea
                  rows={3}
                  value={customGaps}
                  onChange={(e) => setCustomGaps(e.target.value)}
                  placeholder="e.g. Apache Kafka, PostgreSQL Partitioning, System Design"
                  required
                />
              </div>

              <div className="modal-actions">
                <Button variant="ghost" size="sm" onClick={() => setShowGenModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" loading={generating}>
                  {generating ? 'Architecting Plan...' : 'Generate Roadmap'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bottom Bridge CTA */}
      <div className="roadmap-bottom-cta">
        <Card className="cta-card">
          <div className="cta-flex">
            <div>
              <h3>Ready to practice interviews for {targetRole}?</h3>
              <p>Practice technical and STAR behavioral questions evaluated by Gemini Bar Raiser.</p>
            </div>
            <Button
              variant="primary"
              size="md"
              icon={ArrowRight}
              iconPosition="right"
              onClick={() => navigate('/dashboard/interview')}
            >
              Start Interview Prep
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default CareerRoadmapPage;
