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
    questionPhoto: document.getElementById("question-photo"),
    questionPhotoImg: document.getElementById("question-photo-img"),
    options: document.getElementById("options"),
    sliderBlock: document.getElementById("slider-block"),
    slider: document.getElementById("slider"),
    sliderValue: document.getElementById("slider-value"),
    escapeBlock: document.getElementById("escape-block"),
    escapeStay: document.getElementById("escape-stay"),
    escapeRun: document.getElementById("escape-run"),
    gameBlock: document.getElementById("game-block"),
    hoop: document.getElementById("hoop"),
    hoopRing: document.getElementById("hoop-ring"),
    ball: document.getElementById("ball"),
    safeBlock: document.getElementById("safe-block"),
    safeHints: document.getElementById("safe-hints"),
    safeDevice: document.getElementById("safe-device"),
    safeDisplay: document.getElementById("safe-display"),
    safeKeys: document.getElementById("safe-keys"),
    safeSurprise: document.getElementById("safe-surprise"),
    wheelBlock: document.getElementById("wheel-block"),
    wheelStage: document.getElementById("wheel-stage"),
    wheelCanvas: document.getElementById("wheel-canvas"),
    modal: document.getElementById("modal"),
    modalClose: document.getElementById("modal-close"),
  };

  els.label.textContent = "Вопрос " + (index + 1) + " из " + questions.length;
  els.fill.style.width =
    (((index + 1) / questions.length) * 100).toFixed(1) + "%";
  els.story.textContent = q.story;

  if (q.photo) {
    els.questionPhotoImg.src = q.photo;
    els.questionPhotoImg.alt = "";
    els.questionPhoto.hidden = false;
  }

  if (q.bg === "stars") {
    document.body.classList.add("theme-stars");
    if (window.startStarfield) window.startStarfield();
  }

  function goNext() {
    location.href = "reveal.html?q=" + (index + 1);
  }

  function hideAll() {
    els.options.hidden = true;
    els.sliderBlock.hidden = true;
    els.escapeBlock.hidden = true;
    els.gameBlock.hidden = true;
    els.safeBlock.hidden = true;
    els.wheelBlock.hidden = true;
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

  /* ---------- забрось мяч в кольцо ---------- */
  function renderBasketball() {
    hideAll();
    els.gameBlock.hidden = false;

    const ball = els.ball;
    const ring = els.hoopRing;
    const hoop = els.hoop;
    const area = els.gameBlock;

    let dragging = false;
    let done = false;
    let offsetX = 0;
    let offsetY = 0;

    function onDown(e) {
      if (done) return;
      ball.classList.add("ball--dragging");
      const br = ball.getBoundingClientRect();
      offsetX = e.clientX - br.left;
      offsetY = e.clientY - br.top;
      dragging = true;
      e.preventDefault();
    }

    function onMove(e) {
      if (!dragging || done) return;
      const ar = area.getBoundingClientRect();
      let left = e.clientX - offsetX - ar.left;
      let top = e.clientY - offsetY - ar.top;
      left = Math.max(0, Math.min(left, ar.width - ball.offsetWidth));
      top = Math.max(0, Math.min(top, ar.height - ball.offsetHeight));
      ball.style.left = left + "px";
      ball.style.top = top + "px";
      ball.style.bottom = "auto";
      checkHit();
    }

    function onUp() {
      if (!dragging) return;
      dragging = false;
      ball.classList.remove("ball--dragging");
    }

    function checkHit() {
      if (done) return;
      const b = ball.getBoundingClientRect();
      const r = ring.getBoundingClientRect();
      const dist = Math.hypot(
        b.left + b.width / 2 - (r.left + r.width / 2),
        b.top + b.height / 2 - (r.top + r.height / 2)
      );
      if (dist < r.width * 0.4) success();
    }

    function success() {
      done = true;
      dragging = false;
      ball.classList.remove("ball--dragging");
      ball.classList.add("ball--in");
      hoop.classList.add("hoop--hot");

      const ar = area.getBoundingClientRect();
      const rr = ring.getBoundingClientRect();
      ball.style.left = rr.left - ar.left + (rr.width - ball.offsetWidth) / 2 + "px";
      ball.style.top = rr.top - ar.top + (rr.height - ball.offsetHeight) / 2 + "px";
      ball.style.bottom = "auto";

      setTimeout(goNext, 800);
    }

    ball.addEventListener("pointerdown", onDown);
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
    document.addEventListener("pointercancel", onUp);
  }

  /* ---------- сейф ---------- */
  function renderSafe() {
    hideAll();
    els.safeBlock.hidden = false;

    const cfg = q.safe || {};
    const code = String(cfg.code || "");
    const hints = cfg.questions || [];
    let entered = "";
    let opened = false;

    els.safeHints.innerHTML = "";
    hints.forEach(function (text) {
      const li = document.createElement("li");
      li.className = "safe__hint";
      li.textContent = text;
      els.safeHints.appendChild(li);
    });

    els.safeSurprise.textContent = cfg.button || "Сюрприз";
    els.safeSurprise.addEventListener("click", goNext);

    function renderDisplay() {
      let out = "";
      for (let i = 0; i < code.length; i++) {
        out += entered[i] != null ? entered[i] : "·";
      }
      els.safeDisplay.textContent = out;
    }
    renderDisplay();

    function reset() {
      entered = "";
      renderDisplay();
    }

    function press(digit) {
      if (opened || entered.length >= code.length) return;
      entered += digit;
      renderDisplay();
      if (entered.length < code.length) return;

      if (entered === code) {
        opened = true;
        els.safeBlock.classList.add("safe--open");
        setTimeout(function () {
          els.safeSurprise.hidden = false;
        }, 700);
      } else {
        els.safeBlock.classList.add("safe--shake");
        setTimeout(function () {
          els.safeBlock.classList.remove("safe--shake");
          reset();
        }, 500);
      }
    }

    function backspace() {
      if (opened) return;
      entered = entered.slice(0, -1);
      renderDisplay();
    }

    els.safeKeys.innerHTML = "";
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"].forEach(
      function (key) {
        if (key === "") {
          const gap = document.createElement("span");
          gap.className = "safe__key safe__key--empty";
          els.safeKeys.appendChild(gap);
          return;
        }
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "safe__key";
        btn.textContent = key;
        btn.addEventListener("click", function () {
          if (key === "⌫") backspace();
          else press(key);
        });
        els.safeKeys.appendChild(btn);
      }
    );

    document.addEventListener("keydown", function (e) {
      if (e.key >= "0" && e.key <= "9") press(e.key);
      else if (e.key === "Backspace") {
        e.preventDefault();
        backspace();
      }
    });
  }

  /* ---------- колесо «Поле чудес» ---------- */
  function renderWheel() {
    hideAll();
    els.wheelBlock.hidden = false;

    const cfg = q.wheel || {};
    const names = cfg.names || [];
    const target = cfg.target || names[0];
    const targetIndex = Math.max(0, names.indexOf(target));
    const n = names.length;

    const canvas = els.wheelCanvas;
    const ctx = canvas.getContext("2d");
    const size = canvas.width;
    const cx = size / 2;
    const cy = size / 2;
    const radius = size / 2 - 12;
    const seg = (Math.PI * 2) / n;
    const palette = [
      "#e0608a",
      "#f0a93a",
      "#5aa9e6",
      "#6fbf73",
      "#a679d2",
      "#ef7d3f",
      "#f2c14e",
      "#4bbfa8",
    ];

    ctx.clearRect(0, 0, size, size);
    for (let i = 0; i < n; i++) {
      const a0 = i * seg;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, a0, a0 + seg);
      ctx.closePath();
      ctx.fillStyle = palette[i % palette.length];
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
      ctx.stroke();

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(a0 + seg / 2);
      ctx.fillStyle = "#fff";
      ctx.font = "700 " + Math.round(size * 0.05) + "px Comfortaa, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(names[i], radius * 0.63, 0);
      ctx.restore();
    }

    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.lineWidth = 16;
    ctx.strokeStyle = "#f2c14e";
    ctx.stroke();

    let spinning = false;
    let rotation = 0;

    function spin() {
      if (spinning) return;
      spinning = true;
      els.wheelStage.classList.add("wheel--spinning");

      const midDeg = (targetIndex + 0.5) * (360 / n);
      const targetRotation = 270 - midDeg + 360 * 6;

      canvas.style.transition = "transform 7s cubic-bezier(0.17, 0.67, 0.16, 0.99)";
      void canvas.offsetWidth;
      rotation += targetRotation;
      canvas.style.transform = "rotate(" + rotation + "deg)";

      setTimeout(goNext, 7400);
    }

    els.wheelStage.addEventListener("click", spin);
    document.addEventListener("keydown", function (e) {
      if (e.key === " " || e.key === "Enter") spin();
    });
  }

  if (q.type === "slider") {
    renderSlider();
  } else if (q.type === "escape") {
    renderEscape();
  } else if (q.type === "basketball") {
    renderBasketball();
  } else if (q.type === "safe") {
    renderSafe();
  } else if (q.type === "wheel") {
    renderWheel();
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
