/**
 * data.js
 * 核心資料庫：本網站所有會變動的內容皆統一整理於此。
 * 您未來只需要修改這裡的字串或新增陣列物件，完全不需要更動 HTML 代碼！
 */

const SITE_DATA = {
    // ==========================================
    // 1. 個人基本資料 (About Me)
    // ==========================================
    profile: {
        name: "吳秉乾",
        nickname: "BensonWu",
        birthday: "2009/04/19",
        school: "國立臺中科技大學",
        major: "資訊工程科 (五專)",
        status: "就讀中",
        email: "wub0419666work@gmail.com",
        heroSubtitle: "Photography Enthusiast & Maker <br> Information Engineering Student",
        avatarSrc: "./images/headportrait/S_11296.webp",
        bio: "我是一名熱愛攝影與科技的資工科學生。平時除了耍廢，也會帶著底片相機到處閒逛亂晃，捕捉看似有意義光影的瞬間；或是拿起螺絲起子，拆解各種東西。"
    },

    // ==========================================
    // 2. 興趣與技能標籤 (Interests & Tags)
    // ==========================================
    interests: [
        "Photography 📸",
        "Travel ✈️",
        "Foodie 🍴",
        "Sleep 🛌" ,
        "Gaming 🔫",
        "Coding 💻" 
    ],

    // ==========================================
    // 3. 社交平台連結 (Social Links)
    // ==========================================
    socialLinks: [
        { name: "Instagram", url: "https://www.instagram.com/bhwu0419.studio", iconClass: "fa-brands fa-instagram", brand: "instagram" },
        { name: "Threads", url: "https://www.threads.com/@bhwu0419.studio", iconClass: "fa-brands fa-threads", brand: "threads" },
        { name: "Line", url: "https://line.me/ti/p/gwNsHrbZ9Y", iconClass: "fa-brands fa-line", brand: "line" },
        { name: "YouTube", url: "https://www.youtube.com/@wu.benson0419", iconClass: "fa-brands fa-youtube", brand: "youtube" },
        { name: "GitHub", url: "https://github.com/wubenson0419", iconClass: "fa-brands fa-github", brand: "github" }
    ],

    // ==========================================
    // 4. 經驗與活動 (Experiences & Activities)
    // 您可以在這個陣列中新增物件，頁面將自動產生新的時間軸節點！
    // ==========================================
    experiences: [
        {
            year: "2026/06",
            title: "個人網站重構想法",
            description: "上了網頁設計課程，打算使用工具幫我重構網站，提升網站的使用者體驗與視覺流暢度。",
            image: "images/headportrait/myicon.webp"
        },
        {
            year: "2026/01",
            title: "取得(TQC+)程式語言 Python 3證照",
            description: "以100分取得了第一張程式能力證照。",
            image: ""
        },
        {
            year: "2025/07",
            title: "用Linux架起了自己的第一台NAS",
            description: "用著推土機跟10年老硬碟搞了NextCloud來玩!但現在爛尾了QAQ。期待之後直上群輝NAS。",
            image: "images/other/S__44367874.webp"
        },
        {
            year: "2025/06",
            title: "取得工業電子職類丙級技術士證照",
            description: "拿到了第一張勞動部發的證照。",
            image: ""
        },
        {
            year: "2025/05",
            title: "底片攝影探索",
            description: "開始玩底片相機，在朋友推坑下入手了Canon EOS 100QD並開啟了攝影的不歸路。",
            image: "images/CanonEOS100QD/KodakProimage100/kodakproimage100__A03.webp"
        },
        {
            year: "2025/01",
            title: "取得TQC-OA Word 2021 專業級證照",
            description: "取得了第一個證照。",
            image: ""
        },
        {
            year: "2024/09",
            title: "國立臺中科技大學 資訊工程科 入學",
            description: "開啟五專資工科的學習旅程，開始接觸程式語言與硬體，被各種科目拿捏。",
            image: ""
        }
    ],

    // ==========================================
    // 5. 精選作品集 (Gallery / Highlights)
    // ==========================================
    gallery: [
        {
            src: "images/CanonEOS100QD/KodakProimage100/kodakproimage100__A01.webp",
            title: "與底片相機📷的初次見面",
            desc: "第一卷底片的第一張就拍下了普羅相機店的店貓!"
        },
        {
            src: "images/CanonEOS100QD/KodakProimage100/kodakproimage100__A03.webp",
            title: "單純想拍個頭像",
            desc: "有點好笑沒對到焦但至少多了個頭像"
        },
        {
            src: "images/CanonEOS100QD/KodakProimage100/kodakproimage100__A04.webp",
            title: "搭過最多次的公車",
            desc: "在我眼中它算是少數還不錯看的公車了"
        },
        {
            src: "images/CanonEOS100QD/KodakProimage100/kodakproimage100__A07.webp",
            title: "在夕陽之下",
            desc: "那個瞬間很平凡但陽光照下來的角度讓一切都變得很值得看第二眼"
        },
        {
            src: "images/CanonEOS100QD/KodakProimage100/kodakproimage100__A09.webp",
            title: "有溫度的樓梯間",
            desc: "陽光切進窗來，金屬握把照的有些發燙..."
        },
        {
            src: "images/CanonEOS100QD/KodakProimage100/kodakproimage100__A10.webp",
            title: "下午的台中車站",
            desc: "灰濛濛的天空下，古老的建築靜靜地矗立著..."
        },
        // 自動載入剩餘的 Kodak 圖片 (A02 到 A36)
        ...Array.from({ length: 36 }, (_, i) => i + 1)
            .filter(i => ![ 1, 2, 3, 4, 6, 7, 9, 10].includes(i))
            .map(i => ({
                src: `images/CanonEOS100QD/KodakProimage100/kodakproimage100__A${String(i).padStart(2, '0')}.webp`,
                title: "底片 - Kodak Proimage 100",
                desc: "作者很懶 什麼故事都沒留下"
            })),
        // Canon 7D2 圖片
        {
            src: "images/Canon7d2/0001.webp",
            title: "Canon 7D Mark II 攝影",
            desc: "作者很懶 什麼故事都沒留下"
        },
        {
            src: "images/Canon7d2/0002.webp",
            title: "Canon 7D Mark II 攝影",
            desc: "作者很懶 什麼故事都沒留下"
        }
    ]
};
