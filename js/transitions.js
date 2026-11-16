/* ============================================================
   Живые переходы между страницами: мягкое «растворение» при уходе.
   Уважает prefers-reduced-motion.
   ============================================================ */
(function () {
  "use strict";

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  document.addEventListener("click", function (e) {
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey
    ) {
      return;
    }

    const link = e.target.closest && e.target.closest("a[href]");
    if (!link) return;
    if (link.target && link.target !== "_self") return;

    const href = link.getAttribute("href");
    if (!href || href.charAt(0) === "#" || /^(https?:|mailto:|tel:)/i.test(href)) {
      return;
    }

    e.preventDefault();
    const main = document.querySelector(".stage, .landing");
    if (main) main.classList.add("is-leaving");
    setTimeout(function () {
      location.href = href;
    }, 220);
  });
})();
