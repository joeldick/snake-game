// Snake Game Configuration
const CONFIG = {
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,
    GRID_SIZE: 20,
    INITIAL_SNAKE_LENGTH: 3,
    GAME_SPEED: 150, // milliseconds between moves
    // Boost settings (tap/click to speed up when tapping the current direction)
    BOOST_MULTIPLIER: 0.5, // multiply GAME_SPEED by this when boosting (smaller -> faster)
    BOOST_DURATION: 300, // milliseconds the boost lasts
    
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
let gameLoopTimeout = null;
let currentSpeed = CONFIG.GAME_SPEED;
let boostTimer = null;

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

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', function() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Handle responsive canvas for mobile
    function resizeCanvas() {
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        // Set canvas resolution to match display size * device pixel ratio for crisp rendering
        canvas.width = Math.round(rect.width * dpr);
        canvas.height = Math.round(rect.height * dpr);
        
        // Scale context to match device pixel ratio
        ctx.scale(dpr, dpr);
        
        // Redraw game at new size
        if (gameState !== GAME_STATES.GAME_OVER) {
            drawGame();
        }
    }
    
    // Initial resize
    resizeCanvas();
    
    // Resize on window change
    window.addEventListener('resize', resizeCanvas);
    
    // Set up event listeners
    document.addEventListener('keydown', handleKeyPress);
    // Touch / mobile support: respond to taps anywhere on screen
    document.addEventListener('touchstart', handleTouch, { passive: false });
    // Desktop click support: respond to clicks anywhere on screen
    document.addEventListener('mousedown', (e) => {
        // Create a synthetic touch-like object from mouse event
        handleTouch({
            preventDefault: () => e.preventDefault(),
            touches: null,
            clientX: e.clientX,
            clientY: e.clientY
        });
    });
    
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
    // Clear any existing timeout
    if (gameLoopTimeout) {
        clearTimeout(gameLoopTimeout);
        gameLoopTimeout = null;
    }

    // Use a self-adjusting timeout so we can change `currentSpeed` on the fly
    function tick() {
        if (gameState === GAME_STATES.PLAYING) {
            updateGame();
            drawGame();
        }
        gameLoopTimeout = setTimeout(tick, currentSpeed);
    }

    // Start the loop
    gameLoopTimeout = setTimeout(tick, currentSpeed);
}

function stopGameLoop() {
    if (gameLoopTimeout) {
        clearTimeout(gameLoopTimeout);
        gameLoopTimeout = null;
    }
}

function setBoost() {
    // Apply boost: lower the interval (faster)
    currentSpeed = Math.max(30, Math.floor(CONFIG.GAME_SPEED * CONFIG.BOOST_MULTIPLIER));

    // Restart the loop so the new interval takes effect immediately
    if (gameLoopTimeout) {
        clearTimeout(gameLoopTimeout);
        gameLoopTimeout = null;
    }
    startGameLoop();

    // Clear previous boost timer
    if (boostTimer) {
        clearTimeout(boostTimer);
    }

    // Schedule restoring speed
    boostTimer = setTimeout(() => {
        currentSpeed = CONFIG.GAME_SPEED;
        // Restart loop to apply restored speed
        if (gameLoopTimeout) {
            clearTimeout(gameLoopTimeout);
            gameLoopTimeout = null;
        }
        startGameLoop();
        boostTimer = null;
    }, CONFIG.BOOST_DURATION);
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
        let desired = null;
        switch (event.key.toLowerCase()) {
            case 'arrowup':
            case 'w':
                desired = { x: 0, y: -1 };
                break;
            case 'arrowdown':
            case 's':
                desired = { x: 0, y: 1 };
                break;
            case 'arrowleft':
            case 'a':
                desired = { x: -1, y: 0 };
                break;
            case 'arrowright':
            case 'd':
                desired = { x: 1, y: 0 };
                break;
            case ' ':
                pauseGame();
                break;
        }

        if (desired) {
            // Prevent reversing
            if (!(desired.x === -snake.direction.x && desired.y === -snake.direction.y)) {
                // If the desired direction is the same as the current direction, trigger a boost
                if (desired.x === snake.direction.x && desired.y === snake.direction.y) {
                    setBoost();
                } else {
                    snake.nextDirection = desired;
                }
            }
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

// Handle touch/click events on screen. Divides viewport into quadrants.
// Tap/click anywhere in upper half = up, lower half = down, left half = left, right half = right.
// Uses screen-wide zones (not limited to canvas) for easier access and rapid direction changes.
function handleTouch(event) {
    // Prevent scrolling on touch
    event.preventDefault();

    if (gameState !== GAME_STATES.PLAYING) {
        // If paused, tapping could resume
        if (gameState === GAME_STATES.PAUSED) {
            resumeGame();
        }
        return;
    }

    const touch = event.touches ? event.touches[0] : event;
    if (!touch) return;

    // Use viewport coordinates (full screen), not canvas-relative
    const touchX = touch.clientX;
    const touchY = touch.clientY;

    // Determine direction based on which half/quadrant of the screen was touched
    // Vertical: top half = up, bottom half = down
    // Horizontal: left half = left, right half = right
    // The largest delta determines the primary direction
    const screenCenterX = window.innerWidth / 2;
    const screenCenterY = window.innerHeight / 2;

    const dx = touchX - screenCenterX;
    const dy = touchY - screenCenterY;

    // Decide direction by largest absolute delta (more forgiving than head-relative)
    let desired = { x: 0, y: 0 };
    if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal zone
        desired.x = dx > 0 ? 1 : -1;
        desired.y = 0;
    } else {
        // Vertical zone
        desired.x = 0;
        desired.y = dy > 0 ? 1 : -1;
    }

    // Prevent reversing into itself
    if (!(desired.x === -snake.direction.x && desired.y === -snake.direction.y)) {
        // If the desired direction is the same as the current direction, trigger a boost
        if (desired.x === snake.direction.x && desired.y === snake.direction.y) {
            setBoost();
        } else {
            snake.nextDirection = desired;
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

// Expose functions globally so inline onclick handlers can call them (since this is a module)
window.restartGame = restartGame;
window.updateScore = updateScore;

// Handle window resize for responsive design
window.addEventListener('resize', function() {
    // Redraw game if needed
    if (gameState !== GAME_STATES.GAME_OVER) {
        drawGame();
    }
});
