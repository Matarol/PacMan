import { circleCollidesWithCircle } from "./collision.js"
import { scareGhosts } from "./ghostController.js"
import { shrunkenVillain } from "./villainController.js"

export function updateItems({player, pellets, powerUps, ghosts, villains, scoreEl, returnToMainMap, damagePlayer, gameState}) {  

    // Spelare krockar med powerUps
    for (let i = powerUps.length - 1; i >= 0; i-- ) {
        const powerUp = powerUps[i]

        if (circleCollidesWithCircle(powerUp, player)) {
            if (player.physicsMode === 'SPACE' && villains && villains.length > 0) {
                powerUps.splice(i, 1)
                villains.forEach(v => {
                    if (!v) return
                    shrunkenVillain(v)
                })
            } else {
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
                returnToMainMap()
                return { result: 'level_changed' }
            }

            if (pellet.isDangerous) {
                const result = damagePlayer(10, gameState)
                pellets.splice(i, 1)
                return { result: 'player_damaged' }

            }
            
            pellets.splice(i, 1)
            gameState.score += 10
            scoreEl.innerText = gameState.score
        }
    }

}