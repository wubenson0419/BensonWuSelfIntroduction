import type { ImageMetadata } from 'astro';

/**
 * src/assets/images/ 底下所有圖片。網站中一律用 "/images/<子路徑>" 指稱它們
 * （與 public/images 相同格式），由 resolveImage 轉成可最佳化的 ImageMetadata。
 */
export const ASSET_PREFIX = '/src/assets/images/';
export const PUBLIC_PREFIX = '/images/';

export const imageModules = import.meta.glob<ImageMetadata>(
  '/src/assets/images/**/*.{webp,jpg,jpeg,png}',
  { eager: true, import: 'default' }
);

/** "/images/..." → ImageMetadata；找不到時回傳原字串（例如仍放在 public/ 的頭像） */
export function resolveImage(path: string): ImageMetadata | string {
  if (!path.startsWith(PUBLIC_PREFIX)) return path;
  return imageModules[ASSET_PREFIX + path.slice(PUBLIC_PREFIX.length)] ?? path;
}
