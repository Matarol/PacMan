import { addEntity } from "../src/utils/entityHelpers.js";
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

export function initSpaceLevel(world) {
    const { keys, canvas } = world;
    const player = world.entities.find(e => e.type === 'player');

    if (!player) {
        console.error("Player entity not found in world.entities during space level initialization.");
        return;
    }

    //Nollställ tangenter
    keys.w.pressed = false;
    keys.a.pressed = false;
    keys.s.pressed = false;
    keys.d.pressed = false;

    canvas.classList.add('space-background');

    //ändra via gameController-objektet istället för direkt variabel
    gameState.currentLevel = 'SPACE'
    gameState.gameRunning = false;

    //Töm nuvarande listor och entities så att vi kan bygga upp rymdnivån från scratch
    world.entities.length = 0;

    //Bygg banan
    buildSpaceMap(world);

    //Placera spelaren
    player.physicsMode = 'SPACE';
    gameState.mode = GAME_MODES.SPACE;
    const pacmanStart = findStartPos(spaceLayout, 'p');
    const villainStart = findStartPos(spaceLayout, 'v');

    player.position.x = pacmanStart.x * Boundary.width + Boundary.width /2;
    player.position.y = pacmanStart.y * Boundary.height + Boundary.height /2;
    player.velocity.x = 0;
    player.velocity.y = 0;

    // Addera spelaren till entities så att den renderas och uppdateras
    addEntity(world, player);

    //Initierar en villain och adderar till listan
    const villain = new Villain({
        position: {
            x: villainStart.x * Boundary.width + Boundary.width / 2,
            y: villainStart.y * Boundary.height + Boundary.height / 2
        },
        velocity: { x: 0, y: 0 }
    });
    addEntity(world, villain);

    //Starta portal-loopen som slumpmässigt placerar ut en portal på kartan
    startExitPortalLoop(world);

    setTimeout(() => {
        gameState.gameRunning = true;
        gameState.justResumed = true;
    }, 1000);
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
