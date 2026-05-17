import { buildClassicMap } from "./classicMap.js"
import { addEntity } from "./utils/entityHelpers.js"
import { Boundary } from "./boundary.js"
import { createGhost } from "./factories/ghostFactory.js"

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
        const ghost1 = createGhost({
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
        
                const ghost2 = createGhost({
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
                const ghost3 = createGhost({
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