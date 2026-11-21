export const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource not found at ${req.originalUrl}`,
  });
};

export const errorHandler = (err, req, res, next) => {
  // Safe sanitized logging without exposing full memory dumps or keys
  const sanitizedMessage = (err.message || 'Internal Server Error')
    .replace(/(GEMINI_API_KEY|DATABASE_URL|JWT_SECRET)=([^\s]+)/gi, '$1=***');

  if (process.env.NODE_ENV !== 'production') {
    console.error('[API Error]:', sanitizedMessage, err.stack);
  } else {
    console.error('[API Error]:', sanitizedMessage);
  }

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    success: false,
    message: sanitizedMessage,
    errorId: req.headers['x-request-id'] || undefined,
    ...(process.env.NODE_ENV === 'production' ? {} : { stack: err.stack }),
  });
};
