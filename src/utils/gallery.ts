import type { ImageMetadata } from 'astro';
import { SITE_DATA } from '../data/siteData';
import { imageModules, ASSET_PREFIX, PUBLIC_PREFIX } from './images';

/**
 * 照片清單：自動掃描 src/assets/images/ 的所有圖片。
 * - 新照片丟進資料夾即自動上架
 * - 相簿名稱與順序取自 SITE_DATA.albums
 * - 故事（選填）取自 SITE_DATA.photoStories
 */
export interface Photo {
  /** "/images/<資料夾>/<檔名>"，也是 ?img= 分享連結與 photoStories 的 key */
  src: string;
  image: ImageMetadata;
  album: string;
  albumLabel: string;
  title: string;
  desc: string;
}

export interface AlbumInfo {
  folder: string;
  label: string;
  /** 篩選膠囊用的短名稱：有底片用底片名，否則用相機名 */
  short: string;
  count: number;
}

const { albums, photoStories } = SITE_DATA;

const albumLabel = (folder: string) => {
  const a = albums.find((x) => x.folder === folder);
  if (!a) return folder;
  return a.film ? `${a.camera} · ${a.film}` : a.camera;
};

const albumOrder = (folder: string) => {
  const i = albums.findIndex((x) => x.folder === folder);
  return i === -1 ? albums.length : i;
};

export const PHOTOS: Photo[] = Object.entries(imageModules)
  .map(([file, image]) => {
    const rel = file.slice(ASSET_PREFIX.length);
    const folder = rel.split('/').slice(0, -1).join('/');
    const src = PUBLIC_PREFIX + rel;
    const story = photoStories[src];
    return {
      src,
      image,
      album: folder,
      albumLabel: albumLabel(folder),
      title: story?.title ?? '',
      desc: story?.desc ?? '',
    };
  })
  .sort((a, b) => albumOrder(a.album) - albumOrder(b.album) || a.src.localeCompare(b.src, 'en', { numeric: true }));

export const ALBUMS: AlbumInfo[] = [...new Set(PHOTOS.map((p) => p.album))].map((folder) => ({
  folder,
  label: albumLabel(folder),
  short: (() => {
    const a = albums.find((x) => x.folder === folder);
    return a ? a.film ?? a.camera : folder;
  })(),
  count: PHOTOS.filter((p) => p.album === folder).length,
}));

export interface PhotoUrls {
  thumb: string;
  srcset: string;
  large: string;
  /** 縮圖的原始比例尺寸，讓瀑布流在圖片載入前就能排好版 */
  width: number;
  height: number;
}

/** 產生縮圖（300/600w）網址；檢視器直接使用原圖（不縮小、不重新壓縮）。GalleryItem 與首頁隨機照片共用 */
export async function photoUrls(photo: Photo): Promise<PhotoUrls> {
  const { getImage } = await import('astro:assets');
  const thumb = await getImage({ src: photo.image, widths: [300, 600], format: 'webp' });
  return {
    thumb: thumb.src,
    srcset: thumb.srcSet.attribute,
    large: photo.image.src, // 原圖
    width: photo.image.width,
    height: photo.image.height,
  };
}
