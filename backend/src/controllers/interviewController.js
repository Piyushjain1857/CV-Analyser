import prisma from '../config/db.js';
import {
  generateInterviewQuestionsWithGemini,
  evaluateInterviewAnswerWithGemini,
  localInterviewQuestions,
} from '../services/geminiService.js';

/**
 * Generate interview questions grounded in role & resume
 * @route POST /api/interview/questions
 */
export const getInterviewQuestions = async (req, res, next) => {
  try {
    const { targetRole, resumeId } = req.body;
    const role = targetRole || req.user.role || 'Senior Full-Stack Developer';

    let resumeContext = {};
    if (resumeId) {
      const resume = await prisma.resume.findFirst({
        where: { id: resumeId, userId: req.user.id },
        include: {
          analyses: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      });

      if (resume) {
        resumeContext = {
          candidateName: resume.candidateName,
          targetRole: resume.targetRole,
          skills: resume.analyses[0]?.matchedKeywords || ['Node.js', 'React', 'PostgreSQL', 'Docker'],
          experienceRoles: [resume.targetRole],
        };
      }
    }

    const questions = await generateInterviewQuestionsWithGemini({
      targetRole: role,
      resumeContext,
    });

    return res.status(200).json({
      success: true,
      data: questions,
      targetRole: role,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Submit candidate's answer and get AI evaluation with STAR breakdown & non-hiring disclaimer
 * @route POST /api/interview/evaluate
 */
export const evaluateAnswer = async (req, res, next) => {
  try {
    const { question, questionType = 'technical', userAnswer, targetRole, resumeId, contextClue } = req.body;

    if (!userAnswer || userAnswer.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a typed response of at least 10 characters to evaluate.',
      });
    }

    const role = targetRole || req.user.role || 'Senior Full-Stack Developer';

    const evaluation = await evaluateInterviewAnswerWithGemini({
      question,
      questionType,
      userAnswer: userAnswer.trim(),
      targetRole: role,
    });

    // Save practice record to PostgreSQL
    const practiceRecord = await prisma.interviewPractice.create({
      data: {
        userId: req.user.id,
        resumeId: resumeId || null,
        targetRole: role,
        questionType,
        question,
        contextClue: contextClue || null,
        userAnswer: userAnswer.trim(),
        relevanceScore: evaluation.relevanceScore,
        clarityScore: evaluation.clarityScore,
        completenessScore: evaluation.completenessScore,
        overallScore: evaluation.overallScore,
        starEvaluation: JSON.stringify(evaluation.starEvaluation),
        feedback: evaluation.feedback,
        suggestedImprovement: evaluation.suggestedImprovement,
        disclaimer: evaluation.disclaimer,
        status: 'evaluated',
      },
    });

    return res.status(201).json({
      success: true,
      data: {
        ...practiceRecord,
        starEvaluation: evaluation.starEvaluation,
      },
      message: 'Interview response evaluated successfully!',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get user's interview practice history
 * @route GET /api/interview/history
 */
export const getInterviewHistory = async (req, res, next) => {
  try {
    const { targetRole } = req.query;

    const where = {
      userId: req.user.id,
      ...(targetRole ? { targetRole } : {}),
    };

    const practices = await prisma.interviewPractice.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const parsedPractices = practices.map((p) => ({
      ...p,
      starEvaluation: typeof p.starEvaluation === 'string' ? JSON.parse(p.starEvaluation) : p.starEvaluation,
    }));

    return res.status(200).json({
      success: true,
      data: parsedPractices,
      count: parsedPractices.length,
    });
  } catch (err) {
    next(err);
  }
};
