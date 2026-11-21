import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserCheck,
  Save,
  Database,
  Cpu,
  ShieldCheck,
  Sparkles,
  Server,
  Activity,
  CheckCircle2,
  Lock,
  Key,
  Calendar,
  Mail,
  User,
  Download,
  Trash2,
  AlertTriangle,
  FileText,
  Clock,
  Shield,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import api from '../services/api';
import Card, { CardHeader, CardBody } from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import HealthBadge from '../components/common/HealthBadge';
import './ProfilePage.css';

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();
  const { addToast, health, checkHealth, fetchResumes } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    industry: '',
    experienceLevel: '',
    bio: '',
    targetScore: 90,
  });

  const [privacySettings, setPrivacySettings] = useState({
    dataRetentionDays: 90,
    retainRawText: true,
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingPrivacy, setSavingPrivacy] = useState(false);
  const [exportingData, setExportingData] = useState(false);
  const [clearingHistory, setClearingHistory] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        role: user.role || 'Staff Full-Stack Engineer',
        industry: user.industry || 'Cloud Infrastructure & SaaS',
        experienceLevel: user.experienceLevel || 'Senior (6+ years)',
        bio:
          user.bio ||
          'Architecting resilient cloud-native web applications, distributed systems, and real-time developer workflows.',
        targetScore: user.targetScore || 90,
      });

      setPrivacySettings({
        dataRetentionDays: user.dataRetentionDays || 90,
        retainRawText: user.retainRawText ?? true,
      });
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await api.updateProfile(formData);
      if (res.success && res.data) {
        updateUser(res.data);
        addToast('Profile updated', 'success', 'Changes persisted in PostgreSQL database');
      }
    } catch (err) {
      addToast('Update failed', 'error', err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      addToast('Password mismatch', 'error', 'New password and confirmation do not match.');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      addToast('Password too short', 'error', 'Minimum 6 characters required.');
      return;
    }

    setSavingPassword(true);
    try {
      await api.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      addToast('Password changed', 'success', 'Your password has been securely updated.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      addToast('Password change failed', 'error', err.message);
    } finally {
      setSavingPassword(false);
    }
  };

  const handlePrivacySubmit = async (e) => {
    e.preventDefault();
    setSavingPrivacy(true);
    try {
      await api.updatePrivacySettings(privacySettings);
      updateUser({ ...user, ...privacySettings });
      addToast('Privacy settings saved', 'success', 'Retention policy and raw text storage updated.');
    } catch (err) {
      addToast('Privacy update failed', 'error', err.message);
    } finally {
      setSavingPrivacy(false);
    }
  };

  const handleExportData = async () => {
    setExportingData(true);
    try {
      await api.exportUserData();
      addToast('Archive generated', 'success', 'Full GDPR data export downloaded as JSON.');
    } catch (err) {
      addToast('Export failed', 'error', err.message);
    } finally {
      setExportingData(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear your entire audit history timeline? All previous scan timeline records will be purged.')) {
      return;
    }

    setClearingHistory(true);
    try {
      const res = await api.clearAnalysisHistory();
      addToast('History cleared', 'info', res.message || 'Audit history records wiped.');
      await fetchResumes();
    } catch (err) {
      addToast('Clear history failed', 'error', err.message);
    } finally {
      setClearingHistory(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (deleteConfirmEmail.toLowerCase().trim() !== user?.email?.toLowerCase().trim()) {
      addToast('Confirmation email mismatch', 'error', 'Please enter your exact email to confirm.');
      return;
    }

    setDeletingAccount(true);
    try {
      await api.deleteAccount(deleteConfirmEmail);
      addToast('Account deleted', 'info', 'All your data has been permanently removed.');
      await logout();
      navigate('/signup');
    } catch (err) {
      addToast('Account deletion failed', 'error', err.message);
      setDeletingAccount(false);
    }
  };

  return (
    <div className="profile-page-root">
      {/* Header */}
      <div className="profile-header-row">
        <div>
          <h1 className="profile-page-title">Candidate Profile & Settings</h1>
          <p className="profile-page-desc">
            Manage your career targets, ATS baseline parameters, credential security, and data privacy controls.
          </p>
        </div>

        <HealthBadge showDetails={false} />
      </div>

      <div className="profile-grid">
        {/* Left Column: Forms */}
        <div className="profile-col-form">
          {/* Card 1: Career & ATS Baseline */}
          <Card className="profile-card">
            <CardHeader
              title="Career & ATS Baseline Target"
              subtitle="Personalize your default evaluation parameters for new scans"
            />
            <CardBody>
              <form onSubmit={handleProfileSubmit} className="profile-form">
                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="profName">Full Name</label>
                    <input
                      id="profName"
                      type="text"
                      className="form-input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="profEmail">Registered Email</label>
                    <input
                      id="profEmail"
                      type="email"
                      className="form-input disabled-input"
                      value={user?.email || ''}
                      disabled
                      title="Email is your primary login identifier"
                    />
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="profRole">Target Role</label>
                    <input
                      id="profRole"
                      type="text"
                      className="form-input"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="profIndustry">Industry Domain</label>
                    <select
                      id="profIndustry"
                      className="form-select"
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    >
                      <option value="Cloud Infrastructure & SaaS">Cloud Infrastructure & SaaS</option>
                      <option value="Fintech & Banking">Fintech & Banking</option>
                      <option value="AI & Machine Learning">AI & Machine Learning</option>
                      <option value="Healthcare & Healthtech">Healthcare & Healthtech</option>
                      <option value="Enterprise Security">Enterprise Security</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="profExp">Experience Level</label>
                  <select
                    id="profExp"
                    className="form-select"
                    value={formData.experienceLevel}
                    onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                  >
                    <option value="Junior (1-2 years)">Junior (1-2 years)</option>
                    <option value="Mid-Level (3-5 years)">Mid-Level (3-5 years)</option>
                    <option value="Senior (6+ years)">Senior (6+ years)</option>
                    <option value="Staff / Principal (8+ years)">Staff / Principal (8+ years)</option>
                    <option value="Engineering Director / Lead">Engineering Director / Lead</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="targetScore">
                    Target ATS Score Threshold ({formData.targetScore}/100)
                  </label>
                  <input
                    id="targetScore"
                    type="range"
                    min="70"
                    max="98"
                    className="form-range"
                    value={formData.targetScore}
                    onChange={(e) => setFormData({ ...formData, targetScore: Number(e.target.value) })}
                  />
                  <div className="range-labels">
                    <span>70 (Passing)</span>
                    <span>85 (Competitive)</span>
                    <span>95 (Top Tier)</span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="profBio">Professional Headline & Bio</label>
                  <textarea
                    id="profBio"
                    rows={3}
                    className="form-textarea"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Brief description of your specialization..."
                  />
                </div>

                <div className="form-actions">
                  <Button
                    type="submit"
                    variant="primary"
                    icon={Save}
                    loading={savingProfile}
                  >
                    {savingProfile ? 'Saving...' : 'Save Profile Changes'}
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>

          {/* Card 2: Password & Authentication Credentials */}
          <Card className="profile-card">
            <CardHeader
              title="Security & Password Update"
              subtitle="Safeguard your account with bcrypt 12-round salted hashing"
            />
            <CardBody>
              <form onSubmit={handlePasswordSubmit} className="profile-form">
                <div className="form-group">
                  <label className="form-label" htmlFor="currPass">Current Password</label>
                  <input
                    id="currPass"
                    type="password"
                    className="form-input"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    placeholder="Enter existing password"
                    required
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="newPass">New Password</label>
                    <input
                      id="newPass"
                      type="password"
                      className="form-input"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      placeholder="Min 6 characters"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="confPass">Confirm New Password</label>
                    <input
                      id="confPass"
                      type="password"
                      className="form-input"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      placeholder="Repeat new password"
                      required
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <Button
                    type="submit"
                    variant="outline"
                    icon={Key}
                    loading={savingPassword}
                  >
                    {savingPassword ? 'Updating...' : 'Update Password'}
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>

          {/* Card 3: Privacy, Data Governance & GDPR */}
          <Card className="profile-card">
            <CardHeader
              title="Privacy Controls & Data Retention"
              subtitle="Control how your resumes, extracted text, and scorecards are retained"
            />
            <CardBody>
              <form onSubmit={handlePrivacySubmit} className="profile-form">
                <div className="form-group">
                  <label className="form-label" htmlFor="retentionDays">Data Retention Window</label>
                  <select
                    id="retentionDays"
                    className="form-select"
                    value={privacySettings.dataRetentionDays}
                    onChange={(e) =>
                      setPrivacySettings({
                        ...privacySettings,
                        dataRetentionDays: Number(e.target.value),
                      })
                    }
                  >
                    <option value={30}>30 Days (Strict Auto-Purge)</option>
                    <option value={90}>90 Days (Recommended for Search Cycles)</option>
                    <option value={180}>180 Days (Extended History)</option>
                    <option value={365}>365 Days (Full Career Year)</option>
                  </select>
                  <span className="form-hint">
                    Scans older than your retention window are automatically flagged for secure background deletion.
                  </span>
                </div>

                <div className="privacy-toggle-box">
                  <label className="privacy-toggle-label">
                    <input
                      type="checkbox"
                      checked={privacySettings.retainRawText}
                      onChange={(e) =>
                        setPrivacySettings({
                          ...privacySettings,
                          retainRawText: e.target.checked,
                        })
                      }
                      className="privacy-checkbox"
                    />
                    <div className="toggle-text">
                      <span className="toggle-title">Retain Extracted Resume Content</span>
                      <span className="toggle-desc">
                        When disabled, raw parsed resume text is discarded immediately after ATS evaluation. Only your scores, rewrites, and recommendations are preserved.
                      </span>
                    </div>
                  </label>
                </div>

                <div className="privacy-actions-row">
                  <Button
                    type="submit"
                    variant="outline"
                    size="sm"
                    loading={savingPrivacy}
                  >
                    {savingPrivacy ? 'Saving...' : 'Save Privacy Policy'}
                  </Button>

                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    icon={Download}
                    loading={exportingData}
                    onClick={handleExportData}
                  >
                    Download My Data (JSON)
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>

          {/* Card 4: Danger Zone */}
          <Card className="danger-zone-card">
            <CardHeader
              title="Danger Zone"
              subtitle="Irreversible account and document deletion operations"
            />
            <CardBody>
              <div className="danger-action-row">
                <div className="danger-action-text">
                  <span className="danger-action-title">Clear Audit History</span>
                  <span className="danger-action-desc">
                    Wipes historical scan timestamps, comparison benchmarks, and rematch records. Your uploaded CV documents remain saved.
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  loading={clearingHistory}
                  onClick={handleClearHistory}
                >
                  Clear History
                </Button>
              </div>

              <div className="danger-divider" />

              <div className="danger-action-row">
                <div className="danger-action-text">
                  <span className="danger-action-title text-rose">Delete Account & Purge All Resumes</span>
                  <span className="danger-action-desc">
                    Permanently purges your account, all uploaded PDF/DOCX files, extracted tokens, and AI reports from PostgreSQL.
                  </span>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  icon={Trash2}
                  onClick={() => setShowDeleteModal(true)}
                >
                  Delete Account
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right Column: Security & Full-Stack Diagnostics */}
        <div className="profile-col-diagnostics">
          {/* Account Security Overview Card */}
          <Card className="security-card">
            <CardHeader
              title="Account Security"
              subtitle="Authentication & credential status"
            />
            <CardBody>
              <div className="diag-rows">
                <div className="diag-item">
                  <div className="diag-icon-box purple">
                    <ShieldCheck size={18} />
                  </div>
                  <div className="diag-info">
                    <span className="diag-title">Password Security</span>
                    <span className="diag-desc">Hashed using bcrypt (12 salt rounds)</span>
                    <Badge variant="green" size="sm">Active / Protected</Badge>
                  </div>
                </div>

                <div className="diag-item">
                  <div className="diag-icon-box emerald">
                    <Key size={18} />
                  </div>
                  <div className="diag-info">
                    <span className="diag-title">Session Type</span>
                    <span className="diag-desc">Secure HTTP-only JWT Cookie</span>
                    <span className="diag-meta font-mono">Expires in 7 days</span>
                  </div>
                </div>

                <div className="diag-item">
                  <div className="diag-icon-box cyan">
                    <Calendar size={18} />
                  </div>
                  <div className="diag-info">
                    <span className="diag-title">Member Since</span>
                    <span className="diag-desc">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active Member'}
                    </span>
                    <span className="diag-meta font-mono">User ID: {user?.id?.substring(0, 8)}...</span>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Full-Stack Diagnostics Card */}
          <Card className="diagnostics-card">
            <CardHeader
              title="Production Diagnostics"
              subtitle="Live architecture status and environment telemetry"
            />
            <CardBody>
              <div className="diag-rows">
                <div className="diag-item">
                  <div className="diag-icon-box indigo">
                    <Server size={18} />
                  </div>
                  <div className="diag-info">
                    <span className="diag-title">Backend API Engine</span>
                    <span className="diag-desc">Express.js on port 5001</span>
                    <Badge variant={health.status === 'operational' ? 'green' : 'red'} size="sm">
                      {health.status === 'operational' ? 'Live / 200 OK' : 'Offline'}
                    </Badge>
                  </div>
                </div>

                <div className="diag-item">
                  <div className="diag-icon-box emerald">
                    <Database size={18} />
                  </div>
                  <div className="diag-info">
                    <span className="diag-title">Database Storage</span>
                    <span className="diag-desc">PostgreSQL 16 with Prisma ORM</span>
                    <span className="diag-meta font-mono">cv_insight_db (public)</span>
                  </div>
                </div>

                <div className="diag-item">
                  <div className="diag-icon-box purple">
                    <Activity size={18} />
                  </div>
                  <div className="diag-info">
                    <span className="diag-title">Query Latency</span>
                    <span className="diag-desc">Live PostgreSQL query response</span>
                    <span className="diag-meta font-mono">
                      {health.latencyMs !== null ? `${health.latencyMs} ms` : '0 ms'}
                    </span>
                  </div>
                </div>

                <div className="diag-item">
                  <div className="diag-icon-box cyan">
                    <Shield size={18} />
                  </div>
                  <div className="diag-info">
                    <span className="diag-title">Rate Limiting Protection</span>
                    <span className="diag-desc">express-rate-limit active</span>
                    <Badge variant="cyan" size="sm">150 req/15min</Badge>
                  </div>
                </div>
              </div>

              <div className="ping-action-wrap">
                <Button
                  variant="secondary"
                  size="sm"
                  fullWidth
                  icon={Activity}
                  onClick={checkHealth}
                >
                  Ping Health API (/api/health)
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Account Deletion Confirmation Modal */}
      {showDeleteModal && (
        <div className="rubric-modal-backdrop" onClick={() => setShowDeleteModal(false)}>
          <div className="rubric-modal-card delete-account-modal" onClick={(e) => e.stopPropagation()}>
            <div className="rubric-modal-header danger-header">
              <div className="rubric-modal-title-group">
                <AlertTriangle size={20} className="text-rose" />
                <h3 className="rubric-modal-title text-rose">Confirm Permanent Account Deletion</h3>
              </div>
            </div>

            <form onSubmit={handleDeleteAccount}>
              <div className="rubric-modal-body">
                <p className="danger-modal-warning">
                  <strong>Warning:</strong> This action cannot be undone. All your uploaded resumes, extracted credentials, bullet-point rewrites, and audit history will be permanently deleted from the PostgreSQL database.
                </p>

                <div className="form-group">
                  <label className="form-label" htmlFor="deleteEmailInput">
                    To confirm, please enter your email address: <strong>{user?.email}</strong>
                  </label>
                  <input
                    id="deleteEmailInput"
                    type="email"
                    className="form-input"
                    value={deleteConfirmEmail}
                    onChange={(e) => setDeleteConfirmEmail(e.target.value)}
                    placeholder={user?.email}
                    required
                  />
                </div>
              </div>

              <div className="rubric-modal-footer">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="danger"
                  loading={deletingAccount}
                  disabled={deleteConfirmEmail.toLowerCase().trim() !== user?.email?.toLowerCase().trim()}
                >
                  {deletingAccount ? 'Purging Account...' : 'Permanently Purge My Account'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
