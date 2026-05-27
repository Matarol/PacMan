import { GAME_MODES } from "../gameState.js";
import { updatePlayer } from "./playerSystem.js";
import { updateGhosts } from "./ghostSystem.js";
import { updateVillains } from "./villainSystem.js";

export async function updateMovement(world, deltaTime) {
    const { gameState } = world;

    if (
        gameState.mode === GAME_MODES.PAUSED ||
        gameState.mode === GAME_MODES.MENU ||
        gameState.mode === GAME_MODES.GAME_OVER ||
        gameState.mode === GAME_MODES.COUNTDOWN
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