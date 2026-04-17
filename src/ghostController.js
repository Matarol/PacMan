import { Ghost } from "./ghost.js"
import { circleCollidesWithRectangle, isCenteredInTile } from "./collision.js"

function getBestDirection(ghost, choices, targetPos) {
    let bestDir = choices[0]

    let bestDist = ghost.scared ? -Infinity : Infinity

    choices.forEach(dir => {
        let nextX = ghost.position.x
        let nextY = ghost.position.y
        const tileSize = 40
    
        if (dir === 'up') nextY -= tileSize
        if (dir === 'down') nextY += tileSize
        if (dir === 'left') nextX -= tileSize
        if (dir === 'right') nextX += tileSize

        const distanceToTargget = Math.hypot(targetPos.x - nextX, targetPos.y - nextY)

        if (ghost.angry) {
            // När spökena är arga så jagar dem
            if (distanceToTargget < bestDist) {
                bestDist = distanceToTargget
                bestDir = dir
            }
        } else if (ghost.scared) {
            // När spökena är rädda så undviker dem målet
            if (distanceToTargget > bestDist) {
                bestDist = distanceToTargget
                bestDir = dir
            }
        }
    })

    return bestDir
}

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

                if (isCenteredInTile(ghost)) {
                    ghost.lastTile = { x: currentTileX, y: currentTileY };
                }

                let currentMoveDir = '';

                if (ghost.velocity.x > 0) currentMoveDir = 'right';
                else if (ghost.velocity.x < 0) currentMoveDir = 'left';
                else if (ghost.velocity.y > 0) currentMoveDir = 'down';
                else if (ghost.velocity.y < 0) currentMoveDir = 'up';

                //Om spöket står still pga kollision, sätts currentMoveDir utifrån lastDir
                if (currentMoveDir === 0 && ghost.lastDirection) {
                    currentMoveDir = ghost.lastDirection;
                }

                const directions = ['up', 'down', 'left', 'right'];
                // Pathways innehåller endast directions som inte finns i collisions
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
                    let direction;

                    if (ghost.angry || ghost.scared) {
                        direction = getBestDirection(ghost, finalChoices, player.position);
                    } else {
                        direction = finalChoices[Math.floor(Math.random() * finalChoices.length)];
                    }

                    ghost.lastDirection = direction

                    // VIKTIGT: Sätt velocity till exakt hastighet
                    if (direction === 'right') { ghost.velocity.x = Ghost.speed; ghost.velocity.y = 0; }
                    if (direction === 'left')  { ghost.velocity.x = -Ghost.speed; ghost.velocity.y = 0; }
                    if (direction === 'down')  { ghost.velocity.x = 0; ghost.velocity.y = Ghost.speed; }
                    if (direction === 'up')    { ghost.velocity.x = 0; ghost.velocity.y = -Ghost.speed; }
                }
            }

            // Slutlig rörelse
            if (!isBlocked) {
                ghost.update(stepDelta, player.position);
            } else {
                // Om blockerad, nollställ velocity så den inte "darrar" in i väggen
                ghost.update(0, player.position);
                ghost.velocity.x = 0;
                ghost.velocity.y = 0;
            }
        }
    });
}

export function scareGhosts(ghosts) {
    ghosts.forEach(ghost => {
        if (ghost.becomeScared) ghost.becomeScared();
    });
}