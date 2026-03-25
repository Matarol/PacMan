import { showMenu } from './menu.js'
import { Player } from './player.js'
import { Ghost } from './ghost.js'
import { Boundary } from './boundary.js'
import { map, renderMap } from './map.js'
import { circleCollidesWithRectangle } from './collision.js'
import { handlePlayerMovement } from './playerController.js'
import { updateGhosts } from './ghostController.js'
import { updateItems } from './itemsController.js'
import { resolvePlayerGhostCollision, checkWin } from './gameState.js'
import { setupInput } from './inputHandler.js'

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
let score = { value: 0 }
let streakScore = { value: 0 }
let highScore = { value: localStorage.getItem('pacman-highscore') || 0 }
let animationId
let gameRunning = true
let winCount = 0

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

async function init() {
    cancelAnimationFrame(animationId)

    await drawStaticMap()

    gameRunning = true
    score.value = 0
    scoreEl.innerText = score.value
    streakScoreEl.innerText = streakScore.value
    highScoreEl.innerText = highScore.value

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

    const result = handlePlayerMovement(player, currentDirection, nextDirection, boundaries)

    currentDirection = result.currentDirection
    nextDirection = result.nextDirection

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
        boundary.draw()

        if (circleCollidesWithRectangle({
            circle: player,
            rectangle: boundary
        })) {
            player.velocity.x = 0
            player.velocity.y = 0
        }     
    })

    player.update()

    // Spelare krockar med spöke
    updateGhosts(ghosts, boundaries, player)
    
    if (player.velocity.x > 0) player.rotation = 0
    else if (player.velocity.x < 0) player.rotation = Math.PI
    else if (player.velocity.y > 0) player.rotation = Math.PI / 2
    else if (player.velocity.y < 0) player.rotation = Math.PI * 1.5
} //end of animate

// addEventListener('keydown', ({key}) => {
//     switch (key) {
//         case 'ArrowUp': keys.w.pressed = true
//         nextDirection = 'w'
//         break
//         case 'ArrowLeft': keys.a.pressed = true
//         nextDirection = 'a'
//         break
//         case 'ArrowDown': keys.s.pressed = true
//         nextDirection = 's'
//         break
//         case 'ArrowRight': keys.d.pressed = true
//         nextDirection = 'd'
//         break
//     }
// })

// addEventListener('keyup', ({key}) => {
//     switch (key) {
//         case 'ArrowUp': keys.w.pressed = false
//         break
//         case 'ArrowLeft': keys.a.pressed = false
//         break
//         case 'ArrowDown': keys.s.pressed = false
//         break
//         case 'ArrowRight': keys.d.pressed = false
//         break
//     }
// })

// addEventListener('keydown', (e) => {
//     if (e.key === ' ' && !gameRunning) {
//         init();
//     }
// })

// mobileButtons.forEach(button => {
//     button.addEventListener('touchstart', (e) => {
//         e.preventDefault()
//         const key = button.getAttribute('data-key')
//         keys[key].pressed = true
//         nextDirection = key
//     })

//     button.addEventListener('touchend', (e) => {
//         const key = button.getAttribute('data-key')
//         keys[key].pressed = false
//     })

//     button.addEventListener('mousedown', (e) => {
//         const key = button.getAttribute('data-key')
//         keys[key].pressed = true
//         nextDirection = key
//     })

//     button.addEventListener('mouseup', (e) => {
//         const key = button.getAttribute('data-key')
//         keys[key].pressed = false
//     })
// })

window.onload = () => {
    drawStaticMap()
    highScoreEl.innerText = localStorage.getItem('pacman-highscore') || 0
    showMenu('START', { startGame: init })
}

setupInput({
    setNextDirection: (dir) => { nextDirection = dir },
    isGameRunning: () => gameRunning
});