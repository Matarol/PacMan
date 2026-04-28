import { buildClassicMap } from "./classicMap.js"
import { Player } from "./player.js"
import { Ghost } from "./ghost.js"
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

export function initClassicLevel(world) {
    const { player, boundaries, pellets, powerUps, ghosts, winCount } = world
   
    
    buildClassicMap({ boundaries, pellets, powerUps })

    // Skapa spelaren
    if (player) {
        player.position.x = Boundary.width + Boundary.width / 2;
        player.position.y = Boundary.height + Boundary.height / 2;
        player.velocity.x = 0;
        player.velocity.y = 0;
    }

    if (ghosts.length === 0) {
        ghosts.push(new Ghost({
                    position: {
                        x: 6 * Boundary.width + Boundary.width / 2,
                        y: Boundary.height + Boundary.height / 2
                    },
                    velocity: {
                        x: Ghost.speed,
                        y: 0
                    }
                }),
        
                new Ghost({
                    position: {
                        x: 6 * Boundary.width + Boundary.width / 2,
                        y: 3 * Boundary.height + Boundary.height / 2
                    },
                    velocity: {
                        x: Ghost.speed,
                        y: 0
                    },
                    color: 'red'
                }))
        
                if (winCount > 1) {
                ghosts.push(
                    new Ghost({
                    position: {
                        x: 6 * Boundary.width + Boundary.width / 2,
                        y: 5 * Boundary.height + Boundary.height / 2
                    },
                    velocity: {
                        x: Ghost.speed,
                        y: 0
                    },
                    color: 'pink'
                })    
                )
            }
        }   

}