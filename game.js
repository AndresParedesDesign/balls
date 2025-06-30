// ===== CONFIGURACIÓN DEL JUEGO =====
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PLAYER_SPEED = 4;
const ENEMY_SPEED = 2.5;
const ENEMY_SPAWN_TIME = 8000; // 8 segundos
const SPEED_INCREASE_TIME = 20000; // 20 segundos

// ===== VARIABLES GLOBALES =====
let canvas, ctx;
let gameState = 'welcome'; // 'welcome', 'playing', 'gameOver'
let gameTime = 0;
let lastEnemySpawn = 0;
let lastSpeedIncrease = 0;
let bestScore = localStorage.getItem('bestScore') || 0;
let currentSpeedMultiplier = 1;

// ===== OBJETOS DEL JUEGO =====
let player = null;
let enemies = [];
let powerUps = [];

// ===== CONTROLES =====
const keys = {};

// ===== AUDIO =====
let audioContext = null;
let soundEnabled = true;

// ===== INICIALIZACIÓN =====
function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Inicializar audio
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        soundEnabled = false;
    }
    
    // Mostrar mejor puntuación
    updateBestScore();
    
    // Event listeners
    setupEventListeners();
}

// ===== CLASE JUGADOR =====
class Player {
    constructor() {
        this.x = CANVAS_WIDTH / 2;
        this.y = CANVAS_HEIGHT / 2;
        this.radius = 15;
        this.color = '#4ecdc4'; // Azul
    }
    
    update() {
        // Movimiento con flechas
        if (keys['ArrowUp'] && this.y - this.radius > 0) {
            this.y -= PLAYER_SPEED;
        }
        if (keys['ArrowDown'] && this.y + this.radius < CANVAS_HEIGHT) {
            this.y += PLAYER_SPEED;
        }
        if (keys['ArrowLeft'] && this.x - this.radius > 0) {
            this.x -= PLAYER_SPEED;
        }
        if (keys['ArrowRight'] && this.x + this.radius < CANVAS_WIDTH) {
            this.x += PLAYER_SPEED;
        }
    }
    
    draw() {
        ctx.save();
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// ===== CLASE ENEMIGO =====
class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 12;
        this.color = '#ff6b6b'; // Rojo
        
        // Generar velocidad aleatoria
        const angle = Math.random() * Math.PI * 2;
        const speed = ENEMY_SPEED * currentSpeedMultiplier;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        
        // Asegurar velocidad mínima
        if (Math.abs(this.vx) < speed * 0.5) {
            this.vx = this.vx > 0 ? speed * 0.5 : -speed * 0.5;
        }
        if (Math.abs(this.vy) < speed * 0.5) {
            this.vy = this.vy > 0 ? speed * 0.5 : -speed * 0.5;
        }
    }
    
    update() {
        // Mover
        this.x += this.vx;
        this.y += this.vy;
        
        // Rebotar en paredes
        if (this.x <= this.radius || this.x >= CANVAS_WIDTH - this.radius) {
            this.vx = -this.vx;
            this.x = this.x <= this.radius ? this.radius : CANVAS_WIDTH - this.radius;
            playSound(200, 0.1);
        }
        if (this.y <= this.radius || this.y >= CANVAS_HEIGHT - this.radius) {
            this.vy = -this.vy;
            this.y = this.y <= this.radius ? this.radius : CANVAS_HEIGHT - this.radius;
            playSound(200, 0.1);
        }
    }
    
    draw() {
        ctx.save();
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// ===== CLASE POWER-UP =====
class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.radius = 12;
        this.type = type; // 'slow' o 'destroy'
        this.lifetime = 15000; // 15 segundos
        this.age = 0;
        
        if (type === 'slow') {
            this.color = '#ffd700'; // Dorado
            this.symbol = '⏰';
        } else {
            this.color = '#ff69b4'; // Rosa
            this.symbol = '💥';
        }
    }
    
    update(deltaTime) {
        this.age += deltaTime;
        return this.age < this.lifetime;
    }
    
    draw() {
        // Efecto pulsante
        const pulse = Math.sin(this.age * 0.01) * 2;
        
        ctx.save();
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + pulse, 0, Math.PI * 2);
        ctx.fill();
        
        // Símbolo
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.symbol, this.x, this.y + 5);
        ctx.restore();
    }
    
    activate() {
        if (this.type === 'slow') {
            slowEnemies();
        } else {
            destroyRandomEnemy();
        }
        playSound(500, 0.3);
    }
}

// ===== FUNCIONES DE POWER-UPS =====
function slowEnemies() {
    enemies.forEach(enemy => {
        enemy.vx *= 0.5;
        enemy.vy *= 0.5;
    });
    
    // Restaurar velocidad después de 5 segundos
    setTimeout(() => {
        enemies.forEach(enemy => {
            enemy.vx *= 2;
            enemy.vy *= 2;
        });
    }, 5000);
}

function destroyRandomEnemy() {
    if (enemies.length > 0) {
        const randomIndex = Math.floor(Math.random() * enemies.length);
        enemies.splice(randomIndex, 1);
    }
}

// ===== FUNCIONES DE SPAWNING =====
function spawnEnemy() {
    const side = Math.floor(Math.random() * 4);
    let x, y;
    
    switch (side) {
        case 0: // Arriba
            x = Math.random() * CANVAS_WIDTH;
            y = -20;
            break;
        case 1: // Derecha
            x = CANVAS_WIDTH + 20;
            y = Math.random() * CANVAS_HEIGHT;
            break;
        case 2: // Abajo
            x = Math.random() * CANVAS_WIDTH;
            y = CANVAS_HEIGHT + 20;
            break;
        case 3: // Izquierda
            x = -20;
            y = Math.random() * CANVAS_HEIGHT;
            break;
    }
    
    enemies.push(new Enemy(x, y));
}

function spawnPowerUp() {
    const x = Math.random() * (CANVAS_WIDTH - 50) + 25;
    const y = Math.random() * (CANVAS_HEIGHT - 50) + 25;
    const type = Math.random() < 0.5 ? 'slow' : 'destroy';
    
    powerUps.push(new PowerUp(x, y, type));
}

// ===== DETECCIÓN DE COLISIONES =====
function checkCollision(obj1, obj2) {
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < obj1.radius + obj2.radius;
}

// ===== FUNCIONES DE JUEGO =====
function startGame() {
    gameState = 'playing';
    gameTime = 0;
    lastEnemySpawn = 0;
    lastSpeedIncrease = 0;
    currentSpeedMultiplier = 1;
    
    // Reiniciar objetos
    player = new Player();
    enemies = [];
    powerUps = [];
    
    // Spawn primer enemigo
    spawnEnemy();
    
    // Mostrar pantalla de juego
    showScreen('gameScreen');
    
    // Iniciar loop
    gameLoop();
}

function gameLoop() {
    if (gameState !== 'playing') return;
    
    const currentTime = Date.now();
    const deltaTime = 16; // ~60 FPS
    gameTime += deltaTime;
    
    // Limpiar canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Fondo
    drawBackground();
    
    // Actualizar jugador
    player.update();
    
    // Actualizar enemigos
    enemies.forEach(enemy => enemy.update());
    
    // Actualizar power-ups
    powerUps = powerUps.filter(powerUp => powerUp.update(deltaTime));
    
    // Spawn enemigos
    if (gameTime - lastEnemySpawn > ENEMY_SPAWN_TIME) {
        spawnEnemy();
        lastEnemySpawn = gameTime;
    }
    
    // Aumentar velocidad
    if (gameTime - lastSpeedIncrease > SPEED_INCREASE_TIME) {
        currentSpeedMultiplier += 0.2;
        lastSpeedIncrease = gameTime;
    }
    
    // Spawn power-ups (probabilidad baja)
    if (Math.random() < 0.001) {
        spawnPowerUp();
    }
    
    // Colisiones con enemigos
    for (let enemy of enemies) {
        if (checkCollision(player, enemy)) {
            endGame();
            return;
        }
    }
    
    // Colisiones con power-ups
    for (let i = powerUps.length - 1; i >= 0; i--) {
        if (checkCollision(player, powerUps[i])) {
            powerUps[i].activate();
            powerUps.splice(i, 1);
        }
    }
    
    // Dibujar todo
    player.draw();
    enemies.forEach(enemy => enemy.draw());
    powerUps.forEach(powerUp => powerUp.draw());
    
    // Actualizar UI
    updateGameUI();
    
    // Continuar loop
    requestAnimationFrame(gameLoop);
}

function endGame() {
    gameState = 'gameOver';
    const finalScore = Math.floor(gameTime / 1000);
    
    // Verificar mejor puntuación
    if (finalScore > bestScore) {
        bestScore = finalScore;
        localStorage.setItem('bestScore', bestScore);
        document.getElementById('newRecord').classList.remove('hidden');
    } else {
        document.getElementById('newRecord').classList.add('hidden');
    }
    
    document.getElementById('finalTime').textContent = `Tiempo sobrevivido: ${finalScore}s`;
    showScreen('gameOverScreen');
    
    playSound(150, 1);
}

// ===== FUNCIONES DE UI =====
function updateGameUI() {
    const seconds = Math.floor(gameTime / 1000);
    document.getElementById('timer').textContent = `Tiempo: ${seconds}s`;
    document.getElementById('enemyCount').textContent = `Enemigos: ${enemies.length}`;
    document.getElementById('speed').textContent = `Velocidad: ${currentSpeedMultiplier.toFixed(1)}x`;
}

function updateBestScore() {
    document.getElementById('bestScore').textContent = `Mejor Tiempo: ${bestScore}s`;
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    document.getElementById(screenId).classList.remove('hidden');
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#1e3c72');
    gradient.addColorStop(1, '#2a5298');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

// ===== SONIDO =====
function playSound(frequency, duration) {
    if (!soundEnabled || !audioContext) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Botones
    document.getElementById('startButton').addEventListener('click', startGame);
    document.getElementById('restartButton').addEventListener('click', startGame);
    document.getElementById('homeButton').addEventListener('click', () => {
        gameState = 'welcome';
        showScreen('welcomeScreen');
    });
    
    // Sonido
    document.getElementById('soundToggle').addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        document.getElementById('soundToggle').textContent = `Sonido: ${soundEnabled ? 'ON' : 'OFF'}`;
    });
    
    // Teclado
    document.addEventListener('keydown', (e) => {
        keys[e.code] = true;
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
            e.preventDefault();
        }
    });
    
    document.addEventListener('keyup', (e) => {
        keys[e.code] = false;
    });
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', init); 