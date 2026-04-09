// import { Player } from "./player.js"
// import { circleCollidesWithRectangle, circlesCollide, getRepulsionVelocity } from "./collision.js"

// export function handlePlayerMovement(player, currentDirection, nextDirection, boundaries, deltaTime) {
//   const speed = 200 * deltaTime

//   const directions = {
//     w: { x: 0, y: -speed },
//     a: { x: -speed, y: 0 },
//     s: { x: 0, y: speed },
//     d: { x: speed, y: 0 }
//   }

//   // 🔥 Try to switch direction FIRST
//   if (nextDirection) {
//     const velocity = directions[nextDirection]

//     let canTurn = true

//     for (let boundary of boundaries) {
//       if (circleCollidesWithRectangle({
//         circle: { ...player, velocity },
//         rectangle: boundary
//       }) &&
//     !boundary.isPortal) {
//         canTurn = false
//         break
//       }
//     }

//     if (canTurn) {
//       currentDirection = nextDirection
//       nextDirection = null
//     }
//   }

//   // 👉 Continue moving in current direction
//   if (currentDirection) {
//     const velocity = directions[currentDirection]

//     let blocked = false

//     for (let boundary of boundaries) {
//       if (circleCollidesWithRectangle({
//         circle: { ...player, velocity },
//         rectangle: boundary
//       }) &&
//     !boundary.isPortal) {
//         blocked = true
//         break
//       }
//     }

//     if (!blocked) {
//       player.velocity.x = velocity.x
//       player.velocity.y = velocity.y
//     } else {
//       player.velocity.x = 0
//       player.velocity.y = 0
//     }
//   }

//   // 🔄 Rotation för klassisk labyrint (snappa till riktning)
//   if (player.velocity.x > 0) player.rotation = 0              // Höger (0°)
//   else if (player.velocity.x < 0) player.rotation = Math.PI   // Vänster (180°)
//   else if (player.velocity.y > 0) player.rotation = Math.PI / 2 // Ner (90°)
//   else if (player.velocity.y < 0) player.rotation = -Math.PI / 2 // Upp (270°)

//   return { currentDirection, nextDirection }
// }

// export function handleSpaceMovement(player, keys, boundaries, deltaTime) {
//   const acceleration = 15 * deltaTime
//   const friction = 0.98
//   const maxSpeed = 6

//   const asteroidRadius = 10

//   // 🚀 Acceleration (thrusters)
//   if (keys.w.pressed) player.velocity.y -= acceleration
//   if (keys.s.pressed) player.velocity.y += acceleration
//   if (keys.a.pressed) player.velocity.x -= acceleration
//   if (keys.d.pressed) player.velocity.x += acceleration

//   // 🧱 Kollision (separera X/Y som du redan gör)
//   let nextX = player.position.x + player.velocity.x
//   let nextY = player.position.y + player.velocity.y

//   let blockedX = false
//   let blockedY = false

//   for (let boundary of boundaries) {
//     if (boundary.isPortal) continue

//     const testCircleX = { ...player, position: { x: nextX, y: player.position.y } }
//     const testCircleY = { ...player, position: { x: player.position.x, y: nextY } }

//     if (boundary.type === 'asteroid') {
//       continue
      
//     } else {
//       //REKTANGEL-KOLLISION (för vanliga väggar)
//       if (circleCollidesWithRectangle({ circle: testCircleX, rectangle: boundary})) blockedX = true
//       if (circleCollidesWithRectangle({ circle: testCircleY, rectangle: boundary })) blockedY = true
//     }    
//   }

//   if (blockedX) player.velocity.x = 0
//   if (blockedY) player.velocity.y = 0

//   // 🧊 Friction (glidkänsla)
//   player.velocity.x *= friction
//   player.velocity.y *= friction

//   // 🚫 Clamp max speed
//   const speed = Math.hypot(player.velocity.x, player.velocity.y)
//   if (speed > maxSpeed) {
//     player.velocity.x = (player.velocity.x / speed) * maxSpeed
//     player.velocity.y = (player.velocity.y / speed) * maxSpeed
//   }

//   // 🔄 Rotation (peka dit du rör dig)
//   if (speed > 0.1) {
//     player.rotation = Math.atan2(player.velocity.y, player.velocity.x)
//   }

//   for (let boundary of boundaries) {
//     if (boundary.isPortal) continue

//     if (boundary.type === 'asteroid') {
//       const push = getRepulsionVelocity(player, boundary)

//       player.position.x += push.x * deltaTime * 60
//       player.position.y += push.y * deltaTime * 60
//     }
//   }
// }

import { circleCollidesWithRectangle, getRepulsionVelocity } from "./collision.js"

export function handlePlayerMovement(player, currentDirection, nextDirection, boundaries, deltaTime) {
  // 1. Calculate speed based on time. 
  // 200 pixels per second is standard Pacman speed.
  const speed = 200 * deltaTime

  const directions = {
    w: { x: 0, y: -speed },
    a: { x: -speed, y: 0 },
    s: { x: 0, y: speed },
    d: { x: speed, y: 0 }
  }

  // 🔥 Try to switch direction FIRST
  if (nextDirection && directions[nextDirection]) {
    const dirVelocity = directions[nextDirection]

    let canTurn = true

    for (let boundary of boundaries) {
      if (circleCollidesWithRectangle({
        circle: { 
          ...player, 
          // CRITICAL FIX: Explicitly assign x and y to avoid passing object references
          velocity: { x: dirVelocity.x, y: dirVelocity.y } 
        },
        rectangle: boundary
      }) && !boundary.isPortal) {
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
  if (currentDirection && directions[currentDirection]) {
    const dirVelocity = directions[currentDirection]

    let blocked = false

    for (let boundary of boundaries) {
      if (circleCollidesWithRectangle({
        circle: { 
          ...player, 
          velocity: { x: dirVelocity.x, y: dirVelocity.y } 
        },
        rectangle: boundary
      }) && !boundary.isPortal) {
        blocked = true
        break
      }
    }

    if (!blocked) {
      player.velocity.x = dirVelocity.x
      player.velocity.y = dirVelocity.y
    } else {
      player.velocity.x = 0
      player.velocity.y = 0
    }
  }

  // 🔄 Rotation (snapping to direction)
  // We use a small threshold (0.1) instead of 0 to avoid jitter with floating point numbers
  if (player.velocity.x > 0.1) player.rotation = 0
  else if (player.velocity.x < -0.1) player.rotation = Math.PI
  else if (player.velocity.y > 0.1) player.rotation = Math.PI / 2
  else if (player.velocity.y < -0.1) player.rotation = -Math.PI / 2

  return { currentDirection, nextDirection }
}

export function handleSpaceMovement(player, keys, boundaries, deltaTime) {
  const acceleration = 15 * deltaTime
  // Adjust friction to be frame-rate independent
  const friction = Math.pow(0.98, deltaTime * 60)
  const maxSpeed = 6

  // 🚀 Acceleration (thrusters)
  if (keys.w.pressed) player.velocity.y -= acceleration
  if (keys.s.pressed) player.velocity.y += acceleration
  if (keys.a.pressed) player.velocity.x -= acceleration
  if (keys.d.pressed) player.velocity.x += acceleration

  // 🧱 Collision logic (Separated X and Y for sliding against walls)
  let nextX = player.position.x + player.velocity.x
  let nextY = player.position.y + player.velocity.y

  let blockedX = false
  let blockedY = false

  for (let boundary of boundaries) {
    if (boundary.isPortal) continue

    const testCircleX = { ...player, position: { x: nextX, y: player.position.y } }
    const testCircleY = { ...player, position: { x: player.position.x, y: nextY } }

    if (boundary.type !== 'asteroid') {
      if (circleCollidesWithRectangle({ circle: testCircleX, rectangle: boundary })) blockedX = true
      if (circleCollidesWithRectangle({ circle: testCircleY, rectangle: boundary })) blockedY = true
    }
  }

  if (blockedX) player.velocity.x = 0
  if (blockedY) player.velocity.y = 0

  // 🧊 Apply Friction
  player.velocity.x *= friction
  player.velocity.y *= friction

  // 🚫 Clamp max speed
  const speed = Math.hypot(player.velocity.x, player.velocity.y)
  if (speed > maxSpeed) {
    player.velocity.x = (player.velocity.x / speed) * maxSpeed
    player.velocity.y = (player.velocity.y / speed) * maxSpeed
  }

  // 🔄 Rotation (point toward velocity)
  if (speed > 0.1) {
    player.rotation = Math.atan2(player.velocity.y, player.velocity.x)
  }

  // ☄️ Asteroid Repulsion
  for (let boundary of boundaries) {
    if (boundary.isPortal) continue
    if (boundary.type === 'asteroid') {
      const push = getRepulsionVelocity(player, boundary)
      // Scale repulsion by time as well
      player.position.x += push.x * (deltaTime * 60)
      player.position.y += push.y * (deltaTime * 60)
    }
  }
}