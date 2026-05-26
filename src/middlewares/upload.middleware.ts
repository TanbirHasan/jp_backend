import multer from 'multer';
import { AppError } from '../types';

const RESUME_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const LOGO_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Resumes go to memory — uploaded to Cloudinary in the controller
export const resumeUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (RESUME_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError('Only PDF and Word documents are allowed', 400) as unknown as null, false);
    }
  },
});

// Logos go to memory — uploaded to Cloudinary in the controller
export const logoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (_req, file, cb) => {
    if (LOGO_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError('Only JPG, PNG, and WebP images are allowed', 400) as unknown as null, false);
    }
  },
});
