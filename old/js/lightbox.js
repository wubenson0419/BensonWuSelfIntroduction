/*
    --- lightbox.js ---
    此檔案包含控制圖片燈箱 (Lightbox) 功能的 JavaScript 程式碼。
    - 當使用者點擊帶有特定 class 的圖片時，會彈出燈箱並顯示對應的圖片和說明。
    - 支援點擊關閉按鈕或遮罩層來關閉燈箱。
    - 增加「查看更多」功能，當描述內容過長時，顯示按鈕來展開/收起內容。
*/

// 等待整個 HTML 文件和所有資源（如圖片）都載入完成後再執行程式碼。
document.addEventListener('DOMContentLoaded', () => {

    // 取得燈箱容器
    const lightbox = document.getElementById('lightbox');

    // 檢查燈箱容器是否存在
    if (lightbox) {
        
        /* --- 1. 取得燈箱內部元素 --- */

        // 取得燈箱內部的圖片、標題、說明、關閉按鈕，以及新的「查看更多」按鈕。
        const lightboxImage = document.getElementById('lightbox-image');         // 顯示大圖的 <img>
        const lightboxTitle = document.getElementById('lightbox-title');         // 圖片標題的 <h3>
        const lightboxDescription = document.getElementById('lightbox-description'); // 圖片說明的 <p>
        const lightboxCloseBtn = document.getElementById('lightbox-close');      // 關閉按鈕

        // 獲取或創建「查看更多」按鈕的引用
        let readMoreBtn = document.getElementById('read-more-btn');

        const createLinkIcon = (fontSize) => {
            const sub = document.createElement('sub');
            sub.style.cssText = 'display:inline-block;vertical-align:sub;margin-left:0.03em;line-height:1;';

            const icon = document.createElement('span');
            icon.className = 'material-symbols-outlined';
            icon.style.cssText = `font-size:${fontSize};opacity:0.7;position:relative;top:0.18em;`;
            icon.textContent = 'link';

            sub.appendChild(icon);
            return sub;
        };

        const createExternalLink = (linkText, linkUrl, styleText, iconSize) => {
            const a = document.createElement('a');
            a.href = linkUrl;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.style.cssText = styleText;
            a.textContent = linkText;
            a.appendChild(createLinkIcon(iconSize));
            return a;
        };

        const renderLinkedTitle = (text) => {
            const linkMatch = text.match(/^\[(.+?)\]\((https?:\/\/[^\s)]+)\)$/);
            if (!linkMatch) {
                lightboxTitle.textContent = text;
                return;
            }

            const [, linkText, linkUrl] = linkMatch;
            const link = createExternalLink(
                linkText,
                linkUrl,
                'text-decoration:none; color:inherit; display:inline;',
                '0.85em'
            );
            lightboxTitle.replaceChildren(link);
        };

        const renderLinkedDescription = (text) => {
            const fragment = document.createDocumentFragment();
            const linkPattern = /\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g;
            let lastIndex = 0;
            let match;

            while ((match = linkPattern.exec(text)) !== null) {
                if (match.index > lastIndex) {
                    fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
                }

                fragment.appendChild(createExternalLink(
                    match[1],
                    match[2],
                    'text-decoration:inherit; color:inherit; display:inline;',
                    '0.78em'
                ));
                lastIndex = linkPattern.lastIndex;
            }

            if (lastIndex < text.length) {
                fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
            }

            lightboxDescription.replaceChildren(fragment);
        };

        const findTriggerByImageSrc = (imgSrc) => {
            const escapedSrc = window.CSS && CSS.escape ? CSS.escape(imgSrc) : imgSrc.replace(/"/g, '\\"');
            return document.querySelector(`.lightbox-trigger[data-img-src="${escapedSrc}"]`);
        };

        /* --- 2. 開啟與關閉燈箱的函式 --- */

        /**
         * 開啟燈箱。
         * @param {string} imgSrc - 高解析度圖片的路徑。
         * @param {string} title - 圖片的標題。
         * @param {string} description - 圖片的說明。
         */
        const openLightbox = (imgSrc, title, description) => {

            // 設定圖片來源。
            lightboxImage.src = imgSrc;

            // 標題與說明支援 [文字](https://example.com) 轉外部連結。
            renderLinkedTitle(title);
            renderLinkedDescription(description);

            // --- 新增：「查看更多」功能邏輯 ---

            // 每次打開時，先移除 expanded class，確保從收起狀態開始
            lightboxDescription.classList.remove('expanded');

            // 如果按鈕不存在，則創建它
            if (!readMoreBtn) {
                readMoreBtn = document.createElement('button');
                readMoreBtn.id = 'read-more-btn';
                readMoreBtn.className = 'read-more-btn';
                // 將按鈕添加到描述的父級容器中 (lightbox-text-container)
                lightboxDescription.parentNode.appendChild(readMoreBtn);
            }
            readMoreBtn.textContent = '查看更多';
            readMoreBtn.style.display = 'none'; // 預設隱藏按鈕

            // 在 DOM 渲染完成後（需要一個微小的延遲）再檢查內容是否溢出
            // 這是因為 `scrollHeight` 和 `clientHeight` 需要在元素內容正確佈局後才能準確計算
            requestAnimationFrame(() => {
                // `scrollHeight` 是元素內容的實際高度（包括溢出部分）
                // `clientHeight` 是元素可見區域的高度（由 CSS 的 max-height 決定）
                if (lightboxDescription.scrollHeight > lightboxDescription.clientHeight) {
                    readMoreBtn.style.display = 'block'; // 顯示「查看更多」按鈕
                } else {
                    readMoreBtn.style.display = 'none'; // 內容未溢出，隱藏按鈕
                }
            });

            // 如果按鈕已存在，添加/重新綁定點擊事件
            // 避免重複綁定，每次開燈箱都只會綁定一次 (如果按鈕是動態創建的話)
            if (!readMoreBtn._hasClickListener) { // 使用一個內部標記來避免重複綁定
                 readMoreBtn.addEventListener('click', () => {
                    if (lightboxDescription.classList.contains('expanded')) {
                        lightboxDescription.classList.remove('expanded');
                        readMoreBtn.textContent = '查看更多';
                    } else {
                        lightboxDescription.classList.add('expanded');
                        readMoreBtn.textContent = '收起';
                    }
                });
                readMoreBtn._hasClickListener = true;
            }
           
            // 將 'active' class 加入到燈箱容器，觸發 CSS 樣式讓燈箱顯示。
            lightbox.classList.add('active');
            // 將 'lightbox-active' class 加入到 <body>，觸發 CSS 讓背景鎖定不滾動。
            document.body.classList.add('lightbox-active');
        };

        /**
         * 關閉燈箱。
         */
        const closeLightbox = () => {
            // 從燈箱容器移除 'active' class，觸發 CSS 樣式讓燈箱隱藏。
            lightbox.classList.remove('active');
            // 從 <body> 移除 'lightbox-active' class，讓背景恢復滾動。
            document.body.classList.remove('lightbox-active');

            // --- 新增：關閉時重置描述和按鈕狀態 ---
            lightboxDescription.classList.remove('expanded'); // 確保下次打開時是收起狀態
            if (readMoreBtn) {
                readMoreBtn.textContent = '查看更多'; // 重置按鈕文本
                readMoreBtn.style.display = 'none'; // 隱藏按鈕
            }
        };

        const handleEscapeKey = (event) => {
            if (event.key === 'Escape' && lightbox.classList.contains('active')) {
                closeLightbox();
            }
        };

        /* --- 3. 設定事件監聽器 --- */

        // 使用事件代理 (Event Delegation)，讓動態生成的圖片也能觸發燈箱
        document.body.addEventListener('click', (event) => {
            const trigger = event.target.closest('.lightbox-trigger');
            if (trigger) {
                event.preventDefault();
                const { imgSrc, title, description } = trigger.dataset;
                openLightbox(imgSrc || trigger.src, title || '', description || '');
            }
        });

        // 如果關閉按鈕存在，則為它設定點擊事件，點擊後關閉燈箱。
        if (lightboxCloseBtn) {
            lightboxCloseBtn.addEventListener('click', closeLightbox);
        }

        // 監聽燈箱遮罩層的點擊事件。
        lightbox.addEventListener('click', (event) => {
            // 檢查點擊的目標是否就是燈箱遮罩層本身 (而不是裡面的圖片或文字)。
            // 這樣可以避免點擊圖片時燈箱被關閉。
            // 同時也避免點擊到「查看更多」按鈕時關閉燈箱。
            if (event.target === lightbox || event.target === lightboxCloseBtn || event.target.closest('.lightbox-close-btn')) {
                closeLightbox();
            }
        });

        // 防止點擊燈箱內容區域時關閉燈箱
        const lightboxContainer = lightbox.querySelector('.lightbox-container');
        if (lightboxContainer) {
            lightboxContainer.addEventListener('click', (event) => {
                event.stopPropagation(); // 阻止事件冒泡到 lightbox-overlay
            });
        }

        document.addEventListener('keydown', handleEscapeKey);

        // --- 新增：支援透過網址參數直接開啟燈箱 ---
        // 為了相容原本首頁點擊圖片後會跳轉至 highlight.html?img=... 的設計
        const urlParams = new URLSearchParams(window.location.search);
        const imgParam = urlParams.get('img');
        if (imgParam) {
            const openImageParam = () => {
                const trigger = findTriggerByImageSrc(imgParam);
                if (trigger) {
                    const { imgSrc, title, description } = trigger.dataset;
                    openLightbox(imgSrc || trigger.src, title || '', description || '');
                } else {
                    // 找不到對應 trigger 也可以強行開圖
                    openLightbox(imgParam, '', '');
                }
            };

            if (document.querySelector('.lightbox-trigger')) {
                openImageParam();
            } else {
                document.addEventListener('gallery:rendered', openImageParam, { once: true });
            }
        }
    }
});
