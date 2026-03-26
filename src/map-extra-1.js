import { Boundary } from "./boundary.js";
import { Pellet, PowerUp } from "./items.js";
import { createImage } from "./map.js";

const asteroidSpriteSheet = createImage('../assets/img/asteroids_spritesheet.png')

export const mapExtra1 = [
    ['1', '-', '-', '-', '-', '-', '-', '-', '-', '-', '2'],
    ['|', 'p', '.', '.', '.', '.', '.', '.', '.', '.', '|'],
    ['|', '.', '.', 'a', '.', '.', '.', '.', '.', '.', '|'],
    ['|', '.', '.', '.', '.', '.', '!', '.', '.', '.', '|'],
    ['|', '.', '.', '.', '.', '.', '.', '.', '.', '.', '|'],
    ['|', '!', '.', '.', '.', '.', '.', 'a', '.', '.', '|'],
    ['|', '.', '.', '.', '.', '.', '.', '.', '.', '.', '|'],
    ['|', 'a', '.', '.', '.', '.', '.', '.', '.', '.', '|'],
    ['|', '.', '.', '.', '.', '.', '.', '.', '.', '.', '|'],
    ['|', '.', '.', '.', '!', '.', '.', '.', '.', 'u', '|'],
    ['|', '!', '.', '.', '.', '.', '.', 'a', '.', '.', '|'],
    ['|', '.', '.', '.', '.', '.', '.', '.', '.', 'v', '|'],
    ['4', '-', '-', '-', '-', '-', '-', '-', '-', '-', '3']
]

export function renderSpaceMap({c, pellets, powerUps, boundaries}) {
    mapExtra1.forEach((row, i) => {
        row.forEach((symbol, j) => {
            const position = {
                x: Boundary.width * j,
                y: Boundary.height * i
            }
            switch (symbol) {
                case '1': boundaries.push(new Boundary({
                    position: position,
                    image: createImage('../assets/img/pipeCorner1.png'),
                    context: c
                }))
                break
                case '-': boundaries.push(new Boundary({
                    position: position,
                    image: createImage('../assets/img/pipeHorizontal.png'),
                    context: c
                }))
                break
                case '2': boundaries.push(new Boundary({
                    position: position,
                    image: createImage('../assets/img/pipeCorner2.png'),
                    context: c
                }))
                break
                case '|': boundaries.push(new Boundary({
                    position: position,
                    image: createImage('../assets/img/pipeVertical.png'),
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
                case '.': pellets.push(new Pellet({
                    position: {
                        x: Boundary.width * j + Boundary.width / 2,
                        y: Boundary.height * i + Boundary.height / 2
                    },
                    context: c
                }))
                break
                case '!': pellets.push(new Pellet({
                    position: {
                        x: Boundary.width * j + Boundary.width / 2,
                        y: Boundary.height * i + Boundary.height / 2
                    },
                    context: c,
                    isDangerous: true
                }))
                break
                case 'u': powerUps.push(new PowerUp({
                    position: {
                        x: Boundary.width * j + Boundary.width / 2,
                        y: Boundary.height * i + Boundary.height / 2
                    },
                    context: c
                }))
                break
                case 'a': // Asteroid
                    boundaries.push(new Boundary({
                        position: position,
                        image: asteroidSpriteSheet, // Vi skickar med hela spritesheetet!
                        context: c,
                        type: 'asteroid'
                    }))
                    break
            }
        })
    })
}