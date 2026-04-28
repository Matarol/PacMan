import { updateItems } from "../itemsController.js";

export function updateItemSystem(world, actions) {
    const result = updateItems(world, actions);

    const shouldUpdateUI = result?.result === 'player_damaged'

    const shouldReturnToMainMap = result?.result === 'return_to_main_map'

    return {
        raw: result,
        shouldUpdateUI,
        shouldReturnToMainMap
    };
}