import { gameState } from "./gameState.js";
import { circleCollidesWithRectangle } from "./collision.js";

export const portalState = {
    portalBoundary: null,
    portalTimer: null,
    portalClosingTimer: null
};

export function openRandomPortal(boundaries) {
    //Återställ eventuell gammal portal
    if (portalState.portalBoundary) {
        portalState.portalBoundary.isPortal = false;
    }

    const candidates = boundaries.filter(b => b.type === 'block');

    if (candidates.length > 0) {
        const randomIndex = Math.floor(Math.random() * candidates.length);
        const selectedBoundary = candidates[randomIndex];

        selectedBoundary.isPortal = true;
        portalState.portalBoundary = selectedBoundary;

        console.log('En portal har öppnats')

        portalState.portalClosingTimer = setTimeout(() => {
            if (selectedBoundary === portalState.portalBoundary) {
                selectedBoundary.isPortal = false;
                portalState.portalBoundary = null;
                console.log('Portalen har stängts');
            }
        }, 5000);
    }
}

export function triggerPortalTimer(boundaries) {
    if (gameState.hasVisitedExtraLevel) return;

    clearTimeout(portalState.portalTimer);

    if (gameState.gameRunning) {
        openRandomPortal(boundaries);
        const nextTick = Math.random() * 10000 + 10000;
        portalState.portalTimer = setTimeout(() => triggerPortalTimer(boundaries), nextTick);
    }
}

export function clearPortalTimers() {
    clearTimeout(portalState.portalTimer);
    clearTimeout(portalState.portalClosingTimer);

    if (portalState.portalBoundary) {
        portalState.portalBoundary.isPortal = false;
        portalState.portalBoundary = null;
    }
}

export function checkPortalCollision(player, boundaries) {
    if (player.physicsMode === 'SPACE' || gameState.hasVisitedExtraLevel) return null;
    
    const activePortal = boundaries.find(b => b.isPortal);
    if (activePortal && circleCollidesWithRectangle({ circle: player, rectangle: activePortal})) {
        return activePortal;
    }
    return null;
}