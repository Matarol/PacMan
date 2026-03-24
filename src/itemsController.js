import { circleCollidesWithCircle } from "./collision.js"
import { scareGhosts } from "./ghostController.js"

export function updateItems({player, pellets, powerUps, ghosts, score, scoreEl}) {

    // Spelare krockar med powerUps
    for (let i = powerUps.length - 1; i >= 0; i-- ) {
        const powerUp = powerUps[i]
        powerUp.draw()

        if (circleCollidesWithCircle(powerUp, player)) {
            powerUps.splice(i, 1)

            //Spöken blir skrämda
            scareGhosts(ghosts)
        }
    }

    // Krockar med pellets
    for (let i = pellets.length - 1; 0 <= i; i-- ) {
        const pellet = pellets[i]
    
        pellet.draw()

        if (circleCollidesWithCircle(pellet, player)) {
            pellets.splice(i, 1)
            score.value += 10
            scoreEl.innerText = score.value
        }
    }

}