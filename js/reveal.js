/* ============================================================
   Страница «фото + текст» после верного ответа
   ============================================================ */
(function () {
  "use strict";

  const cfg = window.QUIZ_CONFIG || {};
  const questions = cfg.questions || [];

  const params = new URLSearchParams(location.search);
  let index = parseInt(params.get("q") || "1", 10) - 1;
  if (isNaN(index) || index < 0 || index >= questions.length) index = 0;

  const q = questions[index];
  const reveal = q.reveal || {};

  const img = document.getElementById("reveal-img");
  const text = document.getElementById("reveal-text");
  const next = document.getElementById("next-btn");

  if (reveal.photo) img.src = reveal.photo;
  img.alt = "";
  text.textContent = reveal.text || "";

  const isLast = index + 1 >= questions.length;
  if (isLast) {
    next.textContent = "К подарку";
    next.href = "final.html";
  } else {
    next.textContent = "Дальше";
    next.href = "question.html?q=" + (index + 2);
  }
})();
