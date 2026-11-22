/**
 * 社群連結（依序顯示）
 * - iconClass：Font Awesome 的 class，到 https://fontawesome.com/icons 搜尋品牌名稱
 * - brand：滑鼠移上去時的品牌色，對應 style.css 的 .<brand>::before；沒有對應時不會變色
 */

export interface SocialLink {
  name: string;
  url: string;
  iconClass: string;
  brand: string;
}

export const SOCIAL_LINKS: SocialLink[] = [
  { name: "Instagram", url: "https://www.instagram.com/bhwu0419.studio", iconClass: "fa-brands fa-instagram", brand: "instagram" },
  { name: "Threads", url: "https://www.threads.com/@bhwu0419.studio", iconClass: "fa-brands fa-threads", brand: "threads" },
  { name: "Line", url: "https://line.me/ti/p/gwNsHrbZ9Y", iconClass: "fa-brands fa-line", brand: "line" },
  { name: "YouTube", url: "https://www.youtube.com/@wu.benson0419", iconClass: "fa-brands fa-youtube", brand: "youtube" },
  { name: "GitHub", url: "https://github.com/wubenson0419", iconClass: "fa-brands fa-github", brand: "github" },
];
