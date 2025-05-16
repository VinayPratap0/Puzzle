const canvas = document.getElementById("puzzleCanvas");
const ctx = canvas.getContext("2d");
const rows = 3, cols = 3;
let pieces = [], selectedPiece = null;

let pieceSize = canvas.width / cols;
let scaledImage = { x: 0, y: 0, width: canvas.width, height: canvas.height };

let startTime, timerInterval;
let playerName = "";
let gameStarted = false;

const image = new Image();
image.crossOrigin = "Anonymous";
image.src = "https://i.ibb.co/vxDRxZtX/IMG-20240928-125307.jpg";

// Handle user image uploads
function loadUserImage(file) {
  const reader = new FileReader();
  reader.onload = function(event) {
    image.src = event.target.result;
  };
  reader.readAsDataURL(file);
}

image.onload = () => {
  drawResizedImage(); // Just draw image initially — don't start puzzle yet
};

// Start game only after name entered
function startGame() {
  playerName = document.getElementById("playerName").value.trim();
  if (!playerName) {
    alert("Please enter your name to start the game.");
    return;
  }

  document.getElementById("nameForm").style.display = "none";
  document.getElementById("timer").style.display = "block";

  initPuzzle();
  drawPuzzle();
  startTimer();
  gameStarted = true;
}

// Timer logic
function startTimer() {
  startTime = Date.now();
  const timerDisplay = document.getElementById("timer");
  timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    timerDisplay.textContent = `Time: ${elapsed}s`;
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

// Image resizing logic
function drawResizedImage() {
  let imgWidth = image.naturalWidth;
  let imgHeight = image.naturalHeight;

  let scale = Math.min(canvas.width / imgWidth, canvas.height / imgHeight);
  let scaledWidth = imgWidth * scale;
  let scaledHeight = imgHeight * scale;

  let offsetX = (canvas.width - scaledWidth) / 2;
  let offsetY = (canvas.height - scaledHeight) / 2;

  scaledImage = {
    x: offsetX,
    y: offsetY,
    width: scaledWidth,
    height: scaledHeight
  };

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0, imgWidth, imgHeight, offsetX, offsetY, scaledWidth, scaledHeight);
}

// Initialize the puzzle pieces
function initPuzzle() {
  pieces = [];
  let positions = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      positions.push({ x, y });
    }
  }
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  let index = 0;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const pos = positions[index++];
      pieces.push({ x, y, currentX: pos.x, currentY: pos.y });
    }
  }
}

// Draw puzzle based on piece positions
function drawPuzzle() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawResizedImage();

  const pieceWidth = scaledImage.width / cols;
  const pieceHeight = scaledImage.height / rows;

  for (const p of pieces) {
    ctx.drawImage(
      image,
      p.x * image.naturalWidth / cols,
      p.y * image.naturalHeight / rows,
      image.naturalWidth / cols,
      image.naturalHeight / rows,
      scaledImage.x + p.currentX * pieceWidth,
      scaledImage.y + p.currentY * pieceHeight,
      pieceWidth,
      pieceHeight
    );

    if (selectedPiece === p) {
      ctx.strokeStyle = "red";
      ctx.lineWidth = 4;
      ctx.strokeRect(
        scaledImage.x + p.currentX * pieceWidth,
        scaledImage.y + p.currentY * pieceHeight,
        pieceWidth,
        pieceHeight
      );
    }
  }
}

// Handle clicks/taps
function onTap(event) {
  if (!gameStarted) return;

  event.preventDefault();
  const rect = canvas.getBoundingClientRect();
  let x = event.clientX || event.touches?.[0]?.clientX;
  let y = event.clientY || event.touches?.[0]?.clientY;

  x = x - rect.left - scaledImage.x;
  y = y - rect.top - scaledImage.y;

  const pieceWidth = scaledImage.width / cols;
  const pieceHeight = scaledImage.height / rows;

  const cx = Math.floor(x / pieceWidth);
  const cy = Math.floor(y / pieceHeight);

  const tapped = pieces.find(p => p.currentX === cx && p.currentY === cy);
  if (!tapped) return;

  if (!selectedPiece) {
    selectedPiece = tapped;
  } else {
    if (selectedPiece !== tapped) {
      const tempX = selectedPiece.currentX;
      const tempY = selectedPiece.currentY;
      selectedPiece.currentX = tapped.currentX;
      selectedPiece.currentY = tapped.currentY;
      tapped.currentX = tempX;
      tapped.currentY = tempY;
    }
    selectedPiece = null;
  }

  drawPuzzle();
  checkSolved();
}

// Puzzle completion check
function checkSolved() {
  const isSolved = pieces.every(p => p.x === p.currentX && p.y === p.currentY);
  if (isSolved) {
    stopTimer();
    const totalTime = Math.floor((Date.now() - startTime) / 1000);
    document.getElementById("qr").style.display = "block";
    document.getElementById("finalTime").textContent = `${playerName}, you completed the puzzle in ${totalTime} seconds!`;

    // Optional: Send data to email
    fetch("https://formsubmit.co/ajax/vinaypratap10457.10d@gmail.com", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        name: playerName,
        message: `Completed in ${totalTime} seconds`
      })
    });
  }
}

// Event listeners
canvas.addEventListener("click", onTap);
canvas.addEventListener("touchstart", onTap, { passive: false });

document.getElementById("imageUpload").addEventListener("change", function(event) {
  const file = event.target.files[0];
  if (file) loadUserImage(file);
});
