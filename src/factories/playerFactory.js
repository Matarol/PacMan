export function createPlayer({ position, velocity }) {
    return {
        position,
        velocity,
        radius: 15,
        radians: 0.75,
        openRate: 0.12,
        rotation: 0,
        eyesOffsetX: 3,
        eyesOffsetY: -6,
        type: 'player',
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
    };
}