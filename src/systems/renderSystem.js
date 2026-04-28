import { GAME_MODES } from "../gameState.js";
import { renderLevel } from "../renderLevel.js";

export function renderCountdown(world) {
    const { c, canvas, gameState } = world;

    c.save();
    c.setTransform(1, 0, 0, 1, 0, 0);
    
    c.font = '56px Arial';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillStyle = 'white';

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    c.fillText(
        gameState.countdownValue > 0 ? gameState.countdownValue : 'GO!',
        centerX,
        centerY
    );

    c.restore();
};

export function renderFrame(world) {
    renderLevel(world);

    if (world.gameState.mode === GAME_MODES.COUNTDOWN) {
        renderCountdown(world)
    }
}