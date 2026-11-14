/* ============================================================
   Падающие эмодзи (цветы + собачки)
   ============================================================ */
(function () {
  "use strict";

  const wrap = document.getElementById("falling");
  if (!wrap) return;

  const emojis = [
    "🌸", "🌷", "🌹", "🌺", "💮", "🌼", "🏵️", "💐",
    "🐶", "🐕", "🐩", "🦮", "🐕‍🦺", "🐾",
  ];

  const COUNT = 26;

  for (let i = 0; i < COUNT; i++) {
    const s = document.createElement("span");
    s.textContent = emojis[(Math.random() * emojis.length) | 0];
    s.style.left = Math.random() * 100 + "vw";
    s.style.fontSize = 18 + Math.random() * 26 + "px";
    s.style.animationDuration = 8 + Math.random() * 12 + "s";
    s.style.animationDelay = -Math.random() * 20 + "s";
    s.style.opacity = (0.5 + Math.random() * 0.5).toFixed(2);
    wrap.appendChild(s);
  }
})();
