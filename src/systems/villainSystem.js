import { getVillains } from "../utils/entitySelectors.js";

export function updateVillains(world, deltaTime) {
    const villains = getVillains(world);

    villains.forEach(villain => {
        if (!villain.position || !villain.velocity) return;

        villain.radius = villain.miniature ? 10 : 25

        villain.position.x += villain.velocity.x * deltaTime
        villain.position.y += villain.velocity.y * deltaTime

        if (villain.radians < 0 || villain.radians > 0.75) villain.openRate = -villain.openRate
        villain.radians += villain.openRate * deltaTime * 60

        if (villain.velocity.x > 0) {
            villain.eyesOffsetX = 3
            villain.eyesOffsetY = -6
        }

        if (villain.velocity.x < 0) {
            villain.eyesOffsetX = -3
            villain.eyesOffsetY = -6
        }

        if (villain.velocity.y > 0) {
            villain.eyesOffsetX = 6
            villain.eyesOffsetY = 3
        }

        if (villain.velocity.y < 0) {
            villain.eyesOffsetX = -6
            villain.eyesOffsetY = -3
        }
    })

}

