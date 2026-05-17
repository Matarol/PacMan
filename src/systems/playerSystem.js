import { getPlayer } from "../utils/entitySelectors.js";

export function updatePlayer(world, deltaTime) {
    const player = getPlayer(world);

    player.position.x += player.velocity.x * deltaTime;
    player.position.y += player.velocity.y * deltaTime;

    //mun animation
    if (player.radians < 0 || player.radians > 0.75) {
        player.openRate = -player.openRate
        }
    player.radians += player.openRate

    // ögon riktning
    if (player.velocity.x > 0) {
        player.eyesOffsetX = 3
        player.eyesOffsetY = -6
    }

    if (player.velocity.x < 0) {
        player.eyesOffsetX = -3
        player.eyesOffsetY = -6
    }

    if (player.velocity.y > 0) {
        player.eyesOffsetX = 6
        player.eyesOffsetY = 3
    }

    if (player.velocity.y < 0) {
        player.eyesOffsetX = -6
        player.eyesOffsetY = -3
    }
}