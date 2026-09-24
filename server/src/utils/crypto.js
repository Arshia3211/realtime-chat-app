import crypto from 'node:crypto';

// Random URL-safe token (hex). 32 bytes = 64 hex characters.
export const generateToken = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');

// Tokens are stored as SHA-256 hashes so a database leak doesn't expose usable tokens.
// (Fast hashing is fine here: tokens are long and random, unlike passwords.)
export const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
