'use strict';

const ParticleSystem = (() => {
  const PARTICLE_COUNT  = 55;
  const COLOR_ORO       = 'rgba(201, 168, 76,';
  const SIZE_MIN        = 1;
  const SIZE_MAX        = 3;
  const SPEED_MIN       = 0.3;
  const SPEED_MAX       = 0.9;
  const DRIFT_RANGE     = 0.4;

  let canvas, ctx, particles = [], animId;

  /**
   * @typedef {Object} Particle
   * @property {number} x
   * @property {number} y
   * @property {number} size
   * @property {number} speedY
   * @property {number} drift   
   * @property {number} opacity
   * @property {number} opacityTarget
   * @property {number} life    
   * @property {number} lifeRate 
   */

  function createParticle() {
    return {
      x:           Math.random() * canvas.width,
      y:           canvas.height + Math.random() * 40,
      size:        SIZE_MIN + Math.random() * (SIZE_MAX - SIZE_MIN),
      speedY:      SPEED_MIN + Math.random() * (SPEED_MAX - SPEED_MIN),
      drift:       (Math.random() - 0.5) * DRIFT_RANGE,
      opacity:     0,
      opacityTarget: 0.3 + Math.random() * 0.4,
      life:        0,
      lifeRate:    0.002 + Math.random() * 0.003,
    };
  }

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const p of particles) {
      p.life += p.lifeRate;
      const lifeCurve = Math.sin(p.life * Math.PI); // 0 → 1 → 0
      p.opacity = p.opacityTarget * lifeCurve;

      p.y -= p.speedY;
      p.x += p.drift;

      if (p.y < -10 || p.life >= 1) {
        Object.assign(p, createParticle());
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `${COLOR_ORO} ${p.opacity})`;
      ctx.fill();
    }

    animId = requestAnimationFrame(tick);
  }

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function init() {
    canvas = document.getElementById('particles-canvas');
    if (!canvas) return;

    ctx = canvas.getContext('2d');
    resize();

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = createParticle();
      p.y    = Math.random() * canvas.height;
      p.life = Math.random();                 
      particles.push(p);
    }

    window.addEventListener('resize', resize, { passive: true });
    tick();
  }

  return { init };
})();


const Countdown = (() => {
  const EVENT_DATE = new Date('2026-07-04T13:00:00');

  const MS = { DAY: 86_400_000, HOUR: 3_600_000, MINUTE: 60_000, SECOND: 1_000 };

  let elD, elH, elM, elS, container, intervalId;

  function setUnit(el, value) {
    const str = String(value).padStart(2, '0');
    if (el.textContent !== str) {
      el.textContent = str;
      el.classList.remove('tick');
      void el.offsetWidth;
      el.classList.add('tick');
      setTimeout(() => el.classList.remove('tick'), 150);
    }
  }

  function update() {
    const diff = EVENT_DATE - Date.now();

    if (diff <= 0) {
      clearInterval(intervalId);
      container.innerHTML = '<p class="countdown--done">¡Hoy es el gran día! 🎉</p>';
      return;
    }

    setUnit(elD, Math.floor(diff / MS.DAY));
    setUnit(elH, Math.floor((diff % MS.DAY)    / MS.HOUR));
    setUnit(elM, Math.floor((diff % MS.HOUR)   / MS.MINUTE));
    setUnit(elS, Math.floor((diff % MS.MINUTE) / MS.SECOND));
  }

  function init() {
    container = document.getElementById('countdown');
    if (!container) return;

    elD = document.getElementById('cd-d');
    elH = document.getElementById('cd-h');
    elM = document.getElementById('cd-m');
    elS = document.getElementById('cd-s');

    update();
    intervalId = setInterval(update, 1000);
  }

  return { init };
})();


const ScrollReveal = (() => {
  const THRESHOLD = 0.15;

  function init() {
    const targets = document.querySelectorAll('.reveal');
    if (!targets.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // una sola vez
        }
      });
    }, { threshold: THRESHOLD });

    targets.forEach((el) => observer.observe(el));
  }

  return { init };
})();


const HeroScroll = (() => {
  function init() {
    const btn     = document.getElementById('scroll-down');
    const target  = document.getElementById('mensaje');
    if (!btn || !target) return;

    btn.addEventListener('click', () => {
      target.scrollIntoView({ behavior: 'smooth' });
    });
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', () => {
  ParticleSystem.init();
  Countdown.init();
  ScrollReveal.init();
  HeroScroll.init();
});
