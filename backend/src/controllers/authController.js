import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';
import { signTokenAndCookie } from '../middleware/auth.js';

/**
 * Validate email format
 */
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/**
 * @desc    Register new user
 * @route   POST /api/auth/signup
 * @access  Public
 */
export const signup = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role = 'Senior Full-Stack Developer',
      industry = 'Software & SaaS',
      experienceLevel = 'Senior (5-8 yrs)',
    } = req.body;

    // Input Validations
    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Full name is required (minimum 2 characters).',
      });
    }

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    // Check duplicate
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please log in.',
      });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: role.trim(),
        industry: industry.trim(),
        experienceLevel,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        industry: true,
        experienceLevel: true,
        avatarUrl: true,
        bio: true,
        targetScore: true,
        dataRetentionDays: true,
        retainRawText: true,
        createdAt: true,
      },
    });

    // Sign JWT & set secure HTTP-only cookie
    const token = signTokenAndCookie(res, user);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      user,
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get session
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Safe user projection
    const userProfile = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      industry: user.industry,
      experienceLevel: user.experienceLevel,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      targetScore: user.targetScore,
      dataRetentionDays: user.dataRetentionDays,
      retainRawText: user.retainRawText,
      createdAt: user.createdAt,
    };

    // Sign JWT & set HTTP-only cookie
    const token = signTokenAndCookie(res, userProfile);

    res.json({
      success: true,
      message: 'Login successful.',
      user: userProfile,
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Clear session & logout user
 * @route   POST /api/auth/logout
 * @access  Public
 */
export const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
  });

  res.json({
    success: true,
    message: 'Logged out successfully.',
  });
};

/**
 * @desc    Restore current session
 * @route   GET /api/auth/me
 * @access  Protected
 */
export const getMe = (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
};

/**
 * @desc    Change user password securely
 * @route   POST /api/auth/change-password
 * @access  Protected
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password does not match.',
      });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword },
    });

    res.json({
      success: true,
      message: 'Password updated successfully. Please use your new password next time.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update privacy & retention settings
 * @route   POST /api/auth/privacy-settings
 * @access  Protected
 */
export const updatePrivacySettings = async (req, res, next) => {
  try {
    const { dataRetentionDays, retainRawText } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(typeof dataRetentionDays === 'number' ? { dataRetentionDays } : {}),
        ...(typeof retainRawText === 'boolean' ? { retainRawText } : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        dataRetentionDays: true,
        retainRawText: true,
      },
    });

    res.json({
      success: true,
      message: 'Privacy settings updated successfully.',
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Export all user account data (GDPR-compliant archive)
 * @route   GET /api/auth/export-data
 * @access  Protected
 */
export const exportUserData = async (req, res, next) => {
  try {
    const userData = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        industry: true,
        experienceLevel: true,
        bio: true,
        targetScore: true,
        dataRetentionDays: true,
        retainRawText: true,
        createdAt: true,
        updatedAt: true,
        resumes: {
          select: {
            id: true,
            title: true,
            candidateName: true,
            fileName: true,
            fileSize: true,
            targetRole: true,
            targetIndustry: true,
            createdAt: true,
            analyses: {
              select: {
                id: true,
                overallScore: true,
                atsScore: true,
                keywordScore: true,
                formatScore: true,
                skillScore: true,
                summary: true,
                strengths: true,
                weaknesses: true,
                missingKeywords: true,
                recommendations: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="cv_insight_export_${req.user.id.substring(0, 8)}.json"`);
    res.send(JSON.stringify(userData, null, 2));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Permanently delete account and all associated documents & analyses
 * @route   DELETE /api/auth/delete-account
 * @access  Protected
 */
export const deleteAccount = async (req, res, next) => {
  try {
    const { confirmEmail } = req.body;

    if (!confirmEmail || confirmEmail.toLowerCase().trim() !== req.user.email.toLowerCase().trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please confirm account deletion by entering your exact email address.',
      });
    }

    // Cascade deletes all resumes, analyses, and history via Prisma relations
    await prisma.user.delete({
      where: { id: req.user.id },
    });

    // Clear authentication cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
    });

    res.json({
      success: true,
      message: 'Your account and all associated resumes and analyses have been permanently purged from the database.',
    });
  } catch (error) {
    next(error);
  }
};
