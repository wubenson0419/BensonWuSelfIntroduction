import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { EXPERIENCE_TYPES } from './data/experienceTypes';

/**
 * 經歷：src/content/experiences/ 底下每個 .md 檔就是一筆。
 * 欄位格式錯誤時，`npm run build` 會直接指出是哪個檔案、哪個欄位。
 */
const experiences = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/experiences' }),
  schema: z.object({
    year: z.string().regex(/^\d{4}\/\d{2}$/, '格式要是 YYYY/MM，例如 2025/07'),
    type: z.enum(EXPERIENCE_TYPES),
    title: z.string(),
    /** 選填，/images/... 路徑；有填才會出現「照片」下拉 */
    image: z.string().optional(),
  }),
});

export const collections = { experiences };
