/* ============================================================
   Фон «звёздное небо»: бесконечное поле мерцающих звёзд
   ============================================================ */
window.startStarfield = function () {
  "use strict";

  const canvas = document.createElement("canvas");
  canvas.className = "stars-canvas";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  let stars = [];
  let w = 0;
  let h = 0;
  let dpr = 1;
  let tick = 0;

  function build() {
    const count = Math.max(160, Math.floor((window.innerWidth * window.innerHeight) / 2000));
    stars = [];
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: (Math.random() * 1.4 + 0.4) * dpr,
        base: Math.random() * 0.45 + 0.5,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.03 + 0.006,
        cool: Math.random() < 0.18,
      });
    }
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.width = Math.floor(window.innerWidth * dpr);
    h = canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    build();
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    tick += 1;
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      const twinkle = s.base + Math.sin(s.phase + tick * s.speed) * 0.4;
      const alpha = Math.max(0.08, Math.min(1, twinkle));
      ctx.beginPath();
      ctx.fillStyle =
        (s.cool ? "rgba(178,198,255," : "rgba(255,255,255,") + alpha.toFixed(3) + ")";
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize);
  resize();
  draw();
};
