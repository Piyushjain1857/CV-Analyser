import multer from 'multer';

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max
  },
  fileFilter: (req, file, cb) => {
    const allowed = /\.(pdf|docx|doc|txt)$/i;
    if (!file.originalname.match(allowed)) {
      return cb(
        new Error('Only PDF and DOCX documents up to 5 MB are supported.'),
        false
      );
    }
    cb(null, true);
  },
});

export const uploadResumeFile = (req, res, next) => {
  upload.single('resumeFile')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File size limit exceeded: Maximum allowed file size is 5 MB.',
        });
      }
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`,
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }
    next();
  });
};
