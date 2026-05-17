import {
    getBoundaries,
    getGhosts,
    getPellets,
    getPlayer,
    getPowerUps,
    getVillains,
} from "./utils/entitySelectors.js";
import { handlePlayerMovement, handleSpaceMovement } from "./playerController.js";
import { handleGhostsMovement } from "./ghostController.js";
import { handleVillainMovement } from './villainController.js'
import { updateVillains } from "./systems/villainSystem.js";
import { circleCollidesWithCircle, getCircleRepulsion } from "./collision.js";
import { updateUI } from "./uiManager.js";
import { handleVillainEaten } from "./villainController.js";
import { removeEntity } from "./itemsController.js";
import { updateGhosts } from "./systems/ghostSystem.js";

export async function updateSpaceMode(world, deltaTime) {

    const { entities, gameState, keys, actions } = world;

    const player = getPlayer(world);
    const ghosts = getGhosts(world);
    const boundaries = getBoundaries(world);
    const villains = getVillains(world);

    const dangerousPellets = getPellets(world).filter(p => p.isDangerous);
    const powerUps = getPowerUps(world);

    const noWayToWin = villains.length > 0 && dangerousPellets.length === 0 && powerUps.length === 0 && !villains.some(v => v.miniature);

    if (!player || !player.velocity) return

    handleSpaceMovement(player, keys, boundaries, deltaTime);

    boundaries.forEach(boundary => {
        if (boundary.isAsteroid) {
            const asteroid = {
                position: {
                    x: boundary.position.x + boundary.width / 2,
                    y: boundary.position.y + boundary.height / 2
                },
                radius: 15
            };
            const pPush = getCircleRepulsion(player, asteroid);
            player.position.x += pPush.x;
            player.position.y += pPush.y;

            if (Math.hypot(pPush.x, pPush.y) > 0.4) {
                actions.damagePlayer(5);
                updateUI(gameState);
            }

            villains.forEach(v => {
                const vPush = getCircleRepulsion(v, asteroid);
                v.position.x += vPush.x;
                v.position.y += vPush.y;
            });
        }
    });

    for (let i = villains.length - 1; i >= 0; i--) {
        const v = villains[i];
        handleVillainMovement(v, player, boundaries, deltaTime);        

        if (circleCollidesWithCircle(player, v)) {
            if (v.miniature) {
                const savedVillain = { ...v };
                removeEntity(v, world);
                await handleVillainEaten({ eatenVillain: savedVillain, world });
                return;
            } else {
                actions.damagePlayer(15);
                updateUI(gameState);
            }
        }
    }

    updateVillains(world, deltaTime);

    if (noWayToWin) {
        world.actions.handleGameOver(false);
        return;
    }

}

export function updateClassicMode(world, deltaTime) {
    const { entities, directionState } = world;

    const player = entities.find(e => e.type === 'player');
    const boundaries = entities.filter(e => e.type === 'boundary');

    if (!player) {
        return {
            currentDirection: directionState.currentDirection,
            nextDirection: directionState.nextDirection
        }
    }

    const result = handlePlayerMovement(player, world.directionState.currentDirection, world.directionState.nextDirection, boundaries, deltaTime);

    world.directionState.currentDirection = result.currentDirection;
    world.directionState.nextDirection = result.nextDirection;

    handleGhostsMovement(world, deltaTime);
    updateGhosts(world, deltaTime)

    return result;
}

