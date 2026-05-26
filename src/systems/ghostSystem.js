import { getGhosts, getPlayer } from "../utils/entitySelectors.js";
import { circleCollidesWithRectangle, isCenteredInTile } from "../collision.js";

export function updateGhosts(world, deltaTime) {
    handleGhostAI(world, deltaTime)
    updateGhostStateAndPosition(world, deltaTime)
}

function updateGhostStateAndPosition(world, deltaTime) {
    const ghosts = getGhosts(world);
    const player = getPlayer(world);

    ghosts.forEach(ghost => {
        if (!ghost.position || !ghost.velocity) return;
        if (ghost.timer > 0) {
            ghost.timer -= deltaTime * 60

            if (ghost.timer <= 0) {
                if (ghost.scared) {
                    ghost.scared = false
                    ghost.angry = true
                    ghost.timer = 600
                } else if (ghost.angry) {
                    ghost.angry = false
                }
            }
        }
        ghost.position.x += ghost.velocity.x * deltaTime
        ghost.position.y += ghost.velocity.y * deltaTime

        ghost.eyesOffsetX = 0
        ghost.eyesOffsetY = 0

        const maxPupilsOffset = 1.5

        if (ghost.angry && player?.position) {
            const dx = player.position.x - ghost.position.x
            const dy = player.position.y - ghost.position.y
            const angle = Math.atan2(dy, dx)
            ghost.eyesOffsetX = Math.cos(angle) * maxPupilsOffset
            ghost.eyesOffsetY = Math.sin(angle) * maxPupilsOffset
        }
        else if (!ghost.scared) {
            if (ghost.velocity.x > 0) ghost.eyesOffsetX = maxPupilsOffset
            else if (ghost.velocity.x < 0) ghost.eyesOffsetX = -maxPupilsOffset

            if (ghost.velocity.y > 0) ghost.eyesOffsetY = maxPupilsOffset
            else if (ghost.velocity.y < 0) ghost.eyesOffsetY = -maxPupilsOffset
        }        
    })
}

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

function handleGhostAI(world, deltaTime) {
    if (!world || !Array.isArray(world.entities)) return;

    const entities = world.entities;

    const ghosts = entities.filter(e => e.type === 'ghost');
    const boundaries = entities.filter(e => e.type === 'boundary');
    const player = entities.find(e => e.type === 'player');

    if (!player) return;

    ghosts.forEach(ghost => {
        const steps = 4;
        const stepDelta = deltaTime / steps;

        for (let i = 0; i < steps; i++) {
            let collisions = [];
            
            // Kolla kollisioner (Samma som förut)
            boundaries.forEach(boundary => {
                const checkDist = ghost.speed * stepDelta + 1; // +1 för marginal
                if (circleCollidesWithRectangle({ circle: { ...ghost, velocity: { x: checkDist, y: 0 } }, rectangle: boundary })) collisions.push('right');
                if (circleCollidesWithRectangle({ circle: { ...ghost, velocity: { x: -checkDist, y: 0 } }, rectangle: boundary })) collisions.push('left');
                if (circleCollidesWithRectangle({ circle: { ...ghost, velocity: { x: 0, y: checkDist } }, rectangle: boundary })) collisions.push('down');
                if (circleCollidesWithRectangle({ circle: { ...ghost, velocity: { x: 0, y: -checkDist } }, rectangle: boundary })) collisions.push('up');
            });

            const currentTileX = Math.round(ghost.position.x / 40); // Ersätt 40 med din tileSize
            const currentTileY = Math.round(ghost.position.y / 40);

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

                    if (ghost.velocity.x > 0) ghost.cameFrom = 'left';
                    else if (ghost.velocity.x < 0) ghost.cameFrom = 'right';
                    else if (ghost.velocity.y > 0) ghost.cameFrom = 'up';
                    else if (ghost.velocity.y < 0) ghost.cameFrom = 'down';
                }

                let currentMoveDir = '';

                if (ghost.velocity.x > 0) currentMoveDir = 'right';
                else if (ghost.velocity.x < 0) currentMoveDir = 'left';
                else if (ghost.velocity.y > 0) currentMoveDir = 'down';
                else if (ghost.velocity.y < 0) currentMoveDir = 'up';

                //Om spöket står still pga kollision, sätts currentMoveDir utifrån lastDir
                if (currentMoveDir === '' && ghost.lastDirection) {
                    currentMoveDir = ghost.lastDirection;
                }

                const directions = ['up', 'down', 'left', 'right'];
                // Pathways innehåller endast directions som inte finns i collisions
                const pathways = directions.filter(dir => !collisions.includes(dir));

                // Hitta motsatt riktning (för att undvika 180-svängar)
                const forbiddenDirection = ghost.cameFrom
                
                // Prioritera vägar som INTE är tillbaka där vi kom ifrån
                let validOptions = pathways.filter(dir => dir !== forbiddenDirection);
                
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
                    if (direction === 'right') { ghost.velocity.x = ghost.speed; ghost.velocity.y = 0; }
                    if (direction === 'left')  { ghost.velocity.x = -ghost.speed; ghost.velocity.y = 0; }
                    if (direction === 'down')  { ghost.velocity.x = 0; ghost.velocity.y = ghost.speed; }
                    if (direction === 'up')    { ghost.velocity.x = 0; ghost.velocity.y = -ghost.speed; }
                }
            }

        }
    });
}

export function scareGhosts(ghosts) {
    ghosts.forEach(ghost => {
        ghost.scared = true
        ghost.angry = false
        ghost.timer = 400;
    });
}