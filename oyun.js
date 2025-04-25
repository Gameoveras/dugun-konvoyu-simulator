// Oyun değişkenleri
let car; // Lider araba
let cars = []; // Konvoydaki tüm arabalar
let houses = []; // Evler
let spawnInterval = 150; // Yeni ev oluşturma aralığı (frame cinsinden)
let score = 0; // Oyuncunun skoru
let gameOver = false; // Oyun bitti mi?
let startTime; // Oyunun başlangıç zamanı
let gameTime = 60; // Oyun süresi (saniye)
let remainingTime; // Kalan süre
let decorations = []; // Dekoratif öğeler
let obstacles = []; // Engeller
let isPaused = false; // Oyun duraklatıldı mı?
let level = 1; // Mevcut seviye
let powerups = []; // Güçlendiriciler
let highScore = 0; // En yüksek skor
let gameCanvas; // Oyun tuvali
let gameMode = "normal"; // Oyun modu: normal, crazy, night, zombie, rainbow, boss
let achievements = []; // Başarılar

// Ses dosyaları
let backgroundMusic;
let hornSound;
let pointSound;
let powerupSound;
let gameOverSound;
let cheerSound;
let crashSound;
let buttonSound;
let musicVolume = 0.5; // Müzik ses seviyesi
let sfxVolume = 0.7; // Efekt ses seviyesi

// Özel Araç Renkleri ve Stillleri
const carColors = [
    { body: [200, 0, 0], roof: [180, 0, 0], windows: [200, 200, 255] },
    { body: [0, 0, 200], roof: [0, 0, 150], windows: [200, 200, 255] },
    { body: [0, 150, 0], roof: [0, 100, 0], windows: [200, 255, 200] },
    { body: [200, 100, 0], roof: [150, 75, 0], windows: [255, 255, 200] },
    { body: [200, 0, 200], roof: [150, 0, 150], windows: [255, 200, 255] }
];

// Ev Stilleri
const houseStyles = [
    { base: [220, 180, 150], roof: [160, 82, 45], door: [139, 69, 19] },
    { base: [200, 200, 200], roof: [100, 100, 100], door: [50, 50, 50] },
    { base: [255, 222, 173], roof: [205, 133, 63], door: [160, 82, 45] },
    { base: [176, 224, 230], roof: [70, 130, 180], door: [25, 25, 112] },
    { base: [255, 182, 193], roof: [219, 112, 147], door: [139, 0, 139] }
];

// Ses dosyalarını yüklemek için yardımcı fonksiyon
function loadSound(url) {
    let sound = new Audio(url);
    sound.preload = 'auto';
    return {
        play: () => sound.play().catch(e => console.log("Ses oynatma hatası:", e)),
        stop: () => sound.pause(),
        setVolume: (vol) => sound.volume = vol,
        loop: () => sound.loop = true,
        isPlaying: () => !sound.paused
    };
}

// Ses dosyalarını önceden yükle
function preload() {
    const musicURLs = [
        "https://cdn.pixabay.com/audio/2021/12/13/audio_c9296b8273.mp3",
        "https://cdn.pixabay.com/audio/2023/02/21/audio_8d9f949c00.mp3",
        "https://cdn.pixabay.com/audio/2022/08/23/audio_dee9da5b28.mp3"
    ];
    
    const hornURLs = [
        "https://cdn.pixabay.com/audio/2021/08/09/audio_51bc2a7219.mp3",
        "https://cdn.pixabay.com/audio/2022/03/10/audio_9af91afb96.mp3",
        "https://cdn.pixabay.com/audio/2022/10/23/audio_200b31f124.mp3"
    ];
    
    const selectedMusicURL = random(musicURLs);
    const selectedHornURL = random(hornURLs);
    
    backgroundMusic = loadSound(selectedMusicURL);
    hornSound = loadSound(selectedHornURL);
    pointSound = loadSound("https://cdn.pixabay.com/audio/2021/08/04/audio_12b0c7443c.mp3");
    powerupSound = loadSound("https://cdn.pixabay.com/audio/2022/03/15/audio_d3eda8546a.mp3");
    gameOverSound = loadSound("https://cdn.pixabay.com/audio/2021/08/04/audio_f7930408b7.mp3");
    cheerSound = loadSound("https://cdn.pixabay.com/audio/2021/08/04/audio_4518157718.mp3");
    crashSound = loadSound("https://cdn.pixabay.com/audio/2022/11/17/audio_dec84246cc.mp3");
    buttonSound = loadSound("https://cdn.pixabay.com/audio/2021/08/04/audio_62b5269cbc.mp3");
}

// Oyun başlangıç ayarları
function setup() {
    gameCanvas = createCanvas(800, 500);
    gameCanvas.parent('gameContainer');
    
    createConvoy(5);
    
    document.getElementById('splashScreen').style.display = 'flex';
    
    document.getElementById('musicVolume').addEventListener('change', function() {
        musicVolume = this.value;
        if (backgroundMusic) backgroundMusic.setVolume(musicVolume);
    });
    
    document.getElementById('sfxVolume').addEventListener('change', function() {
        sfxVolume = this.value;
    });
    
    document.getElementById('honkBtn').addEventListener('click', function() {
        buttonSound.play();
        if (car) car.honk();
    });
    
    document.getElementById('pauseBtn').addEventListener('click', function() {
        buttonSound.play();
        togglePause();
    });
    
    document.getElementById('upBtn').addEventListener('click', function() {
        buttonSound.play();
        if (car) car.moveUp();
    });
    
    document.getElementById('downBtn').addEventListener('click', function() {
        buttonSound.play();
        if (car) car.moveDown();
    });
    
    document.getElementById('resetBtn').addEventListener('click', function() {
        buttonSound.play();
        resetGame();
    });
    
    document.getElementById('modeBtn').addEventListener('click', function() {
        buttonSound.play();
        cycleGameMode();
    });
    
    document.getElementById('startButton').addEventListener('click', function() {
        buttonSound.play();
        document.getElementById('splashScreen').style.display = 'none';
        initializeGame();
    });
    
    const modeButtons = document.querySelectorAll('.modeBtn');
    modeButtons.forEach(button => {
        button.addEventListener('click', function() {
            buttonSound.play();
            modeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            gameMode = button.dataset.mode;
        });
    });
    
    prepareGame();
}

// Oyunu hazırlama fonksiyonu
function prepareGame() {
    houses = [];
    obstacles = [];
    powerups = [];
    decorations = [];
    score = 0;
    level = 1;
    gameOver = false;
    textFont('Arial');
    textSize(20);
    
    createDecorations();
}

// Oyunu başlatma fonksiyonu
function initializeGame() {
    startTime = millis();
    configureGameMode();
    
    for (let i = 0; i < 3; i++) {
        houses.push(new House(width + i * 250));
    }
    
    if (backgroundMusic) {
        backgroundMusic.setVolume(musicVolume);
        backgroundMusic.loop();
    }
}

// Oyun moduna göre ayarları yapılandırma
function configureGameMode() {
    switch (gameMode) {
        case "crazy":
            gameTime = 45;
            spawnInterval = 100;
            break;
        case "night":
            gameTime = 75;
            break;
        case "zombie":
            gameTime = 60;
            spawnInterval = 120;
            break;
        case "rainbow":
            gameTime = 60;
            spawnInterval = 150;
            break;
        case "boss":
            gameTime = 90;
            spawnInterval = 200;
            break;
        default:
            gameTime = 60;
            spawnInterval = 150;
    }
}

// Oyun modları arasında geçiş yapma
function cycleGameMode() {
    const modes = ["normal", "crazy", "night", "zombie", "rainbow", "boss"];
    const currentIndex = modes.indexOf(gameMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    gameMode = modes[nextIndex];
    
    configureGameMode();
    resetGame();
    
    showAchievement(`Mod Değişti: ${gameMode.toUpperCase()}`, 2000);
}

// Dekorasyon oluşturma
function createDecorations() {
    decorations = [];
    
    if (gameMode === "night") {
        for (let i = 0; i < 50; i++) {
            decorations.push({
                type: "star",
                x: random(width),
                y: random(height / 2),
                size: random(1, 3),
                twinkle: random(0, 100),
                speed: random(0.1, 0.3)
            });
        }
        
        decorations.push({
            type: "moon",
            x: width * 0.8,
            y: height * 0.2,
            size: 60,
            speed: 0.2
        });
    } else {
        for (let i = 0; i < 10; i++) {
            decorations.push({
                type: random() > 0.5 ? "tree" : "cloud",
                x: random(width),
                y: random() > 0.5 ? random(50, 150) : height * 0.65 - random(30, 60),
                size: random(30, 60),
                speed: random(0.5, 1.5)
            });
        }
        
        if (gameMode === "crazy") {
            for (let i = 0; i < 5; i++) {
                decorations.push({
                    type: "balloon",
                    x: random(width),
                    y: random(height / 3),
                    size: random(20, 40),
                    speed: random(0.8, 2),
                    color: [random(100, 255), random(100, 255), random(100, 255)]
                });
            }
        }
    }
}

// Ana oyun döngüsü
function draw() {
    if (isPaused) {
        drawPauseScreen();
        return;
    }
    
    remainingTime = gameTime - floor((millis() - startTime) / 1000);
    
    if (remainingTime <= 0 && !gameOver) {
        gameOver = true;
        if (score > highScore) {
            highScore = score;
            showAchievement("🏆 Yeni Yüksek Skor: " + highScore, 3000);
        }
        
        if (backgroundMusic && backgroundMusic.isPlaying()) {
            backgroundMusic.stop();
        }
        if (gameOverSound) {
            gameOverSound.setVolume(sfxVolume);
            gameOverSound.play();
        }
    }
    
    if (gameOver) {
        drawGameOver();
        return;
    }
    
    drawBackground();
    updateAndDrawDecorations();
    drawRoad();
    
    // Tüm arabaları güncelle ve çiz
    for (let i = 0; i < cars.length; i++) {
        let leader = i === 0 ? null : cars[i - 1];
        cars[i].update(leader);
        cars[i].draw();
    }
    
    // Korna efekti ile insanları selamla
    if (car.horn.isActive) {
        for (let h of houses) {
            let d = dist(car.x + car.w / 2, car.y + car.h / 2, h.x + h.w / 2, h.y + h.h / 2);
            if (d < car.horn.maxRadius && h.hasPerson && !h.person.waved) {
                h.person.waved = true;
                h.person.waveTimer = 0;
                let points = 10;
                if (car.hasPowerup('multiplier')) {
                    points *= 3;
                }
                score += points;
                car.waveCount++;
                if (pointSound) {
                    pointSound.setVolume(sfxVolume);
                    pointSound.play();
                }
                h.showPointsAnimation(points);
            }
        }
    }
    
    // Yeni ev oluştur
    if (frameCount % spawnInterval === 0) {
        houses.push(new House());
    }
    
    // Evleri güncelle ve çiz
    for (let i = houses.length - 1; i >= 0; i--) {
        let h = houses[i];
        h.update();
        h.draw();
        if (h.isOffScreen()) {
            houses.splice(i, 1);
        }
    }
    
    // Engelleri güncelle ve çiz
    if (frameCount % (gameMode === "crazy" ? 200 : 300) === 0) {
        obstacles.push(new Obstacle());
    }
    
    for (let i = obstacles.length - 1; i >= 0; i--) {
        let o = obstacles[i];
        o.update();
        o.draw();
        
        if (car.checkCollision(o) && !car.hasPowerup('shield')) {
            score = max(0, score - 5);
            if (crashSound) {
                crashSound.setVolume(sfxVolume);
                crashSound.play();
            }
            obstacles.splice(i, 1);
        }
        
        if (o.isOffScreen()) {
            obstacles.splice(i, 1);
        }
    }
    
    // Güçlendiricileri güncelle ve çiz
    if (frameCount % (gameMode === "crazy" ? 400 : 500) === 0 && random() < 0.7) {
        powerups.push(new Powerup());
    }
    
    for (let i = powerups.length - 1; i >= 0; i--) {
        let p = powerups[i];
        p.update();
        p.draw();
        
        if (car.checkCollision(p)) {
            if (powerupSound) {
                powerupSound.setVolume(sfxVolume);
                powerupSound.play();
            }
            p.activate();
            powerups.splice(i, 1);
        }
        
        if (p.isOffScreen()) {
            powerups.splice(i, 1);
        }
    }
    
    drawUI();
    
    if (score > level * 100) {
        levelUp();
    }
    
    checkAchievements();
}

// Arka plan çizimi
function drawBackground() {
    if (gameMode === "night") {
        background(20, 24, 82);
    } else if (gameMode === "crazy") {
        background(255, 182, 193);
    } else if (gameMode === "zombie") {
        background(20, 0, 0);
    } else if (gameMode === "rainbow") {
        background(
            sin(frameCount * 0.01) * 127 + 128,
            sin(frameCount * 0.01 + 2) * 127 + 128,
            sin(frameCount * 0.01 + 4) * 127 + 128
        );
    } else if (gameMode === "boss") {
        background(40, 40, 40);
    } else {
        background(135, 206, 235);
    }
}

// Dekorasyonları güncelle ve çiz
function updateAndDrawDecorations() {
    for (let i = 0; i < decorations.length; i++) {
        let d = decorations[i];
        d.x -= d.speed;
        
        if (d.x < -d.size) {
            d.x = width + d.size;
            switch (d.type) {
                case "cloud": d.y = random(50, 150); break;
                case "tree": d.y = height * 0.65 - random(30, 60); break;
                case "star": d.y = random(height / 2); d.twinkle = random(0, 100); break;
                case "balloon": d.y = random(height / 3); d.color = [random(100, 255), random(100, 255), random(100, 255)]; break;
                case "zombie": d.y = random(height * 0.5, height * 0.7); break;
                case "boss": d.y = random(height * 0.3, height * 0.6); break;
            }
        }
        
        switch (d.type) {
            case "tree": drawTree(d.x, d.y, d.size); break;
            case "cloud": drawCloud(d.x, d.y, d.size); break;
            case "star": drawStar(d.x, d.y, d.size, d.twinkle); break;
            case "moon": drawMoon(d.x, d.y, d.size); break;
            case "balloon": drawBalloon(d.x, d.y, d.size, d.color); break;
            case "zombie": drawZombie(d.x, d.y, d.size); break;
            case "boss": drawBoss(d.x, d.y, d.size); break;
        }
    }
}

function drawTree(x, y, size) {
    fill(101, 67, 33);
    rect(x - size / 8, y, size / 4, size);
    fill(34, 139, 34);
    ellipse(x, y - size / 2, size, size);
}

function drawCloud(x, y, size) {
    fill(255);
    noStroke();
    ellipse(x, y, size, size / 1.5);
    ellipse(x - size / 3, y, size / 2, size / 3);
    ellipse(x + size / 3, y, size / 2, size / 3);
}

function drawStar(x, y, size, twinkle) {
    let brightness = map(sin(frameCount * 0.05 + twinkle), -1, 1, 150, 255);
    fill(brightness, brightness, 200);
    noStroke();
    ellipse(x, y, size);
}

function drawMoon(x, y, size) {
    fill(255, 255, 230);
    noStroke();
    ellipse(x, y, size);
    fill(220, 220, 200);
    ellipse(x - size / 4, y - size / 5, size / 5);
    ellipse(x + size / 6, y + size / 6, size / 8);
    ellipse(x + size / 3, y - size / 7, size / 10);
}

function drawBalloon(x, y, size, balloonColor) {
    fill(balloonColor);
    noStroke();
    ellipse(x, y, size, size * 1.2);
    stroke(200);
    strokeWeight(1);
    line(x, y + size * 0.6, x, y + size * 1.2);
    noStroke();
}

function drawZombie(x, y, size) {
    if (gameMode === "zombie") {
        fill(0, 150, 0);
        ellipse(x, y, size, size * 1.2);
        fill(0, 100, 0);
        ellipse(x, y - size * 0.3, size * 0.8, size * 0.8);
        fill(255, 0, 0);
        ellipse(x - size * 0.2, y - size * 0.3, size * 0.2, size * 0.2);
        ellipse(x + size * 0.2, y - size * 0.3, size * 0.2, size * 0.2);
    }
}

function drawBoss(x, y, size) {
    if (gameMode === "boss" && level % 5 === 0) {
        fill(255, 0, 0);
        ellipse(x, y, size * 2, size * 2);
        fill(255);
        textSize(size * 0.5);
        textAlign(CENTER, CENTER);
        text("BOSS", x, y);
    }
}

// Yol çizimi
function drawRoad() {
    fill(80);
    noStroke();
    rect(0, height * 0.75, width, height * 0.25);
    
    stroke(255);
    strokeWeight(4);
    for (let x = (frameCount * 2) % 40; x < width; x += 40) {
        line(x, height * 0.875, x + 20, height * 0.875);
    }
    
    if (gameMode !== "night") {
        fill(139, 69, 19);
        rect(0, height * 0.74, width, 10);
    } else {
        fill(255, 140, 0, 150);
        rect(0, height * 0.74, width, 5);
        for (let x = (frameCount * 3) % 100; x < width; x += 100) {
            fill(255, 255, 0, 200);
            ellipse(x, height * 0.74, 10, 10);
        }
    }
}

// Kullanıcı arayüzü çizimi
function drawUI() {
    fill(0, 0, 0, 100);
    rect(0, 0, width, 50);
    
    fill(255);
    noStroke();
    textAlign(LEFT);
    text(`Skor: ${score}`, 20, 30);
    
    fill(remainingTime < 10 ? color(255, 0, 0) : 255);
    textAlign(RIGHT);
    text(`Süre: ${remainingTime}`, width - 20, 30);
    
    fill(255, 255, 0);
    textAlign(CENTER);
    text(`Seviye: ${level}`, width / 2, 30);
    
    textSize(14);
    fill(200, 200, 255);
    text(`Mod: ${gameMode.toUpperCase()}`, width / 2, 50);
    textSize(20);
    
    textAlign(LEFT);
    textSize(16);
    let statusX = 20;
    let statusY = 60;
    
    if (car.powerups.active) {
        fill(255, 255, 0);
        let powerupName = "";
        switch (car.powerups.active) {
            case "superHorn": powerupName = "Süper Korna"; break;
            case "turbo": powerupName = "Turbo Hız"; break;
            case "multiplier": powerupName = "3x Puan"; break;
            case "shield": powerupName = "Kalkan"; break;
        }
        text(`${powerupName}: ${Math.ceil(car.powerups.timer / 60)}s`, statusX, statusY);
    }
    
    textSize(20);
    textAlign(LEFT);
}

// Oyun bitti ekranı
function drawGameOver() {
    background(0, 0, 0, 200);
    
    fill(255, 50, 50);
    textSize(50);
    textAlign(CENTER, CENTER);
    text("OYUN BİTTİ", width / 2, height / 2 - 80);
    
    fill(255);
    textSize(30);
    text(`Skorun: ${score}`, width / 2, height / 2 - 20);
    
    if (score >= highScore) {
        fill(255, 215, 0);
        text("YENİ YÜKSEK SKOR!", width / 2, height / 2 + 20);
    } else {
        fill(200);
        text(`En Yüksek Skor: ${highScore}`, width / 2, height / 2 + 20);
    }
    
    textSize(20);
    fill(200, 200, 255);
    text(`Seviye: ${level} | Selamlanan: ${car.waveCount} | Mod: ${gameMode.toUpperCase()}`, width / 2, height / 2 + 60);
    
    fill(255);
    textSize(24);
    text("Tekrar oynamak için ENTER'a basın", width / 2, height / 2 + 110);
    
    fill(255, 165, 0);
    rect(width / 2 - 100, height / 2 + 150, 200, 50, 10);
    fill(0);
    textSize(20);
    text("YENİDEN OYNA", width / 2, height / 2 + 175);
    
    textAlign(LEFT, BASELINE);
    textSize(20);
}

// Duraklatma ekranı
function drawPauseScreen() {
    fill(0, 0, 0, 150);
    rect(0, 0, width, height);
    
    fill(255);
    textSize(40);
    textAlign(CENTER, CENTER);
    text("OYUN DURAKLATILDI", width / 2, height / 2 - 40);
    
    textSize(24);
    text("Devam etmek için P tuşuna basın", width / 2, height / 2 + 10);
    
    textSize(18);
    fill(200, 200, 255);
    text(`Skor: ${score} | Seviye: ${level} | Kalan Süre: ${remainingTime}`, width / 2, height / 2 + 60);
    
    textAlign(LEFT, BASELINE);
    textSize(20);
}

// Tuş girişlerini işleme
function keyPressed(event) {
    if (keyCode === 32) {
        event.preventDefault();
        if (!gameOver && !isPaused) car.honk();
        return false;
    }
    
    if (keyCode === UP_ARROW) {
        if (!gameOver && !isPaused) car.moveUp();
    } else if (keyCode === DOWN_ARROW) {
        if (!gameOver && !isPaused) car.moveDown();
    }
    
    if (keyCode === 80) {
        togglePause();
    }
    
    if (keyCode === ENTER && gameOver) {
        resetGame();
    }
    
    return false;
}

// Oyunu duraklatma/devam ettirme
function togglePause() {
    isPaused = !isPaused;
    if (!isPaused) {
        startTime = millis() - (gameTime - remainingTime) * 1000;
    }
}

// Oyunu sıfırlama
function resetGame() {
    createConvoy(5);
    houses = [];
    obstacles = [];
    powerups = [];
    score = 0;
    gameOver = false;
    startTime = millis();
    level = 1;
    spawnInterval = gameMode === "crazy" ? 100 : 150;
    
    for (let i = 0; i < 3; i++) {
        houses.push(new House(width + i * 250));
    }
    
    if (backgroundMusic && !backgroundMusic.isPlaying()) {
        backgroundMusic.setVolume(musicVolume);
        backgroundMusic.loop();
    }
}

// Seviye yükseltme
function levelUp() {
    level++;
    spawnInterval = gameMode === "crazy" ? max(60, spawnInterval - 10) : max(80, spawnInterval - 20);
    
    if (cheerSound) {
        cheerSound.setVolume(sfxVolume);
        cheerSound.play();
    }
    
    showAchievement("SEVİYE " + level + "!", 1500);
}

// Başarı bildirimi gösterme
function showAchievement(message, duration = 2000) {
    const achievementDiv = document.getElementById('achievement');
    achievementDiv.textContent = message;
    achievementDiv.style.display = 'block';
    
    setTimeout(() => {
        achievementDiv.style.display = 'none';
    }, duration);
}

// Başarıları kontrol etme
function checkAchievements() {
    if (score >= 300 && !achievements.includes("master")) {
        achievements.push("master");
        showAchievement("🏆 Başarı: Korna Ustası!", 3000);
    }
    
    if (car.waveCount >= 30 && !achievements.includes("friendly")) {
        achievements.push("friendly");
        showAchievement("🎭 Başarı: Arkadaş Canlısı!", 3000);
    }
    
    if (level >= 5 && !achievements.includes("highLevel")) {
        achievements.push("highLevel");
        showAchievement("🌟 Başarı: Konvoy Liderliği!", 3000);
    }

    if (car.waveCount >= 100 && !achievements.includes("convoyMaster")) {
        achievements.push("convoyMaster");
        showAchievement("👑 Başarı: Konvoy Ustası!", 3000);
    }

    if (score >= 500 && !achievements.includes("speedDemon")) {
        achievements.push("speedDemon");
        showAchievement("⚡ Başarı: Hız Canavarı!", 3000);
    }

    if (level >= 5 && !car.hasCollided && !achievements.includes("protector")) {
        achievements.push("protector");
        showAchievement("🛡️ Başarı: Koruyucu!", 3000);
    }

    if (car.powerups.collectedPoints >= 100 && !achievements.includes("magnetMaster")) {
        achievements.push("magnetMaster");
        showAchievement("🧲 Başarı: Mıknatıs Ustası!", 3000);
    }
    
    if (score >= 1000 && !achievements.includes("scoreKing")) {
        achievements.push("scoreKing");
        showAchievement("👑 Başarı: Puan Kralı!", 3000);
    }
    
    if (car.powerups.scoreMultiplier >= 3 && !achievements.includes("multiplierMaster")) {
        achievements.push("multiplierMaster");
        showAchievement("✨ Başarı: Çarpan Ustası!", 3000);
    }
}

// Konvoy oluşturma
function createConvoy(numCars) {
    cars = [];
    for (let i = 0; i < numCars; i++) {
        let isLeader = i === 0;
        cars.push(new Car(i, isLeader));
    }
    car = cars[0]; // Lider araba
}

// Araba sınıfı
class Car {
    constructor(positionInConvoy, isLeader) {
        this.positionInConvoy = positionInConvoy;
        this.isLeader = isLeader;
        this.waveCount = 0;
        this.baseSpeed = 2;
        this.currentSpeed = this.baseSpeed;
        this.w = 80;
        this.h = 40;
        this.offsetY = 0;
        
        this.x = width * 0.1 - this.positionInConvoy * 65;
        this.y = height * 0.75 - 30;
        this.maxY = height * 0.5;
        this.minY = height * 0.75 - 30;
        
        this.colorProfile = this.isLeader ? 
            { body: [255, 215, 0], roof: [200, 175, 0], windows: [255, 255, 200] } : 
            random(carColors);
        this.decorations = this.generateDecorations();
        this.trailParticles = [];
        this.wheelRotation = 0;
        
        this.horn = {
            isActive: false,
            radius: 0,
            maxRadius: 150,
            waveCount: 0
        };
        
        this.powerups = {
            active: null,
            timer: 0,
            effects: {
                superHorn: { rangeMultiplier: 2.0, duration: 450 },
                turbo: { multiplier: 1.5, duration: 600 },
                multiplier: { duration: 600 },
                shield: { active: false, duration: 300 },
                timeFreeze: { duration: 300 },
                magnet: { active: false, duration: 450, range: 300, scoreMultiplier: 2 },
                clone: { active: false, duration: 600 }
            },
            scoreMultiplier: 1,
            collectedPoints: 0
        };
        
        this.collisionBox = {
            x: this.x + 10,
            y: this.y + 5,
            w: this.w - 20,
            h: this.h - 10
        };
    }
    
    generateDecorations() {
        const decorations = [];
        if (gameMode !== 'night') {
            const types = ['flag', 'flower', 'ribbon'];
            for (let i = 0; i < (this.isLeader ? 8 : 4); i++) {
                decorations.push({
                    type: random(types),
                    position: createVector(random(this.w), random(-10, 5)),
                    color: color(random(200, 255), random(50, 200), random(50, 200)),
                    swing: random(0, TWO_PI)
                });
            }
        }
        return decorations;
    }
    
    update(leader) {
        if (this.isLeader) {
            this.y = constrain(this.y, this.maxY, this.minY);
            this.currentSpeed = this.baseSpeed * this.getSpeedMultiplier();
        } else if (leader) {
            this.followLeader(leader);
        }
        
        this.offsetY = sin(frameCount * 0.1 + this.positionInConvoy) * 3;
        this.updateHornEffect();
        this.updatePowerups();
        this.updatePhysics();
        this.updateTrails();
        if (this.hasPowerup('magnet')) {
            this.attractPowerups();
            this.attractPoints();
        }
    }
    
    followLeader(leader) {
        const followDistance = 60;
        const targetX = leader.x - followDistance;
        const targetY = leader.y + this.offsetY;
        
        this.x += (targetX - this.x) * 0.08;
        this.y += (targetY - this.y) * 0.08;
        
        if (dist(this.x, this.y, targetX, targetY) < 40) {
            this.currentSpeed = leader.currentSpeed * 0.9;
        } else {
            this.currentSpeed = leader.currentSpeed;
        }
    }
    
    updatePhysics() {
        this.collisionBox.x = this.x + 10;
        this.collisionBox.y = this.y + 5;
        this.wheelRotation += this.currentSpeed * 0.1;
    }
    
    updateTrails() {
        if (this.hasPowerup('turbo')) {
            this.trailParticles.push({
                pos: createVector(this.x + random(this.w), this.y + this.h - 5),
                life: 1.0,
                size: random(5, 10)
            });
        }
        
        this.trailParticles = this.trailParticles.filter(p => {
            p.life -= 0.03;
            return p.life > 0;
        });
    }
    
    updateHornEffect() {
        if (this.horn.isActive) {
            this.horn.radius += this.horn.maxRadius / 20;
            this.horn.waveCount++;
            if (this.horn.radius >= this.horn.maxRadius) {
                this.horn.isActive = false;
                this.horn.radius = 0;
            }
        }
    }
    
    updatePowerups() {
        if (this.powerups.active) {
            this.powerups.timer--;
            if (this.powerups.timer <= 0) {
                this.deactivatePowerup();
            }
        }
    }
    
    draw() {
        this.drawBody();
        this.drawWindows();
        this.drawWheels();
        this.drawDecorations();
        this.drawHornEffect();
        this.drawTrails();
        if (this.powerups.effects.shield.active) this.drawShield();
        if (this.hasPowerup('magnet')) {
            this.drawMagnetEffect();
        }
    }
    
    drawBody() {
        fill(this.colorProfile.body);
        rect(this.x, this.y, this.w, this.h, 10);
        fill(this.colorProfile.roof);
        rect(this.x + this.w * 0.15, this.y - 15, this.w * 0.7, 20, 5, 5, 0, 0);
        
        if (this.isLeader) {
            fill(255, 215, 0);
            rect(this.x + this.w * 0.3, this.y - 25, this.w * 0.4, 10, 5);
        }
    }
    
    drawWindows() {
        fill(this.colorProfile.windows);
        rect(this.x + 10, this.y + 10, this.w - 20, this.h - 20, 5);
    }
    
    drawWheels() {
        const wheelY = this.y + this.h - 10;
        const wheelSize = 22;
        const rimSize = 10;
        
        fill(40);
        for (let i = 0; i < 2; i++) {
            const wheelX = i === 0 ? this.x + 20 : this.x + this.w - 20;
            push();
            translate(wheelX, wheelY);
            rotate(this.wheelRotation);
            ellipse(0, 0, wheelSize, wheelSize);
            fill(200);
            ellipse(0, 0, rimSize, rimSize);
            pop();
        }
    }
    
    drawDecorations() {
        this.decorations.forEach(dec => {
            fill(dec.color);
            const swingOffset = sin(dec.swing + frameCount * 0.1) * 5;
            switch (dec.type) {
                case 'flag':
                    triangle(
                        this.x + dec.position.x + swingOffset, this.y + dec.position.y,
                        this.x + dec.position.x + 15 + swingOffset, this.y + dec.position.y - 20,
                        this.x + dec.position.x + swingOffset, this.y + dec.position.y - 40
                    );
                    break;
                case 'flower':
                    ellipse(this.x + dec.position.x + swingOffset, this.y + dec.position.y, 12, 12);
                    break;
                case 'ribbon':
                    stroke(dec.color);
                    strokeWeight(2);
                    line(
                        this.x + dec.position.x + swingOffset, this.y + dec.position.y,
                        this.x + dec.position.x + swingOffset, this.y + dec.position.y - 30
                    );
                    noStroke();
                    break;
            }
        });
    }
    
    drawHornEffect() {
        if (this.horn.isActive) {
            fill(255, 255, 0, 150);
            ellipse(this.x + this.w / 2, this.y + this.h / 2, this.horn.radius);
        }
    }
    
    drawTrails() {
        this.trailParticles.forEach(p => {
            fill(255, 255, 0, p.life * 255);
            ellipse(p.pos.x, p.pos.y, p.size);
        });
    }
    
    drawShield() {
        fill(0, 0, 255, 100);
        ellipse(this.x + this.w / 2, this.y + this.h / 2, this.w * 1.5);
    }
    
    drawMagnetEffect() {
        // Mıknatıs alanı efekti
        noFill();
        stroke(255, 255, 0, 100);
        strokeWeight(2);
        ellipse(this.x + this.w / 2, this.y + this.h / 2, 
                this.powerups.effects.magnet.range * 2, 
                this.powerups.effects.magnet.range * 2);
        
        // Titreşim efekti
        for (let i = 0; i < 8; i++) {
            let angle = (frameCount * 0.1 + i * PI / 4) % TWO_PI;
            let x = this.x + this.w / 2 + cos(angle) * this.powerups.effects.magnet.range;
            let y = this.y + this.h / 2 + sin(angle) * this.powerups.effects.magnet.range;
            fill(255, 255, 0, 150);
            noStroke();
            ellipse(x, y, 5, 5);
        }
    }
    
    moveUp() {
        if (this.isLeader) {
            this.y -= 10;
            this.y = constrain(this.y, this.maxY, this.minY);
        }
    }
    
    moveDown() {
        if (this.isLeader) {
            this.y += 10;
            this.y = constrain(this.y, this.maxY, this.minY);
        }
    }
    
    honk() {
        this.horn.isActive = true;
        this.horn.radius = 0;
        this.horn.waveCount = 0;
        this.horn.maxRadius = this.hasPowerup('superHorn') ? 300 : 150;
        if (hornSound) {
            hornSound.setVolume(sfxVolume);
            hornSound.play();
        }
    }
    
    hasPowerup(type) {
        return this.powerups.active === type;
    }
    
    getSpeedMultiplier() {
        return this.hasPowerup('turbo') ? this.powerups.effects.turbo.multiplier : 1;
    }
    
    activatePowerup(type) {
        if (type === "super") type = "superHorn";
        this.powerups.active = type;
        this.powerups.timer = this.powerups.effects[type].duration;
        this.powerups.collectedPoints = 0;
        
        if (type === 'shield') {
            this.powerups.effects.shield.active = true;
        } else if (type === 'magnet') {
            this.powerups.effects.magnet.active = true;
            this.powerups.scoreMultiplier = this.powerups.effects.magnet.scoreMultiplier;
        }
    }
    
    deactivatePowerup() {
        this.powerups.active = null;
        this.powerups.timer = 0;
        this.powerups.effects.shield.active = false;
        this.powerups.effects.magnet.active = false;
        this.powerups.scoreMultiplier = 1;
    }
    
    checkCollision(other) {
        return (
            this.collisionBox.x < other.x + other.w &&
            this.collisionBox.x + this.collisionBox.w > other.x &&
            this.collisionBox.y < other.y + other.h &&
            this.collisionBox.y + this.collisionBox.h > other.y
        );
    }

    attractPowerups() {
        for (let i = 0; i < powerups.length; i++) {
            let p = powerups[i];
            let d = dist(this.x + this.w / 2, this.y + this.h / 2, p.x + p.w / 2, p.y + p.h / 2);
            if (d < this.powerups.effects.magnet.range) {
                let angle = atan2(this.y + this.h / 2 - p.y - p.h / 2, this.x + this.w / 2 - p.x - p.w / 2);
                let speed = map(d, 0, this.powerups.effects.magnet.range, 10, 2);
                p.x += cos(angle) * speed;
                p.y += sin(angle) * speed;
                
                // Mıknatıs efekti
                if (frameCount % 5 === 0) {
                    this.powerups.collectedPoints++;
                    if (this.powerups.collectedPoints % 10 === 0) {
                        score += this.powerups.effects.magnet.scoreMultiplier;
                        showAchievement("Mıknatıs Bonusu: +" + this.powerups.effects.magnet.scoreMultiplier, 1000);
                    }
                }
            }
        }
    }

    attractPoints() {
        // Puanları çekme efekti
        for (let i = houses.length - 1; i >= 0; i--) {
            let h = houses[i];
            if (h.pointsAnimation) {
                let d = dist(this.x + this.w / 2, this.y + this.h / 2, 
                           h.x + h.w / 2, h.pointsAnimation.y);
                if (d < this.powerups.effects.magnet.range) {
                    let angle = atan2(this.y + this.h / 2 - h.pointsAnimation.y, 
                                    this.x + this.w / 2 - h.x - h.w / 2);
                    let speed = map(d, 0, this.powerups.effects.magnet.range, 8, 1);
                    h.pointsAnimation.y += sin(angle) * speed;
                    h.pointsAnimation.x += cos(angle) * speed;
                }
            }
        }
    }
}

// Ev sınıfı
class House {
    constructor(customX) {
        this.w = 80;
        this.h = 80;
        this.x = customX || width + random(0, 200);
        this.y = height * 0.75 - this.h;
        
        let houseStyleIndex = floor(random(houseStyles.length));
        let style = houseStyles[houseStyleIndex];
        
        this.color = color(style.base);
        this.roofColor = color(style.roof);
        this.doorColor = color(style.door);
        
        this.windowSize = 30;
        this.windowX = this.w / 2 - this.windowSize / 2;
        this.windowY = this.h / 2 - this.windowSize / 2;
        
        this.hasPerson = random() < 0.7;
        if (this.hasPerson) {
            this.person = new Person(this);
        }
        
        this.speed = 2 + (level - 1) * 0.5;
        if (gameMode === "crazy") {
            this.speed *= 1.5;
        }
        
        this.pointsAnimation = null;
        this.type = floor(random(3));
        this.lightOn = gameMode === "night" && random() < 0.8;
    }
    
    update() {
        this.x -= this.speed;
        if (this.person) this.person.update();
        
        if (this.pointsAnimation) {
            this.pointsAnimation.timer--;
            this.pointsAnimation.y -= 1;
            if (this.pointsAnimation.timer <= 0) {
                this.pointsAnimation = null;
            }
        }
    }
    
    draw() {
        fill(this.color);
        stroke(0);
        strokeWeight(1);
        rect(this.x, this.y, this.w, this.h);
        
        switch (this.type) {
            case 0:
                fill(this.roofColor);
                triangle(this.x - 10, this.y, this.x + this.w / 2, this.y - 30, this.x + this.w + 10, this.y);
                break;
            case 1:
                fill(this.roofColor);
                rect(this.x - 5, this.y - 10, this.w + 10, 10);
                stroke(50);
                for (let i = 0; i < 5; i++) {
                    line(this.x + (i * 20), this.y - 10, this.x + (i * 20), this.y - 20);
                }
                noStroke();
                break;
            case 2:
                fill(this.roofColor);
                triangle(this.x - 10, this.y, this.x + this.w / 2, this.y - 25, this.x + this.w + 10, this.y);
                fill(200);
                rect(this.x - 5, this.y + this.h * 0.6, this.w + 10, 5);
                stroke(150);
                for (let i = 0; i < 6; i++) {
                    line(this.x + (i * 15) - 5, this.y + this.h * 0.6, this.x + (i * 15) - 5, this.y + this.h * 0.6 - 15);
                }
                line(this.x - 5, this.y + this.h * 0.6 - 15, this.x + this.w + 5, this.y + this.h * 0.6 - 15);
                noStroke();
                break;
        }
        
        if (this.lightOn) {
            fill(255, 255, 200, 200);
            rect(this.x + this.windowX - 2, this.y + this.windowY - 2, this.windowSize + 4, this.windowSize + 4);
        }
        
        fill(255);
        stroke(100);
        rect(this.x + this.windowX, this.y + this.windowY, this.windowSize, this.windowSize);
        line(this.x + this.windowX, this.y + this.windowY + this.windowSize / 2, 
             this.x + this.windowX + this.windowSize, this.y + this.windowY + this.windowSize / 2);
        line(this.x + this.windowX + this.windowSize / 2, this.y + this.windowY, 
             this.x + this.windowX + this.windowSize / 2, this.y + this.windowY + this.windowSize);
        noStroke();
        
        if (this.person) this.person.draw(this.x + this.windowX, this.y + this.windowY);
        
        fill(this.doorColor);
        rect(this.x + this.w / 2 - 10, this.y + this.h - 30, 20, 30);
        fill(0);
        ellipse(this.x + this.w / 2 + 5, this.y + this.h - 15, 3, 3);
        
        if (this.pointsAnimation) {
            fill(255, 255, 0);
            stroke(0);
            strokeWeight(2);
            textSize(16);
            text("+" + this.pointsAnimation.points, this.x + this.w / 2, this.pointsAnimation.y);
            noStroke();
            textSize(20);
        }
    }
    
    isOffScreen() {
        return this.x + this.w < 0;
    }
    
    showPointsAnimation(points) {
        this.pointsAnimation = {
            points: points,
            y: this.y,
            timer: 60
        };
    }
}

// Kişi sınıfı
class Person {
    constructor(house) {
        this.house = house;
        this.waved = false;
        this.waveTimer = 0;
        this.color = color(random(150, 255), random(150, 255), random(150, 255));
        this.skinTone = color(random(200, 255), random(190, 240), random(140, 220));
        this.hairColor = color(random(50, 150), random(30, 100), random(0, 50));
        this.emotion = "neutral";
    }
    
    update() {
        if (this.waved) {
            if (this.waveTimer < 30) {
                this.waveTimer++;
                this.emotion = "happy";
            }
        }
    }
    
    draw(wx, wy) {
        push();
        translate(wx + this.house.windowSize / 2, wy + this.house.windowSize / 2);
        
        fill(this.color);
        rect(-5, 0, 10, 15);
        
        fill(this.skinTone);
        ellipse(0, -8, 12, 12);
        
        fill(this.hairColor);
        arc(0, -8, 12, 12, PI, TWO_PI);
        
        fill(0);
        if (this.emotion === "happy") {
            arc(-2, -9, 3, 3, PI, TWO_PI);
            arc(2, -9, 3, 3, PI, TWO_PI);
        } else {
            ellipse(-2, -9, 2, 2);
            ellipse(2, -9, 2, 2);
        }
        
        if (this.waved) {
            stroke(0);
            noFill();
            arc(0, -6, 6, 4, 0, PI);
            noStroke();
        } else {
            stroke(0);
            line(-2, -6, 2, -6);
            noStroke();
        }
        
        stroke(this.skinTone);
        strokeWeight(3);
        if (this.waved && this.waveTimer < 30) {
            let angle = sin(this.waveTimer / 10 * PI) * PI / 4;
            line(-5, 5, -5 + 15 * cos(-PI / 4 + angle), 5 - 15 * sin(-PI / 4 + angle));
        } else {
            line(-5, 5, -15, 0);
        }
        line(5, 5, 15, 0);
        noStroke();
        
        pop();
    }
}

// Engel sınıfı
class Obstacle {
    constructor() {
        this.w = 40;
        this.h = 30;
        this.x = width + random(50, 150);
        this.y = height * 0.75 - this.h;
        this.type = floor(random(3));
        this.speed = 3 + (level - 1) * 0.3;
        if (gameMode === "crazy") {
            this.speed *= 1.5;
        }
    }
    
    update() {
        this.x -= this.speed;
    }
    
    draw() {
        switch (this.type) {
            case 0:
                fill(100, 100, 100);
                noStroke();
                ellipse(this.x + this.w / 2, this.y + this.h / 2, this.w, this.h);
                fill(80);
                ellipse(this.x + this.w / 3, this.y + this.h / 3, this.w / 4, this.h / 4);
                fill(120);
                ellipse(this.x + this.w * 2 / 3, this.y + this.h * 2 / 3, this.w / 3, this.h / 3);
                break;
            case 1:
                fill(255, 140, 0);
                noStroke();
                triangle(this.x + this.w / 2, this.y, this.x, this.y + this.h, this.x + this.w, this.y + this.h);
                fill(255);
                rect(this.x + this.w / 4, this.y + this.h / 3, this.w / 2, this.h / 6);
                rect(this.x + this.w / 3, this.y + this.h * 2 / 3, this.w / 3, this.h / 8);
                break;
            case 2:
                fill(40, 40, 40, 150);
                ellipse(this.x + this.w / 2, this.y + this.h / 2 + 10, this.w * 1.2, this.h / 2);
                strokeWeight(2);
                stroke(70);
                noFill();
                arc(this.x + this.w / 2 - 5, this.y + this.h / 2 + 8, this.w / 2, this.h / 4, PI, TWO_PI);
                arc(this.x + this.w / 2 + 5, this.y + this.h / 2 + 8, this.w / 3, this.h / 6, PI, TWO_PI);
                noStroke();
                break;
        }
    }
    
    isOffScreen() {
        return this.x + this.w < 0;
    }
}

// Güçlendirici sınıfı
class Powerup {
    constructor() {
        this.w = 25;
        this.h = 25;
        this.x = width + random(50, 150);
        this.y = height * 0.75 - random(40, 80);
        this.type = random(["superHorn", "turbo", "multiplier", "shield", "timeFreeze", "magnet", "clone", "extraTime"]);
        this.speed = 2 + (level - 1) * 0.2;
        if (gameMode === "crazy") {
            this.speed *= 1.4;
        }
        this.floatOffset = 0;
    }
    
    update() {
        this.x -= this.speed;
        this.floatOffset = sin(frameCount * 0.1) * 5;
    }
    
    draw() {
        fill(255, 255, 100, 150 + sin(frameCount * 0.2) * 50);
        noStroke();
        ellipse(this.x + this.w / 2, this.y + this.h / 2 + this.floatOffset, this.w * 1.5, this.h * 1.5);
        
        switch (this.type) {
            case "superHorn":
                fill(255, 215, 0);
                ellipse(this.x + this.w / 2, this.y + this.h / 2 + this.floatOffset, this.w, this.h);
                fill(0);
                textSize(16);
                textAlign(CENTER, CENTER);
                text("!", this.x + this.w / 2, this.y + this.h / 2 + this.floatOffset);
                break;
            case "turbo":
                fill(255, 100, 0);
                ellipse(this.x + this.w / 2, this.y + this.h / 2 + this.floatOffset, this.w, this.h);
                fill(255);
                triangle(
                    this.x + this.w / 2 - 5, this.y + this.h / 2 - 5 + this.floatOffset,
                    this.x + this.w / 2 - 5, this.y + this.h / 2 + 5 + this.floatOffset,
                    this.x + this.w / 2 + 5, this.y + this.h / 2 + this.floatOffset
                );
                break;
            case "multiplier":
                fill(138, 43, 226);
                ellipse(this.x + this.w / 2, this.y + this.h / 2 + this.floatOffset, this.w, this.h);
                fill(255);
                textSize(14);
                textAlign(CENTER, CENTER);
                text("3×", this.x + this.w / 2, this.y + this.h / 2 + this.floatOffset);
                break;
            case "shield":
                fill(0, 100, 255);
                ellipse(this.x + this.w / 2, this.y + this.h / 2 + this.floatOffset, this.w, this.h);
                fill(255);
                textSize(14);
                textAlign(CENTER, CENTER);
                text("🛡️", this.x + this.w / 2, this.y + this.h / 2 + this.floatOffset);
                break;
            case "timeFreeze":
                fill(0, 255, 255);
                ellipse(this.x + this.w / 2, this.y + this.h / 2 + this.floatOffset, this.w, this.h);
                fill(255);
                textSize(14);
                textAlign(CENTER, CENTER);
                text("⏱️", this.x + this.w / 2, this.y + this.h / 2 + this.floatOffset);
                break;
            case "magnet":
                fill(255, 0, 0);
                ellipse(this.x + this.w / 2, this.y + this.h / 2 + this.floatOffset, this.w, this.h);
                fill(255);
                textSize(14);
                textAlign(CENTER, CENTER);
                text("🧲", this.x + this.w / 2, this.y + this.h / 2 + this.floatOffset);
                break;
            case "clone":
                fill(0, 255, 0);
                ellipse(this.x + this.w / 2, this.y + this.h / 2 + this.floatOffset, this.w, this.h);
                fill(255);
                textSize(14);
                textAlign(CENTER, CENTER);
                text("👥", this.x + this.w / 2, this.y + this.h / 2 + this.floatOffset);
                break;
            case "extraTime":
                fill(255, 255, 0);
                ellipse(this.x + this.w / 2, this.y + this.h / 2 + this.floatOffset, this.w, this.h);
                fill(0);
                textSize(14);
                textAlign(CENTER, CENTER);
                text("+10s", this.x + this.w / 2, this.y + this.h / 2 + this.floatOffset);
                break;
        }
        
        textSize(20);
        textAlign(LEFT, BASELINE);
    }
    
    isOffScreen() {
        return this.x + this.w < 0;
    }
    
    activate() {
        if (this.type === "extraTime") {
            remainingTime += 10;
            showAchievement("+10 Saniye!", 2000);
        } else {
            car.activatePowerup(this.type);
            let powerupName = "";
            switch (this.type) {
                case "superHorn": powerupName = "Süper Korna"; break;
                case "turbo": powerupName = "Turbo Hız"; break;
                case "multiplier": powerupName = "3× Puan"; break;
                case "shield": powerupName = "Kalkan"; break;
                case "timeFreeze": powerupName = "Zaman Dondurma"; break;
                case "magnet": powerupName = "Mıknatıs"; break;
                case "clone": powerupName = "Klon"; break;
            }
            showAchievement("Güçlendirici: " + powerupName, 2000);
        }
    }
}