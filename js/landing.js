/* ============================================================
   Фон-мозаика из всех фотографий
   ============================================================ */
(function () {
  "use strict";

  const photos = [
    "assets/photos/bolnitsa.jpg",
    "assets/photos/v-kofeyne.jpg",
    "assets/photos/v-palate.jpg",
    "assets/photos/vkusno.jpg",
    "assets/photos/igrushki-iz-avtomata.jpg",
    "assets/photos/korabl.jpg",
    "assets/photos/krovat.jpg",
    "assets/photos/kupaemsya.jpg",
    "assets/photos/kupanie.jpg",
    "assets/photos/letaet.jpg",
    "assets/photos/na-prieme.jpg",
    "assets/photos/ne-udobno.jpg",
    "assets/photos/nogi-na-verh.jpg",
    "assets/photos/otdyhaem.jpg",
    "assets/photos/podarochek.jpg",
    "assets/photos/polet.jpg",
    "assets/photos/poyavlenie.jpg",
    "assets/photos/s-tablichkoy.jpg",
    "assets/photos/smotrim-nazad.jpg",
    "assets/photos/son.jpg",
    "assets/photos/u-bolnitsa.jpg",
    "assets/photos/ukazyvaet-put.jpg",
    "assets/photos/ulybaki.jpg",
  ];

  const mosaic = document.getElementById("mosaic");
  if (!mosaic || !photos.length) return;

  const TILE = 160;

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function build() {
    const cols = Math.max(3, Math.ceil(window.innerWidth / TILE));
    const rows = Math.max(3, Math.ceil(window.innerHeight / TILE));
    const total = cols * rows;

    mosaic.style.gridTemplateColumns = "repeat(" + cols + ", 1fr)";
    mosaic.style.gridAutoRows = window.innerHeight / rows + "px";

    const pool = [];
    while (pool.length < total) {
      pool.push.apply(pool, shuffle(photos.slice()));
    }

    const frag = document.createDocumentFragment();
    for (let i = 0; i < total; i++) {
      const img = document.createElement("img");
      img.src = pool[i];
      img.alt = "";
      img.decoding = "async";
      img.style.animationDelay = (Math.random() * 0.9).toFixed(2) + "s";
      frag.appendChild(img);
    }
    mosaic.innerHTML = "";
    mosaic.appendChild(frag);
  }

  build();

  let t;
  window.addEventListener("resize", function () {
    clearTimeout(t);
    t = setTimeout(build, 350);
  });
})();
