import { addEntity } from "../src/utils/entityHelpers.js";
import { Boundary } from "./boundary.js";
import { Pellet, PowerUp } from "./items.js";
import { createImage } from "./classicMap.js";

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
    const pellets = world.entities.filter(e => e.type === 'pellet');
    const boundaries = world.entities.filter(e => e.type === 'boundary');
    const powerUps = world.entities.filter(e => e.type === 'powerUp');
    
    spaceLayout.forEach((row, i) => {
        row.forEach((symbol, j) => {
            const position = {
                x: Boundary.width * j,
                y: Boundary.height * i
            }
            switch (symbol) {
                case '1': { const boundary = new Boundary({
                    position: position,
                    image: createImage('../assets/img/pipeCorner1.png'),
                    context: c
                });
                addEntity(world, boundary, boundaries);
                break
            }
                case '2': { const boundary = new Boundary({
                    position: position,
                    image: createImage('../assets/img/pipeCorner2.png'),
                    context: c
                });
                addEntity(world, boundary, boundaries);
                break
            }
                case '-': { const boundary = new Boundary({
                    position: position,
                    image: createImage('../assets/img/pipeHorizontal.png'),
                    context: c
                });
                addEntity(world, boundary, boundaries);
                break
            }

                case '|': { const boundary = new Boundary({
                    position: position,
                    image: createImage('../assets/img/pipeVertical.png'),
                    context: c
                });
                addEntity(world, boundary, boundaries);
                break
            }
                case '3': { const boundary = new Boundary({
                    position: position,
                    image: createImage('../assets/img/pipeCorner3.png'),
                    context: c
                });
                addEntity(world, boundary, boundaries);
                break
            }
                case '4': { const boundary = new Boundary({
                    position: position,
                    image: createImage('../assets/img/pipeCorner4.png'),
                    context: c
                });
                addEntity(world, boundary, boundaries);
                break
            }
                case '.': { const pellet = new Pellet({
                    position: {
                        x: Boundary.width * j + Boundary.width / 2,
                        y: Boundary.height * i + Boundary.height / 2
                    },
                    context: c
                });
                addEntity(world, pellet, pellets);
                break
            }
                case 'p': { const powerUp = new PowerUp({
                    position: {
                        x: Boundary.width * j + Boundary.width / 2,
                        y: Boundary.height * i + Boundary.height / 2
                    },
                    context: c
                });
                addEntity(world, powerUp, powerUps);
                break
            }
                case '!': { const pellet = new Pellet({
                    position: {
                        x: Boundary.width * j + Boundary.width / 2,
                        y: Boundary.height * i + Boundary.height / 2
                    },
                    context: c,
                    isDangerous: true
                });
                addEntity(world, pellet, pellets);
                break
            }
                case 'u': { const powerUp = new PowerUp({
                    position: {
                        x: Boundary.width * j + Boundary.width / 2,
                        y: Boundary.height * i + Boundary.height / 2
                    },
                    context: c
                });
                addEntity(world, powerUp, powerUps);
                break
            }
                case 'a': // Asteroid
                    { const boundary = new Boundary({
                        position: position,
                        image: asteroidSpriteSheet, // Vi skickar med hela spritesheetet!
                        context: c,
                        type: 'asteroid'
                    });
                    addEntity(world, boundary, boundaries);
                    break
                }
            }
        })
    })
}