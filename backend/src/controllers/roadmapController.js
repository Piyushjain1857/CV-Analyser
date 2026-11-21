import prisma from '../config/db.js';
import { generatePersonalizedRoadmapWithGemini, localPersonalizedRoadmap } from '../services/geminiService.js';

/**
 * Get active roadmap for the authenticated user
 * @route GET /api/roadmap
 */
export const getRoadmap = async (req, res, next) => {
  try {
    let roadmaps = await prisma.learningRoadmap.findMany({
      where: { userId: req.user.id },
      orderBy: { updatedAt: 'desc' },
    });

    // If user doesn't have a roadmap yet, initialize an authentic default one
    if (roadmaps.length === 0) {
      const defaultRoadmapData = localPersonalizedRoadmap({
        targetRole: req.user.role || 'Staff Full-Stack Engineer',
        skillGaps: ['Distributed Event Streaming (Kafka)', 'PostgreSQL Partitioning', 'System Design'],
        resumeContext: { candidateName: req.user.name },
      });

      const newRoadmap = await prisma.learningRoadmap.create({
        data: {
          userId: req.user.id,
          targetRole: defaultRoadmapData.targetRole,
          title: defaultRoadmapData.title,
          plan30Day: JSON.stringify(defaultRoadmapData.plan30Day),
          plan60Day: JSON.stringify(defaultRoadmapData.plan60Day),
          plan90Day: JSON.stringify(defaultRoadmapData.plan90Day),
          overallProgress: defaultRoadmapData.overallProgress,
        },
      });

      roadmaps = [newRoadmap];
    }

    // Parse JSON strings for client
    const parsedRoadmaps = roadmaps.map((rm) => ({
      ...rm,
      plan30Day: typeof rm.plan30Day === 'string' ? JSON.parse(rm.plan30Day) : rm.plan30Day,
      plan60Day: typeof rm.plan60Day === 'string' ? JSON.parse(rm.plan60Day) : rm.plan60Day,
      plan90Day: typeof rm.plan90Day === 'string' ? JSON.parse(rm.plan90Day) : rm.plan90Day,
    }));

    return res.status(200).json({
      success: true,
      data: parsedRoadmaps[0], // Active roadmap
      all: parsedRoadmaps,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Generate a new tailored learning roadmap
 * @route POST /api/roadmap/generate
 */
export const generateRoadmap = async (req, res, next) => {
  try {
    const { targetRole, skillGaps = [], resumeId } = req.body;
    const role = targetRole || req.user.role || 'Staff Full-Stack Engineer';

    let resumeContext = {};
    if (resumeId) {
      const resume = await prisma.resume.findFirst({
        where: { id: resumeId, userId: req.user.id },
      });
      if (resume) {
        resumeContext = {
          candidateName: resume.candidateName,
          title: resume.title,
          targetRole: resume.targetRole,
        };
      }
    }

    const roadmapData = await generatePersonalizedRoadmapWithGemini({
      targetRole: role,
      skillGaps: Array.isArray(skillGaps) ? skillGaps : [],
      resumeContext,
    });

    const savedRecord = await prisma.learningRoadmap.create({
      data: {
        userId: req.user.id,
        resumeId: resumeId || null,
        targetRole: role,
        title: roadmapData.title || `30-60-90 Day Career Acceleration Roadmap: ${role}`,
        plan30Day: JSON.stringify(roadmapData.plan30Day || []),
        plan60Day: JSON.stringify(roadmapData.plan60Day || []),
        plan90Day: JSON.stringify(roadmapData.plan90Day || []),
        overallProgress: 0,
      },
    });

    return res.status(201).json({
      success: true,
      data: {
        ...savedRecord,
        plan30Day: roadmapData.plan30Day,
        plan60Day: roadmapData.plan60Day,
        plan90Day: roadmapData.plan90Day,
      },
      message: 'Personalized 30-60-90 day learning roadmap generated successfully!',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Toggle task completion and persist directly to PostgreSQL
 * @route PATCH /api/roadmap/:id/task
 */
export const toggleRoadmapTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { taskId, completed } = req.body;

    const roadmap = await prisma.learningRoadmap.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: 'Learning roadmap not found or unauthorized access.',
      });
    }

    let plan30Day = typeof roadmap.plan30Day === 'string' ? JSON.parse(roadmap.plan30Day) : roadmap.plan30Day;
    let plan60Day = typeof roadmap.plan60Day === 'string' ? JSON.parse(roadmap.plan60Day) : roadmap.plan60Day;
    let plan90Day = typeof roadmap.plan90Day === 'string' ? JSON.parse(roadmap.plan90Day) : roadmap.plan90Day;

    let taskFound = false;

    const updateTasks = (taskList) =>
      taskList.map((t) => {
        if (t.id === taskId) {
          taskFound = true;
          return { ...t, completed: typeof completed === 'boolean' ? completed : !t.completed };
        }
        return t;
      });

    plan30Day = updateTasks(plan30Day);
    plan60Day = updateTasks(plan60Day);
    plan90Day = updateTasks(plan90Day);

    if (!taskFound) {
      return res.status(404).json({
        success: false,
        message: `Task with ID ${taskId} not found in this roadmap.`,
      });
    }

    const allTasks = [...plan30Day, ...plan60Day, ...plan90Day];
    const completedCount = allTasks.filter((t) => t.completed).length;
    const overallProgress = allTasks.length > 0 ? Math.round((completedCount / allTasks.length) * 100) : 0;

    const updated = await prisma.learningRoadmap.update({
      where: { id },
      data: {
        plan30Day: JSON.stringify(plan30Day),
        plan60Day: JSON.stringify(plan60Day),
        plan90Day: JSON.stringify(plan90Day),
        overallProgress,
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        ...updated,
        plan30Day,
        plan60Day,
        plan90Day,
      },
      message: 'Task completion updated and persisted to PostgreSQL.',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a roadmap
 * @route DELETE /api/roadmap/:id
 */
export const deleteRoadmap = async (req, res, next) => {
  try {
    const { id } = req.params;

    const roadmap = await prisma.learningRoadmap.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: 'Roadmap not found or unauthorized access.',
      });
    }

    await prisma.learningRoadmap.delete({ where: { id } });

    return res.status(200).json({
      success: true,
      message: 'Roadmap deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};
