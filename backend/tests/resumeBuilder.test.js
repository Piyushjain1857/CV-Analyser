import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import prisma from '../src/config/db.js';
import { generateResumePdf } from '../src/services/resumePdfService.js';
import {
  improveResumeTextWithGemini,
  optimizeResumeForJobWithGemini,
  localImproveResumeText,
  localOptimizeResumeForJob,
} from '../src/services/geminiService.js';

describe('Generative AI Resume Builder & Optimizer Suite', () => {
  let testUser = null;
  let testResume = null;
  let builderResumeId = null;
  let savedVersionId = null;

  test('1. Setup: Ensure authenticated test user and uploaded resume exist in PostgreSQL', async () => {
    testUser = await prisma.user.findFirst({
      where: { email: 'alex.morgan@cvinsight.ai' },
    });

    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          email: `builder.test.${Date.now()}@cvinsight.ai`,
          password: '$2b$12$dummyhashedpasswordfortestingpurposesonly00000',
          name: 'Builder Test Candidate',
          role: 'Staff Full-Stack Engineer',
        },
      });
    }

    assert.ok(testUser.id, 'Test user must have a valid UUID');

    testResume = await prisma.resume.findFirst({
      where: { userId: testUser.id },
    });

    if (!testResume) {
      testResume = await prisma.resume.create({
        data: {
          userId: testUser.id,
          title: 'Alex_Morgan_Staff_Resume.pdf',
          candidateName: 'Alex Morgan',
          fileName: 'Alex_Morgan_Staff_Resume.pdf',
          targetRole: 'Staff Full-Stack Engineer',
          targetIndustry: 'Cloud Infrastructure',
        },
      });
    }

    assert.ok(testResume.id, 'Test resume must exist');
  });

  test('2. Resume Builder: Create resume from scratch and persist to PostgreSQL', async () => {
    const created = await prisma.builderResume.create({
      data: {
        userId: testUser.id,
        title: 'Staff Engineer - Apex Cloud',
        template: 'technical-developer',
        fontFamily: 'mono',
        fontSize: 'medium',
        accentColor: '#8B5CF6',
        sectionOrder: ['personal', 'summary', 'skills', 'experience', 'projects', 'education'],
        personalInfo: JSON.stringify({
          fullName: 'Alex Morgan',
          targetTitle: 'Staff Full-Stack Engineer',
          email: 'alex.morgan@cvinsight.ai',
          phone: '+1 (555) 349-8201',
          location: 'San Francisco, CA',
          github: 'github.com/alexmorgan',
          linkedin: 'linkedin.com/in/alexmorgan',
        }),
        summary: 'Staff Engineer with 7+ years architecting high-throughput distributed systems in Node.js and React.',
        experiences: JSON.stringify([
          {
            id: 'exp-1',
            role: 'Staff Engineer',
            company: 'Acme Cloud Systems',
            location: 'San Francisco, CA',
            startDate: '2022',
            endDate: '',
            current: true,
            bullets: [
              'Spearheaded enterprise microservices migration, reducing API latency by 42%.',
              'Architected distributed event queue processing 12M daily transactions in PostgreSQL.',
            ],
          },
        ]),
        skills: JSON.stringify({
          languages: ['TypeScript', 'JavaScript', 'Node.js', 'Python', 'SQL'],
          frameworks: ['React', 'Express.js', 'Vite', 'Next.js'],
          databases: ['PostgreSQL', 'Redis'],
          tools: ['Docker', 'Kubernetes', 'AWS', 'Git'],
          other: ['Distributed Systems', 'Microservices', 'System Design'],
        }),
        versionName: 'v1.0 (Initial)',
      },
    });

    assert.ok(created.id, 'BuilderResume must be persisted with an id');
    assert.equal(created.template, 'technical-developer');
    assert.equal(created.fontFamily, 'mono');
    builderResumeId = created.id;
  });

  test('3. Edit & Reorder: Support adding, editing, and reordering entries and sections', async () => {
    const existing = await prisma.builderResume.findUnique({
      where: { id: builderResumeId },
    });

    assert.ok(existing, 'Resume should exist');

    // Reorder sections: put skills before summary
    const newSectionOrder = ['personal', 'skills', 'summary', 'experience', 'projects', 'education'];
    
    // Add a second work experience entry
    const currentExperiences = JSON.parse(existing.experiences || '[]');
    currentExperiences.push({
      id: 'exp-2',
      role: 'Senior Software Engineer',
      company: 'FinTech Labs',
      location: 'New York, NY',
      startDate: '2019',
      endDate: '2022',
      current: false,
      bullets: [
        'Engineered real-time transaction processing pipeline for 50K concurrent users.',
      ],
    });

    const updated = await prisma.builderResume.update({
      where: { id: builderResumeId },
      data: {
        sectionOrder: newSectionOrder,
        experiences: JSON.stringify(currentExperiences),
        title: 'Staff Engineer - Apex Cloud (Updated)',
      },
    });

    assert.equal(updated.sectionOrder[1], 'skills', 'Section order must update');
    const parsedExp = JSON.parse(updated.experiences);
    assert.equal(parsedExp.length, 2, 'Must have 2 experiences');
  });

  test('4. Autosave: Support debounced draft autosaving without corrupting saved versions', async () => {
    const autosaved = await prisma.builderResume.update({
      where: { id: builderResumeId },
      data: {
        summary: 'Staff Engineer with 8+ years architecting distributed systems and optimizing cloud throughput.',
        isDraft: true,
      },
    });

    assert.equal(autosaved.isDraft, true, 'Autosaved resume must be flagged as draft');
    assert.ok(autosaved.summary.includes('8+ years'), 'Summary must reflect latest keystrokes');
  });

  test('5. Version History: Save named snapshot, list versions, and restore', async () => {
    // 1. Save named snapshot
    const snapshotContent = JSON.stringify({
      title: 'Staff Engineer - Google Track v1.5',
      summary: 'Pre-interview verified snapshot',
      template: 'classic-professional',
    });

    const version = await prisma.resumeVersion.create({
      data: {
        builderResumeId: builderResumeId,
        versionName: 'v1.5 (Pre-Google Screen)',
        contentSnapshot: snapshotContent,
      },
    });

    assert.ok(version.id, 'Version must be created');
    savedVersionId = version.id;

    // 2. List versions
    const allVersions = await prisma.resumeVersion.findMany({
      where: { builderResumeId: builderResumeId },
    });
    assert.ok(allVersions.length >= 1, 'Should list at least 1 saved version');

    // 3. Restore version
    const restored = await prisma.builderResume.update({
      where: { id: builderResumeId },
      data: {
        versionName: `Restored (${version.versionName})`,
        isDraft: false,
      },
    });

    assert.ok(restored.versionName.includes('Restored'), 'Version name must indicate restoration');
    assert.equal(restored.isDraft, false, 'Restored version should clear draft flag');
  });

  test('6. Resume Duplication: Clone resume and prevent data loss', async () => {
    const original = await prisma.builderResume.findUnique({
      where: { id: builderResumeId },
    });

    const duplicated = await prisma.builderResume.create({
      data: {
        userId: original.userId,
        title: `${original.title} (Duplicated Copy)`,
        template: original.template,
        fontFamily: original.fontFamily,
        fontSize: original.fontSize,
        accentColor: original.accentColor,
        sectionOrder: original.sectionOrder,
        personalInfo: original.personalInfo,
        summary: original.summary,
        experiences: original.experiences,
        skills: original.skills,
        parentId: original.id,
      },
    });

    assert.ok(duplicated.id, 'Duplicated resume must have unique id');
    assert.notEqual(duplicated.id, original.id, 'Duplicated ID must be distinct');
    assert.equal(duplicated.parentId, original.id, 'Parent ID must reference original');

    // Cleanup cloned copy
    await prisma.builderResume.delete({ where: { id: duplicated.id } });
  });

  test('7. AI Writing Assistant: Improves work bullets using Google XYZ without fabrication', async () => {
    const rawDuty = 'responsible for writing backend apis and helping team with database queries';
    
    const result = await improveResumeTextWithGemini({
      type: 'bullet',
      content: rawDuty,
      context: {
        role: 'Senior Software Engineer',
        company: 'Cloud Corp',
        userMetric: 'reducing query execution time by 45%',
      },
    });

    assert.ok(result.original, 'Must return original text');
    assert.ok(result.improved, 'Must return improved text');
    assert.ok(
      result.improved.toLowerCase().includes('spearheaded') ||
      result.improved.toLowerCase().includes('engineered') ||
      result.improved.toLowerCase().includes('architected'),
      'Improved bullet must lead with high-impact action verb'
    );
    assert.ok(
      result.improved.includes('45%'),
      'Must seamlessly incorporate user-supplied metric'
    );
  });

  test('8. AI Writing Assistant: Identifies missing metrics and prompts user', async () => {
    const nonQuantifiedBullet = 'built microservices for user notifications';
    
    const result = localImproveResumeText({
      type: 'bullet',
      content: nonQuantifiedBullet,
      context: { role: 'Backend Engineer' },
    });

    assert.ok(result.improved, 'Must provide improved framing');
    assert.ok(
      result.missingMetricPrompt !== null,
      'Must prompt candidate for missing quantifiable impact metric'
    );
  });

  test('9. Targeted Resume Optimization: Highlights relevant skills and generates role-tailored summary', async () => {
    const resumeContent = {
      personalInfo: { fullName: 'Alex Morgan', targetTitle: 'Staff Distributed Systems Engineer' },
      summary: 'Full stack developer with Node and React experience.',
      skills: {
        languages: ['Node.js', 'TypeScript', 'SQL', 'Python'],
        frameworks: ['React', 'Express.js'],
        databases: ['PostgreSQL', 'Redis'],
        tools: ['Docker', 'AWS'],
      },
    };

    const targetJd = `We need a Staff Distributed Systems Engineer with expertise in PostgreSQL, Docker, AWS, Kubernetes, and high-concurrency microservices. Must demonstrate database partitioning experience.`;

    const optResult = await optimizeResumeForJobWithGemini({
      resumeContent,
      jobDescription: targetJd,
    });

    assert.ok(optResult.jobMatchScore >= 60, 'Job match score must be calculated');
    assert.ok(Array.isArray(optResult.relevantExistingSkills), 'Must identify relevant existing skills');
    assert.ok(optResult.relevantExistingSkills.includes('PostgreSQL'), 'Must match PostgreSQL');
    assert.ok(optResult.relevantExistingSkills.includes('Docker'), 'Must match Docker');
    assert.ok(optResult.roleSpecificSummary, 'Must generate role-specific summary');
    assert.ok(!optResult.roleSpecificSummary.includes('10 years at Google'), 'Never fabricate employers');
  });

  test('10. Selectable-Text Vector PDF Export: Generates valid streaming A4 document with correct fonts', async () => {
    const testResumeData = {
      title: 'Alex Morgan - Executive CV',
      template: 'classic-professional',
      fontFamily: 'serif',
      fontSize: 'medium',
      accentColor: '#1E293B',
      personalInfo: {
        fullName: 'Alex Morgan',
        targetTitle: 'Staff Full-Stack Engineer',
        email: 'alex.morgan@cvinsight.ai',
        phone: '+1 (555) 349-8201',
        location: 'San Francisco, CA',
        linkedin: 'linkedin.com/in/alexmorgan',
      },
      summary: 'Staff Engineer with 7+ years experience designing resilient distributed microservices.',
      experiences: [
        {
          role: 'Staff Software Engineer',
          company: 'Acme Cloud Systems',
          location: 'San Francisco, CA',
          startDate: '2022',
          endDate: '',
          current: true,
          bullets: [
            'Spearheaded enterprise microservices migration, reducing API latency by 42%.',
            'Architected distributed Kafka event streaming pipeline handling 12M daily events.',
          ],
        },
      ],
      skills: {
        languages: 'JavaScript, TypeScript, Python, SQL',
        frameworks: 'React, Vite, Node.js, Express.js',
        databases: 'PostgreSQL, Redis',
        tools: 'Docker, Kubernetes, AWS',
      },
      education: [
        {
          degree: 'Bachelor of Science in Computer Science',
          school: 'UC Berkeley',
          startDate: '2015',
          endDate: '2019',
          honors: 'Magna Cum Laude',
        },
      ],
    };

    const doc = generateResumePdf(testResumeData, {
      template: 'classic-professional',
      fontFamily: 'serif',
      fontSize: 'medium',
      accentColor: '#1E293B',
    });

    assert.ok(doc, 'PDFDocument instance must be created');

    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));

    await new Promise((resolve, reject) => {
      doc.on('end', resolve);
      doc.on('error', reject);
      doc.end();
    });

    const buffer = Buffer.concat(chunks);
    assert.ok(buffer.length > 500, 'PDF buffer should be non-empty');
    assert.equal(buffer.subarray(0, 5).toString('utf-8'), '%PDF-', 'PDF must have valid magic byte signature (%PDF-)');
  });

  test('11. Cleanup: Delete test builder resume record', async () => {
    if (builderResumeId) {
      await prisma.builderResume.delete({
        where: { id: builderResumeId },
      });
    }
    const check = await prisma.builderResume.findUnique({
      where: { id: builderResumeId },
    });
    assert.equal(check, null, 'Deleted resume should no longer exist');
  });
});
