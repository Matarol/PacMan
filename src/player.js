export class Player {
    constructor({position, velocity}) {
        this.position = position
        this.velocity = velocity
        this.radius = 15
        this.radians = 0.75
        this.openRate = 0.12
        this.rotation = 0
        this.eyesOffsetX = 3
        this.eyesOffsetY = -6
    }

    draw(c) {
        c.save()
        c.translate(this.position.x, this.position.y)
        c.rotate(this.rotation)
        c.translate(-this.position.x, -this.position.y)
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, this.radians, Math.PI * 2 - this.radians)
        c.lineTo(this.position.x, this.position.y)
        c.fillStyle = 'yellow'
        c.fill()
        c.closePath()        
        c.restore()

        c.beginPath()
        c.arc(this.position.x + this.eyesOffsetX, this.position.y + this.eyesOffsetY, 3, 0, Math.PI * 2)
        c.closePath()
        c.fillStyle = 'black'
        c.fill()
    }

    update(deltaTime) {        
        this.position.x += this.velocity.x * deltaTime
        this.position.y += this.velocity.y * deltaTime

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
    }
}