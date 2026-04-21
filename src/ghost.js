export class Ghost {
    static speed = 120
    constructor({position, velocity, color = 'green'}) {
        this.position = position
        this.velocity = velocity
        this.radius = 15
        this.color = color
        this.prevCollisions = []
        // this.speed = 2
        this.scared = false
        this.angry = false
        this.timer = 0
        this.eyesOffsetX = 0
        this.eyesOffsetY = 0
        this.lastDirection = ''
    }

    draw(c) {
        //Spökets kropp
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, Math.PI, 0)
        c.lineTo(this.position.x + this.radius, this.position.y + this.radius)
        for (let i = 0; i <= 4; i++) {
            const waveWidth = this.radius / 2
            c.lineTo(
            this.position.x + this.radius - i * waveWidth,
            this.position.y + this.radius + (i % 2 === 0 ? 5 : 0)
            )
        }
        c.lineTo(this.position.x - this.radius, this.position.y)
        c.fillStyle = this.scared ? 'blue' : (this.angry ? 'purple' : this.color)
        c.fill()
        c.closePath()

        //Spökets ögon
        c.beginPath()
        c.arc(this.position.x + 5, this.position.y + 5, 3, Math.PI, 0)
        c.lineTo(this.position.x + 8, this.position.y + 5)
        c.arc(this.position.x + 5, this.position.y + 7, 3, 0, Math.PI)
        c.closePath()
        c.fillStyle = 'white'
        c.fill()

        c.beginPath()
        c.arc(this.position.x + 5 + this.eyesOffsetX, this.position.y + 6 + this.eyesOffsetY, 2, 0, Math.PI * 2)
        c.closePath()
        c.fillStyle = 'black'
        c.fill()        

        c.beginPath()
        c.arc(this.position.x + -5, this.position.y + 5, 3, Math.PI, 0)
        c.lineTo(this.position.x -2, this.position.y + 5)
        c.arc(this.position.x + -5, this.position.y + 7, 3, 0, Math.PI)
        c.closePath()
        c.fillStyle = 'white'
        c.fill()

        c.beginPath()
        c.arc(this.position.x + -5 + this.eyesOffsetX, this.position.y + 6 + this.eyesOffsetY, 2, 0, Math.PI * 2)
        c.closePath()
        c.fillStyle = 'black'
        c.fill()
    }

    becomeScared() {
        this.scared = true
        this.angry = false
        this.timer = 400
    }

    update(deltaTime, playerPosition) {
        
        if (this.timer > 0) {
            this.timer -= deltaTime * 60


            if (this.timer <= 0) {
                if (this.scared) {
                    this.scared = false
                    this.angry = true
                    this.timer = 600
                } else if (this.angry) {
                    this.angry = false
                }
            }
        }
        this.position.x += this.velocity.x * deltaTime
        this.position.y += this.velocity.y * deltaTime

        this.eyesOffsetX = 0
        this.eyesOffsetY = 0

        const maxPupilsOffset = 1.5

        if (this.angry && playerPosition) {
            const dx = playerPosition.x - this.position.x
            const dy = playerPosition.y - this.position.y
            const angle = Math.atan2(dy, dx)
            this.eyesOffsetX = Math.cos(angle) * maxPupilsOffset
            this.eyesOffsetY = Math.sin(angle) * maxPupilsOffset
        }
        else if (!this.scared) {
            if (this.velocity.x > 0) this.eyesOffsetX = maxPupilsOffset
            else if (this.velocity.x < 0) this.eyesOffsetX = -maxPupilsOffset

            if (this.velocity.y > 0) this.eyesOffsetY = maxPupilsOffset
            else if (this.velocity.y < 0) this.eyesOffsetY = -maxPupilsOffset
        }
    }
}