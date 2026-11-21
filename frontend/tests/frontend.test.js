import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Frontend Architecture, Components & API Contract Suite', () => {
  const srcDir = path.resolve('src');

  test('1. Core dashboard pages exist and export valid React components', () => {
    const requiredPages = [
      'LandingPage.jsx',
      'LoginPage.jsx',
      'SignupPage.jsx',
      'DashboardHome.jsx',
      'ResumeUpload.jsx',
      'AnalysisResults.jsx',
      'ComparisonPage.jsx',
      'HistoryPage.jsx',
      'ProfilePage.jsx',
      'NotFoundPage.jsx',
      'AIResumeBuilder.jsx',
      'JobMatchPage.jsx',
      'AICareerAssistantPage.jsx',
      'CareerRoadmapPage.jsx',
    ];

    requiredPages.forEach((page) => {
      const filePath = path.join(srcDir, 'pages', page);
      assert.ok(fs.existsSync(filePath), `Page file ${page} must exist`);
      const content = fs.readFileSync(filePath, 'utf-8');
      assert.ok(
        content.includes('export') || content.includes('export default'),
        `${page} must export a component`
      );
    });
  });

  test('2. API Service exports all required backend communication methods', async () => {
    const apiFile = path.join(srcDir, 'services', 'api.js');
    assert.ok(fs.existsSync(apiFile), 'api.js must exist');
    const content = fs.readFileSync(apiFile, 'utf-8');

    const expectedMethods = [
      'login',
      'signup',
      'logout',
      'getMe',
      'changePassword',
      'updatePrivacySettings',
      'exportUserData',
      'deleteAccount',
      'getHealth',
      'getResumes',
      'uploadAndAnalyzeResume',
      'deleteResume',
      'getLatestAnalysis',
      'getAnalysisById',
      'deleteAnalysis',
      'compareAnalyses',
      'rematchJobDescription',
      'getAnalysisHistory',
      'clearAnalysisHistory',
      'downloadAnalysisPdf',
      'sendChatMessage',
      'getChatHistory',
      'clearChatHistory',
    ];

    expectedMethods.forEach((method) => {
      assert.ok(content.includes(`${method}:`), `API service must include method ${method}`);
    });
  });

  test('3. Dark navy and purple SaaS design tokens are defined in index.css', () => {
    const cssFile = path.join(srcDir, 'index.css');
    assert.ok(fs.existsSync(cssFile), 'index.css must exist');
    const content = fs.readFileSync(cssFile, 'utf-8');

    assert.ok(content.includes('--bg-primary'), 'Theme must define --bg-primary');
    assert.ok(content.includes('--primary'), 'Theme must define --primary');
    assert.ok(content.includes('#8b5cf6') || content.includes('#8B5CF6'), 'Theme must include purple accents');
    assert.ok(content.includes('[data-theme="light"]'), 'Theme must define complete light theme overrides');
    assert.ok(content.includes('prefers-reduced-motion'), 'Theme must support reduced motion accessibility');
  });

  test('4. No forbidden libraries (Tailwind, Bootstrap, TypeScript) are imported', () => {
    const pkgJson = JSON.parse(fs.readFileSync(path.resolve('package.json'), 'utf-8'));
    const allDeps = {
      ...(pkgJson.dependencies || {}),
      ...(pkgJson.devDependencies || {}),
    };

    assert.equal(allDeps['tailwindcss'], undefined, 'Tailwind must NOT be installed');
    assert.equal(allDeps['bootstrap'], undefined, 'Bootstrap must NOT be installed');
    assert.equal(allDeps['typescript'], undefined, 'TypeScript must NOT be installed');
  });

  test('5. Prompt 6: AICareerChatbot component exists and handles interactive assistant state', () => {
    const chatbotFile = path.join(srcDir, 'components', 'common', 'AICareerChatbot.jsx');
    assert.ok(fs.existsSync(chatbotFile), 'AICareerChatbot.jsx component file must exist');
    const content = fs.readFileSync(chatbotFile, 'utf-8');
    assert.ok(content.includes('AICareerChatbot'), 'Must export AICareerChatbot component');
    assert.ok(content.includes('sendChatMessage'), 'Must call sendChatMessage API');
    assert.ok(content.includes('getChatHistory'), 'Must call getChatHistory API');
  });

  test('6. Prompt 6: AnalysisResults provides Accept/Reject/Edit Studio and 10-dimension tabs', () => {
    const analysisFile = path.join(srcDir, 'pages', 'AnalysisResults.jsx');
    assert.ok(fs.existsSync(analysisFile), 'AnalysisResults.jsx must exist');
    const content = fs.readFileSync(analysisFile, 'utf-8');

    // Check Prompt 6 tabs
    assert.ok(content.includes('Improvement Studio'), 'Must have Resume Improvement Studio tab');
    assert.ok(content.includes('Skill Gap & Roadmap'), 'Must have Skill Gap & Roadmap tab');
    assert.ok(content.includes('Interview Prep Q&A'), 'Must have Interview Prep Q&A tab');
    assert.ok(content.includes('AI Career Assistant'), 'Must have AI Career Assistant tab');

    // Check Accept / Reject / Edit interactive actions
    assert.ok(content.includes('handleAcceptBullet'), 'Must provide handleAcceptBullet handler');
    assert.ok(content.includes('handleRejectBullet'), 'Must provide handleRejectBullet handler');
    assert.ok(content.includes('handleStartEditBullet'), 'Must provide handleStartEditBullet handler');
    assert.ok(content.includes('handleExportAccepted'), 'Must provide export accepted handler');

    // Check Executive Summaries and STAR framework
    assert.ok(content.includes('summaryAlternatives'), 'Must render summaryAlternatives');
    assert.ok(content.includes('starFrameworkGuidance'), 'Must render starFrameworkGuidance');
  });

  test('7. Prompt 8: AI Resume Builder provides split-screen editor, templates and export actions', () => {
    const builderFile = path.join(srcDir, 'pages', 'AIResumeBuilder.jsx');
    assert.ok(fs.existsSync(builderFile), 'AIResumeBuilder.jsx must exist');
    const content = fs.readFileSync(builderFile, 'utf-8');

    assert.ok(content.includes('handlePrint'), 'Must provide print/PDF export');
    assert.ok(content.includes('handleCopyText'), 'Must provide copy text action');
    assert.ok(content.includes('applyXyzTransform'), 'Must support Google XYZ transform');
    assert.ok(content.includes('template-modern') || content.includes("'modern'"), 'Must support Modern Tech template');
    assert.ok(content.includes("'executive'"), 'Must support Executive template');
    assert.ok(content.includes("'minimalist'"), 'Must support Minimalist template');
  });

  test('8. Prompt 8: Sidebar navigation provides all 8 core SaaS application items', () => {
    const sidebarFile = path.join(srcDir, 'components', 'layout', 'Sidebar.jsx');
    assert.ok(fs.existsSync(sidebarFile), 'Sidebar.jsx must exist');
    const content = fs.readFileSync(sidebarFile, 'utf-8');

    assert.ok(content.includes('/dashboard'), 'Must route to Dashboard');
    assert.ok(content.includes('/dashboard/upload'), 'Must route to Analyze Resume');
    assert.ok(content.includes('/dashboard/builder'), 'Must route to AI Resume Builder');
    assert.ok(content.includes('/dashboard/job-match'), 'Must route to Job Match');
    assert.ok(content.includes('/dashboard/assistant'), 'Must route to AI Career Assistant');
    assert.ok(content.includes('/dashboard/roadmap'), 'Must route to Career Roadmap');
    assert.ok(content.includes('/dashboard/history'), 'Must route to History');
    assert.ok(content.includes('/dashboard/profile'), 'Must route to Settings');
  });

  test('9. Prompt 8: Landing Page provides authentic capabilities, FAQ accordion and privacy controls', () => {
    const landingFile = path.join(srcDir, 'pages', 'LandingPage.jsx');
    assert.ok(fs.existsSync(landingFile), 'LandingPage.jsx must exist');
    const content = fs.readFileSync(landingFile, 'utf-8');

    assert.ok(content.includes('faqs'), 'Must render interactive FAQs');
    assert.ok(content.includes('privacy'), 'Must include Privacy & Security section');
    assert.ok(!content.includes('14,200+'), 'Must not display fabricated statistics');
  });
});
