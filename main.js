/**
 * Invitación XV Años — Valentina Rosales
 * main.js
 *
 * Módulos:
 *  1. Partículas (Canvas API)
 *  2. Cuenta regresiva
 *  3. Scroll reveal (IntersectionObserver)
 *  4. Scroll CTA (hero button)
 */

'use strict';

/* ══════════════════════════════════════
   1. PARTÍCULAS
   Canvas ligero: puntos dorados que
   flotan desde abajo y se desvanecen.
══════════════════════════════════════ */
const ParticleSystem = (() => {
  const PARTICLE_COUNT  = 35;
  const COLOR_ORO       = 'rgba(184, 145, 42,';  // dorado terroso, visible en claro
  const SIZE_MIN        = 1;
  const SIZE_MAX        = 2.5;
  const SPEED_MIN       = 0.2;
  const SPEED_MAX       = 0.6;
  const DRIFT_RANGE     = 0.3;   // movimiento horizontal suave

  let canvas, ctx, particles = [], animId;

  /**
   * @typedef {Object} Particle
   * @property {number} x
   * @property {number} y
   * @property {number} size
   * @property {number} speedY
   * @property {number} drift    - velocidad horizontal suave
   * @property {number} opacity
   * @property {number} opacityTarget
   * @property {number} life     - 0 → 1 (progreso de vida)
   * @property {number} lifeRate - qué tan rápido avanza
   */

  /** Genera una partícula en posición aleatoria base. */
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

  /** Dibuja y actualiza todas las partículas. */
  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const p of particles) {
      // Progreso de vida: sube y baja suavemente
      p.life += p.lifeRate;
      const lifeCurve = Math.sin(p.life * Math.PI); // 0 → 1 → 0
      p.opacity = p.opacityTarget * lifeCurve;

      // Movimiento
      p.y -= p.speedY;
      p.x += p.drift;

      // Reset cuando sale por arriba o termina su ciclo
      if (p.y < -10 || p.life >= 1) {
        Object.assign(p, createParticle());
      }

      // Dibujar
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `${COLOR_ORO} ${p.opacity})`;
      ctx.fill();
    }

    animId = requestAnimationFrame(tick);
  }

  /** Ajusta el canvas al tamaño de la ventana. */
  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  /** Punto de entrada público. */
  function init() {
    canvas = document.getElementById('particles-canvas');
    if (!canvas) return;

    ctx = canvas.getContext('2d');
    resize();

    // Crear partículas escalonadas en distintas posiciones Y
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = createParticle();
      p.y    = Math.random() * canvas.height; // distribuir en altura inicial
      p.life = Math.random();                  // ciclo de vida al azar inicial
      particles.push(p);
    }

    window.addEventListener('resize', resize, { passive: true });
    tick();
  }

  return { init };
})();


/* ══════════════════════════════════════
   2. CUENTA REGRESIVA
   Actualiza cada segundo. Aplica una
   micro-animación al dígito que cambia.
══════════════════════════════════════ */
const Countdown = (() => {
  // ─── CONFIGURA AQUÍ LA FECHA DEL EVENTO ───
  const EVENT_DATE = new Date('2026-07-04T10:00:00');
  // ──────────────────────────────────────────

  const MS = { DAY: 86_400_000, HOUR: 3_600_000, MINUTE: 60_000, SECOND: 1_000 };

  let elD, elH, elM, elS, container, intervalId;

  /** Actualiza el texto de un elemento y activa la micro-animación. */
  function setUnit(el, value) {
    const str = String(value).padStart(2, '0');
    if (el.textContent !== str) {
      el.textContent = str;
      el.classList.remove('tick');
      // reflow necesario para reiniciar la clase
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


/* ══════════════════════════════════════
   3. SCROLL REVEAL
   IntersectionObserver: añade .visible
   cuando el elemento entra al viewport.
══════════════════════════════════════ */
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


/* ══════════════════════════════════════
   4. SCROLL CTA (botón del hero)
══════════════════════════════════════ */
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


/* ══════════════════════════════════════
   BOOTSTRAP — espera al DOM completo
══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  ParticleSystem.init();
  Countdown.init();
  ScrollReveal.init();
  HeroScroll.init();
});
