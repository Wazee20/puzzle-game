const board = document.getElementById("board");
const imageSelect = document.getElementById("imageSelect");
const difficulty = document.getElementById("difficulty");
const startButton = document.getElementById("startButton");
const shuffleButton = document.getElementById("shuffleButton");
const installButton = document.getElementById("installButton");
const movesElement = document.getElementById("moves");
const timeElement = document.getElementById("time");
const message = document.getElementById("message");

let size = 4;
let tiles = [];
let selectedIndex = null;
let moves = 0;
let seconds = 0;
let timer = null;
let playing = false;
let installPrompt = null;

function formatTime(value) {
  const minutes = Math.floor(value / 60);
  const remainder = String(value % 60).padStart(2, "0");
  return `${minutes}:${remainder}`;
}

function updateStats() {
  movesElement.textContent = moves;
  timeElement.textContent = formatTime(seconds);
}

function startTimer() {
  clearInterval(timer);
  timer = setInterval(() => {
    seconds += 1;
    updateStats();
  }, 1000);
}

function stopTimer() {
  clearInterval(timer);
  timer = null;
}

function isSolved() {
  return tiles.every((value, index) => value === index);
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }

  if (isSolved()) {
    [array[0], array[1]] = [array[1], array[0]];
  }
}

function render() {
  board.innerHTML = "";
  board.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
  board.dataset.size = size;

  tiles.forEach((position, index) => {
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "tile";
    tile.setAttribute("aria-label", `القطعة ${position + 1}`);

    if (index === selectedIndex) tile.classList.add("selected");

    tile.style.backgroundImage = `url("${imageSelect.value}")`;
    tile.style.backgroundPosition = `${(position % size) * (100 / (size - 1))}% ${Math.floor(position / size) * (100 / (size - 1))}%`;
    tile.dataset.index = index;
    tile.addEventListener("click", () => chooseTile(index));
    board.appendChild(tile);
  });
}

function chooseTile(index) {
  if (!playing) return;

  if (selectedIndex === null) {
    selectedIndex = index;
  } else if (selectedIndex === index) {
    selectedIndex = null;
  } else {
    [tiles[selectedIndex], tiles[index]] = [tiles[index], tiles[selectedIndex]];
    selectedIndex = null;
    moves += 1;
    updateStats();

    if (isSolved()) {
      playing = false;
      stopTimer();
      message.textContent = `🎉 أحسنت! انتهت اللعبة في ${moves} حركة و${formatTime(seconds)}.`;
      shuffleButton.disabled = false;
    }
  }

  render();
}

function startGame() {
  size = Number(difficulty.value);
  tiles = Array.from({ length: size * size }, (_, index) => index);
  shuffleArray(tiles);

  selectedIndex = null;
  moves = 0;
  seconds = 0;
  playing = true;
  message.textContent = "";
  shuffleButton.disabled = false;
  updateStats();
  startTimer();
  render();
}

startButton.addEventListener("click", startGame);
shuffleButton.addEventListener("click", startGame);

imageSelect.addEventListener("change", () => {
  if (playing) startGame();
  else render();
});

difficulty.addEventListener("change", startGame);

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  installPrompt = event;
  installButton.hidden = false;
});

installButton.addEventListener("click", async () => {
  if (!installPrompt) return;
  installPrompt.prompt();
  await installPrompt.userChoice;
  installPrompt = null;
  installButton.hidden = true;
});

window.addEventListener("appinstalled", () => {
  installButton.hidden = true;
  installPrompt = null;
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch((error) => {
      console.error("تعذر تسجيل Service Worker:", error);
    });
  });
}

shuffleButton.disabled = true;
installButton.hidden = true;
size = Number(difficulty.value);
tiles = Array.from({ length: size * size }, (_, index) => index);
render();
