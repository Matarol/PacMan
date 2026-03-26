import { showMenu } from './menu.js'
import { Player } from './player.js'
import { Ghost } from './ghost.js'
import { Villain } from './villain.js'
import { Boundary } from './boundary.js'
import { map, renderMap, portalImages } from './map.js'
import { circleCollidesWithRectangle } from './collision.js'
import { handlePlayerMovement, handleSpaceMovement } from './playerController.js'
import { updateGhosts } from './ghostController.js'
import { updateItems } from './itemsController.js'
import { resolvePlayerGhostCollision, checkWin } from './gameState.js'
import { setupInput } from './inputHandler.js'
import { mapExtra1, renderSpaceMap } from './map-extra-1.js'
import { updateVillain } from './villainController.js'

const canvas = document.getElementById('canvas1');
const c = canvas.getContext('2d');

const scoreEl = document.getElementById('scoreEl')
const streakScoreEl = document.getElementById('streakScoreEl')
const highScoreEl = document.getElementById('highScoreEl')

const mobileButtons = document.querySelectorAll('#mobileControls button')

let pellets = []
let powerUps = []
let boundaries = []
let ghosts = []
let player
let villain
let score = { value: 0 }
let streakScore = { value: 0 }
let highScore = { value: localStorage.getItem('pacman-highscore') || 0 }
let animationId
let gameRunning = true
let winCount = 0
let portalBoundary = null
let portalTimer
let portalClosingTimer

const keys = {
    w: { pressed: false },
    a: { pressed: false },
    s: { pressed: false },
    d: { pressed: false }
}

let currentDirection = null
let nextDirection = null

async function drawStaticMap() {
    const dpr = window.devicePixelRatio || 1;

    const logicalWidth = map[0].length * Boundary.width;
    const logicalHeight = map.length * Boundary.height;

    const scale = Math.min(window.innerWidth / logicalWidth, 1);

    // 👉 CSS size (what user sees)
    canvas.style.width = logicalWidth * scale + "px";
    canvas.style.height = logicalHeight * scale + "px";

    // 👉 Actual pixel size
    canvas.width = logicalWidth * dpr;
    canvas.height = logicalHeight * dpr;

    // 👉 CRITICAL: reset + apply BOTH scales
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.scale(dpr * scale, dpr * scale);

    boundaries.length = 0;
    pellets.length = 0;
    powerUps.length = 0;

    renderMap({c, pellets, powerUps, boundaries})

    const imagePromises = boundaries.map(b => b.image).filter(img => img instanceof HTMLImageElement).map(img => img.decode().catch(() => {}))

    await Promise.all(imagePromises)

    c.clearRect(0, 0, canvas.width, canvas.height)
    boundaries.forEach(boundary => boundary.draw())
    pellets.forEach(pellet => pellet.draw())
    powerUps.forEach(powerUp => powerUp.draw())
}

function openRandomPortal() {
    if (portalBoundary) {
        portalBoundary.isPortal = false
    }

    const candidates = boundaries.filter(b => b.type === 'block')

    if (candidates.length > 0) {
        const randomIndex = Math.floor(Math.random() * candidates.length)
        const selectedBoundary = candidates[randomIndex]

        selectedBoundary.isPortal = true
        portalBoundary = selectedBoundary

        console.log('En portal har öppnats')

        portalClosingTimer = setTimeout(() => {
            if (selectedBoundary === portalBoundary) {
                selectedBoundary.isPortal = false
                portalBoundary = null
                console.log('Portalen har stängts')
            }
        }, 5000)
    }
}

function startExtraLevel() {

    canvas.classList.add('space-background')

    gameRunning = false
    cancelAnimationFrame(animationId)

    boundaries.length = 0
    pellets.length = 0
    powerUps.length = 0
    ghosts.length = 0

    renderSpaceMap({c, pellets, boundaries, powerUps})

    player.physicsMode = 'SPACE'

    const pacmanStart = findStartPos(mapExtra1, 'p')
    const villainStart = findStartPos(mapExtra1, 'v')

    player.position.x = pacmanStart.x * Boundary.width + Boundary.width /2
    player.position.y = pacmanStart.y * Boundary.height + Boundary.height /2
    player.velocity.x = 0
    player.velocity.y = 0

    //placeholder för initiering av skurkPacman
    villain = new Villain({
        position: {
            x: villainStart.x * Boundary.width + Boundary.width /2,
            y: villainStart.y * Boundary.height + Boundary.height /2
        },
        velocity: { x: 0, y: 0},
        context: c
    })


    setTimeout(() => {
        gameRunning = true
        animate()
    }, 1000)
}

//Hjälpfunktion för att hitta startposition for PacMan och SkurkPacMan i mapExtra1-banan
function findStartPos(mapArray, symbol) {
    for (let i = 0; i < mapArray.length; i++) {
        for (let j = 0; j < mapArray[i].length; j++) {
            if (mapArray[i][j] === symbol) {
                return { x: j, y: i }
            }
        }
    }
    return { x: 5, y: 5 } //Fallback
}

function togglePause() {
    if (gameRunning) {
        gameRunning = false
        cancelAnimationFrame(animationId)

        showMenu('PAUSED', {
            startGame: init,
            resumeGame: togglePause,
            resetToMain: () => location.reload()
        })
    } else {
        gameRunning = true
        document.getElementById('ui-overlay').classList.add('hidden')
        animate()
    }
}

function triggerPortalTimer() {
    clearTimeout(portalTimer)

    if (gameRunning) {
        openRandomPortal()

        const nextTick = Math.random() * 10000 + 10000

        portalTimer = setTimeout(triggerPortalTimer, nextTick)
    }
}

async function init() {
    cancelAnimationFrame(animationId)

    clearTimeout(portalTimer)
    clearTimeout(portalClosingTimer)

    canvas.classList.remove('space-background')


    if (portalBoundary) {
        portalBoundary.isPortal = false
        portalBoundary = null
    }

    await drawStaticMap()

    gameRunning = true
    score.value = 0
    scoreEl.innerText = score.value
    streakScoreEl.innerText = streakScore.value
    highScoreEl.innerText = highScore.value

    setTimeout(triggerPortalTimer, 10000);

    ghosts = [
        new Ghost({
            position: {
                x: 6 * Boundary.width + Boundary.width / 2,
                y: Boundary.height + Boundary.height / 2
            },
            velocity: {
                x: Ghost.speed,
                y: 0
            },
            context: c
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
            color: 'red',
            context: c
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
            color: 'pink',
            context: c
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
        },
            context: c
    })
    animate()
}

function animate() {
    animationId = requestAnimationFrame(animate)
    c.clearRect(0, 0, canvas.width, canvas.height)

    if (player.physicsMode === 'SPACE' && villain) {
        handleSpaceMovement(player, keys, boundaries)
        updateVillain(villain, player, boundaries)
    } else {
        const result = handlePlayerMovement(player, currentDirection, nextDirection, boundaries)

        currentDirection = result.currentDirection
        nextDirection = result.nextDirection

    }

    const collisionResult = resolvePlayerGhostCollision(player, ghosts)

    if (collisionResult.result === 'player_dead') {
        cancelAnimationFrame(animationId)
        gameRunning = false

        const finalScore = streakScore.value + score.value

        if (finalScore > highScore.value) {
            highScore.value = finalScore
            localStorage.setItem('pacman-highscore', finalScore)
        }

        showMenu('GAMEOVER',
            { startGame: init },
            { won: false, score: finalScore }        
        )
        streakScore.value = 0
        winCount = 0
    }

    // Vilkor för vinst
    if (checkWin(pellets)) {
        cancelAnimationFrame(animationId)
        gameRunning = false

        showMenu('GAMEOVER',
            { startGame: init },
            { won: true, score: score.value }
        )
        streakScore.value += score.value
        winCount += 1
    }

    updateItems({player, pellets, powerUps, ghosts, score, scoreEl})
    
    boundaries.forEach((boundary) => {
        if (boundary.isPortal) {
            const frame = Math.floor(Date.now() / 150) % portalImages.length
            boundary.image = portalImages[frame]
        } else if (boundary.type === 'block') {
            boundary.image = boundary.originalImage
        }

        if (boundary.type === 'asteroid') {
            boundary.currentFrame = Math.floor(Date.now() / 100) % Boundary.totalFrames
        }

        boundary.draw()

        if (circleCollidesWithRectangle({ circle: player, rectangle: boundary })) {
            if (boundary.isPortal) {
                startExtraLevel()
            }
        }     
    })

    player.update()

    // Spelare krockar med spöke
    updateGhosts(ghosts, boundaries, player)

    if (player.physicsMode != 'SPACE') {    
        if (player.velocity.x > 0) player.rotation = 0
        else if (player.velocity.x < 0) player.rotation = Math.PI
        else if (player.velocity.y > 0) player.rotation = Math.PI / 2
        else if (player.velocity.y < 0) player.rotation = Math.PI * 1.5
    }
} //end of animate

window.onload = async () => {
    await drawStaticMap()
    highScoreEl.innerText = localStorage.getItem('pacman-highscore') || 0
    showMenu('START', { startGame: init })
}

setupInput({
    setNextDirection: (dir) => { nextDirection = dir },
    isGameRunning: () => gameRunning,
    togglePause: togglePause,
    keys
})