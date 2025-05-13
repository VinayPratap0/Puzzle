const canvas = document.getElementById("puzzleCanvas");
const ctx = canvas.getContext("2d");
const rows = 3, cols = 3;
const pieceSize = canvas.width / cols;
let pieces = [], dragging = false, selectedPiece = null;

let startTime, timerInterval;
let playerName = ""; // Store the player's name

const image = new Image();
image.crossOrigin = "Anonymous";
image.src = "https://picsum.photos/400";

// Wait for the image to load before starting the puzzle
image.onload = () => {
  initPuzzle();
  drawPuzzle();
};

function startGame() {
  // Get the player's name from the input field
  playerName = document.getElementById("playerName").value;
  if (!playerName) {
    alert("Please enter your name to start the game.");
    return;
  }
  
  // Hide the name input form and show the puzzle
  document.getElementById("nameForm").style.display = "none";
  document.getElementById("timer").style.display = "block";
  
  startTimer(); // Start the timer when the game begins
}

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

function drawPuzzle(highlighted) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const p of pieces) {
    ctx.drawImage(
      image,
      p.x * pieceSize, p.y * pieceSize, pieceSize, pieceSize,
      p.currentX * pieceSize, p.currentY * pieceSize, pieceSize, pieceSize
    );
    if (highlighted && highlighted === p) {
      ctx.strokeStyle = "red";
      ctx.strokeRect(p.currentX * pieceSize, p.currentY * pieceSize, pieceSize, pieceSize);
    }
  }
}

canvas.addEventListener("mousedown", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const cx = Math.floor(x / pieceSize);
  const cy = Math.floor(y / pieceSize);
  selectedPiece = pieces.find(p => p.currentX === cx && p.currentY === cy);
  if (selectedPiece) dragging = true;
});

canvas.addEventListener("mousemove", (e) => {
  if (dragging && selectedPiece) {
    drawPuzzle(selectedPiece);
  }
});

canvas.addEventListener("mouseup", (e) => {
  if (!dragging || !selectedPiece) return;
  dragging = false;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const cx = Math.floor(x / pieceSize);
  const cy = Math.floor(y / pieceSize);
  const target = pieces.find(p => p.currentX === cx && p.currentY === cy);

  if (target && target !== selectedPiece) {
    const tmpX = selectedPiece.currentX;
    const tmpY = selectedPiece.currentY;
    selectedPiece.currentX = target.currentX;
    selectedPiece.currentY = target.currentY;
    target.currentX = tmpX;
    target.currentY = tmpY;
  }

  selectedPiece = null;
  drawPuzzle();
  checkSolved();
});

function checkSolved() {
  const solved = pieces.every(p => p.x === p.currentX && p.y === p.currentY);
  if (solved) {
    stopTimer();
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    document.getElementById("qr").style.display = "block";
    document.getElementById("finalTime").textContent = `${playerName}, you completed the puzzle in ${timeTaken} seconds!`;

    // Send result via email with the player's name and time
    fetch("https://formsubmit.co/ajax/vinaypratap10457.10d@gmail.com", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        name: playerName, // Include player's name in the email
        message: `Completed in ${timeTaken} seconds`
      })
    });
  }
}
