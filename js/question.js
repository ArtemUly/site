/* ============================================================
   Страница вопроса: рассказ + варианты ответа
   ============================================================ */
(function () {
  "use strict";

  const cfg = window.QUIZ_CONFIG || {};
  const questions = cfg.questions || [];

  const params = new URLSearchParams(location.search);
  let index = parseInt(params.get("q") || "1", 10) - 1;
  if (isNaN(index) || index < 0 || index >= questions.length) index = 0;

  const q = questions[index];

  const els = {
    fill: document.getElementById("progress-fill"),
    label: document.getElementById("progress-label"),
    story: document.getElementById("story"),
    options: document.getElementById("options"),
    modal: document.getElementById("modal"),
    modalClose: document.getElementById("modal-close"),
  };

  els.label.textContent =
    "Вопрос " + (index + 1) + " из " + questions.length;
  els.fill.style.width =
    (((index + 1) / questions.length) * 100).toFixed(1) + "%";
  els.story.textContent = q.story;

  q.options.forEach(function (text, i) {
    const btn = document.createElement("button");
    btn.className = "option";
    btn.type = "button";
    btn.innerHTML =
      '<span class="option__mark">' +
      String.fromCharCode(1040 + i) +
      "</span><span>" +
      text +
      "</span>";
    btn.addEventListener("click", function () {
      if (i === q.correct) {
        location.href = "reveal.html?q=" + (index + 1);
      } else {
        openModal();
      }
    });
    els.options.appendChild(btn);
  });

  function openModal() {
    els.modal.hidden = false;
  }

  function closeModal() {
    els.modal.hidden = true;
  }

  els.modalClose.addEventListener("click", closeModal);
  els.modal.addEventListener("click", function (e) {
    if (e.target === els.modal) closeModal();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeModal();
  });
})();
