import { Villain } from "./villain.js";
import { circleCollidesWithRectangle } from "./collision.js";
import { gameState } from "./gameState.js";
import { FloatingText } from "./floatingText.js";

export function updateVillain(villain, player, boundaries) {
    if (!villain || !player) return

    const speed = 2

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

    //Slutgiltig krockcheck
    let finalBlocked = false
    for (const boundary of boundaries) {
        if (boundary.isPortal) continue

        if (circleCollidesWithRectangle({
            circle: { ...villain, velocity: nextVelocity },
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

    villain.update()

}

//Funktion för att krympa skurken ifall en powerUp äts i extrabanan
export function shrunkenVillain(villain) {
    if (!villain || !villain.velocity) return
    villain.miniature = true

    setTimeout(() => {
            villain.miniature = false
        },
    4000)
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
