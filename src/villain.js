export class Villain {
    constructor({position, velocity}) {
        this.position = position
        this.velocity = velocity
        this.radius = 25
        this.radians = 0.75
        this.openRate = 0.12
        this.rotation = 0
        this.eyesOffsetX = 3
        this.eyesOffsetY = -6
        this.miniature = false
        this.type = 'villain'
    }

    draw(c) {
        c.save()
        c.translate(this.position.x, this.position.y)
        c.rotate(this.rotation)
        c.translate(-this.position.x, -this.position.y)
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, this.radians, Math.PI * 2 - this.radians)
        c.lineTo(this.position.x, this.position.y)
        c.fillStyle = this.miniature ? '#f863d5' : '#ff3300'
        c.fill()
        c.closePath()        
        c.restore()

        c.beginPath()
        c.arc(this.position.x + this.eyesOffsetX, this.position.y + this.eyesOffsetY, 3, 0, Math.PI * 2)
        c.closePath()
        c.fillStyle = 'black'
        c.fill()
    }

    update() {        
        this.radius = this.miniature ? 10 : 25

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
    }
}