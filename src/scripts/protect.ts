/**
 * 圖片防護（嚇阻用）：停用照片上的右鍵選單與拖曳另存。
 * 注意：網頁上看得到的圖片不可能 100% 防止下載（截圖、開發者工具都能取得），
 * 這裡只是讓「隨手右鍵另存」變困難；真正的保護是只放縮小版圖片、不公開原圖。
 */
const PROTECTED = 'img, .gallery-item, .lightbox-stage, .timeline-photo-link, .hero-image-mask, .contact-avatar-wrapper';

export function protectImages() {
    const block = (e: Event) => {
        if ((e.target as Element | null)?.closest?.(PROTECTED)) e.preventDefault();
    };
    document.addEventListener('contextmenu', block);
    document.addEventListener('dragstart', block);
}
