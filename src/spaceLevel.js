import { Boundary } from "./boundary.js";
import { Villain } from "./villain.js";
import { spaceLayout, buildSpaceMap } from "./spaceMap.js";
import { gameState, GAME_MODES } from "./gameState.js";
import { startExitPortalLoop } from "./portalManager.js";

export const spaceConfig = {
    levelName: 'space',
    targetMode: 'SPACE',
    useRestore: false, // Rymdbanan är en bonusbana, så vi vill inte återställa den från tidigare nivåer
    saveCurrent: true, // Current är ju klassiska banan, så vi vill spara den när vi byter till rymdbanan så att vi kan återställa den när vi kommer tillbaka
    initLevel: initSpaceLevel    
}


/**
 * Allt som rör initiering av rymdbanan samlas här
 */
// export function initSpaceLevel({ c, canvas, player, boundaries, pellets, powerUps, ghosts, keys })

export function initSpaceLevel(world) {

    const { keys, canvas, c, player, boundaries, pellets, powerUps, ghosts, villains } = world

    //Nollställ tangenter
    keys.w.pressed = false;
    keys.a.pressed = false;
    keys.s.pressed = false;
    keys.d.pressed = false;

    canvas.classList.add('space-background');

    //ändra via gameController-objektet istället för direkt variabel
    gameState.currentLevel = 'SPACE'
    gameState.gameRunning = false;

    //Töm nuvarande listor
    boundaries.length = 0;
    pellets.length = 0;
    powerUps.length = 0;
    ghosts.length = 0;

    //Bygg banan
    buildSpaceMap({c, pellets, boundaries, powerUps});

    //Placera spelaren
    player.physicsMode = 'SPACE';
    gameState.mode = GAME_MODES.SPACE;
    const pacmanStart = findStartPos(spaceLayout, 'p');
    const villainStart = findStartPos(spaceLayout, 'v');

    player.position.x = pacmanStart.x * Boundary.width + Boundary.width /2;
    player.position.y = pacmanStart.y * Boundary.height + Boundary.height /2;
    player.velocity.x = 0;
    player.velocity.y = 0;

    //Returnerar de nya skurkarna så game.js kan uppdatera sin lista
    const newVillains = [new Villain({
        position: {
            x: villainStart.x * Boundary.width + Boundary.width /2,
            y: villainStart.y * Boundary.height + Boundary.height /2
        },
        velocity: { x: 0, y: 0}
    })];

    world.villains.push( ...newVillains);

    startExitPortalLoop(player, pellets)

    setTimeout(() => {
        gameState.gameRunning = true;
        gameState.justResumed = true;
    }, 1000);

    return newVillains;
}

//Hjälpfunktion för att hitta startposition for PacMan och SkurkPacMan i mapExtra1-banan
function findStartPos(mapArray, symbol) {
    for (let i = 0; i < mapArray.length; i++) {
        for (let j = 0; j < mapArray[i].length; j++) {
            if (mapArray[i][j] === symbol) {
                return { x: j, y: i };
            }
        }
    }
    return { x: 5, y: 5 }; //Fallback
}
