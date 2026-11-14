/* ============================================================
   ЛОГИКА ВИКТОРИНЫ
   ============================================================ */
(function () {
  "use strict";

  const cfg = window.QUIZ_CONFIG;
  const questions = cfg.questions || [];

  const els = {
    intro: document.getElementById("screen-intro"),
    quiz: document.getElementById("screen-quiz"),
    result: document.getElementById("screen-result"),
    eyebrow: document.getElementById("intro-eyebrow"),
    title: document.getElementById("intro-title"),
    subtitle: document.getElementById("intro-subtitle"),
    hint: document.getElementById("intro-hint"),
    startBtn: document.getElementById("start-btn"),
    progressFill: document.getElementById("progress-fill"),
    progressLabel: document.getElementById("progress-label"),
    questionText: document.getElementById("question-text"),
    options: document.getElementById("options"),
    feedback: document.getElementById("feedback"),
    nextBtn: document.getElementById("next-btn"),
    scoreNumber: document.getElementById("score-number"),
    scoreTotal: document.getElementById("score-total"),
    scoreRing: document.getElementById("score-ring-value"),
    resultTitle: document.getElementById("result-title"),
    resultText: document.getElementById("result-text"),
    restartBtn: document.getElementById("restart-btn"),
    shareBtn: document.getElementById("share-btn"),
  };

  let current = 0;
  let score = 0;
  let locked = false;

  const RING_LEN = 2 * Math.PI * 52;

  /* ---------- вспомогательное ---------- */
  function showScreen(name) {
    [els.intro, els.quiz, els.result].forEach((s) =>
      s.classList.remove("screen--active")
    );
    ({ intro: els.intro, quiz: els.quiz, result: els.result }[name]).classList.add(
      "screen--active"
    );
  }

  /* ---------- приветствие ---------- */
  function initIntro() {
    const i = cfg.intro || {};
    if (i.eyebrow) els.eyebrow.textContent = i.eyebrow;
    if (i.title) els.title.textContent = i.title;
    if (i.subtitle) els.subtitle.textContent = i.subtitle;
    if (i.hint) els.hint.textContent = i.hint;
    if (i.button) els.startBtn.textContent = i.button;
  }

  /* ---------- викторина ---------- */
  function renderQuestion() {
    locked = false;
    const q = questions[current];

    els.progressLabel.textContent =
      "Вопрос " + (current + 1) + " из " + questions.length;
    els.progressFill.style.width =
      ((current / questions.length) * 100).toFixed(1) + "%";
    els.questionText.textContent = q.question;

    els.options.innerHTML = "";
    q.options.forEach(function (text, index) {
      const btn = document.createElement("button");
      btn.className = "option";
      btn.type = "button";
      btn.innerHTML =
        '<span class="option__mark">' +
        String.fromCharCode(1040 + index) +
        "</span><span>" +
        text +
        "</span>";
      btn.addEventListener("click", function () {
        selectAnswer(index, btn);
      });
      els.options.appendChild(btn);
    });

    els.feedback.hidden = true;
    els.feedback.className = "feedback";
    els.nextBtn.disabled = true;
    els.nextBtn.textContent =
      current === questions.length - 1 ? "Узнать результат" : "Далее";
  }

  function selectAnswer(index, btn) {
    if (locked) return;
    locked = true;

    const q = questions[current];
    const isRight = index === q.correct;
    if (isRight) score++;

    const buttons = els.options.querySelectorAll(".option");
    buttons.forEach(function (b, i) {
      b.disabled = true;
      if (i === q.correct) b.classList.add("option--correct");
      else if (i === index) b.classList.add("option--wrong");
    });

    els.feedback.hidden = false;
    if (isRight) {
      els.feedback.className = "feedback feedback--ok";
      els.feedback.textContent = "Верно! Молодец 💚";
    } else {
      els.feedback.className = "feedback feedback--no";
      els.feedback.textContent =
        "Почти! Правильный ответ: " + q.options[q.correct];
    }

    els.progressFill.style.width =
      (((current + 1) / questions.length) * 100).toFixed(1) + "%";
    els.nextBtn.disabled = false;
  }

  function nextQuestion() {
    if (!locked) return;
    current++;
    if (current < questions.length) {
      renderQuestion();
    } else {
      showResult();
    }
  }

  /* ---------- результат ---------- */
  function pickResult(percent) {
    const r = cfg.results || {};
    const list = [r.high, r.mid, r.low].filter(Boolean);
    list.sort((a, b) => b.min - a.min);
    for (let i = 0; i < list.length; i++) {
      if (percent >= list[i].min) return list[i];
    }
    return list[list.length - 1];
  }

  function showResult() {
    const percent = questions.length
      ? Math.round((score / questions.length) * 100)
      : 0;
    const res = pickResult(percent);

    els.scoreNumber.textContent = score;
    els.scoreTotal.textContent = "из " + questions.length;
    els.resultTitle.textContent = res.title;
    els.resultText.textContent = res.text;

    els.scoreRing.style.strokeDasharray = RING_LEN;
    els.scoreRing.style.strokeDashoffset = RING_LEN;
    showScreen("result");

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        els.scoreRing.style.strokeDashoffset = (
          RING_LEN * (1 - percent / 100)
        ).toFixed(1);
      });
    });

    if (percent >= 50) launchConfetti();
  }

  function restart() {
    current = 0;
    score = 0;
    showScreen("intro");
  }

  /* ---------- поделиться ---------- */
  function share() {
    const text =
      "Я прошёл(ла) викторину ко Дню матери на " +
      score +
      " из " +
      questions.length +
      "! ❤️";
    if (navigator.share) {
      navigator.share({ title: "День матери", text: text }).catch(function () {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(function () {
        els.shareBtn.textContent = "Скопировано!";
        setTimeout(function () {
          els.shareBtn.textContent = "Поделиться";
        }, 1800);
      });
    }
  }

  /* ---------- конфетти (без библиотек) ---------- */
  function launchConfetti() {
    const canvas = document.getElementById("confetti");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);

    const colors = ["#e0608a", "#e5a94a", "#6fbf97", "#c43f6d", "#ffd9e0"];
    const pieces = [];
    for (let i = 0; i < 140; i++) {
      pieces.push({
        x: Math.random() * window.innerWidth,
        y: -20 - Math.random() * window.innerHeight * 0.5,
        w: 6 + Math.random() * 8,
        h: 8 + Math.random() * 10,
        vy: 2 + Math.random() * 3,
        vx: -1.5 + Math.random() * 3,
        rot: Math.random() * Math.PI,
        vr: -0.1 + Math.random() * 0.2,
        color: colors[(Math.random() * colors.length) | 0],
      });
    }

    let frames = 0;
    (function draw() {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      pieces.forEach(function (p) {
        p.y += p.vy;
        p.x += p.vx;
        p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      frames++;
      if (frames < 260) requestAnimationFrame(draw);
      else ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    })();
  }

  /* ---------- лепестки на фоне ---------- */
  function initPetals() {
    const wrap = document.querySelector(".petals");
    if (!wrap) return;
    const glyphs = ["🌸", "🌷", "🌹", "💮", "🌺"];
    for (let i = 0; i < 14; i++) {
      const p = document.createElement("span");
      p.className = "petal";
      p.textContent = glyphs[(Math.random() * glyphs.length) | 0];
      p.style.left = Math.random() * 100 + "vw";
      p.style.fontSize = 16 + Math.random() * 18 + "px";
      p.style.animationDuration = 9 + Math.random() * 10 + "s";
      p.style.animationDelay = -Math.random() * 12 + "s";
      p.style.opacity = (0.35 + Math.random() * 0.45).toFixed(2);
      wrap.appendChild(p);
    }
  }

  /* ---------- события ---------- */
  els.startBtn.addEventListener("click", function () {
    current = 0;
    score = 0;
    showScreen("quiz");
    renderQuestion();
  });
  els.nextBtn.addEventListener("click", nextQuestion);
  els.restartBtn.addEventListener("click", restart);
  els.shareBtn.addEventListener("click", share);

  initIntro();
  initPetals();
})();
