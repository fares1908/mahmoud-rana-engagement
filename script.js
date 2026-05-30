/* =============================================================
   script.js — ENGAGEMENT INVITATION COMPLETE JAVASCRIPT
   Mahmoud ♥ Rana — 05 June 2026
   ============================================================= */

'use strict';

/* ─────────────────────────────────────────────
   CONFIGURATION
───────────────────────────────────────────── */
const CFG = {
  eventDate:       new Date('2026-06-05T20:00:00'),
  dateDisplay: {
    full:        'الجمعة — 05 يونيو 2026',
    nums:        '05 يونيو 2026',
    day:         'الجمعة',
    decorative:  '05 · يونيو · 2026',
    fullEn:      'Friday — 05 June 2026',
    numsEn:      '05 June 2026',
    dayEn:       'Friday',
  },
  loaderDuration:  3800,   // ms
  particleCount:   50,
  petalCount:      8,
  heartCount:      14,
  starCount:       120,
  sectionParticles: 40,
  envStarCount:    80,
  loaderParticles: 60,
  heroOrbs:        8,
};

/** حالة الأداء */
const PERF = {
  reducedMotion: false,
  lowPower:      false,
  paused:        false,
  isTouch:       false,
};

/** توحيد عرض التاريخ في كل السايت */
function applySiteDates() {
  const { full, nums, day, decorative } = CFG.dateDisplay;

  const hero = $('#heroDate');
  if (hero) hero.textContent = full;

  const countdown = $('.countdown-event-date');
  if (countdown) countdown.textContent = full;

  const ending = $('.ending-date');
  if (ending) {
    ending.textContent = decorative;
    ending.classList.add('ar-font');
    ending.classList.remove('en-font');
  }

  const envLine = $('.env-letter__date-line');
  if (envLine) {
    envLine.innerHTML = `${day} — <span class="env-letter__date-nums en-font">${nums}</span>`;
  }

  const invDay  = $('#invCardDay');
  const invWhen = $('#invCardWhen');
  if (invDay)  invDay.textContent  = CFG.dateDisplay.dayEn;
  if (invWhen) invWhen.textContent = CFG.dateDisplay.numsEn;

  const dateCard = document.querySelector('#details .detail-card');
  if (dateCard) {
    const sub = dateCard.querySelector('.detail-card__sub');
    const val = dateCard.querySelector('.detail-card__val');
    if (sub) sub.textContent = day;
    if (val) {
      val.textContent = nums;
      val.classList.add('ar-font');
      val.classList.remove('en-font');
    }
  }
}

/** هل نسمح بالأنيميشن الثقيلة؟ */
function shouldAnimateHeavy() {
  return !PERF.reducedMotion && !PERF.paused && !document.hidden;
}

/** تأثيرات متحركة (canvas / قلوب / بتلات) — مش على الموبايل */
function shouldRunDecor() {
  return !PERF.isTouch && !PERF.reducedMotion;
}

/** ضبط الأداء والواجهة حسب حجم الشاشة */
function applyResponsiveConfig() {
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const isSmall  = window.matchMedia('(max-width: 480px)').matches;
  const isTouch  = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  const saveData = navigator.connection?.saveData === true;

  PERF.isTouch       = isTouch;
  PERF.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  PERF.lowPower      = isMobile || isSmall || saveData || isTouch;

  document.body.classList.toggle('reduce-motion', PERF.reducedMotion);
  document.body.classList.toggle('low-power', PERF.lowPower);
  document.body.classList.toggle('is-touch', isTouch);
  document.body.classList.toggle('mobile-scroll-opt', isTouch || isMobile);

  if (isMobile) {
    document.body.classList.add('has-mobile-nav');
    CFG.particleCount    = 0;
    CFG.petalCount       = 0;
    CFG.heartCount       = 0;
    CFG.sectionParticles = 0;
    CFG.starCount        = 0;
    CFG.envStarCount     = 24;
    CFG.loaderParticles  = 20;
    CFG.heroOrbs         = 0;
  }

  if (isSmall) {
    CFG.particleCount    = 0;
    CFG.petalCount       = 0;
    CFG.heartCount       = 0;
    CFG.sectionParticles = 0;
    CFG.starCount        = 0;
    CFG.envStarCount     = 16;
    CFG.loaderParticles  = 14;
    CFG.heroOrbs         = 0;
  }

  if (!isMobile && !isSmall) {
    CFG.particleCount    = 50;
    CFG.petalCount       = 8;
    CFG.heartCount       = 14;
    CFG.sectionParticles = 40;
    CFG.starCount        = 120;
    CFG.envStarCount     = 80;
    CFG.loaderParticles  = 60;
    CFG.heroOrbs         = 8;
  }

  if (PERF.lowPower && !isMobile && !isSmall) {
    CFG.petalCount       = Math.min(CFG.petalCount, 6);
    CFG.heartCount       = Math.min(CFG.heartCount, 6);
    CFG.sectionParticles = Math.min(CFG.sectionParticles, 12);
  }

  if (PERF.reducedMotion) {
    CFG.particleCount    = 0;
    CFG.petalCount       = 0;
    CFG.heartCount       = 0;
    CFG.sectionParticles = 0;
    CFG.starCount        = 0;
    CFG.envStarCount     = 0;
    CFG.loaderParticles  = 0;
    CFG.heroOrbs         = 0;
  }

  document.body.classList.add('serenity');
}

/** إيقاف الأنيميشن أثناء السكرول + لما التاب مخفي */
function initPerformance() {
  document.addEventListener('visibilitychange', () => {
    PERF.paused = document.hidden;
  }, { passive: true });

  let resizeT;
  window.addEventListener('resize', () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => {
      applyResponsiveConfig();
      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
    }, 250);
  }, { passive: true });
}

/** حلقة canvas — بتشتغل بس لما العنصر ظاهر (مش 60fps فاضي) */
function runWhenVisible(isActive, draw, idleCheckMs = 400) {
  let rafId = null;
  let timerId = null;

  const tick = () => {
    rafId = null;
    if (isActive() && shouldAnimateHeavy()) {
      draw();
      rafId = requestAnimationFrame(tick);
    } else {
      timerId = setTimeout(() => {
        timerId = null;
        if (isActive()) rafId = requestAnimationFrame(tick);
      }, idleCheckMs);
    }
  };

  const start = () => {
    if (rafId == null && timerId == null) rafId = requestAnimationFrame(tick);
  };

  const stop = () => {
    if (rafId) cancelAnimationFrame(rafId);
    if (timerId) clearTimeout(timerId);
    rafId = null;
    timerId = null;
  };

  return { start, stop };
}

/* ─────────────────────────────────────────────
   UTILITIES
───────────────────────────────────────────── */
const $  = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));
const rand  = (min, max) => Math.random() * (max - min) + min;
const randI = (min, max) => Math.floor(rand(min, max + 1));
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
const lerp  = (a, b, t) => a + (b - a) * t;

/* ─────────────────────────────────────────────
   STATE
───────────────────────────────────────────── */
let mouseX = window.innerWidth  / 2;
let mouseY = window.innerHeight / 2;
let heroParallaxX = 0;
let heroParallaxY = 0;
let countdownInterval = null;
let gsapScrollInitialized = false;

/* ─────────────────────────────────────────────
   0. ENVELOPE INTRO
───────────────────────────────────────────── */
function initEnvelope() {
  const overlay = $('#envelopeOverlay');
  const wrap    = $('#envWrap');
  const flap    = $('#envFlap');
  const letter  = $('#envLetter');
  if (!overlay || !wrap) return;

  // نجوم الخلفية
  const starsEl = $('#envStars');
  if (starsEl && CFG.envStarCount > 0) {
    for (let i = 0; i < CFG.envStarCount; i++) {
      const s = document.createElement('div');
      s.className = 'env-star';
      const size = rand(0.5, 2.5);
      s.style.cssText = `
        left:${rand(0,100)}%;
        top:${rand(0,100)}%;
        width:${size}px;height:${size}px;
        animation-duration:${rand(2,6)}s;
        animation-delay:${rand(0,5)}s;
        box-shadow:0 0 ${size*3}px ${Math.random()>.4?'rgba(201,168,76,0.6)':'rgba(255,255,255,0.4)'};
        background:${Math.random()>.4?'rgba(201,168,76,0.9)':'rgba(255,255,255,0.9)'};
      `;
      starsEl.appendChild(s);
    }
  }

  function openEnvelope() {
    if (wrap.dataset.opened) return;
    wrap.dataset.opened = '1';
    overlay.classList.add('is-opening');

    // مرحلة 1: الغطاء بيتفتح
    setTimeout(() => {
      if (flap) flap.classList.add('is-open');
    }, 80);

    // مرحلة 2: الجواب والمحتوى يظهروا بعد ما الغطاء يفتح
    setTimeout(() => {
      if (letter) letter.classList.add('is-visible');
    }, 520);

    // مرحلة 3: الجواب بيطلع للأعلى
    setTimeout(() => {
      if (letter) letter.classList.add('is-rising');
    }, 650);

    // مرحلة 4: الـ overlay بيختفي بعد ما الجواب يطلع
    setTimeout(() => {
      overlay.classList.add('is-gone');
      document.body.classList.remove('envelope-active');
      setTimeout(() => {
        overlay.style.display = 'none';
        initSiteAfterEnvelope();
      }, 950);
    }, 2100);
  }

  wrap.addEventListener('click', openEnvelope);
  wrap.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openEnvelope(); });
}

function initSiteAfterEnvelope() {
  applyResponsiveConfig();
  injectRuntimeStyles();
  initLoader();

  if (shouldRunDecor()) {
    initRosePetals();
    initFloatingHearts();
    initHeroCanvas();
    ['invCanvas','cdCanvas','detCanvas'].forEach(id => {
      initSectionCanvas(id);
    });
    createSparkles('invSparkles', document.body.classList.contains('is-touch') ? 4 : 8);
    initHeroStars();
  }

  initCountdown();
  initScrollReveal();
  initSmoothScroll();
  initParallax();
  initNavDots();
  initCardTilt();
  initScrollProgress();
  initDetailCardRipple();

  if (typeof gsap !== 'undefined') {
    initGSAPScrollAnimations();
  } else {
    window.addEventListener('load', () => {
      if (typeof gsap !== 'undefined') initGSAPScrollAnimations();
    });
  }
}

/* ─────────────────────────────────────────────
   1. LOADER
───────────────────────────────────────────── */
function initLoader() {
  const loader    = $('#loader');
  const progress  = $('#loaderProgress');
  const pctText   = $('#loaderPct');
  const ornTop    = $('.loader__ornament--top');
  const ornBot    = $('.loader__ornament--bottom');
  const names     = $('.loader__names');
  const arabic    = $('.loader__arabic');
  const english   = $('.loader__english');

  if (!loader) return;

  // Loader canvas particles
  initLoaderCanvas();

  // Animate progress bar
  let pct = 0;
  const startTime = performance.now();

  function tickProgress(now) {
    const elapsed  = now - startTime;
    const target   = Math.min(elapsed / CFG.loaderDuration * 100, 100);
    pct = lerp(pct, target, 0.08);

    if (progress) {
      progress.style.width = pct.toFixed(1) + '%';
    }
    if (pctText) {
      pctText.textContent = Math.floor(pct) + '%';
    }

    // Trigger content reveal milestones
    if (pct >= 30 && ornTop) ornTop.style.opacity = '1';
    if (pct >= 50 && ornBot) ornBot.style.opacity = '1';
    if (pct >= 55 && names)  {
      names.style.opacity   = '1';
      names.style.transform = 'translateY(0)';
    }
    if (pct >= 70 && arabic) {
      arabic.style.opacity   = '1';
      arabic.style.transform = 'translateY(0)';
    }
    if (pct >= 80 && english) {
      english.style.opacity = '1';
    }

    if (pct < 100) {
      requestAnimationFrame(tickProgress);
    }
  }

  requestAnimationFrame(tickProgress);

  // Hide loader after duration
  setTimeout(() => hideLoader(loader), CFG.loaderDuration);
}

function hideLoader(loader) {
  document.body.classList.remove('is-loading');
  loader.classList.add('fade-out');

  setTimeout(() => {
    loader.style.display = 'none';
    const navDots = $('#navDots');
    if (navDots) navDots.classList.add('visible');

    // Trigger hero entrance animations
    animateHeroEntrance();
  }, 900);
}

/* ─────────────────────────────────────────────
   2. LOADER CANVAS (sparkles during load)
───────────────────────────────────────────── */
function initLoaderCanvas() {
  const canvas = $('#loaderCanvas');
  if (!canvas || CFG.loaderParticles <= 0) return;

  const ctx = canvas.getContext('2d');
  let W, H;
  const particles = [];
  const useGlow = !PERF.lowPower;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });

  for (let i = 0; i < CFG.loaderParticles; i++) {
    particles.push(createLoaderParticle(W, H));
  }

  function createLoaderParticle(w, h) {
    return {
      x:     rand(0, w),
      y:     rand(0, h),
      vx:    rand(-0.2, 0.2),
      vy:    rand(-0.5, -0.1),
      r:     rand(0.5, 2.5),
      alpha: rand(0.05, 0.5),
      color: Math.random() > 0.5 ? 'gold' : 'blush',
      life:  rand(0.4, 1),
      decay: rand(0.002, 0.005),
    };
  }

  function draw() {
    if (!shouldAnimateHeavy()) return;
    ctx.clearRect(0, 0, W, H);

    // Radial glow center
    const grad = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.min(W,H)*0.55);
    grad.addColorStop(0,   'rgba(201,168,76,0.06)');
    grad.addColorStop(0.5, 'rgba(201,168,76,0.02)');
    grad.addColorStop(1,   'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    particles.forEach((p, i) => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;

      if (p.life <= 0 || p.y < -10) {
        particles[i] = createLoaderParticle(W, H);
        particles[i].y = H + 10;
        return;
      }

      ctx.save();
      ctx.globalAlpha = p.life * p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color === 'gold' ? '#C9A84C' : '#E8B4B8';
      if (useGlow) {
        ctx.shadowColor = p.color === 'gold' ? 'rgba(201,168,76,0.8)' : 'rgba(232,180,184,0.7)';
        ctx.shadowBlur  = 6;
      }
      ctx.fill();
      ctx.restore();
    });
  }

  const loaderLoop = runWhenVisible(() => true, draw, 200);
  loaderLoop.start();

  // Stop when loader fades out
  setTimeout(() => loaderLoop.stop(), CFG.loaderDuration + 1000);
}

/* ─────────────────────────────────────────────
   3. HERO CANVAS — FLOATING PARTICLES
───────────────────────────────────────────── */
function initHeroCanvas() {
  const canvas = $('#heroCanvas');
  if (!canvas || (CFG.particleCount <= 0 && CFG.heroOrbs <= 0)) return;

  const ctx = canvas.getContext('2d');
  let W, H;
  const particles = [];
  const orbs = [];
  const useGlow = !PERF.lowPower;
  let heroVisible = false;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  resize();

  const ro = new ResizeObserver(resize);
  ro.observe(canvas.parentElement);

  const heroIo = new IntersectionObserver(([e]) => {
    heroVisible = e.isIntersecting;
    if (heroVisible) heroLoop.start();
    else heroLoop.stop();
  }, { threshold: 0.05, rootMargin: '40px' });
  heroIo.observe(canvas.closest('.s-hero') || canvas);

  for (let i = 0; i < CFG.particleCount; i++) {
    particles.push(spawnParticle(W, H, true));
  }

  for (let i = 0; i < CFG.heroOrbs; i++) {
    orbs.push(spawnOrb(W, H));
  }

  function spawnParticle(w, h, initial) {
    return {
      x:     rand(0, w),
      y:     initial ? rand(0, h) : h + rand(10, 40),
      vx:    rand(-0.15, 0.15),
      vy:    rand(-0.6, -0.2),
      r:     rand(0.5, 2),
      alpha: rand(0.1, 0.55),
      color: Math.random() > 0.3 ? '#C9A84C' : '#E8B4B8',
      twinkle: rand(0.003, 0.008),
      twinkleDir: 1,
      drift: rand(-0.1, 0.1),
    };
  }

  function spawnOrb(w, h) {
    return {
      x:     rand(0, w),
      y:     rand(0, h),
      vx:    rand(-0.08, 0.08),
      vy:    rand(-0.12, -0.03),
      r:     rand(30, 90),
      alpha: rand(0.02, 0.06),
      color: Math.random() > 0.4 ? '#C9A84C' : '#E8B4B8',
    };
  }

  function drawFrame() {
    ctx.clearRect(0, 0, W, H);

    // Ambient center glow
    const cg = ctx.createRadialGradient(W/2, H*0.55, 0, W/2, H*0.55, Math.min(W,H)*0.7);
    cg.addColorStop(0, 'rgba(201,168,76,0.07)');
    cg.addColorStop(0.5,'rgba(201,168,76,0.03)');
    cg.addColorStop(1,  'transparent');
    ctx.fillStyle = cg;
    ctx.fillRect(0, 0, W, H);

    // Draw orbs
    orbs.forEach(o => {
      o.x += o.vx;
      o.y += o.vy;
      if (o.y < -o.r) { o.y = H + o.r; o.x = rand(0, W); }

      const og = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
      og.addColorStop(0, o.color === '#C9A84C' ? 'rgba(201,168,76,0.18)' : 'rgba(232,180,184,0.14)');
      og.addColorStop(1, 'transparent');
      ctx.fillStyle = og;
      ctx.beginPath();
      ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw particles
    particles.forEach((p, i) => {
      p.x  += p.vx + p.drift * 0.3;
      p.y  += p.vy;

      // Twinkle
      p.alpha += p.twinkle * p.twinkleDir;
      if (p.alpha >= 0.6 || p.alpha <= 0.05) p.twinkleDir *= -1;

      if (p.y < -10) {
        particles[i] = spawnParticle(W, H, false);
        return;
      }

      ctx.save();
      ctx.globalAlpha = p.alpha;
      if (useGlow) {
        ctx.shadowColor = p.color === '#C9A84C'
          ? 'rgba(201,168,76,0.9)'
          : 'rgba(232,180,184,0.8)';
        ctx.shadowBlur = 5;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.restore();
    });
  }

  const heroLoop = runWhenVisible(() => heroVisible, drawFrame);
}

/* ─────────────────────────────────────────────
   4. SECTION MINI-CANVAS (subtle BG particles)
───────────────────────────────────────────── */
function initSectionCanvas(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || CFG.sectionParticles <= 0) return;

  const ctx = canvas.getContext('2d');
  const section = canvas.closest('section');
  let W, H;
  const pts = [];
  let sectionVisible = false;
  const useGlow = !PERF.lowPower;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();

  const ro = new ResizeObserver(resize);
  ro.observe(canvas.parentElement);

  if (section) {
    const io = new IntersectionObserver(([e]) => {
      sectionVisible = e.isIntersecting;
      if (sectionVisible) sectionLoop.start();
      else sectionLoop.stop();
    }, { rootMargin: '60px', threshold: 0.02 });
    io.observe(section);
  } else {
    sectionVisible = true;
  }

  for (let i = 0; i < CFG.sectionParticles; i++) {
    pts.push({
      x: rand(0, W || 1200),
      y: rand(0, H || 600),
      vx: rand(-0.1, 0.1),
      vy: rand(-0.25, -0.05),
      r:  rand(0.3, 1.5),
      a:  rand(0.05, 0.3),
    });
  }

  function drawFrame() {
    ctx.clearRect(0, 0, W, H);
    pts.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.y < -5) { p.y = H + 5; p.x = rand(0, W); }
      ctx.save();
      ctx.globalAlpha = p.a;
      if (useGlow) {
        ctx.shadowColor = 'rgba(201,168,76,0.7)';
        ctx.shadowBlur  = 4;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = '#C9A84C';
      ctx.fill();
      ctx.restore();
    });
  }

  const sectionLoop = runWhenVisible(() => sectionVisible, drawFrame);
}

/* ─────────────────────────────────────────────
   5. ROSE PETALS GENERATOR
───────────────────────────────────────────── */
function initRosePetals() {
  const container = $('#petalsWrap');
  if (!container || CFG.petalCount <= 0) return;

  const colors = [
    '#E8D4DC','#F0E4EC','#DCE4EE',
    '#E6D8C8','#D4C8E0','#EDE5D4',
    '#F5EDE0','#E0D0B8',
  ];

  for (let i = 0; i < CFG.petalCount; i++) {
    const petal = document.createElement('div');
    const size  = rand(14, 28);
    const color = colors[randI(0, colors.length - 1)];
    const dur   = rand(14, 26);
    const delay = rand(0, 15);
    const left  = rand(0, 100);
    const drift = (Math.random() > 0.5 ? 1 : -1) * rand(40, 120);

    petal.className = 'petal';
    petal.style.cssText = [
      `left: ${left}%`,
      `width: ${size}px`,
      `height: ${size * 0.75}px`,
      `background: ${color}`,
      `opacity: ${rand(0.25, 0.55)}`,
      `animation-duration: ${dur}s`,
      `animation-delay: ${delay}s`,
      `--petal-drift: ${drift}px`,
      `border-radius: ${Math.random() > 0.5 ? '60% 5% 60% 5%' : '50% 5% 50% 5%'}`,
      `transform: rotate(${rand(0,360)}deg)`,
      `filter: blur(${Math.random() > 0.7 ? 1 : 0}px)`,
    ].join(';');

    container.appendChild(petal);
  }
}

/* ─────────────────────────────────────────────
   6. FLOATING RED HEARTS (iPhone style ❤️)
───────────────────────────────────────────── */
function initFloatingHearts() {
  const container = $('#floatingHearts');
  if (!container || CFG.heartCount <= 0) return;

  for (let i = 0; i < CFG.heartCount; i++) {
    const heart = document.createElement('span');
    heart.className = 'flo-heart';
    heart.textContent = '❤️';
    heart.setAttribute('aria-hidden', 'true');

    const size  = rand(16, 34);
    const dur   = rand(14, 24);
    const delay = rand(0, 18);
    const left  = rand(2, 98);
    const sway  = rand(35, 90);
    const op    = rand(0.4, 0.85);

    heart.style.cssText = `
      left: ${left}%;
      font-size: ${size}px;
      --heart-dur: ${dur}s;
      --heart-delay: ${delay}s;
      --heart-sway: ${sway}px;
      --heart-op: ${op};
    `;

    container.appendChild(heart);
  }
}

/* ─────────────────────────────────────────────
   7. SPARKLES GENERATOR
───────────────────────────────────────────── */
function createSparkles(containerId, count = 12) {
  const container = document.getElementById(containerId);
  if (!container || PERF.reducedMotion) return;
  if (PERF.lowPower) count = Math.min(count, 5);

  for (let i = 0; i < count; i++) {
    const sp = document.createElement('div');
    sp.className = 'sparkle';
    const size  = rand(0.6, 1.4);
    const dur   = rand(3, 7);
    const delay = rand(0, 5);

    sp.style.cssText = [
      `left: ${rand(5,95)}%`,
      `top:  ${rand(5,95)}%`,
      `font-size: ${size}rem`,
      `animation-duration: ${dur}s`,
      `animation-delay: ${delay}s`,
    ].join(';');

    sp.style.setProperty('--sparkle-dur', dur + 's');

    // Apply directly on ::before via class approach – use inline span
    sp.innerHTML = `<span style="
      color: #C9A84C;
      font-size: inherit;
      display: inline-block;
      animation: sparkleFloat ${dur}s ease-in-out ${delay}s infinite;
      filter: drop-shadow(0 0 4px rgba(201,168,76,0.7));
      opacity: 0.4;
    ">✦</span>`;

    container.appendChild(sp);
  }
}

/* ─────────────────────────────────────────────
   7b. HERO STARS + SPARKLES (صفحة البداية فقط)
───────────────────────────────────────────── */
function initHeroStars() {
  const container = $('#heroStars');
  if (!container || CFG.starCount <= 0) return;

  for (let i = 0; i < CFG.starCount; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    const size  = rand(0.5, 3);
    const dur   = rand(2, 7);
    const delay = rand(0, 8);

    star.style.cssText = [
      `left:   ${rand(0,100)}%`,
      `top:    ${rand(0,100)}%`,
      `width:  ${size}px`,
      `height: ${size}px`,
      `animation-duration: ${dur}s`,
      `animation-delay:    ${delay}s`,
      `background: ${Math.random() > 0.3 ? 'rgba(201,168,76,0.9)' : 'rgba(255,255,255,0.9)'}`,
      `box-shadow: 0 0 ${size * 3}px ${size}px ${Math.random() > 0.3 ? 'rgba(201,168,76,0.5)' : 'rgba(255,255,255,0.3)'}`,
    ].join(';');

    container.appendChild(star);
  }

  if (!PERF.isTouch) {
    createSparkles('heroSparkles', PERF.lowPower ? 6 : 12);
  }
}

/* ─────────────────────────────────────────────
   8. COUNTDOWN TIMER
───────────────────────────────────────────── */
const CIRCUMFERENCE = 2 * Math.PI * 52; // ≈ 326.73

function initCountdown() {
  updateCountdown();
  countdownInterval = setInterval(updateCountdown, 1000);
}

function updateCountdown() {
  const now  = new Date();
  const diff = CFG.eventDate - now;

  if (diff <= 0) {
    // Event has started or passed
    setUnit('cdDaysNum',  'daysFill',  0, 365, '00');
    setUnit('cdHoursNum', 'hoursFill', 0, 24,  '00');
    setUnit('cdMinsNum',  'minsFill',  0, 60,  '00');
    setUnit('cdSecsNum',  'secsFill',  0, 60,  '00');
    clearInterval(countdownInterval);

    const grid = $('#countdownGrid');
    if (grid) {
      const msg = document.createElement('p');
      msg.className = 'ar-font';
      msg.style.cssText = `
        text-align:center; font-size:1.3rem; color:var(--c-gold);
        margin-top:24px; letter-spacing:.1em;
      `;
      msg.textContent = '🎉 فرحتنا بدأت! مبروك 🎉';
      grid.after(msg);
    }
    return;
  }

  const totalSecs = Math.floor(diff / 1000);
  const days    = Math.floor(totalSecs / 86400);
  const hours   = Math.floor((totalSecs % 86400) / 3600);
  const minutes = Math.floor((totalSecs % 3600) / 60);
  const seconds = totalSecs % 60;

  setUnit('cdDaysNum',  'daysFill',  days,    365, pad(days));
  setUnit('cdHoursNum', 'hoursFill', hours,    24, pad(hours));
  setUnit('cdMinsNum',  'minsFill',  minutes,  60, pad(minutes));
  setUnit('cdSecsNum',  'secsFill',  seconds,  60, pad(seconds));
}

function setUnit(numId, fillId, value, max, display) {
  const numEl  = document.getElementById(numId);
  const fillEl = document.getElementById(fillId);

  if (numEl) numEl.textContent = display;

  if (fillEl) {
    const progress = clamp(value / max, 0, 1);
    const offset   = CIRCUMFERENCE * (1 - progress);
    fillEl.style.strokeDasharray  = CIRCUMFERENCE;
    fillEl.style.strokeDashoffset = offset;
  }
}

function pad(n) {
  return String(n).padStart(2, '0');
}

/* ─────────────────────────────────────────────
   9. SCROLL REVEAL (IntersectionObserver)
───────────────────────────────────────────── */
function initScrollReveal() {
  const sections = $$('.reveal-section');
  if (!sections.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -10% 0px' });

  sections.forEach(s => observer.observe(s));
}

/** إظهار قسم فور الانتقال إليه (زر مشاهدة الدعوة / التنقل) */
function revealSectionElement(section) {
  if (!section) return;
  section.classList.add('is-revealed');

  if (typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.refresh();
    ScrollTrigger.getAll().forEach((st) => {
      const trigger = st.trigger;
      if (!trigger || !section.contains(trigger)) return;
      if (st.progress < 1 && st.animation) {
        st.animation.progress(1);
      }
    });
  }

  const invCard = section.querySelector('#invCard') || (section.id === 'invitation' ? $('#invCard') : null);
  if (invCard && typeof gsap !== 'undefined') {
    gsap.set(invCard, { opacity: 1, y: 0, scale: 1, rotationX: 0, clearProps: 'transform' });
  }

  section.querySelectorAll('.section-head > *').forEach((el) => {
    if (typeof gsap !== 'undefined') {
      gsap.set(el, { opacity: 1, y: 0, clearProps: 'all' });
    }
  });
}

/* ─────────────────────────────────────────────
   10. HERO ENTRANCE ANIMATIONS (GSAP)
───────────────────────────────────────────── */
function animateHeroEntrance() {
  if (typeof gsap === 'undefined') {
    // Fallback: plain CSS class reveal
    fallbackHeroReveal();
    return;
  }

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  tl
    .to('#heroPre', {
      opacity: 1, y: 0, duration: 0.9, delay: 0.1,
    })
    .to('#groomName', {
      opacity: 1, y: 0, duration: 1.1,
    }, '-=0.5')
    .to('#heroHeart', {
      opacity: 1, scale: 1, duration: 0.7, ease: 'back.out(2)',
    }, '-=0.7')
    .to('#brideName', {
      opacity: 1, y: 0, duration: 1.1,
    }, '-=0.8')
    .to('#heroDivider', {
      opacity: 1, duration: 0.8,
    }, '-=0.5')
    .to('#heroSubtitle', {
      opacity: 1, y: 0, duration: 0.9,
    }, '-=0.4')
    .to('#heroDate', {
      opacity: 1, y: 0, duration: 0.8,
    }, '-=0.5')
    .to('#heroBtns', {
      opacity: 1, y: 0, duration: 0.9,
    }, '-=0.4');
}

function fallbackHeroReveal() {
  const elements = [
    '#heroPre',
    '#groomName',
    '#heroHeart',
    '#brideName',
    '#heroDivider',
    '#heroSubtitle',
    '#heroDate',
    '#heroBtns',
  ];

  elements.forEach((sel, i) => {
    const el = $(sel);
    if (!el) return;
    setTimeout(() => {
      el.style.transition = 'opacity 0.9s ease, transform 0.9s ease';
      el.style.opacity    = '1';
      el.style.transform  = 'translateY(0) scale(1)';
    }, 200 + i * 180);
  });
}

/* ─────────────────────────────────────────────
   11. MOUSE PARALLAX (hero section)
───────────────────────────────────────────── */
function initParallax() {
  const hero = $('#hero');
  if (!hero || document.body.classList.contains('is-touch')) return;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function updateParallax() {
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    const dx = (mouseX - cx) / cx;  // -1 to 1
    const dy = (mouseY - cy) / cy;

    heroParallaxX = lerp(heroParallaxX, dx * 6, 0.03);
    heroParallaxY = lerp(heroParallaxY, dy * 4, 0.03);

    const content = $('#heroContent');
    if (content) {
      content.style.transform = `translate(${heroParallaxX * 0.5}px, ${heroParallaxY * 0.5}px)`;
    }

    // Move fog layers slightly opposite
    $$('.hero-fog').forEach((fog, i) => {
      const factor = (i + 1) * 0.8;
      fog.style.transform = `translateX(${-heroParallaxX * factor}px) translateY(${-heroParallaxY * factor}px)`;
    });

    requestAnimationFrame(updateParallax);
  }

  requestAnimationFrame(updateParallax);
}

/* ─────────────────────────────────────────────
   12. NAVIGATION DOTS — ACTIVE SECTION TRACKING
───────────────────────────────────────────── */
function initNavDots() {
  const dots    = $$('.nav-dot');
  const sections = $$('section[id]');
  if (!dots.length || !sections.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        dots.forEach(d => {
          d.classList.toggle('active', d.getAttribute('data-label')
            ? d.href && d.href.includes('#' + id)
            : d.getAttribute('href') === '#' + id
          );
        });
        // Simpler approach:
        dots.forEach(d => {
          const href = d.getAttribute('href');
          d.classList.toggle('active', href === '#' + id);
        });
      }
    });
  }, { threshold: window.innerWidth <= 768 ? 0.2 : 0.4 });

  sections.forEach(s => observer.observe(s));

  // Smooth scroll on dot click
  dots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = dot.getAttribute('href').replace('#', '');
      const target   = document.getElementById(targetId);
      if (target) {
        revealSectionElement(target);
        target.scrollIntoView({ behavior: PERF.isTouch ? 'auto' : 'smooth', block: 'start' });
        setTimeout(() => {
          revealSectionElement(target);
          if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
        }, 650);
      }
    });
  });
}

/* ─────────────────────────────────────────────
   13. INVITATION CARD — TILT EFFECT
───────────────────────────────────────────── */
function initCardTilt() {
  const card = $('#invCard');
  if (!card || document.body.classList.contains('is-touch')) return;

  card.addEventListener('mousemove', (e) => {
    const rect  = card.getBoundingClientRect();
    const cx    = rect.left + rect.width  / 2;
    const cy    = rect.top  + rect.height / 2;
    const dx    = (e.clientX - cx) / (rect.width  / 2);
    const dy    = (e.clientY - cy) / (rect.height / 2);
    const tiltX = dy * -8;
    const tiltY = dx *  8;

    card.style.transform = `
      perspective(1000px)
      rotateX(${tiltX}deg)
      rotateY(${tiltY}deg)
      translateY(-10px)
      scale(1.01)
    `;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transition = 'transform 0.7s cubic-bezier(0.34,1.56,0.64,1)';
  });

  card.addEventListener('mouseenter', () => {
    card.style.transition = 'transform 0.15s ease';
  });
}

/* ─────────────────────────────────────────────
   14. SMOOTH SCROLL (for hero buttons)
───────────────────────────────────────────── */
function initSmoothScroll() {
  const scrollBehavior = PERF.isTouch ? 'auto' : 'smooth';

  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        revealSectionElement(target);
        target.scrollIntoView({ behavior: scrollBehavior, block: 'start' });

        const afterScroll = () => {
          revealSectionElement(target);
          if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
        };
        setTimeout(afterScroll, 700);
        if ('onscrollend' in window) {
          window.addEventListener('scrollend', afterScroll, { once: true });
        }
      }
    });
  });
}

/* ─────────────────────────────────────────────
   18. GSAP SCROLL ANIMATIONS (if available)
───────────────────────────────────────────── */
function initGSAPScrollAnimations() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  if (gsapScrollInitialized) return;
  gsapScrollInitialized = true;

  gsap.registerPlugin(ScrollTrigger);

  if (PERF.isTouch) {
    ScrollTrigger.config({ limitCallbacks: true, syncInterval: 150 });
  }

  const fromScroll = { immediateRender: false };

  // Section titles stagger reveal
  $$('.section-head').forEach(head => {
    const children = head.children;
    gsap.from(children, {
      ...fromScroll,
      scrollTrigger: {
        trigger: head,
        start: 'top 85%',
        once: true,
      },
      opacity: 0,
      y: 30,
      duration: 0.9,
      stagger: 0.15,
      ease: 'power3.out',
    });
  });

  // Detail cards stagger
  gsap.from('.detail-card', {
    ...fromScroll,
    scrollTrigger: {
      trigger: '.details-grid',
      start: 'top 80%',
      once: true,
    },
    opacity: 0,
    y: 40,
    scale: 0.95,
    duration: 0.8,
    stagger: 0.2,
    ease: 'back.out(1.5)',
  });

  // Countdown units stagger
  gsap.from('.cd-unit-wrap', {
    ...fromScroll,
    scrollTrigger: {
      trigger: '.countdown-grid',
      start: 'top 80%',
      once: true,
    },
    opacity: 0,
    y: 40,
    scale: 0.8,
    duration: 0.8,
    stagger: 0.15,
    ease: 'back.out(2)',
  });

  // Invitation card entrance
  gsap.from('#invCard', {
    ...fromScroll,
    scrollTrigger: {
      trigger: '#invCard',
      start: 'top 85%',
      once: true,
    },
    opacity: 0,
    y: PERF.isTouch ? 36 : 60,
    scale: PERF.isTouch ? 0.98 : 0.92,
    rotationX: PERF.isTouch ? 0 : 8,
    duration: PERF.isTouch ? 0.85 : 1.2,
    ease: PERF.isTouch ? 'power3.out' : 'power4.out',
  });

  // Ending — خفيف (من غير نجوم/تأثيرات)
  gsap.from('#ending .ending-waiting, #ending .ending-photo-wrap, #ending .ending-couple, #ending .ending-couple-ar, #ending .ending-date', {
    ...fromScroll,
    scrollTrigger: { trigger: '#ending', start: 'top 88%', once: true },
    opacity: 0,
    y: 16,
    duration: 0.55,
    stagger: 0.06,
    ease: 'power2.out',
  });

  ScrollTrigger.refresh();
}

/* ─────────────────────────────────────────────
   19. SCROLL PROGRESS INDICATOR
───────────────────────────────────────────── */
function initScrollProgress() {
  if (PERF.isTouch) return;

  const bar = document.createElement('div');
  bar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    height: 2px;
    background: linear-gradient(90deg, #C9A84C, #E8B4B8, #C9A84C);
    z-index: 9000;
    transform-origin: left;
    transform: scaleX(0);
    transition: transform 0.1s linear;
    pointer-events: none;
    box-shadow: 0 0 8px rgba(201,168,76,0.7);
  `;
  document.body.appendChild(bar);

  window.addEventListener('scroll', () => {
    const total    = document.documentElement.scrollHeight - window.innerHeight;
    const progress = total > 0 ? window.scrollY / total : 0;
    bar.style.transform = `scaleX(${progress})`;
  }, { passive: true });
}

/* ─────────────────────────────────────────────
   21. INJECT SHAKE ANIMATION CSS (runtime)
───────────────────────────────────────────── */
function injectRuntimeStyles() {
  /* Reserved for runtime-injected styles if needed */
}

/* ─────────────────────────────────────────────
   22. DETAIL CARD CLICK RIPPLE
───────────────────────────────────────────── */
function initDetailCardRipple() {
  $$('.detail-card').forEach(card => {
    card.addEventListener('click', (e) => {
      const ripple = document.createElement('span');
      const rect   = card.getBoundingClientRect();
      const x      = e.clientX - rect.left;
      const y      = e.clientY - rect.top;

      ripple.style.cssText = `
        position: absolute;
        left: ${x}px;
        top:  ${y}px;
        width: 10px;
        height: 10px;
        background: rgba(201,168,76,0.4);
        border-radius: 50%;
        transform: translate(-50%, -50%) scale(0);
        animation: rippleExpand 0.6s ease forwards;
        pointer-events: none;
        z-index: 10;
      `;
      card.style.position = 'relative';
      card.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    });
  });

  const style = document.createElement('style');
  style.textContent = `
    @keyframes rippleExpand {
      to { transform: translate(-50%,-50%) scale(20); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}

/* ─────────────────────────────────────────────
   INIT — DOM READY
───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  applyResponsiveConfig();
  initPerformance();
  applySiteDates();
  // الـ envelope أول حاجة — الموقع بيتشغّل بعده
  initEnvelope();

  /* placeholder — المنطق الحقيقي اتنقل لـ initSiteAfterEnvelope */
  if (false) {
    // Section canvases
    ['invCanvas','cdCanvas','detCanvas'].forEach(id => {
      initSectionCanvas(id);
    });

    // Sparkles for invitation section
    createSparkles('invSparkles', document.body.classList.contains('is-touch') ? 5 : 8);
  }
});

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
  }, 200);
}, { passive: true });

window.addEventListener('load', () => {
  // لو الـ envelope لسه ظاهر، مش بنعمل حاجة — بيتعمل في initSiteAfterEnvelope
  if ($('#envelopeOverlay') && !$('#envelopeOverlay').classList.contains('is-gone')) return;

  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    initGSAPScrollAnimations();
    ScrollTrigger.refresh();
  }
  const hash = window.location.hash;
  if (hash) {
    const section = document.querySelector(hash);
    if (section?.classList.contains('reveal-section')) {
      revealSectionElement(section);
    }
  }
});
