import { addEntity } from './utils/entityHelpers.js';
import { getGhosts, getPellets, getPlayer, getPowerUps, getVillains } from './utils/entitySelectors.js';
import { createPellet } from './factories/pelletFactory.js';
import { createPowerUp } from './factories/powerUpFactory.js';
import { createGhost } from './factories/ghostFactory.js';

export const levelState = {
    savedPositions: {
        playerData: null,
        /** @type {any[]} */
        ghostsData: [],
        /** @type {any[]} */
        pelletsData: [],
        /** @type {any[]} */
        powerUpsData: [],
        /** @type {any[]} */
        villainsData: []
    }
};

// Hjälpfunktion för att nollställa banan
function clearCurrentLevel(world) {
    const player = getPlayer(world);

    world.entities.length = 0; // Rensa den generella entities-arrayen också

    if (player) {
        addEntity(world, player); // Lägg tillbaka spelaren så vi inte tappar referensen
    }
}

// Hjälpfunktion som hittar grid-position för character som återkommer till klassiska banan
function snapToGrid(position) {
    const gridSize = 40;
    return {
        x: Math.floor(position.x / gridSize) * gridSize + gridSize / 2,
        y: Math.floor(position.y / gridSize) * gridSize + gridSize / 2
    };
}

// Hjälpfunktion för nedräkning vid banbyte
function runLevelTransition(world, targetMode) {
    const { gameState } = world;

    gameState.mode = 'COUNTDOWN';
    gameState.countdownValue = 3;
    gameState.gameRunning = false;

    const timer = setInterval(() => {
        gameState.countdownValue--;

        if (gameState.countdownValue <= 0) {
            clearInterval(timer);
            gameState.mode = targetMode;
            gameState.gameRunning = true;
            gameState.justResumed = true;
            world.lastTime = performance.now();
        }
    }, 1000)
}

// Generisk funktion för banbyten
export function changeLevel(config, world) {

    if (config.saveCurrent) {
        saveCurrentLevelState(world);
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

    runLevelTransition(world, config.targetMode);
}

/**
 * Sparar ner tillståndet från den aktuella nivån innan vi byter
 */
export function saveCurrentLevelState(world) {
    const player = getPlayer(world);
    const ghosts = getGhosts(world);
    const pellets = getPellets(world);
    const powerUps = getPowerUps(world);
    const villains = getVillains(world);

    levelState.savedPositions.playerData = player ? { ...player.position } : null;

    levelState.savedPositions.ghostsData = ghosts.map(g => ({
        x: g.position.x,
        y: g.position.y,
        velocity: { ...g.velocity },
        color: g.color
    }));

    levelState.savedPositions.pelletsData = pellets.map(p => ({
        x: p.position.x,
        y: p.position.y,
        isDangerous: p.isDangerous
    }));

    levelState.savedPositions.powerUpsData = powerUps.map(p => ({
        x: p.position.x,
        y: p.position.y
    }));

    levelState.savedPositions.villainsData = [...villains];
}

/**
 * En helt generisk återställare
 */
// levelManager.js

function restoreLevel(config, world) {
    const { c, gameState } = world;
    const player = getPlayer(world);

    const { savedPositions } = levelState;

    world.entities.length = 0; // Rensa den generella entities-arrayen också

    config.initLevel(world); // För att bygga upp banan och placera ut saker på rätt ställen

    // Återställ kartan smart
    world.entities = world.entities.filter(e => e.type !== 'pellet');
        
    savedPositions.pelletsData.forEach(data => {
        const pellet = createPellet({
            position: { x: data.x, y: data.y },
            isDangerous: data.isDangerous
        });
        addEntity(world, pellet);
    });

    world.entities = world.entities.filter(e => e.type !== 'powerUp');

    // Återställ power-ups
    savedPositions.powerUpsData.forEach(data => {
        const powerUp = createPowerUp({
            position: { x: data.x, y: data.y },
            color: data.color
        });
        addEntity(world, powerUp);
    });

    world.entities = world.entities.filter(e => e.type !== 'ghost');    

    // Återställ spöken    
    savedPositions.ghostsData.forEach(data => {
        const ghost = createGhost({
            position: { x: data.x, y: data.y },
            velocity: { x: data.velocity.x, y: data.velocity.y },
            color: data.color
        });

        addEntity(world, ghost);
    });

    world.entities = world.entities.filter(e => e.type !== 'villain');

    // Återställ skurkar
    savedPositions.villainsData.forEach(v => {
        addEntity(world, v);
    });    
    
    // Återställ spelaren    
    const snappedPosition = snapToGrid(savedPositions.playerData);
    player.position.x = snappedPosition.x;
    player.position.y = snappedPosition.y;

    addEntity(world, player);

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