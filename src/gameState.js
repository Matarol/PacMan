import { circleCollidesWithCircle } from "./collision.js"

export const gameState = {
    hasVisitedExtraLevel: false,
    health: 100,
    maxHealth: 100,
    lastDamageTime: 0
}

export function resolvePlayerGhostCollision(player, ghosts) {

    for (let i = ghosts.length -1; i >= 0; i--) {
         const ghost = ghosts[i]

        if (circleCollidesWithCircle(player, ghost)) {
            if (ghost.scared) {
                ghosts.splice(i, 1)
                return { result: 'ghost_eaten' }
            } else {
                return { result: 'player_dead' }
            }
        }        
    }

    return { result: null }
}

export function checkWin(pellets) {
    return !pellets.some(p => !p.isDangerous)
}