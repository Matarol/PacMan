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

export function buildClassicMap({pellets, powerUps, boundaries}) {
    classicLayout.forEach((row, i) => {
        row.forEach((symbol, j) => {
            const position = {
                x: Boundary.width * j,
                y: Boundary.height * i
            }
            switch (symbol) {
                case '-': boundaries.push(new Boundary({
                    position: position,
                    image: createImage('../assets/img/pipeHorizontal.png')
                }))
                break
                case '|': boundaries.push(new Boundary({
                    position: position,
                    image: createImage('../assets/img/pipeVertical.png')
                }))
                break
                case '1': boundaries.push(new Boundary({
                    position: position,
                    image: createImage('../assets/img/pipeCorner1.png')
                }))
                break
                case '2': boundaries.push(new Boundary({
                    position: position,
                    image: createImage('../assets/img/pipeCorner2.png')
                }))
                break
                case '3': boundaries.push(new Boundary({
                    position: position,
                    image: createImage('../assets/img/pipeCorner3.png')
                }))
                break
                case '4': boundaries.push(new Boundary({
                    position: position,
                    image: createImage('../assets/img/pipeCorner4.png')
                }))
                break
                case 'b':
                    const boundary = new Boundary({
                        position: position,
                        image: createImage('../assets/img/block.png')
                    })
                    boundary.type = 'block'
                    boundaries.push(boundary)
                break
                case '[': boundaries.push(new Boundary({
                    position: position,
                    image: createImage('../assets/img/capLeft.png')
                }))
                break
                case '7': boundaries.push(new Boundary({
                    position: position,
                    image: createImage('../assets/img/pipeConnectorBottom.png')
                }))
                break
                case ']': boundaries.push(new Boundary({
                    position: position,
                    image: createImage('../assets/img/capRight.png')
                }))
                break
                case '_': boundaries.push(new Boundary({
                    position: position,
                    image: createImage('../assets/img/capBottom.png')
                }))
                break
                case '^': boundaries.push(new Boundary({
                    position: position,
                    image: createImage('../assets/img/capTop.png')
                }))
                break
                case '+': boundaries.push(new Boundary({
                    position: position,
                    image: createImage('../assets/img/pipeCross.png')
                }))
                break
                case '5': boundaries.push(new Boundary({
                    position: position,
                    image: createImage('../assets/img/pipeConnectorTop.png')
                }))
                break
                case '.': pellets.push(new Pellet({
                    position: {
                        x: Boundary.width * j + Boundary.width / 2,
                        y: Boundary.height * i + Boundary.height / 2
                    }
                }))
                break
                case 'p': powerUps.push(new PowerUp({
                    position: {
                        x: Boundary.width * j + Boundary.width / 2,
                        y: Boundary.height * i + Boundary.height / 2
                    }
                }))
                break
                case '!': pellets.push(new Pellet({
                    position: {
                        x: position.x + Boundary.width / 2,
                        y: position.y + Boundary.height / 2
                    },
                    isDangerous: true,
                    color: 'red' // Gör dem röda så de ser farliga ut
                })); break;
            }
        })
    })
}