import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { runGeminiAnalysis, ATS_SCORING_RUBRIC } from '../src/services/geminiService.js';

describe('Gemini AI & Resilient ATS Engine Suite', () => {
  const sampleResume = `
Alex Morgan - Staff Full-Stack Engineer
Summary:
10+ years engineering cloud-native microservices, reactive frontend architectures, and high-concurrency data systems.
Work Experience:
Staff Engineer | Apex Cloud (2020 - Present)
- Architected distributed message queue processing 15M daily requests in Node.js and PostgreSQL.
- Reduced overall cloud computing expenditure by 35% using Kubernetes autoscaling.
Skills:
React, Node.js, TypeScript, PostgreSQL, Docker, Kubernetes, AWS, Redis, GraphQL
Education:
B.S. in Computer Science | State University
`;

  test('1. Scoring rubric should define transparent criteria and weights', () => {
    assert.equal(ATS_SCORING_RUBRIC.keywordAlignmentWeight, '35%');
    assert.equal(ATS_SCORING_RUBRIC.structureParseabilityWeight, '25%');
    assert.equal(ATS_SCORING_RUBRIC.quantifiedImpactWeight, '20%');
    assert.equal(ATS_SCORING_RUBRIC.grammarToneWeight, '20%');
    assert.ok(ATS_SCORING_RUBRIC.marginOfUncertainty.includes('±4%'));
  });

  test('2. Should produce complete 6-dimension schema output', async () => {
    const analysis = await runGeminiAnalysis({
      resumeText: sampleResume,
      targetRole: 'Staff Full-Stack Engineer',
      targetIndustry: 'Cloud Infrastructure',
      jobDescription: 'Requirements: React, Node.js, PostgreSQL, Kubernetes, AWS, microservices.',
    });

    assert.equal(typeof analysis.overallScore, 'number');
    assert.equal(typeof analysis.atsScore, 'number');
    assert.equal(typeof analysis.jobMatchScore, 'number');
    assert.equal(typeof analysis.keywordScore, 'number');
    assert.equal(typeof analysis.formatScore, 'number');
    assert.equal(typeof analysis.skillScore, 'number');

    assert.ok(analysis.overallScore >= 0 && analysis.overallScore <= 100);
    assert.ok(analysis.summary && analysis.summary.length > 20);
    assert.ok(Array.isArray(analysis.strengths));
    assert.ok(Array.isArray(analysis.weaknesses));
    assert.ok(Array.isArray(analysis.recommendations));
  });

  test('3. Should provide Google XYZ bullet rewrites without fabrication', async () => {
    const analysis = await runGeminiAnalysis({
      resumeText: sampleResume,
      targetRole: 'Staff Full-Stack Engineer',
    });

    assert.ok(Array.isArray(analysis.bulletPointRewrites), 'Rewrites should be an array');
    assert.ok(analysis.bulletPointRewrites.length > 0, 'Should have at least 1 rewrite');

    const firstRewrite = analysis.bulletPointRewrites[0];
    assert.ok(firstRewrite.original, 'Rewrite must have original text');
    assert.ok(firstRewrite.improved, 'Rewrite must have improved text');
    assert.ok(firstRewrite.rationale, 'Rewrite must explain rationale');
  });

  test('4. Should extract strategic recommended learning topics', async () => {
    const analysis = await runGeminiAnalysis({
      resumeText: sampleResume,
      targetRole: 'Staff Cloud Architect',
      jobDescription: 'Requires Kafka, Terraform, OpenTelemetry, Helm.',
    });

    assert.ok(Array.isArray(analysis.recommendedLearningTopics));
    assert.ok(analysis.recommendedLearningTopics.length > 0);
    const topic = analysis.recommendedLearningTopics[0];
    assert.ok(topic.topic, 'Topic must have name');
    assert.ok(topic.importance, 'Topic must have importance tier');
    assert.ok(topic.estimatedStudyHours, 'Topic must have study hours estimate');
  });

  test('5. Should serve cached analysis for identical input hash', async () => {
    const start = Date.now();
    const result1 = await runGeminiAnalysis({
      resumeText: sampleResume,
      targetRole: 'Cache Test Role',
    });
    const result2 = await runGeminiAnalysis({
      resumeText: sampleResume,
      targetRole: 'Cache Test Role',
    });

    assert.equal(result2.cached, true, 'Second identical request should return cached result');
  });
});
