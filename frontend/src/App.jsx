import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import ResumeUpload from './pages/ResumeUpload';
import AnalysisResults from './pages/AnalysisResults';
import ComparisonPage from './pages/ComparisonPage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';
import AIResumeBuilder from './pages/AIResumeBuilder';
import JobMatchPage from './pages/JobMatchPage';
import AICareerAssistantPage from './pages/AICareerAssistantPage';
import CareerRoadmapPage from './pages/CareerRoadmapPage';
import InterviewPrepPage from './pages/InterviewPrepPage';
import CareerAnalyticsPage from './pages/CareerAnalyticsPage';
import NotFoundPage from './pages/NotFoundPage';
import { ProtectedRoute, PublicOnlyRoute } from './components/common/ProtectedRoute';
import './App.css';

export function App() {
  return (
    <Routes>
      {/* Public Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Public-only Auth Routes */}
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicOnlyRoute>
            <SignupPage />
          </PublicOnlyRoute>
        }
      />

      {/* Protected Dashboard Routes (Guarded with HTTP-only cookie JWT) */}
      <Route path="/dashboard" element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="upload" element={<ResumeUpload />} />
          <Route path="builder" element={<AIResumeBuilder />} />
          <Route path="job-match" element={<JobMatchPage />} />
          <Route path="assistant" element={<AICareerAssistantPage />} />
          <Route path="roadmap" element={<CareerRoadmapPage />} />
          <Route path="interview" element={<InterviewPrepPage />} />
          <Route path="analytics" element={<CareerAnalyticsPage />} />
          <Route path="results" element={<AnalysisResults />} />
          <Route path="results/:id" element={<AnalysisResults />} />
          <Route path="compare" element={<ComparisonPage />} />
          <Route path="compare/:id1/:id2" element={<ComparisonPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* 404 Route */}
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
