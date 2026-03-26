import { Player } from "./player.js"
import { circleCollidesWithRectangle } from "./collision.js"

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
      }) &&
    !boundary.isPortal) {
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
      }) &&
    !boundary.isPortal) {
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

export function handleSpaceMovement(player, keys, boundaries) {
  const acceleration = 0.2
  const friction = 0.98
  const maxSpeed = 6

  // 🚀 Acceleration (thrusters)
  if (keys.w.pressed) player.velocity.y -= acceleration
  if (keys.s.pressed) player.velocity.y += acceleration
  if (keys.a.pressed) player.velocity.x -= acceleration
  if (keys.d.pressed) player.velocity.x += acceleration

  // 🧱 Kollision (separera X/Y som du redan gör)
  let nextX = player.position.x + player.velocity.x
  let nextY = player.position.y + player.velocity.y

  let blockedX = false
  let blockedY = false

  for (let boundary of boundaries) {
    if (boundary.isPortal) continue

    if (circleCollidesWithRectangle({
      circle: { ...player, position: { x: nextX, y: player.position.y } },
      rectangle: boundary
    })) {
      blockedX = true
    }

    if (circleCollidesWithRectangle({
      circle: { ...player, position: { x: player.position.x, y: nextY } },
      rectangle: boundary
    })) {
      blockedY = true
    }
  }

  if (blockedX) player.velocity.x = 0
  if (blockedY) player.velocity.y = 0

  // 🧊 Friction (glidkänsla)
  player.velocity.x *= friction
  player.velocity.y *= friction

  // 🚫 Clamp max speed
  const speed = Math.hypot(player.velocity.x, player.velocity.y)
  if (speed > maxSpeed) {
    player.velocity.x = (player.velocity.x / speed) * maxSpeed
    player.velocity.y = (player.velocity.y / speed) * maxSpeed
  }

  // 🔄 Rotation (peka dit du rör dig)
  if (speed > 0.1) {
    player.rotation = Math.atan2(player.velocity.y, player.velocity.x)
  }
}