import { circleCollidesWithCircle } from "./collision.js"
import { scareGhosts } from "./ghostController.js"
import { shrunkenVillain } from "./villainController.js"

export function updateItems({player, pellets, powerUps, ghosts, villains, score, scoreEl, returnToMainMap, damagePlayer, gameState}) {  

    // Spelare krockar med powerUps
    for (let i = powerUps.length - 1; i >= 0; i-- ) {
        const powerUp = powerUps[i]
        powerUp.draw()

        if (circleCollidesWithCircle(powerUp, player)) {
            if (player.physicsMode === 'SPACE') {
                powerUps.splice(i, 1)
                villains.forEach(v =>  shrunkenVillain(v))
            } else {
            powerUps.splice(i, 1)

            //Spöken blir skrämda
            scareGhosts(ghosts)
            }
        }
    }

    // Krockar med pellets
    for (let i = pellets.length - 1; 0 <= i; i-- ) {
        const pellet = pellets[i]
    
        pellet.draw()

        if (circleCollidesWithCircle(pellet, player)) {
            if (pellet.isPortal) {
                returnToMainMap()
                continue
            }

            if (pellet.isDangerous) {
                const result = damagePlayer(10, gameState)
                pellets.splice(i, 1)
                return { result: 'player_damaged' }

            }
            
            pellets.splice(i, 1)
            score.value += 10
            scoreEl.innerText = score.value
        }
    }

}