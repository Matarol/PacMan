import { Player } from "./player.js"
import { circleCollidesWithRectangle } from "./utils.js"

export function handlePlayerMovement(player, currentDirection, nextDirection, boundaries) {
  const speed = 5

  const directions = {
    w: { x: 0, y: -speed },
    a: { x: -speed, y: 0 },
    s: { x: 0, y: speed },
    d: { x: speed, y: 0 }
  }

  // 🔥 Try to switch direction FIRST
  if (nextDirection) {
    const velocity = directions[nextDirection]

    let canTurn = true

    for (let boundary of boundaries) {
      if (circleCollidesWithRectangle({
        circle: { ...player, velocity },
        rectangle: boundary
      })) {
        canTurn = false
        break
      }
    }

    if (canTurn) {
      currentDirection = nextDirection
      nextDirection = null
    }
  }

  // 👉 Continue moving in current direction
  if (currentDirection) {
    const velocity = directions[currentDirection]

    let blocked = false

    for (let boundary of boundaries) {
      if (circleCollidesWithRectangle({
        circle: { ...player, velocity },
        rectangle: boundary
      })) {
        blocked = true
        break
      }
    }

    if (!blocked) {
      player.velocity.x = velocity.x
      player.velocity.y = velocity.y
    } else {
      player.velocity.x = 0
      player.velocity.y = 0
    }
  }

  return { currentDirection, nextDirection }
}