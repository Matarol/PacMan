export function createGhost({ position, velocity, color = 'green' }) {

    const speed = 120

    let lastDirection = ''

    if (velocity.x > 0) lastDirection = 'right'
    else if (velocity.x < 0) lastDirection = 'left'
    else if (velocity.y > 0) lastDirection = 'down'
    else if (velocity.y < 0) lastDirection = 'up'

    return {
        position,
        velocity,
        radius: 15,
        speed,
        color,
        prevCollisions: [],
        scared: false,
        angry: false,
        timer: 0,
        eyesOffsetX: 0,
        eyesOffsetY: 0,
        lastDirection,
        cameFrom: '',
        type: 'ghost',
        draw(c) {
            //Spökets kropp
            c.beginPath()
            c.arc(this.position.x, this.position.y, this.radius, Math.PI, 0)
            c.lineTo(this.position.x + this.radius, this.position.y + this.radius)
            for (let i = 0; i <= 4; i++) {
                const waveWidth = this.radius / 2
                c.lineTo(this.position.x + this.radius - i * waveWidth, this.position.y + this.radius + (i % 2 === 0 ? 5 : 0))
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
    }
}


