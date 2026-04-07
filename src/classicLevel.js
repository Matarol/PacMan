import { buildClassicMap } from "./classicMap.js"
import { Player } from "./player.js"

export function initClassicLevel({ player, boundaries, pellets, powerUps, ghosts, keys, animate }) {
    boundaries.length = 0
    pellets.length = 0
    powerUps.length = 0
    ghosts.length = 0

    buildClassicMap({ boundaries, pellets, powerUps })

    // Skapa spelaren
    if (player) {
        player.position.x = 40
        player.position.y = 40
    }

}