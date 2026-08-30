# 🛠️ 網站優化待辦清單 (Code Optimization To-Do List)

**目標：** 將現有的靜態展示型作品集網站，升級為一個結構更穩固、維護性更高、用戶體驗更豐富的動態展示系統。

---

## 🌟 ⚙️ 優化總覽 (Optimization Overview)

本清單依據 [index.html] 的架構、[css/style.css] 的視覺層和 [js/data.js] 的資料驅動特性進行分析。優化建議將圍繞 **「可維護性」** 和 **「沉浸式體驗」** 兩大核心目標展開。

---

## 🎯 優化待辦清單 (To-Do List)

| 編號 | 優化項目 (Feature/Fix) | 優先級 (Priority) | 預估難度 (Difficulty) | 詳細內容與實施建議 (Details & Implementation Notes) | 影響範圍 (Scope) |
| :---: | :--- | :---: | :---: | :--- | :--- |
| **T1** | **作品資料層級重構 (Data Restructuring)** | ⭐⭐⭐ (最高) | 中等 (Medium) | **現狀：** 作品使用扁平陣列 `gallery` 難以區分不同「類別」。<br>**優化：** 將 `gallery` 改為包含 `category` 的結構，並在 `data.js` 頂層新增一個 `categories` Map/Object。<br>例如：`{ "Photography": [...], "Coding_Project": [...] }`。這樣能讓後續的篩選功能（Filter）從資料層面實現。 | `js/data.js`, `index.html` (Gallery 區) |
| **T2** | **引入內容過濾器 (Category Filter)** | ⭐⭐ (高) | 中等到高 (Mid-High) | 在 `#gallery-header` 前增加一個導航篩選組件。該組件應監聽點擊事件，然後調用 `render.js` 根據所選類別 (`T1` 的結果) 來過濾並重繪圖片。這是系統化展示的核心步驟。 | `index.html`, `js/render.js` |
| **T3** | **通用動畫模組化 (Animation Abstraction)** | ⭐⭐ (高) | 中等 (Medium) | 將所有與滾動觸發的元素動畫邏輯（如：fade-up, scale-in）從分散在 `main()` 函數中的各種調用，統一封裝到一個獨立的 **`scrollAnimation.js`** 模組中。這能極大提高代碼的可讀性和可維護性。<br>➡️ *行動：將所有 GSAP 的 ScrollTrigger 調用集中在此。* | `index.html`, `js/animations.js` (重構) |
| **T4** | **網頁性能優化 (Image Loading Optimization)** | ⭐⭐ (高) | 低到中等 (Low-Medium) | 為首圖和畫廊圖片實作更完善的 **Lazy Load 替換機制**。在初始化時，為尚未進入視窗的圖片先載入一個低解析度的 Blur Placeholder，達到視覺連續性，減少初始白屏或突兀的跳變感。 | `index.html` (HTML/CSS), `js/render.js` |
| **T5** | **增加關鍵字自動生成 (Keyword Generation)** | ⭐⭐ (高) | 中等 (Medium) | 在 `data.js` 底部新增一個邏輯，掃描所有 `experiences` 和 `gallery` 的標題與描述。將重複出現的詞彙統計出來，並在網站版面（例如：頁尾或關於我區塊）自動生成可點擊的 **「相關文章」/「關鍵字雲 (Tag Cloud)」** 連結群組。 | `js/data.js`, `js/render.js` |
| **T6** | **完善聯絡資訊流程 (Contact Flow Finalization)** | ⭐ (一般) | 低 (Low) | 目前已在 `#contact` 和 `callme.html` 有分區隔。應確保所有 JS 頁面都能正確地處理導航狀態（例如：點擊「聯絡我」按鈕後，若不跳轉到 `callme.html`，而是用 Modal 或側邊欄彈出表單）。 | `index.html`, 全局 JS/CSS |

---
## 📊 執行計畫與建議 (Execution Roadmap)

**🥇 第一階段：資料結構重構 (T1 $\to$ T5)**
*   目標：讓網站的內容管理層達到極致化。先優化數據，再考慮展示效果。

**🥈 第二階段：功能增強與性能優化 (T2 & T4)**
*   目標：實現動態篩選、更穩定的用戶體驗（尤其在不同裝置上）。

**🥉 第三階段：代碼品質與收尾 (T3 & T6)**
*   目標：將所有邏輯點解耦，建立可持續的開發基礎架構。

---