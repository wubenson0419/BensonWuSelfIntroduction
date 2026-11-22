import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * 全站動畫。依 class / data 屬性掛載，頁面不需個別呼叫：
 * - .hero-*                    Hero 進場時間軸
 * - .hero-section              捲動視差（往下捲時輕微縮小淡出）
 * - [data-scramble]            文字解碼（亂碼 → 正確字），進入畫面時播放
 * - .typewriter[data-roles]    打字機輪播（JSON 字串陣列）
 * - [data-scroll="fade-up"]    通用滾動淡入
 * - .tags                      標籤依序浮現
 * - .gallery-item              照片「顯影」浮現
 * - .timeline                  節點依序彈出、目前位置發光
 * - .bg-grid                   滑鼠聚光燈點陣背景（僅桌面）
 * - .magnetic-btn              磁吸按鈕（僅桌面）
 * - .glass                     Liquid Glass 高光跟著指標
 *
 * initUI() 是功能性 UI（回到頂部、折射偵測），不受「減少動態效果」影響。
 */

const canHover = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/* ---------- 文字解碼 ---------- */
const GLYPHS = '!<>-_\\/[]{}=+*^?#01';

function scramble(el: HTMLElement, duration = 900) {
    const target = el.dataset.scrambleText ?? el.textContent ?? '';
    el.dataset.scrambleText = target;
    el.setAttribute('aria-label', target);
    const chars = [...target];

    // 鎖住原本的尺寸：亂碼字元寬度不同，若不鎖住會讓文字換行改變，整個版面跟著跳
    const rect = el.getBoundingClientRect();
    const inline = getComputedStyle(el).display.startsWith('inline');
    const prev = { width: el.style.width, height: el.style.height, whiteSpace: el.style.whiteSpace };
    if (inline) {
        el.style.width = `${rect.width}px`;
        el.style.whiteSpace = 'nowrap';
    } else {
        el.style.height = `${rect.height}px`;
    }

    const start = performance.now();
    const frame = (now: number) => {
        const progress = Math.min(1, (now - start) / duration);
        const revealed = Math.floor(progress * chars.length);
        el.textContent = chars
            .map((ch, i) => (i < revealed || ch === ' ' ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0]))
            .join('');
        if (progress < 1) {
            requestAnimationFrame(frame);
        } else {
            el.textContent = target;
            Object.assign(el.style, prev);
        }
    };
    requestAnimationFrame(frame);
}

function scrambles() {
    document.querySelectorAll<HTMLElement>('[data-scramble]').forEach((el) => {
        if (el.closest('.hero-title')) return; // Hero 由時間軸觸發
        ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => scramble(el) });
    });
}

/* ---------- 打字機 ---------- */
function typewriter() {
    const host = document.querySelector<HTMLElement>('.typewriter[data-roles]');
    const out = host?.querySelector<HTMLElement>('.typewriter-text');
    if (!host || !out) return;

    let roles: string[] = [];
    try {
        roles = JSON.parse(host.dataset.roles ?? '[]');
    } catch {
        return;
    }
    if (roles.length === 0) return;

    host.classList.add('is-active');

    // 預留最長那句的高度：手機上較長的句子會換成兩行，若不預留，打字時整個 Hero 會上下跳
    const line = host.closest<HTMLElement>('.hero-subtitle') ?? host;
    const reserve = () => {
        line.style.minHeight = '';
        let max = 0;
        for (const role of roles) {
            out.textContent = role;
            max = Math.max(max, line.offsetHeight);
        }
        line.style.minHeight = `${max}px`;
    };
    const current = () => roles[roleIndex].slice(0, charIndex);
    reserve();
    out.textContent = '';
    let resizeTimer = 0;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(() => {
            reserve();
            out.textContent = current();
        }, 150);
    });

    let roleIndex = 0;
    let charIndex = 0;
    let deleting = false;

    const tick = () => {
        const word = roles[roleIndex];
        charIndex += deleting ? -1 : 1;
        out.textContent = word.slice(0, charIndex);

        let delay = deleting ? 35 : 70;
        if (!deleting && charIndex === word.length) {
            deleting = true;
            delay = 1800;
        } else if (deleting && charIndex === 0) {
            deleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            delay = 400;
        }
        setTimeout(tick, delay);
    };
    setTimeout(tick, 1200);
}

/* ---------- Hero ---------- */
function heroTimeline() {
    if (!document.querySelector('.hero-title')) return;
    const name = document.querySelector<HTMLElement>('.hero-title [data-scramble]');
    gsap.timeline({ defaults: { ease: 'power3.out' } })
        .from('.hero-image-container', { scale: 0.85, opacity: 0, duration: 1.1, delay: 0.1 })
        .from('.hero-eyebrow', { y: 16, opacity: 0, duration: 0.5 }, '-=0.6')
        .from('.hero-title', { y: 40, opacity: 0, duration: 0.9, onStart: () => name && scramble(name, 1100) }, '-=0.3')
        .from('.hero-subtitle', { y: 20, opacity: 0, duration: 0.7 }, '-=0.6')
        .from('.hero-cta .btn', { y: 20, opacity: 0, duration: 0.6, stagger: 0.1 }, '-=0.5');
}

/** 往下捲時 Hero 輕微縮小淡出 */
function heroParallax() {
    const hero = document.querySelector<HTMLElement>('.hero-section');
    if (!hero) return;
    gsap.to(hero, {
        opacity: 0.15,
        scale: 0.94,
        y: -40,
        ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
    });
}

/* ---------- 捲動淡入 / 標籤 / 照片格 ---------- */
function fadeUps() {
    gsap.utils.toArray<HTMLElement>('[data-scroll="fade-up"]').forEach((el) => {
        gsap.from(el, {
            scrollTrigger: { trigger: el, start: 'top 92%' },
            y: 40,
            opacity: 0,
            duration: 0.8,
            ease: 'power2.out',
        });
    });
}

function tags() {
    document.querySelectorAll<HTMLElement>('.tags').forEach((list) => {
        gsap.from(list.children, {
            scrollTrigger: { trigger: list, start: 'top 92%' },
            y: 12,
            opacity: 0,
            duration: 0.5,
            ease: 'back.out(2)',
            stagger: 0.06,
        });
    });
}

/** 照片「顯影」：從模糊、低飽和慢慢變清楚 */
function photoGrid() {
    const items = gsap.utils.toArray<HTMLElement>('.gallery-item');
    if (items.length === 0) return;
    gsap.set(items, { opacity: 0, scale: 0.96, filter: 'blur(10px) saturate(0.2) brightness(1.3)' });
    ScrollTrigger.batch(items, {
        start: 'top 95%',
        once: true,
        onEnter: (batch) =>
            gsap.to(batch, {
                opacity: 1,
                scale: 1,
                filter: 'blur(0px) saturate(1) brightness(1)',
                duration: 0.9,
                ease: 'power2.out',
                stagger: 0.07,
                clearProps: 'filter,transform',
            }),
    });
}

/* ---------- 時間軸：節點依序彈出，目前位置的節點發光 ---------- */
function timeline() {
    const line = document.querySelector<HTMLElement>('.timeline');
    if (!line) return;
    line.classList.add('is-animated');
    line.querySelectorAll<HTMLElement>('.timeline-item').forEach((item) => {
        ScrollTrigger.create({
            trigger: item,
            start: 'top 85%',
            once: true,
            onEnter: () => item.classList.add('is-lit'),
        });
        ScrollTrigger.create({
            trigger: item,
            start: 'top 60%',
            end: 'bottom 40%',
            toggleClass: 'is-current',
        });
    });
}

/* ---------- 聚光燈背景 ---------- */
function spotlight() {
    if (!canHover()) return;
    const root = document.documentElement;
    root.classList.add('has-spotlight');
    let frame = 0;
    window.addEventListener('pointermove', (e) => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
            root.style.setProperty('--mx', `${e.clientX}px`);
            root.style.setProperty('--my', `${e.clientY}px`);
        });
    });
}

/* ---------- Liquid Glass 高光跟著指標 ---------- */
function glassHighlights() {
    const move = (e: PointerEvent) => {
        const glass = (e.target as Element | null)?.closest<HTMLElement>('.glass');
        if (!glass) return;
        const r = glass.getBoundingClientRect();
        glass.style.setProperty('--lx', `${e.clientX - r.left}px`);
        glass.style.setProperty('--ly', `${e.clientY - r.top}px`);
    };
    document.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerdown', move, { passive: true });
}

/* ---------- 磁吸按鈕 ---------- */
function magneticButtons() {
    if (!canHover()) return;
    document.querySelectorAll<HTMLElement>('.magnetic-btn').forEach((btn) => {
        const moveX = gsap.quickTo(btn, 'x', { duration: 0.25, ease: 'power2.out' });
        const moveY = gsap.quickTo(btn, 'y', { duration: 0.25, ease: 'power2.out' });
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            moveX((e.clientX - rect.left - rect.width / 2) * 0.25);
            moveY((e.clientY - rect.top - rect.height / 2) * 0.25);
        });
        btn.addEventListener('mouseleave', () => {
            moveX(0);
            moveY(0);
        });
    });
}

export function initAnimations() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.registerPlugin(ScrollTrigger);

    heroTimeline();
    heroParallax();
    typewriter();
    scrambles();
    fadeUps();
    tags();
    photoGrid();
    timeline();
    spotlight();
    glassHighlights();
    magneticButtons();

    // 圖片載入或篩選後版面高度會變，重新計算觸發點
    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
    document.addEventListener('layout:changed', () => ScrollTrigger.refresh());
}

/* ==========================================================================
   功能性 UI：不受「減少動態效果」影響
   ========================================================================== */

function backToTop() {
    const btn = document.querySelector<HTMLButtonElement>('.back-to-top');
    if (!btn) return;
    btn.hidden = false;
    const update = () => btn.classList.toggle('is-visible', window.scrollY > 600);
    window.addEventListener('scroll', update, { passive: true });
    update();
    btn.addEventListener('click', () => {
        const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
    });
}

/** Liquid Glass 折射只在 Chromium（支援 backdrop-filter: url()）啟用 */
function glassRefraction() {
    const brands = (navigator as Navigator & { userAgentData?: { brands: { brand: string }[] } })
        .userAgentData?.brands;
    if (brands?.some((b) => b.brand === 'Chromium')) {
        document.documentElement.classList.add('lg-refract');
    }
}

export function initUI() {
    backToTop();
    glassRefraction();
}
