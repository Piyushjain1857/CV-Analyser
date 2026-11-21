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
});
