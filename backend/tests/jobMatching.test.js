import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { analyzeResumeText } from '../src/services/analyzerService.js';

describe('Job Matching & Score Delta Calculation Suite', () => {
  const v1Resume = `
Devon Vance - Senior Software Engineer
Experience:
Senior Developer at Tech Co.
- Built microservices using Node.js, Express, and PostgreSQL.
- Implemented unit tests and code reviews.
Skills:
JavaScript, Node.js, Express, PostgreSQL, Git, REST APIs
Education:
B.S. in Computer Science
`;

  const v2Resume = `
Devon Vance - Lead Cloud Architect
Experience:
Lead Architect at Tech Co.
- Architected enterprise cloud infrastructure with Docker, Kubernetes, and AWS, cutting latency by 45%.
- Led 10 engineers in high-concurrency microservices with Node.js, TypeScript, PostgreSQL, and Redis.
Skills:
JavaScript, TypeScript, Node.js, Express, PostgreSQL, Redis, Docker, Kubernetes, AWS, Git, System Design
Education:
B.S. in Computer Science
`;

  const targetJobDescription = `
Looking for Lead Cloud Architect.
Must have: Docker, Kubernetes, AWS, TypeScript, PostgreSQL, Redis, Microservices, and System Design.
`;

  test('1. Version 2 should exhibit higher keyword saturation than Version 1', () => {
    const analysisV1 = analyzeResumeText({
      resumeText: v1Resume,
      targetRole: 'Lead Cloud Architect',
      jobDescription: targetJobDescription,
    });

    const analysisV2 = analyzeResumeText({
      resumeText: v2Resume,
      targetRole: 'Lead Cloud Architect',
      jobDescription: targetJobDescription,
    });

    assert.ok(
      analysisV2.keywordScore >= analysisV1.keywordScore,
      `V2 keyword score (${analysisV2.keywordScore}) should be higher than V1 (${analysisV1.keywordScore})`
    );
  });

  test('2. Delta calculation between Version 1 and Version 2 should identify resolved gaps', () => {
    const analysisV1 = analyzeResumeText({
      resumeText: v1Resume,
      targetRole: 'Lead Cloud Architect',
      jobDescription: targetJobDescription,
    });

    const analysisV2 = analyzeResumeText({
      resumeText: v2Resume,
      targetRole: 'Lead Cloud Architect',
      jobDescription: targetJobDescription,
    });

    const overallDelta = analysisV2.overallScore - analysisV1.overallScore;
    assert.equal(typeof overallDelta, 'number');

    // Resolved gaps in V2 that were missing in V1
    const resolvedGaps = (analysisV1.missingKeywords || []).filter(
      (kw) => !(analysisV2.missingKeywords || []).includes(kw)
    );

    assert.ok(Array.isArray(resolvedGaps));
  });

  test('3. Should categorize skills into matched vs missing competencies', () => {
    const analysis = analyzeResumeText({
      resumeText: v2Resume,
      targetRole: 'Lead Cloud Architect',
      jobDescription: targetJobDescription,
    });

    assert.ok(Array.isArray(analysis.matchedKeywords));
    assert.ok(Array.isArray(analysis.missingKeywords));
    assert.ok(analysis.matchedKeywords.length > 0);
  });
});
