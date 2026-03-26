import { Boundary } from "./boundary.js"
import { Pellet } from "./items.js"
import { PowerUp } from "./items.js"

export const portalImages = [
    createImage('../assets/img/portal_block_1.png'),
    createImage('../assets/img/portal_block_2.png'),
    createImage('../assets/img/portal_block_3.png'),
    createImage('../assets/img/portal_block_4.png'),
    createImage('../assets/img/portal_block_5.png')
]

export const map = [
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

export function renderMap({c, pellets, powerUps, boundaries}) {
    map.forEach((row, i) => {
        row.forEach((symbol, j) => {
            const position = {
                x: Boundary.width * j,
                y: Boundary.height * i
            }
            switch (symbol) {
                case '-': boundaries.push(new Boundary({
                    position: position,
                    image: createImage('../assets/img/pipeHorizontal.png'),
                    context: c
                }))
                break
                case '|': boundaries.push(new Boundary({
                    position: position,
                    image: createImage('../assets/img/pipeVertical.png'),
                    context: c
                }))
                break
                case '1': boundaries.push(new Boundary({
                    position: position,
                    image: createImage('../assets/img/pipeCorner1.png'),
                    context: c
                }))
                break
                case '2': boundaries.push(new Boundary({
                    position: position,
                    image: createImage('../assets/img/pipeCorner2.png'),
                    context: c
                }))
                break
                case '3': boundaries.push(new Boundary({
                    position: position,
                    image: createImage('../assets/img/pipeCorner3.png'),
                    context: c
                }))
                break
                case '4': boundaries.push(new Boundary({
                    position: position,
                    image: createImage('../assets/img/pipeCorner4.png'),
                    context: c
                }))
                break
                case 'b':
                    const boundary = new Boundary({
                        position: position,
                        image: createImage('../assets/img/block.png'),
                        context: c
                    })
                    boundary.type = 'block'
                    boundaries.push(boundary)
                break
                case '[': boundaries.push(new Boundary({
                    position: position,
                    image: createImage('../assets/img/capLeft.png'),
                    context: c
                }))
                break
                case '7': boundaries.push(new Boundary({
                    position: position,
                    image: createImage('../assets/img/pipeConnectorBottom.png'),
                    context: c
                }))
                break
                case ']': boundaries.push(new Boundary({
                    position: position,
                    image: createImage('../assets/img/capRight.png'),
                    context: c
                }))
                break
                case '_': boundaries.push(new Boundary({
                    position: position,
                    image: createImage('../assets/img/capBottom.png'),
                    context: c
                }))
                break
                case '^': boundaries.push(new Boundary({
                    position: position,
                    image: createImage('../assets/img/capTop.png'),
                    context: c
                }))
                break
                case '+': boundaries.push(new Boundary({
                    position: position,
                    image: createImage('../assets/img/pipeCross.png'),
                    context: c
                }))
                break
                case '5': boundaries.push(new Boundary({
                    position: position,
                    image: createImage('../assets/img/pipeConnectorTop.png'),
                    context: c
                }))
                break
                case '.': pellets.push(new Pellet({
                    position: {
                        x: Boundary.width * j + Boundary.width / 2,
                        y: Boundary.height * i + Boundary.height / 2
                    },
                    context: c
                }))
                break
                case 'p': powerUps.push(new PowerUp({
                    position: {
                        x: Boundary.width * j + Boundary.width / 2,
                        y: Boundary.height * i + Boundary.height / 2
                    },
                    context: c
                }))
                break
                case '!': pellets.push(new Pellet({
                    position: {
                        x: position.x + Boundary.width / 2,
                        y: position.y + Boundary.height / 2
                    },
                    context: c,
                    isDangerous: true, // Vi måste lägga till detta i Pellet-klassen
                    color: 'red' // Gör dem röda så de ser farliga ut
                })); break;
            }
        })
    })
}