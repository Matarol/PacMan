import { GameEngine } from './core/gameEngine.js'
import { renderFrame } from './systems/renderSystem.js'
import { updateEffects } from './systems/effectSystem.js'
import { updateCollisions } from './systems/collisionSystem.js'
import { updateItemSystem } from './systems/itemSystem.js'
import { updatePortals } from './systems/portalSystem.js'
import { updateMovement } from './systems/movementSystem.js'
import { showMenu } from './menu.js'
import { classicLayout } from './classicMap.js'
import { initClassicLevel, classicConfig } from './classicLevel.js'
import { checkWin, gameState, GAME_MODES } from './gameState.js'
import { setupInput } from './inputHandler.js'
import { triggerPortalTimer, clearPortalTimers } from './portalManager.js'
import { updateUI, hideUIOverlay, drawStaticMap } from './uiManager.js'
import { renderLevel } from './renderLevel.js'
import { playSound } from './audioManager.js'
import { changeLevel } from './levelManager.js'
import { addEntity } from './utils/entityHelpers.js'
import { createPlayer } from './factories/playerFactory.js'
import { updatePlayer } from './systems/playerSystem.js'
import { TILE_SIZE } from './constants/gameConstants.js'

/**
 * @typedef {{
 * entities: any[],
 * gameState: any,
 * keys: any,
 * c: CanvasRenderingContext2D,
 * canvas: HTMLCanvasElement,
 * directionState: {
 *   currentDirection: string | null,
 *   nextDirection: string | null
 * },
 * actions: {
 *   damagePlayer: (amount: number) => any,
 *   returnToMainMap: () => void,
 *   handleGameOver: (isWin: boolean) => void,
 *   showMenu: (...args: any[]) => void
 * },
 * activeEffects: any[],
 * scoreEl: HTMLElement,
 * winCount: number
 * }} World
 */


const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById('canvas1'));

if (!canvas) {
    throw new Error('Canvas element not found');
}

const c = canvas.getContext('2d');

if (!c) {
    throw new Error('Could not get 2D context from canvas');
}

let player
let winCount = 0
let activeEffects = [] // Array för att hålla reda på texterna
let lastTime = performance.now()
let logicalWidth = classicLayout[0].length * TILE_SIZE;
let logicalHeight = classicLayout.length * TILE_SIZE;

const keys = {
    w: { pressed: false },
    a: { pressed: false },
    s: { pressed: false },
    d: { pressed: false }
}

// Samlar alla viktiga variabler i ett globalt "world"-objekt för enklare åtkomst i andra moduler
const world = {
    entities: [],
    gameState: gameState,
    keys: keys,
    c: c,
    canvas: canvas,

    directionState: {
        currentDirection: null,
        nextDirection: null
    },

    actions: {
        damagePlayer: (amount) => {
            const now = Date.now()
            const { gameState } = world;

            // Cooldown på att ta skada
            if (now - gameState.lastDamageTime < 800) {
                return { result: 'damage_ignored' }
            }

            world.gameState.health -= amount;
            playSound('damage-by-villain')
            gameState.lastDamageTime = now;

            if (world.gameState.health <= 0) {
                gameState.health = 0
                playSound('lose')
                world.actions.handleGameOver(false);
                return { result: 'player_dead' }
            }
            return { result: 'damaged' }
        },
        returnToMainMap: () => returnToMainMap(),
        handleGameOver: (isWin) => handleGameOver(isWin),
        showMenu: (...args) => showMenu(...args)
    },

    get activeEffects() { return activeEffects },
    get scoreEl() { return document.getElementById('scoreEl') },
    get winCount() { return winCount }    
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
    const currentHighScore = Number(gameState.highScore) || 0

    if (!isWin && finalScore > currentHighScore) {
        gameState.highScore = String(finalScore)
        localStorage.setItem('pacman-highscore', gameState.highScore)
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
    world.entities.length = 0; // Rensa den generella entities-arrayen också

    //Skapa SPELAREN OCH SPÖKENA HÄR (Innan initClassicLevel)
    player = createPlayer({
        position: { x: TILE_SIZE * 1.5, y: TILE_SIZE * 1.5 },
        velocity: { x: 0, y: 0 }
    })

    addEntity(world, player);

    initClassicLevel(world)

    setTimeout(() => triggerPortalTimer(world), 10000);
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
    const movementState = await updateMovement(world, deltaTime)
    
    if (movementState.shouldInterruptFrame) {
        return;
    }

    // 3. KOLLISIONER & ITEMS (gemensamt för båda lägena)
    const collisionState = await updateCollisions(world)
    const itemState = updateItemSystem(world)
    
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

    if (portalState.shouldInterruptFrame) {
        return;
    }

    // 🔥 NYTT: UPDATE ENTITIES
    // updatePlayer(world, deltaTime)

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
    const dimensions = await drawStaticMap({ canvas, c, classicLayout, initClassicLevel })
    logicalWidth = dimensions.logicalWidth
    logicalHeight = dimensions.logicalHeight

    const highScoreEl = document.getElementById('highScoreEl')
    if (highScoreEl) {
        highScoreEl.innerText = localStorage.getItem('pacman-highscore') || '0'
    }
    showMenu('START', { startGame: () => engine.start() })
}

setupInput({
    setNextDirection: (dir) => { world.directionState.nextDirection = dir },
    isGameRunning: () => world.gameState.gameRunning,
    togglePause,
    keys: world.keys
})