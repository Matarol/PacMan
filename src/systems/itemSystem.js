import {
    getGhosts,
    getVillains,
    getPellets,
    getPlayer,
    getPowerUps
} from "../utils/entitySelectors.js";
import { removeEntity } from "../utils/entityHelpers.js";
import { circleCollidesWithCircle } from "../collision.js"
import { scareGhosts } from "./ghostSystem.js"
import { shrunkenVillain } from "./villainSystem.js"
import { playSound } from "../audioManager.js"
import { changeLevel } from "../levelManager.js";
import { classicConfig } from "../classicLevel.js";

export function updateItemSystem(world) {
    const result = updateItems(world);

    const shouldUpdateUI = result?.result === 'player_damaged';

    // const shouldReturnToMainMap = result?.result === 'return_to_main_map';

    return {
        raw: result,
        shouldUpdateUI
    };
}

function updateItems(world) {
    const player = getPlayer(world);
    if (!world || !player) return { result: null };
    const pellets = getPellets(world);
    const powerUps = getPowerUps(world);
    const ghosts = getGhosts(world);
    const villains = getVillains(world);

    const { gameState, scoreEl, actions } = world;
    
    const { damagePlayer } = actions;

    // Spelare krockar med powerUps
    for (let i = powerUps.length - 1; i >= 0; i-- ) {
        const powerUp = powerUps[i]

        if (circleCollidesWithCircle(powerUp, player)) {
            if (player.physicsMode === 'SPACE' && villains && villains.length > 0) {
                playSound('power-up')
                removeEntity(world, powerUp)
                villains.forEach(v => {
                    if (!v) return
                    shrunkenVillain(world, v)
                })
            } else {
                playSound('power-up')
                removeEntity(world, powerUp)
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
                changeLevel(classicConfig, world)
                return { result: 'level_changed' }
            }

            if (pellet.isDangerous) {
                damagePlayer(10)
                removeEntity(world, pellet)
                return { result: 'player_damaged' }

            }

            let points = 10 //poäng i classicLevel

            if (player.physicsMode === 'SPACE') {
                points = 100
            }
            
            playSound('eat-pellet')
            removeEntity(world, pellet)
            gameState.score += points
            scoreEl.innerText = gameState.score
        }
    }
    return { result: null }
}