export class Pellet {
    constructor({position, context, color, isDangerous = false}) {
        this.position = position
        this.radius = (isDangerous ? 5 : 3)
        this.c = context
        this.isDangerous = isDangerous
        this.color = color || (isDangerous ? 'red' : 'white')
        
    }

    draw() {
        this.c.beginPath()
        this.c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        this.c.fillStyle = this.color
        this.c.fill()
        this.c.closePath()
    }

}

export class PowerUp {
    constructor({position, context, color}) {
        this.position = position
        this.radius = 8
        this.c = context
        this.color = color || 'white'
    }

    draw() {
        this.c.beginPath()
        this.c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        this.c.fillStyle = this.color
        this.c.fill()
        this.c.closePath()
    }

}