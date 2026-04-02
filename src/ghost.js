export class Ghost {
    static speed = 2
    constructor({position, velocity, color = 'green', context}) {
        this.position = position
        this.velocity = velocity
        this.radius = 15
        this.color = color
        this.prevCollisions = []
        this.speed = 2
        this.scared = false
        this.eyesOffsetX = 0
        this.eyesOffsetY = 0
        this.c = context
    }

    draw() {
        //Spökets kropp
        this.c.beginPath()
        this.c.arc(this.position.x, this.position.y, this.radius, Math.PI, 0)
        this.c.lineTo(this.position.x + this.radius, this.position.y + this.radius)
        for (let i = 0; i <= 4; i++) {
            const waveWidth = this.radius / 2
            this.c.lineTo(
            this.position.x + this.radius - i * waveWidth,
            this.position.y + this.radius + (i % 2 === 0 ? 5 : 0)
            )
        }
        this.c.lineTo(this.position.x - this.radius, this.position.y)
        this.c.fillStyle = this.scared ? 'blue' : this.color
        this.c.fill()
        this.c.closePath()

        //Spökets ögon
        this.c.beginPath()
        this.c.arc(this.position.x + 5, this.position.y + 5, 3, Math.PI, 0)
        this.c.lineTo(this.position.x + 8, this.position.y + 5)
        this.c.arc(this.position.x + 5, this.position.y + 7, 3, 0, Math.PI)
        this.c.closePath()
        this.c.fillStyle = 'white'
        this.c.fill()

        this.c.beginPath()
        this.c.arc(this.position.x + 5 + this.eyesOffsetX, this.position.y + 6 + this.eyesOffsetY, 2, 0, Math.PI * 2)
        this.c.closePath()
        this.c.fillStyle = 'black'
        this.c.fill()        

        this.c.beginPath()
        this.c.arc(this.position.x + -5, this.position.y + 5, 3, Math.PI, 0)
        this.c.lineTo(this.position.x -2, this.position.y + 5)
        this.c.arc(this.position.x + -5, this.position.y + 7, 3, 0, Math.PI)
        this.c.closePath()
        this.c.fillStyle = 'white'
        this.c.fill()

        this.c.beginPath()
        this.c.arc(this.position.x + -5 + this.eyesOffsetX, this.position.y + 6 + this.eyesOffsetY, 2, 0, Math.PI * 2)
        this.c.closePath()
        this.c.fillStyle = 'black'
        this.c.fill()
    }

    update() {        
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y

        this.eyesOffsetX = 0
        this.eyesOffsetY = 0

        if (this.velocity.x > 0) this.eyesOffsetX = 1.5
        else if (this.velocity.x < 0) this.eyesOffsetX = -1.5

        if (this.velocity.y > 0) this.eyesOffsetY = 1.5
        else if (this.velocity.y < 0) this.eyesOffsetY = -1.5

        // this.draw()
    }
}