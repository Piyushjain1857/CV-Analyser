import prisma from '../config/db.js';
import { generateResumePdf } from '../services/resumePdfService.js';
import {
  improveResumeTextWithGemini,
  optimizeResumeForJobWithGemini,
} from '../services/geminiService.js';

// Safe JSON parser helper
function safeJsonParse(jsonString, fallback = null) {
  if (!jsonString) return fallback;
  if (typeof jsonString === 'object') return jsonString;
  try {
    return JSON.parse(jsonString);
  } catch {
    return fallback;
  }
}

// Format resume record for API response
function formatResumeRecord(r) {
  return {
    id: r.id,
    userId: r.userId,
    title: r.title,
    template: r.template || 'modern-minimal',
    fontFamily: r.fontFamily || 'sans',
    fontSize: r.fontSize || 'medium',
    accentColor: r.accentColor || '#8B5CF6',
    sectionOrder: r.sectionOrder || [
      'personal',
      'summary',
      'experience',
      'education',
      'projects',
      'skills',
      'certifications',
      'achievements',
      'links',
    ],
    personalInfo: safeJsonParse(r.personalInfo, {
      fullName: '',
      targetTitle: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      github: '',
      portfolio: '',
    }),
    summary: r.summary || '',
    experiences: safeJsonParse(r.experiences, []),
    education: safeJsonParse(r.education, []),
    projects: safeJsonParse(r.projects, []),
    skills: safeJsonParse(r.skills, {
      languages: [],
      frameworks: [],
      databases: [],
      tools: [],
      other: [],
    }),
    certifications: safeJsonParse(r.certifications, []),
    achievements: safeJsonParse(r.achievements, []),
    links: safeJsonParse(r.links, []),
    targetJobTitle: r.targetJobTitle || '',
    targetJobDesc: r.targetJobDesc || '',
    targetMatchScore: r.targetMatchScore,
    versionName: r.versionName || 'v1.0',
    isDraft: r.isDraft,
    parentId: r.parentId,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

/**
 * List all builder resumes for authenticated user
 */
export async function listBuilderResumes(req, res) {
  try {
    const resumes = await prisma.builderResume.findMany({
      where: { userId: req.user.id },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        template: true,
        fontFamily: true,
        fontSize: true,
        accentColor: true,
        versionName: true,
        isDraft: true,
        targetJobTitle: true,
        updatedAt: true,
        createdAt: true,
      },
    });

    res.json({
      success: true,
      data: resumes,
    });
  } catch (error) {
    console.error('listBuilderResumes error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve builder resumes' });
  }
}

/**
 * Get single builder resume with full content
 */
export async function getBuilderResume(req, res) {
  try {
    const { id } = req.params;
    const resume = await prisma.builderResume.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    res.json({
      success: true,
      data: formatResumeRecord(resume),
    });
  } catch (error) {
    console.error('getBuilderResume error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve resume' });
  }
}

/**
 * Create a new blank builder resume
 */
export async function createBuilderResume(req, res) {
  try {
    const user = req.user;
    const { title, template, targetTitle } = req.body;

    const defaultPersonalInfo = {
      fullName: user.name || 'Applicant',
      targetTitle: targetTitle || user.role || 'Staff Full-Stack Engineer',
      email: user.email || '',
      phone: '',
      location: 'San Francisco, CA',
      linkedin: '',
      github: '',
      portfolio: '',
    };

    const newResume = await prisma.builderResume.create({
      data: {
        userId: user.id,
        title: title || 'Untitled Resume',
        template: template || 'modern-minimal',
        fontFamily: 'sans',
        fontSize: 'medium',
        accentColor: '#8B5CF6',
        sectionOrder: [
          'personal',
          'summary',
          'experience',
          'education',
          'projects',
          'skills',
          'certifications',
          'achievements',
          'links',
        ],
        personalInfo: JSON.stringify(defaultPersonalInfo),
        summary: 'Accomplished engineering professional with a track record of architecting scalable applications and driving system reliability.',
        experiences: JSON.stringify([
          {
            id: 'exp-1',
            role: user.role || 'Senior Software Engineer',
            company: 'Tech Enterprise Corp',
            location: 'San Francisco, CA',
            startDate: '2022',
            endDate: '',
            current: true,
            bullets: [
              'Architected distributed microservices handling high transaction volumes with 99.99% uptime.',
              'Spearheaded database query optimization and caching strategies, reducing latency by 35%.',
            ],
          },
        ]),
        education: JSON.stringify([
          {
            id: 'edu-1',
            school: 'University of Technology',
            degree: 'Bachelor of Science in Computer Science',
            field: 'Computer Science',
            startDate: '2016',
            endDate: '2020',
            gpa: '',
            honors: 'Graduated with Honors',
          },
        ]),
        projects: JSON.stringify([]),
        skills: JSON.stringify({
          languages: ['JavaScript', 'TypeScript', 'Node.js', 'SQL'],
          frameworks: ['React', 'Express.js', 'Vite', 'Next.js'],
          databases: ['PostgreSQL', 'Redis'],
          tools: ['Docker', 'AWS', 'Git', 'CI/CD'],
          other: ['System Design', 'REST APIs', 'Agile'],
        }),
        certifications: JSON.stringify([]),
        achievements: JSON.stringify([]),
        links: JSON.stringify([]),
        versionName: 'v1.0 (Initial)',
      },
    });

    // Save initial version snapshot
    await prisma.resumeVersion.create({
      data: {
        builderResumeId: newResume.id,
        versionName: 'v1.0 (Initial)',
        contentSnapshot: JSON.stringify(formatResumeRecord(newResume)),
      },
    });

    res.status(201).json({
      success: true,
      data: formatResumeRecord(newResume),
      message: 'Resume created successfully',
    });
  } catch (error) {
    console.error('createBuilderResume error:', error);
    res.status(500).json({ success: false, message: 'Failed to create resume' });
  }
}

/**
 * Import and pre-populate builder resume from an existing uploaded resume / analysis
 */
export async function importFromUploadedResume(req, res) {
  try {
    const { resumeId } = req.params;
    const user = req.user;

    const resumeRecord = await prisma.resume.findFirst({
      where: { id: resumeId, userId: user.id },
      include: {
        analyses: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!resumeRecord) {
      return res.status(404).json({ success: false, message: 'Uploaded resume not found' });
    }

    const latestAnalysis = resumeRecord.analyses?.[0] || {};
    const rawAnalysis = safeJsonParse(latestAnalysis.rawAnalysisJson, {});
    const factual = rawAnalysis.factualExtraction || {};
    const contact = factual.contactInformation || {};

    const personalInfo = {
      fullName: resumeRecord.candidateName || contact.name || user.name || 'Applicant',
      targetTitle: resumeRecord.targetRole || contact.title || user.role || 'Software Engineer',
      email: contact.email || user.email || '',
      phone: contact.phone || '',
      location: contact.location || 'Remote',
      linkedin: contact.linkedin || '',
      github: contact.github || '',
      portfolio: contact.portfolio || '',
    };

    // Extract work experiences
    const experiences = (factual.workExperience || []).map((exp, idx) => ({
      id: `exp-${Date.now()}-${idx}`,
      role: exp.role || exp.title || 'Software Engineer',
      company: exp.company || 'Company',
      location: exp.location || '',
      startDate: exp.startDate || exp.period?.split('-')?.[0]?.trim() || '',
      endDate: exp.endDate || exp.period?.split('-')?.[1]?.trim() || '',
      current: exp.current || exp.period?.toLowerCase()?.includes('present') || false,
      bullets: Array.isArray(exp.bullets) && exp.bullets.length > 0
        ? exp.bullets
        : ['Delivered core product features and maintained architectural hygiene.'],
    }));

    // If no work experiences extracted, provide a starter
    if (experiences.length === 0) {
      experiences.push({
        id: `exp-${Date.now()}-0`,
        role: resumeRecord.targetRole || 'Software Professional',
        company: 'Software Enterprise',
        location: '',
        startDate: '2021',
        endDate: '',
        current: true,
        bullets: ['Spearheaded scalable feature delivery and system architecture enhancements.'],
      });
    }

    // Extract education
    const education = (factual.education || []).map((edu, idx) => ({
      id: `edu-${Date.now()}-${idx}`,
      school: edu.school || edu.institution || 'University',
      degree: edu.degree || 'Bachelor of Science',
      field: edu.field || 'Computer Science',
      startDate: edu.startDate || '',
      endDate: edu.endDate || edu.year || '',
      gpa: edu.gpa || '',
      honors: edu.honors || '',
    }));

    // Extract technical skills
    const extractedSkills = rawAnalysis.skillsAndKeywords?.technicalSkills || [];
    const skills = {
      languages: extractedSkills.slice(0, 6),
      frameworks: extractedSkills.slice(6, 12),
      databases: extractedSkills.filter((s) => /sql|mongo|redis|database|dynamo/i.test(s)),
      tools: extractedSkills.filter((s) => /docker|k8s|kubernetes|aws|git|ci|cloud/i.test(s)),
      other: extractedSkills.slice(12, 18),
    };

    const newResume = await prisma.builderResume.create({
      data: {
        userId: user.id,
        title: `${resumeRecord.title || resumeRecord.candidateName} (Builder)`,
        template: 'modern-minimal',
        fontFamily: 'sans',
        fontSize: 'medium',
        accentColor: '#8B5CF6',
        sectionOrder: [
          'personal',
          'summary',
          'experience',
          'education',
          'projects',
          'skills',
          'certifications',
          'achievements',
          'links',
        ],
        personalInfo: JSON.stringify(personalInfo),
        summary: latestAnalysis.summary || rawAnalysis.executiveSummary || 'Results-oriented technical leader with expertise in building scalable, production-grade systems.',
        experiences: JSON.stringify(experiences),
        education: JSON.stringify(education),
        projects: JSON.stringify([]),
        skills: JSON.stringify(skills),
        certifications: JSON.stringify([]),
        achievements: JSON.stringify([]),
        links: JSON.stringify([]),
        versionName: 'v1.0 (Imported)',
      },
    });

    // Save initial version snapshot
    await prisma.resumeVersion.create({
      data: {
        builderResumeId: newResume.id,
        versionName: 'v1.0 (Imported)',
        contentSnapshot: JSON.stringify(formatResumeRecord(newResume)),
      },
    });

    res.status(201).json({
      success: true,
      data: formatResumeRecord(newResume),
      message: `Successfully imported content from "${resumeRecord.title}"`,
    });
  } catch (error) {
    console.error('importFromUploadedResume error:', error);
    res.status(500).json({ success: false, message: 'Failed to import resume content' });
  }
}

/**
 * Update full builder resume
 */
export async function updateBuilderResume(req, res) {
  try {
    const { id } = req.params;
    const body = req.body;

    const existing = await prisma.builderResume.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    const updateData = {};
    if (body.title !== undefined) updateData.title = String(body.title).trim();
    if (body.template !== undefined) updateData.template = body.template;
    if (body.fontFamily !== undefined) updateData.fontFamily = body.fontFamily;
    if (body.fontSize !== undefined) updateData.fontSize = body.fontSize;
    if (body.accentColor !== undefined) updateData.accentColor = body.accentColor;
    if (Array.isArray(body.sectionOrder)) updateData.sectionOrder = body.sectionOrder;

    if (body.personalInfo !== undefined) updateData.personalInfo = JSON.stringify(body.personalInfo);
    if (body.summary !== undefined) updateData.summary = String(body.summary);
    if (body.experiences !== undefined) updateData.experiences = JSON.stringify(body.experiences);
    if (body.education !== undefined) updateData.education = JSON.stringify(body.education);
    if (body.projects !== undefined) updateData.projects = JSON.stringify(body.projects);
    if (body.skills !== undefined) updateData.skills = JSON.stringify(body.skills);
    if (body.certifications !== undefined) updateData.certifications = JSON.stringify(body.certifications);
    if (body.achievements !== undefined) updateData.achievements = JSON.stringify(body.achievements);
    if (body.links !== undefined) updateData.links = JSON.stringify(body.links);

    if (body.targetJobTitle !== undefined) updateData.targetJobTitle = body.targetJobTitle;
    if (body.targetJobDesc !== undefined) updateData.targetJobDesc = body.targetJobDesc;
    if (body.targetMatchScore !== undefined) updateData.targetMatchScore = body.targetMatchScore;

    updateData.isDraft = false;

    const updated = await prisma.builderResume.update({
      where: { id },
      data: updateData,
    });

    res.json({
      success: true,
      data: formatResumeRecord(updated),
      message: 'Resume saved successfully',
    });
  } catch (error) {
    console.error('updateBuilderResume error:', error);
    res.status(500).json({ success: false, message: 'Failed to update resume' });
  }
}

/**
 * Debounced Autosave Endpoint
 */
export async function autosaveBuilderResume(req, res) {
  try {
    const { id } = req.params;
    const body = req.body;

    const existing = await prisma.builderResume.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    const updateData = { isDraft: true };
    if (body.title !== undefined) updateData.title = String(body.title).trim();
    if (body.template !== undefined) updateData.template = body.template;
    if (body.fontFamily !== undefined) updateData.fontFamily = body.fontFamily;
    if (body.fontSize !== undefined) updateData.fontSize = body.fontSize;
    if (body.accentColor !== undefined) updateData.accentColor = body.accentColor;
    if (Array.isArray(body.sectionOrder)) updateData.sectionOrder = body.sectionOrder;

    if (body.personalInfo !== undefined) updateData.personalInfo = JSON.stringify(body.personalInfo);
    if (body.summary !== undefined) updateData.summary = String(body.summary);
    if (body.experiences !== undefined) updateData.experiences = JSON.stringify(body.experiences);
    if (body.education !== undefined) updateData.education = JSON.stringify(body.education);
    if (body.projects !== undefined) updateData.projects = JSON.stringify(body.projects);
    if (body.skills !== undefined) updateData.skills = JSON.stringify(body.skills);
    if (body.certifications !== undefined) updateData.certifications = JSON.stringify(body.certifications);
    if (body.achievements !== undefined) updateData.achievements = JSON.stringify(body.achievements);
    if (body.links !== undefined) updateData.links = JSON.stringify(body.links);

    const updated = await prisma.builderResume.update({
      where: { id },
      data: updateData,
    });

    res.json({
      success: true,
      data: {
        id: updated.id,
        updatedAt: updated.updatedAt,
        isDraft: true,
      },
      message: 'Draft autosaved',
    });
  } catch (error) {
    console.error('autosaveBuilderResume error:', error);
    res.status(500).json({ success: false, message: 'Autosave failed' });
  }
}

/**
 * Duplicate a resume
 */
export async function duplicateBuilderResume(req, res) {
  try {
    const { id } = req.params;
    const existing = await prisma.builderResume.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    const cloned = await prisma.builderResume.create({
      data: {
        userId: req.user.id,
        title: `${existing.title} (Copy)`,
        template: existing.template,
        fontFamily: existing.fontFamily,
        fontSize: existing.fontSize,
        accentColor: existing.accentColor,
        sectionOrder: existing.sectionOrder,
        personalInfo: existing.personalInfo,
        summary: existing.summary,
        experiences: existing.experiences,
        education: existing.education,
        projects: existing.projects,
        skills: existing.skills,
        certifications: existing.certifications,
        achievements: existing.achievements,
        links: existing.links,
        targetJobTitle: existing.targetJobTitle,
        targetJobDesc: existing.targetJobDesc,
        targetMatchScore: existing.targetMatchScore,
        versionName: 'v1.0 (Duplicated)',
        parentId: existing.id,
      },
    });

    await prisma.resumeVersion.create({
      data: {
        builderResumeId: cloned.id,
        versionName: 'v1.0 (Duplicated)',
        contentSnapshot: JSON.stringify(formatResumeRecord(cloned)),
      },
    });

    res.status(201).json({
      success: true,
      data: formatResumeRecord(cloned),
      message: `Duplicated as "${cloned.title}"`,
    });
  } catch (error) {
    console.error('duplicateBuilderResume error:', error);
    res.status(500).json({ success: false, message: 'Failed to duplicate resume' });
  }
}

/**
 * Delete a builder resume
 */
export async function deleteBuilderResume(req, res) {
  try {
    const { id } = req.params;
    const existing = await prisma.builderResume.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    await prisma.builderResume.delete({ where: { id } });

    res.json({
      success: true,
      message: 'Resume deleted successfully',
    });
  } catch (error) {
    console.error('deleteBuilderResume error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete resume' });
  }
}

/**
 * Save a named version snapshot
 */
export async function saveVersionSnapshot(req, res) {
  try {
    const { id } = req.params;
    const { versionName } = req.body;

    const resume = await prisma.builderResume.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    const versionLabel = (versionName || '').trim() || `Version ${new Date().toLocaleDateString()}`;
    const snapshot = JSON.stringify(formatResumeRecord(resume));

    const versionRecord = await prisma.resumeVersion.create({
      data: {
        builderResumeId: id,
        versionName: versionLabel,
        contentSnapshot: snapshot,
      },
    });

    await prisma.builderResume.update({
      where: { id },
      data: { versionName: versionLabel, isDraft: false },
    });

    res.status(201).json({
      success: true,
      data: {
        id: versionRecord.id,
        versionName: versionRecord.versionName,
        createdAt: versionRecord.createdAt,
      },
      message: `Snapshot "${versionLabel}" saved`,
    });
  } catch (error) {
    console.error('saveVersionSnapshot error:', error);
    res.status(500).json({ success: false, message: 'Failed to save version snapshot' });
  }
}

/**
 * List all saved versions for a resume
 */
export async function listVersions(req, res) {
  try {
    const { id } = req.params;

    const resume = await prisma.builderResume.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    const versions = await prisma.resumeVersion.findMany({
      where: { builderResumeId: id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        versionName: true,
        createdAt: true,
      },
    });

    res.json({
      success: true,
      data: versions,
    });
  } catch (error) {
    console.error('listVersions error:', error);
    res.status(500).json({ success: false, message: 'Failed to list versions' });
  }
}

/**
 * Restore content from a previous version snapshot
 */
export async function restoreVersion(req, res) {
  try {
    const { id, versionId } = req.params;

    const resume = await prisma.builderResume.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    const version = await prisma.resumeVersion.findFirst({
      where: { id: versionId, builderResumeId: id },
    });

    if (!version) {
      return res.status(404).json({ success: false, message: 'Version snapshot not found' });
    }

    const snapshot = safeJsonParse(version.contentSnapshot, {});

    const updated = await prisma.builderResume.update({
      where: { id },
      data: {
        template: snapshot.template || resume.template,
        fontFamily: snapshot.fontFamily || resume.fontFamily,
        fontSize: snapshot.fontSize || resume.fontSize,
        accentColor: snapshot.accentColor || resume.accentColor,
        sectionOrder: snapshot.sectionOrder || resume.sectionOrder,
        personalInfo: JSON.stringify(snapshot.personalInfo || {}),
        summary: snapshot.summary || '',
        experiences: JSON.stringify(snapshot.experiences || []),
        education: JSON.stringify(snapshot.education || []),
        projects: JSON.stringify(snapshot.projects || []),
        skills: JSON.stringify(snapshot.skills || {}),
        certifications: JSON.stringify(snapshot.certifications || []),
        achievements: JSON.stringify(snapshot.achievements || []),
        links: JSON.stringify(snapshot.links || []),
        versionName: `Restored (${version.versionName})`,
        isDraft: false,
      },
    });

    res.json({
      success: true,
      data: formatResumeRecord(updated),
      message: `Restored version "${version.versionName}"`,
    });
  } catch (error) {
    console.error('restoreVersion error:', error);
    res.status(500).json({ success: false, message: 'Failed to restore version' });
  }
}

/**
 * AI Writing Assistant: Improve summary, bullet, project, or wording
 */
export async function improveText(req, res) {
  try {
    const { type, content, context } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Content is required for AI improvement' });
    }

    const result = await improveResumeTextWithGemini({
      type: type || 'bullet',
      content,
      context: context || {},
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('improveText error:', error);
    res.status(500).json({ success: false, message: error.message || 'AI writing assistance failed' });
  }
}

/**
 * Targeted Resume Optimization against a Job Description
 */
export async function optimizeForJob(req, res) {
  try {
    const { resumeContent, jobDescription } = req.body;

    if (!jobDescription || jobDescription.trim().length < 20) {
      return res.status(400).json({ success: false, message: 'A valid job description is required' });
    }

    const result = await optimizeResumeForJobWithGemini({
      resumeContent: resumeContent || {},
      jobDescription,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('optimizeForJob error:', error);
    res.status(500).json({ success: false, message: error.message || 'Targeted optimization failed' });
  }
}

/**
 * Export clean selectable-text vector PDF
 */
export async function exportPdf(req, res) {
  try {
    const { id } = req.params;
    const { template, fontFamily, fontSize, accentColor } = req.query;

    const resume = await prisma.builderResume.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    const formattedData = formatResumeRecord(resume);
    const pdfDoc = generateResumePdf(formattedData, {
      template,
      fontFamily,
      fontSize,
      accentColor,
    });

    const cleanName = (formattedData.personalInfo?.fullName || 'Resume')
      .replace(/[^a-zA-Z0-9_-]/g, '_');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${cleanName}_CV.pdf"`);

    pdfDoc.pipe(res);
    pdfDoc.end();
  } catch (error) {
    console.error('exportPdf error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate PDF resume' });
  }
}
