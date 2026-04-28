import { checkPortalCollision, handlePortalEntry } from "../portalManager.js";

export function updatePortals(world) {
    const didCollide = checkPortalCollision(world.player, world.boundaries);

    if (didCollide) {
        handlePortalEntry(world);
    }

    return { didCollide, shouldInteruptFrame: didCollide };
}