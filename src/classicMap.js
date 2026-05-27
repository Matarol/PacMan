import { createPellet } from "./factories/pelletFactory.js"
import { addEntity } from "./utils/entityHelpers.js"
import { createPowerUp } from "./factories/powerUpFactory.js"
import { createBoundary } from "./factories/boundaryFactory.js"
import { TILE_SIZE } from "./constants/gameConstants.js"

export const portalImages = [
    createImage('../assets/img/portal_block_1.png'),
    createImage('../assets/img/portal_block_2.png'),
    createImage('../assets/img/portal_block_3.png'),
    createImage('../assets/img/portal_block_4.png'),
    createImage('../assets/img/portal_block_5.png')
]

export const classicLayout = [
    ['1', '-', '-', '-', '-', '-', '-', '-', '-', '-', '2'],
    ['|', '.', '.', '.', '.', '.', '.', '.', '.', '.', '|'],    
    ['|', '.', 'b', '.', '[', '7', ']', '.', 'b', '.', '|'],
    ['|', '.', '.', '.', '.', '_', '.', '.', '.', '.', '|'],
    ['|', '.', '[', ']', '.', '.', '.', '[', ']', '.', '|'],
    ['|', '.', '.', '.', '.', '^', '.', '.', '.', '.', '|'],
    ['|', '.', 'b', '.', '[', '+', ']', '.', 'b', '.', '|'],
    ['|', '.', '.', '.', '.', '_', '.', '.', '.', '.', '|'],
    ['|', '.', '[', ']', '.', '.', '.', '[', ']', '.', '|'],
    ['|', '.', '.', '.', '.', '^', '.', '.', '.', '.', '|'],
    ['|', '.', 'b', '.', '[', '5', ']', '.', 'b', '.', '|'],
    ['|', '.', '.', '.', '.', '.', '.', '.', '.', 'p', '|'],    
    ['4', '-', '-', '-', '-', '-', '-', '-', '-', '-', '3']
]

export function createImage(src) {
    const image = new Image()
    image.src = src
    return image
}

export function buildClassicMap(world) {

    classicLayout.forEach((row, i) => {
        row.forEach((symbol, j) => {
            const position = {
                x: TILE_SIZE * j,
                y: TILE_SIZE * i
            }
            switch (symbol) {
                case '-': { const boundary = createBoundary({
                    position: position,
                    image: createImage('../assets/img/pipeHorizontal.png')
                });
                addEntity(world, boundary);
                break
            }
                case '|': { const boundary = createBoundary({
                    position: position,
                    image: createImage('../assets/img/pipeVertical.png')
                });
                addEntity(world, boundary);
                break
            }
                case '1': { const boundary = createBoundary({
                    position: position,
                    image: createImage('../assets/img/pipeCorner1.png')
                });
                addEntity(world, boundary);
                break
            }
                case '2': { const boundary = createBoundary({
                    position: position,
                    image: createImage('../assets/img/pipeCorner2.png')
                });
                addEntity(world, boundary);
                break
            }
                case '3': { const boundary = createBoundary({
                    position: position,
                    image: createImage('../assets/img/pipeCorner3.png')
                });
                addEntity(world, boundary);
                break
            }
                case '4': { const boundary = createBoundary({
                    position: position,
                    image: createImage('../assets/img/pipeCorner4.png')
                });
                addEntity(world, boundary);
                break
            }
                case 'b': {
                    const boundary = createBoundary({
                        position: position,
                        image: createImage('../assets/img/block.png'),                        
                        isBlock: true
                    })
                    addEntity(world, boundary);
                break
            }
                case '[': { const boundary = createBoundary({
                    position: position,
                    image: createImage('../assets/img/capLeft.png')
                });
                addEntity(world, boundary);
                break
            }
                case '7': { const boundary = createBoundary({
                    position: position,
                    image: createImage('../assets/img/pipeConnectorBottom.png')
                });
                addEntity(world, boundary);
                break
            }
                case ']': { const boundary = createBoundary({
                    position: position,
                    image: createImage('../assets/img/capRight.png')
                });
                addEntity(world, boundary);
                break
            }
                case '_': { const boundary = createBoundary({
                    position: position,
                    image: createImage('../assets/img/capBottom.png')
                });
                addEntity(world, boundary);
                break
            }
                case '^': { const boundary = createBoundary({
                    position: position,
                    image: createImage('../assets/img/capTop.png')
                });
                addEntity(world, boundary);
                break
            }
                case '+': { const boundary = createBoundary({
                    position: position,
                    image: createImage('../assets/img/pipeCross.png')
                });
                addEntity(world, boundary);
                break
            }
                case '5': { const boundary = createBoundary({
                    position: position,
                    image: createImage('../assets/img/pipeConnectorTop.png')
                });
                addEntity(world, boundary);
                break
            }
                case '.': { const pellet = createPellet({
                    position: {
                        x: TILE_SIZE * j + TILE_SIZE / 2,
                        y: TILE_SIZE * i + TILE_SIZE / 2
                    }
                });
                addEntity(world, pellet);
                break
            }
                case 'p': { const powerUp = createPowerUp({
                    position: {
                        x: TILE_SIZE * j + TILE_SIZE / 2,
                        y: TILE_SIZE * i + TILE_SIZE / 2
                    },
                    color: 'white'
                })
                addEntity(world, powerUp);
                break
            }
                case '!': { const pellet = createPellet({
                    position: {
                        x: position.x + TILE_SIZE / 2,
                        y: position.y + TILE_SIZE / 2
                    },
                    isDangerous: true,
                    color: 'red' // Gör dem röda så de ser farliga ut
                });
                addEntity(world, pellet);
                break;
            }
            }
        })
    })
}