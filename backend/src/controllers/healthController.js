import prisma from '../config/db.js';

export const getHealth = async (req, res, next) => {
  const startTime = Date.now();
  let dbStatus = 'healthy';
  let dbLatencyMs = 0;

  try {
    const dbStart = Date.now();
    // Real raw query to PostgreSQL verifying live DB connectivity
    await prisma.$queryRaw`SELECT 1 as ping`;
    dbLatencyMs = Date.now() - dbStart;

    // Record health metric into DB asynchronously
    prisma.systemMetric.create({
      data: {
        serviceName: 'cv-insight-core',
        status: 'healthy',
        responseTimeMs: dbLatencyMs,
      },
    }).catch(() => {}); // non-blocking logging
  } catch (dbError) {
    console.error('Database ping error in health check:', dbError.message);
    dbStatus = 'degraded';
    dbLatencyMs = -1;
  }

  const uptimeSeconds = Math.floor(process.uptime());
  const responseTimeMs = Date.now() - startTime;

  res.status(dbStatus === 'healthy' ? 200 : 503).json({
    status: dbStatus === 'healthy' ? 'operational' : 'degraded',
    service: 'CV Insight AI Backend Engine',
    timestamp: new Date().toISOString(),
    uptime: `${uptimeSeconds}s`,
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    metrics: {
      responseTimeMs,
      database: {
        status: dbStatus,
        provider: 'PostgreSQL 16',
        latencyMs: dbLatencyMs,
      },
      memory: {
        heapUsedMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        rssMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
      },
      nodeVersion: process.version,
    },
  });
};
