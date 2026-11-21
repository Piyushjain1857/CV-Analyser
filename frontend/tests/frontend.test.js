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
    assert.ok(content.includes('#8b5cf6') || content.includes('#6D28D9'), 'Theme must include purple accents');
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
});
