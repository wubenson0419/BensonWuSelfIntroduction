/**
 * 照片設定。照片本身放在 src/assets/images/<資料夾>/，丟進去就會自動上架。
 */

/**
 * 相簿：資料夾 → 顯示名稱，順序就是網站上的排列順序。
 * 沒列在這裡的資料夾也會顯示，名稱用資料夾名。
 */
export interface Album {
  folder: string;
  camera: string;
  film?: string;
}

export const ALBUM_SETTINGS: Album[] = [
  { folder: "CanonEOS100QD/KodakProimage100", camera: "Canon EOS 100QD", film: "Kodak ProImage 100" },
  { folder: "Canon7d2", camera: "Canon 7D Mark II" },
];

/**
 * 照片故事（選填，沒寫的照片只顯示相機 / 底片）。
 * key 是照片路徑：/images/<資料夾>/<檔名>
 * 文字可用 [文字](https://網址) 放連結。
 */
export interface PhotoStory {
  title: string;
  desc?: string;
}

const KODAK = "/images/CanonEOS100QD/KodakProimage100/";

export const PHOTO_STORIES: Record<string, PhotoStory> = {
  [`${KODAK}kodakproimage100__A01.webp`]: { title: "與底片相機📷的初次見面", desc: "第一卷底片的第一張就拍下了普羅相機店的店貓!" },
  [`${KODAK}kodakproimage100__A03.webp`]: { title: "單純想拍個頭像", desc: "有點好笑沒對到焦但至少多了個頭像" },
  [`${KODAK}kodakproimage100__A04.webp`]: { title: "搭過最多次的公車", desc: "在我眼中它算是少數還不錯看的公車了" },
  [`${KODAK}kodakproimage100__A07.webp`]: { title: "在夕陽之下", desc: "那個瞬間很平凡但陽光照下來的角度讓一切都變得很值得看第二眼" },
  [`${KODAK}kodakproimage100__A09.webp`]: { title: "有溫度的樓梯間", desc: "陽光切進窗來，金屬握把照的有些發燙..." },
  [`${KODAK}kodakproimage100__A10.webp`]: { title: "下午的台中車站", desc: "灰濛濛的天空下，古老的建築靜靜地矗立著..." },
};
