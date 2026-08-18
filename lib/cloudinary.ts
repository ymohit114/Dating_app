import { v2 as cloudinary } from 'cloudinary';

export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'gsemjkay';
export const CLOUDINARY_FOLDER = 'elance_dating/managed_profiles';

if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

/**
 * Builds a direct Cloudinary CDN URL for any photo index (1 to 130).
 * Features face-detection centering (g_face), auto compression (q_auto), and modern WebP/AVIF format (f_auto).
 */
export function getCloudinaryProfilePhoto(index: number, options?: { thumbnail?: boolean; width?: number; height?: number }): string {
  // Normalize index 1 to 130
  const safeIndex = ((Math.abs(index) - 1) % 130) + 1;
  const numStr = safeIndex.toString().padStart(3, '0');
  const photoName = `qrty-${numStr}`;

  if (options?.thumbnail) {
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/c_fill,g_face,w_300,h_375,q_auto,f_auto/${CLOUDINARY_FOLDER}/${photoName}.jpg`;
  }

  const w = options?.width || 800;
  const h = options?.height || 1000;
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/c_fill,g_face,w_${w},h_${h},q_auto,f_auto/${CLOUDINARY_FOLDER}/${photoName}.jpg`;
}

/**
 * Resolves any image URL or path to a direct Cloudinary CDN URL.
 */
export function resolveToCloudinaryUrl(photo: string | any, fallbackIndex: number = 1): string {
  if (!photo) {
    return getCloudinaryProfilePhoto(fallbackIndex);
  }

  const urlStr = typeof photo === 'string' ? photo : photo?.url || photo?.thumbnail || '';

  // If already a full Cloudinary URL
  if (urlStr.includes('cloudinary.com')) {
    return urlStr;
  }

  // If local /profile-photos/qrty-xxx.jpg or qrty-xxx
  const match = urlStr.match(/qrty-(\d+)/i);
  if (match && match[1]) {
    const idx = parseInt(match[1], 10);
    return getCloudinaryProfilePhoto(idx);
  }

  if (urlStr.startsWith('http://') || urlStr.startsWith('https://')) {
    return urlStr;
  }

  return getCloudinaryProfilePhoto(fallbackIndex);
}

export default cloudinary;
