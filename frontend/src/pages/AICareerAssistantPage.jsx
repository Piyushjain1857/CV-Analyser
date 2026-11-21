import React from 'react';
import {
  Cpu,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  Zap,
  Target,
  FileText,
  Lightbulb,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import AICareerChatbot from '../components/common/AICareerChatbot';
import Badge from '../components/common/Badge';
import Card, { CardHeader, CardBody } from '../components/common/Card';
import './AICareerAssistantPage.css';

export function AICareerAssistantPage() {
  const { user } = useAuth();
  const { activeAnalysis, resumes } = useApp();

  const candidateName = activeAnalysis?.resume?.candidateName || user?.name || 'Applicant';
  const targetRole = activeAnalysis?.resume?.targetRole || user?.role || 'Awaiting resume upload';
  const atsScore = activeAnalysis?.overallScore || null;
  const skills = activeAnalysis?.skillsAndKeywords?.technicalSkills || [];

  return (
    <div className="career-assistant-page-root animate-fade-in">
      {/* Top Header */}
      <div className="assistant-header-row">
        <div>
          <div className="assistant-badge-group">
            <Badge variant="purple" size="sm" icon={Cpu}>
              GEMINI AI INTELLIGENCE
            </Badge>
            <span className="assistant-tagline">Candidate-Grounded Advisory</span>
          </div>
          <h1 className="assistant-page-title">AI Career & Strategy Assistant</h1>
          <p className="assistant-page-desc">
            Directly converse with Google Gemini grounded in your active resume data. Inquire about Google XYZ bullet transformations, STAR behavioral responses, and executive pitch strategies.
          </p>
        </div>
      </div>

      {/* Main Grid: Context Sidebar + Full Chatbot */}
      <div className="assistant-main-grid">
        {/* Left: Grounding Context Panel */}
        <div className="assistant-context-col">
          <Card className="context-card">
            <CardHeader>
              <div className="context-card-title">
                <FileText size={16} className="text-violet" />
                <h3>Active Resume Grounding</h3>
              </div>
            </CardHeader>
            <CardBody>
              <div className="context-body">
                <div className="context-meta-row">
                  <span className="meta-label">Candidate:</span>
                  <span className="meta-val">{candidateName}</span>
                </div>
                <div className="context-meta-row">
                  <span className="meta-label">Target Seniority:</span>
                  <span className="meta-val">{targetRole}</span>
                </div>
                <div className="context-meta-row">
                  <span className="meta-label">Calibrated ATS Score:</span>
                  <span className={`meta-val ${atsScore ? 'score-high' : 'text-muted'}`}>
                    {atsScore ? `${atsScore}/100` : '--'}
                  </span>
                </div>

                <div className="context-divider" />

                <div className="context-skills-wrap">
                  <span className="context-section-label">Verified Extracted Skills:</span>
                  <div className="context-skills-tags">
                    {skills.length > 0 ? (
                      skills.slice(0, 10).map((skill, idx) => (
                        <span key={idx} className="c-skill-tag">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-muted" style={{ fontSize: '0.75rem', fontStyle: 'italic' }}>
                        Scan a resume to extract verified skills
                      </span>
                    )}
                  </div>
                </div>

                <div className="context-divider" />

                <div className="grounding-note-box">
                  <ShieldCheck size={14} className="text-emerald" />
                  <p>
                    Conversations are strictly bound to your resume records. The AI will never invent facts or extrapolate beyond your validated achievements.
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right: Inline Interactive Chatbot */}
        <div className="assistant-chat-col">
          <AICareerChatbot
            resumeId={activeAnalysis?.resume?.id || activeAnalysis?.resumeId || (resumes[0]?.id ?? 'all')}
            inline={true}
            initialOpen={true}
          />
        </div>
      </div>
    </div>
  );
}

export default AICareerAssistantPage;
