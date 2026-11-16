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
    wipeBlock: document.getElementById("wipe-block"),
    wipeWindow: document.getElementById("wipe-window"),
    wipeCanvas: document.getElementById("wipe-canvas"),
    wipeContent: document.getElementById("wipe-content"),
    wipeBtn: document.getElementById("wipe-btn"),
    wipeFill: document.getElementById("wipe-fill"),
    burgerBlock: document.getElementById("burger-block"),
    burgerPlate: document.getElementById("burger-plate"),
    burgerStack: document.getElementById("burger-stack"),
    burgerItems: document.getElementById("burger-items"),
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
    els.wipeBlock.hidden = true;
    els.burgerBlock.hidden = true;
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

  /* ---------- запотевшее стекло ---------- */
  function renderWipe() {
    hideAll();
    els.wipeBlock.hidden = false;

    const canvas = els.wipeCanvas;
    const win = els.wipeWindow;
    const ctx = canvas.getContext("2d");

    let brush = 30;
    let drawing = false;
    let done = false;
    let moves = 0;

    function fillFrost() {
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const g = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      g.addColorStop(0, "#ffffff");
      g.addColorStop(0.5, "#ffffff");
      g.addColorStop(1, "#fcfdff");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const dots = (canvas.width * canvas.height) / 150;
      for (let i = 0; i < dots; i++) {
        ctx.fillStyle = "rgba(255,255,255," + (Math.random() * 0.5 + 0.2).toFixed(2) + ")";
        ctx.beginPath();
        ctx.arc(
          Math.random() * canvas.width,
          Math.random() * canvas.height,
          Math.random() * 1.6 + 0.4,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }

      ctx.fillStyle = "rgba(120, 140, 160, 0.32)";
      ctx.font = "600 15px Comfortaa, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("сотри налёт", canvas.width / 2, canvas.height / 2);
    }

    function resize() {
      const rect = win.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(rect.width));
      canvas.height = Math.max(1, Math.round(rect.height));
      brush = Math.max(26, canvas.width * 0.11);
      done = false;
      els.wipeContent.hidden = true;
      els.wipeFill.style.width = "0%";
      canvas.classList.remove("wipe__canvas--done");
      fillFrost();
    }

    function pos(e) {
      const rect = canvas.getBoundingClientRect();
      return {
        x: (e.clientX - rect.left) * (canvas.width / rect.width),
        y: (e.clientY - rect.top) * (canvas.height / rect.height),
      };
    }

    function erase(x, y) {
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(x, y, brush, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
    }

    function check() {
      if (done) return;
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let clear = 0;
      let total = 0;
      for (let i = 3; i < data.length; i += 20) {
        total++;
        if (data[i] < 40) clear++;
      }
      const ratio = total ? clear / total : 0;
      els.wipeFill.style.width = Math.min(100, ratio * 100).toFixed(0) + "%";
      if (ratio > 0.95) finish();
    }

    function finish() {
      done = true;
      drawing = false;
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "source-over";
      canvas.classList.add("wipe__canvas--done");
      els.wipeFill.style.width = "100%";
      els.wipeContent.hidden = false;
    }

    function onDown(e) {
      if (done) return;
      drawing = true;
      const p = pos(e);
      erase(p.x, p.y);
      e.preventDefault();
    }

    function onMove(e) {
      if (!drawing || done) return;
      const p = pos(e);
      erase(p.x, p.y);
      moves++;
      if (moves % 5 === 0) check();
      e.preventDefault();
    }

    function onUp() {
      if (!drawing) return;
      drawing = false;
      check();
    }

    els.wipeBtn.addEventListener("click", goNext);
    canvas.addEventListener("pointerdown", onDown);
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
    document.addEventListener("pointercancel", onUp);

    let resizeTimer = null;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 200);
    });

    resize();
  }

  /* ---------- собери бутерброд ---------- */
  const BURGER_INGREDIENTS = {
    "bun-bottom": { label: "Нижняя булочка", emoji: "🥯" },
    cutlet: { label: "Котлета", emoji: "🥩" },
    lettuce: { label: "Салат", emoji: "🥬" },
    cheese: { label: "Сыр", emoji: "🧀" },
    top: { label: "Верхняя булочка", emoji: "🍔" },
  };

  function renderBurger() {
    hideAll();
    els.burgerBlock.hidden = false;

    const cfg = q.burger || {};
    const order = cfg.order || ["bun-bottom", "cutlet", "lettuce", "cheese", "top"];
    let step = 0;
    let done = false;

    els.burgerStack.innerHTML = "";
    els.burgerItems.innerHTML = "";

    const keys = order.slice();
    for (let i = keys.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = keys[i];
      keys[i] = keys[j];
      keys[j] = tmp;
    }

    keys.forEach(function (key) {
      const info = BURGER_INGREDIENTS[key] || { label: key, emoji: "" };
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "ing";
      btn.innerHTML =
        '<span class="ing__emoji">' + info.emoji + "</span><span>" + info.label + "</span>";
      btn.addEventListener("click", function () {
        pick(key, btn);
      });
      els.burgerItems.appendChild(btn);
    });

    function pick(key, btn) {
      if (done) return;
      if (key === order[step]) {
        const layer = document.createElement("div");
        layer.className = "layer layer--" + key;
        els.burgerStack.appendChild(layer);
        btn.classList.add("ing--used");
        step++;
        if (step === order.length) {
          done = true;
          setTimeout(goNext, 900);
        }
      } else {
        els.burgerPlate.classList.remove("is-wrong");
        btn.classList.remove("ing--wrong");
        void els.burgerPlate.offsetWidth;
        els.burgerPlate.classList.add("is-wrong");
        btn.classList.add("ing--wrong");
        setTimeout(function () {
          els.burgerPlate.classList.remove("is-wrong");
          btn.classList.remove("ing--wrong");
        }, 450);
      }
    }
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
  } else if (q.type === "wipe") {
    renderWipe();
  } else if (q.type === "burger") {
    renderBurger();
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
