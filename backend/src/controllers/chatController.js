import prisma from '../config/db.js';
import { generateChatReply } from '../services/geminiService.js';

/**
 * Send message to AI Career Assistant and save conversation history
 * @route POST /api/chat
 */
export const sendMessage = async (req, res, next) => {
  try {
    const { resumeId, message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message content cannot be empty.',
      });
    }

    // 1. Fetch resume and latest analysis to ground the AI assistant in candidate's facts
    let resume = null;
    let latestAnalysis = null;

    if (resumeId) {
      resume = await prisma.resume.findFirst({
        where: { id: resumeId, userId: req.user.id },
        include: {
          analyses: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      });

      if (resume) {
        latestAnalysis = resume.analyses[0] || null;
      }
    }

    // If no specific resumeId or not found, fall back to user's most recent resume
    if (!resume) {
      resume = await prisma.resume.findFirst({
        where: { userId: req.user.id },
        include: {
          analyses: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      if (resume) {
        latestAnalysis = resume.analyses[0] || null;
      }
    }

    // Build context
    let rawJson = {};
    if (latestAnalysis?.rawAnalysisJson) {
      try {
        rawJson = JSON.parse(latestAnalysis.rawAnalysisJson);
      } catch (e) {}
    }

    // Fetch saved learning roadmap to ground career planning and skill development
    const roadmap = await prisma.learningRoadmap.findFirst({
      where: { userId: req.user.id },
      orderBy: { updatedAt: 'desc' },
    });

    let roadmapContext = null;
    if (roadmap) {
      try {
        const p30 = typeof roadmap.plan30Day === 'string' ? JSON.parse(roadmap.plan30Day) : (roadmap.plan30Day || []);
        const p60 = typeof roadmap.plan60Day === 'string' ? JSON.parse(roadmap.plan60Day) : (roadmap.plan60Day || []);
        const p90 = typeof roadmap.plan90Day === 'string' ? JSON.parse(roadmap.plan90Day) : (roadmap.plan90Day || []);
        const allTasks = [...p30, ...p60, ...p90];
        roadmapContext = {
          title: roadmap.title,
          targetRole: roadmap.targetRole,
          overallProgress: `${roadmap.overallProgress}%`,
          nextUpcomingMilestones: allTasks.filter((t) => !t.completed).slice(0, 3).map((t) => `${t.week}: ${t.title} (${t.project || ''})`),
        };
      } catch (e) {}
    }

    const resumeContext = {
      candidateName: resume?.candidateName || req.user.name,
      targetRole: resume?.targetRole || req.user.role,
      atsScore: latestAnalysis?.atsScore || 85,
      jobMatchScore: rawJson.jobMatchScore || latestAnalysis?.overallScore || 80,
      missingKeywords: latestAnalysis?.missingKeywords || [],
      rawText: resume?.rawText || '',
      savedRoadmap: roadmapContext,
    };

    // 2. Fetch recent conversation history
    const history = await prisma.chatMessage.findMany({
      where: {
        userId: req.user.id,
        ...(resume ? { resumeId: resume.id } : {}),
      },
      orderBy: { createdAt: 'asc' },
      take: 12,
    });

    // 3. Save User Message
    const userMsgRecord = await prisma.chatMessage.create({
      data: {
        userId: req.user.id,
        resumeId: resume?.id || null,
        analysisId: latestAnalysis?.id || null,
        role: 'user',
        content: message.trim(),
      },
    });

    // 4. Generate AI Reply with Gemini / Resilient Career Engine
    const { reply, source } = await generateChatReply({
      userMessage: message,
      history,
      resumeContext,
    });

    // 5. Save Assistant Message
    const assistantMsgRecord = await prisma.chatMessage.create({
      data: {
        userId: req.user.id,
        resumeId: resume?.id || null,
        analysisId: latestAnalysis?.id || null,
        role: 'assistant',
        content: reply,
      },
    });

    res.json({
      success: true,
      data: {
        userMessage: userMsgRecord,
        assistantMessage: {
          ...assistantMsgRecord,
          source,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve conversation history for a given resume
 * @route GET /api/chat/history/:resumeId
 */
export const getChatHistory = async (req, res, next) => {
  try {
    const { resumeId } = req.params;

    const messages = await prisma.chatMessage.findMany({
      where: {
        userId: req.user.id,
        ...(resumeId && resumeId !== 'all' ? { resumeId } : {}),
      },
      orderBy: { createdAt: 'asc' },
      take: 50,
    });

    res.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Clear chat history for a given resume
 * @route DELETE /api/chat/history/:resumeId
 */
export const clearChatHistory = async (req, res, next) => {
  try {
    const { resumeId } = req.params;

    const result = await prisma.chatMessage.deleteMany({
      where: {
        userId: req.user.id,
        ...(resumeId && resumeId !== 'all' ? { resumeId } : {}),
      },
    });

    res.json({
      success: true,
      message: `Cleared ${result.count} chat messages.`,
      count: result.count,
    });
  } catch (error) {
    next(error);
  }
};
