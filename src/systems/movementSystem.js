import { GAME_MODES, gameState } from "../gameState.js";
import { updatePlayer } from "./playerSystem.js";
import { updateGhosts } from "./ghostSystem.js";
import { updateVillains } from "./villainSystem.js";

export async function updateMovement(world, deltaTime) {
    const { gameState } = world;

    if (
        gameState.mode === 'PAUSED' ||
        gameState.mode === 'MENU' ||
        gameState.mode === 'GAME_OVER' ||
        gameState.mode === 'COUNTDOWN'
    ) {
        return { shouldInterruptFrame: true }
    }

    updatePlayer(world, deltaTime)

    if (gameState.mode === GAME_MODES.CLASSIC) {
        updateGhosts(world, deltaTime)
    }

    if (gameState.mode === GAME_MODES.SPACE) {
        updateVillains(world, deltaTime)
    }

    return { shouldInterruptFrame: false }
}