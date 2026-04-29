import { resolvePlayerGhostCollision } from "../gameState.js";

export function updateCollisions(world) {
    const result = resolvePlayerGhostCollision(
        world.player,
        world.ghosts,
        world
    );

    const tookDamage = result?.result === 'player_damaged';

    const isPlayerDead = result?.result === 'player_dead' || world.gameState.health <= 0;

    return { raw: result, tookDamage, isPlayerDead, shouldGameOver: isPlayerDead };
};