/* ============================================================
   Праздничный финал: конфетти в палитре проекта.
   Уважает prefers-reduced-motion.
   ============================================================ */
(function () {
  "use strict";

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const canvas = document.createElement("canvas");
  canvas.className = "confetti-canvas";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  const colors = [
    "#e0608a",
    "#c43f6d",
    "#f2c14e",
    "#ffd45e",
    "#ffe3ea",
    "#a679d2",
    "#ffffff",
  ];

  let w = 0;
  let h = 0;
  let dpr = 1;
  let parts = [];
  const start = performance.now();

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.width = Math.floor(window.innerWidth * dpr);
    h = canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
  }

  function spawn(n) {
    for (let i = 0; i < n; i++) {
      parts.push({
        x: Math.random() * w,
        y: -Math.random() * h * 0.4,
        w: (6 + Math.random() * 8) * dpr,
        h: (8 + Math.random() * 10) * dpr,
        vy: (1.4 + Math.random() * 2.2) * dpr,
        vx: (-0.6 + Math.random() * 1.2) * dpr,
        rot: Math.random() * Math.PI,
        vr: -0.08 + Math.random() * 0.16,
        color: colors[(Math.random() * colors.length) | 0],
      });
    }
  }

  function frame(now) {
    ctx.clearRect(0, 0, w, h);

    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.01 * dpr;
      p.rot += p.vr;

      if (p.y > h + 40 * dpr) {
        parts.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }

    if (now - start < 3500 && parts.length < 280) spawn(3);

    if (now - start < 6500 || parts.length) {
      requestAnimationFrame(frame);
    } else {
      ctx.clearRect(0, 0, w, h);
      canvas.remove();
    }
  }

  window.addEventListener("resize", resize);
  resize();
  spawn(90);
  requestAnimationFrame(frame);
})();
