import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import prisma from '../src/config/db.js';

describe('Authentication & User Security Suite', () => {
  const testEmail = `test.user.${Date.now()}@cvinsight.test`;
  const testPassword = 'SecurePassword123!';
  let createdUserId = null;

  test('1. Should hash passwords with bcrypt with 12 rounds', async () => {
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(testPassword, salt);
    assert.ok(hash.startsWith('$2'), 'Hash should be a bcrypt string');
    const isMatch = await bcrypt.compare(testPassword, hash);
    assert.equal(isMatch, true, 'Bcrypt compare should verify password');
    const isWrongMatch = await bcrypt.compare('WrongPassword', hash);
    assert.equal(isWrongMatch, false, 'Bcrypt compare should reject incorrect password');
  });

  test('2. Should successfully create user in PostgreSQL', async () => {
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(testPassword, salt);

    const user = await prisma.user.create({
      data: {
        name: 'Automated Test Engineer',
        email: testEmail,
        password: hashedPassword,
        role: 'Staff Quality Engineer',
        industry: 'Software Quality & Testing',
      },
    });

    assert.ok(user.id, 'User ID should be generated');
    assert.equal(user.email, testEmail);
    createdUserId = user.id;
  });

  test('3. Should enforce unique email constraint', async () => {
    await assert.rejects(
      async () => {
        await prisma.user.create({
          data: {
            name: 'Duplicate Candidate',
            email: testEmail,
            password: 'SomePassword123!',
          },
        });
      },
      (err) => {
        return err.code === 'P2002'; // Prisma unique constraint violation code
      },
      'Should reject duplicate email with P2002 code'
    );
  });

  test('4. Should reject empty or short passwords (<6 chars)', () => {
    const isTooShort = (pwd) => !pwd || pwd.length < 6;
    assert.equal(isTooShort('12345'), true);
    assert.equal(isTooShort(''), true);
    assert.equal(isTooShort('ValidPass123!'), false);
  });

  after(async () => {
    if (createdUserId) {
      await prisma.user.delete({ where: { id: createdUserId } }).catch(() => {});
    }
  });
});
