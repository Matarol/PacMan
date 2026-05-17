export function createFloatingText({ position, text, color}) {
    return {
        position: { x: position.x, y: position.y },
        velocity: { x: 0, y: -1 }, // Rör sig uppåt
        opacity: 1,
        text: text,
        color: color,

        draw(c) {
            c.save()
            c.globalAlpha = this.opacity
            c.fillStyle = this.color
            c.font = 'bold 24px Arial'
            c.fillText(this.text, this.position.x, this.position.y)
            c.restore()
        },
        update() {
            this.position.y += this.velocity.y
            this.opacity -= 0.01 // Tonar bort över ca 1.5 sekund
        }
    }
}
