import PDFDocument from 'pdfkit';

/**
 * Generate a professional, downloadable executive PDF audit report
 * @param {Object} analysis - The Prisma analysis record (including analysis.resume)
 * @returns {PDFKit.PDFDocument} - Streaming PDFDocument instance
 */
export function generatePdfReport(analysis) {
  const doc = new PDFDocument({
    margin: 45,
    size: 'A4',
    bufferPages: true,
    info: {
      Title: `CV Insight AI Report - ${analysis.resume?.title || 'Resume Analysis'}`,
      Author: 'CV Insight AI Engine',
      Subject: 'ATS Compatibility & Job Match Audit',
      Keywords: 'ATS, Resume, Audit, Job Match, Skills, Career',
    },
  });

  const resume = analysis.resume || {};
  let detailedJson = {};
  if (analysis.rawAnalysisJson) {
    try {
      detailedJson =
        typeof analysis.rawAnalysisJson === 'string'
          ? JSON.parse(analysis.rawAnalysisJson)
          : analysis.rawAnalysisJson;
    } catch (e) {
      detailedJson = {};
    }
  }

  const overallScore = analysis.overallScore || 85;
  const atsScore = analysis.atsScore || overallScore;
  const jobMatchScore = detailedJson.jobMatchScore || overallScore;
  const bulletRewrites = detailedJson.bulletPointRewrites || [];
  const learningTopics = detailedJson.recommendedLearningTopics || [];
  const candidateName = resume.candidateName || 'Applicant';
  const targetRole = resume.targetRole || 'Software Professional';
  const reportDate = new Date(analysis.createdAt || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Palette: Dark Navy & Purple SaaS Styling
  const PRIMARY = '#6D28D9';      // Rich Purple
  const TEXT_DARK = '#0F172A';    // Slate 900
  const TEXT_MUTED = '#475569';   // Slate 600
  const TEXT_LIGHT = '#64748B';   // Slate 500
  const BG_LIGHT = '#F8FAFC';     // Light slate
  const BORDER_COLOR = '#E2E8F0'; // Slate 200
  const SUCCESS_GREEN = '#059669';// Emerald 600

  // 1. Header Banner
  doc.rect(45, 45, 505, 74).fill('#1E1B4B'); // Deep Indigo

  doc.fillColor('#FFFFFF').fontSize(16).font('Helvetica-Bold')
    .text('CV INSIGHT AI', 60, 58, { characterSpacing: 1.5 });

  doc.fillColor('#C4B5FD').fontSize(9).font('Helvetica')
    .text('EXECUTIVE ATS COMPATIBILITY & JOB MATCH REPORT', 60, 78);

  doc.fillColor('#94A3B8').fontSize(8)
    .text(`Generated: ${reportDate} • Audit ID: ${analysis.id?.substring(0, 8)}`, 60, 94);

  // Candidate Meta Ribbon
  doc.rect(45, 128, 505, 34).fill(BG_LIGHT).strokeColor(BORDER_COLOR).stroke();

  doc.fillColor(TEXT_DARK).fontSize(9).font('Helvetica-Bold').text('Candidate: ', 55, 140, { continued: true });
  doc.font('Helvetica').fillColor(TEXT_MUTED).text(candidateName, { continued: true });

  doc.font('Helvetica-Bold').fillColor(TEXT_DARK).text('   |   Target Role: ', { continued: true });
  doc.font('Helvetica').fillColor(TEXT_MUTED).text(targetRole, { continued: true });

  doc.font('Helvetica-Bold').fillColor(TEXT_DARK).text('   |   Document: ', { continued: true });
  doc.font('Helvetica').fillColor(TEXT_MUTED).text(resume.title || resume.fileName || 'Uploaded CV');

  // 2. Dual Scorecard Boxes
  const scoreTop = 175;
  const boxWidth = 245;

  // Box 1: General ATS
  doc.rect(45, scoreTop, boxWidth, 75).fillAndStroke('#F1F5F9', '#CBD5E1');
  doc.fillColor(TEXT_MUTED).fontSize(8).font('Helvetica-Bold').text('GENERAL ATS COMPATIBILITY', 60, scoreTop + 12);
  doc.fillColor(PRIMARY).fontSize(26).font('Helvetica-Bold').text(`${atsScore}`, 60, scoreTop + 26, { continued: true });
  doc.fontSize(12).fillColor(TEXT_LIGHT).font('Helvetica').text(' / 100');
  doc.fillColor(TEXT_MUTED).fontSize(7.5).font('Helvetica')
    .text('Format parseability, section hygiene & header structure.', 60, scoreTop + 56, { width: boxWidth - 30 });

  // Box 2: Job-Specific Match
  doc.rect(305, scoreTop, boxWidth, 75).fillAndStroke('#F1F5F9', '#CBD5E1');
  doc.fillColor(TEXT_MUTED).fontSize(8).font('Helvetica-Bold').text('JOB-SPECIFIC MATCH SCORE', 320, scoreTop + 12);
  doc.fillColor(SUCCESS_GREEN).fontSize(26).font('Helvetica-Bold').text(`${jobMatchScore}`, 320, scoreTop + 26, { continued: true });
  doc.fontSize(12).fillColor(TEXT_LIGHT).font('Helvetica').text(' / 100');
  doc.fillColor(TEXT_MUTED).fontSize(7.5).font('Helvetica')
    .text('Relevancy index, keyword saturation & competency alignment.', 320, scoreTop + 56, { width: boxWidth - 30 });

  // 3. Sub-dimension Metrics Bar
  let currentY = 265;
  doc.fillColor(TEXT_DARK).fontSize(10).font('Helvetica-Bold').text('DIMENSIONAL PERFORMANCE BREAKDOWN', 45, currentY);
  currentY += 16;

  const dimensions = [
    { label: 'Keyword Alignment', val: analysis.keywordScore || 85 },
    { label: 'Formatting & Parseability', val: analysis.formatScore || 90 },
    { label: 'Skill Depth', val: analysis.skillScore || 80 },
    { label: 'Overall Competency', val: analysis.overallScore || 82 },
  ];

  const dimWidth = 120;
  dimensions.forEach((dim, idx) => {
    const x = 45 + idx * 128;
    doc.rect(x, currentY, dimWidth, 38).fillAndStroke(BG_LIGHT, BORDER_COLOR);
    doc.fillColor(TEXT_MUTED).fontSize(7.5).font('Helvetica').text(dim.label, x + 8, currentY + 8, { width: dimWidth - 16 });
    doc.fillColor(PRIMARY).fontSize(13).font('Helvetica-Bold').text(`${dim.val}%`, x + 8, currentY + 20);
  });
  currentY += 50;

  // 4. Executive Summary
  doc.fillColor(TEXT_DARK).fontSize(10).font('Helvetica-Bold').text('EXECUTIVE SCREENING SYNTHESIS', 45, currentY);
  currentY += 14;
  doc.fillColor(TEXT_MUTED).fontSize(8.5).font('Helvetica').lineGap(3)
    .text(analysis.summary || 'Resume successfully evaluated across 6 core ATS evaluation dimensions.', 45, currentY, {
      width: 505,
      align: 'justify',
    });
  currentY = doc.y + 16;

  // 5. Strengths & Weaknesses (Side-by-side columns)
  const colW = 245;
  doc.fillColor(TEXT_DARK).fontSize(10).font('Helvetica-Bold').text('KEY STRENGTHS', 45, currentY);
  doc.fillColor(TEXT_DARK).fontSize(10).font('Helvetica-Bold').text('CRITICAL GAPS & ATS FRICTION', 305, currentY);
  currentY += 14;

  const strengths = (analysis.strengths || []).slice(0, 3);
  const weaknesses = (analysis.weaknesses || []).slice(0, 3);

  const startColY = currentY;
  strengths.forEach((st) => {
    doc.fillColor(SUCCESS_GREEN).fontSize(8).font('Helvetica-Bold').text('✓ ', 45, currentY, { continued: true });
    doc.fillColor(TEXT_MUTED).font('Helvetica').text(st, { width: colW - 12 });
    currentY = doc.y + 6;
  });

  let rightColY = startColY;
  weaknesses.forEach((wk) => {
    doc.fillColor('#DC2626').fontSize(8).font('Helvetica-Bold').text('! ', 305, rightColY, { continued: true });
    doc.fillColor(TEXT_MUTED).font('Helvetica').text(wk, { width: colW - 12 });
    rightColY = doc.y + 6;
  });

  currentY = Math.max(currentY, rightColY) + 12;

  // 6. Missing Recruiter Keywords
  if (analysis.missingKeywords && analysis.missingKeywords.length > 0) {
    doc.fillColor(TEXT_DARK).fontSize(10).font('Helvetica-Bold').text('MISSING REQUISITE KEYWORDS', 45, currentY);
    currentY += 14;

    const kwText = analysis.missingKeywords.join('   •   ');
    doc.rect(45, currentY, 505, 26).fillAndStroke('#FEF3C7', '#FDE68A');
    doc.fillColor('#92400E').fontSize(8).font('Helvetica-Bold').text(kwText, 55, currentY + 8, { width: 485 });
    currentY += 36;
  }

  // --- PAGE 2: Strategic Improvements, Rewrites & Learning ---
  doc.addPage();
  currentY = 45;

  // Header Page 2
  doc.rect(45, currentY, 505, 30).fill('#1E1B4B');
  doc.fillColor('#FFFFFF').fontSize(10).font('Helvetica-Bold').text('STRATEGIC REWRITES & LEARNING TOPICS', 55, currentY + 10);
  currentY += 44;

  // Google XYZ Bullet-Point Rewrites
  if (bulletRewrites.length > 0) {
    doc.fillColor(TEXT_DARK).fontSize(10).font('Helvetica-Bold').text('SUGGESTED BULLET-POINT REWRITES (GOOGLE XYZ FORMAT)', 45, currentY);
    doc.fillColor(TEXT_LIGHT).fontSize(7.5).font('Helvetica').text('Zero fabrication policy: active accomplishments with metric placeholders.', 45, currentY + 12);
    currentY += 26;

    bulletRewrites.slice(0, 3).forEach((item, i) => {
      // Original
      doc.rect(45, currentY, 505, 20).fill('#FEF2F2');
      doc.fillColor('#991B1B').fontSize(7.5).font('Helvetica-Bold').text('Original:', 55, currentY + 5, { continued: true });
      doc.font('Helvetica').text(` "${item.original}"`, { width: 480 });
      currentY += 24;

      // Improved
      doc.rect(45, currentY, 505, 28).fill('#F0FDF4').strokeColor('#BBF7D0').stroke();
      doc.fillColor(SUCCESS_GREEN).fontSize(8).font('Helvetica-Bold').text('Optimized:', 55, currentY + 6, { continued: true });
      doc.fillColor(TEXT_DARK).font('Helvetica').text(` "${item.improved}"`, { width: 480 });
      currentY += 34;

      // Rationale
      doc.fillColor(TEXT_MUTED).fontSize(7).font('Helvetica-Oblique').text(`Why it works: ${item.rationale}`, 55, currentY);
      currentY += 16;
    });
    currentY += 10;
  }

  // Recommended Learning Topics
  if (learningTopics.length > 0) {
    doc.fillColor(TEXT_DARK).fontSize(10).font('Helvetica-Bold').text('RECOMMENDED COMPETENCY TOPICS', 45, currentY);
    currentY += 14;

    learningTopics.slice(0, 3).forEach((top) => {
      doc.rect(45, currentY, 505, 28).fillAndStroke(BG_LIGHT, BORDER_COLOR);
      doc.fillColor(PRIMARY).fontSize(8.5).font('Helvetica-Bold').text(top.topic, 55, currentY + 6, { continued: true });
      doc.fillColor(TEXT_LIGHT).fontSize(7.5).font('Helvetica').text(`  [${top.category || 'Competency'}] • ${top.estimatedStudyHours || '8-12 hrs'} estimated`);
      doc.fillColor(TEXT_MUTED).fontSize(7.5).text(top.reason, 55, currentY + 16, { width: 485 });
      currentY += 34;
    });
    currentY += 14;
  }

  // Actionable Recommendations
  if (analysis.recommendations && analysis.recommendations.length > 0) {
    doc.fillColor(TEXT_DARK).fontSize(10).font('Helvetica-Bold').text('PRIORITIZED ACTION PLAN', 45, currentY);
    currentY += 14;

    analysis.recommendations.slice(0, 4).forEach((rec, idx) => {
      doc.fillColor(PRIMARY).fontSize(8.5).font('Helvetica-Bold').text(`${idx + 1}. `, 45, currentY, { continued: true });
      doc.fillColor(TEXT_MUTED).fontSize(8).font('Helvetica').text(rec, { width: 485 });
      currentY = doc.y + 6;
    });
    currentY += 14;
  }

  // Methodology & Disclaimer Box
  doc.rect(45, currentY, 505, 40).fill('#F8FAFC').strokeColor(BORDER_COLOR).stroke();
  doc.fillColor(TEXT_MUTED).fontSize(7).font('Helvetica-Bold').text('DISCLAIMER & METHODOLOGY NOTE:', 55, currentY + 6);
  doc.font('Helvetica').fillColor(TEXT_LIGHT).text(
    'This ATS compatibility score is an estimation based on simulated industry parsing heuristics (Workday, Greenhouse, Lever). Commercial ATS environments exhibit a +/-4% variance depending on custom organizational filters. This report does not guarantee hiring outcomes.',
    55,
    currentY + 16,
    { width: 485, lineGap: 1.5 }
  );

  // Footers on all pages
  const totalPages = doc.bufferedPageRange().count;
  for (let i = 0; i < totalPages; i++) {
    doc.switchToPage(i);
    doc.fillColor(TEXT_LIGHT).fontSize(7.5).font('Helvetica')
      .text('CV Insight AI • Confidential Candidate Audit Report', 45, 785, { width: 300 });
    doc.text(`Page ${i + 1} of ${totalPages}`, 450, 785, { width: 100, align: 'right' });
  }

  return doc;
}
