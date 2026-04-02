// renderLevel.js
export function renderLevel({ c, canvas, player, ghosts, villains, pellets, powerUps, boundaries, activeEffects }) {
    
    // 1. HANTERA BAKGRUND (Rensa skärmen)
    if (player.physicsMode === 'SPACE') {
        canvas.classList.add('space-background');
        c.clearRect(0, 0, canvas.width, canvas.height);
        // Skapar motion blur: ritar en nästan genomskinlig rektangel över föregående frame
        c.fillStyle = 'black'; 
        c.fillRect(0, 0, canvas.width, canvas.height);
    } else {
        canvas.classList.remove('space-background');
        // Klassiskt läge: Rensa allt helt
        c.clearRect(0, 0, canvas.width, canvas.height);
    }

    // 2. RITA ALLT I RÄTT ORDNING (Lager)
    
    // Lager 1: Banan (Väggar/Portaler/Asteroider)
    boundaries.forEach(boundary => boundary.draw());

    // Lager 2: Små-saker (Pellets/Powerups)
    pellets.forEach(pellet => pellet.draw());
    powerUps.forEach(powerUp => powerUp.draw());

    // Lager 3: Entiteter (Spelare/Spöken/Skurkar)
    ghosts.forEach(ghost => ghost.draw());
    if (villains) villains.forEach(villain => villain.draw());
    player.draw();

    // Lager 4: UI-effekter (Flytande poängtexter etc.)
    if (activeEffects) {
        activeEffects.forEach(effect => effect.draw(c));
    }
}