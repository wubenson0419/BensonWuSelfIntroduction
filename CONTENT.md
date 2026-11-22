# 如何更新網站內容

改完任何內容後：
- 預覽：`npm run dev -- --host`，打開 http://localhost:4321
- 發布前檢查：`npm run build`。資料格式有錯時，這一步會直接告訴你是哪個檔案、哪一行。

所有資料都在 `src/data/` 和 `src/content/`，**不用改任何頁面檔**。

---

## 新增照片
1. 把照片放進 `src/assets/images/` 底下的資料夾，例如 `src/assets/images/Canon7d2/0003.webp`。
2. 完成。網站會自動放上去，首頁的隨機照片也會抽到它。

- 格式建議用 `.webp`（也支援 `.jpg`、`.png`）。網站會自動產生縮圖，原圖大一點沒關係。
- **新開一台相機或一卷底片**：開一個新資料夾，再到 `src/data/photos.ts` 的 `ALBUM_SETTINGS` 加一行，設定顯示名稱和排列順序：
  ```ts
  { folder: "資料夾名稱", camera: "相機名稱", film: "底片名稱（沒有就不寫這欄）" },
  ```
  不加也可以，篩選膠囊會直接顯示資料夾名稱。

## 幫照片寫故事（選填）
到 `src/data/photos.ts` 的 `PHOTO_STORIES` 加一行。key 是照片路徑，把 `src/assets` 換成開頭的 `/`：
```ts
"/images/Canon7d2/0003.webp": { title: "標題", desc: "內文，可以用 [連結文字](https://網址)" },
```
沒寫故事的照片，看大圖時只會顯示相機和底片，不會出現空白或預設文字。

## 新增經歷 / 證照
在 `src/content/experiences/` 新增一個 `.md` 檔，**一筆經歷一個檔案**。檔名建議用 `年-月-簡短英文.md`，例如 `2026-03-tqc-java.md`：
```md
---
year: "2026/03"
type: cert
title: "取得 TQC+ Java 證照"
image: "/images/other/某張照片.webp"
---

這裡寫內文，可以用 **粗體** 或 [連結](https://example.com)。
```
- `year`：格式固定是 `YYYY/MM`。時間軸會自動由新到舊排序。
- `type`：只能是 `school`（學業）、`cert`（證照）、`play`（玩玩）、`hobby`（興趣）。
- `image`：選填。有填才會出現可以展開的「照片」下拉。照片可以放在 `public/images/other/`，或沿用 `src/assets/images/` 裡的照片。
- **刪掉一筆經歷**：直接刪除那個 `.md` 檔。

### 新增經歷類型
到 `src/data/experienceTypes.ts`：
1. 在 `EXPERIENCE_TYPES` 加上英文代號。
2. 在 `EXPERIENCE_TYPE_META` 設定圖示和中文標籤。圖示名稱到 https://fonts.google.com/icons 搜尋。
3. 把新圖示的名稱加到 `src/layouts/Layout.astro` 裡 Material Symbols 網址的 `icon_names=`，**名稱要依字母排序**。

## 改個人資料、興趣、打字機文字
`src/data/profile.ts`
- `PROFILE`：姓名、學校、Email、頭像、自我介紹（`bio`）
- `roles`：首頁打字機輪播的文字
- `INTERESTS`：興趣標籤

## 改社群連結
`src/data/social.ts`，一行一個，排列順序就是網站上的順序。
- `iconClass`：到 https://fontawesome.com/icons 搜尋品牌，複製 class，例如 `fa-brands fa-facebook`。
- `brand`：滑鼠移上去時的品牌色，要在 `src/styles/style.css` 有對應的 `.<brand>::before` 才會變色。

## 改網站文案
`src/data/copy.ts`：首頁聯絡區塊、聯絡頁、照片區的標題、說明和按鈕文字。

## 履歷頁（/resume）
目前**沒有放在選單上**，只能直接打開網址 `/resume`，而且設定了不讓搜尋引擎收錄。
- 學歷、證照、實作會**自動從經歷抓取**：`school` 放進「學歷」，`cert` 放進「證照」，`play` 和 `hobby` 放進「實作與經歷」。
- 姓名、Email、自我介紹、興趣沿用 `profile.ts`。
- 只有履歷才用到的內容在 `src/data/resume.ts`：
  - `headline`：標題下方的一句話
  - `skills`：技能（**目前是草稿，請改成你實際會的**）
  - `sections`：要顯示哪些區塊、各區塊放哪些經歷類型
  - `showPrintButton`：要不要顯示「列印 / 存成 PDF」按鈕
- 按「列印 / 存成 PDF」會自動換成白底黑字的列印版。

**要公開履歷時**：
1. 在 `src/components/Navbar.astro` 的 `links` 加一行 `{ href: "/resume", label: "履歷" }`。
2. 把 `src/pages/resume.astro` 裡 `<Layout ... noindex>` 的 `noindex` 刪掉。
