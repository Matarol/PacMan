import { checkPortalCollision, handlePortalEntry } from "../portalManager.js";

export function updatePortals(world) {
    const boundaries = world.entities.filter(e => e.type === 'boundary');
    const didCollide = checkPortalCollision(world);

    if (didCollide) {
        handlePortalEntry(world);
    }

    return { didCollide, shouldInteruptFrame: didCollide };
}