import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Sparkles,
  Send,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  History,
  ShieldAlert,
  ArrowRight,
  Code,
  Users,
  FileText,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Card, { CardHeader, CardBody } from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import ScoreGauge from '../components/common/ScoreGauge';
import ProgressBar from '../components/common/ProgressBar';
import './InterviewPrepPage.css';

export function InterviewPrepPage() {
  const { user } = useAuth();
  const { resumes, activeAnalysis, addToast } = useApp();

  const [selectedResumeId, setSelectedResumeId] = useState(resumes[0]?.id || '');
  const [targetRole, setTargetRole] = useState(
    activeAnalysis?.resume?.targetRole || user?.role || 'Staff Full-Stack Engineer'
  );

  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [activeTypeFilter, setActiveTypeFilter] = useState('all');
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const [userAnswer, setUserAnswer] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);

  const [historyList, setHistoryList] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Initialize resume selection
  useEffect(() => {
    if (!selectedResumeId && resumes.length > 0) {
      setSelectedResumeId(resumes[0].id);
    }
  }, [resumes, selectedResumeId]);

  // Fetch questions on mount or role change
  useEffect(() => {
    fetchQuestions();
    fetchHistory();
  }, [selectedResumeId, targetRole]);

  const fetchQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const res = await api.getInterviewQuestions({
        targetRole,
        resumeId: selectedResumeId || undefined,
      });
      if (res.success && res.data) {
        setQuestions(res.data);
        if (res.data.length > 0) {
          setSelectedQuestion(res.data[0]);
          setUserAnswer('');
          setEvaluationResult(null);
        }
      }
    } catch (err) {
      console.warn('Failed to load interview questions:', err.message);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await api.getInterviewHistory();
      if (res.success && res.data) {
        setHistoryList(res.data);
      }
    } catch (err) {
      console.warn('Failed to load interview history:', err.message);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSelectQuestion = (q) => {
    setSelectedQuestion(q);
    setUserAnswer('');
    setEvaluationResult(null);
  };

  const handleEvaluate = async (e) => {
    e.preventDefault();
    if (!selectedQuestion) return;
    if (!userAnswer || userAnswer.trim().length < 15) {
      addToast('Please provide a complete answer with at least 15 characters', 'error');
      return;
    }

    setEvaluating(true);
    try {
      const res = await api.evaluateInterviewAnswer({
        question: selectedQuestion.question,
        questionType: selectedQuestion.questionType,
        userAnswer: userAnswer.trim(),
        targetRole,
        resumeId: selectedResumeId || undefined,
        contextClue: selectedQuestion.contextClue,
      });

      if (res.success && res.data) {
        setEvaluationResult(res.data);
        addToast('Evaluation complete with STAR feedback!', 'success');
        fetchHistory(); // Refresh history
      }
    } catch (err) {
      console.error('Answer evaluation failed:', err);
      addToast('Evaluation failed', 'error', err.message);
    } finally {
      setEvaluating(false);
    }
  };

  const filteredQuestions =
    activeTypeFilter === 'all'
      ? questions
      : questions.filter((q) => q.questionType === activeTypeFilter);

  const wordCount = userAnswer.trim() ? userAnswer.trim().split(/\s+/).length : 0;

  return (
    <div className="interview-prep-page-root animate-fade-in">
      {/* Top Banner */}
      <div className="interview-top-bar">
        <div>
          <div className="interview-badge-cluster">
            <Badge variant="purple" size="sm" icon={HelpCircle}>
              GEMINI INTERVIEW SIMULATOR
            </Badge>
            <span className="interview-tagline">AI-Calibrated STAR Assessment</span>
          </div>
          <h1 className="interview-page-title">Technical & Behavioral Interview Practice</h1>
          <p className="interview-page-sub">
            Practice realistic technical, behavioral, and resume-specific questions for <strong>{targetRole}</strong>.
            Receive instant, constructive feedback evaluated against the STAR framework.
          </p>
        </div>

        {/* Role & Resume Filters */}
        <div className="interview-header-controls">
          {resumes.length > 0 && (
            <select
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
              className="interview-role-select"
            >
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  Resume: {r.title || r.candidateName}
                </option>
              ))}
            </select>
          )}

          <Button
            variant="outline"
            size="sm"
            icon={RotateCcw}
            loading={loadingQuestions}
            onClick={fetchQuestions}
          >
            Regenerate Questions
          </Button>
        </div>
      </div>

      {/* Main Grid: Left Question Picker + Right Practice Canvas */}
      <div className="interview-main-grid">
        {/* Left Column: Questions List */}
        <div className="interview-questions-col">
          <Card className="questions-card">
            <CardHeader>
              <div className="q-filter-pills">
                {[
                  { key: 'all', label: 'All Questions' },
                  { key: 'technical', label: 'Technical', icon: Code },
                  { key: 'behavioral', label: 'Behavioral', icon: Users },
                  { key: 'resume-specific', label: 'Resume', icon: FileText },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    className={`q-tab-pill ${activeTypeFilter === tab.key ? 'active' : ''}`}
                    onClick={() => setActiveTypeFilter(tab.key)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardBody>
              <div className="questions-scroll-list">
                {loadingQuestions ? (
                  <div className="q-loading-box">
                    <span className="btn-spinner" />
                    <span>Curating customized questions for {targetRole}...</span>
                  </div>
                ) : filteredQuestions.length === 0 ? (
                  <p className="empty-text">No questions found for this filter.</p>
                ) : (
                  filteredQuestions.map((q, idx) => {
                    const isSelected = selectedQuestion?.id === q.id;
                    const typeBadgeVariant =
                      q.questionType === 'technical'
                        ? 'blue'
                        : q.questionType === 'behavioral'
                        ? 'purple'
                        : 'green';

                    return (
                      <div
                        key={q.id || idx}
                        className={`question-item-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleSelectQuestion(q)}
                      >
                        <div className="q-item-top">
                          <Badge variant={typeBadgeVariant} size="sm">
                            {q.questionType.toUpperCase()}
                          </Badge>
                          <span className="q-index">Q{idx + 1}</span>
                        </div>
                        <p className="q-text-snippet">{q.question}</p>
                      </div>
                    );
                  })
                )}
              </div>
            </CardBody>
          </Card>

          {/* Past History Teaser */}
          <Card className="history-summary-card">
            <CardHeader>
              <div className="history-card-header">
                <History size={16} className="text-violet" />
                <h4>Recent Practice History ({historyList.length})</h4>
              </div>
            </CardHeader>
            <CardBody>
              {historyList.length === 0 ? (
                <p className="empty-history-text">No practice evaluations yet. Answer a question above to record your first score!</p>
              ) : (
                <div className="history-items-mini">
                  {historyList.slice(0, 4).map((h) => (
                    <div key={h.id} className="history-mini-row">
                      <div className="history-mini-info">
                        <span className="h-type">{h.questionType}</span>
                        <strong className="h-q">{h.question?.substring(0, 50)}...</strong>
                      </div>
                      <span className={`h-score ${h.overallScore >= 80 ? 'high' : 'med'}`}>
                        {h.overallScore}/100
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Right Column: Active Question Workspace & Evaluation */}
        <div className="interview-workspace-col">
          {selectedQuestion ? (
            <div className="workspace-stack">
              {/* Question Banner */}
              <Card className="active-question-card" glow>
                <div className="active-q-header">
                  <Badge
                    variant={
                      selectedQuestion.questionType === 'technical'
                        ? 'blue'
                        : selectedQuestion.questionType === 'behavioral'
                        ? 'purple'
                        : 'green'
                    }
                  >
                    {selectedQuestion.questionType.toUpperCase()} INTERVIEW QUESTION
                  </Badge>
                  <span className="q-role-label">Target Role: {targetRole}</span>
                </div>

                <h2 className="active-question-heading">{selectedQuestion.question}</h2>

                {selectedQuestion.contextClue && (
                  <div className="q-context-clue-box">
                    <Lightbulb size={16} className="text-amber" />
                    <div>
                      <strong>What the Interviewer is Evaluating:</strong>
                      <p>{selectedQuestion.contextClue}</p>
                    </div>
                  </div>
                )}
              </Card>

              {/* Answer Composition Box */}
              <Card className="answer-box-card">
                <form onSubmit={handleEvaluate}>
                  <div className="answer-header-meta">
                    <label>Your Response (Type naturally as you would speak in an interview):</label>
                    <span className="word-count-badge">{wordCount} words</span>
                  </div>

                  <textarea
                    rows={7}
                    className="interview-answer-textarea"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Structure your answer using STAR: Describe the Situation and specific Task, detail your personal Actions, and conclude with the measurable Result..."
                  />

                  <div className="answer-actions-bar">
                    <span className="tip-text">
                      Tip: Aim for 80-150 words with at least one quantified outcome.
                    </span>
                    <Button
                      variant="primary"
                      type="submit"
                      icon={Send}
                      loading={evaluating}
                      disabled={evaluating || !userAnswer.trim()}
                    >
                      {evaluating ? 'Analyzing with Gemini...' : 'Evaluate Answer with Gemini'}
                    </Button>
                  </div>
                </form>
              </Card>

              {/* AI Evaluation Scorecard */}
              {evaluationResult && (
                <div className="evaluation-results-box animate-fade-in">
                  <Card className="eval-hero-card">
                    <div className="eval-hero-grid">
                      <div className="eval-gauge">
                        <ScoreGauge
                          score={evaluationResult.overallScore || 80}
                          size={120}
                          label="Overall Score"
                        />
                      </div>

                      <div className="eval-metrics-col">
                        <div className="metric-row">
                          <span className="m-label">Relevance to Question:</span>
                          <span className="m-val">{evaluationResult.relevanceScore}%</span>
                        </div>
                        <ProgressBar
                          value={evaluationResult.relevanceScore || 75}
                          color="purple"
                          height={8}
                        />

                        <div className="metric-row">
                          <span className="m-label">Clarity & Structural Narrative:</span>
                          <span className="m-val">{evaluationResult.clarityScore}%</span>
                        </div>
                        <ProgressBar
                          value={evaluationResult.clarityScore || 72}
                          color="cyan"
                          height={8}
                        />

                        <div className="metric-row">
                          <span className="m-label">Completeness & Depth:</span>
                          <span className="m-val">{evaluationResult.completenessScore}%</span>
                        </div>
                        <ProgressBar
                          value={evaluationResult.completenessScore || 70}
                          color="emerald"
                          height={8}
                        />
                      </div>
                    </div>
                  </Card>

                  {/* STAR Breakdown */}
                  {evaluationResult.starEvaluation && (
                    <Card className="star-breakdown-card">
                      <CardHeader title="STAR Methodology Assessment" subtitle="Situation • Task • Action • Result breakdown" />
                      <CardBody>
                        <div className="star-quad-grid">
                          <div className="star-box">
                            <span className="star-letter">S</span>
                            <strong>Situation:</strong>
                            <p>{evaluationResult.starEvaluation.situation}</p>
                          </div>
                          <div className="star-box">
                            <span className="star-letter">T</span>
                            <strong>Task:</strong>
                            <p>{evaluationResult.starEvaluation.task}</p>
                          </div>
                          <div className="star-box">
                            <span className="star-letter">A</span>
                            <strong>Action:</strong>
                            <p>{evaluationResult.starEvaluation.action}</p>
                          </div>
                          <div className="star-box">
                            <span className="star-letter">R</span>
                            <strong>Result:</strong>
                            <p>{evaluationResult.starEvaluation.result}</p>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  )}

                  {/* Feedback & Concrete Improvement */}
                  <Card className="feedback-card">
                    <div className="feedback-section">
                      <div className="sec-title">
                        <CheckCircle2 size={16} className="text-emerald" />
                        <h4>Constructive AI Feedback</h4>
                      </div>
                      <p className="sec-body">{evaluationResult.feedback}</p>
                    </div>

                    {evaluationResult.suggestedImprovement && (
                      <div className="improvement-section">
                        <div className="sec-title">
                          <Sparkles size={16} className="text-violet" />
                          <h4>Refined Example Response (Higher Impact)</h4>
                        </div>
                        <div className="improved-speech-bubble">
                          <p>{evaluationResult.suggestedImprovement}</p>
                        </div>
                      </div>
                    )}
                  </Card>

                  {/* Non-Hiring Disclaimer */}
                  <div className="evaluation-disclaimer-box">
                    <ShieldAlert size={14} className="text-muted" />
                    <span>
                      {evaluationResult.disclaimer ||
                        'AI-generated interview guidance for preparation purposes only; not a hiring decision or employment guarantee.'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Card className="empty-workspace-card">
              <p>Select an interview question from the left panel to begin your practice session.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default InterviewPrepPage;
