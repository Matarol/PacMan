import { Player } from './player.js'
import { Ghost } from './ghost.js'
import { Boundary } from './boundary.js'
import { Pellet } from './items.js'
import { PowerUp } from './items.js'
import { map, createImage } from './map.js'
import { circleCollidesWithRectangle } from './utils.js'

const canvas = document.getElementById('canvas1');
const c = canvas.getContext('2d');

const scoreEl = document.getElementById('scoreEl')
const gameUi = document.getElementById('gameUi')
const statusText = document.getElementById('statusText')

const mobileButtons = document.querySelectorAll('#mobileControls button')

let pellets = []
let powerUps = []
let boundaries = []
let ghosts = []
let player
let score = 0
let animationId
let gameRunning = true
let winCount = 0

const keys = {
    w: { pressed: false },
    a: { pressed: false },
    s: { pressed: false },
    d: { pressed: false }
}

let lastKey = ''

function init() {
    cancelAnimationFrame(animationId)

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

    gameUi.style.display = 'none';
    gameRunning = true;
    score = 0;
    scoreEl.innerText = score;

    boundaries.length = 0;
    pellets.length = 0;
    powerUps.length = 0;

    map.forEach((row, i) => {
        row.forEach((symbol, j) => {
            switch (symbol) {
                case '-': boundaries.push(new Boundary({
                    position: {
                        x: Boundary.width * j,
                        y: Boundary.height * i
                    },
                    image: createImage('../assets/img/pipeHorizontal.png'),
                    context: c
                }))
                break
                case '|': boundaries.push(new Boundary({
                    position: {
                        x: Boundary.width * j,
                        y: Boundary.height * i
                    },
                    image: createImage('../assets/img/pipeVertical.png'),
                    context: c
                }))
                break
                case '1': boundaries.push(new Boundary({
                    position: {
                        x: Boundary.width * j,
                        y: Boundary.height * i
                    },
                    image: createImage('../assets/img/pipeCorner1.png'),
                    context: c
                }))
                break
                case '2': boundaries.push(new Boundary({
                    position: {
                        x: Boundary.width * j,
                        y: Boundary.height * i
                    },
                    image: createImage('../assets/img/pipeCorner2.png'),
                    context: c
                }))
                break
                case '3': boundaries.push(new Boundary({
                    position: {
                        x: Boundary.width * j,
                        y: Boundary.height * i
                    },
                    image: createImage('../assets/img/pipeCorner3.png'),
                    context: c
                }))
                break
                case '4': boundaries.push(new Boundary({
                    position: {
                        x: Boundary.width * j,
                        y: Boundary.height * i
                    },
                    image: createImage('../assets/img/pipeCorner4.png'),
                    context: c
                }))
                break
                case 'b': boundaries.push(new Boundary({
                    position: {
                        x: Boundary.width * j,
                        y: Boundary.height * i
                    },
                    image: createImage('../assets/img/block.png'),
                    context: c
                }))
                break
                case '[': boundaries.push(new Boundary({
                    position: {
                        x: Boundary.width * j,
                        y: Boundary.height * i
                    },
                    image: createImage('../assets/img/capLeft.png'),
                    context: c
                }))
                break
                case '7': boundaries.push(new Boundary({
                    position: {
                        x: Boundary.width * j,
                        y: Boundary.height * i
                    },
                    image: createImage('../assets/img/pipeConnectorBottom.png'),
                    context: c
                }))
                break
                case ']': boundaries.push(new Boundary({
                    position: {
                        x: Boundary.width * j,
                        y: Boundary.height * i
                    },
                    image: createImage('../assets/img/capRight.png'),
                    context: c
                }))
                break
                case '_': boundaries.push(new Boundary({
                    position: {
                        x: Boundary.width * j,
                        y: Boundary.height * i
                    },
                    image: createImage('../assets/img/capBottom.png'),
                    context: c
                }))
                break
                case '^': boundaries.push(new Boundary({
                    position: {
                        x: Boundary.width * j,
                        y: Boundary.height * i
                    },
                    image: createImage('../assets/img/capTop.png'),
                    context: c
                }))
                break
                case '+': boundaries.push(new Boundary({
                    position: {
                        x: Boundary.width * j,
                        y: Boundary.height * i
                    },
                    image: createImage('../assets/img/pipeCross.png'),
                    context: c
                }))
                break
                case '5': boundaries.push(new Boundary({
                    position: {
                        x: Boundary.width * j,
                        y: Boundary.height * i
                    },
                    image: createImage('../assets/img/pipeConnectorTop.png'),
                    context: c
                }))
                break
                case '.': pellets.push(new Pellet({
                    position: {
                        x: Boundary.width * j + Boundary.width / 2,
                        y: Boundary.height * i + Boundary.height / 2
                    },
                    context: c
                }))
                break
                case 'p': powerUps.push(new PowerUp({
                    position: {
                        x: Boundary.width * j + Boundary.width / 2,
                        y: Boundary.height * i + Boundary.height / 2
                    },
                    context: c
                }))
                break
            }
        })
    })

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
                y: 3 * Boundary.height + Boundary.height / 2
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

    if (keys.w.pressed && lastKey === 'w') {
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (
                circleCollidesWithRectangle({
                    circle: {...player, velocity: {
                        x: 0,
                        y: -5
                    }
                },
                rectangle: boundary
            })
        )   {
            player.velocity.y = 0
            break
            } else {
                player.velocity.y = -5
            }
        }
    
    } else if (keys.a.pressed && lastKey === 'a') {
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (
                circleCollidesWithRectangle({
                    circle: {...player, velocity: {
                        x: -5,
                        y: 0
                    }
                },
                rectangle: boundary
            })
        )   {
            player.velocity.x = 0
            break
            } else {
                player.velocity.x = -5
            }
        }
    } else if (keys.s.pressed && lastKey === 's') {
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (
                circleCollidesWithRectangle({
                    circle: {...player, velocity: {
                        x: 0,
                        y: 5
                    }
                },
                rectangle: boundary
            })
        )   {
            player.velocity.y = 0
            break
            } else {
                player.velocity.y = 5
            }
        }
    } else if (keys.d.pressed && lastKey === 'd') {
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (
                circleCollidesWithRectangle({
                    circle: {...player, velocity: {
                        x: 5,
                        y: 0
                    }
                },
                rectangle: boundary
            })
        )   {
            player.velocity.x = 0
            break
            } else {
                player.velocity.x = 5
            }
        }
    }

    // Spelare krockar med spöke
    for (let i = ghosts.length -1; 0 <= i; i--) {
        const ghost = ghosts[i]

        if (Math.hypot(ghost.position.x - player.position.x, ghost.position.y - player.position.y) < ghost.radius + player.radius) {
            if (ghost.scared) {
                ghosts.splice(i, 1)
            } else {
                cancelAnimationFrame(animationId)
                gameRunning = false
                statusText.innerText = 'You lose!'
                statusText.style.color = 'red'
                gameUi.style.display = 'block'
                winCount = 0
                console.log('You lose')
            }
        }

    }

    // Vilkor för vinst
    if (pellets.length === 0) {
        cancelAnimationFrame(animationId)
        gameRunning = false
        statusText.innerText = 'You win!'
        statusText.style.color = 'white'
        gameUi.style.display = 'block'
        winCount += 1
        console.log('You win, win streak: ', winCount)
    }


    // Spelare krockar med powerUps
    for (let i = powerUps.length - 1; 0 <= i; i-- ) {
        const powerUp = powerUps[i]
        powerUp.draw()

        if (Math.hypot(powerUp.position.x - player.position.x, powerUp.position.y - player.position.y) < powerUp.radius + player.radius) {
            powerUps.splice(i, 1)

            //Spöken blir skrämda
            ghosts.forEach(ghost => {
                ghost.scared = true

                setTimeout(() => {
                    ghost.scared = false
                },
            4000)
            })

        }
    }

    // Krockar med pellets
    for (let i = pellets.length - 1; 0 <= i; i-- ) {
        const pellet = pellets[i]
    
        pellet.draw()

        if (Math.hypot(pellet.position.x - player.position.x, pellet.position.y - player.position.y) < pellet.radius + player.radius) {
            pellets.splice(i, 1)
            score += 10
            scoreEl.innerText = score
        }
    }

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
    ghosts.forEach(ghost => {
        ghost.update()        

        const collisions = []
        boundaries.forEach(boundary => {
            if (
                !collisions.includes('right') &&
                circleCollidesWithRectangle({
                    circle: {...ghost, velocity: {
                        x: ghost.speed,
                        y: 0
                    }
                },
                rectangle: boundary
            })
        ) {
            collisions.push('right')
        }

        if (
            !collisions.includes('left') &&
                circleCollidesWithRectangle({
                    circle: {...ghost, velocity: {
                        x: -ghost.speed,
                        y: 0
                    }
                },
                rectangle: boundary
            })
        ) {
            collisions.push('left')
        }

        if (
            !collisions.includes('down') &&
                circleCollidesWithRectangle({
                    circle: {...ghost, velocity: {
                        x: 0,
                        y: ghost.speed
                    }
                },
                rectangle: boundary
            })
        ) {
            collisions.push('down')
        }

        if (
            !collisions.includes('up') &&
                circleCollidesWithRectangle({
                    circle: {...ghost, velocity: {
                        x: 0,
                        y: -ghost.speed
                    }
                },
                rectangle: boundary
            })
        ) {
            collisions.push('up')
        }
        })
        if (collisions.length > ghost.prevCollisions.length)
            ghost.prevCollisions = collisions

        if (JSON.stringify(collisions) !== JSON.stringify(ghost.prevCollisions)) {

            if (ghost.velocity.x > 0)
                ghost.prevCollisions.push('right')
            else if (ghost.velocity.x < 0)
                ghost.prevCollisions.push('left')
            else if (ghost.velocity.y > 0)
                ghost.prevCollisions.push('down')
            else if (ghost.velocity.y < 0)
                ghost.prevCollisions.push('up')

            const pathways = ghost.prevCollisions.filter(collision => {
                return !collisions.includes(collision)
            })

            const direction = pathways[Math.floor(Math.random() * pathways.length)]

            switch (direction) {
                case 'down':
                    ghost.velocity.y = ghost.speed
                    ghost.velocity.x = 0
                    break

                case 'up':
                    ghost.velocity.y = -ghost.speed
                    ghost.velocity.x = 0
                    break

                case 'left':
                    ghost.velocity.y = 0
                    ghost.velocity.x = -ghost.speed
                    break

                case 'right':
                    ghost.velocity.y = 0
                    ghost.velocity.x = ghost.speed
                    break
            }
            ghost.prevCollisions = []
        }
    })

    if (player.velocity.x > 0) player.rotation = 0
    else if (player.velocity.x < 0) player.rotation = Math.PI
    else if (player.velocity.y > 0) player.rotation = Math.PI / 2
    else if (player.velocity.y < 0) player.rotation = Math.PI * 1.5
} //end of animate

init()

addEventListener('keydown', ({key}) => {
    switch (key) {
        case 'ArrowUp': keys.w.pressed = true
        lastKey = 'w'
        break
        case 'ArrowLeft': keys.a.pressed = true
        lastKey = 'a'
        break
        case 'ArrowDown': keys.s.pressed = true
        lastKey = 's'
        break
        case 'ArrowRight': keys.d.pressed = true
        lastKey = 'd'
        break
    }
})

addEventListener('keyup', ({key}) => {
    switch (key) {
        case 'ArrowUp': keys.w.pressed = false
        break
        case 'ArrowLeft': keys.a.pressed = false
        break
        case 'ArrowDown': keys.s.pressed = false
        break
        case 'ArrowRight': keys.d.pressed = false
        break
    }
})

addEventListener('keydown', (e) => {
    if (e.key === ' ' && !gameRunning) {
        init();
    }
})

mobileButtons.forEach(button => {
    button.addEventListener('touchstart', (e) => {
        e.preventDefault()
        const key = button.getAttribute('data-key')
        keys[key].pressed = true
        lastKey = key
    })

    button.addEventListener('touchend', (e) => {
        const key = button.getAttribute('data-key')
        keys[key].pressed = false
    })

    button.addEventListener('mousedown', (e) => {
        const key = button.getAttribute('data-key')
        keys[key].pressed = true
        lastKey = key
    })

    button.addEventListener('mouseup', (e) => {
        const key = button.getAttribute('data-key')
        keys[key].pressed = false
    })
})