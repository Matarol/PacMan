import { getVillains, getPellets, getPlayer, getBoundaries } from "../utils/entitySelectors.js";
import { circleCollidesWithRectangle } from "../collision.js";
import { removeEntity } from "../utils/entityHelpers.js";
import { createFloatingText } from "../factories/floatingTextFactory.js";
import { playSound } from "../audioManager.js";
import { changeLevel } from "../levelManager.js";
import { classicConfig } from "../classicLevel.js";

export function updateVillains(world, deltaTime) {
    handleVillainAI(world, deltaTime)
    updateVillainStateAndPosition(world, deltaTime)

}

function updateVillainStateAndPosition(world, deltaTime) {
    const villains = getVillains(world);

    villains.forEach(villain => {
        if (!villain.position || !villain.velocity) return;

        villain.radius = villain.miniature ? 10 : 25

        villain.position.x += villain.velocity.x * deltaTime
        villain.position.y += villain.velocity.y * deltaTime

        if (villain.radians < 0 || villain.radians > 0.75) villain.openRate = -villain.openRate
        villain.radians += villain.openRate

        if (villain.velocity.x > 0) {
            villain.eyesOffsetX = 3
            villain.eyesOffsetY = -6
        }

        if (villain.velocity.x < 0) {
            villain.eyesOffsetX = -3
            villain.eyesOffsetY = -6
        }

        if (villain.velocity.y > 0) {
            villain.eyesOffsetX = 6
            villain.eyesOffsetY = 3
        }

        if (villain.velocity.y < 0) {
            villain.eyesOffsetX = -6
            villain.eyesOffsetY = -3
        }
    })

}

function getFreeDirection(villain, boundaries, speed, deltaTime) {
    const directions = [
        { angle: 0, x: 1, y: 0 },
        { angle: Math.PI, x: -1, y:0 },
        { angle: Math.PI / 2, x: 0, y: 1 },
        { angle: -Math.PI / 2, x: 0, y: -1 }
    ]

    const freeDirections = directions.filter(dir => {
        const step = {
            x: dir.x * speed * deltaTime,
            y: dir.y * speed * deltaTime
        }

        return !boundaries.some(boundary => 
            !boundary.isPortal && circleCollidesWithRectangle({ circle: {
                ...villain, velocity: step },
        rectangle: boundary })
        )
    })

    if (freeDirections.length === 0) return null

    return freeDirections[Math.floor(Math.random() * freeDirections.length)]
}

function canMoveInDirection(villain, direction, boundaries, speed, deltaTime) {
    const step = {
        x: direction.x * speed * deltaTime,
        y: direction.y * speed * deltaTime
    }

    return !boundaries.some(boundary => !boundary.isPortal && circleCollidesWithRectangle({
        circle: { ...villain, velocity: step },
        rectangle: boundary
    }))
}

function handleVillainAI(world, deltaTime) {
    const player = getPlayer(world);
    const villains = getVillains(world);
    const boundaries = getBoundaries(world);

    if (villains.length === 0 || !player) return

    villains.forEach(villain => {
        if (!villain.position || !villain.velocity) return

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

            villain.escapeDirection = null
            villain.escapeTimer = 0

            villain.velocity.x = nextVelocity.x
            villain.velocity.y = nextVelocity.y
            villain.rotation = targetAngle
        } else {

            if (!villain.escapeDirection || villain.escapeTimer <= 0 || !canMoveInDirection(villain, villain.escapeDirection, boundaries, speed, deltaTime)) {
                villain.escapeDirection = getFreeDirection(villain, boundaries, speed, deltaTime)
                villain.escapeTimer = 0.5
            }

            if (villain.escapeDirection) {
                villain.velocity.x = villain.escapeDirection.x * speed
                villain.velocity.y = villain.escapeDirection.y * speed
                villain.rotation = villain.escapeDirection.angle

                villain.escapeTimer -= deltaTime
            } else {
                villain.velocity.x = 0
                villain.velocity.y = 0
            }
            return
        }
    })
}

function restoreVillainSizeSafely(world, villain) {
    const boundaries = getBoundaries(world);

    villain.miniature = false;
    villain.radius = 25;

    const overlapsWall = boundaries.some(boundary => !boundary.isPortal && circleCollidesWithRectangle({
        circle: {
            ...villain,
            velocity: { x: 0, y: 0 }
        },
        rectangle: boundary
    })
    )

    if (!overlapsWall) return

    villain.miniature = true;
    villain.radius = 10;

    setTimeout(() => {
        restoreVillainSizeSafely(world, villain);
    }, 250)

}

//Funktion för att krympa skurken ifall en powerUp äts i extrabanan
export function shrunkenVillain(world, villain) {
    if (!villain || !villain.velocity) return
    villain.miniature = true

    setTimeout(() => {
            restoreVillainSizeSafely(world, villain)
        },
    4000)
}

function drainPelletsWithPoints(world, activeEffects) {
    const pellets = getPellets(world);
    return new Promise((resolve) => {
        const drainInterval = setInterval(() => {
            if (pellets.length > 0) {
                const p = pellets.pop()
                removeEntity(world, p);

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

