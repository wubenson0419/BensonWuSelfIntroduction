/**
 * components.js
 * * 這個檔案負責動態載入網站的共用組件，例如導覽列 (nav) 和頁尾 (footer)。
 * 這樣做可以避免在每個 HTML 檔案中重複撰寫相同的程式碼，讓維護更容易。
 */

document.addEventListener("DOMContentLoaded", function() {
    // 定義組件的路徑和目標佔位符的 ID
    const components = [
        { id: 'nav-placeholder', url: 'nav.html' },
        { id: 'footer-placeholder', url: 'footer.html' }
    ];

    // 遍歷所有定義的組件
    components.forEach(component => {
        const placeholder = document.getElementById(component.id);
        if (placeholder) {
            // 使用 fetch API 取得組件的 HTML 內容
            fetch(component.url)
                .then(response => {
                    // 檢查請求是否成功
                    if (!response.ok) {
                        throw new Error(`無法載入 ${component.url}: ${response.statusText}`);
                    }
                    return response.text();
                })
                .then(data => {
                    // 將取得的 HTML 內容插入到佔位符中
                    placeholder.innerHTML = data;
                    
                    // 如果載入的是導覽列，我們需要重新初始化導覽列的腳本
                    if (component.id === 'nav-placeholder') {
                        initializeMenu();
                    }
                })
                .catch(error => {
                    console.error('載入組件時發生錯誤:', error);
                    // 在頁面上顯示錯誤訊息，方便除錯
                    const message = document.createElement('p');
                    message.style.color = 'red';
                    message.textContent = `無法載入 ${component.id}。`;
                    placeholder.replaceChildren(message);
                });
        }
    });
});

/**
 * 初始化導覽列功能
 * 這個函數會在 nav.html 被載入後執行
 */
function initializeMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    const menuOverlay = document.getElementById('menu-overlay');
    const menuIcon = document.getElementById('menu-icon');
    const dropdownItems = document.querySelectorAll('.menu-item-has-children');

    if (!menuToggle || !menuIcon) return; // 如果找不到元素，就直接返回

    // 菜單開關按鈕的點擊事件
    menuToggle.addEventListener('click', () => {
        const isActive = document.body.classList.toggle('menu-active');
        // 根據菜單狀態切換圖示
        if (isActive) {
            menuIcon.classList.remove('fa-list-ul');
            menuIcon.classList.add('fa-xmark');
        } else {
            menuIcon.classList.remove('fa-xmark');
            menuIcon.classList.add('fa-list-ul');
        }
    });

    // 點擊遮罩層以關閉菜單
    if (menuOverlay) {
        menuOverlay.addEventListener('click', () => {
            document.body.classList.remove('menu-active');
            menuIcon.classList.remove('fa-xmark');
            menuIcon.classList.add('fa-list-ul');
        });
    }

    // 處理下拉子選單的點擊事件
    dropdownItems.forEach(item => {
        // 找到觸發下拉的連結 (通常是父層的 <a>)
        const link = item.querySelector('a');
        if (!link) return;
        link.addEventListener('click', (event) => {
            // 如果點擊的是有子選單的項目，阻止其預設的跳轉行為
            if (item.querySelector('.submenu')) {
                event.preventDefault();
                // 切換 is-open class 來展開或收合子選單
                item.classList.toggle('is-open');
            }
        });
    });

    // === 新增：自動高亮當前頁面的目錄項目 ===
    const currentPath = window.location.pathname;

    // 輔助函式：從路徑中提取頁面主名稱（例如 "/aboutme.html" -> "aboutme", "/" -> "index"）
    const getPageKey = (urlPath) => {
        if (!urlPath) return '';
        // 移除 query params 或 hash
        const cleanPath = urlPath.split('?')[0].split('#')[0];
        let filename = cleanPath.split('/').pop() || '';
        filename = filename.split('.')[0];
        if (filename === '' || filename === 'index') {
            return 'index';
        }
        return filename.toLowerCase();
    };

    const currentKey = getPageKey(currentPath);
    // 找到所有導覽列連結，同時支援手機版與桌機版
    const navLinks = document.querySelectorAll('#main-nav a, .desktop-nav-links a');

    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        if (!linkPath || linkPath.startsWith('#') || linkPath === '/') return;

        const linkKey = getPageKey(linkPath);
        if (currentKey === linkKey) {
            link.classList.add('is-current');
            
            // 如果該連結在子選單內，讓父層保持展開
            const parentItem = link.closest('.menu-item-has-children');
            if (parentItem) {
                parentItem.classList.add('is-open');
            }
        } else {
            // 確保其他非當前頁面的連結沒有被誤加 class
            link.classList.remove('is-current');
        }
    });

    // 初始化 Apple Style 導覽列滾動進度條
    const progressFill = document.getElementById('nav-progress-fill');
    if (progressFill) {
        let ticking = false;
        const updateProgress = () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            if (scrollHeight > 0) {
                const scrollPercent = (scrollTop / scrollHeight) * 100;
                progressFill.style.width = scrollPercent + '%';
            }
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateProgress);
                ticking = true;
            }
        }, { passive: true });
    }
}
    
