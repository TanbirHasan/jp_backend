import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import path from 'path';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export function uploadResumeToCloudinary(buffer: Buffer, originalName: string): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const ext = path.extname(originalName).slice(1) || 'pdf';
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'resumes',
        resource_type: 'raw',
        public_id: `${Date.now()}-${path.parse(originalName).name}`,
        format: ext,
      },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error('Cloudinary upload failed'));
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

export function uploadLogoToCloudinary(buffer: Buffer, originalName: string): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'logos',
        resource_type: 'image',
        public_id: `${Date.now()}-${path.parse(originalName).name}`,
      },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error('Cloudinary upload failed'));
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}
