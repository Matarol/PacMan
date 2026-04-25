import { buildClassicMap } from "./classicMap.js"
import { Player } from "./player.js"
import { Boundary } from "./boundary.js"
import { Pellet } from "./items.js"
import { Villain } from "./villain.js"
import { levelState } from "./levelManager.js"

// Konfiguration för klassiska banan
export const classicConfig = {
    levelName: 'CLASSIC',
    targetMode: 'CLASSIC',
    useRestore: true, // När man återvänder till klassiska banan från bonusbana vill vi återställa den till det skick den var i
    saveCurrent: false, // Current är en bonusbana, så vi vill inte spara dess tillstånd när vi lämnar den
    initLevel: initClassicLevel    
}

export function initClassicLevel({ player, boundaries, pellets, powerUps, ghosts, keys, animate }) {
    boundaries.length = 0
    if (pellets) pellets.length = 0
    powerUps.length = 0
    ghosts.length = 0

    buildClassicMap({ boundaries, pellets, powerUps })

    // Skapa spelaren
    if (player) {
        player.position.x = 60
        player.position.y = 60
    }

}