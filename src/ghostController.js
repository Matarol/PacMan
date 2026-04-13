import { Ghost } from "./ghost.js"
import { circleCollidesWithRectangle, isCenteredInTile } from "./collision.js"

export function updateGhosts(ghosts, boundaries, player, deltaTime) {
    ghosts.forEach(ghost => {
        const steps = 4
        const stepDelta = deltaTime / steps

        for (let i = 0; i < steps; i++) {
            let collisions = []

            // 1. Registrera ALLA nuvarande kollisioner
            boundaries.forEach(boundary => {
                if (!collisions.includes('right') && circleCollidesWithRectangle({
                    circle: { ...ghost, velocity: { x: Ghost.speed * stepDelta, y: 0 } },
                    rectangle: boundary
                })) { collisions.push('right') }

                if (!collisions.includes('left') && circleCollidesWithRectangle({
                    circle: { ...ghost, velocity: { x: -Ghost.speed * stepDelta, y: 0 } },
                    rectangle: boundary
                })) { collisions.push('left') }

                if (!collisions.includes('down') && circleCollidesWithRectangle({
                    circle: { ...ghost, velocity: { x: 0, y: Ghost.speed * stepDelta } },
                    rectangle: boundary
                })) { collisions.push('down') }

                if (!collisions.includes('up') && circleCollidesWithRectangle({
                    circle: { ...ghost, velocity: { x: 0, y: -Ghost.speed * stepDelta } },
                    rectangle: boundary
                })) { collisions.push('up') }
            })

            // 2. Kolla om vi är blockerade i nuvarande riktning
            let isBlocked = false
            if (ghost.velocity.x > 0 && collisions.includes('right')) isBlocked = true
            else if (ghost.velocity.x < 0 && collisions.includes('left')) isBlocked = true
            else if (ghost.velocity.y > 0 && collisions.includes('down')) isBlocked = true
            else if (ghost.velocity.y < 0 && collisions.includes('up')) isBlocked = true

            // 3. Om vi når en korsning (ändrade kollisioner) ELLER är blockerade
            if (isCenteredInTile(ghost)) {
                const directions = ['up', 'down', 'left', 'right']
                const pathways = directions.filter(dir => !collisions.includes(dir))

                // 1. Ta reda på vad som är "bakåt" (för att undvika att de darrar fram och tillbaka)
                let opposite = ''
                if (ghost.velocity.x > 0) opposite = 'left'
                else if (ghost.velocity.x < 0) opposite = 'right'
                else if (ghost.velocity.y > 0) opposite = 'up'
                else if (ghost.velocity.y < 0) opposite = 'down'

                // 2. Filtrera bort "bakåt" om det finns andra val (annars fastnar de i återvändsgränder)
                let validOptions = pathways.filter(p => p !== opposite)
                if (validOptions.length === 0) validOptions = pathways 

                // 3. LOGIK-FIX: Om vi har en korsning (fler än 1 väg framåt + nuvarande), 
                // tvinga spöket att ibland byta riktning även om vägen framåt är fri.
                if (validOptions.length > 0) {
                    const direction = validOptions[Math.floor(Math.random() * validOptions.length)]

                    // Uppdatera velocity endast om vi valt en ny riktning
                    switch (direction) {
                        case 'down':  ghost.velocity.y = Ghost.speed;  ghost.velocity.x = 0; break
                        case 'up':    ghost.velocity.y = -Ghost.speed; ghost.velocity.x = 0; break
                        case 'left':  ghost.velocity.x = -Ghost.speed; ghost.velocity.y = 0; break
                        case 'right': ghost.velocity.x = Ghost.speed;  ghost.velocity.y = 0; break
                    }
                }
            }

            // Spara nuvarande kollisioner till nästa loop
            ghost.prevCollisions = [...collisions]

            // 4. Flytta spöket (nu uppdateras isBlocked efter eventuellt riktningsbyte)
            // Vi kollar blockering igen för att undvika att de darrar mot väggar
            let finalBlocked = false
            boundaries.forEach(boundary => {
                if (circleCollidesWithRectangle({
                    circle: { ...ghost, velocity: { x: ghost.velocity.x * stepDelta, y: ghost.velocity.y * stepDelta } },
                    rectangle: boundary
                })) { finalBlocked = true }
            })

            if (!finalBlocked) {
                ghost.update(stepDelta)
            }
        }
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

export function scareGhosts(ghosts) {
    ghosts.forEach(ghost => {
        ghost.scared = true

        setTimeout(() => {
            ghost.scared = false
        },
            4000)
    })
}