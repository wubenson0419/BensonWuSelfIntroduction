/** 個人資料與興趣 */

export interface Profile {
  name: string;
  nickname: string;
  birthday: string;
  role: string;
  school: string;
  major: string;
  status: string;
  email: string;
  /** 沒有 JS 時 Hero 副標顯示的文字（可用 <br> 換行） */
  heroSubtitle: string;
  avatarSrc: string;
  bio: string;
  /** Hero 打字機輪播的身分文字 */
  roles: string[];
}

export const PROFILE: Profile = {
  name: "吳秉乾",
  nickname: "BensonWu",
  birthday: "2009/04/19",
  role: "Student",
  school: "國立臺中科技大學",
  major: "資訊工程科 (五專)",
  status: "就讀中",
  email: "wub0419666work@gmail.com",
  heroSubtitle: "Information Engineering Student<br>& Hobby Film Photographer",
  avatarSrc: "/images/headportrait/S_11296777.webp",
  bio: "我是一名熱愛攝影與科技的資工科學生。平時除了耍廢，也會帶著底片相機到處閒逛亂晃，捕捉看似有意義光影的瞬間；或是拿起螺絲起子，拆解各種東西。",
  roles: ["Information Engineering Student", "Hobby Film Photographer", "Professional Tinkerer"],
};

export const INTERESTS: string[] = [
  "Photography 📸",
  "Travel ✈️",
  "Foodie 🍴",
  "Sleep 🛌",
  "Gaming 🔫",
  "Coding 💻",
];
