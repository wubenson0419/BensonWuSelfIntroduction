document.addEventListener("DOMContentLoaded", () => {
    // 確保 GSAP 已載入
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const animateGalleryItems = () => {
        const galleryItems = gsap.utils.toArray('.gallery-item');
        if (galleryItems.length === 0) return;

        galleryItems.forEach((item, i) => {
            if (item.dataset.galleryAnimated === 'true') return;
            item.dataset.galleryAnimated = 'true';

            gsap.from(item, {
                scrollTrigger: {
                    trigger: item,
                    start: "top 90%",
                    toggleActions: "play none none reverse"
                },
                y: 60,
                opacity: 0,
                duration: 0.8,
                ease: "power2.out",
                // 根據索引計算小幅度的錯開時間，讓同排圖片有依序進場的效果
                delay: (i % 4) * 0.1
            });
        });
        ScrollTrigger.refresh();
    };

    // --- 1. Hero 區塊進場動畫 ---
    const heroTl = gsap.timeline();

    heroTl.from(".hero-title", {
        y: 80,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out",
        delay: 0.2
    })
        .from(".hero-subtitle", {
            y: 50,
            opacity: 0,
            duration: 1,
            ease: "power3.out"
        }, "-=0.8")
        .from(".hero-cta .btn", {
            y: 30,
            opacity: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: "power2.out"
        }, "-=0.6")
        .from(".hero-image-container", {
            scale: 0.8,
            opacity: 0,
            duration: 1.2,
            ease: "elastic.out(1, 0.7)"
        }, "-=0.8");

    // --- 2. About Me (Bento Box) 滾動進場動畫 ---
    const bentoCards = gsap.utils.toArray('.bento-card');
    if (bentoCards.length > 0) {
        bentoCards.forEach((card, i) => {
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: "top 90%", // 當卡片頂部到達視窗 85% 時觸發
                    toggleActions: "play none none reverse"
                },
                y: 60,
                opacity: 0,
                duration: 0.8,
                ease: "power2.out",
                delay: i * 0.1 // 產生依序進場的效果
            });
        });
    }

    // --- 3. Gallery Header 動畫 ---
    const galleryHeader = document.querySelector(".gallery-header");
    if (galleryHeader) {
        gsap.from(galleryHeader, {
            scrollTrigger: {
                trigger: ".gallery-section",
                start: "top 80%"
            },
            y: 30,
            opacity: 0,
            duration: 0.6
        });
    }

    // --- 3.5 Gallery Items 畫廊圖片滑進滑出動畫 ---
    document.addEventListener('gallery:rendered', animateGalleryItems);
    animateGalleryItems();

    // --- 4. 磁吸按鈕效果 (Magnetic Buttons) ---
    const magnets = document.querySelectorAll('.magnetic-btn');
    magnets.forEach(btn => {
        const moveX = gsap.quickTo(btn, "x", { duration: 0.25, ease: "power2.out" });
        const moveY = gsap.quickTo(btn, "y", { duration: 0.25, ease: "power2.out" });
        let frameId = null;

        btn.addEventListener('mousemove', (e) => {
            if (frameId) cancelAnimationFrame(frameId);
            frameId = requestAnimationFrame(() => {
                const rect = btn.getBoundingClientRect();
                moveX((e.clientX - rect.left - rect.width / 2) * 0.3);
                moveY((e.clientY - rect.top - rect.height / 2) * 0.3);
                frameId = null;
            });
        });

        btn.addEventListener('mouseleave', () => {
            // 滑鼠離開時彈回原位
            if (frameId) cancelAnimationFrame(frameId);
            moveX(0);
            moveY(0);
        });
    });


    // --- 6. 通用 data-scroll="fade-up" 動畫 ---
    // 為所有具有 data-scroll="fade-up" 屬性的元素添加滾動進場動畫
    const scrollElements = gsap.utils.toArray('[data-scroll="fade-up"]');
    if (scrollElements.length > 0) {
        scrollElements.forEach((el, i) => {
            // 跳過已經處理過的 .bento-card（避免重複動畫）
            if (el.classList.contains('bento-card')) return;

            gsap.from(el, {
                scrollTrigger: {
                    trigger: el,
                    start: "top 95%",
                    toggleActions: "play none none reverse"
                },
                y: 35,
                opacity: 0,
                duration: 0.7,
                ease: "power2.out"
            });
        });
    }
});
