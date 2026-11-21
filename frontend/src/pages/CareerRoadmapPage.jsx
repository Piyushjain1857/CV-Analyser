import React, { useState } from 'react';
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
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import Card, { CardHeader, CardBody } from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import ProgressBar from '../components/common/ProgressBar';
import './CareerRoadmapPage.css';

export function CareerRoadmapPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeAnalysis, addToast } = useApp();

  const targetRole = activeAnalysis?.resume?.targetRole || user?.role || 'Staff Full-Stack Engineer';
  const learningTopics = activeAnalysis?.recommendedLearningTopics || [
    'Distributed Consensus (Raft, Paxos)',
    'Advanced PostgreSQL Concurrency & MVCC Tuning',
    'Event-Driven Architectures with Apache Kafka',
    'Core Web Vitals (LCP, INP, CLS) Deep Optimization',
  ];

  // Interactive Checklist State
  const [roadmapPhases, setRoadmapPhases] = useState([
    {
      phase: 1,
      name: 'Phase 1: ATS Hygiene & Google XYZ Baseline',
      weeks: 'Weeks 1 – 4',
      badge: 'Foundation',
      tasks: [
        { id: 'p1-1', title: 'Audit resume against Workday and Greenhouse parsers', done: true },
        { id: 'p1-2', title: 'Rewrite all bullet points to Google XYZ formula: Accomplished [X], measured by [Y], by doing [Z]', done: true },
        { id: 'p1-3', title: 'Categorize skills into Languages, Frameworks, and Cloud Infrastructure', done: false },
        { id: 'p1-4', title: 'Run Job Match simulation against 3 target job descriptions', done: false },
      ],
    },
    {
      phase: 2,
      name: 'Phase 2: Technical Depth & Portfolio Proof Points',
      weeks: 'Weeks 5 – 8',
      badge: 'Expansion',
      tasks: [
        { id: 'p2-1', title: 'Build a production-grade distributed microservice repo with PostgreSQL', done: false },
        { id: 'p2-2', title: 'Publish technical blog post detailing database partitioning and query optimization', done: false },
        { id: 'p2-3', title: 'Attain AWS Certified Solutions Architect or equivalent domain certification', done: false },
        { id: 'p2-4', title: 'Re-scan resume on CV Insight AI to confirm 90+ ATS Index score', done: false },
      ],
    },
    {
      phase: 3,
      name: 'Phase 3: Senior Interview Mastery & Targeted Outreach',
      weeks: 'Weeks 9 – 12',
      badge: 'Mastery',
      tasks: [
        { id: 'p3-1', title: 'Master 10 behavioral STAR framework stories (Situation, Task, Action, Result)', done: false },
        { id: 'p3-2', title: 'Conduct 5 mock system design architectural reviews', done: false },
        { id: 'p3-3', title: 'Execute warm outreach to 15 Engineering Directors and Hiring Managers', done: false },
        { id: 'p3-4', title: 'Negotiate senior compensation package backed by quantified market data', done: false },
      ],
    },
  ]);

  const toggleTask = (phaseIdx, taskId) => {
    setRoadmapPhases((prev) => {
      return prev.map((p, idx) => {
        if (idx !== phaseIdx) return p;
        return {
          ...p,
          tasks: p.tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)),
        };
      });
    });
    addToast('Roadmap milestone updated', 'info');
  };

  const totalTasks = roadmapPhases.reduce((acc, p) => acc + p.tasks.length, 0);
  const completedTasks = roadmapPhases.reduce(
    (acc, p) => acc + p.tasks.filter((t) => t.done).length,
    0
  );
  const progressPercent = Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="career-roadmap-page-root animate-fade-in">
      {/* Top Header */}
      <div className="roadmap-header-row">
        <div>
          <div className="roadmap-badge-group">
            <Badge variant="purple" size="sm" icon={Compass}>
              STRATEGIC PROGRESSION
            </Badge>
            <span className="roadmap-tagline">12-Week Senior Career Roadmap</span>
          </div>
          <h1 className="roadmap-page-title">Career Milestones & Mastery</h1>
          <p className="roadmap-page-desc">
            A structured, 3-phase strategic roadmap calibrated for <strong>{targetRole}</strong>. 
            Track your progress from initial ATS keyword injection to executive system design interviews.
          </p>
        </div>

        <div className="roadmap-overall-progress">
          <div className="progress-meta">
            <span className="progress-label">Overall Completion</span>
            <span className="progress-num">{completedTasks} / {totalTasks} ({progressPercent}%)</span>
          </div>
          <ProgressBar value={progressPercent} color="purple" height={10} />
        </div>
      </div>

      {/* Recommended Topics Grid */}
      <Card className="topics-banner-card">
        <div className="topics-banner-header">
          <BookOpen size={18} className="text-violet" />
          <h3>Recommended Strategic Learning Focus Areas</h3>
        </div>
        <div className="topics-tags-wrap">
          {learningTopics.map((topic, idx) => (
            <div key={idx} className="topic-card-item">
              <Sparkles size={13} className="text-violet" />
              <span>{topic}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* 3 Phases Detailed Timeline */}
      <div className="phases-timeline-list">
        {roadmapPhases.map((phase, pIdx) => {
          const phaseCompleted = phase.tasks.filter((t) => t.done).length;
          const phasePercent = Math.round((phaseCompleted / phase.tasks.length) * 100);

          return (
            <div key={phase.phase} className="phase-card">
              <div className="phase-card-header">
                <div className="phase-title-left">
                  <div className="phase-num-box">{phase.phase}</div>
                  <div>
                    <div className="phase-meta-line">
                      <span className="phase-weeks">{phase.weeks}</span>
                      <span className="phase-tag">{phase.badge}</span>
                    </div>
                    <h3 className="phase-name">{phase.name}</h3>
                  </div>
                </div>

                <div className="phase-progress-pill">
                  <span>{phaseCompleted}/{phase.tasks.length} Complete</span>
                </div>
              </div>

              <div className="phase-tasks-list">
                {phase.tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`task-row ${task.done ? 'done' : ''}`}
                    onClick={() => toggleTask(pIdx, task.id)}
                  >
                    <button
                      type="button"
                      className="task-checkbox"
                      aria-label={`Mark task ${task.title}`}
                    >
                      {task.done ? (
                        <CheckCircle2 size={18} className="text-emerald" />
                      ) : (
                        <Circle size={18} className="text-muted" />
                      )}
                    </button>
                    <span className="task-text">{task.title}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Bridge CTA */}
      <div className="roadmap-bottom-cta">
        <Card className="cta-card">
          <div className="cta-flex">
            <div>
              <h3>Ready to update your resume achievements?</h3>
              <p>Jump directly into the AI Resume Builder to format and export your latest milestones.</p>
            </div>
            <Button
              variant="primary"
              size="md"
              icon={ArrowRight}
              iconPosition="right"
              onClick={() => navigate('/dashboard/builder')}
            >
              Open AI Resume Builder
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default CareerRoadmapPage;
