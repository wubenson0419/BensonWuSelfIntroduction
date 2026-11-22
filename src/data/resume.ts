/**
 * 履歷頁（/resume）專用的資料。
 * 姓名、學校、Email、自我介紹沿用 profile.ts；學歷、證照、實作自動取自經歷（src/content/experiences/）。
 * 這裡只放履歷才需要的內容。
 *
 * ⚠️ 下面的技能是依你的經歷先填的草稿，請改成你實際會的。
 */
import type { ExperienceType } from './experienceTypes';

export interface SkillGroup {
  title: string;
  items: string[];
}

export interface ResumeSettings {
  /** 履歷頁標題下方的一句話 */
  headline: string;
  /** 技能，依分類列出 */
  skills: SkillGroup[];
  /** 各區塊要顯示哪些經歷類型（對應 experienceTypes.ts） */
  sections: { title: string; types: ExperienceType[] }[];
  /** 是否顯示「列印 / 存成 PDF」按鈕 */
  showPrintButton: boolean;
}

export const RESUME: ResumeSettings = {
  headline: "國立臺中科技大學 資訊工程科 學生",
  skills: [
    { title: "程式語言", items: ["Python", "HTML / CSS", "JavaScript / TypeScript"] },
    { title: "工具與系統", items: ["Linux", "Git", "Astro", "Microsoft Word"] },
    { title: "其他", items: ["底片攝影", "硬體拆裝"] },
  ],
  sections: [
    { title: "學歷", types: ["school"] },
    { title: "證照", types: ["cert"] },
    { title: "實作與經歷", types: ["play", "hobby"] },
  ],
  showPrintButton: true,
};
