import { updateClassicMode, updateSpaceMode } from "../gameLoopController.js";
import { GAME_MODES, gameState } from "../gameState.js";

export async function updateMovement(
    world,
    gameState,
    deltaTime,
    directionState,
    actions
) {
    switch (gameState.mode) {
        case GAME_MODES.CLASSIC: {
            const result = updateClassicMode(
                world,
                directionState.currentDirection,
                directionState.nextDirection,
                deltaTime
            );

            return {
                shouldInteruptFrame: false,
                currentDirection: result.currentDirection,
                nextDirection: result.nextDirection
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
                shouldInteruptFrame: false,
                currentDirection: directionState.currentDirection,
                nextDirection: directionState.nextDirection
            };

        case GAME_MODES.PAUSED:
        case GAME_MODES.MENU:
        case GAME_MODES.GAME_OVER:
            return {
                shouldInteruptFrame: true,
                currentDirection: directionState.currentDirection,
                nextDirection: directionState.nextDirection
            };

        default:
            return {
                shouldInteruptFrame: false,
                currentDirection: directionState.currentDirection,
                nextDirection: directionState.nextDirection
            };

    }
}