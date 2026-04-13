import { handlePlayerMovement, handleSpaceMovement } from "./playerController.js";
import { updateGhosts } from "./ghostController.js";
import { updateVillain } from './villainController.js'
import { circleCollidesWithCircle, getCircleRepulsion } from "./collision.js";
import { damagePlayer } from "./gameState.js";
import { updateUI } from "./uiManager.js";
import { handleVillainEaten } from "./villainController.js";

export function updateSpaceMode({ player, villains, boundaries, keys, gameState, pellets, scoreEl, activeEffects, showMenu, returnToMainMap, handleGameOver, deltaTime }) {

    if (!player || !player.velocity) return

    villains = villains || []

    handleSpaceMovement(player, keys, boundaries, deltaTime);

    boundaries.forEach(boundary => {
        if (boundary.type === 'asteroid') {
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
                damagePlayer(5, gameState);
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
        updateVillain(v, player, boundaries, deltaTime);

        if (circleCollidesWithCircle(player, v)) {
            if (v.miniature) {
                const savedVillain = { ...v };
                villains.splice(i, 1);
                handleVillainEaten({ eatenVillain: savedVillain, pellets, scoreEl, activeEffects, showMenu, gameState, returnToMainMap });
                return;
            } else {
                damagePlayer(15, gameState);
                updateUI(gameState);
            }
        }
    }

    if (gameState.health <= 0) {
        handleGameOver(false);
    }

}

export function updateClassicMode({ player, ghosts, currentDirection, nextDirection, boundaries, deltaTime }) {

    const result = handlePlayerMovement(player, currentDirection, nextDirection, boundaries, deltaTime);

    updateGhosts(ghosts, boundaries, player, deltaTime);

    return result;
}

