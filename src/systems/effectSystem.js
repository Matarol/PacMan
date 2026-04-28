export function updateEffects(world) {
    const effects = world.activeEffects;

    effects.forEach((effect, index) => {
        if (effect.opacity <= 0) {
            effects.splice(index, 1);
        } else {
            effect.update();
        };
    });
};