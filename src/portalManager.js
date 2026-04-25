import { gameState } from "./gameState.js";
import { circleCollidesWithRectangle } from "./collision.js";
import { classicConfig } from "./classicLevel.js";
import { spaceConfig } from "./spaceLevel.js";
import { changeLevel } from "./levelManager.js";

export const portalState = {
    portalBoundary: null,
    portalTimer: null,
    portalClosingTimer: null,
    exitPortalInterval: null
};

export function openRandomPortal(boundaries) {
    if (portalState.portalBoundary) {
        portalState.portalBoundary.isPortal = false;
    }

    const candidates = boundaries.filter(b => b.type === 'block');

    if (candidates.length > 0) {
        const randomIndex = Math.floor(Math.random() * candidates.length);
        const selectedBoundary = candidates[randomIndex];

        selectedBoundary.isPortal = true;
        portalState.portalBoundary = selectedBoundary;

        portalState.portalClosingTimer = setTimeout(() => {
            if (selectedBoundary === portalState.portalBoundary) {
                selectedBoundary.isPortal = false;
                portalState.portalBoundary = null;
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
    clearInterval(portalState.exitPortalInterval);

    portalState.exitPortalInterval = null;

    if (portalState.portalBoundary) {
        portalState.portalBoundary.isPortal = false;
        portalState.portalBoundary = null;
    }
}

export function checkPortalCollision(player, boundaries) {
    if (player.physicsMode === 'SPACE' || gameState.hasVisitedExtraLevel) return null;
    
    const activePortal = boundaries.find(b => b.isPortal);
    if (activePortal && circleCollidesWithRectangle({ circle: {
        ...player,
        velocity: { x: 0, y: 0}
     },
     rectangle: activePortal})) {
        return activePortal;
    }
    return null;
}

export function handlePortalEntry(world) {

    // Markera att spelaren har besökt bonusbanan så att vi inte triggar portaler igen
    gameState.hasVisitedExtraLevel = true;

    // Byt till rymdbanan
    changeLevel(spaceConfig, world);

    return true;
}

// Funktion som öppnar portal i rymdbanan
function openExitPortal(pellets) {
    const dangerousPellets = pellets.filter(p => p.isDangerous)

    if (dangerousPellets.length === 0) return

    const random = dangerousPellets[Math.floor(Math.random() * dangerousPellets.length)]

    random.isPortal = true

    random.portalTimer = setTimeout(() => {
        random.isPortal = false
    }, 3000)
}

// Funktion för portal timer i rymdbanan
export function startExitPortalLoop(player, pellets) {
    clearInterval(portalState.exitPortalInterval)

    portalState.exitPortalInterval = setInterval(() => {
        if (player.physicsMode === 'SPACE') {
            openExitPortal(pellets);
        } else {
            clearInterval(portalState.exitPortalInterval);
            portalState.exitPortalInterval = null
        }
    }, Math.random() * 7000 + 8000);
}
