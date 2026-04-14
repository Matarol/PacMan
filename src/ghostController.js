import { Ghost } from "./ghost.js"
import { circleCollidesWithRectangle, isCenteredInTile } from "./collision.js"

// Lägg till en flagga på ghost-objektet (utanför denna funktion, t.ex. när ghost skapas)
// ghost.lastTile = {x: 0, y: 0} 

export function updateGhosts(ghosts, boundaries, player, deltaTime) {
    ghosts.forEach(ghost => {
        const steps = 4;
        const stepDelta = deltaTime / steps;

        for (let i = 0; i < steps; i++) {
            let collisions = [];
            
            // Kolla kollisioner (Samma som förut)
            boundaries.forEach(boundary => {
                const checkDist = Ghost.speed * stepDelta + 1; // +1 för marginal
                if (circleCollidesWithRectangle({ circle: { ...ghost, velocity: { x: checkDist, y: 0 } }, rectangle: boundary })) collisions.push('right');
                if (circleCollidesWithRectangle({ circle: { ...ghost, velocity: { x: -checkDist, y: 0 } }, rectangle: boundary })) collisions.push('left');
                if (circleCollidesWithRectangle({ circle: { ...ghost, velocity: { x: 0, y: checkDist } }, rectangle: boundary })) collisions.push('down');
                if (circleCollidesWithRectangle({ circle: { ...ghost, velocity: { x: 0, y: -checkDist } }, rectangle: boundary })) collisions.push('up');
            });

            const currentTileX = Math.round(ghost.x / 40); // Ersätt 40 med din tileSize
            const currentTileY = Math.round(ghost.y / 40);

            // LOGIK: Ändra bara riktning om vi är i mitten ELLER blockerade
            const isAtNewTile = !ghost.lastTile || (ghost.lastTile.x !== currentTileX || ghost.lastTile.y !== currentTileY);
            
            let isBlocked = (
                (ghost.velocity.x > 0 && collisions.includes('right')) ||
                (ghost.velocity.x < 0 && collisions.includes('left')) ||
                (ghost.velocity.y > 0 && collisions.includes('down')) ||
                (ghost.velocity.y < 0 && collisions.includes('up'))
            );

            if ((isCenteredInTile(ghost) && isAtNewTile) || isBlocked) {
                ghost.lastTile = { x: currentTileX, y: currentTileY };

                const directions = ['up', 'down', 'left', 'right'];
                const pathways = directions.filter(dir => !collisions.includes(dir));

                // Hitta motsatt riktning (för att undvika 180-svängar)
                let opposite = '';
                if (ghost.velocity.x > 0) opposite = 'left';
                else if (ghost.velocity.x < 0) opposite = 'right';
                else if (ghost.velocity.y > 0) opposite = 'up';
                else if (ghost.velocity.y < 0) opposite = 'down';

                // Prioritera vägar som INTE är tillbaka där vi kom ifrån
                let validOptions = pathways.filter(p => p !== opposite);
                
                // Om vi är blockerade eller i en korsning, välj ny väg
                if (validOptions.length > 0 || pathways.length > 0) {
                    const finalChoices = validOptions.length > 0 ? validOptions : pathways;
                    const direction = finalChoices[Math.floor(Math.random() * finalChoices.length)];

                    // VIKTIGT: Sätt velocity till exakt hastighet
                    if (direction === 'right') { ghost.velocity.x = Ghost.speed; ghost.velocity.y = 0; }
                    if (direction === 'left')  { ghost.velocity.x = -Ghost.speed; ghost.velocity.y = 0; }
                    if (direction === 'down')  { ghost.velocity.x = 0; ghost.velocity.y = Ghost.speed; }
                    if (direction === 'up')    { ghost.velocity.x = 0; ghost.velocity.y = -Ghost.speed; }
                }
            }

            // Slutlig rörelse
            if (!isBlocked) {
                ghost.update(stepDelta);
            } else {
                // Om blockerad, nollställ velocity så den inte "darrar" in i väggen
                ghost.velocity.x = 0;
                ghost.velocity.y = 0;
            }
        }
    });
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