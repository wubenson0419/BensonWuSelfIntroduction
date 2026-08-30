export function initAnimations() {
    // Ensure GSAP is loaded
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    gsap.registerPlugin(ScrollTrigger);

    // Clear old ScrollTriggers if any when using view transitions
    ScrollTrigger.getAll().forEach(t => t.kill());

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
                delay: (i % 4) * 0.1
            });
        });
        ScrollTrigger.refresh();
    };

    // Hero Section Animation
    if (document.querySelector('.hero-title')) {
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
    }

    // Bento Box / About Me scroll animations
    const bentoCards = gsap.utils.toArray('.bento-card');
    if (bentoCards.length > 0) {
        bentoCards.forEach((card, i) => {
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: "top 90%",
                    toggleActions: "play none none reverse"
                },
                y: 60,
                opacity: 0,
                duration: 0.8,
                ease: "power2.out",
                delay: i * 0.1
            });
        });
    }

    // Gallery Header Animation
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

    // Gallery Items
    animateGalleryItems();

    // Magnetic Buttons
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
            if (frameId) cancelAnimationFrame(frameId);
            moveX(0);
            moveY(0);
        });
    });

    // General fade-up animations
    const scrollElements = gsap.utils.toArray('[data-scroll="fade-up"]');
    if (scrollElements.length > 0) {
        scrollElements.forEach((el, i) => {
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
}
