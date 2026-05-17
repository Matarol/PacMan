import { updateClassicMode, updateSpaceMode } from "../gameLoopController.js";
import { GAME_MODES } from "../gameState.js";

export async function updateMovement(world, deltaTime) {

    const { gameState, directionState, actions } = world;

    switch (gameState.mode) {
        case GAME_MODES.CLASSIC: {
            const result = updateClassicMode(world, deltaTime);

            return {
                shouldInterruptFrame: false,
            };
        }

        case GAME_MODES.SPACE:
            await updateSpaceMode(
                world,
                deltaTime,
                actions.returnToMainMap,
                actions.handleGameOver,
                actions.showMenu
            );

            return {
                shouldInterruptFrame: false,
                currentDirection: directionState.currentDirection,
                nextDirection: directionState.nextDirection
            };

        case GAME_MODES.PAUSED:
        case GAME_MODES.MENU:
        case GAME_MODES.GAME_OVER:
            return {
                shouldInterruptFrame: true,
                currentDirection: directionState.currentDirection,
                nextDirection: directionState.nextDirection
            };

        default:
            return {
                shouldInterruptFrame: false,
                currentDirection: directionState.currentDirection,
                nextDirection: directionState.nextDirection
            };

    }
}