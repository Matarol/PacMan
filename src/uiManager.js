const scoreEl = document.getElementById('scoreEl');
const streakScoreEl = document.getElementById('streakScoreEl');
const highScoreEl = document.getElementById('highScoreEl');
const healthBar = document.getElementById('healthBar');
const uiOverlay = document.getElementById('ui-overlay');

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



