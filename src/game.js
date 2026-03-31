import { showMenu } from './menu.js'
import { Player } from './player.js'
import { Ghost } from './ghost.js'
import { Boundary } from './boundary.js'
import { Pellet } from './items.js'
import { classicLayout, renderClassicMap, portalImages } from './classicMap.js'
import { circleCollidesWithCircle, circleCollidesWithRectangle, getCircleRepulsion } from './collision.js'
import { handlePlayerMovement, handleSpaceMovement } from './playerController.js'
import { updateGhosts } from './ghostController.js'
import { updateItems } from './itemsController.js'
import { resolvePlayerGhostCollision, checkWin, gameState, damagePlayer } from './gameState.js'
import { setupInput } from './inputHandler.js'
import { updateVillain } from './villainController.js'
import { initSpaceLevel, handleVillainEaten } from './spaceLevel.js'

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
let villains = []
let winCount = 0
let portalBoundary = null
let portalTimer
let portalClosingTimer
let lastMainPosition = null
let lastGhostPositions = []
let lastPelletState = []
let activeEffects = [] // Array för att hålla reda på texterna

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

    const logicalWidth = classicLayout[0].length * Boundary.width;
    const logicalHeight = classicLayout.length * Boundary.height;

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

    renderClassicMap({c, pellets, powerUps, boundaries})

    const imagePromises = boundaries.map(b => b.image).filter(img => img instanceof HTMLImageElement).map(img => img.decode().catch(() => {}))

    await Promise.all(imagePromises)

    c.clearRect(0, 0, canvas.width, canvas.height)
    boundaries.forEach(boundary => boundary.draw())
    pellets.forEach(pellet => pellet.draw())
    powerUps.forEach(powerUp => powerUp.draw())
}

function updateHealthBar() {
    const bar = document.getElementById('healthBar')
    bar.style.width = gameState.health + '%'

    if (gameState.health < 30) {
        bar.style.background = 'red'
    } else {
        bar.style.background = 'lime'
    }
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

function returnToMainMap() {
    cancelAnimationFrame(gameState.animationId)

    boundaries.length = 0
    pellets.length = 0
    powerUps.length = 0

    renderClassicMap({ c, pellets, powerUps, boundaries })

    player.physicsMode = 'NORMAL'

    if (lastMainPosition) {
        player.position.x = lastMainPosition.x,
        player.position.y = lastMainPosition.y
    }

    player.velocity.x = 0
    player.velocity.y = 0

    ghosts.length = 0

    lastGhostPositions.forEach(data => {
        ghosts.push(new Ghost({
            position: {
                x: data.x,
                y: data.y
            },
            velocity: {
                x: data.velocity.x,
                y: data.velocity.y
            },
            color: data.color,
            context: c
        }))
    })

    pellets.length = 0

    lastPelletState.forEach(data => {
        pellets.push(new Pellet({
            position: {
                x: data.x,
                y: data.y
            },
            context: c,
            isDangerous: data.isDangerous
        }))
    })

    setTimeout(() => {
        animate()
    }, 100)
}



function togglePause() {
    if (gameState.gameRunning) {
        gameState.gameRunning = false
        cancelAnimationFrame(gameState.animationId)

        showMenu('PAUSED', {
            startGame: init,
            resumeGame: togglePause,
            resetToMain: () => location.reload()
        })
    } else {
        gameState.gameRunning = true
        document.getElementById('ui-overlay').classList.add('hidden')
        animate()
    }
}

function handleGameOver(isWin) {
    cancelAnimationFrame(gameState.animationId)
    gameState.gameRunning = false

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

function triggerPortalTimer() {
    if (gameState.hasVisitedExtraLevel) return
    clearTimeout(portalTimer)

    if (gameState.gameRunning) {
        openRandomPortal()

        const nextTick = Math.random() * 10000 + 10000

        portalTimer = setTimeout(triggerPortalTimer, nextTick)
    }
}

async function init() {
    cancelAnimationFrame(gameState.animationId)

    clearTimeout(portalTimer)
    clearTimeout(portalClosingTimer)

    canvas.classList.remove('space-background')

    gameState.hasVisitedExtraLevel = false


    if (portalBoundary) {
        portalBoundary.isPortal = false
        portalBoundary = null
    }

    await drawStaticMap()

    gameState.gameRunning = true
    gameState.score = 0
    scoreEl.innerText = gameState.score
    streakScoreEl.innerText = gameState.streakScore
    highScoreEl.innerText = gameState.highScore

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
    gameState.animationId = requestAnimationFrame(animate)
    c.clearRect(0, 0, canvas.width, canvas.height)

    // 1. Rendera effekter (poängtexter etc)
    activeEffects.forEach((effect, index) => {
        if (effect.opacity <= 0) {
            activeEffects.splice(index, 1)
        } else {
            effect.update()
            effect.draw(c)
        }
    })

    // 2. RYMDBANAN (Om vi är i rymden)
    if (player.physicsMode === 'SPACE' && villains) {
        handleSpaceMovement(player, keys, boundaries)

        boundaries.forEach(boundary => {
            if (boundary.type === 'asteroid') {
                const asteroid = {
                    position: {
                        x: boundary.position.x + boundary.width / 2,
                        y: boundary.position.y + boundary.height / 2
                    },
                    radius: 15
                }
                const pPush = getCircleRepulsion(player, asteroid)
                player.position.x += pPush.x
                player.position.y += pPush.y

                if (Math.hypot(pPush.x, pPush.y) > 0.4) {
                    damagePlayer(5, gameState)
                    updateHealthBar()
                }

                villains.forEach(v => {
                    const vPush = getCircleRepulsion(v, asteroid)
                    v.position.x += vPush.x
                    v.position.y += vPush.y
                })
            }
        })

        for (let i = villains.length - 1; i >= 0; i--) {
            const v = villains[i]
            updateVillain(v, player, boundaries)

            if (circleCollidesWithCircle(player, v)) {
                if (v.miniature) {
                    const savedVillain = { ...v }
                    villains.splice(i, 1)
                    // HÄR ANVÄNDER VI DEN NYA EXPORTERADE FUNKTIONEN
                    handleVillainEaten({
                        eatenVillain: savedVillain,
                        pellets, scoreEl, activeEffects, showMenu, gameState, returnToMainMap
                    })
                    return
                } else {
                    damagePlayer(15, gameState)
                    updateHealthBar()
                }
            }
        }

        if (gameState.health <= 0) {
            handleGameOver(false)
            return
        }
    } 
    // 3. VANLIGA BANAN
    else {
        const result = handlePlayerMovement(player, currentDirection, nextDirection, boundaries)
        currentDirection = result.currentDirection
        nextDirection = result.nextDirection
    }

    // 4. KOLLISIONER & ITEMS
    const collisionResult = resolvePlayerGhostCollision(player, ghosts)
    const itemResult = updateItems({player, pellets, powerUps, ghosts, villains, scoreEl, returnToMainMap, damagePlayer, gameState})

    if (itemResult?.result === 'player_damaged') updateHealthBar()

    if (collisionResult.result === 'player_dead' || gameState.health <= 0) {
        handleGameOver(false)
        return
    }

    if (checkWin(pellets) && player.physicsMode === 'NORMAL') {
        handleGameOver(true)
    }
    
    // 5. RITA BANAN OCH SKÖTA PORTALER
    boundaries.forEach((boundary) => {
        if (boundary.isPortal) {
            // Animera portal-bilden
            const frame = Math.floor(Date.now() / 150) % portalImages.length
            boundary.image = portalImages[frame]

            // KOLLA OM SPELAREN GÅR IN I PORTALEN
            if (player.physicsMode !== 'SPACE' && !gameState.hasVisitedExtraLevel) {
                if (circleCollidesWithRectangle({ circle: player, rectangle: boundary })) {
                    
                    gameState.hasVisitedExtraLevel = true

                    // Spara snapshot
                    lastMainPosition = { x: player.position.x, y: player.position.y }
                    lastGhostPositions = ghosts.map(ghost => ({
                        x: ghost.position.x, y: ghost.position.y,
                        velocity: { x: ghost.velocity.x, y: ghost.velocity.y },
                        color: ghost.color
                    }))
                    lastPelletState = pellets.map(p => ({
                        x: p.position.x, y: p.position.y, isDangerous: p.isDangerous
                    }))

                    // STARTA RYMDEN
                    villains = initSpaceLevel({
                        c, canvas, player, boundaries, pellets, powerUps, ghosts, keys, animate
                    })
                }
            }
        } else if (boundary.type === 'block') {
            boundary.image = boundary.originalImage
        }

        if (boundary.type === 'asteroid') {
            boundary.currentFrame = Math.floor(Date.now() / 100) % Boundary.totalFrames
        }

        boundary.draw()
    })

    player.update()
    updateGhosts(ghosts, boundaries, player)

    // Rotation för Pacman
    if (player.physicsMode !== 'SPACE') {    
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
    isGameRunning: () => gameState.gameRunning,
    togglePause: togglePause,
    keys
})