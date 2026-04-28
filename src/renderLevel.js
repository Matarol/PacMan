export function renderLevel(world) {

    const { c, canvas, player, ghosts, villains, pellets, powerUps, boundaries, activeEffects } = world;

    if (!player) return
    
    // 1. HANTERA BAKGRUND (Rensa skärmen)
    if (player.physicsMode === 'SPACE') {
        canvas.classList.add('space-background');
        c.clearRect(0, 0, canvas.width, canvas.height);        
    } else {
        canvas.classList.remove('space-background');
        // Klassiskt läge: Rensa allt helt
        c.clearRect(0, 0, canvas.width, canvas.height);
    }

    // 2. RITA ALLT I RÄTT ORDNING (Lager)
    
    // Lager 1: Banan (Väggar/Portaler/Asteroider)
    boundaries.forEach(boundary => boundary.draw(c));

    // Lager 2: Små-saker (Pellets/Powerups)
    pellets.forEach(pellet => pellet.draw(c));
    powerUps.forEach(powerUp => powerUp.draw(c));

    // Lager 3: Entiteter (Spelare/Spöken/Skurkar)
    ghosts.forEach(ghost => ghost.draw(c));
    if (villains) villains.forEach(villain => villain.draw(c));
    player.draw(c);

    // Lager 4: UI-effekter (Flytande poängtexter etc.)
    if (activeEffects) {
        activeEffects.forEach(effect => effect.draw(c));
    }
}