/* =====================================================
   GLOBAL CONFIG — UBAH BAGIAN INI UNTUK PERSONALISASI
   ===================================================== */

const CONFIG = {
  name: "nama apa aja",
  birthDate: "2010-01-01",
  timerStart: "2010-01-01T00:00:00"
};

const GITHUB = {
  username: "USERNAME_GITHUB",
  repository: "birthday-web",
  branch: "main"
};

/* =====================================================
   KONTEN YANG BISA KAMU EDIT
   ===================================================== */

const LITTLE_THINGS = [
  "Semoga kamu selalu punya alasan kecil untuk tersenyum setiap hari. 🤍",
  "Semoga hal-hal yang kamu tunggu datang pada waktu yang paling tepat.",
  "Semoga kamu tetap percaya pada dirimu sendiri, bahkan ketika semuanya terasa pelan.",
  "Semoga kamu bertemu lebih banyak orang yang tulus dan membuatmu merasa dihargai.",
  "Semoga setiap langkah kecilmu tetap terasa berarti.",
  "Semoga kamu punya lebih banyak hari yang ingin kamu simpan dalam ingatan.",
  "Semoga kamu tidak terlalu keras pada dirimu sendiri.",
  "Semoga semua usaha yang tidak terlihat akhirnya menemukan hasilnya.",
  "Semoga tahun baru dalam hidupmu membawa cerita yang lebih hangat.",
  "Dan yang paling penting, semoga kamu bahagia menjadi dirimu sendiri. ✨"
];

/*
  Ganti pertanyaan, pilihan, dan jawaban kuis ini
  dengan cerita asli kalian.
  answer menggunakan indeks: 0 = pilihan pertama.
*/
const QUIZ = [
  {
    question: "Contoh pertanyaan kecil yang bisa kamu ganti sendiri?",
    options: ["Jawaban A", "Jawaban B", "Jawaban C"],
    answer: 0
  },
  {
    question: "Momen mana yang paling ingin kita ingat?",
    options: ["Momen pertama", "Momen random", "Semua momen"],
    answer: 2
  },
  {
    question: "Apa yang paling cocok menggambarkan website kecil ini?",
    options: ["A little world", "A shopping site", "A dashboard"],
    answer: 0
  },
  {
    question: "Kalau ada satu hal yang ingin disimpan lebih lama?",
    options: ["Kenangan", "Notifikasi", "Deadline"],
    answer: 0
  },
  {
    question: "Apa yang biasanya membuat sebuah lagu terasa spesial?",
    options: ["Cerita di baliknya", "Durasi", "Jumlah tombol"],
    answer: 0
  },
  {
    question: "Apa yang sebaiknya dilakukan di hari ulang tahun?",
    options: ["Menikmati hari", "Terlalu memikirkan semuanya", "Tidak boleh tersenyum"],
    answer: 0
  },
  {
    question: "Apa pesan terakhir dari little world ini?",
    options: ["Stay exactly the same", "Keep the good memories", "Forget today"],
    answer: 1
  }
];

/* =====================================================
   GLOBAL STATE
   ===================================================== */

const state = {
  currentRoute: "home",
  memories: [],
  memoryIndex: 0,
  memoryTouchStartX: null,
  memoryDragging: false,
  songs: [],
  littleIndex: 0,
  quizIndex: 0,
  quizScore: 0,
  quizAnswered: false,
  surpriseImages: []
};

const $ = (selector, parent = document) =>
  parent.querySelector(selector);

const $$ = (selector, parent = document) =>
  [...parent.querySelectorAll(selector)];

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

/* =====================================================
   PERSONALISASI NAMA DAN TANGGAL
   ===================================================== */

function applyName() {
  $$("[data-name]").forEach(element => {
    element.textContent = CONFIG.name;
  });

  document.title = `A Little Birthday World — ${CONFIG.name}`;
}

function parseLocalDate(value) {
  /*
    Format tanggal tanpa zona waktu:
    YYYY-MM-DD
    YYYY-MM-DDTHH:mm:ss

    Diproses sebagai waktu lokal perangkat.
  */
  const match = String(value).match(
    /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2}))?)?$/
  );

  if (!match) return new Date(NaN);

  const [, year, month, day, hour = "0", minute = "0", second = "0"] = match;

  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second)
  );

  // Mencegah tanggal tidak valid diam-diam berubah.
  if (
    date.getFullYear() !== Number(year) ||
    date.getMonth() !== Number(month) - 1 ||
    date.getDate() !== Number(day)
  ) {
    return new Date(NaN);
  }

  return date;
}

function formatLongDate(date) {
  if (Number.isNaN(date.getTime())) return "TANGGAL BELUM DIATUR";

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date).toUpperCase();
}

function formatSinceDate(value) {
  const date = parseLocalDate(value);

  if (Number.isNaN(date.getTime())) {
    return "Tanggal timer belum valid";
  }

  return `Since ${new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date)}`;
}

function pad(value) {
  return String(Math.max(0, value)).padStart(2, "0");
}

/* =====================================================
   REALTIME TIMER
   ===================================================== */

function elapsedCalendar(start, end) {
  if (end < start) {
    return {
      years: 0,
      months: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0
    };
  }

  /*
    Hitung tahun dan bulan berdasarkan kalender,
    lalu hitung sisa hari, jam, menit, dan detik.
  */

  let years = end.getFullYear() - start.getFullYear();

  let cursor = new Date(start);
  cursor.setFullYear(start.getFullYear() + years);

  if (cursor > end) {
    years--;
    cursor = new Date(start);
    cursor.setFullYear(start.getFullYear() + years);
  }

  let months = 0;

  while (months < 11) {
    const next = new Date(cursor);
    next.setMonth(cursor.getMonth() + 1);

    if (next > end) break;

    cursor = next;
    months++;
  }

  let remainingMs = end - cursor;

  const days = Math.floor(remainingMs / 86400000);
  remainingMs -= days * 86400000;

  const hours = Math.floor(remainingMs / 3600000);
  remainingMs -= hours * 3600000;

  const minutes = Math.floor(remainingMs / 60000);
  remainingMs -= minutes * 60000;

  const seconds = Math.floor(remainingMs / 1000);

  return { years, months, days, hours, minutes, seconds };
}

function updateTimer() {
  const start = parseLocalDate(CONFIG.timerStart);
  const now = new Date();

  if (Number.isNaN(start.getTime())) {
    $("#timerSince").textContent = "Periksa konfigurasi timerStart";
    return;
  }

  const elapsed = elapsedCalendar(start, now);

  Object.entries(elapsed).forEach(([unit, value]) => {
    const element = $(`[data-unit="${unit}"]`);

    if (!element) return;

    const nextValue = pad(value);

    if (element.textContent !== nextValue) {
      element.textContent = nextValue;
      element.classList.remove("tick");

      void element.offsetWidth;

      element.classList.add("tick");
    }
  });

  $("#timerSince").textContent = formatSinceDate(CONFIG.timerStart);
}

/* =====================================================
   OPENING SCREEN
   ===================================================== */

function setupOpening() {
  const textElement = $("#openingText");

  const lines = [
    "Hari ini adalah hari yang spesial...",
    "Karena seseorang yang luar biasa sedang bertambah usia.",
    `Selamat ulang tahun, ${CONFIG.name} 🤍`
  ];

  const particles = $("#openingParticles");
  const symbols = ["♡", "✦", "·", "✧", "♡", "✦", "·"];

  symbols.forEach((symbol, index) => {
    const span = document.createElement("span");

    span.textContent = symbol;
    span.style.left = `${8 + (index * 14) % 86}%`;
    span.style.top = `${12 + (index * 19) % 76}%`;
    span.style.fontSize = `${10 + (index % 4) * 6}px`;
    span.style.animationDelay = `${index * -0.8}s`;

    particles.appendChild(span);
  });

  let index = 0;

  function showLine() {
    textElement.classList.remove("show");
    textElement.textContent = "";

    setTimeout(() => {
      textElement.textContent = lines[index];
      textElement.classList.add("show");
    }, 260);
  }

  showLine();

  const interval = setInterval(() => {
    index++;

    if (index >= lines.length) {
      clearInterval(interval);

      setTimeout(() => {
        $("#opening").classList.add("done");
        $("#app").classList.remove("is-hidden");
      }, 2200);

      return;
    }

    showLine();
  }, 2500);
}

/* =====================================================
   GITHUB API — MEMBACA FILE ASSETS
   ===================================================== */

/*
  Penting:
  Browser tidak bisa otomatis membaca isi folder lokal
  atau folder GitHub hanya dari nama foldernya.

  Karena itu, gunakan GitHub Contents API untuk mengambil
  daftar file di repository publik.

  Untuk repository privat, dibutuhkan autentikasi tambahan.
*/

function githubApiUrl(folder) {
  return (
    `https://api.github.com/repos/` +
    `${encodeURIComponent(GITHUB.username)}/` +
    `${encodeURIComponent(GITHUB.repository)}/` +
    `contents/assets/${folder}?ref=${encodeURIComponent(GITHUB.branch)}`
  );
}

async function fetchGitHubFolder(folder) {
  if (
    !GITHUB.username ||
    GITHUB.username === "USERNAME_GITHUB" ||
    !GITHUB.repository
  ) {
    throw new Error("Konfigurasi GitHub belum diatur");
  }

  const response = await fetch(githubApiUrl(folder), {
    headers: {
      Accept: "application/vnd.github+json"
    }
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    throw new Error("Folder tidak ditemukan");
  }

  return data.filter(item => item.type === "file");
}

function rawGithubUrl(path) {
  return (
    `https://raw.githubusercontent.com/` +
    `${encodeURIComponent(GITHUB.username)}/` +
    `${encodeURIComponent(GITHUB.repository)}/` +
    `${encodeURIComponent(GITHUB.branch)}/` +
    path.split("/").map(encodeURIComponent).join("/")
  );
}

function supportedImage(filename) {
  return /\.(jpe?g|png|webp|gif)$/i.test(filename);
}

function supportedAudio(filename) {
  return /\.(mp3|wav|m4a|ogg)$/i.test(filename);
}

/* =====================================================
   COLLECTION MENU
   ===================================================== */

const COLLECTION = [
  ["💌", "Ucapan Untukmu", "Words I wanted you to hear.", "letter"],
  ["📸", "Kenangan yang Perlu Dikenang", "Some memories deserve to stay a little longer.", "memories"],
  ["✦", "10 Hal Kecil", "Sepuluh hal yang ingin kusampaikan.", "little-things"],
  ["🎧", "Our Songs", "Songs that remind me of you.", "songs"],
  ["🎁", "One Last Surprise", "Something is waiting for you.", "surprise"],
  ["♡", "Tentang Kita", "Seberapa ingat kamu dengan cerita kecil kita?", "quiz"],
  ["∞", "Akhir Perjalanan", "Before you go...", "ending"]
];

function renderCollection() {
  const grid = $("#collectionGrid");

  grid.innerHTML = COLLECTION.map(([icon, title, subtitle, route]) => `
    <article class="collection-card"
      data-route="${route}"
      tabindex="0"
      role="button">
      <div class="card-icon">${icon}</div>
      <h3>${title}</h3>
      <p>${subtitle}</p>
      <span class="card-arrow">→</span>
    </article>
  `).join("");

  $$(".collection-card", grid).forEach(card => {
    card.addEventListener("click", () => {
      navigate(card.dataset.route);
    });

    card.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        navigate(card.dataset.route);
      }
    });
  });
}

/* =====================================================
   NAVIGATION TANPA RELOAD
   ===================================================== */

function navigate(route) {
  const target = document.getElementById(route) ||
    document.getElementById("home");

  $$(".page-section").forEach(section => {
    section.classList.remove("active");
  });

  target.classList.add("active");
  state.currentRoute = target.id;

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

  closeMenu();

  if (target.id === "little-things") {
    renderLittleThing();
  }

  if (target.id === "quiz" && state.quizIndex >= QUIZ.length) {
    resetQuiz();
  }
}

$$("[data-route]").forEach(button => {
  button.addEventListener("click", () => {
    navigate(button.dataset.route);
  });
});

function openMenu() {
  $("#menuOverlay").classList.add("open");
  $("#menuOverlay").setAttribute("aria-hidden", "false");
}

function closeMenu() {
  $("#menuOverlay").classList.remove("open");
  $("#menuOverlay").setAttribute("aria-hidden", "true");
}

$("#menuButton").addEventListener("click", openMenu);
$("#menuClose").addEventListener("click", closeMenu);

$("#menuOverlay").addEventListener("click", event => {
  if (event.target === $("#menuOverlay")) {
    closeMenu();
  }
});

function renderMenuNav() {
  $("#menuNav").innerHTML = COLLECTION.map(
    ([icon, title, subtitle, route]) => `
      <button data-menu-route="${route}">
        <span>
          ${icon} &nbsp; <strong>${title}</strong><br>
          <small>${subtitle}</small>
        </span>
        <span>→</span>
      </button>
    `
  ).join("");

  $$("[data-menu-route]").forEach(button => {
    button.addEventListener("click", () => {
      navigate(button.dataset.menuRoute);
    });
  });
}

/* =====================================================
   MEMORIES — DYNAMIC PHOTO CAROUSEL
   ===================================================== */

async function loadMemories() {
  const status = $("#memoryStatus");

  try {
    const files = (await fetchGitHubFolder("memories"))
      .filter(file => supportedImage(file.name));

    state.memories = files.map(file => ({
      src: file.download_url ||
        rawGithubUrl(`assets/memories/${file.name}`),
      name: file.name
    }));

    if (state.memories.length === 0) {
      throw new Error("Belum ada foto");
    }

    status.textContent =
      `${state.memories.length} kenangan ditemukan dari repository.`;

  } catch {
    // Jika API gagal atau folder kosong, tampilkan 10 placeholder.
    state.memories = Array.from({ length: 10 }, (_, index) => ({
      placeholder: true,
      name: `memory-${index + 1}`
    }));

    status.textContent =
      "Belum ada foto yang terbaca — 10 frame custom siap diisi.";
  }

  state.memoryIndex = 0;
  renderMemories();
}

function renderMemories() {
  const track = $("#memoryTrack");
  const total = state.memories.length;

  $("#memoryTotal").textContent = pad(total);

  track.innerHTML = state.memories.map((memory, index) => {
    const content = memory.placeholder
      ? `
        <div class="memory-placeholder">
          <div class="placeholder-copy">
            <strong>foto custom</strong>
            <span>link di bio</span>
          </div>
        </div>
      `
      : `
        <img
          src="${escapeHtml(memory.src)}"
          alt="Memory ${pad(index + 1)}"
          loading="lazy"
          draggable="false"
        >
      `;

    return `
      <article class="memory-slide" data-index="${index}">
        ${content}
        <div class="memory-slide-caption">
          memory ${pad(index + 1)} · one little memory 🤍
        </div>
      </article>
    `;
  }).join("");

  const dots = $("#memoryDots");

  if (total <= 20) {
    dots.innerHTML = state.memories.map((_, index) => `
      <button
        aria-label="Ke memory ${index + 1}"
        data-memory-dot="${index}">
      </button>
    `).join("");
  } else {
    // Untuk banyak foto, gunakan progress bar agar UI tidak penuh.
    dots.innerHTML = "";
  }

  $$("[data-memory-dot]").forEach(dot => {
    dot.addEventListener("click", () => {
      state.memoryIndex = Number(dot.dataset.memoryDot);
      updateMemoryPositions();
    });
  });

  updateMemoryPositions();
}

function updateMemoryPositions() {
  const slides = $$(".memory-slide");
  const total = slides.length;

  if (!total) return;

  slides.forEach((slide, index) => {
    let offset = index - state.memoryIndex;

    if (offset > total / 2) offset -= total;
    if (offset < -total / 2) offset += total;

    const visible = Math.abs(offset) <= 2;
    const rotation = offset === 0 ? 0 : offset * 3.5;

    slide.style.opacity = visible
      ? (offset === 0 ? "1" : "0.34")
      : "0";

    slide.style.pointerEvents = offset === 0 ? "auto" : "none";
    slide.style.filter = offset === 0 ? "none" : "blur(1px)";

    slide.style.transform =
      `translateX(${offset * 54}%) ` +
      `scale(${offset === 0 ? 1 : 0.86}) ` +
      `rotate(${rotation}deg)`;

    slide.style.zIndex = String(20 - Math.abs(offset));
  });

  $("#memoryCurrent").textContent = pad(state.memoryIndex + 1);

  $("#memoryProgress").style.width =
    `${((state.memoryIndex + 1) / total) * 100}%`;

  $$("[data-memory-dot]").forEach((dot, index) => {
    dot.classList.toggle("active", index === state.memoryIndex);
  });

  $("#memoryCaption").textContent = "one little memory 🤍";
}

function changeMemory(delta) {
  const total = state.memories.length;

  if (!total) return;

  state.memoryIndex =
    (state.memoryIndex + delta + total) % total;

  updateMemoryPositions();
}

$("#memoryPrev").addEventListener("click", () => changeMemory(-1));
$("#memoryNext").addEventListener("click", () => changeMemory(1));

document.addEventListener("keydown", event => {
  if (state.currentRoute !== "memories") return;

  if (event.key === "ArrowLeft") changeMemory(-1);
  if (event.key === "ArrowRight") changeMemory(1);
});

/* Swipe and drag */
const memoryStage = $("#memoryStage");

memoryStage.addEventListener("pointerdown", event => {
  state.memoryDragging = true;
  state.memoryTouchStartX = event.clientX;
});

memoryStage.addEventListener("pointerup", event => {
  if (
    !state.memoryDragging ||
    state.memoryTouchStartX === null
  ) {
    return;
  }

  const distance = event.clientX - state.memoryTouchStartX;

  state.memoryDragging = false;
  state.memoryTouchStartX = null;

  if (Math.abs(distance) > 45) {
    changeMemory(distance < 0 ? 1 : -1);
  }
});

memoryStage.addEventListener("pointercancel", () => {
  state.memoryDragging = false;
  state.memoryTouchStartX = null;
});

/* =====================================================
   10 HAL KECIL
   ===================================================== */

function renderLittleThing() {
  const total = LITTLE_THINGS.length;

  if (!total) return;

  $("#littleCurrent").textContent = pad(state.littleIndex + 1);
  $("#littleText").textContent = LITTLE_THINGS[state.littleIndex];

  $("#littleNext").textContent =
    state.littleIndex === total - 1
      ? "Selesai →"
      : "Berikutnya →";
}

$("#littleNext").addEventListener("click", () => {
  const button = $("#littleNext");
  const card = $(".little-card");

  if (button.dataset.finished === "true") {
    state.littleIndex = 0;
    button.dataset.finished = "false";
    renderLittleThing();
    navigate("home");
    return;
  }

  card.classList.add("changing");

  setTimeout(() => {
    if (state.littleIndex < LITTLE_THINGS.length - 1) {
      state.littleIndex++;
      renderLittleThing();
    } else {
      $("#littleText").textContent = "Selesai 🤍";
      $("#littleCurrent").textContent = pad(LITTLE_THINGS.length);
      button.textContent = "Kembali ke Menu";
      button.dataset.finished = "true";
    }

    card.classList.remove("changing");
  }, 170);
});

/* =====================================================
   MUSIC PLAYER
   ===================================================== */

async function loadSongs() {
  const status = $("#songStatus");

  try {
    const files = (await fetchGitHubFolder("songs"))
      .filter(file => supportedAudio(file.name));

    state.songs = files.map(file => ({
      src: file.download_url ||
        rawGithubUrl(`assets/songs/${file.name}`),
      title: file.name
        .replace(/\.[^.]+$/, "")
        .replace(/[-_]+/g, " ")
        .replace(/\b\w/g, char => char.toUpperCase()),
      artist: "A little song for you"
    }));

    if (!state.songs.length) {
      throw new Error("Belum ada lagu");
    }

    status.textContent =
      `${state.songs.length} lagu ditemukan dari repository.`;

  } catch {
    state.songs = [];
    status.textContent =
      "Tambahkan lagu kamu ke folder assets/songs/.";
  }

  renderSongs();
}

function renderSongs() {
  const list = $("#songList");

  if (!state.songs.length) {
    list.innerHTML = `
      <div class="song-card">
        <p class="song-title">Belum ada lagu 🤍</p>
        <p class="song-artist">
          Tambahkan lagu kamu ke folder assets/songs/.
        </p>
      </div>
    `;
    return;
  }

  list.innerHTML = state.songs.map((song, index) => `
    <article class="song-card" data-song="${index}">
      <div class="song-main">
        <span class="song-number">${pad(index + 1)}</span>
        <div>
          <p class="song-title">${escapeHtml(song.title)}</p>
          <p class="song-artist">${escapeHtml(song.artist)}</p>
        </div>
        <button class="song-play" aria-label="Putar lagu">▶</button>
      </div>
      <audio preload="metadata" src="${escapeHtml(song.src)}"></audio>
      <div class="song-progress-text">
        <span>0:00</span>
        <span>0:00</span>
      </div>
    </article>
  `).join("");

  $$(".song-card").forEach(card => {
    const audio = $("audio", card);
    const playButton = $(".song-play", card);
    const timeText = $$(".song-progress-text span", card);

    playButton.addEventListener("click", () => {
      // Pastikan hanya satu lagu yang berjalan.
      $$(".song-card audio").forEach(other => {
        if (other !== audio) {
          other.pause();

          const otherButton = $(".song-play", other.parentElement);

          if (otherButton) otherButton.textContent = "▶";
        }
      });

      if (audio.paused) {
        audio.play()
          .then(() => {
            playButton.textContent = "❚❚";
          })
          .catch(() => {
            $("#songStatus").textContent =
              "Lagu tidak dapat diputar. Periksa file audio dan koneksi.";
          });
      } else {
        audio.pause();
        playButton.textContent = "▶";
      }
    });

    audio.addEventListener("play", () => {
      playButton.textContent = "❚❚";
    });

    audio.addEventListener("pause", () => {
      playButton.textContent = "▶";
    });

    audio.addEventListener("ended", () => {
      playButton.textContent = "▶";
    });

    audio.addEventListener("timeupdate", () => {
      timeText[0].textContent = formatAudioTime(audio.currentTime);
      timeText[1].textContent = formatAudioTime(audio.duration);
    });

    audio.addEventListener("error", () => {
      $("#songStatus").textContent =
        "Ada file lagu yang gagal dimuat. Periksa format dan URL-nya.";
    });
  });
}

function formatAudioTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";

  return `${Math.floor(seconds / 60)}:` +
    `${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
}

/* =====================================================
   MINI QUIZ
   ===================================================== */

function resetQuiz() {
  state.quizIndex = 0;
  state.quizScore = 0;
  state.quizAnswered = false;

  $("#quizNext").classList.remove("hidden");
  renderQuiz();
}

function renderQuiz() {
  if (state.quizIndex >= QUIZ.length) {
    $("#quizCount").textContent = "Selesai 🤍";
    $("#quizScore").textContent =
      `${state.quizScore} / ${QUIZ.length} benar`;

    $("#quizQuestion").textContent = "Sampai di akhir. 🤍";

    $("#quizOptions").innerHTML = `
      <p class="quiz-feedback" style="font-size:14px;line-height:1.7;color:var(--muted)">
        Ternyata banyak juga cerita kecil yang bisa kita ingat kembali.
        <br>Terima kasih sudah menjawab semuanya.
      </p>
      <button id="quizMenuButton" class="primary-button">
        Kembali ke Menu →
      </button>
    `;

    $("#quizFeedback").textContent = "";
    $("#quizProgress").style.width = "100%";

    $("#quizNext").textContent = "Ulangi Kuis";
    $("#quizNext").classList.remove("hidden");
    $("#quizNext").onclick = resetQuiz;

    $("#quizMenuButton").addEventListener("click", () => {
      navigate("home");
    });

    return;
  }

  const item = QUIZ[state.quizIndex];

  state.quizAnswered = false;

  $("#quizCount").textContent =
    `${pad(state.quizIndex + 1)} / ${pad(QUIZ.length)}`;

  $("#quizScore").textContent = `${state.quizScore} benar`;

  $("#quizProgress").style.width =
    `${((state.quizIndex + 1) / QUIZ.length) * 100}%`;

  $("#quizQuestion").textContent = item.question;
  $("#quizFeedback").textContent = "";
  $("#quizNext").classList.add("hidden");

  $("#quizOptions").innerHTML = item.options.map((option, index) => `
    <button class="quiz-option" data-answer="${index}">
      ${escapeHtml(option)}
    </button>
  `).join("");

  $$(".quiz-option").forEach(button => {
    button.addEventListener("click", () => {
      answerQuiz(Number(button.dataset.answer));
    });
  });
}

function answerQuiz(answer) {
  if (state.quizAnswered) return;

  state.quizAnswered = true;

  const item = QUIZ[state.quizIndex];
  const options = $$(".quiz-option");

  options.forEach(button => {
    button.disabled = true;
  });

  options[item.answer].classList.add("correct");

  if (answer === item.answer) {
    state.quizScore++;
    $("#quizFeedback").textContent = "Benar! ✨";
  } else {
    options[answer].classList.add("wrong");

    $("#quizFeedback").textContent =
      "Belum tepat — tapi tetap jadi bagian dari cerita kecil ini. 🤍";
  }

  $("#quizScore").textContent = `${state.quizScore} benar`;

  $("#quizNext").classList.remove("hidden");

  $("#quizNext").textContent =
    state.quizIndex === QUIZ.length - 1
      ? "Lihat hasil →"
      : "Pertanyaan berikutnya →";

  $("#quizNext").onclick = () => {
    state.quizIndex++;
    renderQuiz();
  };
}

/* =====================================================
   FINAL SURPRISE + COUNTDOWN + CONFETTI
   ===================================================== */

async function loadSurpriseImages() {
  try {
    const files = (await fetchGitHubFolder("surprise"))
      .filter(file => supportedImage(file.name));

    state.surpriseImages = files.map(file =>
      file.download_url ||
      rawGithubUrl(`assets/surprise/${file.name}`)
    );

  } catch {
    state.surpriseImages = [];
  }
}

function launchSurprise() {
  const overlay = $("#surpriseOverlay");
  const countdown = $("#surpriseCountdown");

  overlay.classList.add("open");
  overlay.classList.remove("revealed");

  overlay.setAttribute("aria-hidden", "false");

  const sequence = ["3", "2", "1"];
  let index = 0;

  function step() {
    countdown.textContent = sequence[index];

    countdown.classList.remove("go");
    void countdown.offsetWidth;
    countdown.classList.add("go");

    index++;

    if (index < sequence.length) {
      setTimeout(step, 850);
    } else {
      setTimeout(revealSurprise, 900);
    }
  }

  step();
}

function revealSurprise() {
  $("#surpriseOverlay").classList.add("revealed");

  const photo = $("#surprisePhoto");

  if (state.surpriseImages.length) {
    photo.style.background = "white";
    photo.src = state.surpriseImages[0];
    photo.alt = `A birthday memory for ${CONFIG.name}`;

    photo.onerror = () => {
      photo.removeAttribute("src");
      photo.style.background =
        "linear-gradient(145deg,#F8C4D3,#FFF8FA)";
      photo.alt = "foto custom";
    };

  } else {
    photo.removeAttribute("src");
    photo.style.background =
      "linear-gradient(145deg,#F8C4D3,#FFF8FA)";
    photo.alt = "foto custom";
  }

  createConfetti();
}

function createConfetti() {
  const layer = $("#confettiLayer");
  layer.innerHTML = "";

  const shapes = ["◆", "✦", "•", "♡", "▪"];
  const colors = [
    "#F8C4D3",
    "#F29AB3",
    "#FFFFFF",
    "#E85D7F",
    "#FFD8E3"
  ];

  for (let index = 0; index < 90; index++) {
    const piece = document.createElement("span");

    piece.className = "confetti";
    piece.textContent = shapes[index % shapes.length];

    piece.style.left = `${Math.random() * 100}%`;

    piece.style.setProperty(
      "--drift",
      `${(Math.random() - 0.5) * 40}vw`
    );

    piece.style.setProperty(
      "--fall",
      `${2.6 + Math.random() * 3.5}s`
    );

    piece.style.animationDelay = `${Math.random() * 0.8}s`;
    piece.style.fontSize = `${8 + Math.random() * 12}px`;
    piece.style.color = colors[index % colors.length];

    layer.appendChild(piece);
  }
}

function closeSurprise() {
  const overlay = $("#surpriseOverlay");

  overlay.classList.remove("open", "revealed");
  overlay.setAttribute("aria-hidden", "true");
}

$("#openSurprise").addEventListener("click", launchSurprise);
$("#closeSurprise").addEventListener("click", closeSurprise);

/* =====================================================
   BACKGROUND DARI GITHUB REPOSITORY
   ===================================================== */

async function loadBackground() {
  try {
    const files = (await fetchGitHubFolder("background"))
      .filter(file => supportedImage(file.name));

    if (!files.length) return;

    const src = files[0].download_url ||
      rawGithubUrl(`assets/background/${files[0].name}`);

    const image = new Image();

    image.onload = () => {
      $(".ambient-bg").style.backgroundImage =
        `linear-gradient(rgba(255,248,250,.76),` +
        `rgba(255,248,250,.82)),url("${src}")`;

      $(".ambient-bg").style.backgroundSize = "cover";
      $(".ambient-bg").style.backgroundPosition = "center";
    };

    image.src = src;

  } catch {
    // Jika gagal, gunakan pastel gradient sebagai fallback.
  }
}

/* =====================================================
   INITIALIZATION
   ===================================================== */

function init() {
  applyName();

  const birthDate = parseLocalDate(CONFIG.birthDate);

  $("#birthDateText").textContent =
    Number.isNaN(birthDate.getTime())
      ? "TANGGAL BELUM VALID"
      : formatLongDate(birthDate);

  renderCollection();
  renderMenuNav();
  renderLittleThing();
  resetQuiz();

  updateTimer();
  setInterval(updateTimer, 1000);

  setupOpening();

  // Memuat media secara terpisah agar satu kegagalan
  // tidak menghentikan fitur lainnya.
  loadMemories();
  loadSongs();
  loadSurpriseImages();
  loadBackground();
}

init();
