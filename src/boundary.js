import { portalImages } from "./classicMap.js";

export class Boundary {
    static width = 40
    static height = 40

    static spriteFrameWidth = 256
    static spriteFrameHeight = 256
    static totalFrames = 16
    static columns = 4

    constructor({position, image, type}) {
        this.position = position
        this.width = 40
        this.height = 40
        this.originalImage = image
        this.image = image
        this.type = type
        this.isPortal = false
        this.portalFrame = 0
        this.asteroidFrame = 0
        this.animationSpeed = 0.1
    }

    draw(c) {
        if (!c) return

        try {
            // 🌀 Om detta block just nu är en aktiv portal
            if (this.isPortal && portalImages.length > 0) {
                // Animera genom att stega framåt i arrayen (0-4)
                this.portalFrame += this.animationSpeed
                const frameIndex = Math.floor(this.portalFrame) % portalImages.length
                const currentPortalImg = portalImages[frameIndex]

                if (currentPortalImg.complete) {
                    c.drawImage(currentPortalImg, this.position.x, this.position.y, this.width, this.height)
                } else {
                    c.fillStyle = '#9b59b6'
                    c.fillRect(this.position.x, this.position.y, this.width, this.height)
                }
                return 
            }

            // ☄️ Logik för asteroider (Rymdbanan)
            if (this.type === 'asteroid') {
                this.asteroidFrame += this.animationSpeed
                const frameIndex = Math.floor(this.asteroidFrame) % Boundary.totalFrames
                const row = Math.floor(frameIndex / Boundary.columns)
                const col = frameIndex % Boundary.columns

                c.save()
                c.globalCompositeOperation = 'Screen'
                c.drawImage(
                    this.image,
                    col * 256,
                    row * 256,
                    256,
                    256,
                    this.position.x,
                    this.position.y,
                    this.width,
                    this.height
                )
                c.restore()
            } else {
                // 🧱 Vanlig vägg (Klassiska banan)
                if (this.image) {
                    c.drawImage(this.image, this.position.x, this.position.y)
                }
            }
        } catch (error) {
            c.fillStyle = 'red'
            c.fillRect(this.position.x, this.position.y, this.width, this.height)
            console.warn('Kunde inte rita boundary', error)
        }
    }
}