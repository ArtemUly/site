/* ============================================================
   Страница вопроса: рассказ + варианты ответа ИЛИ слайдер
   ИЛИ убегающая кнопка
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
    sliderBlock: document.getElementById("slider-block"),
    slider: document.getElementById("slider"),
    sliderValue: document.getElementById("slider-value"),
    escapeBlock: document.getElementById("escape-block"),
    escapeStay: document.getElementById("escape-stay"),
    escapeRun: document.getElementById("escape-run"),
    modal: document.getElementById("modal"),
    modalClose: document.getElementById("modal-close"),
  };

  els.label.textContent = "Вопрос " + (index + 1) + " из " + questions.length;
  els.fill.style.width =
    (((index + 1) / questions.length) * 100).toFixed(1) + "%";
  els.story.textContent = q.story;

  function goNext() {
    location.href = "reveal.html?q=" + (index + 1);
  }

  function hideAll() {
    els.options.hidden = true;
    els.sliderBlock.hidden = true;
    els.escapeBlock.hidden = true;
  }

  /* ---------- слайдер ---------- */
  function renderSlider() {
    const cfgSlider = q.slider || {};
    const min = cfgSlider.min != null ? cfgSlider.min : 0;
    const max = cfgSlider.max != null ? cfgSlider.max : 100;
    const target = cfgSlider.target != null ? cfgSlider.target : max;

    hideAll();
    els.sliderBlock.hidden = false;
    els.slider.min = min;
    els.slider.max = max;
    els.slider.value = min;
    els.sliderValue.textContent = min;

    els.slider.addEventListener("input", function () {
      const value = parseInt(els.slider.value, 10);
      els.sliderValue.textContent = value;
      if (value >= target) {
        els.slider.disabled = true;
        setTimeout(goNext, 250);
      }
    });
  }

  /* ---------- варианты ответа ---------- */
  function renderOptions() {
    hideAll();
    els.options.hidden = false;
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
        if (i === q.correct) goNext();
        else openModal();
      });
      els.options.appendChild(btn);
    });
  }

  /* ---------- убегающая кнопка ---------- */
  function renderEscape() {
    hideAll();
    els.escapeBlock.hidden = false;

    const buttons = [els.escapeStay, els.escapeRun];

    buttons.forEach(function (btn, i) {
      btn.textContent = q.options[i];
      if (i === q.correct) {
        btn.addEventListener("click", goNext);
      } else {
        makeEscape(btn);
      }
    });
  }

  function makeEscape(btn) {
    let x = 0;
    let y = 0;

    function run() {
      const rect = btn.getBoundingClientRect();
      const baseLeft = rect.left - x;
      const baseTop = rect.top - y;

      const margin = 12;
      const minDx = Math.max(-(baseLeft - margin), -220);
      const maxDx = Math.min(window.innerWidth - (baseLeft + rect.width) - margin, 220);
      const minDy = Math.max(-(baseTop - margin), -180);
      const maxDy = Math.min(window.innerHeight - (baseTop + rect.height) - margin, 180);

      x = minDx + Math.random() * (maxDx - minDx);
      y = minDy + Math.random() * (maxDy - minDy);
      btn.style.transform = "translate(" + x + "px," + y + "px)";
    }

    btn.addEventListener("mouseenter", run);
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      run();
    });
    btn.addEventListener(
      "touchstart",
      function (e) {
        e.preventDefault();
        run();
      },
      { passive: false }
    );
  }

  if (q.type === "slider") {
    renderSlider();
  } else if (q.type === "escape") {
    renderEscape();
  } else {
    renderOptions();
  }

  /* ---------- модалка ---------- */
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
