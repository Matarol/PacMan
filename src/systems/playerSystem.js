import { getBoundaries, getPlayer } from "../utils/entitySelectors.js";
import { circleCollidesWithRectangle, isCenteredInTile } from "../collision.js";
import { playSound } from "../audioManager.js";

export function updatePlayer(world, deltaTime) {
  const player = getPlayer(world)

  if (!player) return

  if (player.physicsMode === 'SPACE') {
    handlePlayerSpaceMovement(world, deltaTime)
  } else {
    handlePlayerClassicMovement(world, deltaTime)
  }  
  updatePlayerStateAndPosition(world, deltaTime)
}

function updatePlayerStateAndPosition(world, deltaTime) {
    const player = getPlayer(world);

    player.position.x += player.velocity.x * deltaTime;
    player.position.y += player.velocity.y * deltaTime;

    //mun animation
    if (player.radians < 0 || player.radians > 0.75) {
        player.openRate = -player.openRate
        }
    player.radians += player.openRate

    // ögon riktning
    if (player.velocity.x > 0) {
        player.eyesOffsetX = 3
        player.eyesOffsetY = -6
    }

    if (player.velocity.x < 0) {
        player.eyesOffsetX = -3
        player.eyesOffsetY = -6
    }

    if (player.velocity.y > 0) {
        player.eyesOffsetX = 6
        player.eyesOffsetY = 3
    }

    if (player.velocity.y < 0) {
        player.eyesOffsetX = -6
        player.eyesOffsetY = -3
    }
}

function handlePlayerClassicMovement(world, deltaTime) {
  const { directionState } = world
  const player = getPlayer(world)
  const boundaries = getBoundaries(world)

  if (!player) return

  let currentDirection = directionState.currentDirection
  let nextDirection = directionState.nextDirection

  const speed = 200

  const directions = {
    w: { x: 0, y: -speed },
    a: { x: -speed, y: 0 },
    s: { x: 0, y: speed },
    d: { x: speed, y: 0 }
  }

  // 🔥 Try to switch direction FIRST
  if (nextDirection && isCenteredInTile(player)) {
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
    let currentlyTouchingPortal = false // Skapa en lokal variabel för denna frame

    for (let boundary of boundaries) {
      if (circleCollidesWithRectangle({
        circle: { ...player, velocity: {
          x: velocity.x * deltaTime,
          y: velocity.y * deltaTime
        } },
        rectangle: boundary
      })) {

        if (boundary.isPortal) {
          currentlyTouchingPortal = true // Vi vet att vi nuddar en portal
          if (!player.isInPortal) {
            playSound('portal')
            player.isInPortal = true
          }
        } else {
          blocked = true
          // Vi behöver inte sätta player.isInPortal = false här längre
          break
        }
      }
    }

    // --- HÄR SKA NOLLSTÄLLNINGEN LIGGA (Utanför loopen) ---
    // Om vi inte nuddade någon portal alls under hela loopen, nollställ flaggan
    if (!currentlyTouchingPortal) {
      player.isInPortal = false
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

  directionState.currentDirection = currentDirection
  directionState.nextDirection = nextDirection
}

function handlePlayerSpaceMovement(world, deltaTime) {
  const player = getPlayer(world)
  const boundaries = getBoundaries(world)
  const keys = world.keys

  const acceleration = 500
  const friction = 0.98

  // 1. Rörelse & Friktion
  if (keys.w.pressed) player.velocity.y -= acceleration * deltaTime
  if (keys.s.pressed) player.velocity.y += acceleration * deltaTime
  if (keys.a.pressed) player.velocity.x -= acceleration * deltaTime
  if (keys.d.pressed) player.velocity.x += acceleration * deltaTime

  const frictionAdjustment = Math.pow(friction, deltaTime * 60)
  player.velocity.x *= frictionAdjustment
  player.velocity.y *= frictionAdjustment

  // 2. Flytta först
  // player.position.x += player.velocity.x * deltaTime
  // player.position.y += player.velocity.y * deltaTime

  // 2. Ny 'tvåa' där kollision använder 'predicted position' för att undvika att flytta spelaren i denna funktion.
  const nextPosition = {
    x: player.position.x + player.velocity.x * deltaTime,
    y: player.position.y + player.velocity.y * deltaTime
  }

  // 3. Korrigering mot väggar
  for (let boundary of boundaries) {
    if (boundary.isPortal) continue

    // Hitta den punkt på rektangeln som är närmast cirkelns centrum
    const closestX = Math.max(boundary.position.x, Math.min(nextPosition.x, boundary.position.x + boundary.width))
    const closestY = Math.max(boundary.position.y, Math.min(nextPosition.y, boundary.position.y + boundary.height))

    // Räkna ut avståndet från cirkelns centrum till denna punkt
    const distanceX = nextPosition.x - closestX
    const distanceY = nextPosition.y - closestY
    const distanceSquared = distanceX * distanceX + distanceY * distanceY

    // Om avståndet är mindre än radien har vi en kollision
    if (distanceSquared < player.radius * player.radius) {
      const distance = Math.sqrt(distanceSquared)
      
      // Förhindra division med noll om man är exakt på punkten
      if (distance === 0) continue 
      
      // Normalisera riktningen (varifrån ska vi knuffa?)
      const nx = distanceX / distance
      const ny = distanceY / distance

      // Stoppa bara den del av hastigheten som går MOT väggen (viktigt för glid!)
      // Detta kallas "Dot Product Projection"
      const dot = player.velocity.x * nx + player.velocity.y * ny
      if (dot < 0) {
        player.velocity.x -= dot * nx
        player.velocity.y -= dot * ny
      }
    }
  }

  // 4. Rotation
  if (Math.hypot(player.velocity.x, player.velocity.y) > 1) {
    player.rotation = Math.atan2(player.velocity.y, player.velocity.x)
  }
}

