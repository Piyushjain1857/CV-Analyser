import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  User,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  Briefcase,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import HealthBadge from '../components/common/HealthBadge';
import './SignupPage.css';

export function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { addToast } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Staff Full-Stack Engineer',
    industry: 'Cloud Infrastructure & SaaS',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Password strength calculator
  const getPasswordStrength = (pass) => {
    let score = 0;
    if (pass.length >= 6) score += 25;
    if (pass.length >= 10) score += 25;
    if (/[0-9]/.test(pass)) score += 25;
    if (/[^A-Za-z0-9]/.test(pass)) score += 25;
    return score;
  };

  const pwdStrength = getPasswordStrength(formData.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (formData.name.trim().length < 2) {
      setErrorMessage('Full name must be at least 2 characters long.');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify both fields.');
      return;
    }

    setSubmitting(true);
    try {
      const user = await signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        industry: formData.industry,
      });

      addToast(`Account created! Welcome ${user.name}`, 'success');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page-root">
      <div className="auth-ambient-glow" />

      <header className="auth-top-nav">
        <Link to="/" className="auth-brand">
          <div className="auth-brand-icon">
            <Sparkles size={18} />
          </div>
          <span className="auth-brand-name">CV Insight <span className="brand-ai">AI</span></span>
        </Link>
        <HealthBadge showDetails={false} />
      </header>

      <main className="auth-card-container">
        <div className="auth-card signup-card">
          <div className="auth-card-header">
            <Badge variant="purple" size="sm" icon={ShieldCheck}>
              NEW CANDIDATE REGISTRATION
            </Badge>
            <h1 className="auth-card-title">Create your Account</h1>
            <p className="auth-card-subtitle">
              Join thousands optimizing their resumes for Workday, Greenhouse, and Lever ATS systems.
            </p>
          </div>

          {errorMessage && (
            <div className="auth-error-banner animate-fade-in">
              <AlertCircle size={18} className="error-icon" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-row-2">
              <div className="auth-form-group">
                <label className="auth-label" htmlFor="name">Full Name</label>
                <div className="auth-input-wrapper">
                  <User size={16} className="auth-input-icon" />
                  <input
                    id="name"
                    type="text"
                    className="auth-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Alex Morgan"
                    required
                  />
                </div>
              </div>

              <div className="auth-form-group">
                <label className="auth-label" htmlFor="email">Email Address</label>
                <div className="auth-input-wrapper">
                  <Mail size={16} className="auth-input-icon" />
                  <input
                    id="email"
                    type="email"
                    className="auth-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="alex@company.com"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-row-2">
              <div className="auth-form-group">
                <label className="auth-label" htmlFor="role">Primary Target Role</label>
                <input
                  id="role"
                  type="text"
                  className="auth-input no-left-icon"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g. Senior Frontend Engineer"
                  required
                />
              </div>

              <div className="auth-form-group">
                <label className="auth-label" htmlFor="industry">Industry Domain</label>
                <select
                  id="industry"
                  className="auth-select"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                >
                  <option value="Cloud Infrastructure & SaaS">Cloud Infrastructure & SaaS</option>
                  <option value="Fintech & Banking">Fintech & Banking</option>
                  <option value="AI & Machine Learning">AI & Machine Learning</option>
                  <option value="Healthcare & Healthtech">Healthcare & Healthtech</option>
                  <option value="E-Commerce & Consumer">E-Commerce & Consumer</option>
                </select>
              </div>
            </div>

            <div className="form-row-2">
              <div className="auth-form-group">
                <label className="auth-label" htmlFor="password">Password</label>
                <div className="auth-input-wrapper">
                  <Lock size={16} className="auth-input-icon" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className="auth-input"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Min 6 characters"
                    required
                  />
                </div>
              </div>

              <div className="auth-form-group">
                <label className="auth-label" htmlFor="confirmPassword">Confirm Password</label>
                <div className="auth-input-wrapper">
                  <Lock size={16} className="auth-input-icon" />
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    className="auth-input"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Confirm password"
                    required
                  />
                  <button
                    type="button"
                    className="auth-toggle-pwd"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Password strength meter */}
            {formData.password && (
              <div className="pwd-strength-container">
                <div className="pwd-strength-bar">
                  <div
                    className={`pwd-strength-fill ${
                      pwdStrength <= 25 ? 'weak' : pwdStrength <= 75 ? 'medium' : 'strong'
                    }`}
                    style={{ width: `${pwdStrength}%` }}
                  />
                </div>
                <span className="pwd-strength-label">
                  Strength: {pwdStrength <= 25 ? 'Weak' : pwdStrength <= 75 ? 'Medium' : 'Strong'}
                </span>
              </div>
            )}

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
              {submitting ? 'Creating PostgreSQL Account...' : 'Create Account & Start Scanning'}
            </Button>
          </form>

          <div className="auth-card-footer">
            <p className="auth-switch-text">
              Already have an account?{' '}
              <Link to="/login" className="auth-switch-link">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default SignupPage;
