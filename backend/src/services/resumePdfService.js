import PDFDocument from 'pdfkit';

/**
 * Generate a clean, selectable-text vector PDF resume with accurate A4 dimensions
 * @param {Object} resumeData - Structured BuilderResume data
 * @param {Object} options - { template, fontFamily, fontSize, accentColor }
 * @returns {PDFKit.PDFDocument} - Streaming PDFDocument instance
 */
export function generateResumePdf(resumeData, options = {}) {
  const template = options.template || resumeData.template || 'modern-minimal';
  const fontFamilyChoice = options.fontFamily || resumeData.fontFamily || 'sans';
  const fontSizeChoice = options.fontSize || resumeData.fontSize || 'medium';
  const accentColor = options.accentColor || resumeData.accentColor || '#8B5CF6';

  // Font map based on standard PDFKit fonts (guaranteed selectable & embedded)
  const fontMap = {
    sans: {
      regular: 'Helvetica',
      bold: 'Helvetica-Bold',
      italic: 'Helvetica-Oblique',
    },
    serif: {
      regular: 'Times-Roman',
      bold: 'Times-Bold',
      italic: 'Times-Italic',
    },
    mono: {
      regular: 'Courier',
      bold: 'Courier-Bold',
      italic: 'Courier-Oblique',
    },
  };

  const fonts = fontMap[fontFamilyChoice] || fontMap.sans;

  // Spacing configurations
  const spacingConfig = {
    compact: {
      margin: 36,
      nameSize: 18,
      titleSize: 11,
      sectionTitleSize: 10,
      bodySize: 8.5,
      metaSize: 7.5,
      itemGap: 8,
      sectionGap: 12,
      bulletGap: 2,
    },
    medium: {
      margin: 44,
      nameSize: 20,
      titleSize: 12,
      sectionTitleSize: 11,
      bodySize: 9.5,
      metaSize: 8.5,
      itemGap: 10,
      sectionGap: 15,
      bulletGap: 3,
    },
    spacious: {
      margin: 50,
      nameSize: 22,
      titleSize: 13,
      sectionTitleSize: 12,
      bodySize: 10,
      metaSize: 9,
      itemGap: 12,
      sectionGap: 18,
      bulletGap: 4,
    },
  };

  const cfg = spacingConfig[fontSizeChoice] || spacingConfig.medium;

  // A4 Page setup: 595.28 x 841.89 points
  const doc = new PDFDocument({
    size: 'A4',
    margin: cfg.margin,
    bufferPages: true,
    info: {
      Title: `${resumeData.title || 'Resume'} - CV Insight AI`,
      Author: resumeData.personalInfo?.fullName || 'Applicant',
      Subject: 'Curriculum Vitae',
      Keywords: 'Resume, CV, ATS, Career',
    },
  });

  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const contentWidth = pageWidth - cfg.margin * 2;
  const bottomThreshold = pageHeight - cfg.margin - 25;

  const TEXT_DARK = '#0F172A';
  const TEXT_MUTED = '#475569';
  const TEXT_LIGHT = '#64748B';
  const BORDER_COLOR = '#CBD5E1';

  // Helper: check page break before drawing
  function ensureSpace(requiredHeight) {
    if (doc.y + requiredHeight > bottomThreshold) {
      doc.addPage();
    }
  }

  // Parse structured data safely
  const p = resumeData.personalInfo || {};
  const summary = resumeData.summary || '';
  const experiences = Array.isArray(resumeData.experiences) ? resumeData.experiences : [];
  const education = Array.isArray(resumeData.education) ? resumeData.education : [];
  const projects = Array.isArray(resumeData.projects) ? resumeData.projects : [];
  const skills = resumeData.skills || {};
  const certifications = Array.isArray(resumeData.certifications) ? resumeData.certifications : [];
  const achievements = Array.isArray(resumeData.achievements) ? resumeData.achievements : [];
  const links = Array.isArray(resumeData.links) ? resumeData.links : [];

  const sectionOrder = resumeData.sectionOrder || [
    'personal',
    'summary',
    'experience',
    'education',
    'projects',
    'skills',
    'certifications',
    'achievements',
    'links',
  ];

  // 1. Header Rendering based on Template
  if (template === 'classic-professional') {
    // Centered Classic Header
    doc.font(fonts.bold).fontSize(cfg.nameSize).fillColor(TEXT_DARK)
      .text(p.fullName || 'Applicant Name', { align: 'center' });

    if (p.targetTitle) {
      doc.font(fonts.regular).fontSize(cfg.titleSize).fillColor(accentColor)
        .text(p.targetTitle, { align: 'center' });
    }

    doc.moveDown(0.3);

    const contactItems = [
      p.email,
      p.phone,
      p.location,
      p.linkedin,
      p.github,
      p.portfolio,
    ].filter(Boolean);

    doc.font(fonts.regular).fontSize(cfg.metaSize).fillColor(TEXT_MUTED)
      .text(contactItems.join('  •  '), { align: 'center', width: contentWidth });

    doc.moveDown(0.5);
    doc.strokeColor(accentColor).lineWidth(1.5)
      .moveTo(cfg.margin, doc.y)
      .lineTo(pageWidth - cfg.margin, doc.y)
      .stroke();
    doc.moveDown(0.8);

  } else if (template === 'technical-developer') {
    // Technical Developer Header with Monospace/Tech layout
    doc.font(fonts.bold).fontSize(cfg.nameSize).fillColor(TEXT_DARK)
      .text(p.fullName || 'Applicant Name', cfg.margin, doc.y);

    if (p.targetTitle) {
      doc.font(fonts.regular).fontSize(cfg.titleSize).fillColor(accentColor)
        .text(`> ${p.targetTitle}`, cfg.margin);
    }

    doc.moveDown(0.3);

    const contactItems = [
      p.email ? `email: ${p.email}` : null,
      p.phone ? `tel: ${p.phone}` : null,
      p.location ? `loc: ${p.location}` : null,
      p.github ? `github: ${p.github}` : null,
      p.linkedin ? `linkedin: ${p.linkedin}` : null,
      p.portfolio ? `web: ${p.portfolio}` : null,
    ].filter(Boolean);

    doc.font(fonts.regular).fontSize(cfg.metaSize).fillColor(TEXT_MUTED)
      .text(contactItems.join('  |  '), cfg.margin, doc.y, { width: contentWidth });

    doc.moveDown(0.4);
    doc.strokeColor(BORDER_COLOR).lineWidth(0.75)
      .moveTo(cfg.margin, doc.y)
      .lineTo(pageWidth - cfg.margin, doc.y)
      .stroke();
    doc.moveDown(0.8);

  } else {
    // Modern Minimal Header (Default)
    doc.font(fonts.bold).fontSize(cfg.nameSize).fillColor(TEXT_DARK)
      .text(p.fullName || 'Applicant Name', cfg.margin, doc.y);

    if (p.targetTitle) {
      doc.font(fonts.bold).fontSize(cfg.titleSize).fillColor(accentColor)
        .text(p.targetTitle, cfg.margin);
    }

    doc.moveDown(0.25);

    const contactItems = [
      p.email,
      p.phone,
      p.location,
      p.linkedin,
      p.github,
      p.portfolio,
    ].filter(Boolean);

    doc.font(fonts.regular).fontSize(cfg.metaSize).fillColor(TEXT_MUTED)
      .text(contactItems.join('  •  '), cfg.margin, doc.y, { width: contentWidth });

    doc.moveDown(0.4);
    doc.strokeColor(accentColor).lineWidth(1)
      .moveTo(cfg.margin, doc.y)
      .lineTo(cfg.margin + 60, doc.y)
      .stroke();
    doc.moveDown(0.8);
  }

  // Section Header Renderer
  function renderSectionHeader(title) {
    ensureSpace(35);

    if (template === 'classic-professional') {
      doc.font(fonts.bold).fontSize(cfg.sectionTitleSize).fillColor(TEXT_DARK)
        .text(title.toUpperCase(), cfg.margin, doc.y, { characterSpacing: 1 });
      doc.strokeColor(BORDER_COLOR).lineWidth(0.75)
        .moveTo(cfg.margin, doc.y + 2)
        .lineTo(pageWidth - cfg.margin, doc.y + 2)
        .stroke();
      doc.y += 6;

    } else if (template === 'technical-developer') {
      doc.font(fonts.bold).fontSize(cfg.sectionTitleSize).fillColor(accentColor)
        .text(`// ${title.toUpperCase()}`, cfg.margin, doc.y, { characterSpacing: 0.5 });
      doc.strokeColor(BORDER_COLOR).lineWidth(0.5)
        .moveTo(cfg.margin, doc.y + 2)
        .lineTo(pageWidth - cfg.margin, doc.y + 2)
        .stroke();
      doc.y += 6;

    } else {
      // Modern Minimal
      doc.font(fonts.bold).fontSize(cfg.sectionTitleSize).fillColor(accentColor)
        .text(title.toUpperCase(), cfg.margin, doc.y, { characterSpacing: 0.8 });
      doc.strokeColor(BORDER_COLOR).lineWidth(0.5)
        .moveTo(cfg.margin, doc.y + 2)
        .lineTo(pageWidth - cfg.margin, doc.y + 2)
        .stroke();
      doc.y += 6;
    }
  }

  // Render Sections in specified order
  for (const sectionKey of sectionOrder) {
    if (sectionKey === 'summary' && summary.trim()) {
      renderSectionHeader('Professional Summary');
      ensureSpace(40);
      doc.font(fonts.regular).fontSize(cfg.bodySize).fillColor(TEXT_DARK)
        .text(summary, cfg.margin, doc.y, { width: contentWidth, lineGap: 1.5, align: 'justify' });
      doc.y += cfg.sectionGap;

    } else if (sectionKey === 'experience' && experiences.length > 0) {
      renderSectionHeader('Work Experience');

      experiences.forEach((exp) => {
        ensureSpace(45);
        // Header line: Title & Company on left, Dates & Location on right
        const leftX = cfg.margin;
        const rightWidth = 160;
        const leftWidth = contentWidth - rightWidth;
        const startY = doc.y;

        doc.font(fonts.bold).fontSize(cfg.bodySize).fillColor(TEXT_DARK)
          .text(exp.role || 'Role Title', leftX, startY, { width: leftWidth, continued: true });
        
        doc.font(fonts.regular).fillColor(TEXT_MUTED)
          .text(` — ${exp.company || 'Company'}`);

        const dateStr = [exp.startDate, exp.current ? 'Present' : exp.endDate].filter(Boolean).join(' - ');
        const locStr = exp.location ? ` | ${exp.location}` : '';
        doc.font(fonts.regular).fontSize(cfg.metaSize).fillColor(TEXT_LIGHT)
          .text(`${dateStr}${locStr}`, leftX + leftWidth, startY, { width: rightWidth, align: 'right' });

        doc.y += 4;

        // Bullets
        if (Array.isArray(exp.bullets) && exp.bullets.length > 0) {
          exp.bullets.forEach((bullet) => {
            if (!bullet || !bullet.trim()) return;
            ensureSpace(20);
            const bulletIndent = leftX + 10;
            const textWidth = contentWidth - 14;

            doc.font(fonts.regular).fontSize(cfg.bodySize).fillColor(accentColor)
              .text('•', leftX + 2, doc.y, { width: 8, continued: true });
            
            doc.font(fonts.regular).fillColor(TEXT_DARK)
              .text(`  ${bullet.trim()}`, bulletIndent, doc.y, { width: textWidth, lineGap: 1.5 });
            
            doc.y += cfg.bulletGap;
          });
        }

        doc.y += cfg.itemGap;
      });

      doc.y += cfg.sectionGap - cfg.itemGap;

    } else if (sectionKey === 'education' && education.length > 0) {
      renderSectionHeader('Education');

      education.forEach((edu) => {
        ensureSpace(35);
        const startY = doc.y;
        const rightWidth = 140;
        const leftWidth = contentWidth - rightWidth;

        doc.font(fonts.bold).fontSize(cfg.bodySize).fillColor(TEXT_DARK)
          .text(edu.degree || 'Degree / Credential', cfg.margin, startY, { width: leftWidth, continued: true });

        if (edu.school) {
          doc.font(fonts.regular).fillColor(TEXT_MUTED).text(` — ${edu.school}`);
        } else {
          doc.text('');
        }

        const dateStr = [edu.startDate, edu.endDate].filter(Boolean).join(' - ');
        if (dateStr) {
          doc.font(fonts.regular).fontSize(cfg.metaSize).fillColor(TEXT_LIGHT)
            .text(dateStr, cfg.margin + leftWidth, startY, { width: rightWidth, align: 'right' });
        }

        if (edu.honors || edu.gpa) {
          doc.font(fonts.italic).fontSize(cfg.metaSize).fillColor(TEXT_MUTED)
            .text([edu.gpa ? `GPA: ${edu.gpa}` : null, edu.honors].filter(Boolean).join(' • '), cfg.margin);
        }

        doc.y += cfg.itemGap;
      });

      doc.y += cfg.sectionGap - cfg.itemGap;

    } else if (sectionKey === 'projects' && projects.length > 0) {
      renderSectionHeader('Projects & Technical Initiatives');

      projects.forEach((proj) => {
        ensureSpace(40);
        const startY = doc.y;
        const rightWidth = 140;
        const leftWidth = contentWidth - rightWidth;

        doc.font(fonts.bold).fontSize(cfg.bodySize).fillColor(TEXT_DARK)
          .text(proj.name || 'Project Name', cfg.margin, startY, { width: leftWidth, continued: true });

        const techStr = Array.isArray(proj.techStack) ? proj.techStack.join(', ') : (proj.techStack || '');
        if (techStr) {
          doc.font(fonts.regular).fillColor(accentColor).text(` [${techStr}]`);
        } else {
          doc.text('');
        }

        if (proj.link) {
          doc.font(fonts.regular).fontSize(cfg.metaSize).fillColor(TEXT_LIGHT)
            .text(proj.link, cfg.margin + leftWidth, startY, { width: rightWidth, align: 'right' });
        }

        if (proj.description) {
          doc.font(fonts.regular).fontSize(cfg.bodySize).fillColor(TEXT_DARK)
            .text(proj.description, cfg.margin, doc.y, { width: contentWidth, lineGap: 1.5 });
        }

        if (Array.isArray(proj.bullets) && proj.bullets.length > 0) {
          proj.bullets.forEach((bullet) => {
            if (!bullet || !bullet.trim()) return;
            ensureSpace(18);
            doc.font(fonts.regular).fontSize(cfg.bodySize).fillColor(accentColor)
              .text('•', cfg.margin + 2, doc.y, { width: 8, continued: true });
            doc.font(fonts.regular).fillColor(TEXT_DARK)
              .text(`  ${bullet.trim()}`, cfg.margin + 10, doc.y, { width: contentWidth - 14, lineGap: 1.5 });
            doc.y += cfg.bulletGap;
          });
        }

        doc.y += cfg.itemGap;
      });

      doc.y += cfg.sectionGap - cfg.itemGap;

    } else if (sectionKey === 'skills' && Object.keys(skills).length > 0) {
      renderSectionHeader('Technical Skills & Competencies');
      ensureSpace(40);

      const skillCategories = [
        { label: 'Languages', items: skills.languages },
        { label: 'Frameworks & Libraries', items: skills.frameworks },
        { label: 'Databases & Storage', items: skills.databases },
        { label: 'Cloud, DevOps & Tools', items: skills.tools },
        { label: 'Methodologies & Other', items: skills.other },
      ];

      skillCategories.forEach((cat) => {
        const itemStr = Array.isArray(cat.items) ? cat.items.join(', ') : (cat.items || '');
        if (!itemStr.trim()) return;

        ensureSpace(18);
        doc.font(fonts.bold).fontSize(cfg.bodySize).fillColor(TEXT_DARK)
          .text(`${cat.label}: `, cfg.margin, doc.y, { continued: true });
        doc.font(fonts.regular).fillColor(TEXT_MUTED)
          .text(itemStr, { width: contentWidth, lineGap: 1.5 });
        doc.y += 3;
      });

      doc.y += cfg.sectionGap;

    } else if (sectionKey === 'certifications' && certifications.length > 0) {
      renderSectionHeader('Certifications & Credentials');

      certifications.forEach((cert) => {
        ensureSpace(25);
        doc.font(fonts.bold).fontSize(cfg.bodySize).fillColor(TEXT_DARK)
          .text(cert.name || 'Certification', cfg.margin, doc.y, { continued: true });

        const metaParts = [cert.issuer, cert.date].filter(Boolean);
        if (metaParts.length > 0) {
          doc.font(fonts.regular).fillColor(TEXT_MUTED).text(` — ${metaParts.join(' • ')}`);
        } else {
          doc.text('');
        }
        doc.y += 3;
      });

      doc.y += cfg.sectionGap;

    } else if (sectionKey === 'achievements' && achievements.length > 0) {
      renderSectionHeader('Honors & Key Achievements');

      achievements.forEach((ach) => {
        ensureSpace(25);
        doc.font(fonts.bold).fontSize(cfg.bodySize).fillColor(TEXT_DARK)
          .text(ach.title || 'Achievement', cfg.margin, doc.y, { continued: Boolean(ach.description) });

        if (ach.description) {
          doc.font(fonts.regular).fillColor(TEXT_MUTED).text(`: ${ach.description}`);
        } else {
          doc.text('');
        }
        doc.y += 3;
      });

      doc.y += cfg.sectionGap;

    } else if (sectionKey === 'links' && links.length > 0) {
      renderSectionHeader('Links & Portfolio');

      const linksStr = links.map((l) => `${l.label || 'Link'}: ${l.url}`).join('   •   ');
      doc.font(fonts.regular).fontSize(cfg.metaSize).fillColor(accentColor)
        .text(linksStr, cfg.margin, doc.y, { width: contentWidth });

      doc.y += cfg.sectionGap;
    }
  }

  // Page numbers on all pages
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    doc.font(fonts.regular).fontSize(7.5).fillColor(TEXT_LIGHT)
      .text(
        `Generated via CV Insight AI   •   Page ${i + 1} of ${range.count}`,
        cfg.margin,
        pageHeight - 22,
        { width: contentWidth, align: 'center' }
      );
  }

  return doc;
}
