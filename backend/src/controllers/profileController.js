import prisma from '../config/db.js';

export const getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
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
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, role, industry, experienceLevel, bio, targetScore } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name && { name: name.trim() }),
        ...(role && { role: role.trim() }),
        ...(industry && { industry: industry.trim() }),
        ...(experienceLevel && { experienceLevel }),
        ...(bio !== undefined && { bio }),
        ...(targetScore && { targetScore: Number(targetScore) }),
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
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};
