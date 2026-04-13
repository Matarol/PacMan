import { Boundary } from './boundary.js'

export function circleCollidesWithCircle(c1, c2) {
    return Math.hypot(
        c1.position.x - c2.position.x,
        c1.position.y - c2.position.y
    ) < c1.radius + c2.radius 
}

export function circlesCollide(c1, c2) {
    //Om objekten inte har en radius, anta att de är spelare (radius: 15)
    const r1 = c1.radius || 15
    const r2 = c2.radius || 15

    return Math.hypot(
        c1.position.x - c2.position.x,
        c1.position.y - c2.position.y
    ) < r1 + r2
}

export function circleCollidesWithRectangle({
    circle,
    rectangle
}) {
    const padding = Boundary.width / 2 - circle.radius - 1
    return (circle.position.y - circle.radius + circle.velocity.y <= rectangle.position.y + rectangle.height + padding && circle.position.x + circle.radius + circle.velocity.x >= rectangle.position.x - padding && circle.position.y + circle.radius + circle.velocity.y >= rectangle.position.y - padding && circle.position.x - circle.radius + circle.velocity.x <= rectangle.position.x + rectangle.width + padding)
}

export function getCollidingIndex(circle, items) {
    for (let i = items.length - 1; i >= 0; i --) {
        if (circleCollidesWithCircle(circle, items[i])) {
            return i
        }
    }
    return -1
}

export function getRepulsionVelocity(circle, rectangle) {
    const closestX = Math.max(rectangle.position.x, Math.min(circle.position.x, rectangle.position.x + rectangle.width))
    const closestY = Math.max(rectangle.position.y, Math.min(circle.position.y, rectangle.position.y + rectangle.height))

    const dx = circle.position.x - closestX
    const dy = circle.position.y - closestY
    const distance = Math.hypot(dx, dy)

    const buffer = circle.radius
    if (distance < buffer && distance > 0) {
        const force = (buffer - distance) / buffer //starkare knuff ju närmare man är
        return {
            x: (dx / distance) * force * 0.75, // 2 är styrkan på knuffen
            y: (dy / distance) * force * 0.75
        }
    }
    return { x: 0, y: 0 }
}

export function getCircleRepulsion(c1, c2) {
    const dx = c1.position.x - c2.position.x
    const dy = c1.position.y - c2.position.y
    const distance = Math.hypot(dx, dy)

    const minDistance = (c1.radius || 15) + (c2.radius || 15)

    if (distance < minDistance && distance > 0) {
        const overlap = minDistance - distance

        return {
            x: (dx / distance) * overlap,
            y: (dy / distance) * overlap
        }
    }
    return { x: 0, y: 0 }
}

export function isCenteredInTile(entity) {
    const halfW = Boundary.width / 2
    const halfH = Boundary.height / 2

    const centerX =
        Math.round((entity.position.x - halfW) / Boundary.width) *
        Boundary.width +
        halfW

    const centerY =
        Math.round((entity.position.y - halfH) / Boundary.height) *
        Boundary.height +
        halfH

    const tolerance = 3

    return (
        Math.abs(entity.position.x - centerX) <= tolerance &&
        Math.abs(entity.position.y - centerY) <= tolerance
    )
}