export class Pellet {
    constructor({ position, context, color, isDangerous = false }) {
        this.position = position
        this.baseRadius = isDangerous ? 4 : 3
        this.c = context
        this.isDangerous = isDangerous
        this.color = color || (isDangerous ? 'red' : 'white')
        this.isPortal = false
        this.portalTimer = null
    }

    draw() {
        const time = Date.now() / 150

        let radius = this.baseRadius
        let color = this.color

        if (this.isDangerous) {
            const pulse = Math.sin(time)

            // 🔥 Pulsande storlek (alltid positiv)
            radius += (pulse + 1) * 1.5

            // 🔥 Pulsande färg
            const red = 200 + Math.sin(time) * 55
            color = `rgb(${red}, 50, 50)`

            // ✨ Glow-effekt
            this.c.shadowBlur = 15
            this.c.shadowColor = color
        } else {
            this.c.shadowBlur = 0
        }

        if (this.isPortal) {
            const t = Date.now() / 100

            radius += (Math.sin(t) + 1) * 2
            color = 'cyan'

            this.c.shadowBlur = 20
            this.c.shadowColor = 'cyan'
        }

        this.radius = radius

        this.c.beginPath()
        this.c.arc(this.position.x, this.position.y, radius, 0, Math.PI * 2)
        this.c.fillStyle = color
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