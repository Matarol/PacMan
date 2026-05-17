export function createPowerUp({ position, color }) {
    return {
        type: 'powerUp',
        position,
        radius: 8,
        color: color || 'white',
        draw(c) {
            c.beginPath()
            c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
            c.fillStyle = this.color
            c.fill()
            c.closePath()
        }
    }
}