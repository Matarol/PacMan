import {
    getGhosts,
    getPlayer,
    getVillains
} from "../utils/entitySelectors.js";
import { circleCollidesWithCircle } from "../collision.js";
import { removeEntity } from "../utils/entityHelpers.js";
import { handleVillainEaten } from "./villainSystem.js";
import { playSound } from "../audioManager.js";

export async function updateCollisions(world) {

    const ghostResult = resolvePlayerGhostCollision(world);
    const villainResult = await resolvePlayerVillainCollisions(world);

    const tookDamage = ghostResult?.result === 'player_damaged' || villainResult?.result === 'player_damaged';

    const isPlayerDead = ghostResult?.result === 'player_dead' || villainResult?.result === 'player_dead' || world.gameState.health <= 0;

    return {
        raw: {
            ghost: ghostResult,
            villain: villainResult
        }, tookDamage, isPlayerDead, shouldGameOver: isPlayerDead };
};

function resolvePlayerGhostCollision(world) {

    const ghosts = getGhosts(world);
    const player = getPlayer(world);

    for (let i = ghosts.length -1; i >= 0; i--) {
         const ghost = ghosts[i]

        if (circleCollidesWithCircle(player, ghost)) {
            if (ghost.scared) {
                playSound('eat-ghost')
                removeEntity(world, ghost)
                return { result: 'ghost_eaten' }
            } else {
                return { result: 'player_dead' }
            }
        }        
    }

    return { result: null }
}

async function resolvePlayerVillainCollisions(world) {
    const player = getPlayer(world);
    const villains = getVillains(world);

    if (!player) return { result: null };

    for (let i = villains.length -1; i >= 0; i--) {
        const villain = villains[i];

        if (circleCollidesWithCircle(player, villain)) {
            if (villain.miniature) {
                const eatenVillain = { ...villain };

                removeEntity(world, villain);

                await handleVillainEaten({ eatenVillain, world });

                return { result: 'villainEaten' };
            }

            world.actions.damagePlayer(15);

            return { result: 'player_damaged' };
        }
    }

    return { result: null };

}