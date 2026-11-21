import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Sparkles,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import HealthBadge from '../components/common/HealthBadge';
import './LoginPage.css';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { addToast } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Destination after login
  const from = location.state?.from?.pathname || '/dashboard';

  const handleDemoFill = () => {
    setEmail('alex.morgan@cvinsight.ai');
    setPassword('Password123!');
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setSubmitting(true);
    try {
      const user = await login(email, password);
      addToast(`Welcome back, ${user.name}!`, 'success', 'Session restored via secure cookie');
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page-root">
      {/* Ambient background glow */}
      <div className="auth-ambient-glow" />

      {/* Top mini header */}
      <header className="auth-top-nav">
        <Link to="/" className="auth-brand">
          <div className="auth-brand-icon">
            <Sparkles size={18} />
          </div>
          <span className="auth-brand-name">CV Insight <span className="brand-ai">AI</span></span>
        </Link>
        <HealthBadge showDetails={false} />
      </header>

      {/* Auth Card Container */}
      <main className="auth-card-container">
        <div className="auth-card">
          <div className="auth-card-header">
            <Badge variant="purple" size="sm" icon={ShieldCheck}>
              SECURE ATS PORTAL
            </Badge>
            <h1 className="auth-card-title">Sign in to CV Insight</h1>
            <p className="auth-card-subtitle">
              Access your personalized ATS resume audits, keyword gap reports, and job calibrations.
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="auth-error-banner animate-fade-in">
              <AlertCircle size={18} className="error-icon" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Quick Demo Autofill Pill */}
          <div className="demo-credentials-banner">
            <div className="demo-banner-text">
              <span className="demo-label">Demo Credentials:</span>
              <span className="demo-val">alex.morgan@cvinsight.ai</span>
            </div>
            <button
              type="button"
              className="demo-fill-btn"
              onClick={handleDemoFill}
            >
              Fill Demo User
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-form-group">
              <label className="auth-label" htmlFor="email">Work or Personal Email</label>
              <div className="auth-input-wrapper">
                <Mail size={16} className="auth-input-icon" />
                <input
                  id="email"
                  type="email"
                  className="auth-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="auth-form-group">
              <div className="auth-label-row">
                <label className="auth-label" htmlFor="password">Password</label>
                <span className="auth-hint">Min 6 characters</span>
              </div>
              <div className="auth-input-wrapper">
                <Lock size={16} className="auth-input-icon" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="auth-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="auth-toggle-pwd"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={submitting}
              icon={ArrowRight}
              iconPosition="right"
              className="auth-submit-btn"
            >
              {submitting ? 'Verifying Session...' : 'Sign In to Dashboard'}
            </Button>
          </form>

          <div className="auth-card-footer">
            <p className="auth-switch-text">
              Don't have an account yet?{' '}
              <Link to="/signup" className="auth-switch-link">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default LoginPage;
