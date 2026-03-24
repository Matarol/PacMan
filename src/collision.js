import { Boundary } from './boundary.js'

export function circleCollidesWithCircle(c1, c2) {
    return Math.hypot(
        c1.position.x - c2.position.x,
        c1.position.y - c2.position.y
    ) < c1.radius + c2.radius 
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