/**
 * render.js
 * 負責將 data.js 中的資料注入到 HTML 中。
 * 這支程式會自動尋找對應的 HTML 元素 ID (例如 'gallery-container')，
 * 並將資料轉換為 HTML 結構填入，保持前端檔案的極度乾淨。
 */

document.addEventListener("DOMContentLoaded", () => {
    const fillTextById = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    };

    const fillProfileFields = () => {
        document.querySelectorAll('[data-profile]').forEach(el => {
            const key = el.dataset.profile;
            if (Object.prototype.hasOwnProperty.call(SITE_DATA.profile, key)) {
                el.textContent = SITE_DATA.profile[key];
            }
        });
    };

    const setTextWithLineBreaks = (el, value) => {
        if (!el) return;

        const nodes = String(value)
            .split(/<br\s*\/?>/i)
            .flatMap((line, index) => index === 0
                ? [document.createTextNode(line.trim())]
                : [document.createElement('br'), document.createTextNode(` ${line.trim()}`)]
            );

        el.replaceChildren(...nodes);
    };

    const shuffle = (items) => {
        const shuffled = [...items];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    const notifyContentRendered = (name) => {
        requestAnimationFrame(() => {
            document.dispatchEvent(new CustomEvent(`${name}:rendered`));
            document.dispatchEvent(new CustomEvent('site-content:rendered'));
        });
    };
     
    // --- 1. 渲染首頁與 About Me 頁面的基礎資訊 ---
    // 尋找 HTML 中帶有特定 ID 的元素，若存在則填入對應資料
    const elementsToFill = {
        'profile-name': SITE_DATA.profile.name,
        'profile-birthday': SITE_DATA.profile.birthday,
        'profile-school': SITE_DATA.profile.school,
        'profile-major': SITE_DATA.profile.major,
        'profile-status': SITE_DATA.profile.status,
        'profile-email': SITE_DATA.profile.email,
        'about-bio': SITE_DATA.profile.bio
    };

    for (const [id, value] of Object.entries(elementsToFill)) {
        fillTextById(id, value);
    }
    fillProfileFields();
    setTextWithLineBreaks(document.getElementById('hero-subtitle'), SITE_DATA.profile.heroSubtitle);

    // --- 轉換 Email Span 為可點擊按鈕 ---
    const emailSpan = document.getElementById('profile-email');
    if (emailSpan) {
        const emailLink = document.createElement('a');
        emailLink.href = `mailto:${SITE_DATA.profile.email}`;
        emailLink.textContent = emailSpan.textContent;
        emailLink.className = 'email-button'; // 添加樣式用的 class
        emailSpan.replaceWith(emailLink);
    }

    // --- 2. 渲染興趣標籤 (Interests) ---
    const interestsContainer = document.getElementById('interests-container');
    if (interestsContainer) {
        // 清空容器，避免重複渲染
        interestsContainer.replaceChildren();
        SITE_DATA.interests.forEach(tag => {
            const span = document.createElement('span');
            span.className = 'tag';
            span.textContent = tag;
            interestsContainer.appendChild(span);
        });
    }

    // --- 3. 渲染社群按鈕 (Social Links) ---
    // 有可能在多個地方出現 (首頁、聯絡我頁面)，使用 querySelectorAll
    const socialContainers = document.querySelectorAll('.dynamic-social-links');
    socialContainers.forEach(container => {
        container.replaceChildren();
        SITE_DATA.socialLinks.forEach(link => {
            const a = document.createElement('a');
            a.href = link.url;
            a.target = "_blank";
            a.rel = "noopener noreferrer";
            a.className = link.brand; // 例如 'instagram'，用來套用專屬漸層顏色
            a.setAttribute('aria-label', link.name);
            
            const i = document.createElement('i');
            i.className = link.iconClass; // 例如 'fa-brands fa-instagram'
            
            a.appendChild(i);
            container.appendChild(a);
        });
    });

    // --- 4. 渲染精選作品集 (Gallery) ---
    const galleryContainer = document.getElementById('gallery-container');
    // 如果 HTML 中設定了 data-limit，則限制顯示張數 (首頁只顯示部分)
    if (galleryContainer) {
        const limitAttr = galleryContainer.getAttribute('data-limit');
        const isHomepage = limitAttr !== null;
        const parsedLimit = Number.parseInt(limitAttr, 10);
        const limit = isHomepage && Number.isFinite(parsedLimit) ? parsedLimit : SITE_DATA.gallery.length;
         
        // 如果是首頁，將畫廊陣列洗牌 (隨機圖片)
        const displayGallery = isHomepage ? shuffle(SITE_DATA.gallery) : [...SITE_DATA.gallery];
         
        galleryContainer.replaceChildren();
        displayGallery.slice(0, limit).forEach(item => {
            const div = document.createElement('div');
            div.className = 'gallery-item';
            
            const a = document.createElement('a');
            a.href = `highlight.html?img=${encodeURIComponent(item.src)}`;
            
            // 加入 lightbox-trigger 讓其支援 Lightbox，並附上資料屬性
            a.className = 'lightbox-trigger';
            a.setAttribute('data-img-src', item.src);
            a.setAttribute('data-title', item.title || '');
            a.setAttribute('data-description', item.desc || '');
            
            const img = document.createElement('img');
            img.src = item.src;
            img.alt = item.title || 'Featured Photo';
            img.loading = 'lazy';
            
            a.appendChild(img);
            div.appendChild(a);
            galleryContainer.appendChild(div);
        });
        notifyContentRendered('gallery');
    }

    // --- 5. 渲染經歷時間軸 (Experiences Timeline) ---
    const experienceContainer = document.getElementById('experience-timeline');
    if (experienceContainer) {
        experienceContainer.replaceChildren();
        SITE_DATA.experiences.forEach((exp, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'timeline-item bento-card';
            
            // 加入 GSAP 需要的 class 或 data 屬性
            itemDiv.setAttribute('data-scroll', 'fade-up');

            const yearSpan = document.createElement('div');
            yearSpan.className = 'timeline-year';
            yearSpan.textContent = exp.year;

            const contentDiv = document.createElement('div');
            contentDiv.className = 'timeline-content';
            
            const textDiv = document.createElement('div');
            textDiv.className = 'timeline-text-content';

            const titleH3 = document.createElement('h3');
            titleH3.textContent = exp.title;
            
            const descP = document.createElement('p');
            descP.textContent = exp.description;
            
            textDiv.appendChild(titleH3);
            textDiv.appendChild(descP);
            contentDiv.appendChild(textDiv);
            
            if (exp.image) {
                const imgWrapper = document.createElement('div');
                imgWrapper.className = 'timeline-img-wrapper';
                
                const img = document.createElement('img');
                img.src = exp.image;
                img.alt = exp.title;
                img.loading = 'lazy';
                
                imgWrapper.appendChild(img);
                contentDiv.appendChild(imgWrapper);
            }
            
            itemDiv.appendChild(yearSpan);
            itemDiv.appendChild(contentDiv);
             
            experienceContainer.appendChild(itemDiv);
        });
        notifyContentRendered('experience');
    }

    // 通知 GSAP 重整 ScrollTrigger (因為動態生成 DOM 會改變高度)
    if (typeof ScrollTrigger !== 'undefined') {
        requestAnimationFrame(() => ScrollTrigger.refresh());
    }
});
