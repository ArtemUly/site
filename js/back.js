/* ============================================================
   Кнопка «Предыдущий вопрос» в верхнем левом углу.
   На первой странице (index.html) не показывается.
   Переход на предыдущую страницу обнуляет ответ (страницы без состояния).
   ============================================================ */
(function () {
  "use strict";

  const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  const params = new URLSearchParams(location.search);
  const q = parseInt(params.get("q") || "1", 10) || 1;
  const cfg = window.QUIZ_CONFIG || {};
  const total = (cfg.questions && cfg.questions.length) || 0;

  let prev = null;

  if (path === "question.html") {
    prev = q <= 1 ? "index.html" : "question.html?q=" + (q - 1);
  } else if (path === "reveal.html") {
    prev = "question.html?q=" + q;
  } else if (path === "final.html") {
    prev = total ? "question.html?q=" + total : "index.html";
  } else if (path === "gift.html") {
    prev = "final.html";
  }

  if (!prev) return;

  document.body.classList.add("has-back");

  const link = document.createElement("a");
  link.className = "back-link";
  link.href = prev;
  link.setAttribute("aria-label", "Предыдущий вопрос");
  link.innerHTML =
    '<span class="back-link__arrow" aria-hidden="true">←</span><span>Предыдущий вопрос</span>';
  document.body.appendChild(link);
})();
