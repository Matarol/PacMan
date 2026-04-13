import { Ghost } from "./ghost.js"
import { circleCollidesWithRectangle, isCenteredInTile } from "./collision.js"

export function updateGhosts(ghosts, boundaries, player, deltaTime) {
    ghosts.forEach(ghost => {
        const steps = 4
        const stepDelta = deltaTime / steps

        for (let i = 0; i < steps; i++) {

            // ===============================
            // 1. Kolla blockerade riktningar
            // ===============================
            let collisions = []

            const directions = {
                right: { x: Ghost.speed * stepDelta, y: 0 },
                left: { x: -Ghost.speed * stepDelta, y: 0 },
                down: { x: 0, y: Ghost.speed * stepDelta },
                up: { x: 0, y: -Ghost.speed * stepDelta }
            }

            for (const direction in directions) {
                for (const boundary of boundaries) {
                    if (
                        circleCollidesWithRectangle({
                            circle: {
                                ...ghost,
                                velocity: directions[direction]
                            },
                            rectangle: boundary
                        })
                    ) {
                        collisions.push(direction)
                        break
                    }
                }
            }

            // ===============================
            // 2. Nuvarande riktning
            // ===============================
            let currentDirection = null

            if (ghost.velocity.x > 0) currentDirection = "right"
            else if (ghost.velocity.x < 0) currentDirection = "left"
            else if (ghost.velocity.y > 0) currentDirection = "down"
            else if (ghost.velocity.y < 0) currentDirection = "up"

            const opposite = {
                up: "down",
                down: "up",
                left: "right",
                right: "left"
            }

            // ======================================
            // 3. Byt riktning endast vid korsning
            // ======================================
            if (isCenteredInTile(ghost)) {

                const availableDirections =
                    ["up", "down", "left", "right"]
                        .filter(dir => !collisions.includes(dir))

                const forwardBlocked =
                    collisions.includes(currentDirection)

                const perpendicularChoices =
                    availableDirections.filter(
                        dir =>
                            dir !== currentDirection &&
                            dir !== opposite[currentDirection]
                    )

                // Byt bara om:
                // - framåt blockerat
                // - eller korsning finns
                if (forwardBlocked || perpendicularChoices.length > 0) {

                    let choices = []

                    if (forwardBlocked) {
                        choices = availableDirections.filter(
                            dir => dir !== opposite[currentDirection]
                        )
                    } else {
                        choices = perpendicularChoices
                    }

                    if (choices.length > 0) {
                        const direction =
                            choices[Math.floor(Math.random() * choices.length)]

                        switch (direction) {
                            case "up":
                                ghost.velocity.x = 0
                                ghost.velocity.y = -Ghost.speed
                                break

                            case "down":
                                ghost.velocity.x = 0
                                ghost.velocity.y = Ghost.speed
                                break

                            case "left":
                                ghost.velocity.x = -Ghost.speed
                                ghost.velocity.y = 0
                                break

                            case "right":
                                ghost.velocity.x = Ghost.speed
                                ghost.velocity.y = 0
                                break
                        }
                    }
                }
            }

            // ===============================
            // 4. Flytta om ej blockerad
            // ===============================
            if (!collisions.includes(currentDirection)) {
                ghost.update(stepDelta)
            }
        }
    })
}

export function scareGhosts(ghosts) {
    ghosts.forEach(ghost => {
        ghost.scared = true

        setTimeout(() => {
            ghost.scared = false
        }, 4000)
    })
}

// import { Ghost } from "./ghost.js"
// import { circleCollidesWithRectangle, isCenteredInTile } from "./collision.js"

// export function updateGhosts(ghosts, boundaries, player, deltaTime) {
//     ghosts.forEach(ghost => {

//         const steps = 4
//         const stepDelta = deltaTime / steps

//         for (let i = 0; i < steps; i++) {

//             let collisions = []

//             boundaries.forEach(boundary => {
//                 if (
//                     !collisions.includes('right') &&
//                     circleCollidesWithRectangle({
//                         circle: {
//                             ...ghost, velocity: {
//                                 x: Ghost.speed * stepDelta,
//                                 y: 0
//                             }
//                         },
//                         rectangle: boundary
//                     })
//                 ) {
//                     collisions.push('right')
//                 }

//                 if (
//                     !collisions.includes('left') &&
//                     circleCollidesWithRectangle({
//                         circle: {
//                             ...ghost, velocity: {
//                                 x: -Ghost.speed * stepDelta,
//                                 y: 0
//                             }
//                         },
//                         rectangle: boundary
//                     })
//                 ) {
//                     collisions.push('left')
//                 }

//                 if (
//                     !collisions.includes('down') &&
//                     circleCollidesWithRectangle({
//                         circle: {
//                             ...ghost, velocity: {
//                                 x: 0,
//                                 y: Ghost.speed * stepDelta
//                             }
//                         },
//                         rectangle: boundary
//                     })
//                 ) {
//                     collisions.push('down')
//                 }

//                 if (
//                     !collisions.includes('up') &&
//                     circleCollidesWithRectangle({
//                         circle: {
//                             ...ghost, velocity: {
//                                 x: 0,
//                                 y: -Ghost.speed * stepDelta
//                             }
//                         },
//                         rectangle: boundary
//                     })
//                 ) {
//                     collisions.push('up')
//                 }
//             })

//             // console.log("Collisions:", collisions, "Previous:", ghost.prevCollisions)
            
//             if (collisions.length > ghost.prevCollisions.length)
//                 ghost.prevCollisions = [...collisions]            

//             if (isCenteredInTile(ghost) && JSON.stringify([...collisions].sort()) !== JSON.stringify([ ...ghost.prevCollisions].sort())) {

//                 if (ghost.velocity.x > 0)
//                     if (!collisions.includes('right'))
//                         ghost.prevCollisions.push('right')
//                 else if (ghost.velocity.x < 0)
//                     if (!collisions.includes('left'))
//                         ghost.prevCollisions.push('left')
//                 else if (ghost.velocity.y > 0)
//                     if (!collisions.includes('down'))
//                         ghost.prevCollisions.push('down')
//                 else if (ghost.velocity.y < 0)
//                     if (!collisions.includes('up'))
//                         ghost.prevCollisions.push('up')

//                 const pathways = ghost.prevCollisions.filter(collision => {
//                     return !collisions.includes(collision)
//                 })

//                 console.log("Pathways:", pathways)

//                 if (pathways.length > 0) {
                    

//                     const direction = pathways[Math.floor(Math.random() * pathways.length)]

//                     switch (direction) {
//                         case 'down':
//                             ghost.velocity.y = Ghost.speed
//                             ghost.velocity.x = 0
//                             break

//                         case 'up':
//                             ghost.velocity.y = -Ghost.speed
//                             ghost.velocity.x = 0
//                             break

//                         case 'left':
//                             ghost.velocity.y = 0
//                             ghost.velocity.x = -Ghost.speed
//                             break

//                         case 'right':
//                             ghost.velocity.y = 0
//                             ghost.velocity.x = Ghost.speed
//                             break
//                     }

//                     ghost.prevCollisions = [...collisions]
//                 }
//             }

//             let blocked = false

//             for (let boundary of boundaries) {
//                 if (
//                     circleCollidesWithRectangle({
//                         circle: {
//                             ...ghost,
//                             velocity: {
//                                 x: ghost.velocity.x * stepDelta,
//                                 y: ghost.velocity.y * stepDelta
//                             }
//                         },
//                         rectangle: boundary
//                     })
//                 ) {
//                     blocked = true
//                     break
//                 }
//             }

//             if (!blocked) {
//                 ghost.update(stepDelta)
//             }

//         }

//     })

// }

// export function scareGhosts(ghosts) {
//     ghosts.forEach(ghost => {
//         ghost.scared = true

//         setTimeout(() => {
//             ghost.scared = false
//         },
//             4000)
//     })
// }