/**
 * 網站資料的總入口。實際內容分散在各自的檔案，改內容請直接改那些檔案：
 * - profile.ts           個人資料、興趣、打字機文字
 * - social.ts            社群連結
 * - copy.ts              網站文案
 * - photos.ts            相簿名稱、照片故事
 * - experienceTypes.ts   經歷類型（圖示 / 標籤）
 * - ../content/experiences/*.md   經歷，一筆一個檔案
 * 完整說明見專案根目錄的 CONTENT.md。
 */
import { PROFILE, INTERESTS, type Profile } from './profile';
import { SOCIAL_LINKS, type SocialLink } from './social';
import { COPY, type SiteCopy } from './copy';
import { ALBUM_SETTINGS, PHOTO_STORIES, type Album, type PhotoStory } from './photos';

export type { Profile, SocialLink, SiteCopy, Album, PhotoStory };
export type { ExperienceType } from './experienceTypes';

export interface SiteData {
  profile: Profile;
  interests: string[];
  socialLinks: SocialLink[];
  albums: Album[];
  photoStories: Record<string, PhotoStory>;
  copy: SiteCopy;
}

export const SITE_DATA: SiteData = {
  profile: PROFILE,
  interests: INTERESTS,
  socialLinks: SOCIAL_LINKS,
  albums: ALBUM_SETTINGS,
  photoStories: PHOTO_STORIES,
  copy: COPY,
};
