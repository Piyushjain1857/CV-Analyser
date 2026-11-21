import prisma from '../config/db.js';
import { runGeminiAnalysis } from '../services/geminiService.js';
import { analyzeResumeText } from '../services/analyzerService.js';
import { generatePdfReport } from '../services/pdfReportService.js';

/**
 * Get latest analysis for user
 */
export const getLatestAnalysis = async (req, res, next) => {
  try {
    const latest = await prisma.analysis.findFirst({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        resume: true,
      },
    });

    if (!latest) {
      return res.json({
        success: true,
        data: null,
      });
    }

    res.json({
      success: true,
      data: latest,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get individual analysis by ID (tenant-isolated)
 */
export const getAnalysisById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const analysis = await prisma.analysis.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
      include: {
        resume: true,
      },
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analysis record not found or access denied.',
      });
    }

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Compare two historical analyses
 */
export const compareAnalyses = async (req, res, next) => {
  try {
    const { id1, id2 } = req.params;

    const [analysis1, analysis2] = await Promise.all([
      prisma.analysis.findFirst({
        where: { id: id1, userId: req.user.id },
        include: { resume: true },
      }),
      prisma.analysis.findFirst({
        where: { id: id2, userId: req.user.id },
        include: { resume: true },
      }),
    ]);

    if (!analysis1 || !analysis2) {
      return res.status(404).json({
        success: false,
        message: 'One or both analysis records were not found or access was denied.',
      });
    }

    // Parse JSON details if stored
    let det1 = {};
    let det2 = {};
    try { det1 = JSON.parse(analysis1.rawAnalysisJson || '{}'); } catch (e) {}
    try { det2 = JSON.parse(analysis2.rawAnalysisJson || '{}'); } catch (e) {}

    const jobMatch1 = det1.jobMatchScore || analysis1.overallScore;
    const jobMatch2 = det2.jobMatchScore || analysis2.overallScore;

    // Calculate Diffs
    const overallDelta = analysis2.overallScore - analysis1.overallScore;
    const atsDelta = analysis2.atsScore - analysis1.atsScore;
    const jobMatchDelta = jobMatch2 - jobMatch1;
    const keywordDelta = analysis2.keywordScore - analysis1.keywordScore;
    const formatDelta = analysis2.formatScore - analysis1.formatScore;

    // Gaps resolved in Version 2 that were missing in Version 1
    const resolvedGaps = (analysis1.missingKeywords || []).filter(
      (kw) => !(analysis2.missingKeywords || []).includes(kw)
    );

    // Newly added proficiencies
    const newKeywordsAdded = (analysis2.missingKeywords || []).filter(
      (kw) => !(analysis1.missingKeywords || []).includes(kw)
    );

    res.json({
      success: true,
      data: {
        versionA: {
          id: analysis1.id,
          createdAt: analysis1.createdAt,
          resumeTitle: analysis1.resume.title,
          targetRole: analysis1.resume.targetRole,
          overallScore: analysis1.overallScore,
          atsScore: analysis1.atsScore,
          jobMatchScore: jobMatch1,
          keywordScore: analysis1.keywordScore,
          formatScore: analysis1.formatScore,
          missingKeywords: analysis1.missingKeywords,
          summary: analysis1.summary,
        },
        versionB: {
          id: analysis2.id,
          createdAt: analysis2.createdAt,
          resumeTitle: analysis2.resume.title,
          targetRole: analysis2.resume.targetRole,
          overallScore: analysis2.overallScore,
          atsScore: analysis2.atsScore,
          jobMatchScore: jobMatch2,
          keywordScore: analysis2.keywordScore,
          formatScore: analysis2.formatScore,
          missingKeywords: analysis2.missingKeywords,
          summary: analysis2.summary,
        },
        comparisonDelta: {
          overallDelta,
          atsDelta,
          jobMatchDelta,
          keywordDelta,
          formatDelta,
          resolvedGaps,
          newKeywordsAdded,
          improved: overallDelta >= 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Re-analyze existing resume against a new pasted Job Description
 */
export const reanalyzeWithJobDescription = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { jobDescription, targetRole } = req.body;

    if (!jobDescription || jobDescription.trim().length < 20) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a job description (at least 20 characters) for comparison.',
      });
    }

    const resume = await prisma.resume.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume document not found.',
      });
    }

    const effectiveRole = targetRole || resume.targetRole;

    // Run AI analysis with the new Job Description
    const newAnalysis = await runGeminiAnalysis({
      resumeText: resume.rawText,
      targetRole: effectiveRole,
      targetIndustry: resume.targetIndustry,
      jobDescription,
    });

    // Save new analysis record
    const createdAnalysis = await prisma.analysis.create({
      data: {
        userId: req.user.id,
        resumeId: resume.id,
        overallScore: newAnalysis.overallScore,
        atsScore: newAnalysis.atsScore,
        keywordScore: newAnalysis.keywordScore,
        formatScore: newAnalysis.formatScore,
        skillScore: newAnalysis.skillScore,
        summary: newAnalysis.summary,
        strengths: newAnalysis.strengths,
        weaknesses: newAnalysis.weaknesses,
        missingKeywords: newAnalysis.missingKeywords,
        recommendations: newAnalysis.recommendations,
        rawAnalysisJson: JSON.stringify(newAnalysis),
      },
    });

    // Record in AnalysisHistory
    await prisma.analysisHistory.create({
      data: {
        userId: req.user.id,
        resumeId: resume.id,
        analysisId: createdAnalysis.id,
        score: createdAnalysis.overallScore,
        actionType: 'JD_REMATCH',
        notes: `Re-matched against target role "${effectiveRole}". Job match score: ${newAnalysis.jobMatchScore || newAnalysis.overallScore}/100.`,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Resume successfully re-matched against job description',
      data: {
        ...createdAnalysis,
        resume,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get audit history timeline
 */
export const getAnalysisHistory = async (req, res, next) => {
  try {
    const histories = await prisma.analysisHistory.findMany({
      where: { userId: req.user.id },
      include: {
        resume: {
          select: {
            title: true,
            candidateName: true,
            targetRole: true,
            fileName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: histories,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Text preview analysis
 */
export const analyzeCustomText = async (req, res, next) => {
  try {
    const { resumeText, targetRole, jobDescription } = req.body;
    const result = analyzeResumeText({ resumeText, targetRole, jobDescription });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Downloadable professional PDF analysis report
 * @route GET /api/analysis/:id/pdf
 */
export const exportAnalysisPdf = async (req, res, next) => {
  try {
    const { id } = req.params;

    const analysis = await prisma.analysis.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
      include: {
        resume: true,
      },
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analysis record not found or access denied.',
      });
    }

    const cleanTitle = (analysis.resume?.title || 'CV_Insight_Report')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 30);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${cleanTitle}_${analysis.id.substring(0, 8)}.pdf"`
    );

    const pdfDoc = generatePdfReport(analysis);
    pdfDoc.pipe(res);
    pdfDoc.end();
  } catch (error) {
    next(error);
  }
};

/**
 * Delete individual analysis record
 * @route DELETE /api/analysis/:id
 */
export const deleteAnalysis = async (req, res, next) => {
  try {
    const { id } = req.params;

    const analysis = await prisma.analysis.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analysis record not found.',
      });
    }

    await prisma.analysis.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Analysis report deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Clear all audit history for user
 * @route DELETE /api/analysis/history/clear
 */
export const clearAnalysisHistory = async (req, res, next) => {
  try {
    const result = await prisma.analysisHistory.deleteMany({
      where: { userId: req.user.id },
    });

    res.json({
      success: true,
      message: `Cleared ${result.count} audit history records.`,
      count: result.count,
    });
  } catch (error) {
    next(error);
  }
};
