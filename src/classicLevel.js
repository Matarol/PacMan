import { buildClassicMap } from "./classicMap.js"
import { addEntity } from "./utils/entityHelpers.js"
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
    const { player, winCount } = world
    const boundaries = world.entities.filter(e => e.type === 'boundary');
    const powerUps = world.entities.filter(e => e.type === 'powerUp');
    const ghosts = world.entities.filter(e => e.type === 'ghost');
   
    
    buildClassicMap(world);

    // Skapa spelaren
    if (player) {
        player.position.x = Boundary.width + Boundary.width / 2;
        player.position.y = Boundary.height + Boundary.height / 2;
        player.velocity.x = 0;
        player.velocity.y = 0;
    }

    if (ghosts.length === 0) {
        const ghost1 = new Ghost({
                    position: {
                        x: 6 * Boundary.width + Boundary.width / 2,
                        y: Boundary.height + Boundary.height / 2
                    },
                    velocity: {
                        x: 0,
                        y: 0
                    }
                })
                addEntity(world, ghost1, ghosts);
        
                const ghost2 = new Ghost({
                    position: {
                        x: 6 * Boundary.width + Boundary.width / 2,
                        y: 3 * Boundary.height + Boundary.height / 2
                    },
                    velocity: {
                        x: 0,
                        y: 0
                    },
                    color: 'red'
                })
                addEntity(world, ghost2, ghosts);
        
                if (winCount > 1) {
                const ghost3 = new Ghost({
                    position: {
                        x: 6 * Boundary.width + Boundary.width / 2,
                        y: 5 * Boundary.height + Boundary.height / 2
                    },
                    velocity: {
                        x: 0,
                        y: 0
                    },
                    color: 'pink'
                })    
                addEntity(world, ghost3, ghosts);
            }
        }
}