import { Player } from "./player.js"
import { circleCollidesWithRectangle, circlesCollide, getRepulsionVelocity } from "./collision.js"

export function handlePlayerMovement(player, currentDirection, nextDirection, boundaries, deltaTime) {
  const speed = 200

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
        circle: { ...player, velocity: {
          x: velocity.x * deltaTime,
          y: velocity.y * deltaTime
        } },
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
        circle: { ...player, velocity: {
          x: velocity.x * deltaTime,
          y: velocity.y * deltaTime
        } },
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

  // 🔄 Rotation för klassisk labyrint (snappa till riktning)
  if (player.velocity.x > 0) player.rotation = 0              // Höger (0°)
  else if (player.velocity.x < 0) player.rotation = Math.PI   // Vänster (180°)
  else if (player.velocity.y > 0) player.rotation = Math.PI / 2 // Ner (90°)
  else if (player.velocity.y < 0) player.rotation = -Math.PI / 2 // Upp (270°)

  return { currentDirection, nextDirection }
}

export function handleSpaceMovement(player, keys, boundaries, deltaTime) {
  const acceleration = 15
  const friction = 0.98
  const maxSpeed = 6

  const asteroidRadius = 10

  // 🚀 Acceleration (thrusters)
  if (keys.w.pressed) player.velocity.y -= acceleration * deltaTime
  if (keys.s.pressed) player.velocity.y += acceleration * deltaTime
  if (keys.a.pressed) player.velocity.x -= acceleration * deltaTime
  if (keys.d.pressed) player.velocity.x += acceleration * deltaTime

  // 🧱 Kollision (separera X/Y som du redan gör)
  let nextX = player.position.x + player.velocity.x * deltaTime
  let nextY = player.position.y + player.velocity.y * deltaTime

  let blockedX = false
  let blockedY = false

  for (let boundary of boundaries) {
    if (boundary.isPortal) continue

    const testCircleX = { ...player, position: { x: nextX, y: player.position.y } }
    const testCircleY = { ...player, position: { x: player.position.x, y: nextY } }

    if (boundary.type === 'asteroid') {
      continue
      
    } else {
      //REKTANGEL-KOLLISION (för vanliga väggar)
      if (circleCollidesWithRectangle({ circle: testCircleX, rectangle: boundary})) blockedX = true
      if (circleCollidesWithRectangle({ circle: testCircleY, rectangle: boundary })) blockedY = true
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

  for (let boundary of boundaries) {
    if (boundary.isPortal) continue

    if (boundary.type === 'asteroid') {
      const push = getRepulsionVelocity(player, boundary)

      if (!isNaN(push.x) && !isNaN(push.y)) {
        player.position.x += push.x
        player.position.y += push.y
      }

      // player.position.x += push.x * deltaTime * 60
      // player.position.y += push.y * deltaTime * 60
    }
  }
}
