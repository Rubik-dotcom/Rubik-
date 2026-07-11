import './index.css';

const state = {
    mouseX: 0,
    mouseY: 0,
    targetMouseX: 0,
    targetMouseY: 0,
    scroll: 0,
    targetScroll: 0,
    time: 0,
    winW: window.innerWidth,
    winH: window.innerHeight
};

const grid = document.getElementById('interactive-grid');
const elements = document.querySelectorAll('.antigravity-element');
const header = document.querySelector('header');
const blob = document.getElementById('blob');
const scrollWrapper = document.getElementById('smooth-scroll-wrapper');
const sparkleLayer = document.getElementById('sparkle-layer');
const reveals = document.querySelectorAll('.reveal-on-scroll');
const magneticButtons = document.querySelectorAll('.magnetic-button');
const navItems = document.querySelectorAll('#main-nav .nav-item');
const sections = document.querySelectorAll('main > section[id]');

let wrapperHeight = 0;
let sectionOffsets = [];

function calculateSectionOffsets() {
    if (!scrollWrapper) return;
    const wrapperRect = scrollWrapper.getBoundingClientRect();
    sectionOffsets = Array.from(sections).map(sec => {
        const rect = sec.getBoundingClientRect();
        return {
            id: sec.getAttribute('id'),
            offsetTop: rect.top - wrapperRect.top
        };
    });
}

const resizeObserver = new ResizeObserver(() => {
    if (scrollWrapper) {
        wrapperHeight = scrollWrapper.getBoundingClientRect().height;
        document.body.style.height = `${wrapperHeight}px`;
    }
    state.winW = window.innerWidth;
    state.winH = window.innerHeight;
    calculateSectionOffsets();
});

if (scrollWrapper) {
    resizeObserver.observe(scrollWrapper);
}

magneticButtons.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px) scale(1.05)`;
    });
    btn.addEventListener('mouseleave', () => {
        btn.style.transform = `translate(0, 0) scale(1)`;
    });
});

if (sparkleLayer) {
    for (let i = 0; i < 15; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.style.left = Math.random() * 100 + '%';
        sparkle.style.top = Math.random() * 100 + '%';
        sparkle.style.animationDelay = Math.random() * 5 + 's';
        sparkleLayer.appendChild(sparkle);
    }
}

window.addEventListener('mousemove', (e) => {
    state.targetMouseX = (e.clientX / state.winW) - 0.5;
    state.targetMouseY = (e.clientY / state.winH) - 0.5;
    if (blob) {
        blob.style.left = e.clientX + 'px';
        blob.style.top = e.clientY + 'px';
    }
});

window.addEventListener('wheel', (e) => {
    state.targetScroll += e.deltaY * 1.5;
    state.targetScroll = Math.max(0, Math.min(state.targetScroll, wrapperHeight - state.winH));
}, { passive: true });

function checkReveals() {
    reveals.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < state.winH * 0.9) {
            el.classList.add('active');
        }
    });
}

function animate() {
    state.time += 0.01;
    state.mouseX += (state.targetMouseX - state.mouseX) * 0.05;
    state.mouseY += (state.targetMouseY - state.mouseY) * 0.05;
    state.scroll += (state.targetScroll - state.scroll) * 0.12;

    if (scrollWrapper) {
        scrollWrapper.style.transform = `translate3d(0, -${state.scroll}px, 0)`;
    }

    if (header) {
        if (state.scroll > 50) {
            header.classList.add('h-16', 'bg-white/95', 'backdrop-blur-md');
            header.classList.remove('h-20');
        } else {
            header.classList.add('h-20');
            header.classList.remove('h-16', 'bg-white/95', 'backdrop-blur-md');
        }
    }

    if (grid) {
        const gridX = state.mouseX * -80 + Math.sin(state.time * 0.5) * 15;
        const gridY = state.mouseY * -80 + (state.scroll * -0.1) + Math.cos(state.time * 0.5) * 15;
        grid.style.transform = `translate3d(${gridX}px, ${gridY}px, 0) rotate(${state.mouseX * 3}deg)`;
    }


    elements.forEach((el, index) => {
        const sway = Math.sin(state.time * 0.5 + index) * 5;
        const tiltX = state.mouseY * 8;
        const tiltY = state.mouseX * -8;
        el.style.transform = `translate3d(0, ${sway}px, 0) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    });

    checkReveals();
    updateActiveNav();
    requestAnimationFrame(animate);
}

function updateActiveNav() {
    let activeSectionId = 'hero';
    for (const sec of sectionOffsets) {
        if (state.scroll >= sec.offsetTop - 200) {
            activeSectionId = sec.id;
        }
    }
    navItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href === `#${activeSectionId}`) {
            item.classList.add('nav-link-active');
        } else {
            item.classList.remove('nav-link-active');
        }
    });
}

calculateSectionOffsets();
animate();

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId !== '#') {
            e.preventDefault();
            const target = document.querySelector(targetId);
            if (target && scrollWrapper) {
                const targetRect = target.getBoundingClientRect();
                const wrapperRect = scrollWrapper.getBoundingClientRect();
                const offsetTop = targetRect.top - wrapperRect.top;
                state.targetScroll = Math.max(0, Math.min(offsetTop - 100, wrapperHeight - state.winH));
            }
        }
    });
});

// Language Toggle Handler
const langToggle = document.getElementById('lang-toggle');
if (langToggle) {
    langToggle.addEventListener('click', () => {
        const html = document.documentElement;
        if (html.getAttribute('lang') === 'vi') {
            html.setAttribute('lang', 'en');
        } else {
            html.setAttribute('lang', 'vi');
        }
        // Force the resize observer to recalculate layout height after display shifts
        window.dispatchEvent(new Event('resize'));
    });
}
