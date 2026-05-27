import { TILE_SIZE } from "./constants/gameConstants.js";
import { getBoundaries, getPellets, getPowerUps } from "./utils/entitySelectors.js";

const scoreEl = document.getElementById('scoreEl');
const streakScoreEl = document.getElementById('streakScoreEl');
const highScoreEl = document.getElementById('highScoreEl');
const healthBar = document.getElementById('healthBar');
const uiOverlay = document.getElementById('ui-overlay');


//Ritar upp en statisk karta baserat på den klassiska layouten med syfte att synas bakom menyn
export async function drawStaticMap({ canvas, c, classicLayout, initClassicLevel }) {
    const dpr = window.devicePixelRatio || 1;

    const logicalWidth = classicLayout[0].length * TILE_SIZE;
    const logicalHeight = classicLayout.length * TILE_SIZE;

    const scale = Math.min(window.innerWidth / logicalWidth, 1);

    // 👉 CSS size (what user sees)
    canvas.style.width = logicalWidth * scale + "px";
    canvas.style.height = logicalHeight * scale + "px";

    // 👉 Actual pixel size
    canvas.width = logicalWidth * dpr;
    canvas.height = logicalHeight * dpr;

    // 👉 CRITICAL: reset + apply BOTH scales
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.scale(dpr * scale, dpr * scale);

    //För att rita upp statiska kartan behöver vi temporära listor som initieras av initClassicLevel

    const previewWorld = {
        entities: [],
        boundaries: [],
        powerUps: [],
        ghosts: [],
        player: null,
    };

    initClassicLevel(previewWorld);

    const tempBoundaries = getBoundaries(previewWorld);
    const tempPowerUps = getPowerUps(previewWorld);
    const tempPellets = getPellets(previewWorld);

    const imagePromises = tempBoundaries.map(b => b.image).filter(img => img instanceof HTMLImageElement).map(img => img.decode().catch(() => {}))

    await Promise.all(imagePromises)

    c.clearRect(0, 0, canvas.width, canvas.height)
    tempBoundaries.forEach(boundary => boundary.draw(c))
    tempPellets.forEach(pellet => pellet.draw(c))
    tempPowerUps.forEach(powerUp => powerUp.draw(c))

    return { logicalWidth, logicalHeight };
}

/**
 * Uppdaterar alla synliga mätare och texter baserat på speletes nuvarande tillstånd.
 */

export function updateUI(gameState) {
    if (scoreEl) scoreEl.innerText = gameState.score;
    if (streakScoreEl) streakScoreEl.innerText = gameState.streakScore;
    if (highScoreEl) highScoreEl.innerText = gameState.highScore;

    if (healthBar) {
        healthBar.style.width = gameState.health + '%';
        //Färglogik för hälsobaren
        if (gameState.health < 30) {
            healthBar.style.backgroundColor = 'red';
        } else healthBar.style.backgroundColor = 'lime';
    }
}

export function hideUIOverlay() {
    if (uiOverlay) uiOverlay.classList.add('hidden');
}

export function showUIOverlay() {
    if (uiOverlay) uiOverlay.classList.remove('hidden');
}



