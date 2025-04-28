const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const gameOverScreen = document.getElementById('gameOverScreen');
const pauseButton = document.getElementById('pauseButton');
const welcomePopup = document.getElementById('welcomePopup');

const gridSize = 20;
const tileCount = canvas.width / gridSize;
let snake = [
  { x: 10, y: 10 }
];
let food = { x: 15, y: 15 };
let dx = 0;
let dy = 0;
let score = 0;
let gameSpeed = 200; // Very slow initial speed (ms per frame)
const minSpeed = 50; // Fastest speed (ms per frame)
const speedIncrement = 5; // Decrease interval by 5ms per food
let gameLoop;
let isPaused = true; // Start paused until pop-up is closed

// Trigger confetti when popup appears
document.addEventListener('DOMContentLoaded', () => {
  confetti({
    particleCount: 150,
    spread: 80,
    origin: { y: 0.5 },
    colors: ['#e74c3c', '#2ecc71', '#3498db', '#f1c40f'],
    zIndex: 1001 // Ensure confetti appears above popup
  });
});

// Load snake skin image
const snakeSkin = new Image();
snakeSkin.src = 'snake-skin.png'; // Replace with your image path or URL
snakeSkin.onload = () => {
  // Wait for pop-up to close before starting game
};
snakeSkin.onerror = () => {
  console.error('Failed to load snake skin image. Using fallback color.');
};

function closePopup() {
  const popup = document.getElementById('welcomePopup');
  popup.style.animation = 'fadeOut 0.5s ease-in';
  setTimeout(() => {
    popup.style.display = 'none';
    isPaused = false;
    gameLoop = setInterval(drawGame, gameSpeed);
  }, 500); // Match animation duration
}

function drawGame() {
  // Clear canvas
  ctx.fillStyle = '#222';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw grid
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  for (let i = 0; i < tileCount; i++) {
    ctx.beginPath();
    ctx.moveTo(i * gridSize, 0);
    ctx.lineTo(i * gridSize, canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * gridSize);
    ctx.lineTo(canvas.width, i * gridSize);
    ctx.stroke();
  }

  // If paused, show pause message and skip game logic
  if (isPaused) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Paused', canvas.width / 2, canvas.height / 2);
    return;
  }

  // Move snake with wrap-around
  let head = { x: snake[0].x + dx, y: snake[0].y + dy };
  // Wrap around edges
  if (head.x < 0) head.x = tileCount - 1;
  if (head.x >= tileCount) head.x = 0;
  if (head.y < 0) head.y = tileCount - 1;
  if (head.y >= tileCount) head.y = 0;
  snake.unshift(head);

  // Check if snake ate food
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreDisplay.textContent = `Score: ${score}`;
    generateFood();
    // Increase speed (decrease interval)
    gameSpeed = Math.max(minSpeed, gameSpeed - speedIncrement);
    clearInterval(gameLoop);
    gameLoop = setInterval(drawGame, gameSpeed);
  } else {
    snake.pop();
  }

  // Check self-collision
  if (snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y)) {
    endGame();
    return;
  }

  // Draw snake with snake skin image
  snake.forEach(segment => {
    if (snakeSkin.complete && snakeSkin.naturalWidth !== 0) {
      ctx.drawImage(snakeSkin, segment.x * gridSize + 2, segment.y * gridSize + 2, gridSize - 4, gridSize - 4);
    } else {
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#27ae60');
      gradient.addColorStop(1, '#2ecc71');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(segment.x * gridSize + 2, segment.y * gridSize + 2, gridSize - 4, gridSize - 4, 5);
      ctx.fill();
    }
  });

  // Draw food as glowing orb
  ctx.beginPath();
  ctx.arc(food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2, gridSize / 2 - 2, 0, Math.PI * 2);
  ctx.fillStyle = '#e74c3c';
  ctx.shadowBlur = 10;
  ctx.shadowColor = '#e74c3c';
  ctx.fill();
  ctx.shadowBlur = 0;
}

function generateFood() {
  food.x = Math.floor(Math.random() * tileCount);
  food.y = Math.floor(Math.random() * tileCount);
  if (snake.some(segment => segment.x === food.x && segment.y === food.y)) {
    generateFood();
  }
}

function endGame() {
  clearInterval(gameLoop);
  gameOverScreen.style.display = 'flex';
}

function togglePause() {
  if (gameOverScreen.style.display === 'flex' || welcomePopup.style.display === 'flex') return; // Don't pause during game over or pop-up
  isPaused = !isPaused;
  if (isPaused) {
    clearInterval(gameLoop);
    pauseButton.textContent = 'Resume';
  } else {
    gameLoop = setInterval(drawGame, gameSpeed);
    pauseButton.textContent = 'Pause';
  }
}

function restartGame() {
  snake = [{ x: 10, y: 10 }];
  food = { x: 15, y: 15 };
  dx = 0;
  dy = 0;
  score = 0;
  gameSpeed = 200; // Very slow speed
  isPaused = false;
  scoreDisplay.textContent = `Score: ${score}`;
  gameOverScreen.style.display = 'none';
  pauseButton.textContent = 'Pause';
  clearInterval(gameLoop);
  gameLoop = setInterval(drawGame, gameSpeed);
}

document.addEventListener('keydown', e => {
  if (e.key === 'p' || e.key === 'P') {
    togglePause();
  } else if (!isPaused && gameOverScreen.style.display !== 'flex' && welcomePopup.style.display !== 'flex') {
    switch (e.key) {
      case 'ArrowUp':
        if (dy === 0) { dx = 0; dy = -1; }
        break;
      case 'ArrowDown':
        if (dy === 0) { dx = 0; dy = 1; }
        break;
      case 'ArrowLeft':
        if (dx === 0) { dx = -1; dy = 0; }
        break;
      case 'ArrowRight':
        if (dx === 0) { dx = 1; dy = 0; }
        break;
    }
  }
});