export class Villain {
    constructor({position, velocity, context}) {
        this.position = position
        this.velocity = velocity
        this.c = context
        this.radius = 25
        this.radians = 0.75
        this.openRate = 0.12
        this.rotation = 0
        this.eyesOffsetX = 3
        this.eyesOffsetY = -6
    }

    draw() {
        this.c.save()
        this.c.translate(this.position.x, this.position.y)
        this.c.rotate(this.rotation)
        this.c.translate(-this.position.x, -this.position.y)
        this.c.beginPath()
        this.c.arc(this.position.x, this.position.y, this.radius, this.radians, Math.PI * 2 - this.radians)
        this.c.lineTo(this.position.x, this.position.y)
        this.c.fillStyle = '#ff3300'
        this.c.fill()
        this.c.closePath()        
        this.c.restore()

        this.c.beginPath()
        this.c.arc(this.position.x + this.eyesOffsetX, this.position.y + this.eyesOffsetY, 3, 0, Math.PI * 2)
        this.c.closePath()
        this.c.fillStyle = 'yellow'
        this.c.fill()
    }

    update() {        
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y

        if (this.radians < 0 || this.radians > 0.75) this.openRate = -this.openRate
        this.radians += this.openRate

        if (this.velocity.x > 0) {
            this.eyesOffsetX = 3
            this.eyesOffsetY = -6
        }
        if (this.velocity.x < 0) {
            this.eyesOffsetX = -3
            this.eyesOffsetY = -6
        }
        if (this.velocity.y > 0) {
            this.eyesOffsetX = 6
            this.eyesOffsetY = 3
        }
        if (this.velocity.y < 0) {
            this.eyesOffsetX = -6
            this.eyesOffsetY = -3
        }

        this.draw()
    }
}