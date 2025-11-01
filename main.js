import * as THREE from 'three';

// Game state
let scene, camera, renderer;
let player, ground;
let obstacles = [];
let score = 0;
let gameRunning = false;
let gameStarted = false;
let obstacleSpeed = 0.1;
let spawnTimer = 0;
let spawnInterval = 100;

// Player movement
const keys = {};
const playerSpeed = 0.15;
const playerBounds = 5;

// Initialize Three.js scene
function init() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    scene.fog = new THREE.Fog(0x87CEEB, 10, 50);

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 8);
    camera.lookAt(0, 0, -10);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Ground
    const groundGeometry = new THREE.PlaneGeometry(15, 100);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x4CAF50 });
    ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.z = -40;
    ground.receiveShadow = true;
    scene.add(ground);

    // Player
    const playerGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const playerMaterial = new THREE.MeshLambertMaterial({ color: 0x2196F3 });
    player = new THREE.Mesh(playerGeometry, playerMaterial);
    player.position.set(0, 0.4, 0);
    player.castShadow = true;
    scene.add(player);

    // Event listeners
    window.addEventListener('resize', onWindowResize);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    document.getElementById('restartBtn').addEventListener('click', restartGame);

    // Start animation
    animate();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onKeyDown(event) {
    if (!gameStarted) {
        startGame();
    }
    keys[event.key.toLowerCase()] = true;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' ||
        event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault();
    }
}

function onKeyUp(event) {
    keys[event.key.toLowerCase()] = false;
}

function startGame() {
    if (!gameStarted) {
        gameStarted = true;
        gameRunning = true;
        document.getElementById('instructions').style.display = 'none';
        score = 0;
        updateScore();
    }
}

function restartGame() {
    // Reset game state
    gameRunning = true;
    gameStarted = true;
    score = 0;
    obstacleSpeed = 0.1;
    spawnTimer = 0;

    // Reset player position
    player.position.set(0, 0.4, 0);

    // Remove all obstacles
    obstacles.forEach(obstacle => scene.remove(obstacle));
    obstacles = [];

    // Update UI
    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('instructions').style.display = 'none';
    updateScore();
}

function createObstacle() {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshLambertMaterial({ color: 0xFF5252 });
    const obstacle = new THREE.Mesh(geometry, material);

    // Random position on x-axis
    obstacle.position.x = (Math.random() - 0.5) * 8;
    obstacle.position.y = 0.5;
    obstacle.position.z = -50;
    obstacle.castShadow = true;

    scene.add(obstacle);
    obstacles.push(obstacle);
}

function updatePlayer() {
    if (!gameRunning) return;

    // Horizontal movement
    if (keys['arrowleft'] || keys['a']) {
        player.position.x -= playerSpeed;
    }
    if (keys['arrowright'] || keys['d']) {
        player.position.x += playerSpeed;
    }

    // Keep player within bounds
    player.position.x = Math.max(-playerBounds, Math.min(playerBounds, player.position.x));

    // Rotation animation
    player.rotation.y += 0.02;
}

function updateObstacles() {
    if (!gameRunning) return;

    // Move obstacles towards player
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obstacle = obstacles[i];
        obstacle.position.z += obstacleSpeed;

        // Check collision
        const distance = player.position.distanceTo(obstacle.position);
        if (distance < 1) {
            gameOver();
            return;
        }

        // Remove obstacle if it passed the player
        if (obstacle.position.z > 5) {
            scene.remove(obstacle);
            obstacles.splice(i, 1);
            score += 10;
            updateScore();
        }
    }

    // Spawn new obstacles
    spawnTimer++;
    if (spawnTimer >= spawnInterval) {
        createObstacle();
        spawnTimer = 0;

        // Gradually increase difficulty
        if (score > 0 && score % 100 === 0) {
            obstacleSpeed += 0.01;
            spawnInterval = Math.max(50, spawnInterval - 2);
        }
    }
}

function updateScore() {
    document.getElementById('score').textContent = score;
}

function gameOver() {
    gameRunning = false;
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOver').style.display = 'block';
}

function animate() {
    requestAnimationFrame(animate);

    updatePlayer();
    updateObstacles();

    // Move ground for infinite effect
    if (gameRunning) {
        ground.position.z += obstacleSpeed;
        if (ground.position.z > 10) {
            ground.position.z = -40;
        }
    }

    renderer.render(scene, camera);
}

// Initialize the game
init();
