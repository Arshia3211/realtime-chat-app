import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

// Local fallback (development only): files go to server/uploads and are served
// at /uploads. Stored ids are prefixed so they're never sent to Cloudinary.
export const UPLOADS_DIR = path.resolve(import.meta.dirname, '../../uploads');
const LOCAL_PREFIX = 'local:';

export const useLocalStorage = !isCloudinaryConfigured && !env.isProduction;

if (!isCloudinaryConfigured) {
  console.warn(
    env.isProduction
      ? '[storage] Cloudinary is not configured — uploads are disabled'
      : '[storage] Cloudinary not configured — saving uploads to server/uploads (development only)',
  );
}

const uploadToCloudinary = (buffer, { folder, transformation }) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: `realtime-chat/${folder}`, resource_type: 'image', transformation }, (error, result) =>
        error ? reject(error) : resolve({ url: result.secure_url, publicId: result.public_id }),
      )
      .end(buffer);
  });

const uploadToLocalDisk = async (buffer, { folder, ext }) => {
  const dir = path.join(UPLOADS_DIR, folder);
  await fs.mkdir(dir, { recursive: true });
  const fileName = `${crypto.randomUUID()}.${ext}`;
  await fs.writeFile(path.join(dir, fileName), buffer);
  const relativePath = `${folder}/${fileName}`;
  return { url: `${env.serverUrl}/uploads/${relativePath}`, publicId: `${LOCAL_PREFIX}${relativePath}` };
};

// Stores a validated image. Returns { url, publicId }.
export const uploadImage = async (buffer, { folder, ext, transformation }) => {
  if (useLocalStorage) return uploadToLocalDisk(buffer, { folder, ext });
  if (!isCloudinaryConfigured) {
    throw new ApiError(503, 'File uploads are not configured on this server');
  }
  return uploadToCloudinary(buffer, { folder, transformation });
};

// Best-effort delete; a failure only leaves an orphaned file behind.
export const deleteImage = async (publicId) => {
  if (!publicId) return;
  try {
    if (publicId.startsWith(LOCAL_PREFIX)) {
      const filePath = path.resolve(UPLOADS_DIR, publicId.slice(LOCAL_PREFIX.length));
      if (filePath.startsWith(UPLOADS_DIR + path.sep)) await fs.unlink(filePath);
    } else if (isCloudinaryConfigured) {
      await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
    }
  } catch (error) {
    console.warn(`[storage] could not delete ${publicId}: ${error.message}`);
  }
};
