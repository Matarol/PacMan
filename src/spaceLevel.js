import { Boundary } from "./boundary";
import { Villain } from "./villain";
import { spaceLayout, renderSpaceMap } from "./spaceMap";
import { FloatingText } from "./floatingText";

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

export function initSpaceLevel({ c, canvas, player, boundaries, pellets, powerUps, ghosts, keys, gameController }) {

    //Nollställ tangenter
    keys.w.pressed = false;
    keys.a.pressed = false;
    keys.s.pressed = false;
    keys.d.pressed = false;

    canvas.classList.add('space-background');

    gameRunning = false;
    cancelAnimationFrame(animationId);

    //Töm nuvarande listor
    boundaries.length = 0;
    pellets.length = 0;
    powerUps.length = 0;
    ghosts.length = 0;

    //Bygg banan
    renderSpaceMap({c, pellets, boundaries, powerUps});

    //Placera spelaren
    player.physicsMode = 'SPACE';
    const pacmanStart = findStartPos(spaceLayout, 'p');
    const villainStart = findStartPos(spaceLayout, 'v');

    player.position.x = pacmanStart.x * Boundary.width + Boundary.width /2
    player.position.y = pacmanStart.y * Boundary.height + Boundary.height /2
    player.velocity.x = 0
    player.velocity.y = 0

    //placeholder för initiering av skurkPacman
    villains = [new Villain({
        position: {
            x: villainStart.x * Boundary.width + Boundary.width /2,
            y: villainStart.y * Boundary.height + Boundary.height /2
        },
        velocity: { x: 0, y: 0},
        context: c
    })]

    setInterval(() => {
        if (player.physicsMode === 'SPACE') {
            openExitPortal(pellets)
        }
    }, Math.random() * 7000 + 8000)


    setTimeout(() => {
        gameRunning = true
        animate()
    }, 1000)
}

export function handleVillainEaten(eatenVillain) {
    // 1. Stoppa spelet
    gameRunning = false 

    // 2. Skapa effekten för skurken
    activeEffects.push(new FloatingText({
        x: eatenVillain.position.x,
        y: eatenVillain.position.y,
        text: '+500',
        color: '#f863d5'
    }))

    // 3. Beräkna bonus och uppdatera poäng
    const pelletBonus = pellets.length * 10
    const totalBonus = 500 + pelletBonus
    score.value += totalBonus
    scoreEl.innerText = score.value

    // 4. "Sug in" pellets visuellt
    const drainInterval = setInterval(() => {
        if (pellets.length > 0) {
            const p = pellets.pop()
            activeEffects.push(new FloatingText({
                x: p.position.x,
                y: p.position.y,
                text: '+10',
                color: 'white'
            }))
        } else {
            clearInterval(drainInterval)
            
            // 5. NÄR ALLA PELLETS ÄR KLARA: Visa menyn!
            // Vi lägger en liten delay så man hinner se sista effekten
            setTimeout(() => {
                cancelAnimationFrame(animationId) // Stoppa loopen helt
                
                showMenu('BONUSLVLCOMPLETE', {
                    resumeGame: () => {
                        gameState.hasVisitedExtraLevel = true
                        activeEffects = []
                        villains = []
                        returnToMainMap()
                    },
                    resetToMain: () => location.reload()
                }, {
                    score: totalBonus // Skickar med bonusen till menyn
                })
            }, 1800)
        }
    }, 50)
}

//Hjälpfunktion för att hitta startposition for PacMan och SkurkPacMan i mapExtra1-banan
function findStartPos(mapArray, symbol) {
    for (let i = 0; i < mapArray.length; i++) {
        for (let j = 0; j < mapArray[i].length; j++) {
            if (mapArray[i][j] === symbol) {
                return { x: j, y: i }
            }
        }
    }
    return { x: 5, y: 5 } //Fallback
}
