import { getGhosts, getPlayer } from "../utils/entitySelectors.js";

export function updateGhosts(world, deltaTime) {
    const ghosts = getGhosts(world);
    const player = getPlayer(world);

    ghosts.forEach(ghost => {
        if (!ghost.position || !ghost.velocity) return;
        if (ghost.timer > 0) {
            ghost.timer -= deltaTime * 60

            if (ghost.timer <= 0) {
                if (ghost.scared) {
                    ghost.scared = false
                    ghost.angry = true
                    ghost.timer = 600
                } else if (ghost.angry) {
                    ghost.angry = false
                }
            }
        }
        ghost.position.x += ghost.velocity.x * deltaTime
        ghost.position.y += ghost.velocity.y * deltaTime

        ghost.eyesOffsetX = 0
        ghost.eyesOffsetY = 0

        const maxPupilsOffset = 1.5

        if (ghost.angry && player?.position) {
            const dx = player.position.x - ghost.position.x
            const dy = player.position.y - ghost.position.y
            const angle = Math.atan2(dy, dx)
            ghost.eyesOffsetX = Math.cos(angle) * maxPupilsOffset
            ghost.eyesOffsetY = Math.sin(angle) * maxPupilsOffset
        }
        else if (!ghost.scared) {
            if (ghost.velocity.x > 0) ghost.eyesOffsetX = maxPupilsOffset
            else if (ghost.velocity.x < 0) ghost.eyesOffsetX = -maxPupilsOffset

            if (ghost.velocity.y > 0) ghost.eyesOffsetY = maxPupilsOffset
            else if (ghost.velocity.y < 0) ghost.eyesOffsetY = -maxPupilsOffset
        }
        
    })

}