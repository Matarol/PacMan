import { Ghost } from './ghost.js'
import { Pellet } from './items.js'

export const levelState = {
    savedPositions: {
        player: null,
        ghosts: [],
        pellets: [],
        villains: []
    }
};

// Hjälpfunktion för att nollställa banan
function clearCurrentLevel(world) {
    world.pellets.length = 0;
    world.powerUps.length = 0;
    world.boundaries.length = 0;
    world.ghosts.length = 0;
    if (world.villains) world.villains.length = 0;
}

// Hjälpfunktion som hittar grid-position för character som återkommer till klassiska banan
function snapToGrid(position) {
    const gridSize = 40;
    return {
        x: Math.floor(position.x / gridSize) * gridSize + gridSize / 2,
        y: Math.floor(position.y / gridSize) * gridSize + gridSize / 2
    };
}

// Generisk funktion för banbyten
export function changeLevel(config, world) {

    if (config.saveCurrent) {
        saveCurrentLevelState(world.player, world.ghosts, world.pellets, world.villains);
    }

    // Rensa banan innan vi laddar nästa
    clearCurrentLevel(world);

    // Ladda eller initiera nästa nivå
    if (config.useRestore) {
        restoreLevel(config, world);
    } else {
        config.initLevel(world);
    }

    // Uppdatera gameState
    world.gameState.currentLevel = config.levelName;
    world.gameState.mode = config.targetMode;
}

/**
 * Sparar ner tillståndet från den aktuella nivån innan vi byter
 */
export function saveCurrentLevelState(player, ghosts, pellets, villains = []) {
    levelState.savedPositions.player = { ...player.position };    
    levelState.savedPositions.ghosts = ghosts.map(g => ({
        x: g.position.x,
        y: g.position.y,
        velocity: { ...g.velocity },
        color: g.color
    }));

    levelState.savedPositions.pellets = pellets.map(p => ({
        x: p.position.x,
        y: p.position.y,
        isDangerous: p.isDangerous
    }));

    levelState.savedPositions.villains = [...villains];
}

/**
 * En helt generisk återställare
 */
// levelManager.js

function restoreLevel(config, world) {
    const { player, ghosts, pellets, villains, c, gameState } = world;
    const { savedPositions } = levelState;

    config.initLevel(world); // För att bygga upp banan och placera ut saker på rätt ställen

    // Återställ kartan smart
    if (savedPositions.pellets.length > 0) {
        pellets.length = 0; // Rensa ut de som initLevel lade dit
        
        savedPositions.pellets.forEach(data => {
            pellets.push(new Pellet({
                position: { x: data.x, y: data.y },
                context: c,
                isDangerous: data.isDangerous
            }));
        });    
    }

    // Återställ spöken
    if (savedPositions.ghosts.length > 0) {
        savedPositions.ghosts.forEach(data => {
            ghosts.push(new Ghost({
                position: { x: data.x, y: data.y },
                velocity: { x: data.velocity.x, y: data.velocity.y },
                color: data.color,
                context: c
            }));
        });
    }

    // Återställ skurkar
    if (savedPositions.villains.length > 0) {
        savedPositions.villains.forEach(v => villains.push(v));
    }
    
    // Återställ spelaren
    if (savedPositions.player) {
        const snappedPosition = snapToGrid(savedPositions.player);
        player.position.x = snappedPosition.x;
        player.position.y = snappedPosition.y;
    }

    // 1. Nollställ hastigheten helt (så han inte "glider" in i en vägg direkt)
    player.velocity.x = 0;
    player.velocity.y = 0;

    // 2. Återställ rotationen/vinkeln (viktigt för rendering och rörelse)
    // Om du använder 'rotation' eller 'angle', sätt den till 0 eller en fast riktning
    if (player.rotation !== undefined) player.rotation = 0; 

    // 3. Rensa riktnings-köerna så han inte försöker svänga direkt
    // Beroende på vad dina variabler heter i game.js/player.js
    player.direction = '';      // Eller 'left'/'right' etc.
    player.nextDirection = ''; 

    // 4. Se till att han betraktas som CLASSIC igen
    player.physicsMode = 'CLASSIC';
    gameState.currentLevel = 'CLASSIC';

}