import { playSound } from "./audioManager.js"
import { circleCollidesWithCircle } from "./collision.js"

export const GAME_MODES = {
    MENU: 'MENU',
    CLASSIC: 'CLASSIC',
    SPACE: 'SPACE',
    PAUSED: 'PAUSED',
    COUNTDOWN: 'COUNTDOWN',
    GAME_OVER: 'GAME_OVER'
}

export const gameState = {
    mode: GAME_MODES.MENU,
    hasVisitedExtraLevel: false,
    health: 100,
    maxHealth: 100,
    gameRunning: false,
    currentLevel: 'CLASSIC',
    countdownValue: 0,
    nextModeAfterCountdown: null,
    animationId: null,
    score: 0,
    streakScore: 0,
    highScore: localStorage.getItem('pacman-highscore') || 0,
    lastDamageTime: 0
}

export function resolvePlayerGhostCollision(player, ghosts) {

    for (let i = ghosts.length -1; i >= 0; i--) {
         const ghost = ghosts[i]

        if (circleCollidesWithCircle(player, ghost)) {
            if (ghost.scared) {
                playSound('eat-ghost')
                ghosts.splice(i, 1)
                return { result: 'ghost_eaten' }
            } else {
                return { result: 'player_dead' }
            }
        }        
    }

    return { result: null }
}

export function checkWin(world) {
    const { pellets } = world;

    if (!pellets || pellets.length === 0) return true;
    
    // Vi filtrerar bort allt som inte är en vanlig mat-pellet.
    // Vi vill bara vinna om de klassiska, icke-farliga pelletsen är slut.
    const normalPelletsLeft = pellets.filter(p => !p.isDangerous);

    return normalPelletsLeft === 0;
}

export function damagePlayer(amount, gameState) {
    const now = Date.now()

    //Cooldown
    if (now - gameState.lastDamageTime < 800) return { result: null }

    gameState.health -= amount
    playSound('damage-by-villain')
    gameState.lastDamageTime = now

    if (gameState.health <= 0) {
        gameState.health = 0
        return { result: 'player_dead' }
    }
    return { result: 'damaged' }
}