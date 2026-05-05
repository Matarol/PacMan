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

export function openRandomPortal(world) {
    if (portalState.portalBoundary) {
        portalState.portalBoundary.isPortal = false;
    }

    const candidates = world.entities.filter(e => e.type === 'boundary' && e.boundaryType === 'block');

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

export function triggerPortalTimer(world) {
    if (gameState.hasVisitedExtraLevel) return;

    clearTimeout(portalState.portalTimer);

    if (gameState.gameRunning) {
        openRandomPortal(world);
        const nextTick = Math.random() * 10000 + 10000;
        portalState.portalTimer = setTimeout(() => triggerPortalTimer(world), nextTick);
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

export function checkPortalCollision(world) {
    const player = world.entities.find(e => e.type === 'player');
    if (!player) return null;

    if (player.physicsMode === 'SPACE' || gameState.hasVisitedExtraLevel) return null;
    
    const activePortal = world.entities.find(e => e.type === 'boundary' && e.isPortal);
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
function openExitPortal(world) {
    const pellets = world.entities.filter(e => e.type === 'pellet');
    const dangerousPellets = pellets.filter(p => p.isDangerous)

    if (dangerousPellets.length === 0) return

    const random = dangerousPellets[Math.floor(Math.random() * dangerousPellets.length)]

    random.isPortal = true

    random.portalTimer = setTimeout(() => {
        random.isPortal = false
    }, 3000)
}

// Funktion för portal timer i rymdbanan
export function startExitPortalLoop(world) {
    clearInterval(portalState.exitPortalInterval)

    portalState.exitPortalInterval = setInterval(() => {
        const player = world.entities.find(e => e.type === 'player');

        if (player.physicsMode === 'SPACE') {
            openExitPortal(world);
        } else {
            clearInterval(portalState.exitPortalInterval);
            portalState.exitPortalInterval = null
        }
    }, Math.random() * 7000 + 8000);
}
