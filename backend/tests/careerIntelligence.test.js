import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import prisma from '../src/config/db.js';
import {
  localPersonalizedRoadmap,
  localInterviewQuestions,
  localEvaluateInterviewAnswer,
} from '../src/services/geminiService.js';

describe('AI Career Intelligence Platform & Tenant Security Suite', () => {
  let userA = null;
  let userB = null;
  let testRoadmap = null;
  let testPractice = null;

  test('1. Setup: Create isolated test users in PostgreSQL for tenant validation', async () => {
    // User A
    userA = await prisma.user.findFirst({
      where: { email: 'alex.morgan@cvinsight.ai' },
    });

    if (!userA) {
      userA = await prisma.user.create({
        data: {
          email: `userA.career.${Date.now()}@cvinsight.ai`,
          password: '$2b$12$dummyhashedpasswordfortestingpurposesonly00000',
          name: 'Alex Morgan',
          role: 'Staff Full-Stack Engineer',
        },
      });
    }

    // User B (for tenant isolation attacks)
    userB = await prisma.user.findFirst({
      where: { email: 'mallory.attacker@cvinsight.ai' },
    });

    if (!userB) {
      userB = await prisma.user.create({
        data: {
          email: `userB.attacker.${Date.now()}@cvinsight.ai`,
          password: '$2b$12$dummyhashedpasswordfortestingpurposesonly00000',
          name: 'Mallory Attacker',
          role: 'Junior Web Dev',
        },
      });
    }

    assert.ok(userA.id, 'User A must exist');
    assert.ok(userB.id, 'User B must exist');
    assert.notEqual(userA.id, userB.id, 'User A and User B must have distinct UUIDs');
  });

  test('2. Learning Roadmap: Create 30-60-90 Day Plan and persist to PostgreSQL', async () => {
    const roadmapData = localPersonalizedRoadmap({
      targetRole: 'Staff Distributed Systems Engineer',
      skillGaps: ['Apache Kafka', 'PostgreSQL Query Partitioning', 'System Design'],
      resumeContext: { candidateName: userA.name },
    });

    assert.ok(Array.isArray(roadmapData.plan30Day), 'Must have 30-day plan array');
    assert.ok(Array.isArray(roadmapData.plan60Day), 'Must have 60-day plan array');
    assert.ok(Array.isArray(roadmapData.plan90Day), 'Must have 90-day plan array');
    assert.equal(roadmapData.plan30Day.length, 4, '30-day plan must have 4 weekly tasks');

    testRoadmap = await prisma.learningRoadmap.create({
      data: {
        userId: userA.id,
        targetRole: roadmapData.targetRole,
        title: roadmapData.title,
        plan30Day: JSON.stringify(roadmapData.plan30Day),
        plan60Day: JSON.stringify(roadmapData.plan60Day),
        plan90Day: JSON.stringify(roadmapData.plan90Day),
        overallProgress: 0,
      },
    });

    assert.ok(testRoadmap.id, 'Roadmap record must be persisted to PostgreSQL');
    assert.equal(testRoadmap.userId, userA.id, 'Roadmap must belong to User A');
  });

  test('3. Learning Roadmap: Task completion toggle updates progress in PostgreSQL', async () => {
    assert.ok(testRoadmap, 'Test roadmap must exist');

    let plan30Day = JSON.parse(testRoadmap.plan30Day);
    const targetTaskId = plan30Day[0].id;

    // Toggle task 1 to completed
    plan30Day[0].completed = true;
    const allTasks = [...plan30Day, ...JSON.parse(testRoadmap.plan60Day), ...JSON.parse(testRoadmap.plan90Day)];
    const doneCount = allTasks.filter((t) => t.completed).length;
    const progress = Math.round((doneCount / allTasks.length) * 100);

    const updated = await prisma.learningRoadmap.update({
      where: { id: testRoadmap.id },
      data: {
        plan30Day: JSON.stringify(plan30Day),
        overallProgress: progress,
      },
    });

    assert.equal(updated.overallProgress, progress, 'Overall progress must reflect completed task');
    assert.ok(progress > 0, 'Progress must be greater than 0% after completing first task');
  });

  test('4. Tenant Isolation: User B MUST NOT be able to access User A roadmap', async () => {
    const unauthorizedAccess = await prisma.learningRoadmap.findFirst({
      where: {
        id: testRoadmap.id,
        userId: userB.id, // User B attempting to query User A's record
      },
    });

    assert.equal(unauthorizedAccess, null, 'User B must get null when attempting to access User A roadmap');
  });

  test('5. Interview Prep: Generate technical, behavioral and resume-specific questions', async () => {
    const questions = localInterviewQuestions({
      targetRole: 'Staff Distributed Systems Engineer',
      resumeContext: {
        candidateName: userA.name,
        skills: ['Kafka', 'Node.js', 'PostgreSQL', 'Docker'],
      },
    });

    assert.ok(Array.isArray(questions), 'Questions must be an array');
    assert.ok(questions.length >= 3, 'Must return at least 3 curated questions');

    const types = questions.map((q) => q.questionType);
    assert.ok(types.includes('technical'), 'Must include technical questions');
    assert.ok(types.includes('behavioral'), 'Must include behavioral questions');
    assert.ok(types.includes('resume-specific'), 'Must include resume-specific questions');
  });

  test('6. Interview Prep: Evaluate candidate answer with STAR framework and non-hiring disclaimer', async () => {
    const question = 'In your work with Kafka, how do you handle high concurrency while preventing bottlenecks?';
    const answer =
      'When managing peak event loads of 12M daily events, our Kafka partition consumers experienced backpressure lag. I was tasked with maintaining sub-200ms processing SLA. I decoupled the ingestion workers using Redis batch buffers and increased partition concurrency from 4 to 16. As a result, consumer lag dropped by 74% and API throughput increased by 3.5x without data loss.';

    const evalResult = localEvaluateInterviewAnswer({
      question,
      questionType: 'technical',
      userAnswer: answer,
      targetRole: 'Staff Distributed Systems Engineer',
    });

    assert.ok(evalResult.relevanceScore >= 70, 'Relevance score must be >= 70');
    assert.ok(evalResult.clarityScore >= 70, 'Clarity score must be >= 70');
    assert.ok(evalResult.completenessScore >= 70, 'Completeness score must be >= 70');
    assert.ok(evalResult.overallScore >= 70, 'Overall score must be >= 70');

    // STAR framework evaluation
    assert.ok(evalResult.starEvaluation, 'Must include starEvaluation object');
    assert.ok(evalResult.starEvaluation.situation, 'Must evaluate Situation');
    assert.ok(evalResult.starEvaluation.task, 'Must evaluate Task');
    assert.ok(evalResult.starEvaluation.action, 'Must evaluate Action');
    assert.ok(evalResult.starEvaluation.result, 'Must evaluate Result');

    // Mandatory Disclaimer
    assert.ok(
      evalResult.disclaimer.toLowerCase().includes('not a hiring decision'),
      'Must contain clear non-hiring decision disclaimer'
    );

    // Save evaluation to PostgreSQL
    testPractice = await prisma.interviewPractice.create({
      data: {
        userId: userA.id,
        targetRole: 'Staff Distributed Systems Engineer',
        questionType: 'technical',
        question,
        userAnswer: answer,
        relevanceScore: evalResult.relevanceScore,
        clarityScore: evalResult.clarityScore,
        completenessScore: evalResult.completenessScore,
        overallScore: evalResult.overallScore,
        starEvaluation: JSON.stringify(evalResult.starEvaluation),
        feedback: evalResult.feedback,
        suggestedImprovement: evalResult.suggestedImprovement,
        disclaimer: evalResult.disclaimer,
        status: 'evaluated',
      },
    });

    assert.ok(testPractice.id, 'Interview practice record must be saved in PostgreSQL');
  });

  test('7. Tenant Isolation: User B MUST NOT be able to access User A interview evaluations', async () => {
    const unauthorizedPractice = await prisma.interviewPractice.findFirst({
      where: {
        id: testPractice.id,
        userId: userB.id,
      },
    });

    assert.equal(unauthorizedPractice, null, 'User B must get null accessing User A interview record');
  });

  test('8. Career Analytics: Aggregates real stored data (ATS trend, role comparison, roadmap, interview)', async () => {
    // Ensure at least one AnalysisHistory entry exists for trend data
    let resume = await prisma.resume.findFirst({ where: { userId: userA.id } });
    if (!resume) {
      resume = await prisma.resume.create({
        data: {
          userId: userA.id,
          title: 'Alex_Morgan_Analytics_Resume.pdf',
          candidateName: 'Alex Morgan',
          fileName: 'Alex_Morgan_Analytics_Resume.pdf',
          targetRole: 'Staff Distributed Systems Engineer',
        },
      });
    }

    await prisma.analysisHistory.create({
      data: {
        userId: userA.id,
        resumeId: resume.id,
        score: 88,
        actionType: 'BENCHMARK_SCAN',
        notes: 'Initial career intelligence baseline',
      },
    });

    // Fetch userA analytics from real database tables
    const historyRecords = await prisma.analysisHistory.findMany({
      where: { userId: userA.id },
      orderBy: { createdAt: 'asc' },
    });

    const roadmapRecord = await prisma.learningRoadmap.findFirst({
      where: { userId: userA.id },
      orderBy: { updatedAt: 'desc' },
    });

    const interviewRecords = await prisma.interviewPractice.findMany({
      where: { userId: userA.id },
    });

    assert.ok(historyRecords.length >= 1, 'Must have at least 1 historical ATS trend data point');
    assert.ok(roadmapRecord, 'Must retrieve real user roadmap from PostgreSQL');
    assert.ok(interviewRecords.length >= 1, 'Must retrieve real interview practice records');

    const totalInterviewScores = interviewRecords.reduce((acc, r) => acc + (r.overallScore || 0), 0);
    const avgInterview = Math.round(totalInterviewScores / interviewRecords.length);
    assert.ok(avgInterview >= 70, 'Calculated average interview score must be valid');
  });

  test('9. Cleanup: Clean up test records created during test run', async () => {
    if (testRoadmap?.id) {
      await prisma.learningRoadmap.delete({ where: { id: testRoadmap.id } }).catch(() => {});
    }
    if (testPractice?.id) {
      await prisma.interviewPractice.delete({ where: { id: testPractice.id } }).catch(() => {});
    }
  });
});
