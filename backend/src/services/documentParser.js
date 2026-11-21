import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

/**
 * Inspect magic bytes of buffer to verify real file signature
 */
export function validateFileSignature(buffer, fileName = '', mimeType = '') {
  if (!buffer || buffer.length < 4) {
    return {
      valid: false,
      error: 'Empty or corrupted file buffer.',
    };
  }

  if (buffer.length > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds the 5 MB limit (Received: ${(buffer.length / (1024 * 1024)).toFixed(2)} MB).`,
    };
  }

  const ext = (fileName || '').split('.').pop().toLowerCase();

  // 1. PDF signature: %PDF- (0x25, 0x50, 0x44, 0x46)
  const isPdf =
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46;

  if (ext === 'pdf' || mimeType === 'application/pdf') {
    if (!isPdf) {
      return {
        valid: false,
        error: 'File signature mismatch: The uploaded file has a .pdf extension but lacks a valid PDF header signature (%PDF-).',
      };
    }
    return { valid: true, fileFormat: 'PDF' };
  }

  // 2. DOCX signature: ZIP container starting with PK\x03\x04 (0x50, 0x4B, 0x03, 0x04)
  const isZip =
    buffer[0] === 0x50 &&
    buffer[1] === 0x4B &&
    (buffer[2] === 0x03 || buffer[2] === 0x05 || buffer[2] === 0x07);

  if (
    ext === 'docx' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    if (!isZip) {
      return {
        valid: false,
        error: 'File signature mismatch: The uploaded file has a .docx extension but lacks valid Office Open XML ZIP headers.',
      };
    }
    return { valid: true, fileFormat: 'DOCX' };
  }

  // 3. Plain Text: Check for absence of binary null bytes
  if (ext === 'txt' || mimeType === 'text/plain') {
    for (let i = 0; i < Math.min(buffer.length, 512); i++) {
      if (buffer[i] === 0x00) {
        return {
          valid: false,
          error: 'File signature mismatch: The text file contains binary null bytes and cannot be read as plain text.',
        };
      }
    }
    return { valid: true, fileFormat: 'TXT' };
  }

  return {
    valid: false,
    error: `Unsupported file format (.${ext}). Only PDF and DOCX files up to 5 MB are accepted.`,
  };
}

/**
 * Securely extracts text from PDF, DOCX, or TXT buffer
 */
export async function extractTextFromBuffer(buffer, fileName = '', mimeType = '') {
  // Validate signature first
  const check = validateFileSignature(buffer, fileName, mimeType);
  if (!check.valid) {
    throw new Error(check.error);
  }

  let extractedText = '';
  const ext = (fileName || '').split('.').pop().toLowerCase();

  try {
    if (ext === 'pdf' || check.fileFormat === 'PDF') {
      const parser = new PDFParse({ data: buffer });
      await parser.load();
      const textResult = await parser.getText();
      extractedText = textResult?.text || (typeof textResult === 'string' ? textResult : '');
      if (typeof parser.destroy === 'function') {
        parser.destroy();
      }
    } else if (ext === 'docx' || check.fileFormat === 'DOCX') {
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value || '';
    } else if (ext === 'txt' || check.fileFormat === 'TXT') {
      extractedText = buffer.toString('utf-8');
    }
  } catch (parseError) {
    throw new Error(
      `Failed to parse document structure: ${parseError.message || 'File may be corrupted or encrypted.'}`
    );
  }

  // Clean and sanitize text
  const cleanedText = extractedText
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // remove non-printable ASCII control characters
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // Check for scanned / empty documents
  if (cleanedText.length < 50) {
    throw new Error(
      'The uploaded document contains insufficient text (less than 50 characters). It may be a scanned image or flattened PDF. Please upload a searchable, text-based PDF or DOCX.'
    );
  }

  const words = cleanedText.split(/\s+/).filter(Boolean);

  return {
    rawText: cleanedText,
    fileFormat: check.fileFormat,
    characterCount: cleanedText.length,
    wordCount: words.length,
  };
}
