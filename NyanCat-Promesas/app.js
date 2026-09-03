const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Elementos de la interfaz
const currentModuleEl = document.getElementById("current-module");
const livesEl = document.getElementById("lives");
const xpEl = document.getElementById("xp");
const musicBtn = document.getElementById("music-btn");
const startScreen = document.getElementById("start-screen");
const startBtn = document.getElementById("start-btn");
const quizModal = document.getElementById("quiz-modal");
const quizModuleTitle = document.getElementById("quiz-module-title");
const quizQuestion = document.getElementById("quiz-question");
const quizOptions = document.getElementById("quiz-options");
const victoryScreen = document.getElementById("victory-screen");
const restartBtn = document.getElementById("restart-btn");

// Alertas
const gameAlertModal = document.getElementById("game-alert-modal");
const gameAlertTitle = document.getElementById("game-alert-title");
const gameAlertMessage = document.getElementById("game-alert-message");
const gameAlertBtn = document.getElementById("game-alert-btn");

let alertCallback = null;

function showGameAlert(title, message, callback = null) {
    gameAlertTitle.textContent = title;
    gameAlertMessage.textContent = message;
    alertCallback = callback;
    gameAlertModal.classList.remove("hidden");
}

gameAlertBtn.onclick = () => {
    gameAlertModal.classList.add("hidden");
    if (alertCallback) alertCallback();
};

// Estado del juego
let gameState = "START";
let moduleIndex = 0;
let lives = 3;
let xp = 0;
let animTimer = 0;
let difficultyMultiplier = 1;

// --- AUDIO ---
let isMusicOn = false;
const bgMusic = new Audio('musica.mp3');
bgMusic.loop = true;
bgMusic.volume = 0.4;

const soundJump = new Audio('salto.mp3');
const soundPoint = new Audio('punto.mp3');
const soundHit = new Audio('impacto.mp3');
const soundGameOver = new Audio('gameover.mp3');

soundJump.volume = 0.5;
soundPoint.volume = 0.5;
soundHit.volume = 0.5;
soundGameOver.volume = 0.6;

function playSound(soundObj) {
    try {
        soundObj.currentTime = 0;
        soundObj.play().catch(e => {});
    } catch(e) {}
}

function toggleMusic() {
    isMusicOn = !isMusicOn;
    if (isMusicOn) {
        musicBtn.textContent = "🎵 Música: ON";
        bgMusic.play().catch(e => console.log("Error al reproducir música de fondo:", e));
    } else {
        musicBtn.textContent = "🎵 Música: OFF";
        bgMusic.pause();
        bgMusic.currentTime = 0;
    }
}
musicBtn.addEventListener("click", toggleMusic);

// Módulos (10 preguntas)
const modulesData = [
    {
        title: "Módulo 1 — Mi Primera Promesa",
        question: "¿Qué significa que una Promesa de fetch() se encuentre en estado pendiente?",
        options: [
            { text: "Que la información ya llegó con éxito.", correct: false },
            { text: "Que está esperando la respuesta de Internet.", correct: true },
            { text: "Que ocurrió un error grave en la red.", correct: false }
        ]
    },
    {
        title: "Módulo 2 — Promesa con una Lista",
        question: "¿Por qué podemos recorrer con un bucle la respuesta de varios usuarios?",
        options: [
            { text: "Porque recibimos una lista (array) con múltiples elementos.", correct: true },
            { text: "Porque el navegador se reinicia automáticamente.", correct: false },
            { text: "Porque las promesas no permiten usar bucles.", correct: false }
        ]
    },
    {
        title: "Módulo 3 — Promise.all()",
        question: "¿Qué sucede en Promise.all() si una de las tres operaciones (post, autor, comentarios) falla?",
        options: [
            { text: "Funciona normalmente ignorando el error.", correct: false },
            { text: "Todo el conjunto falla y se va al bloque catch().", correct: true },
            { text: "Solo se repite la segunda petición.", correct: false }
        ]
    },
    {
        title: "Módulo 4 — Promise.allSettled()",
        question: "¿Cuál es la principal ventaja de utilizar Promise.allSettled()?",
        options: [
            { text: "Permite revisar cuáles operaciones terminaron con éxito (fulfilled) y cuáles fallaron (rejected).", correct: true },
            { text: "Cancela automáticamente todo el internet si hay un error.", correct: false },
            { text: "Hace que las peticiones vayan el doble de rápido.", correct: false }
        ]
    },
    {
        title: "Módulo 5 — Promise.race()",
        question: "En Promise.race([peticionApi, timeout]), ¿qué significa que gane el temporizador?",
        options: [
            { text: "Que la API respondió súper rápido.", correct: false },
            { text: "Que la petición tardó demasiado y el timeout lanzó un aviso/error.", correct: true },
            { text: "Que empataron y se repite la carrera.", correct: false }
        ]
    },
    {
        title: "Módulo 6 — Promise.any()",
        question: "¿Qué diferencia principal hay entre Promise.race() y Promise.any()?",
        options: [
            { text: "Promise.any() busca específicamente el primer resultado exitoso (ignora los fallos iniciales).", correct: true },
            { text: "Promise.any() solo funciona con imágenes.", correct: false },
            { text: "No hay ninguna diferencia.", correct: false }
        ]
    },
    {
        title: "Módulo 7 — La Máquina de Estados",
        question: "Durante una búsqueda con estados, ¿qué estado representa cuando ya encontramos y mostramos la información?",
        options: [
            { text: "IDLE", correct: false },
            { text: "PENDING", correct: false },
            { text: "FULFILLED", correct: true }
        ]
    },
    {
        title: "Módulo 8 — async y await",
        question: "¿Qué ventaja principal ofrece usar async y await en lugar de muchos .then() encadenados?",
        options: [
            { text: "Permite leer el código de forma más secuencial y limpia, pareciendo código síncrono.", correct: true },
            { text: "Evita por completo el uso de servidores.", correct: false },
            { text: "Hace que la computadora tenga más memoria RAM.", correct: false }
        ]
    },
    {
        title: "Módulo 9 — Encender la Cámara",
        question: "¿Por qué el navegador pide obligatoriamente permiso al usuario antes de usar getUserMedia()?",
        options: [
            { text: "Porque la cámara es un recurso privado y sensible de seguridad.", correct: true },
            { text: "Para cambiar el fondo de pantalla automáticamente.", correct: false },
            { text: "Para gastar menos batería.", correct: false }
        ]
    },
    {
        title: "Módulo 10 — Mi Ubicación",
        question: "Al utilizar la Geolocalización del dispositivo, ¿qué datos clave obtenemos para saber dónde estamos?",
        options: [
            { text: "El color de la carcasa del celular.", correct: false },
            { text: "Latitud y longitud.", correct: true },
            { text: "La contraseña del Wi-Fi.", correct: false }
        ]
    }
];

// --- OBJETOS DEL JUEGO ---
let cat = {
    x: 100,
    y: 100,
    width: 52,
    height: 32,
    vx: 0,
    vy: 0,
    gravity: 0.4,
    jumpStrength: -8.5,
    speed: 4,
    isSliding: false
};

let powerUp = {
    x: 1300,
    y: 150,
    width: 32,
    height: 32,
    speed: 2.2
};

let foods = [
    { x: 450, y: 80, width: 36, height: 32, speed: 2.2, type: '🍰', collected: false },
    { x: 750, y: 180, width: 36, height: 32, speed: 2.2, type: '🍩', collected: false },
    { x: 1050, y: 100, width: 36, height: 32, speed: 2.2, type: '🍕', collected: false }
];

let traps = [
    { x: 600, y: 280, width: 25, height: 25, speed: 2.2 }
];

let platforms = [
    { x: 0, y: 350, width: 1000, height: 18, type: 'normal' },
    { x: 50, y: 140, width: 260, height: 16, type: 'ice' },
    { x: 380, y: 230, width: 260, height: 16, type: 'trampoline' },
    { x: 720, y: 120, width: 260, height: 16, type: 'ice' },
    { x: 1050, y: 210, width: 280, height: 16, type: 'trampoline' }
];

let badCat = {
    x: 1000,
    y: 280,
    width: 46,
    height: 30,
    speed: 2.5,
    vDir: 1
};

// Estrellas de fondo (estáticas)
const stars = [];
for (let i = 0; i < 80; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        brightness: 0.6 + Math.random() * 0.4
    });
}

// --- TECLADO ---
let keys = {};
let onGround = false;

window.addEventListener("keydown", (e) => {
    keys[e.key] = true;
    if(["ArrowUp", "ArrowDown", " ", "ArrowLeft", "ArrowRight"].includes(e.key)) e.preventDefault();
    
    if ((e.key === " " || e.key === "ArrowUp" || e.key === "w" || e.key === "W") && gameState === "PLAYING") {
        if (onGround) {
            cat.vy = cat.jumpStrength;
            playSound(soundJump);
            onGround = false;
        }
    }
});

window.addEventListener("keyup", (e) => {
    keys[e.key] = false;
});

// --- BOTONES ---
startBtn.addEventListener("click", () => {
    startScreen.classList.add("hidden");
    resetGame();
    gameState = "PLAYING";
    loop();
});

restartBtn.addEventListener("click", () => {
    victoryScreen.classList.add("hidden");
    resetGame();
    gameState = "PLAYING";
    loop();
});

// --- FUNCIONES DEL JUEGO ---
function resetGame() {
    moduleIndex = 0;
    lives = 3;
    xp = 0;
    difficultyMultiplier = 1;
    cat.x = 100;
    cat.y = 80;
    cat.vx = 0;
    cat.vy = 0;
    powerUp.x = 1400;
    badCat.x = 1100;
    onGround = false;
    
    // Reiniciar posiciones de comida y trampas
    foods.forEach((f, idx) => {
        f.x = 500 + (idx * 350);
        f.y = 80 + idx * 50;
        f.collected = false;
    });

    traps.forEach((t, idx) => {
        t.x = 700 + (idx * 400);
        t.y = 280;
    });

    // Reiniciar plataformas a sus posiciones originales
    platforms = [
        { x: 0, y: 350, width: 1000, height: 18, type: 'normal' },
        { x: 50, y: 140, width: 260, height: 16, type: 'ice' },
        { x: 380, y: 230, width: 260, height: 16, type: 'trampoline' },
        { x: 720, y: 120, width: 260, height: 16, type: 'ice' },
        { x: 1050, y: 210, width: 280, height: 16, type: 'trampoline' }
    ];

    updateUI();
}

function ensureNoPlatformCollision(item) {
    // Evitar que los items caigan dentro de plataformas al reaparecer
    platforms.forEach(p => {
        if (item.x + item.width > p.x && item.x < p.x + p.width) {
            if (p.y > 100) {
                item.y = p.y - item.height - 15;
            } else {
                item.y = p.y + p.height + 15;
            }
        }
    });
}

function updateUI() {
    currentModuleEl.textContent = moduleIndex + 1;
    livesEl.textContent = "❤️".repeat(lives);
    xpEl.textContent = xp;
}

// --- BUCLE PRINCIPAL ---
function loop() {
    if (gameState !== "PLAYING") return;
    update();
    draw();
    requestAnimationFrame(loop);
}

// --- ACTUALIZACIÓN ---
function update() {
    animTimer += 0.2;
    let currentSpeed = cat.speed;
    let friction = cat.isSliding ? 0.97 : 0.85;

    // Movimiento horizontal
    if (keys["ArrowLeft"] || keys["a"] || keys["A"]) {
        cat.vx = -currentSpeed;
        if (cat.x < 20) cat.x = 20;
    } else if (keys["ArrowRight"] || keys["d"] || keys["D"]) {
        cat.vx = currentSpeed;
        if (cat.x > 450) cat.x = 450;
    } else {
        cat.vx *= friction;
    }

    cat.x += cat.vx;
    cat.vy += cat.gravity;
    cat.y += cat.vy;

    // Detectar colisión con plataformas
    onGround = false;
    cat.isSliding = false;

    platforms.forEach(p => {
        if (
            cat.x + cat.width > p.x &&
            cat.x < p.x + p.width &&
            cat.y + cat.height >= p.y &&
            cat.y + cat.height <= p.y + 16 &&
            cat.vy > 0
        ) {
            cat.y = p.y - cat.height;
            cat.vy = 0;
            onGround = true;

            if (p.type === 'ice') {
                cat.isSliding = true;
            } else if (p.type === 'trampoline') {
                cat.vy = cat.jumpStrength * 1.4;
                playSound(soundJump);
                onGround = false;
            }
        }
    });

    // Caída al vacío
    if (cat.y > canvas.height) {
        playSound(soundHit);
        lives--;
        updateUI();
        cat.x = 100;
        cat.y = 50;
        cat.vx = 0;
        cat.vy = 0;
        onGround = false;

        if (lives <= 0) {
            playSound(soundGameOver);
            gameState = "PAUSED";
            showGameAlert("💥 ¡Fin de la partida!", "Te has caído al vacío sin vidas. ¡Inténtalo de nuevo!", () => {
                resetGame();
                gameState = "PLAYING";
                loop();
            });
            return;
        }
    }

    let stageSpeed = (2.2 + (moduleIndex * 0.25)) * difficultyMultiplier;

    // Power-up
    powerUp.x -= stageSpeed;
    if (powerUp.x < -50) {
        powerUp.x = canvas.width + 900;
        powerUp.y = Math.random() * 200 + 50;
    }

    // Comida
    foods.forEach(f => {
        f.x -= stageSpeed;
        if (f.x < -50) {
            f.x = canvas.width + Math.random() * 350;
            f.y = Math.random() * 220 + 40;
            f.collected = false;
            ensureNoPlatformCollision(f);
        }

        if (!f.collected &&
            cat.x < f.x + f.width &&
            cat.x + cat.width > f.x &&
            cat.y < f.y + f.height &&
            cat.y + cat.height > f.y
        ) {
            playSound(soundPoint);
            xp += 35;
            f.collected = true;
            updateUI();
        }
    });

    // Trampas - CORREGIDO: ahora matan correctamente
    traps.forEach(t => {
        t.x -= stageSpeed;
        if (t.x < -40) {
            t.x = canvas.width + Math.random() * 400;
            t.y = Math.random() * 240 + 60;
        }

        // Detección de colisión con el gato
        if (
            cat.x < t.x + t.width &&
            cat.x + cat.width > t.x &&
            cat.y < t.y + t.height &&
            cat.y + cat.height > t.y
        ) {
            playSound(soundHit);
            lives--;
            // Mover la trampa fuera de la pantalla para que no golpee repetidamente
            t.x = canvas.width + 300;
            updateUI();
            
            if (lives <= 0) {
                playSound(soundGameOver);
                gameState = "PAUSED";
                showGameAlert("⚠️ ¡Impacto con trampa!", "Has tocado una mina espacial y te has quedado sin vidas.", () => {
                    resetGame();
                    gameState = "PLAYING";
                    loop();
                });
                return;
            }
        }
    });

    // Gato malo
    badCat.x -= stageSpeed * 1.1;
    badCat.y += badCat.vDir * (1 + moduleIndex * 0.1);
    if (badCat.y < 100 || badCat.y > 310) {
        badCat.vDir *= -1;
    }
    if (badCat.x < -50) {
        badCat.x = canvas.width + 500;
        badCat.y = Math.random() * 150 + 150;
    }

    // Mover plataformas - CORREGIDO: evitar superposición
    platforms.forEach(p => {
        p.x -= stageSpeed * 0.9;
        if (p.x + p.width < 0) {
            // Reaparecer a la derecha, pero verificar que no se superponga con otras
            let newX = canvas.width + Math.random() * 250;
            let newY = Math.random() * 220 + 80;
            // Asegurar que no se superponga con otras plataformas
            let overlap = true;
            let attempts = 0;
            while (overlap && attempts < 20) {
                overlap = false;
                for (let other of platforms) {
                    if (other === p) continue;
                    if (newX < other.x + other.width + 50 && newX + p.width > other.x - 50) {
                        if (Math.abs(newY - other.y) < 40) {
                            overlap = true;
                            break;
                        }
                    }
                }
                if (overlap) {
                    newX = canvas.width + Math.random() * 250;
                    newY = Math.random() * 220 + 80;
                    attempts++;
                }
            }
            p.x = newX;
            p.y = newY;
        }
    });

    // Colisión con power-up → quiz
    if (
        cat.x < powerUp.x + powerUp.width &&
        cat.x + cat.width > powerUp.x &&
        cat.y < powerUp.y + powerUp.height &&
        cat.y + cat.height > powerUp.y
    ) {
        playSound(soundPoint);
        gameState = "QUIZ";
        triggerQuiz();
    }

    // Colisión con gato malo
    if (
        cat.x < badCat.x + badCat.width &&
        cat.x + cat.width > badCat.x &&
        cat.y < badCat.y + badCat.height &&
        cat.y + cat.height > badCat.y
    ) {
        playSound(soundHit);
        lives--;
        badCat.x = canvas.width + 400;
        updateUI();

        if (lives <= 0) {
            playSound(soundGameOver);
            gameState = "PAUSED";
            showGameAlert("👾 ¡Atrapado!", "El Gato Malo te ha alcanzado y no te quedan vidas.", () => {
                resetGame();
                gameState = "PLAYING";
                loop();
            });
            return;
        }
    }
}

// --- DIBUJO (NYAN CAT ORIGINAL MEJORADO) ---
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fondo
    let grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#0b0033');
    grad.addColorStop(0.7, '#1a0b4a');
    grad.addColorStop(1, '#2a1a5a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Estrellas
    ctx.fillStyle = '#ffffff';
    stars.forEach(s => {
        ctx.globalAlpha = s.brightness;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Luna
    ctx.fillStyle = '#fffde7';
    ctx.shadowColor = '#ffffee';
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(780, 60, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#e6e0b3';
    ctx.beginPath();
    ctx.arc(770, 52, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(792, 70, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(785, 42, 3, 0, Math.PI * 2);
    ctx.fill();

    // Plataformas
    platforms.forEach(p => {
        ctx.shadowBlur = 0;
        if (p.type === 'ice') {
            let iceGrad = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.height);
            iceGrad.addColorStop(0, '#b3e5fc');
            iceGrad.addColorStop(1, '#4fc3f7');
            ctx.fillStyle = iceGrad;
            ctx.shadowColor = '#00e5ff';
            ctx.shadowBlur = 10;
            ctx.fillRect(p.x, p.y, p.width, p.height);
            ctx.shadowBlur = 0;
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.fillRect(p.x + 6, p.y + 3, p.width - 12, 3);
        } else if (p.type === 'trampoline') {
            let trampGrad = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.height);
            trampGrad.addColorStop(0, '#66bb6a');
            trampGrad.addColorStop(1, '#2e7d32');
            ctx.fillStyle = trampGrad;
            ctx.shadowColor = '#69f0ae';
            ctx.shadowBlur = 15;
            ctx.fillRect(p.x, p.y, p.width, p.height);
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#a5d6a7';
            for (let i = 0; i < p.width - 20; i += 18) {
                ctx.fillRect(p.x + 10 + i, p.y + 4, 8, 4);
            }
        } else {
            let platGrad = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.height);
            platGrad.addColorStop(0, '#e65100');
            platGrad.addColorStop(1, '#3e2723');
            ctx.fillStyle = platGrad;
            ctx.shadowColor = '#ff6d00';
            ctx.shadowBlur = 10;
            ctx.fillRect(p.x, p.y, p.width, p.height);
            ctx.shadowBlur = 0;
            ctx.strokeStyle = '#5d4037';
            ctx.lineWidth = 1;
            for (let i = 0; i < p.width; i += 30) {
                ctx.beginPath();
                ctx.moveTo(p.x + i, p.y);
                ctx.lineTo(p.x + i, p.y + p.height);
                ctx.stroke();
            }
            ctx.fillStyle = 'rgba(255,200,150,0.2)';
            ctx.fillRect(p.x + 4, p.y + 2, p.width - 8, 3);
        }
    });
    ctx.shadowBlur = 0;

    // ===== NYAN CAT ORIGINAL MEJORADO =====
    // CAMBIO 1: Eliminado floatOffset automático. Ahora el gato solo se mueve por física real.
    let renderY = cat.y;
    let cx = cat.x;

    // Cola arcoíris (más larga y con más ondulación, estilo original)
    let tailWave = Math.sin(animTimer * 2.5) * 6;
    const colaColors = ['#ff0000', '#ff7700', '#ffff00', '#00ff00', '#00f0ff', '#800080'];
    for (let i = 0; i < 6; i++) {
        ctx.fillStyle = colaColors[i];
        ctx.beginPath();
        ctx.moveTo(cx - 4, renderY + 2 + i * 4);
        ctx.quadraticCurveTo(cx - 28 + tailWave, renderY + i * 4, cx - 22 + tailWave * 1.3, renderY - 4 + i * 4);
        ctx.quadraticCurveTo(cx - 10 + tailWave * 0.9, renderY + 2 + i * 4, cx - 4, renderY + 6 + i * 4);
        ctx.fill();
    }

    // Cuerpo (Pop-Tart más grande y reconocible)
    ctx.fillStyle = '#f5cba7';
    ctx.shadowColor = '#ffb6c1';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.roundRect(cx, renderY, 52, 32, 8);
    ctx.fill();

    // Glaseado arcoíris del Pop-Tart
    const rainbowColors = ['#ff0000', '#ff7700', '#ffff00', '#00ff00', '#00f0ff', '#800080'];
    for (let i = 0; i < 6; i++) {
        ctx.fillStyle = rainbowColors[i];
        ctx.fillRect(cx + 4, renderY + 3 + i * 4.5, 44, 4);
    }

    // Brillo del glaseado
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillRect(cx + 6, renderY + 2, 40, 3);

    // Cabeza de gato (gris, más grande, estilo original)
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#ffb6c1';
    ctx.fillStyle = '#999999';
    ctx.beginPath();
    ctx.arc(cx + 38, renderY + 10, 16, 0, Math.PI * 2);
    ctx.fill();

    // Orejas (más puntiagudas, estilo gato)
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#999999';
    ctx.beginPath();
    ctx.moveTo(cx + 28, renderY - 4);
    ctx.lineTo(cx + 32, renderY - 14);
    ctx.lineTo(cx + 38, renderY - 4);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + 42, renderY - 4);
    ctx.lineTo(cx + 48, renderY - 14);
    ctx.lineTo(cx + 54, renderY - 4);
    ctx.fill();

    // Interior de orejas (rosa)
    ctx.fillStyle = '#ff8a80';
    ctx.beginPath();
    ctx.moveTo(cx + 30, renderY - 4);
    ctx.lineTo(cx + 32, renderY - 10);
    ctx.lineTo(cx + 35, renderY - 4);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + 45, renderY - 4);
    ctx.lineTo(cx + 48, renderY - 10);
    ctx.lineTo(cx + 51, renderY - 4);
    ctx.fill();

    // Ojos grandes estilo kawaii (blancos)
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(cx + 32, renderY + 8, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 46, renderY + 8, 6, 0, Math.PI * 2);
    ctx.fill();

    // Pupilas (azules oscuras, mirada al frente)
    ctx.fillStyle = '#1a237e';
    ctx.beginPath();
    ctx.arc(cx + 34, renderY + 9, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 48, renderY + 9, 3, 0, Math.PI * 2);
    ctx.fill();

    // Brillo en los ojos
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx + 35, renderY + 7, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 49, renderY + 7, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Mejillas rosadas (kawaii)
    ctx.fillStyle = 'rgba(255, 105, 180, 0.4)';
    ctx.beginPath();
    ctx.arc(cx + 26, renderY + 14, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 52, renderY + 14, 4, 0, Math.PI * 2);
    ctx.fill();

    // Nariz
    ctx.fillStyle = '#ff1744';
    ctx.beginPath();
    ctx.moveTo(cx + 38, renderY + 12);
    ctx.lineTo(cx + 41, renderY + 16);
    ctx.lineTo(cx + 35, renderY + 16);
    ctx.fill();

    // Boca (pequeña sonrisa)
    ctx.strokeStyle = '#4a148c';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(cx + 33, renderY + 18);
    ctx.quadraticCurveTo(cx + 38, renderY + 22, cx + 43, renderY + 18);
    ctx.stroke();

    // Bigotes
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 1;
    for (let side = -1; side <= 1; side += 2) {
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(cx + 38 + side * 6, renderY + 14 + i * 3);
            ctx.lineTo(cx + 38 + side * 18, renderY + 10 + i * 5);
            ctx.stroke();
        }
    }

    // Patas (más visibles, animadas al caminar/volar)
    let legOffset = Math.sin(animTimer * 2.5) * 4;
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#999999';
    ctx.fillRect(cx + 8, renderY + 28 + legOffset, 6, 8);
    ctx.fillRect(cx + 18, renderY + 28 - legOffset, 6, 8);
    ctx.fillRect(cx + 28, renderY + 28 + legOffset, 6, 8);
    ctx.fillRect(cx + 38, renderY + 28 - legOffset, 6, 8);

    // Power-Up estrella
    let starRot = animTimer * 0.15;
    ctx.save();
    ctx.translate(powerUp.x + powerUp.width/2, powerUp.y + powerUp.height/2);
    ctx.rotate(starRot);
    ctx.shadowColor = '#ffcc00';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
        let angle = (i * 4 * Math.PI / 5) - Math.PI/2;
        let radius = (i % 2 === 0) ? 16 : 7;
        let x = Math.cos(angle) * radius;
        let y = Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = '#ffd54f';
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff8e1';
    ctx.font = '12px monospace';
    ctx.fillText('⭐', -7, 5);
    ctx.restore();

    // Comida
    foods.forEach(f => {
        if (!f.collected) {
            let floatY = Math.sin(animTimer * 1.2 + f.x) * 3;
            ctx.shadowColor = '#ffab40';
            ctx.shadowBlur = 12;
            ctx.font = '26px monospace';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(f.type, f.x, f.y + 24 + floatY);
            ctx.shadowBlur = 0;
        }
    });

    // Trampas
    traps.forEach(t => {
        let pulse = 0.9 + 0.1 * Math.sin(animTimer * 0.8 + t.x);
        ctx.shadowColor = '#ff1744';
        ctx.shadowBlur = 15 * pulse;
        ctx.beginPath();
        ctx.arc(t.x + t.width/2, t.y + t.height/2, 11 * pulse, 0, Math.PI * 2);
        ctx.fillStyle = '#d50000';
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffab00';
        ctx.font = '14px monospace';
        ctx.fillText('☢', t.x + 2, t.y + 16);
    });

    // Gato malo
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#2c2c3e';
    ctx.fillRect(badCat.x, badCat.y + 6, badCat.width - 12, badCat.height - 8);
    ctx.fillStyle = '#3e3e5e';
    ctx.fillRect(badCat.x + 22, badCat.y + 2, 20, 20);
    ctx.fillStyle = '#2c2c3e';
    ctx.beginPath();
    ctx.moveTo(badCat.x + 22, badCat.y + 2);
    ctx.lineTo(badCat.x + 26, badCat.y - 8);
    ctx.lineTo(badCat.x + 30, badCat.y + 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(badCat.x + 34, badCat.y + 2);
    ctx.lineTo(badCat.x + 38, badCat.y - 8);
    ctx.lineTo(badCat.x + 42, badCat.y + 2);
    ctx.fill();
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 15;
    ctx.fillStyle = '#ff1744';
    ctx.beginPath();
    ctx.arc(badCat.x + 28, badCat.y + 10, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(badCat.x + 38, badCat.y + 10, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(badCat.x + 29, badCat.y + 10, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(badCat.x + 39, badCat.y + 10, 1.5, 0, Math.PI * 2);
    ctx.fill();
}

// --- QUIZ ---
function triggerQuiz() {
    const currentData = modulesData[moduleIndex];
    quizModuleTitle.textContent = currentData.title;
    quizQuestion.textContent = currentData.question;
    quizOptions.innerHTML = "";

    currentData.options.forEach((option) => {
        const btn = document.createElement("button");
        btn.className = "option-btn";
        btn.textContent = option.text;
        btn.onclick = () => checkAnswer(option.correct);
        quizOptions.appendChild(btn);
    });

    quizModal.classList.remove("hidden");
}

function checkAnswer(isCorrect) {
    quizModal.classList.add("hidden");

    if (isCorrect) {
        playSound(soundPoint);
        xp += 150;
        moduleIndex++;
        difficultyMultiplier += 0.15;
        powerUp.x = 1500;
        powerUp.y = Math.random() * 200 + 50;
        updateUI();

        if (moduleIndex >= modulesData.length) {
            gameState = "VICTORY";
            victoryScreen.classList.remove("hidden");
            return;
        }
    } else {
        playSound(soundHit);
        lives--;
        updateUI();

        if (lives <= 0) {
            playSound(soundGameOver);
            showGameAlert("💥 ¡Sin vidas!", "Te has quedado sin vidas. ¡Inténtalo de nuevo desde el módulo 1!", () => {
                resetGame();
            });
        } else {
            showGameAlert("❌ ¡Respuesta incorrecta!", "Has perdido una vida por responder mal. ¡Sigue intentando!");
        }
        powerUp.x = 1300;
    }

    gameState = "PLAYING";
    loop();
}