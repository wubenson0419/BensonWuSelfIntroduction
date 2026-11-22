/**
 * 經歷類型：決定時間軸節點的圖示與標籤。
 * 新增類型只要在這裡加一行，經歷 Markdown 的 `type:` 就能使用。
 * 圖示名稱來自 Material Symbols；新圖示也要加到 Layout.astro 的 icon_names。
 */
export const EXPERIENCE_TYPES = ['school', 'cert', 'play', 'hobby'] as const;

export type ExperienceType = (typeof EXPERIENCE_TYPES)[number];

export const EXPERIENCE_TYPE_META: Record<ExperienceType, { icon: string; label: string }> = {
  school: { icon: 'school', label: '學業' },
  cert: { icon: 'workspace_premium', label: '證照' },
  play: { icon: 'sports_esports', label: '玩玩' },
  hobby: { icon: 'photo_camera', label: '興趣' },
};
