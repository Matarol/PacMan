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
    // cancelAnimationFrame(gameState.animationId)

    clearPortalTimers()

    canvas.classList.remove('space-background')

    //Tömmer alla globala arrays
    pellets.length = 0;
    powerUps.length = 0;
    boundaries.length = 0;
    ghosts.length = 0;
    if (villains) villains.length = 0;    

    gameState.currentLevel = 'CLASSIC'
    gameState.hasVisitedExtraLevel = false

    initClassicLevel({ pellets, powerUps, boundaries, ghosts, player })    

    startCountdown(GAME_MODES.CLASSIC)
    gameState.score = 0
    updateUI(gameState)

    setTimeout(() => triggerPortalTimer(boundaries), 10000);

    ghosts = [
        new Ghost({
            position: {
                x: 6 * Boundary.width + Boundary.width / 2,
                y: Boundary.height + Boundary.height / 2
            },
            velocity: {
                x: Ghost.speed,
                y: 0
            }
        }),

        new Ghost({
            position: {
                x: 6 * Boundary.width + Boundary.width / 2,
                y: 3 * Boundary.height + Boundary.height / 2
            },
            velocity: {
                x: Ghost.speed,
                y: 0
            },
            color: 'red'
        })        
    ]

    if (winCount > 1) {
        ghosts.push(
            new Ghost({
            position: {
                x: 6 * Boundary.width + Boundary.width / 2,
                y: 5 * Boundary.height + Boundary.height / 2
            },
            velocity: {
                x: Ghost.speed,
                y: 0
            },
            color: 'pink'
        })    
        )
    }

    player = new Player({
        position: {
            x: Boundary.width + Boundary.width / 2,
            y: Boundary.height + Boundary.height / 2
        },
        velocity: {
            x: 0,
            y: 0
        }
    })
}

async function animate(timestamp = performance.now()) {
    gameState.animationId = requestAnimationFrame(animate)
    
    if (!player) return

    let deltaTime = (timestamp - lastTime) / 1000; // Tid i sekunder sedan senaste frame
    lastTime = timestamp;

    activeEffects.forEach((effect, index) => {
        if (effect.opacity <= 0) {
            activeEffects.splice(index, 1)
        } else {
            effect.update()
        }
    })

    if (gameState.mode === GAME_MODES.COUNTDOWN) {
        renderLevel({
            c,
            canvas,
            player,
            ghosts,
            villains,
            pellets,
            powerUps,
            boundaries,
            activeEffects
        })

        c.save()
        c.font = '56px Arial'
        c.textAlign = 'center'
        c.textBaseline = 'middle'
        c.fillStyle = 'white'

        const centerX = logicalWidth / 2;
        const centerY = logicalHeight / 2;

        c.fillText(
            gameState.countdownValue > 0
                ? gameState.countdownValue
                : 'GO!',
            centerX,
            centerY
        )
        c.restore()

        return
    }

    if (!gameState.gameRunning) {
        renderLevel({
            c,
            canvas,
            player,
            ghosts,
            villains,
            pellets,
            powerUps,
            boundaries,
            activeEffects
        })
        return
    }

    if (isNaN(deltaTime) || deltaTime <= 0 || deltaTime > 0.033) {
        deltaTime = 1 / 60; 
    }

    // 1. Rendera effekter (poängtexter etc)
    activeEffects.forEach((effect, index) => {
        if (effect.opacity <= 0) {
            activeEffects.splice(index, 1)
        } else {
            effect.update()
        }
    })

    // 2. KÖR LOGIK BEROENDE AV FYSIKMODE
    switch (gameState.mode) {
        case GAME_MODES.CLASSIC: {
            const result = updateClassicMode({
                player,
                ghosts,
                currentDirection,
                nextDirection,
                boundaries,
                deltaTime
            })

            currentDirection = result.currentDirection
            nextDirection = result.nextDirection
            break
        }

        case GAME_MODES.SPACE:
            await updateSpaceMode({
                player,
                villains,
                boundaries,
                keys,
                gameState,
                pellets,
                scoreEl: document.getElementById('scoreEl'),
                activeEffects,
                showMenu,
                returnToMainMap,
                handleGameOver,
                deltaTime
            })
            break

        case GAME_MODES.PAUSED:
        case GAME_MODES.MENU:
        case GAME_MODES.GAME_OVER:
            return
    }

    // 3. KOLLISIONER & ITEMS (gemensamt för båda lägena)
    const collisionResult = resolvePlayerGhostCollision(player, ghosts)
    const itemResult = updateItems({ player, pellets: world.pellets, powerUps, ghosts, villains, scoreEl: document.getElementById('scoreEl'), returnToMainMap, damagePlayer, gameState })

    if (itemResult?.result === 'player_damaged') updateUI(gameState)

    if (collisionResult.result === 'player_dead' || gameState.health <= 0) {
        playSound('lose')
        handleGameOver(false)
        return
    }

    console.log("Når vi hit? Level:", gameState.currentLevel, "Mode:", gameState.mode, "Resumed:", gameState.justResumed);

    // Om vi precis stängt en meny, vänta en frame med att kolla vinst
    if (gameState.justResumed) {
        gameState.justResumed = false;
        return; 
    }

    if (gameState.currentLevel === 'CLASSIC' && checkWin(world)) {
        playSound('win')
        handleGameOver(true)
    }

    // 4. RITA BANAN OCH SKÖTA PORTALER
    const collidePortal = checkPortalCollision(player, boundaries);

    if (collidePortal) {        

        handlePortalEntry(world);

        return; 
        
    }
    

    // 🔥 NYTT: UPDATE ENTITIES
    // player.update(deltaTime)
    player.update(deltaTime)

    if (!player || !player.velocity) {
        console.error("PLAYER BROKEN", player)
    }

    if (villains) {
        villains.forEach((v, i) => {
            if (!v || !v.velocity) {
                console.error("BAD VILLAIN", i, v)
            }
        })
    }

        renderLevel({
        c,
        canvas,
        player,
        ghosts,
        villains,
        pellets,
        powerUps,
        boundaries,
        activeEffects
    });

} //end of animate

window.onload = async () => {
    const dimensions = await drawStaticMap({ canvas, c, classicLayout, Boundary, initClassicLevel })
    logicalWidth = dimensions.logicalWidth
    logicalHeight = dimensions.logicalHeight
    highScoreEl.innerText = localStorage.getItem('pacman-highscore') || 0
    showMenu('START', { startGame: init })
    animate(performance.now())
}

setupInput({
    setNextDirection: (dir) => { nextDirection = dir },
    isGameRunning: () => gameState.gameRunning,
    togglePause: togglePause,
    keys
})