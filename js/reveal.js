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

  const chapter = Math.min(4, Math.floor((index / questions.length) * 4) + 1);
  document.body.classList.add("chapter-" + chapter);

  const img = document.getElementById("reveal-img");
  const video = document.getElementById("reveal-video");
  const text = document.getElementById("reveal-text");
  const next = document.getElementById("next-btn");

  if (reveal.video) {
    video.src = reveal.video;
    video.hidden = false;
    img.hidden = true;
  } else {
    if (reveal.photo) img.src = reveal.photo;
    img.alt = "";
    img.hidden = false;
    video.hidden = true;
    const frame = document.querySelector(".reveal-photo");
    if (frame) frame.classList.add("polaroid");
  }
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
