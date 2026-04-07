import { Boundary } from "./boundary.js";
import { Villain } from "./villain.js";
import { spaceLayout, buildSpaceMap } from "./spaceMap.js";
import { FloatingText } from "./floatingText.js";
import { gameState } from "./gameState.js";

// Funktion som öppnar en portal på en slumpmässig farlig pellet
function openExitPortal(pellets) {
    const dangerousPellets = pellets.filter(p => p.isDangerous)

    if (dangerousPellets.length === 0) return

    const random = dangerousPellets[Math.floor(Math.random() * dangerousPellets.length)]

    random.isPortal = true

    random.portalTimer = setTimeout(() => {
        random.isPortal = false
    }, 3000)
}

/**
 * Allt som rör initiering av rymdbanan samlas här
 */

export function initSpaceLevel({ c, canvas, player, boundaries, pellets, powerUps, ghosts, keys, animate }) {

    //Nollställ tangenter
    keys.w.pressed = false;
    keys.a.pressed = false;
    keys.s.pressed = false;
    keys.d.pressed = false;

    canvas.classList.add('space-background');

    //ändra via gameController-objektet istället för direkt variabel
    gameState.gameRunning = false;
    cancelAnimationFrame(gameState.animationId);

    //Töm nuvarande listor
    boundaries.length = 0;
    pellets.length = 0;
    powerUps.length = 0;
    ghosts.length = 0;

    //Bygg banan
    buildSpaceMap({c, pellets, boundaries, powerUps});

    //Placera spelaren
    player.physicsMode = 'SPACE';
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

    const portalInterval = setInterval(() => {
        if (player.physicsMode === 'SPACE') {
            openExitPortal(pellets);
        } else {
            clearInterval(portalInterval);
        }
    }, Math.random() * 7000 + 8000);

    setTimeout(() => {
        gameState.gameRunning = true;
        animate();
    }, 1000);

    return newVillains;
}

export function handleVillainEaten({eatenVillain, pellets, score, scoreEl, activeEffects, gameController, showMenu, gameState, returnToMainMap}) {
    // 1. Stoppa spelet
    gameState.gameRunning = false;

    // 2. Skapa effekten för skurken
    activeEffects.push(new FloatingText({
        x: eatenVillain.position.x,
        y: eatenVillain.position.y,
        text: '+500',
        color: '#f863d5'
    }));

    // 3. Beräkna bonus och uppdatera poäng
    const pelletBonus = pellets.length * 10;
    const totalBonus = 500 + pelletBonus;
    gameState.score += totalBonus;
    scoreEl.innerText = gameState.score;

    // 4. "Sug in" pellets visuellt
    const drainInterval = setInterval(() => {
        if (pellets.length > 0) {
            const p = pellets.pop();
            activeEffects.push(new FloatingText({
                x: p.position.x,
                y: p.position.y,
                text: '+10',
                color: 'white'
            }));
        } else {
            clearInterval(drainInterval);
            
            // 5. NÄR ALLA PELLETS ÄR KLARA: Visa menyn!
            // Vi lägger en liten delay så man hinner se sista effekten
            setTimeout(() => {
                cancelAnimationFrame(gameState.animationId); // Stoppa loopen helt
                
                showMenu('BONUSLVLCOMPLETE', {
                    resumeGame: () => {
                        gameState.hasVisitedExtraLevel = true;
                        returnToMainMap();
                    },
                    resetToMain: () => location.reload()
                }, {
                    score: totalBonus // Skickar med bonusen till menyn
                });
            }, 1800);
        }
    }, 50);
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
