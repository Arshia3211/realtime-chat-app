// Detects an image type from its first bytes ("magic numbers"), so uploads are
// judged by content rather than the client-supplied MIME type or file name.
const SIGNATURES = [
  { mime: 'image/jpeg', ext: 'jpg', test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  {
    mime: 'image/png',
    ext: 'png',
    test: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  },
  { mime: 'image/gif', ext: 'gif', test: (b) => b.toString('ascii', 0, 4) === 'GIF8' },
  {
    mime: 'image/webp',
    ext: 'webp',
    test: (b) => b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP',
  },
];

// Returns { mime, ext } or null when the buffer isn't a supported image.
export const detectImageType = (buffer) => {
  if (!buffer || buffer.length < 12) return null;
  const match = SIGNATURES.find(({ test }) => test(buffer));
  return match ? { mime: match.mime, ext: match.ext } : null;
};
