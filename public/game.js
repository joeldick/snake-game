// Snake Game Configuration
const CONFIG = {
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,
    GRID_SIZE: 20,
    INITIAL_SNAKE_LENGTH: 3,
    GAME_SPEED: 150, // milliseconds between moves
    
    // Colors
    COLORS: {
        BACKGROUND: '#000000',
        SNAKE_HEAD: '#00AA00',
        SNAKE_BODY: '#00FF00',
        FOOD: '#FF0000',
        GRID_LINE: '#333333'
    }
};

// Game state
const GAME_STATES = {
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'game_over'
};

// Game variables
let canvas, ctx;
let gameState = GAME_STATES.PLAYING;
let score = 0;
let gameLoop;

// Snake object
let snake = {
    body: [],
    direction: { x: 1, y: 0 },
    nextDirection: { x: 1, y: 0 }
};

// Food object
let food = {
    x: 0,
    y: 0
};

// Touch tracking for swipe detection
let touchStartX = 0;
let touchStartY = 0;

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', function() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Set up event listeners
    document.addEventListener('keydown', handleKeyPress);
    
    // Set up touch event listeners for mobile swipe support
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    // Initialize game
    initGame();
    startGameLoop();
});

function initGame() {
    // Reset game state
    gameState = GAME_STATES.PLAYING;
    score = 0;
    updateScore();
    
    // Initialize snake in center
    const centerX = Math.floor(CONFIG.CANVAS_WIDTH / CONFIG.GRID_SIZE / 2);
    const centerY = Math.floor(CONFIG.CANVAS_HEIGHT / CONFIG.GRID_SIZE / 2);
    
    snake.body = [];
    for (let i = 0; i < CONFIG.INITIAL_SNAKE_LENGTH; i++) {
        snake.body.push({ x: centerX - i, y: centerY });
    }
    
    snake.direction = { x: 1, y: 0 };
    snake.nextDirection = { x: 1, y: 0 };
    
    // Generate first food
    generateFood();
    
    // Hide game over screen
    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('pausedMessage').style.display = 'none';
}

function startGameLoop() {
    if (gameLoop) {
        clearInterval(gameLoop);
    }
    
    gameLoop = setInterval(function() {
        if (gameState === GAME_STATES.PLAYING) {
            updateGame();
            drawGame();
        }
    }, CONFIG.GAME_SPEED);
}

function updateGame() {
    // Update snake direction
    snake.direction = { ...snake.nextDirection };
    
    // Move snake
    const head = { ...snake.body[0] };
    head.x += snake.direction.x;
    head.y += snake.direction.y;
    
    // Check wall collision
    if (head.x < 0 || head.x >= CONFIG.CANVAS_WIDTH / CONFIG.GRID_SIZE ||
        head.y < 0 || head.y >= CONFIG.CANVAS_HEIGHT / CONFIG.GRID_SIZE) {
        gameOver();
        return;
    }
    
    // Check self collision
    for (let segment of snake.body) {
        if (head.x === segment.x && head.y === segment.y) {
            gameOver();
            return;
        }
    }
    
    snake.body.unshift(head);
    
    // Check food collision
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        updateScore();
        generateFood();
    } else {
        snake.body.pop();
    }
}

function drawGame() {
    // Clear canvas
    ctx.fillStyle = CONFIG.COLORS.BACKGROUND;
    ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
    
    // Draw grid (optional)
    drawGrid();
    
    // Draw snake
    drawSnake();
    
    // Draw food
    drawFood();
}

function drawGrid() {
    ctx.strokeStyle = CONFIG.COLORS.GRID_LINE;
    ctx.lineWidth = 1;
    
    // Vertical lines
    for (let x = 0; x <= CONFIG.CANVAS_WIDTH; x += CONFIG.GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CONFIG.CANVAS_HEIGHT);
        ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y <= CONFIG.CANVAS_HEIGHT; y += CONFIG.GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CONFIG.CANVAS_WIDTH, y);
        ctx.stroke();
    }
}

function drawSnake() {
    snake.body.forEach((segment, index) => {
        const x = segment.x * CONFIG.GRID_SIZE;
        const y = segment.y * CONFIG.GRID_SIZE;
        
        // Different color for head
        if (index === 0) {
            ctx.fillStyle = CONFIG.COLORS.SNAKE_HEAD;
        } else {
            ctx.fillStyle = CONFIG.COLORS.SNAKE_BODY;
        }
        
        ctx.fillRect(x + 1, y + 1, CONFIG.GRID_SIZE - 2, CONFIG.GRID_SIZE - 2);
        
        // Add border
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 1, y + 1, CONFIG.GRID_SIZE - 2, CONFIG.GRID_SIZE - 2);
    });
}

function drawFood() {
    const x = food.x * CONFIG.GRID_SIZE + CONFIG.GRID_SIZE / 2;
    const y = food.y * CONFIG.GRID_SIZE + CONFIG.GRID_SIZE / 2;
    const radius = CONFIG.GRID_SIZE / 2 - 2;
    
    ctx.fillStyle = CONFIG.COLORS.FOOD;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

function generateFood() {
    do {
        food.x = Math.floor(Math.random() * (CONFIG.CANVAS_WIDTH / CONFIG.GRID_SIZE));
        food.y = Math.floor(Math.random() * (CONFIG.CANVAS_HEIGHT / CONFIG.GRID_SIZE));
    } while (isSnakePosition(food.x, food.y));
}

function isSnakePosition(x, y) {
    return snake.body.some(segment => segment.x === x && segment.y === y);
}

function handleKeyPress(event) {
    // Prevent default behavior for arrow keys
    if ([37, 38, 39, 40, 32].includes(event.keyCode)) {
        event.preventDefault();
    }
    
    if (gameState === GAME_STATES.PLAYING) {
        switch (event.key.toLowerCase()) {
            case 'arrowup':
            case 'w':
                if (snake.direction.y !== 1) {
                    snake.nextDirection = { x: 0, y: -1 };
                }
                break;
            case 'arrowdown':
            case 's':
                if (snake.direction.y !== -1) {
                    snake.nextDirection = { x: 0, y: 1 };
                }
                break;
            case 'arrowleft':
            case 'a':
                if (snake.direction.x !== 1) {
                    snake.nextDirection = { x: -1, y: 0 };
                }
                break;
            case 'arrowright':
            case 'd':
                if (snake.direction.x !== -1) {
                    snake.nextDirection = { x: 1, y: 0 };
                }
                break;
            case ' ':
                pauseGame();
                break;
        }
    } else if (gameState === GAME_STATES.PAUSED) {
        if (event.key === ' ') {
            resumeGame();
        }
    } else if (gameState === GAME_STATES.GAME_OVER) {
        if (event.key.toLowerCase() === 'r') {
            restartGame();
        }
    }
}

function handleTouchStart(event) {
    event.preventDefault();
    const touch = event.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
}

function handleTouchEnd(event) {
    event.preventDefault();
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;
    const minSwipeDistance = 20;
    const isTap = Math.abs(deltaX) < minSwipeDistance && Math.abs(deltaY) < minSwipeDistance;

    if (gameState === GAME_STATES.PLAYING) {
        if (!isTap) {
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Horizontal swipe
                if (deltaX > 0 && snake.direction.x !== -1) {
                    snake.nextDirection = { x: 1, y: 0 };
                } else if (deltaX < 0 && snake.direction.x !== 1) {
                    snake.nextDirection = { x: -1, y: 0 };
                }
            } else {
                // Vertical swipe
                if (deltaY > 0 && snake.direction.y !== -1) {
                    snake.nextDirection = { x: 0, y: 1 };
                } else if (deltaY < 0 && snake.direction.y !== 1) {
                    snake.nextDirection = { x: 0, y: -1 };
                }
            }
        }
    } else if (gameState === GAME_STATES.PAUSED) {
        if (isTap) {
            resumeGame();
        }
    } else if (gameState === GAME_STATES.GAME_OVER) {
        if (isTap) {
            restartGame();
        }
    }
}

function pauseGame() {
    gameState = GAME_STATES.PAUSED;
    document.getElementById('pausedMessage').style.display = 'block';
}

function resumeGame() {
    gameState = GAME_STATES.PLAYING;
    document.getElementById('pausedMessage').style.display = 'none';
}

function gameOver() {
    gameState = GAME_STATES.GAME_OVER;
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOver').style.display = 'block';
}

function restartGame() {
    initGame();
}

function updateScore() {
    document.getElementById('score').textContent = score;
}

// Handle window resize for responsive design
window.addEventListener('resize', function() {
    // Redraw game if needed
    if (gameState !== GAME_STATES.GAME_OVER) {
        drawGame();
    }
});