// Game Variables
let canvas, ctx;
let gameState = 'welcome'; // welcome, playing, gameOver
let gameTime = 0;
let lastTime = 0;
let bestTime = localStorage.getItem('gameBallsBestTime') || 0;
let soundEnabled = true;

// Game Objects
let player;
let enemies = [];
let powerUps = [];
let particles = [];

// Game Settings
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PLAYER_SPEED = 5;
const INITIAL_ENEMY_SPEED = 2;
const ENEMY_SPAWN_INTERVAL = 10000; // 10 seconds
const SPEED_INCREASE_INTERVAL = 15000; // 15 seconds
const POWERUP_SPAWN_CHANCE = 0.002; // Chance per frame

// Background Animation
let backgroundOffset = 0;
let backgroundRotation = 0;

// Input Handling
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
};

// Audio Context for Sound Effects
let audioContext;
let soundInitialized = false;

// Initialize Audio
function initAudio() {
    if (!soundInitialized && soundEnabled) {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            soundInitialized = true;
        } catch (e) {
            console.log('Audio not supported');
            soundEnabled = false;
        }
    }
}

// Sound Effects
function playSound(frequency, duration, type = 'sine') {
    if (!soundEnabled || !audioContext) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

// Particle System
class Particle {
    constructor(x, y, color, velocity) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.velocity = velocity;
        this.life = 1.0;
        this.decay = 0.02;
    }
    
    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.velocity.x *= 0.98;
        this.velocity.y *= 0.98;
        this.life -= this.decay;
    }
    
    draw() {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// Player Class
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 15;
        this.color = '#4ecdc4';
        this.glowColor = 'rgba(78, 205, 196, 0.3)';
    }
    
    update() {
        // Movement
        if (keys.ArrowUp && this.y - this.radius > 0) {
            this.y -= PLAYER_SPEED;
        }
        if (keys.ArrowDown && this.y + this.radius < CANVAS_HEIGHT) {
            this.y += PLAYER_SPEED;
        }
        if (keys.ArrowLeft && this.x - this.radius > 0) {
            this.x -= PLAYER_SPEED;
        }
        if (keys.ArrowRight && this.x + this.radius < CANVAS_WIDTH) {
            this.x += PLAYER_SPEED;
        }
    }
    
    draw() {
        // Glow effect
        ctx.save();
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 20;
        
        // Main ball
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(this.x - 3, this.y - 3, this.radius * 0.6, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

// Enemy Class
class Enemy {
    constructor(x, y, speed, targetX = null, targetY = null) {
        this.x = x;
        this.y = y;
        this.radius = 12;
        this.speed = speed;
        this.color = '#ff6b6b';
        this.pulsePhase = Math.random() * Math.PI * 2;
        
        // If target is provided (for spawning from edges), move towards it
        if (targetX !== null && targetY !== null) {
            const dx = targetX - x;
            const dy = targetY - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            this.velocityX = (dx / distance) * speed;
            this.velocityY = (dy / distance) * speed;
        } else {
            // Random movement with minimum speed
            let vx = (Math.random() - 0.5) * speed * 2;
            let vy = (Math.random() - 0.5) * speed * 2;
            
            // Ensure minimum speed
            if (Math.abs(vx) < speed * 0.5) {
                vx = vx >= 0 ? speed * 0.5 : -speed * 0.5;
            }
            if (Math.abs(vy) < speed * 0.5) {
                vy = vy >= 0 ? speed * 0.5 : -speed * 0.5;
            }
            
            this.velocityX = vx;
            this.velocityY = vy;
        }
    }
    
    update() {
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // Bounce off walls
        if (this.x - this.radius <= 0) {
            this.velocityX = Math.abs(this.velocityX); // Ensure positive velocity
            this.x = this.radius;
            playSound(200, 0.1, 'square');
        }
        if (this.x + this.radius >= CANVAS_WIDTH) {
            this.velocityX = -Math.abs(this.velocityX); // Ensure negative velocity
            this.x = CANVAS_WIDTH - this.radius;
            playSound(200, 0.1, 'square');
        }
        if (this.y - this.radius <= 0) {
            this.velocityY = Math.abs(this.velocityY); // Ensure positive velocity
            this.y = this.radius;
            playSound(200, 0.1, 'square');
        }
        if (this.y + this.radius >= CANVAS_HEIGHT) {
            this.velocityY = -Math.abs(this.velocityY); // Ensure negative velocity
            this.y = CANVAS_HEIGHT - this.radius;
            playSound(200, 0.1, 'square');
        }
        
        this.pulsePhase += 0.1;
    }
    
    draw() {
        const pulseSize = Math.sin(this.pulsePhase) * 2;
        
        ctx.save();
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15;
        
        // Main ball
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + pulseSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.arc(this.x - 2, this.y - 2, (this.radius + pulseSize) * 0.5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

// PowerUp Class
class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.radius = 10;
        this.type = type; // 'slow', 'destroy'
        this.lifetime = 10000; // 10 seconds
        this.pulsePhase = 0;
        
        if (type === 'slow') {
            this.color = '#ffd700';
            this.effect = '⏰';
        } else if (type === 'destroy') {
            this.color = '#ff69b4';
            this.effect = '💥';
        }
    }
    
    update(deltaTime) {
        this.lifetime -= deltaTime;
        this.pulsePhase += 0.15;
        return this.lifetime > 0;
    }
    
    draw() {
        const pulse = Math.sin(this.pulsePhase) * 3;
        
        ctx.save();
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 20;
        
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + pulse, 0, Math.PI * 2);
        ctx.fill();
        
        // Effect symbol
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.effect, this.x, this.y + 5);
        
        ctx.restore();
    }
    
    activate() {
        if (this.type === 'slow') {
            slowTime();
        } else if (this.type === 'destroy') {
            destroyRandomEnemy();
        }
        playSound(800, 0.3, 'sine');
    }
}

// Power-up effects
function slowTime() {
    const originalSpeed = PLAYER_SPEED;
    enemies.forEach(enemy => {
        enemy.velocityX *= 0.3;
        enemy.velocityY *= 0.3;
    });
    
    setTimeout(() => {
        enemies.forEach(enemy => {
            enemy.velocityX /= 0.3;
            enemy.velocityY /= 0.3;
        });
    }, 3000);
}

function destroyRandomEnemy() {
    if (enemies.length > 1) {
        const randomIndex = Math.floor(Math.random() * enemies.length);
        const enemy = enemies[randomIndex];
        
        // Create explosion particles
        for (let i = 0; i < 10; i++) {
            particles.push(new Particle(
                enemy.x,
                enemy.y,
                '#ff6b6b',
                {
                    x: (Math.random() - 0.5) * 8,
                    y: (Math.random() - 0.5) * 8
                }
            ));
        }
        
        enemies.splice(randomIndex, 1);
    }
}

// Collision Detection
function checkCollision(obj1, obj2) {
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < obj1.radius + obj2.radius;
}

// Game Functions
function initGame() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Initialize player
    player = new Player(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    
    // Initialize first enemy inside the canvas with random movement
    enemies = [];
    let firstEnemyX = Math.random() * (CANVAS_WIDTH - 200) + 100;
    let firstEnemyY = Math.random() * (CANVAS_HEIGHT - 200) + 100;
    // Make sure first enemy doesn't spawn too close to player
    while (Math.abs(firstEnemyX - player.x) < 100 && Math.abs(firstEnemyY - player.y) < 100) {
        firstEnemyX = Math.random() * (CANVAS_WIDTH - 200) + 100;
        firstEnemyY = Math.random() * (CANVAS_HEIGHT - 200) + 100;
    }
    enemies.push(new Enemy(firstEnemyX, firstEnemyY, INITIAL_ENEMY_SPEED));
    
    // Clear arrays
    powerUps = [];
    particles = [];
    
    // Reset game time
    gameTime = 0;
    lastTime = 0;
    
    // Update UI
    updateBestScore();
    
    // Start game loop
    gameLoop();
}

function spawnEnemy() {
    let x, y, targetX, targetY;
    const side = Math.floor(Math.random() * 4);
    const currentSpeed = INITIAL_ENEMY_SPEED + Math.floor(gameTime / SPEED_INCREASE_INTERVAL) * 0.5;
    
    // Generate random target point inside the canvas
    targetX = Math.random() * (CANVAS_WIDTH - 100) + 50;
    targetY = Math.random() * (CANVAS_HEIGHT - 100) + 50;
    
    switch (side) {
        case 0: // Top
            x = Math.random() * CANVAS_WIDTH;
            y = -20;
            break;
        case 1: // Right
            x = CANVAS_WIDTH + 20;
            y = Math.random() * CANVAS_HEIGHT;
            break;
        case 2: // Bottom
            x = Math.random() * CANVAS_WIDTH;
            y = CANVAS_HEIGHT + 20;
            break;
        case 3: // Left
            x = -20;
            y = Math.random() * CANVAS_HEIGHT;
            break;
    }
    
    enemies.push(new Enemy(x, y, currentSpeed, targetX, targetY));
}

function spawnPowerUp() {
    const types = ['slow', 'destroy'];
    const type = types[Math.floor(Math.random() * types.length)];
    const x = Math.random() * (CANVAS_WIDTH - 40) + 20;
    const y = Math.random() * (CANVAS_HEIGHT - 40) + 20;
    
    powerUps.push(new PowerUp(x, y, type));
}

function updateBackground() {
    backgroundOffset += 0.5;
    backgroundRotation += 0.001;
}

function drawBackground() {
    ctx.save();
    
    // Animated gradient background
    const gradient = ctx.createLinearGradient(
        Math.sin(backgroundRotation) * 400 + 400, 
        Math.cos(backgroundRotation) * 300 + 300, 
        -Math.sin(backgroundRotation) * 400 + 400, 
        -Math.cos(backgroundRotation) * 300 + 300
    );
    gradient.addColorStop(0, '#1e3c72');
    gradient.addColorStop(0.5, '#2a5298');
    gradient.addColorStop(1, '#1e3c72');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Moving background pattern
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    
    for (let i = 0; i < 20; i++) {
        const x = (i * 50 + backgroundOffset) % (CANVAS_WIDTH + 50);
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
        
        const y = (i * 50 + backgroundOffset) % (CANVAS_HEIGHT + 50);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();
    }
    
    ctx.restore();
}

function gameLoop() {
    if (gameState !== 'playing') return;
    
    const currentTime = Date.now();
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    
    gameTime += deltaTime;
    
    // Update background
    updateBackground();
    
    // Clear canvas
    drawBackground();
    
    // Update player
    player.update();
    
    // Update enemies
    enemies.forEach(enemy => enemy.update());
    
    // Update power-ups
    powerUps = powerUps.filter(powerUp => powerUp.update(deltaTime));
    
    // Update particles
    particles = particles.filter(particle => {
        particle.update();
        return particle.life > 0;
    });
    
    // Spawn new enemies
    if (gameTime % ENEMY_SPAWN_INTERVAL < deltaTime) {
        spawnEnemy();
        playSound(300, 0.2, 'sawtooth');
    }
    
    // Spawn power-ups randomly
    if (Math.random() < POWERUP_SPAWN_CHANCE) {
        spawnPowerUp();
    }
    
    // Check collisions with enemies
    for (let enemy of enemies) {
        if (checkCollision(player, enemy)) {
            gameOver();
            return;
        }
    }
    
    // Check collisions with power-ups
    for (let i = powerUps.length - 1; i >= 0; i--) {
        if (checkCollision(player, powerUps[i])) {
            powerUps[i].activate();
            powerUps.splice(i, 1);
        }
    }
    
    // Draw particles
    particles.forEach(particle => particle.draw());
    
    // Draw power-ups
    powerUps.forEach(powerUp => powerUp.draw());
    
    // Draw enemies
    enemies.forEach(enemy => enemy.draw());
    
    // Draw player
    player.draw();
    
    // Update UI
    updateGameUI();
    
    requestAnimationFrame(gameLoop);
}

function gameOver() {
    gameState = 'gameOver';
    
    // Explosion effect
    for (let i = 0; i < 20; i++) {
        particles.push(new Particle(
            player.x,
            player.y,
            '#4ecdc4',
            {
                x: (Math.random() - 0.5) * 10,
                y: (Math.random() - 0.5) * 10
            }
        ));
    }
    
    playSound(150, 1, 'sawtooth');
    
    const finalTime = Math.floor(gameTime / 1000);
    document.getElementById('finalTime').textContent = `Tiempo sobrevivido: ${finalTime}s`;
    
    // Check for new record
    if (finalTime > bestTime) {
        bestTime = finalTime;
        localStorage.setItem('gameBallsBestTime', bestTime);
        document.getElementById('newRecord').classList.remove('hidden');
        playSound(600, 0.5, 'sine');
    } else {
        document.getElementById('newRecord').classList.add('hidden');
    }
    
    showScreen('gameOverScreen');
}

function updateGameUI() {
    const seconds = Math.floor(gameTime / 1000);
    document.getElementById('timer').textContent = `Tiempo: ${seconds}s`;
    document.getElementById('enemyCount').textContent = `Enemigos: ${enemies.length}`;
    
    const speedMultiplier = (1 + Math.floor(gameTime / SPEED_INCREASE_INTERVAL) * 0.25).toFixed(1);
    document.getElementById('speed').textContent = `Velocidad: ${speedMultiplier}x`;
}

function updateBestScore() {
    document.getElementById('bestScore').textContent = `Mejor Tiempo: ${bestTime}s`;
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    document.getElementById(screenId).classList.remove('hidden');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    updateBestScore();
    
    document.getElementById('startButton').addEventListener('click', () => {
        initAudio();
        gameState = 'playing';
        showScreen('gameScreen');
        initGame();
        playSound(400, 0.3, 'sine');
    });
    
    document.getElementById('restartButton').addEventListener('click', () => {
        gameState = 'playing';
        showScreen('gameScreen');
        initGame();
        playSound(400, 0.3, 'sine');
    });
    
    document.getElementById('homeButton').addEventListener('click', () => {
        gameState = 'welcome';
        showScreen('welcomeScreen');
        playSound(300, 0.2, 'sine');
    });
    
    document.getElementById('soundToggle').addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        document.getElementById('soundToggle').textContent = `Sonido: ${soundEnabled ? 'ON' : 'OFF'}`;
        
        if (soundEnabled) {
            initAudio();
        }
    });
});

// Keyboard Controls
document.addEventListener('keydown', (e) => {
    if (e.code in keys) {
        keys[e.code] = true;
        e.preventDefault();
    }
});

document.addEventListener('keyup', (e) => {
    if (e.code in keys) {
        keys[e.code] = false;
        e.preventDefault();
    }
});

// Prevent scrolling with arrow keys
window.addEventListener('keydown', (e) => {
    if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
    }
});

// Initialize canvas context when page loads
document.addEventListener('DOMContentLoaded', () => {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
}); 