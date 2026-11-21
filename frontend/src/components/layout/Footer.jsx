import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import './Footer.css';

export function Footer() {
  return (
    <footer className="footer-root">
      <div className="footer-container">
        <div className="footer-top-grid">
          {/* Brand Info */}
          <div className="footer-brand-col">
            <div className="footer-brand">
              <div className="footer-brand-icon">
                <Sparkles size={18} />
              </div>
              <span className="footer-brand-title">CV Insight <span className="brand-ai">AI</span></span>
            </div>
            <p className="footer-desc">
              AI-driven resume audit engine built with React, Vite, Node.js, Express, and PostgreSQL with Prisma. Supercharge ATS compliance, extract recruiter keywords, and unlock more high-tier interviews.
            </p>
            <div className="footer-tech-stack-pills">
              <span className="tech-pill">React 18</span>
              <span className="tech-pill">Node.js</span>
              <span className="tech-pill">Express</span>
              <span className="tech-pill">PostgreSQL</span>
              <span className="tech-pill">Prisma</span>
              <span className="tech-pill">Pure CSS</span>
            </div>
          </div>

          {/* Links Column 1 */}
          <div className="footer-links-col">
            <h4 className="footer-heading">Platform</h4>
            <Link to="/dashboard" className="footer-link">Dashboard Overview</Link>
            <Link to="/dashboard/upload" className="footer-link">Resume Upload & Scan</Link>
            <Link to="/dashboard/results" className="footer-link">ATS Analysis Results</Link>
            <Link to="/dashboard/history" className="footer-link">Audit History</Link>
          </div>

          {/* Links Column 2 */}
          <div className="footer-links-col">
            <h4 className="footer-heading">ATS Features</h4>
            <a href="#features" className="footer-link">Workday & Greenhouse Scoring</a>
            <a href="#features" className="footer-link">Semantic Keyword Matching</a>
            <a href="#features" className="footer-link">Action Verb Potency</a>
            <a href="#features" className="footer-link">Gap Remediation Plan</a>
          </div>

          {/* System status */}
          <div className="footer-links-col">
            <h4 className="footer-heading">System Core</h4>
            <div className="system-health-status-box">
              <div className="system-status-indicator">
                <span className="sys-dot" />
                <span>API & Database: Active</span>
              </div>
              <p className="sys-sub">PostgreSQL 16 connection verified via Prisma query telemetry.</p>
            </div>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <p className="copyright-text">
            © {new Date().getFullYear()} CV Insight AI. Complete full-stack architecture running React + Express + PostgreSQL.
          </p>
          <div className="footer-bottom-links">
            <span className="footer-version-tag">v1.0.0 Stable</span>
            <span className="footer-separator">•</span>
            <span className="footer-status-pill">Enterprise Ready</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
