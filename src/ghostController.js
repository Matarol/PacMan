import { Ghost } from "./ghost.js"
import { circleCollidesWithRectangle } from "./collision.js"

export function updateGhosts(ghosts, boundaries, player, deltaTime) { ghosts.forEach(ghost => {        

        const collisions = []

        const steps = 4

        for (let i = 0; i < steps; i++) {

        boundaries.forEach(boundary => {
            if (
                !collisions.includes('right') &&
                circleCollidesWithRectangle({
                    circle: {...ghost, velocity: {
                        x: Ghost.speed * deltaTime,
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
                        x: -Ghost.speed * deltaTime,
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
                        y: Ghost.speed * deltaTime
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
                        y: -Ghost.speed * deltaTime
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
                    ghost.velocity.y = Ghost.speed
                    ghost.velocity.x = 0
                    break

                case 'up':
                    ghost.velocity.y = -Ghost.speed
                    ghost.velocity.x = 0
                    break

                case 'left':
                    ghost.velocity.y = 0
                    ghost.velocity.x = -Ghost.speed
                    break

                case 'right':
                    ghost.velocity.y = 0
                    ghost.velocity.x = Ghost.speed
                    break
            }
            ghost.prevCollisions = []
        }
        
            ghost.update(deltaTime / steps)
            }

    })   

}

export function scareGhosts(ghosts) {
    ghosts.forEach(ghost => {
        ghost.scared = true

        setTimeout(() => {
            ghost.scared = false
        },
    4000)
    })
}