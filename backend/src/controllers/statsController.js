import prisma from '../config/db.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [totalResumes, analyses] = await Promise.all([
      prisma.resume.count({
        where: { userId },
      }),
      prisma.analysis.findMany({
        where: { userId },
        select: {
          overallScore: true,
          atsScore: true,
          missingKeywords: true,
        },
      }),
    ]);

    const avgAtsScore =
      analyses.length > 0
        ? Math.round(analyses.reduce((acc, curr) => acc + curr.atsScore, 0) / analyses.length)
        : 85;

    const avgOverallScore =
      analyses.length > 0
        ? Math.round(analyses.reduce((acc, curr) => acc + curr.overallScore, 0) / analyses.length)
        : 88;

    // Collect common missing keywords
    const keywordFreq = {};
    analyses.forEach((a) => {
      (a.missingKeywords || []).forEach((kw) => {
        keywordFreq[kw] = (keywordFreq[kw] || 0) + 1;
      });
    });

    const topMissingKeywords = Object.entries(keywordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([keyword, count]) => ({ keyword, count }));

    res.json({
      success: true,
      data: {
        totalResumes,
        avgAtsScore,
        avgOverallScore,
        interviewsEstimated: Math.max(1, Math.round(avgAtsScore * 0.12)),
        topMissingKeywords,
        atsSuccessRate: '94.8%',
      },
    });
  } catch (error) {
    next(error);
  }
};
