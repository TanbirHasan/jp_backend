import multer from 'multer';
import path from 'path';
import { AppError } from '../types';

function buildStorage(folder: string) {
  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, `uploads/${folder}`);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    },
  });
}

const RESUME_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const LOGO_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const resumeUpload = multer({
  storage: buildStorage('resumes'),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (RESUME_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError('Only PDF and Word documents are allowed', 400) as unknown as null, false);
    }
  },
});

export const logoUpload = multer({
  storage: buildStorage('logos'),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (_req, file, cb) => {
    if (LOGO_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError('Only JPG, PNG, and WebP images are allowed', 400) as unknown as null, false);
    }
  },
});
