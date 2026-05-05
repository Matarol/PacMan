import { Boundary } from "./boundary.js"
import { Pellet } from "./items.js"
import { PowerUp } from "./items.js"
import { addEntity } from "./utils/entityHelpers.js"

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

    const { c } = world;

    const boundaries = world.entities.filter(e => e.type === 'boundary');
    const powerUps = world.entities.filter(e => e.type === 'powerUp');
    const pellets = world.entities.filter(e => e.type === 'pellet');

    classicLayout.forEach((row, i) => {
        row.forEach((symbol, j) => {
            const position = {
                x: Boundary.width * j,
                y: Boundary.height * i
            }
            switch (symbol) {
                case '-': { const boundary = new Boundary({
                    position: position,
                    image: createImage('../assets/img/pipeHorizontal.png')
                });
                addEntity(world, boundary, boundaries);
                break
            }
                case '|': { const boundary = new Boundary({
                    position: position,
                    image: createImage('../assets/img/pipeVertical.png')
                });
                addEntity(world, boundary, boundaries);
                break
            }
                case '1': { const boundary = new Boundary({
                    position: position,
                    image: createImage('../assets/img/pipeCorner1.png')
                });
                addEntity(world, boundary, boundaries);
                break
            }
                case '2': { const boundary = new Boundary({
                    position: position,
                    image: createImage('../assets/img/pipeCorner2.png')
                });
                addEntity(world, boundary, boundaries);
                break
            }
                case '3': { const boundary = new Boundary({
                    position: position,
                    image: createImage('../assets/img/pipeCorner3.png')
                });
                addEntity(world, boundary, boundaries);
                break
            }
                case '4': { const boundary = new Boundary({
                    position: position,
                    image: createImage('../assets/img/pipeCorner4.png')
                });
                addEntity(world, boundary, boundaries);
                break
            }
                case 'b': {
                    const boundary = new Boundary({
                        position: position,
                        image: createImage('../assets/img/block.png')
                    })
                    boundary.boundaryType = 'block'
                    addEntity(world, boundary, boundaries);
                break
            }
                case '[': { const boundary = new Boundary({
                    position: position,
                    image: createImage('../assets/img/capLeft.png')
                });
                addEntity(world, boundary, boundaries);
                break
            }
                case '7': { const boundary = new Boundary({
                    position: position,
                    image: createImage('../assets/img/pipeConnectorBottom.png')
                });
                addEntity(world, boundary, boundaries);
                break
            }
                case ']': { const boundary = new Boundary({
                    position: position,
                    image: createImage('../assets/img/capRight.png')
                });
                addEntity(world, boundary, boundaries);
                break
            }
                case '_': { const boundary = new Boundary({
                    position: position,
                    image: createImage('../assets/img/capBottom.png')
                });
                addEntity(world, boundary, boundaries);
                break
            }
                case '^': { const boundary = new Boundary({
                    position: position,
                    image: createImage('../assets/img/capTop.png')
                });
                addEntity(world, boundary, boundaries);
                break
            }
                case '+': { const boundary = new Boundary({
                    position: position,
                    image: createImage('../assets/img/pipeCross.png')
                });
                addEntity(world, boundary, boundaries);
                break
            }
                case '5': { const boundary = new Boundary({
                    position: position,
                    image: createImage('../assets/img/pipeConnectorTop.png')
                });
                addEntity(world, boundary, boundaries);
                break
            }
                case '.': { const pellet = new Pellet({
                    position: {
                        x: Boundary.width * j + Boundary.width / 2,
                        y: Boundary.height * i + Boundary.height / 2
                }});
                addEntity(world, pellet, pellets);
                break
            }
                case 'p': { const powerUp = new PowerUp({
                    position: {
                        x: Boundary.width * j + Boundary.width / 2,
                        y: Boundary.height * i + Boundary.height / 2
                    }
                })
                addEntity(world, powerUp, powerUps);
                break
            }
                case '!': { const pellet = new Pellet({
                    position: {
                        x: position.x + Boundary.width / 2,
                        y: position.y + Boundary.height / 2
                    },
                    isDangerous: true,
                    color: 'red' // Gör dem röda så de ser farliga ut
                });
                addEntity(world, pellet, pellets);
                break;
            }
            }
        })
    })
}