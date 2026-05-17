import {
    getGhosts,
    getVillains,
    getPellets,
    getPlayer,
    getPowerUps
} from "./utils/entitySelectors.js";
import { circleCollidesWithCircle } from "./collision.js"
import { scareGhosts } from "./ghostController.js"
import { shrunkenVillain } from "./villainController.js"
import { playSound } from "./audioManager.js"
import { changeLevel } from "./levelManager.js";
import { classicConfig } from "./classicLevel.js";

export function removeEntity(entity, world) {
    const index = world.entities.indexOf(entity);

    if (index !== -1) {
        world.entities.splice(index, 1);
    }
}

export function updateItems(world) {
    const player = getPlayer(world);
    if (!world || !player) return;
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
                removeEntity(powerUp, world)
                villains.forEach(v => {
                    if (!v) return
                    shrunkenVillain(v)
                })
            } else {
                playSound('power-up')
                removeEntity(powerUp, world)
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
                const result = damagePlayer(10)
                removeEntity(pellet, world)
                return { result: 'player_damaged' }

            }

            let points = 10 //poäng i classicLevel

            if (player.physicsMode === 'SPACE') {
                points = 100
            }
            
            playSound('eat-pellet')
            removeEntity(pellet, world)
            gameState.score += points
            scoreEl.innerText = gameState.score
        }
    }
    return { result: null }
}