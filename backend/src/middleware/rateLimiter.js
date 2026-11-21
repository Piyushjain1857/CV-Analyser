import rateLimit from 'express-rate-limit';

/**
 * General API rate limiter for standard CRUD operations
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many API requests from this client. Please slow down and try again shortly.',
  },
});

/**
 * Strict rate limiter for authentication routes (login, signup) to defend against brute force
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 login/signup attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. For account security, please wait 15 minutes before retrying.',
  },
});

/**
 * AI analysis rate limiter to enforce API cost controls and prevent abuse of Gemini quota
 */
export const aiAnalysisLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 25, // 25 document scans per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'You have reached the temporary scan rate limit. Please wait a few minutes before scanning another resume to protect AI compute capacity.',
  },
});
