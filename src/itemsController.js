import { circleCollidesWithCircle } from "./collision.js"
import { scareGhosts } from "./ghostController.js"
import { shrunkenVillain } from "./villainController.js"
import { playSound } from "./audioManager.js"

export function updateItems(world) {
    const { player, pellets, powerUps, ghosts, villains, returnToMainMap, damagePlayer, gameState } = world;
    const scoreEl = document.getElementById('scoreEl')

    // Spelare krockar med powerUps
    for (let i = powerUps.length - 1; i >= 0; i-- ) {
        const powerUp = powerUps[i]

        if (circleCollidesWithCircle(powerUp, player)) {
            if (player.physicsMode === 'SPACE' && villains && villains.length > 0) {
                playSound('power-up')
                powerUps.splice(i, 1)
                villains.forEach(v => {
                    if (!v) return
                    shrunkenVillain(v)
                })
            } else {
                playSound('power-up')
                powerUps.splice(i, 1)

            //Spöken blir skrämda
            scareGhosts(ghosts)
            }
        }
    }

    // Krockar med pellets
    for (let i = pellets.length - 1; i >= 0; i-- ) {
        const pellet = pellets[i]

        if (circleCollidesWithCircle(pellet, player)) {
            if (pellet.isPortal) {
                playSound('portal')
                returnToMainMap()
                return { result: 'level_changed' }
            }

            if (pellet.isDangerous) {
                const result = damagePlayer(10, gameState)
                pellets.splice(i, 1)
                return { result: 'player_damaged' }

            }

            let points = 10 //poäng i classicLevel

            if (player.physicsMode === 'SPACE') {
                points = 100
            }
            
            playSound('eat-pellet')
            pellets.splice(i, 1)
            gameState.score += points
            scoreEl.innerText = gameState.score
        }
    }
}