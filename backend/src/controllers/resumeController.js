import prisma from '../config/db.js';
import { extractTextFromBuffer } from '../services/documentParser.js';
import { runGeminiAnalysis } from '../services/geminiService.js';

export const getResumes = async (req, res, next) => {
  try {
    const resumes = await prisma.resume.findMany({
      where: { userId: req.user.id },
      include: {
        analyses: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: resumes,
    });
  } catch (error) {
    next(error);
  }
};

export const getResumeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resume = await prisma.resume.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
      include: {
        analyses: {
          orderBy: { createdAt: 'desc' },
        },
        analysisHistories: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found or you do not have permission to access it.',
      });
    }

    res.json({
      success: true,
      data: resume,
    });
  } catch (error) {
    next(error);
  }
};

export const createResume = async (req, res, next) => {
  try {
    let {
      title,
      candidateName,
      rawText = '',
      targetRole = 'Senior Software Engineer',
      targetIndustry = 'Technology',
      jobDescription = '',
    } = req.body;

    let fileName = 'pasted_resume.txt';
    let fileSize = rawText ? rawText.length : 0;
    let fileType = 'text/plain';

    // 1. Process uploaded file if provided via multipart/form-data
    if (req.file) {
      fileName = req.file.originalname;
      fileSize = req.file.size;
      fileType = req.file.mimetype;

      // Extract text with file signature validation
      const extracted = await extractTextFromBuffer(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );
      rawText = extracted.rawText;
    }

    // Validation
    if (!rawText || rawText.trim().length < 50) {
      return res.status(400).json({
        success: false,
        message:
          'Insufficient text in document. Scanned images or empty files cannot be parsed by ATS engines. Please provide a text-based PDF or DOCX.',
      });
    }

    const candidateDisplayName = (candidateName || req.user.name || 'Candidate').trim();
    const finalTitle = (title || `${candidateDisplayName}'s CV - ${targetRole}`).trim();

    // 2. Execute AI Analysis (Gemini with Heuristic Fallback & Prompt Injection Guard)
    const analysis = await runGeminiAnalysis({
      resumeText: rawText,
      targetRole,
      targetIndustry,
      jobDescription,
    });

    // Safe sanitized logging (never log raw resume or API keys)
    console.log(
      `[ATS Analysis]: User: ${req.user.email} | File: ${fileName} (${(fileSize / 1024).toFixed(1)} KB) | ATS Score: ${analysis.atsScore}/100 | Engine: ${analysis.aiEngine}`
    );

    // 3. Persist securely in PostgreSQL using Prisma
    const newResume = await prisma.resume.create({
      data: {
        userId: req.user.id,
        title: finalTitle,
        candidateName: candidateDisplayName,
        fileName,
        fileSize,
        fileType,
        rawText, // stored securely in DB for user reference
        status: 'analyzed',
        targetRole,
        targetIndustry,
        analyses: {
          create: {
            userId: req.user.id,
            overallScore: analysis.overallScore,
            atsScore: analysis.atsScore,
            keywordScore: analysis.keywordScore,
            formatScore: analysis.formatScore,
            skillScore: analysis.skillScore,
            summary: analysis.summary,
            strengths: analysis.strengths,
            weaknesses: analysis.weaknesses,
            missingKeywords: analysis.missingKeywords,
            recommendations: analysis.recommendations,
            rawAnalysisJson: JSON.stringify(analysis),
          },
        },
      },
      include: {
        analyses: true,
      },
    });

    // 4. Record historical audit entry
    if (newResume.analyses[0]) {
      await prisma.analysisHistory.create({
        data: {
          userId: req.user.id,
          resumeId: newResume.id,
          analysisId: newResume.analyses[0].id,
          score: newResume.analyses[0].overallScore,
          actionType: 'INITIAL_SCAN',
          notes: `ATS Audit performed. Estimated compatibility index: ${newResume.analyses[0].atsScore}/100.`,
        },
      });
    }

    res.status(201).json({
      success: true,
      message: 'Resume parsed and analyzed successfully',
      data: newResume,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteResume = async (req, res, next) => {
  try {
    const { id } = req.params;

    const resume = await prisma.resume.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found or you do not have permission to delete it.',
      });
    }

    await prisma.resume.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Resume and all associated analysis records deleted successfully from PostgreSQL.',
    });
  } catch (error) {
    next(error);
  }
};
