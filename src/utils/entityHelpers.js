export function addEntity(world, entity, legacyList = null) {
    if (legacyList && !legacyList.includes(entity)) {
        legacyList.push(entity);
    }

    if (!world.entities.includes(entity)) {
        world.entities.push(entity);
    }
}

export function removeEntity(world, entity) {
    const index = world.entities.indexOf(entity);
    if (index !== -1) {
        world.entities.splice(index, 1);
    }
}


