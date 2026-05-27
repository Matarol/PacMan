import { buildClassicMap } from "./classicMap.js"
import { addEntity } from "./utils/entityHelpers.js"
import { createGhost } from "./factories/ghostFactory.js"
import { TILE_SIZE } from "./constants/gameConstants.js"

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
        player.position.x = TILE_SIZE + TILE_SIZE / 2;
        player.position.y = TILE_SIZE + TILE_SIZE / 2;
        player.velocity.x = 0;
        player.velocity.y = 0;
    }

    if (ghosts.length === 0) {
        const ghost1 = createGhost({
                    position: {
                        x: 6 * TILE_SIZE + TILE_SIZE / 2,
                        y: TILE_SIZE + TILE_SIZE / 2
                    },
                    velocity: {
                        x: 0,
                        y: 0
                    }
                })
                addEntity(world, ghost1);
        
                const ghost2 = createGhost({
                    position: {
                        x: 6 * TILE_SIZE + TILE_SIZE / 2,
                        y: 3 * TILE_SIZE + TILE_SIZE / 2
                    },
                    velocity: {
                        x: 0,
                        y: 0
                    },
                    color: 'red'
                })
                addEntity(world, ghost2);
        
                if (winCount > 1) {
                const ghost3 = createGhost({
                    position: {
                        x: 6 * TILE_SIZE + TILE_SIZE / 2,
                        y: 5 * TILE_SIZE + TILE_SIZE / 2
                    },
                    velocity: {
                        x: 0,
                        y: 0
                    },
                    color: 'pink'
                })    
                addEntity(world, ghost3);
            }
        }
}