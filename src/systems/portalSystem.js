import { getBoundaries } from "../utils/entitySelectors.js";
import { checkPortalCollision, handlePortalEntry } from "../portalManager.js";

export function updatePortals(world) {
    const boundaries = getBoundaries(world);
    const didCollide = checkPortalCollision(world);

    if (didCollide) {
        handlePortalEntry(world);
    }

    return { didCollide, shouldInterruptFrame: didCollide };
}