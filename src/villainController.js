import { circleCollidesWithRectangle } from "./collision.js";
import { FloatingText } from "./floatingText.js";
import { playSound } from "./audioManager.js";
import { changeLevel } from "./levelManager.js";
import { classicConfig } from "./classicLevel.js";
import { removeEntity } from "./itemsController.js";
import { getPellets } from "./utils/entitySelectors.js";
import { createFloatingText } from "./factories/floatingTextFactory.js";

export function handleVillainMovement(villain, player, boundaries, deltaTime) {
    if (!villain || !player) return

    const speed = 120 * (villain.miniature ? 1.5 : 1)

    // Grundriktning mot spelaren
    let dx = player.position.x - villain.position.x
    let dy = player.position.y - villain.position.y

    // Miniskurken måste fly istället - riktning bort från pacman
    if (villain.miniature) {
        dx = -dx
        dy = -dy
    }

    let targetAngle = Math.atan2(dy, dx)    

    //Se hinder framför sig
    const lookAheadDistance = 40
    const feelers = [0, -0.5, 0.5] //Radianer (rakt fram, vänster, höger)
    let obstruction = false

    for (const offset of feelers) {
        const checkAngle = targetAngle + offset
        const checkPoint = {
            position: {
                x: villain.position.x + Math.cos(checkAngle) * lookAheadDistance,
                y: villain.position.y + Math.sin(checkAngle) * lookAheadDistance
            },
            radius: villain.radius,
            velocity: { x: 0, y: 0 }
        }
        for (const boundary of boundaries) {
            if (boundary.isPortal) continue

            if (circleCollidesWithRectangle({ circle: checkPoint, rectangle: boundary })) {
                targetAngle -= offset * 2
                obstruction = true
                break
            }
        }

    }

    //Applicera den eventuellt justerade vinkeln
    const nextVelocity = {
        x: Math.cos(targetAngle) * speed,
        y: Math.sin(targetAngle) * speed
    }

    const nextStep = {
        x: nextVelocity.x * deltaTime,
        y: nextVelocity.y * deltaTime
    }

    //Slutgiltig krockcheck
    let finalBlocked = false
    for (const boundary of boundaries) {
        if (boundary.isPortal) continue

        if (circleCollidesWithRectangle({
            circle: { ...villain, velocity: nextStep },
            rectangle: boundary
        })) {
            finalBlocked = true
            break
        }
    }

    if (!finalBlocked) {
        villain.velocity.x = nextVelocity.x
        villain.velocity.y = nextVelocity.y
        villain.rotation = targetAngle
    } else {
        villain.velocity.x *= 0.5
        villain.velocity.y *= 0.5
    }
}

//Funktion för att krympa skurken ifall en powerUp äts i extrabanan
export function shrunkenVillain(villain) {
    // console.trace('shrunkenVillain called');
    if (!villain || !villain.velocity) return
    villain.miniature = true

    setTimeout(() => {
            villain.miniature = false
        },
    4000)
}

function drainPelletsWithPoints(world, activeEffects) {
    const pellets = getPellets(world);
    return new Promise((resolve) => {
        const drainInterval = setInterval(() => {
            if (pellets.length > 0) {
                const p = pellets.pop()
                removeEntity(p, world);

                activeEffects.push(createFloatingText({
                    position: { x: p.position.x, y: p.position.y },
                    text: '+20',
                    color: 'white'
                }))
            } else {
                clearInterval(drainInterval)

                //allow final floating texts to finish animating
                setTimeout(resolve, 1500)
            }
        }, 50)
    })
}

export async function handleVillainEaten({eatenVillain, world }) {
    const { gameState, scoreEl, activeEffects, actions } = world
    const pellets = getPellets(world);
    // 1. Stoppa spelet
    gameState.gameRunning = false;

    // 2. Skapa effekten för skurken
    activeEffects.push(createFloatingText({
        position: { x: eatenVillain.position.x, y: eatenVillain.position.y },
        text: '+500',
        color: '#f863d5'
    }));

    // 3. Beräkna bonus och uppdatera poäng
    const pelletBonus = pellets.length * 20;
    const totalBonus = 500 + pelletBonus;
    gameState.score += totalBonus;
    scoreEl.innerText = gameState.score;

    playSound('win')

    // 4. "Sug in" pellets visuellt
    await drainPelletsWithPoints(world, activeEffects)

    actions.showMenu('BONUSLVLCOMPLETE', {
        resumeGame: () => {
            gameState.hasVisitedExtraLevel = true
            changeLevel(classicConfig, world)
        },
        resetToMain: () => location.reload()
    }, {
        score: totalBonus
    })
}
