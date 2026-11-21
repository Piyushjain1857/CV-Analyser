import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { generatePdfReport } from '../src/services/pdfReportService.js';

describe('PDF Generation & Report Export Suite', () => {
  const mockAnalysis = {
    id: 'test-analysis-1234-5678',
    overallScore: 88,
    atsScore: 92,
    keywordScore: 85,
    formatScore: 94,
    skillScore: 86,
    summary: 'Strong candidate with deep full-stack and cloud competencies.',
    strengths: ['Exceptional system design', 'Clear metrics and quantifiable impact'],
    weaknesses: ['Missing mentions of Helm charts'],
    missingKeywords: ['Helm', 'Terraform'],
    recommendations: ['Add CI/CD pipeline deployment frequencies'],
    createdAt: new Date().toISOString(),
    resume: {
      title: 'Alex Morgan Staff Resume',
      candidateName: 'Alex Morgan',
      targetRole: 'Staff Full-Stack Engineer',
      fileName: 'alex_morgan_cv.pdf',
    },
    rawAnalysisJson: JSON.stringify({
      jobMatchScore: 86,
      bulletPointRewrites: [
        {
          original: 'Responsible for backend APIs.',
          improved: 'Architected high-throughput microservices using Node.js and PostgreSQL, reducing latency by [quantify %].',
          rationale: 'Active voice with Google XYZ outcome framing.',
          impactBoost: '+30% Recruiter Engagement',
        },
      ],
      recommendedLearningTopics: [
        {
          topic: 'Kubernetes Container Orchestration',
          category: 'Cloud Infrastructure',
          importance: 'High',
          estimatedStudyHours: '12-16 hrs',
          reason: 'Standard requirement for Staff cloud roles.',
        },
      ],
    }),
  };

  test('1. Should generate a valid streaming PDFDocument', async () => {
    const doc = generatePdfReport(mockAnalysis);
    assert.ok(doc, 'PDF Document stream should be initialized');

    // Collect buffer
    const buffer = await new Promise((resolve, reject) => {
      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      doc.end();
    });

    assert.ok(buffer.length > 2000, `PDF size (${buffer.length} bytes) should be greater than 2KB`);
    const header = buffer.subarray(0, 5).toString('ascii');
    assert.equal(header, '%PDF-', 'PDF must begin with valid %PDF- magic byte signature');
  });
});
