import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding CV Insight AI database with rich production-grade records...');

  // Hash demo password securely
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash('Password123!', salt);

  // Upsert demo user with hashed password
  const user = await prisma.user.upsert({
    where: { email: 'alex.morgan@cvinsight.ai' },
    update: {
      password: hashedPassword,
    },
    create: {
      email: 'alex.morgan@cvinsight.ai',
      password: hashedPassword,
      name: 'Alex Morgan',
      role: 'Staff Full-Stack Engineer',
      industry: 'SaaS & Enterprise Cloud',
      experienceLevel: 'Senior (6+ years)',
      bio: 'Architecting resilient cloud-native web applications, distributed systems, and real-time developer workflows.',
      targetScore: 92,
      dataRetentionDays: 90,
      retainRawText: true,
    },
  });

  // Clear existing resumes for clean state
  await prisma.resume.deleteMany({
    where: { userId: user.id },
  });

  // Seed sample resume 1 (High scoring candidate)
  const resume1 = await prisma.resume.create({
    data: {
      userId: user.id,
      title: 'Alex_Morgan_Staff_FullStack_2026.pdf',
      candidateName: 'Alex Morgan',
      fileName: 'Alex_Morgan_Staff_FullStack_2026.pdf',
      fileSize: 184320,
      fileType: 'application/pdf',
      rawText:
        'Alex Morgan - Staff Full-Stack Engineer with 7 years of deep experience in React, Node.js, TypeScript, PostgreSQL, Docker, Kubernetes, AWS, System Design, REST APIs, GraphQL, Microservices, CI/CD, and Redis. Spearheaded high-scale SaaS migration reducing latency by 42%. Architected distributed message queue processing 10M daily events. Mentored 8 junior and mid-level engineers.',
      status: 'analyzed',
      targetRole: 'Staff Full-Stack Engineer',
      targetIndustry: 'Cloud Infrastructure & SaaS',
      analyses: {
        create: {
          userId: user.id,
          overallScore: 91,
          atsScore: 94,
          keywordScore: 89,
          formatScore: 95,
          skillScore: 92,
          summary:
            'Exceptional technical alignment for Staff Full-Stack role. High density of impactful action verbs ("spearheaded", "architected", "mentored") paired with quantified outcome metrics (-42% latency, 10M daily events). Minimal ATS formatting friction.',
          strengths: [
            'Exemplary use of action verbs paired with quantifiable business outcomes (-42% latency, 10M events).',
            'Strong keyword alignment across modern full-stack web architectures (React, Node.js, Postgres, Kubernetes, AWS).',
            'ATS-friendly clean structural hierarchy compatible with Greenhouse, Workday, and Lever parsers.',
            'Clear leadership progression from individual contributor to engineering mentorship.',
          ],
          weaknesses: [
            'Observability and instrumentation tooling (e.g., Datadog, Prometheus, OpenTelemetry) not explicitly stated.',
            'Could emphasize cost optimization or cloud budget management achievements.',
            'Summary section could feature a concise 2-sentence executive value proposition.',
          ],
          missingKeywords: [
            'OpenTelemetry',
            'Datadog',
            'Terraform',
            'Kafka',
            'Security Compliance',
            'SOC2',
          ],
          recommendations: [
            'Incorporate cloud infrastructure-as-code proficiencies like Terraform into Technical Skills.',
            'Add telemetry/monitoring metrics (e.g., "Maintained 99.99% SLO across 15 microservices").',
            'Highlight cross-functional collaboration with product management and design leads.',
            'Keep bullet points concise with strong active phrasing in the top third of page 1.',
          ],
          rawAnalysisJson: JSON.stringify({
            jobMatchScore: 92,
            atsScore: 94,
            overallScore: 91,
            keywordCoverage: {
              percentage: 88,
              matchedKeywords: ['React', 'Node.js', 'PostgreSQL', 'Docker', 'Kubernetes', 'AWS', 'Redis', 'Microservices'],
              missingKeywords: ['OpenTelemetry', 'Datadog', 'Terraform', 'Kafka'],
            },
            bulletPointRewrites: [
              {
                original: 'Responsible for leading backend web development and managing cloud infrastructure.',
                improved: 'Architected and deployed high-concurrency microservices across AWS, improving system throughput by [quantify % increase] and maintaining 99.99% service uptime.',
                rationale: 'Converted passive "responsible for" phrasing into decisive action verbs with Google XYZ outcome framing.',
                impactBoost: '+32% Recruiter Engagement',
              },
              {
                original: 'Worked on database queries and optimized performance for client requests.',
                improved: 'Optimized PostgreSQL relational schemas and indexed query paths, slashing API response latency by [quantify % reduction] across high-volume endpoints.',
                rationale: 'Elevated technical specificity to highlight database engineering acumen without fabricating unverified credentials.',
                impactBoost: '+26% Recruiter Engagement',
              },
            ],
            recommendedLearningTopics: [
              {
                topic: 'Kubernetes Container Orchestration & Helm Deployments',
                category: 'Cloud Infrastructure',
                importance: 'High',
                estimatedStudyHours: '12-16 hrs',
                reason: 'Frequently required for Staff/Principal cloud-native backend roles.',
              },
              {
                topic: 'Infrastructure as Code (IaC) with Terraform & AWS',
                category: 'Cloud Automation',
                importance: 'High',
                estimatedStudyHours: '8-12 hrs',
                reason: 'Essential for automated multi-environment cloud reproducibility.',
              },
              {
                topic: 'Distributed Tracing with OpenTelemetry & Jaeger',
                category: 'Observability & SRE',
                importance: 'Medium',
                estimatedStudyHours: '6-8 hrs',
                reason: 'High-yield skill for verifying microservice SLO compliance.',
              },
            ],
            scoringCriteriaAndUncertainty: {
              generalAtsScoreExplanation: 'Evaluates format hygiene, header hierarchy, contact extraction, and layout parseability across Workday, Greenhouse, and Lever.',
              jobMatchScoreExplanation: 'Measures exact keyword and competency alignment between your resume and the specified target role / job description.',
              marginOfUncertainty: 'Estimated confidence: ±4% variance across disparate commercial ATS parsing configurations.',
              weights: {
                keywordAlignment: '35%',
                structureParseability: '25%',
                quantifiedImpact: '20%',
                grammarTone: '20%',
              },
            },
            aiEngine: 'Google Gemini 2.5 Flash',
          }),
        },
      },
    },
    include: {
      analyses: true,
    },
  });

  // Seed AnalysisHistory record
  if (resume1.analyses[0]) {
    await prisma.analysisHistory.create({
      data: {
        userId: user.id,
        resumeId: resume1.id,
        analysisId: resume1.analyses[0].id,
        score: resume1.analyses[0].overallScore,
        actionType: 'INITIAL_SCAN',
        notes: 'Initial high-index baseline scan against Staff Engineer requirements.',
      },
    });
  }

  // Seed sample resume 2
  const resume2 = await prisma.resume.create({
    data: {
      userId: user.id,
      title: 'Devon_Vance_Frontend_React_CV.pdf',
      candidateName: 'Devon Vance',
      fileName: 'Devon_Vance_Frontend_React_CV.pdf',
      fileSize: 142000,
      fileType: 'application/pdf',
      rawText:
        'Frontend Developer with 4 years building interfaces with React, JavaScript, CSS, HTML, Vite, and Git. Worked on multiple responsive dashboards and consumer-facing web apps. Focused on clean UI/UX and accessible components.',
      status: 'analyzed',
      targetRole: 'Senior Frontend Engineer',
      targetIndustry: 'Fintech & SaaS',
      analyses: {
        create: {
          userId: user.id,
          overallScore: 78,
          atsScore: 76,
          keywordScore: 74,
          formatScore: 84,
          skillScore: 80,
          summary:
            'Solid UI foundations and modern React component knowledge. To pass senior-level ATS filters, the resume needs stronger backend integration keywords, web performance metrics, and testing methodologies.',
          strengths: [
            'Clean presentation of modern front-end workflow (React, Vite, CSS, Git).',
            'Good attention to responsive design principles and accessible components.',
            'Concise role summaries without unnecessary clutter.',
          ],
          weaknesses: [
            'Lacks quantified performance outcomes (e.g., Core Web Vitals improvements, bundle reduction).',
            'Missing automated testing mentions (Jest, Vitest, Cypress, Playwright).',
            'Limited state management and API caching details (Redux Toolkit, TanStack Query).',
          ],
          missingKeywords: [
            'TypeScript',
            'Next.js',
            'Vitest',
            'Cypress',
            'State Management',
            'Web Vitals',
            'CI/CD',
          ],
          recommendations: [
            'Add concrete measurements of performance gains (e.g., "Reduced LCP by 35% through code splitting").',
            'Include end-to-end and unit testing tools to pass senior-level ATS queries.',
            'Specify API integration patterns (REST/GraphQL, optimistic updates).',
          ],
          rawAnalysisJson: JSON.stringify({
            jobMatchScore: 74,
            atsScore: 76,
            overallScore: 78,
            keywordCoverage: {
              percentage: 65,
              matchedKeywords: ['React', 'JavaScript', 'CSS', 'Vite', 'Git', 'UI/UX'],
              missingKeywords: ['TypeScript', 'Next.js', 'Vitest', 'Cypress', 'Web Vitals'],
            },
            bulletPointRewrites: [
              {
                original: 'Built UI screens with React and CSS.',
                improved: 'Engineered modular design system components in React and modern CSS, accelerating sprint delivery velocity by [quantify % increase].',
                rationale: 'Elevated technical authority and introduced measurable sprint velocity metrics.',
                impactBoost: '+28% Recruiter Engagement',
              },
            ],
            recommendedLearningTopics: [
              {
                topic: 'TypeScript Advanced Generics & Utility Types',
                category: 'Frontend Engineering',
                importance: 'High',
                estimatedStudyHours: '8-12 hrs',
                reason: 'Industry standard for modern scalable frontend applications.',
              },
            ],
            scoringCriteriaAndUncertainty: {
              generalAtsScoreExplanation: 'Evaluates format hygiene, header hierarchy, and layout parseability.',
              jobMatchScoreExplanation: 'Measures exact keyword and competency alignment.',
              marginOfUncertainty: 'Estimated confidence: ±4% variance across disparate commercial ATS parsing configurations.',
              weights: {
                keywordAlignment: '35%',
                structureParseability: '25%',
                quantifiedImpact: '20%',
                grammarTone: '20%',
              },
            },
            aiEngine: 'Google Gemini 2.5 Flash',
          }),
        },
      },
    },
    include: {
      analyses: true,
    },
  });

  if (resume2.analyses[0]) {
    await prisma.analysisHistory.create({
      data: {
        userId: user.id,
        resumeId: resume2.id,
        analysisId: resume2.analyses[0].id,
        score: resume2.analyses[0].overallScore,
        actionType: 'INITIAL_SCAN',
        notes: 'Initial scan for Senior Frontend role with identified testing gaps.',
      },
    });
  }

  console.log(`Demo user created: ${user.email} (Password: Password123!)`);
  console.log('Database schema and initial records seeded successfully.');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
