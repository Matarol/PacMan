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

export function updateItems(world, callbacks) {
    if (!world || !world.player) return;
    const { player, pellets, powerUps, ghosts, villains, gameState, scoreEl } = world;
    const { damagePlayer, returnToMainMap } = callbacks;

    // Spelare krockar med powerUps
    for (let i = powerUps.length - 1; i >= 0; i-- ) {
        const powerUp = powerUps[i]

        if (circleCollidesWithCircle(powerUp, player)) {
            if (player.physicsMode === 'SPACE' && villains && villains.length > 0) {
                playSound('power-up')
                powerUps.splice(i, 1)
                removeEntity(powerUp, world)
                villains.forEach(v => {
                    if (!v) return
                    shrunkenVillain(v)
                })
            } else {
                playSound('power-up')
                powerUps.splice(i, 1)
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
                const result = damagePlayer(10, gameState)
                pellets.splice(i, 1)
                removeEntity(pellet, world)
                return { result: 'player_damaged' }

            }

            let points = 10 //poäng i classicLevel

            if (player.physicsMode === 'SPACE') {
                points = 100
            }
            
            playSound('eat-pellet')
            pellets.splice(i, 1)
            removeEntity(pellet, world)
            gameState.score += points
            scoreEl.innerText = gameState.score
        }
    }
}