const CONFIG = {
  birthdayPassword: "12062007",
  birthdayDate: "2026-06-12T00:00:00+05:30",
  herName: "Greeshma",
  fullName: "SIRIPURAM GREESHMA GOVIND",
  imageFolder: "images/",
  musicFolder: "music/",
  musicVolume: 0.95,
};

const memories = [
  {
    title: "A smile that changes the room",
    text: "Some people enter quietly and still make everything feel warmer. Greeshma, your presence has that gentle power.",
    photo: "Photo",
    image: "",
  },
  {
    title: "Kindness in small details",
    text: "The way you care, listen, and make people feel valued is one of your most beautiful gifts.",
    photo: "Photo",
    image: "",
  },
  {
    title: "Dreams with courage",
    text: "May every goal you hold close move closer this year, with confidence, grace, and bright success.",
    photo: "Photo",
    image: "",
  },
  {
    title: "A day made only for you",
    text: "Today is a reminder that the world is better because you are in it.",
    photo: "Photo",
    image: "",
  },
];

const quiz = [
  {
    question: "What should every birthday begin with?",
    options: ["A happy smile", "An office meeting", "A traffic jam", "A silent phone"],
    answer: "A happy smile",
    unlock: "Your smile deserves the first wish of the day.",
  },
  {
    question: "What is the best gift for Greeshma?",
    options: ["Love and blessings", "A boring lecture", "A late reply", "No cake"],
    answer: "Love and blessings",
    unlock: "May love, respect, and blessings follow you everywhere.",
  },
  {
    question: "What should this year bring her?",
    options: ["Success and health", "Stress only", "Forgotten plans", "Empty days"],
    answer: "Success and health",
    unlock: "May this year bring success, good health, peace, and beautiful memories.",
  },
];

const starWishes = [
  "You are thoughtful in a way people remember.",
  "Your happiness matters more than words can say.",
  "May your dreams find open doors this year.",
  "You carry grace even in ordinary moments.",
  "Your kindness is a quiet kind of magic.",
  "May your life always feel loved and peaceful.",
  "You deserve celebrations that feel as special as you.",
  "May every new morning bring confidence and joy.",
];

const gallery = [
  { caption: "Upload a favorite photo", mark: "Photo", image: "" },
  { caption: "Upload another beautiful memory", mark: "Photo", image: "" },
  { caption: "Upload a bright celebration moment", mark: "Photo", image: "" },
  { caption: "Upload a special photo of Greeshma", mark: "Photo", image: "" },
];

const finalLetter =
  "Dear Greeshma, on your birthday I wish you endless happiness, peaceful days, strong health, great success, and memories that keep glowing in your life. May you always be surrounded by people who respect you, support you, and celebrate the wonderful person you are. Happy Birthday, Greeshma.";

const candleWishes = [
  "May every wish you silently make today come true beautifully.",
  "Your smile deserves a thousand celebrations.",
  "May your future be bright, peaceful, and full of success.",
  "You are special, valued, and deeply appreciated.",
];

const balloonWishes = [
  "You are so cute",
  "You are so kind",
  "You are beautiful",
  "You are special",
  "You are lovely",
  "You are amazing",
  "Stay happy always",
  "Keep smiling",
];

const screens = {
  welcome: document.querySelector("#welcomeScreen"),
  unlock: document.querySelector("#unlockScreen"),
  journey: document.querySelector("#journeyScreen"),
};

const canvas = document.querySelector("#fxCanvas");
const ctx = canvas.getContext("2d");
let particles = [];
let audioCtx;
let melodyTimer;
let isMusicPlaying = false;
let quizIndex = 0;
let photoIndex = 0;
let letterStarted = false;
let musicStep = 0;
let slideshowTimer;
let heroPhotoTimer;
let loadedImages = [];
let songAudio;
let usingUploadedSong = false;
let candleIndex = 0;

function showScreen(name) {
  Object.values(screens).forEach((screen) => screen.classList.remove("is-active"));
  screens[name].classList.add("is-active");
}

function unlock() {
  const value = document.querySelector("#passwordInput").value.trim();
  const error = document.querySelector("#unlockError");
  if (value === CONFIG.birthdayPassword) {
    error.textContent = "";
    showScreen("journey");
    startMusic();
    burst(innerWidth / 2, innerHeight / 2, 120);
    return;
  }
  error.textContent = "Almost there. Try her birthday in DDMMYYYY format.";
}

function renderTimeline() {
  const timeline = document.querySelector("#timeline");
  timeline.innerHTML = memories
    .map(
      (memory) => `
        <article class="memory-card">
          <div class="memory-photo ${memory.image ? "has-image" : ""}" style="${memory.image ? `background-image:url('${memory.image}')` : ""}">${memory.photo}</div>
          <div class="memory-body">
            <h3>${memory.title}</h3>
            <p>${memory.text}</p>
          </div>
        </article>
      `,
    )
    .join("");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("is-visible");
      });
    },
    { threshold: 0.22 },
  );
  document.querySelectorAll(".memory-card").forEach((card) => observer.observe(card));
}

function imageExists(src) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(src);
    image.onerror = () => resolve("");
    image.src = `${src}?v=${Date.now()}`;
  });
}

function imageNameCandidates() {
  const names = [];
  const prefixes = ["", "photo", "image", "greeshma", "birthday"];
  const extensions = ["jpg", "jpeg", "png", "webp", "gif"];
  for (let index = 1; index <= 40; index += 1) {
    prefixes.forEach((prefix) => {
      extensions.forEach((extension) => {
        names.push(`${CONFIG.imageFolder}${prefix}${index}.${extension}`);
      });
    });
  }
  return names;
}

async function imagesFromServerFolder() {
  if (!location.protocol.startsWith("http")) return [];
  try {
    const response = await fetch(CONFIG.imageFolder, { cache: "no-store" });
    if (!response.ok) return [];
    const html = await response.text();
    const documentResult = new DOMParser().parseFromString(html, "text/html");
    return [...documentResult.querySelectorAll("a")]
      .map((link) => decodeURIComponent(link.getAttribute("href") || ""))
      .filter((href) => /\.(jpe?g|png|webp|gif)$/i.test(href))
      .map((href) => {
        const imageUrl = new URL(href, new URL(CONFIG.imageFolder, location.href));
        return `${CONFIG.imageFolder}${decodeURIComponent(imageUrl.pathname.split("/").pop() || "")}`;
      });
  } catch {
    return [];
  }
}

function setPhotosFromImages(images) {
  if (!images.length) return;
  const uniqueImages = [...new Set(images)];
  loadedImages = uniqueImages;
  gallery.splice(
    0,
    gallery.length,
    ...uniqueImages.map((image, index) => ({
      caption: `Photo ${index + 1}`,
      mark: "Photo",
      image,
    })),
  );

  memories.forEach((memory, index) => {
    memory.image = uniqueImages[index % uniqueImages.length] || "";
  });

  photoIndex = 0;
  renderHeroPhotos(uniqueImages);
  renderPhoto();
  renderTimeline();
  startPhotoSlideshow();
  startHeroPhotoMotion();
}

function renderHeroPhotos(images, offset = 0) {
  document.querySelectorAll(".photo-orbit span").forEach((frame, index) => {
    const image = images[(index + offset) % images.length];
    if (!image) return;
    frame.style.backgroundImage = `url("${image}")`;
    frame.classList.add("has-image");
  });
}

function startHeroPhotoMotion() {
  clearInterval(heroPhotoTimer);
  if (loadedImages.length < 4) return;
  let offset = 0;
  heroPhotoTimer = setInterval(() => {
    offset = (offset + 1) % loadedImages.length;
    renderHeroPhotos(loadedImages, offset);
  }, 3200);
}

async function loadImagesAutomatically() {
  if (Array.isArray(window.BIRTHDAY_IMAGES) && window.BIRTHDAY_IMAGES.length) {
    setPhotosFromImages(window.BIRTHDAY_IMAGES);
    return;
  }

  const serverImages = await imagesFromServerFolder();
  if (serverImages.length) {
    setPhotosFromImages(serverImages);
    return;
  }

  const checked = await Promise.all(imageNameCandidates().map(imageExists));
  setPhotosFromImages([...new Set(checked.filter(Boolean))]);
}

function updateCountdown() {
  const target = new Date(CONFIG.birthdayDate).getTime();
  const diff = target - Date.now();
  const message = document.querySelector("#countdownMessage");

  if (diff <= 0) {
    ["days", "hours", "minutes", "seconds"].forEach((id) => {
      document.querySelector(`#${id}`).textContent = "00";
    });
    message.textContent = "It is Greeshma's birthday. Let the celebration begin.";
    if (!message.dataset.celebrated) {
      message.dataset.celebrated = "true";
      burst(innerWidth / 2, innerHeight * 0.3, 180);
    }
    return;
  }

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  document.querySelector("#days").textContent = String(days).padStart(2, "0");
  document.querySelector("#hours").textContent = String(hours).padStart(2, "0");
  document.querySelector("#minutes").textContent = String(minutes).padStart(2, "0");
  document.querySelector("#seconds").textContent = String(seconds).padStart(2, "0");
}

function renderQuiz() {
  const current = quiz[quizIndex];
  document.querySelector("#quizQuestion").textContent = current.question;
  document.querySelector("#quizResult").textContent = "";
  document.querySelector("#quizOptions").innerHTML = current.options
    .map((option) => `<button type="button" data-answer="${option}">${option}</button>`)
    .join("");
}

function chooseQuizAnswer(answer) {
  const current = quiz[quizIndex];
  const result = document.querySelector("#quizResult");
  if (answer !== current.answer) {
    result.textContent = "Sweet try. Choose the answer with the most birthday feeling.";
    return;
  }
  result.textContent = current.unlock;
  burst(innerWidth * 0.5, innerHeight * 0.42, 70);
  quizIndex = (quizIndex + 1) % quiz.length;
  setTimeout(renderQuiz, 1700);
}

function openGift() {
  const gift = document.querySelector("#giftBox");
  gift.classList.add("is-open");
  document.querySelector("#giftWish").textContent =
    "Happy Birthday, Greeshma. May your life be filled with happiness, success, good health, and beautiful memories.";
  burst(innerWidth / 2, innerHeight / 2, 120);
}

function renderStars() {
  const sky = document.querySelector("#starSky");
  sky.innerHTML = starWishes
    .map((wish, index) => {
      const left = 8 + ((index * 29) % 84);
      const top = 10 + ((index * 47) % 74);
      return `<button class="star" style="left:${left}%; top:${top}%; animation-delay:${index * 160}ms" data-wish="${wish}" aria-label="Hidden wish"></button>`;
    })
    .join("");
}

function showStarWish(wish) {
  document.querySelector("#starMessage").textContent = wish;
  burst(innerWidth * 0.5, innerHeight * 0.5, 28);
}

function renderBalloons() {
  const colors = ["#ff6f9e", "#ffd36e", "#6ed6ff", "#9be58b", "#c79cff", "#ff9f68", "#f878c8", "#78d8c7"];
  document.querySelector("#balloonWall").innerHTML = balloonWishes
    .map(
      (wish, index) => `
        <button class="balloon" style="--balloon-color:${colors[index % colors.length]}; animation-delay:${index * 120}ms" data-wish="${wish}" type="button">
          <span>${wish}</span>
        </button>
      `,
    )
    .join("");
}

function popBalloon(balloon) {
  if (balloon.classList.contains("is-popped")) return;
  balloon.classList.add("is-popped");
  const wish = balloon.dataset.wish;
  document.querySelector("#balloonMessage").textContent = wish;
  burst(innerWidth * (0.2 + Math.random() * 0.6), innerHeight * (0.25 + Math.random() * 0.35), 60);
}

function stopCandle() {
  const cake = document.querySelector("#candleCakeBtn");
  const notes = document.querySelector("#candleNotes");
  cake.classList.add("is-out");
  const wish = candleWishes[candleIndex % candleWishes.length];
  candleIndex += 1;
  notes.insertAdjacentHTML("afterbegin", `<p>${wish}</p>`);
  [...notes.querySelectorAll("p")].slice(3).forEach((note) => note.remove());
  burst(innerWidth / 2, innerHeight * 0.45, 80);
  setTimeout(() => cake.classList.remove("is-out"), 1800);
}

function renderPhoto() {
  const photo = gallery[photoIndex];
  const slide = document.querySelector("#photoSlide");
  if (!photo) return;
  slide.classList.remove("is-fullscreen");
  slide.classList.add("video-fade");
  setTimeout(() => {
    const safeCaption = escapeHtml(photo.caption);
    const safeImage = escapeAttribute(photo.image);
    slide.innerHTML = photo.image
      ? `<img src="${safeImage}" alt="${safeCaption}" onload="window.fitGalleryPhoto && window.fitGalleryPhoto(this)" onerror="window.skipBrokenPhoto && window.skipBrokenPhoto()" />`
      : `<span>${photo.mark}</span>`;
    slide.classList.toggle("has-image", Boolean(photo.image));
    slide.style.backgroundImage = "";
    document.querySelector("#photoCaption").textContent = photo.caption;
    slide.classList.remove("video-fade");
  }, 420);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return entities[character];
  });
}

function escapeAttribute(value) {
  return escapeHtml(value);
}

window.skipBrokenPhoto = function skipBrokenPhoto() {
  if (gallery.length < 2) return;
  nextPhoto(1);
};

window.fitGalleryPhoto = function fitGalleryPhoto(image) {
  const frame = image.closest(".photo-slide");
  if (!frame || !image.naturalWidth || !image.naturalHeight) return;
  const imageRatio = image.naturalWidth / image.naturalHeight;
  image.classList.toggle("is-wide", imageRatio >= 1);
  image.classList.toggle("is-tall", imageRatio < 1);
};

function nextPhoto(direction) {
  photoIndex = (photoIndex + direction + gallery.length) % gallery.length;
  renderPhoto();
}

function startPhotoSlideshow() {
  clearInterval(slideshowTimer);
  if (gallery.length < 2) return;
  slideshowTimer = setInterval(() => nextPhoto(1), 5200);
}

function handlePhotoUpload(event) {
  const files = [...event.target.files].filter((file) => file.type.startsWith("image/"));
  if (!files.length) return;
  gallery.splice(
    0,
    gallery.length,
    ...files.map((file, index) => ({
      caption: file.name.replace(/\.[^.]+$/, "") || `Uploaded photo ${index + 1}`,
      mark: "Photo",
      image: URL.createObjectURL(file),
    })),
  );
  photoIndex = 0;
  renderPhoto();
  setPhotosFromImages(gallery.map((photo) => photo.image).filter(Boolean));
}

function startLetter() {
  if (letterStarted) return;
  letterStarted = true;
  const target = document.querySelector("#letterText");
  target.textContent = "";
  let index = 0;
  const timer = setInterval(() => {
    target.textContent += finalLetter[index];
    index += 1;
    if (index >= finalLetter.length) clearInterval(timer);
  }, 32);
}

function setupLetterObserver() {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) startLetter();
    },
    { threshold: 0.38 },
  );
  observer.observe(document.querySelector(".letter-paper"));
}

function resizeCanvas() {
  canvas.width = innerWidth * devicePixelRatio;
  canvas.height = innerHeight * devicePixelRatio;
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}

function burst(x, y, amount = 80) {
  for (let index = 0; index < amount; index += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 6;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1,
      life: 80 + Math.random() * 40,
      color: ["#ff5f8f", "#ffd36e", "#6ed6ff", "#ffffff", "#ff8a6c"][Math.floor(Math.random() * 5)],
      size: 3 + Math.random() * 5,
    });
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  particles = particles.filter((particle) => particle.life > 0);
  particles.forEach((particle) => {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vy += 0.055;
    particle.life -= 1;
    ctx.globalAlpha = Math.max(particle.life / 100, 0);
    ctx.fillStyle = particle.color;
    ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
  });
  ctx.globalAlpha = 1;
  requestAnimationFrame(animateParticles);
}

function ensureAudio() {
  if (audioCtx) return;
  const AudioEngine = window.AudioContext || window.webkitAudioContext;
  if (!AudioEngine) return;
  audioCtx = new AudioEngine();
}

function setupUploadedSong() {
  if (songAudio || !Array.isArray(window.BIRTHDAY_MUSIC) || !window.BIRTHDAY_MUSIC.length) return;
  songAudio = new Audio(window.BIRTHDAY_MUSIC[0]);
  songAudio.loop = true;
  songAudio.volume = CONFIG.musicVolume;
  songAudio.preload = "auto";
}

function playTone(frequency, start, duration, gainValue, type = "triangle") {
  const oscillator = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(gainValue, start + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain).connect(audioCtx.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.03);
}

function playBeat(start, gainValue) {
  const oscillator = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  oscillator.type = "square";
  oscillator.frequency.setValueAtTime(92, start);
  oscillator.frequency.exponentialRampToValueAtTime(48, start + 0.09);
  gain.gain.setValueAtTime(gainValue, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.12);
  oscillator.connect(gain).connect(audioCtx.destination);
  oscillator.start(start);
  oscillator.stop(start + 0.14);
}

function scheduleMelody() {
  if (!isMusicPlaying || !audioCtx) return;
  const volume = CONFIG.musicVolume;
  const melody = [523.25, 659.25, 783.99, 880, 783.99, 659.25, 587.33, 659.25, 698.46, 880, 987.77, 1046.5];
  const harmony = [329.63, 392, 523.25, 587.33, 523.25, 392, 349.23, 392, 440, 523.25, 587.33, 659.25];
  const bass = [130.81, 130.81, 196, 196, 174.61, 174.61, 146.83, 146.83, 164.81, 164.81, 196, 196];
  const now = audioCtx.currentTime;
  for (let index = 0; index < 12; index += 1) {
    const step = (musicStep + index) % melody.length;
    const start = now + index * 0.32;
    playTone(melody[step], start, 0.28, volume * 0.34, "triangle");
    playTone(harmony[step], start, 0.3, volume * 0.2, "sine");
    playTone(bass[step], start, 0.34, volume * 0.18, "sawtooth");
    if (index % 2 === 0) playBeat(start, volume * 0.18);
  }
  musicStep = (musicStep + 12) % melody.length;
  melodyTimer = setTimeout(scheduleMelody, 12 * 320);
}

function startMusic() {
  if (isMusicPlaying) return;
  isMusicPlaying = true;
  document.querySelector("#playerBtn").textContent = "Pause music";
  document.querySelector("#musicToggle").textContent = "Ⅱ";
  setupUploadedSong();
  if (songAudio) {
    songAudio.currentTime = songAudio.currentTime || 0;
    songAudio.play()
      .then(() => {
        usingUploadedSong = true;
        document.querySelector("#musicStatus").textContent = "Uploaded song is playing";
      })
      .catch(() => {
        usingUploadedSong = false;
        startGeneratedMusic();
      });
    return;
  }
  startGeneratedMusic();
}

function startGeneratedMusic() {
  ensureAudio();
  if (!audioCtx) return;
  audioCtx.resume();
  document.querySelector("#musicStatus").textContent = "Generated birthday music is playing";
  scheduleMelody();
}

function stopMusic() {
  isMusicPlaying = false;
  clearTimeout(melodyTimer);
  if (songAudio) songAudio.pause();
  document.querySelector("#playerBtn").textContent = "Play music";
  document.querySelector("#musicToggle").textContent = "♪";
  document.querySelector("#musicStatus").textContent = "Music is paused";
}

function toggleMusic() {
  if (isMusicPlaying) stopMusic();
  else startMusic();
}

function scrollToNextSection() {
  const sections = [...document.querySelectorAll("[data-section]")];
  const next = sections.find((section) => section.getBoundingClientRect().top > 80) || sections[0];
  next.scrollIntoView({ behavior: "smooth", block: "start" });
}

document.querySelector("#beginBtn").addEventListener("click", () => showScreen("unlock"));
document.querySelector("#unlockBtn").addEventListener("click", unlock);
document.querySelector("#passwordInput").addEventListener("keydown", (event) => {
  if (event.key === "Enter") unlock();
});
document.querySelector("#quizOptions").addEventListener("click", (event) => {
  if (event.target.matches("button")) chooseQuizAnswer(event.target.dataset.answer);
});
document.querySelector("#giftBox").addEventListener("click", openGift);
document.querySelector("#starSky").addEventListener("click", (event) => {
  if (event.target.matches(".star")) showStarWish(event.target.dataset.wish);
});
document.querySelector("#candleCakeBtn").addEventListener("click", stopCandle);
document.querySelector("#balloonWall").addEventListener("click", (event) => {
  const balloon = event.target.closest(".balloon");
  if (balloon) popBalloon(balloon);
});
document.querySelector("#prevPhoto").addEventListener("click", () => nextPhoto(-1));
document.querySelector("#nextPhoto").addEventListener("click", () => nextPhoto(1));
document.querySelector("#photoUpload").addEventListener("change", handlePhotoUpload);
document.querySelector("#photoSlide").addEventListener("click", (event) => {
  if (event.target.matches("img")) event.currentTarget.classList.toggle("is-fullscreen");
});
document.querySelector("#fireworksBtn").addEventListener("click", () => {
  for (let index = 0; index < 5; index += 1) {
    setTimeout(() => burst(Math.random() * innerWidth, innerHeight * (0.18 + Math.random() * 0.36), 90), index * 240);
  }
});
document.querySelector("#playerBtn").addEventListener("click", toggleMusic);
document.querySelector("#musicToggle").addEventListener("click", toggleMusic);
document.querySelector("#nextSectionBtn").addEventListener("click", scrollToNextSection);
addEventListener("resize", resizeCanvas);

resizeCanvas();
animateParticles();
renderTimeline();
renderQuiz();
renderStars();
renderBalloons();
renderPhoto();
setupLetterObserver();
loadImagesAutomatically();
setInterval(updateCountdown, 1000);
updateCountdown();
