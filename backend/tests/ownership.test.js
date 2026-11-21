import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import prisma from '../src/config/db.js';

describe('Tenant Isolation & Authorization Security Suite', () => {
  let userA, userB;
  let resumeA, analysisA;

  before(async () => {
    const salt = await bcrypt.genSalt(10);
    const pass = await bcrypt.hash('Secret123!', salt);

    // Create User A
    userA = await prisma.user.create({
      data: {
        name: 'Tenant User A',
        email: `tenant.a.${Date.now()}@cvinsight.test`,
        password: pass,
        role: 'Staff Engineer A',
      },
    });

    // Create User B
    userB = await prisma.user.create({
      data: {
        name: 'Tenant User B',
        email: `tenant.b.${Date.now()}@cvinsight.test`,
        password: pass,
        role: 'Staff Engineer B',
      },
    });

    // Create Resume and Analysis for User A
    resumeA = await prisma.resume.create({
      data: {
        userId: userA.id,
        title: "User A Confidential Resume",
        candidateName: 'User A',
        fileName: 'resume_a.pdf',
        rawText: 'Confidential proprietary candidate resume content for User A.',
        targetRole: 'Staff Engineer',
      },
    });

    analysisA = await prisma.analysis.create({
      data: {
        userId: userA.id,
        resumeId: resumeA.id,
        overallScore: 88,
        atsScore: 90,
        keywordScore: 85,
        formatScore: 92,
        skillScore: 86,
        summary: "User A's private analysis summary.",
        strengths: ['Strong system design'],
        weaknesses: ['Minor formatting'],
        missingKeywords: ['Rust'],
        recommendations: ['Quantify metrics'],
      },
    });
  });

  test("1. User A should successfully access their own resume", async () => {
    const record = await prisma.resume.findFirst({
      where: {
        id: resumeA.id,
        userId: userA.id, // User A's tenant ID
      },
    });
    assert.ok(record, "User A must be able to access their own resume");
    assert.equal(record.id, resumeA.id);
  });

  test("2. User B MUST NOT be able to access User A's resume (Tenant Isolation)", async () => {
    const record = await prisma.resume.findFirst({
      where: {
        id: resumeA.id,
        userId: userB.id, // Querying as User B
      },
    });
    assert.equal(record, null, "User B must receive null for User A's resume");
  });

  test("3. User B MUST NOT be able to access User A's analysis record", async () => {
    const record = await prisma.analysis.findFirst({
      where: {
        id: analysisA.id,
        userId: userB.id, // Querying as User B
      },
    });
    assert.equal(record, null, "User B must receive null for User A's analysis");
  });

  test("4. User B MUST NOT be able to delete User A's resume", async () => {
    // Attempt deletion with User B's ownership filter
    const result = await prisma.resume.deleteMany({
      where: {
        id: resumeA.id,
        userId: userB.id,
      },
    });
    assert.equal(result.count, 0, "No records should be deleted when userId mismatch");

    // Verify resumeA still exists
    const stillExists = await prisma.resume.findUnique({
      where: { id: resumeA.id },
    });
    assert.ok(stillExists, "Resume A must still be intact in PostgreSQL");
  });

  after(async () => {
    // Cleanup
    if (userA) await prisma.user.delete({ where: { id: userA.id } }).catch(() => {});
    if (userB) await prisma.user.delete({ where: { id: userB.id } }).catch(() => {});
  });
});
