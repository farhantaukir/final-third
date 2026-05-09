import multer from 'multer';
import streamifier from 'streamifier';
import cloudinary from '../config/cloudinary.config.js';

export const multerUpload = multer({ storage: multer.memoryStorage() });

export function uploadBufferToCloudinary(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: options.folder ?? 'final-third', resource_type: 'image' },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      },
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}
