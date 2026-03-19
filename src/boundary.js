export class Boundary {
    static width = 40
    static height = 40
    constructor({position, image, context}) {
        this.position = position
        this.width = 40
        this.height = 40
        this.image = image
        this.c = context
    }

    draw() {
        // c.fillStyle = 'blue'
        // c.fillRect(this.position.x, this.position.y, this.width, this.height)

        this.c.drawImage(this.image, this.position.x, this.position.y)
    }
}