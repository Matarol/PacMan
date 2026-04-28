import { GameEngine } from './core/gameEngine.js'
import { renderCountdown, renderFrame } from './systems/renderSystem.js'
import { updateEffects } from './systems/effectSystem.js'
import { updateCollisions } from './systems/collisionSystem.js'
import { updateItemSystem } from './systems/itemSystem.js'
import { updatePortals } from './systems/portalSystem.js'
import { updateMovement } from './systems/movementSystem.js'
import { showMenu } from './menu.js'
import { Player } from './player.js'
import { Ghost } from './ghost.js'
import { Boundary } from './boundary.js'
import { Pellet } from './items.js'
import { classicLayout } from './classicMap.js'
import { initClassicLevel, classicConfig } from './classicLevel.js'
import { updateItems } from './itemsController.js'
import { resolvePlayerGhostCollision, checkWin, gameState, damagePlayer, GAME_MODES } from './gameState.js'
import { setupInput } from './inputHandler.js'
import { initSpaceLevel, spaceConfig } from './spaceLevel.js'
import { handlePortalEntry, triggerPortalTimer, clearPortalTimers, checkPortalCollision } from './portalManager.js'
import { updateUI, hideUIOverlay, drawStaticMap } from './uiManager.js'
import { updateClassicMode, updateSpaceMode } from './gameLoopController.js'
import { renderLevel } from './renderLevel.js'
import { playSound } from './audioManager.js'
import { levelState, saveCurrentLevelState, changeLevel } from './levelManager.js'

const canvas = document.getElementById('canvas1');
const c = canvas.getContext('2d');

let pellets = []
let powerUps = []
let boundaries = []
let ghosts = []
let player
let villains = []
let winCount = 0
let activeEffects = [] // Array för att hålla reda på texterna
let lastTime = performance.now()
let logicalWidth = classicLayout[0].length * Boundary.width;
let logicalHeight = classicLayout.length * Boundary.height;

const keys = {
    w: { pressed: false },
    a: { pressed: false },
    s: { pressed: false },
    d: { pressed: false }
}

let currentDirection = null
let nextDirection = null

// Samlar alla viktiga variabler i ett globalt "world"-objekt för enklare åtkomst i andra moduler
const world = {
    get pellets() { return pellets },
    get powerUps() { return powerUps },
    get boundaries() { return boundaries },
    get ghosts() { return ghosts },
    get villains() { return villains },
    get player() { return player },
    set player(value) { player = value },
    get activeEffects() { return activeEffects },
    get scoreEl() { return document.getElementById('scoreEl') },
    get winCount() { return winCount },
    gameState: gameState,
    keys: keys,
    c: c,
    canvas: canvas
}

function startCountdown(nextMode) {
    gameState.mode = GAME_MODES.COUNTDOWN
    gameState.gameRunning = false
    gameState.countdownValue = 3
    gameState.nextModeAfterCountdown = nextMode

    const countdownInterval = setInterval(() => {
        gameState.countdownValue--

        if (gameState.countdownValue <= 0) {
            clearInterval(countdownInterval)

            gameState.mode = nextMode
            gameState.gameRunning = true
        }
    }, 1000)
}

function returnToMainMap() {
    activeEffects.length = 0;
    
    changeLevel(classicConfig, world);

    startCountdown(GAME_MODES.CLASSIC);
}

function togglePause() {
    if (gameState.mode === GAME_MODES.PAUSED) {
        hideUIOverlay()

        const resumeMode =
            player.physicsMode === 'SPACE'
                ? GAME_MODES.SPACE
                : GAME_MODES.CLASSIC

        startCountdown(resumeMode)

    } else {
        gameState.mode = GAME_MODES.PAUSED
        gameState.gameRunning = false

        showMenu('PAUSED', {
            startGame: init,
            resumeGame: togglePause,
            resetToMain: () => location.reload()
        })
    }
}

function handleGameOver(isWin) {
    gameState.gameRunning = false
    gameState.mode = GAME_MODES.GAME_OVER

    const finalScore = gameState.streakScore + gameState.score

    if (!isWin && finalScore > gameState.highScore) {
        gameState.highScore = finalScore
        localStorage.setItem('pacman-highscore', finalScore)
    }

    showMenu('GAMEOVER',
        { startGame: init },
        { won: isWin, score: isWin ? gameState.score : finalScore }
    )

    if (isWin) {
        gameState.streakScore += gameState.score
        winCount += 1
    } else {
        gameState.streakScore = 0
        winCount = 0
    }
    //Nollställ hälsa inför nästa runda
    gameState.health = 100
}

async function init() {

    clearPortalTimers()
    canvas.classList.remove('space-background')

    //Återställ gameState
    gameState.currentLevel = 'CLASSIC'
    gameState.hasVisitedExtraLevel = false
    gameState.score = 0
    gameState.health = 100
    updateUI(gameState)

    //Rensa och förbered listor
    pellets.length = 0;
    powerUps.length = 0;
    boundaries.length = 0;
    ghosts.length = 0;
    if (villains) villains.length = 0;

    //Skapa SPELAREN OCH SPÖKENA HÄR (Innan initClassicLevel)
    player = new Player({
        position: { x: Boundary.width * 1.5, y: Boundary.height * 1.5 },
        velocity: { x: 0, y: 0 }
    })

    initClassicLevel(world)    

    setTimeout(() => triggerPortalTimer(boundaries), 10000);
    lastTime = performance.now()
    startCountdown(GAME_MODES.CLASSIC)
}

async function updateFrame(deltaTime) {
    
    if (!player) return

    if (gameState.mode === GAME_MODES.COUNTDOWN) {
        return
    }

    updateEffects(world)
    
    if (!gameState.gameRunning) {
        return
    }

    if (isNaN(deltaTime) || deltaTime <= 0 || deltaTime > 0.033) {
        deltaTime = 1 / 60; 
    }

    // 2. KÖR LOGIK BEROENDE AV FYSIKMODE
    const movementState = await updateMovement(
        world,
        gameState,
        deltaTime,
        {
            currentDirection,
            nextDirection
        },
        {
            returnToMainMap,
            handleGameOver,
            showMenu
        }
    );

    currentDirection = movementState.currentDirection;
    nextDirection = movementState.nextDirection;

    if (movementState.shouldInterruptFrame) {
        return;
    }

    // 3. KOLLISIONER & ITEMS (gemensamt för båda lägena)
    const collisionState = updateCollisions(world)
    const itemState = updateItemSystem(world, { returnToMainMap, damagePlayer })
    // const itemResult = updateItems(world, { returnToMainMap, damagePlayer })
    

    // if (itemResult?.result === 'player_damaged') updateUI(gameState)
    if (collisionState.tookDamage || itemState.shouldUpdateUI) {
        updateUI(gameState);
    }

    if (collisionState.shouldGameOver) {
        playSound('lose')
        handleGameOver(false)
        return
    }

    // Om vi precis stängt en meny, vänta en frame med att kolla vinst
    if (gameState.justResumed) {
        gameState.justResumed = false;
        renderLevel(world)
        return; 
    }

    if (gameState.currentLevel === 'CLASSIC' && checkWin(world)) {
        playSound('win')
        handleGameOver(true)
    }

    // 4. RITA BANAN OCH SKÖTA PORTALER
    const portalState = updatePortals(world);

    if (portalState.shouldInteruptFrame) {
        return;
    }

    // 🔥 NYTT: UPDATE ENTITIES
    // player.update(deltaTime)
    player.update(deltaTime)

    if (!player || !player.velocity) {
        console.error("PLAYER BROKEN", player)
    }

    if (world.villains) {
        world.villains.forEach((v, i) => {
            if (!v || !v.velocity) {
                console.error("BAD VILLAIN", i, v)
            }
        })
    }

} //end of updateFrame

const engine = new GameEngine({
    canvas,
    c,
    world,
    gameState,
    systems: {
        init,
        update: updateFrame,
        render: () => renderFrame(world)
    }
});

window.onload = async () => {
    const dimensions = await drawStaticMap({ canvas, c, classicLayout, Boundary, initClassicLevel })
    logicalWidth = dimensions.logicalWidth
    logicalHeight = dimensions.logicalHeight
    highScoreEl.innerText = localStorage.getItem('pacman-highscore') || 0
    showMenu('START', { startGame: () => engine.start() })
    // updateFrame(performance.now())
}

setupInput({
    setNextDirection: (dir) => { nextDirection = dir },
    isGameRunning: () => gameState.gameRunning,
    togglePause: togglePause,
    keys
})