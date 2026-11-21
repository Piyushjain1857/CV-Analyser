import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  extractTextFromBuffer,
  validateFileSignature,
} from '../src/services/documentParser.js';

describe('Document Upload & Binary Signature Verification Suite', () => {
  test('1. Should accept valid PDF magic byte signature (%PDF-)', () => {
    const validPdfBuffer = Buffer.from('%PDF-1.7\nSample PDF stream');
    const result = validateFileSignature(validPdfBuffer, 'test.pdf', 'application/pdf');
    assert.equal(result.valid, true, 'Valid PDF header must be accepted');
    assert.equal(result.fileFormat, 'PDF');
  });

  test('2. Should reject spoofed PDF with malicious or text file payload', () => {
    const fakePdfBuffer = Buffer.from('Plain text file renamed to fake.pdf without PDF headers');
    const result = validateFileSignature(fakePdfBuffer, 'fake.pdf', 'application/pdf');
    assert.equal(result.valid, false, 'Spoofed PDF must fail binary signature check');
    assert.ok(result.error.includes('header signature'));
  });

  test('3. Should accept valid DOCX zip container signature (PK\\x03\\x04)', () => {
    const validDocxBuffer = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x00, 0x00]);
    const result = validateFileSignature(
      validDocxBuffer,
      'resume.docx',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
    assert.equal(result.valid, true, 'Valid DOCX PK header must be accepted');
    assert.equal(result.fileFormat, 'DOCX');
  });

  test('4. Should reject empty or scanned documents with <50 characters', async () => {
    const minimalPdf = Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF');
    await assert.rejects(
      async () => {
        await extractTextFromBuffer(minimalPdf, 'empty.pdf', 'application/pdf');
      },
      (err) => {
        return (
          err.message.includes('Insufficient text') ||
          err.message.includes('Scanned') ||
          err.message.includes('Invalid PDF structure')
        );
      },
      'Should throw descriptive parse or insufficient text error'
    );
  });

  test('5. Should correctly parse plain text resume stream', async () => {
    const sampleText =
      'Alex Morgan - Senior Cloud Architect with 8 years of distributed systems engineering. Expert in React, Node.js, Kubernetes, and PostgreSQL.';
    const txtBuffer = Buffer.from(sampleText, 'utf-8');
    const result = await extractTextFromBuffer(txtBuffer, 'sample.txt', 'text/plain');
    assert.ok(result.rawText.includes('Alex Morgan'));
    assert.equal(result.characterCount > 50, true);
  });
});
