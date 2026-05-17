export function createPellet({ position, color = 'white', isDangerous = false, isPortal = false }) {

    const baseRadius = isDangerous ? 4 : 3

    return {
        type: 'pellet',
        position,
        baseRadius,
        isDangerous,
        color: color || (isDangerous ? 'red' : 'white'),
        isPortal: false,
        portalTimer: null,
        radius: baseRadius,
        
        draw(c) {
            if (!c) return
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
                c.shadowBlur = 15
                c.shadowColor = color
            } else {
                c.shadowBlur = 0
            }

            if (this.isPortal) {
                const t = Date.now() / 100

                radius += (Math.sin(t) + 1) * 2
                color = 'cyan'

                c.shadowBlur = 20
                c.shadowColor = 'cyan'
            }

            this.radius = radius

            c.beginPath()
            c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
            c.fillStyle = color
            c.fill()
            c.closePath()
        }
    }
}