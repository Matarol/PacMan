import { resolvePlayerGhostCollision } from "../gameState.js";

export function updateCollisions(world) {
    const player = world.entities.find(e => e.type === 'player');
    const result = resolvePlayerGhostCollision(
        world
    );

    const tookDamage = result?.result === 'player_damaged';

    const isPlayerDead = result?.result === 'player_dead' || world.gameState.health <= 0;

    return { raw: result, tookDamage, isPlayerDead, shouldGameOver: isPlayerDead };
};