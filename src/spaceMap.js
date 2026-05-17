import { addEntity } from "../src/utils/entityHelpers.js";
import { Boundary } from "./boundary.js";
import { createImage } from "./classicMap.js";
import { createPellet } from "./factories/pelletFactory.js";
import { getBoundaries, getPellets, getPowerUps } from "./utils/entitySelectors.js";
import { createPowerUp } from "./factories/powerUpFactory.js";
import { createBoundary } from "./factories/boundaryFactory.js";

const asteroidSpriteSheet = createImage('../assets/img/asteroids_spritesheet1.png')

export const spaceLayout = [
    ['1', '-', '-', '-', '-', '-', '-', '-', '-', '-', '2'],
    ['|', 'p', '.', '.', '.', '.', '.', '.', 'a', '.', '|'],
    ['|', '.', '.', 'a', '.', '.', '.', '.', '.', '.', '|'],
    ['|', '.', '.', '.', '.', '.', '!', '.', '.', '.', '|'],
    ['|', '.', '.', '.', '.', '.', '.', '.', '.', '.', '|'],
    ['|', '!', '.', '.', 'a', '.', '.', 'a', '.', '.', '|'],
    ['|', '.', '.', '.', '.', '.', '.', '.', '.', '.', '|'],
    ['|', 'a', '.', '.', '.', '.', '.', '.', '.', '.', '|'],
    ['|', '.', '.', '.', '.', '.', '.', '.', '.', '.', '|'],
    ['|', '.', '.', 'a', '!', '.', '.', '.', '.', 'u', '|'],
    ['|', '!', '.', '.', '.', '.', '.', 'a', '.', '.', '|'],
    ['|', '.', '.', '.', '.', '.', '.', '.', '.', 'v', '|'],
    ['4', '-', '-', '-', '-', '-', '-', '-', '-', '-', '3']
]

export function buildSpaceMap(world) {
    const { c } = world;
    const pellets = getPellets(world);
    const boundaries = getBoundaries(world);
    const powerUps = getPowerUps(world);

    spaceLayout.forEach((row, i) => {
        row.forEach((symbol, j) => {
            const position = {
                x: Boundary.width * j,
                y: Boundary.height * i
            }
            switch (symbol) {
                case '1': { const boundary = createBoundary({
                    position: position,
                    image: createImage('../assets/img/pipeCorner1.png'),
                    context: c
                });
                addEntity(world, boundary);
                break
            }
                case '2': { const boundary = createBoundary({
                    position: position,
                    image: createImage('../assets/img/pipeCorner2.png'),
                    context: c
                });
                addEntity(world, boundary);
                break
            }
                case '-': { const boundary = createBoundary({
                    position: position,
                    image: createImage('../assets/img/pipeHorizontal.png'),
                    context: c
                });
                addEntity(world, boundary);
                break
            }

                case '|': { const boundary = createBoundary({
                    position: position,
                    image: createImage('../assets/img/pipeVertical.png'),
                    context: c
                });
                addEntity(world, boundary);
                break
            }
                case '3': { const boundary = createBoundary({
                    position: position,
                    image: createImage('../assets/img/pipeCorner3.png'),
                    context: c
                });
                addEntity(world, boundary);
                break
            }
                case '4': { const boundary = createBoundary({
                    position: position,
                    image: createImage('../assets/img/pipeCorner4.png'),
                    context: c
                });
                addEntity(world, boundary);
                break
            }
                case '.': { const pellet = createPellet({
                    position: {
                        x: Boundary.width * j + Boundary.width / 2,
                        y: Boundary.height * i + Boundary.height / 2
                    },
                    context: c
                });
                addEntity(world, pellet);
                break
            }
                case 'u': { const powerUp = createPowerUp({
                    position: {
                        x: Boundary.width * j + Boundary.width / 2,
                        y: Boundary.height * i + Boundary.height / 2
                    },
                    context: c
                });
                addEntity(world, powerUp);
                break
            }
                case '!': { const pellet = createPellet({
                    position: {
                        x: Boundary.width * j + Boundary.width / 2,
                        y: Boundary.height * i + Boundary.height / 2
                    },
                    context: c,
                    isDangerous: true
                });
                addEntity(world, pellet);
                break
            }
                case 'u': { const powerUp = createPowerUp({
                    position: {
                        x: Boundary.width * j + Boundary.width / 2,
                        y: Boundary.height * i + Boundary.height / 2
                    },
                    context: c
                });
                addEntity(world, powerUp);
                break
            }
                case 'a': // Asteroid
                    { const boundary = createBoundary({
                        position: position,
                        image: asteroidSpriteSheet, // Vi skickar med hela spritesheetet!
                        context: c,
                        type: 'asteroid'
                    });
                    addEntity(world, boundary);
                    break
                }
            }
        })
    })
}