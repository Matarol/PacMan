import { Villain } from "./villain.js";
import { circleCollidesWithRectangle } from "./collision.js";

export function updateVillain(villain, player, boundaries) {
    if (!villain || !player) return

    const speed = 2

    // Grundriktning mot spelaren
    const dx = player.position.x - villain.position.x
    const dy = player.position.y - villain.position.y
    const targetAngle = Math.atan2(dy, dx)

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
            velocity: { x: 0, y: 0}
        }
    }

    for (const boundary of boundaries) {
        if (boundary.isPortal) continue

        if (circleCollidesWithRectangle({ circle: checkPoint, rectangle: boundary }))
            targetAngle -= offset * 2
            obstruction = true
            break
        
    }

    const nextVelocity = {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed
    }

    let blocked = false

    for (const boundary of boundaries) {
        if (boundary.isPortal) continue

        if (circleCollidesWithRectangle({
            circle: { ...villain, velocity: nextVelocity },
            rectangle: boundary
        })) {
            blocked = true
            break
        }
    }

    if (!blocked) {
        villain.velocity.x = nextVelocity.x
        villain.velocity.y = nextVelocity.y
        villain.rotation = angle
    } else {
        villain.velocity.x = 0
        villain.velocity.y = 0
    }

    villain.update()
}