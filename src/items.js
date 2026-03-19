export class Pellet {
    constructor({position, context}) {
        this.position = position
        this.radius = 3
        this.c = context
    }

    draw() {
        this.c.beginPath()
        this.c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        this.c.fillStyle = 'white'
        this.c.fill()
        this.c.closePath()
    }

}

export class PowerUp {
    constructor({position, context}) {
        this.position = position
        this.radius = 8
        this.c = context
    }

    draw() {
        this.c.beginPath()
        this.c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        this.c.fillStyle = 'white'
        this.c.fill()
        this.c.closePath()
    }

}