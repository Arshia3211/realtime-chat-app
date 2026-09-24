import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';
import { detectImageType } from '../utils/imageType.js';

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

// Files are kept in memory: they're small and go straight to storage.
const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES, files: 1 },
});

// Accepts one image in the `file` field and verifies its real type from the bytes.
// Sets req.image = { buffer, mime, ext }.
export const singleImage = (fieldName = 'file') => [
  imageUpload.single(fieldName),
  (req, _res, next) => {
    if (!req.file) {
      throw ApiError.badRequest('No image file provided');
    }
    const type = detectImageType(req.file.buffer);
    if (!type) {
      throw ApiError.badRequest('Only JPEG, PNG, WebP and GIF images are allowed');
    }
    req.image = { buffer: req.file.buffer, ...type };
    next();
  },
];
