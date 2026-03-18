const canvas = document.getElementById('canvas1');
const c = canvas.getContext('2d');

const scoreEl = document.getElementById('scoreEl')

const gameUi = document.getElementById('gameUi')
const statusText = document.getElementById('statusText')

let pellets = []
let powerUps = []
let boundaries = []
let ghosts = []
let player
let score = 0
let animationId
let gameRunning = true

class Boundary {
    static width = 40
    static height = 40
    constructor({position, image}) {
        this.position = position
        this.width = 40
        this.height = 40
        this.image = image
    }

    draw() {
        // c.fillStyle = 'blue'
        // c.fillRect(this.position.x, this.position.y, this.width, this.height)

        c.drawImage(this.image, this.position.x, this.position.y)
    }
};

class Player {
    constructor({position, velocity}) {
        this.position = position
        this.velocity = velocity
        this.radius = 15
        this.radians = 0.75
        this.openRate = 0.12
        this.rotation = 0
        this.eyesOffsetX = 3
        this.eyesOffsetY = -6
    }

    draw() {
        c.save()
        c.translate(this.position.x, this.position.y)
        c.rotate(this.rotation)
        c.translate(-this.position.x, -this.position.y)
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, this.radians, Math.PI * 2 - this.radians)
        c.lineTo(this.position.x, this.position.y)
        c.fillStyle = 'yellow'
        c.fill()
        c.closePath()        
        c.restore()

        c.beginPath()
        c.arc(this.position.x + this.eyesOffsetX, this.position.y + this.eyesOffsetY, 3, 0, Math.PI * 2)
        c.closePath()
        c.fillStyle = 'black'
        c.fill()
    }

    update() {        
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y

        if (this.radians < 0 || this.radians > 0.75) this.openRate = -this.openRate
        this.radians += this.openRate

        if (this.velocity.x > 0) {
            this.eyesOffsetX = 3
            this.eyesOffsetY = -6
        }
        if (this.velocity.x < 0) {
            this.eyesOffsetX = -3
            this.eyesOffsetY = -6
        }
        if (this.velocity.y > 0) {
            this.eyesOffsetX = 6
            this.eyesOffsetY = 3
        }
        if (this.velocity.y < 0) {
            this.eyesOffsetX = -6
            this.eyesOffsetY = -3
        }

        this.draw()
    }
}

class Ghost {
    static speed = 2
    constructor({position, velocity, color = 'green'}) {
        this.position = position
        this.velocity = velocity
        this.radius = 15
        this.color = color
        this.prevCollisions = []
        this.speed = 2
        this.scared = false
        this.eyesOffsetX = 0
        this.eyesOffsetY = 0
    }

    draw() {
        //Spökets kropp
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, Math.PI, 0)
        c.lineTo(this.position.x + this.radius, this.position.y + this.radius)
        for (let i = 0; i <= 4; i++) {
            const waveWidth = this.radius / 2
            c.lineTo(
            this.position.x + this.radius - i * waveWidth,
            this.position.y + this.radius + (i % 2 === 0 ? 5 : 0)
            )
        }
        c.lineTo(this.position.x - this.radius, this.position.y)
        c.fillStyle = this.scared ? 'blue' : this.color
        c.fill()
        c.closePath()

        //Spökets ögon
        c.beginPath()
        c.arc(this.position.x + 5, this.position.y + 5, 3, Math.PI, 0)
        c.lineTo(this.position.x + 8, this.position.y + 5)
        c.arc(this.position.x + 5, this.position.y + 7, 3, 0, Math.PI)
        c.closePath()
        c.fillStyle = 'white'
        c.fill()

        c.beginPath()
        c.arc(this.position.x + 5 + this.eyesOffsetX, this.position.y + 6 + this.eyesOffsetY, 2, 0, Math.PI * 2)
        c.closePath()
        c.fillStyle = 'black'
        c.fill()        

        c.beginPath()
        c.arc(this.position.x + -5, this.position.y + 5, 3, Math.PI, 0)
        c.lineTo(this.position.x -2, this.position.y + 5)
        c.arc(this.position.x + -5, this.position.y + 7, 3, 0, Math.PI)
        c.closePath()
        c.fillStyle = 'white'
        c.fill()

        c.beginPath()
        c.arc(this.position.x + -5 + this.eyesOffsetX, this.position.y + 6 + this.eyesOffsetY, 2, 0, Math.PI * 2)
        c.closePath()
        c.fillStyle = 'black'
        c.fill()
    }

    update() {        
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y

        this.eyesOffsetX = 0
        this.eyesOffsetY = 0

        if (this.velocity.x > 0) this.eyesOffsetX = 1.5
        else if (this.velocity.x < 0) this.eyesOffsetX = -1.5

        if (this.velocity.y > 0) this.eyesOffsetY = 1.5
        else if (this.velocity.y < 0) this.eyesOffsetY = -1.5

        this.draw()
    }
}

class Pellet {
    constructor({position}) {
        this.position = position
        this.radius = 3
    }

    draw() {
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        c.fillStyle = 'white'
        c.fill()
        c.closePath()
    }

}

class PowerUp {
    constructor({position}) {
        this.position = position
        this.radius = 8
    }

    draw() {
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        c.fillStyle = 'white'
        c.fill()
        c.closePath()
    }

}

const keys = {
    w: { pressed: false },
    a: { pressed: false },
    s: { pressed: false },
    d: { pressed: false }
}

let lastKey = ''

const map = [
    ['1', '-', '-', '-', '-', '-', '-', '-', '-', '-', '2'],
    ['|', '.', '.', '.', '.', '.', '.', '.', '.', '.', '|'],    
    ['|', '.', 'b', '.', '[', '7', ']', '.', 'b', '.', '|'],
    ['|', '.', '.', '.', '.', '_', '.', '.', '.', '.', '|'],
    ['|', '.', '[', ']', '.', '.', '.', '[', ']', '.', '|'],
    ['|', '.', '.', '.', '.', '^', '.', '.', '.', '.', '|'],
    ['|', '.', 'b', '.', '[', '+', ']', '.', 'b', '.', '|'],
    ['|', '.', '.', '.', '.', '_', '.', '.', '.', '.', '|'],
    ['|', '.', '[', ']', '.', '.', '.', '[', ']', '.', '|'],
    ['|', '.', '.', '.', '.', '^', '.', '.', '.', '.', '|'],
    ['|', '.', 'b', '.', '[', '5', ']', '.', 'b', '.', '|'],
    ['|', '.', '.', '.', '.', '.', '.', '.', '.', 'p', '|'],    
    ['4', '-', '-', '-', '-', '-', '-', '-', '-', '-', '3']
]

canvas.width = map[0].length * Boundary.width;
canvas.height = map.length * Boundary.height;

function createImage(src) {
    const image = new Image()
    image.src = src
    return image
}


function init() {
    cancelAnimationFrame(animationId)

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
                    image: createImage('./img/pipeHorizontal.png')
                }))
                break
                case '|': boundaries.push(new Boundary({
                    position: {
                        x: Boundary.width * j,
                        y: Boundary.height * i
                    },
                    image: createImage('./img/pipeVertical.png')
                }))
                break
                case '1': boundaries.push(new Boundary({
                    position: {
                        x: Boundary.width * j,
                        y: Boundary.height * i
                    },
                    image: createImage('./img/pipeCorner1.png')
                }))
                break
                case '2': boundaries.push(new Boundary({
                    position: {
                        x: Boundary.width * j,
                        y: Boundary.height * i
                    },
                    image: createImage('./img/pipeCorner2.png')
                }))
                break
                case '3': boundaries.push(new Boundary({
                    position: {
                        x: Boundary.width * j,
                        y: Boundary.height * i
                    },
                    image: createImage('./img/pipeCorner3.png')
                }))
                break
                case '4': boundaries.push(new Boundary({
                    position: {
                        x: Boundary.width * j,
                        y: Boundary.height * i
                    },
                    image: createImage('./img/pipeCorner4.png')
                }))
                break
                case 'b': boundaries.push(new Boundary({
                    position: {
                        x: Boundary.width * j,
                        y: Boundary.height * i
                    },
                    image: createImage('./img/block.png')
                }))
                break
                case '[': boundaries.push(new Boundary({
                    position: {
                        x: Boundary.width * j,
                        y: Boundary.height * i
                    },
                    image: createImage('./img/capLeft.png')
                }))
                break
                case '7': boundaries.push(new Boundary({
                    position: {
                        x: Boundary.width * j,
                        y: Boundary.height * i
                    },
                    image: createImage('./img/pipeConnectorBottom.png')
                }))
                break
                case ']': boundaries.push(new Boundary({
                    position: {
                        x: Boundary.width * j,
                        y: Boundary.height * i
                    },
                    image: createImage('./img/capRight.png')
                }))
                break
                case '_': boundaries.push(new Boundary({
                    position: {
                        x: Boundary.width * j,
                        y: Boundary.height * i
                    },
                    image: createImage('./img/capBottom.png')
                }))
                break
                case '^': boundaries.push(new Boundary({
                    position: {
                        x: Boundary.width * j,
                        y: Boundary.height * i
                    },
                    image: createImage('./img/capTop.png')
                }))
                break
                case '+': boundaries.push(new Boundary({
                    position: {
                        x: Boundary.width * j,
                        y: Boundary.height * i
                    },
                    image: createImage('./img/pipeCross.png')
                }))
                break
                case '5': boundaries.push(new Boundary({
                    position: {
                        x: Boundary.width * j,
                        y: Boundary.height * i
                    },
                    image: createImage('./img/pipeConnectorTop.png')
                }))
                break
                case '.': pellets.push(new Pellet({
                    position: {
                        x: Boundary.width * j + Boundary.width / 2,
                        y: Boundary.height * i + Boundary.height / 2
                    }
                }))
                break
                case 'p': powerUps.push(new PowerUp({
                    position: {
                        x: Boundary.width * j + Boundary.width / 2,
                        y: Boundary.height * i + Boundary.height / 2
                    }
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

    animate()

}

function circleCollidesWithRectangle({
    circle,
    rectangle
}) {
    const padding = Boundary.width / 2 - circle.radius - 1
    return (circle.position.y - circle.radius + circle.velocity.y <= rectangle.position.y + rectangle.height + padding && circle.position.x + circle.radius + circle.velocity.x >= rectangle.position.x - padding && circle.position.y + circle.radius + circle.velocity.y >= rectangle.position.y - padding && circle.position.x - circle.radius + circle.velocity.x <= rectangle.position.x + rectangle.width + padding)
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
        console.log('You win')
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