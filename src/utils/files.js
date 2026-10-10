/**
 * Client-side file validation for uploads. This is only a convenience for
 * the user; the backend must validate type and size again.
 */

export const FILE_TYPES = {
  pdf: { extensions: ['pdf'] },
  image: { extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'] },
  video: { extensions: ['mp4', 'mov', 'webm'] },
  audio: { extensions: ['mp3', 'wav', 'm4a'] },
  doc: { extensions: ['doc', 'docx'] },
};

/** Size limits for teacher material uploads, in MB. */
export const MATERIAL_LIMITS_MB = { pdf: 20, image: 10, video: 500 };

/** Returns the file type key (pdf, image, ...) based on extension, or null. */
export function detectType(fileName) {
  const ext = fileName.split('.').pop().toLowerCase();
  return Object.keys(FILE_TYPES).find((key) => FILE_TYPES[key].extensions.includes(ext)) || null;
}

/** Value for an <input accept="..."> attribute. */
export function acceptFor(types) {
  return types.flatMap((t) => FILE_TYPES[t].extensions.map((e) => `.${e}`)).join(',');
}

/**
 * Validate a File against allowed types and a size limit.
 * `maxSizeMb` can be a number or a map of type -> MB.
 * @returns {{ ok: true, type: string } | { ok: false, error: 'type'|'size', type?: string, limitMb?: number }}
 */
export function validateFile(file, { allowed, maxSizeMb }) {
  const type = detectType(file.name);
  if (!type || !allowed.includes(type)) return { ok: false, error: 'type' };
  const limitMb = typeof maxSizeMb === 'number' ? maxSizeMb : maxSizeMb[type];
  if (file.size > limitMb * 1024 * 1024) return { ok: false, error: 'size', type, limitMb };
  return { ok: true, type };
}
