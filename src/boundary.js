import { portalImages } from "./classicMap.js";

export class Boundary {
    static width = 40
    static height = 40

    static spriteFrameWidth = 256
    static spriteFrameHeight = 256
    static totalFrames = 16
    static columns = 4

    constructor({position, image, context, type}) {
        this.position = position
        this.width = 40
        this.height = 40
        this.originalImage = image
        this.image = image
        this.type = type
        this.isPortal = false
        this.c = context
        this.portalFrame = 0
        this.animationSpeed = 0.1
    }

    draw() {
        if (!this.c) return

        try {
            // 🌀 Om detta block just nu är en aktiv portal
            if (this.isPortal && portalImages.length > 0) {
                // Animera genom att stega framåt i arrayen (0-4)
                this.portalFrame += this.animationSpeed
                const frameIndex = Math.floor(this.portalFrame) % portalImages.length
                const currentPortalImg = portalImages[frameIndex]

                if (currentPortalImg.complete) {
                    this.c.drawImage(currentPortalImg, this.position.x, this.position.y, this.width, this.height)
                } else {
                    this.c.fillStyle = '#9b59b6'
                    this.c.fillRect(this.position.x, this.position.y, this.width, this.height)
                }
                return 
            }

            // ☄️ Logik för asteroider (Rymdbanan)
            if (this.type === 'asteroid') {
                const row = Math.floor(this.currentFrame / 4)
                const col = this.currentFrame % 4

                this.c.save()
                this.c.globalCompositeOperation = 'Screen'
                this.c.drawImage(
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
                this.c.restore()
            } else {
                // 🧱 Vanlig vägg (Klassiska banan)
                if (this.image) {
                    this.c.drawImage(this.image, this.position.x, this.position.y)
                }
            }
        } catch (error) {
            this.c.fillStyle = 'red'
            this.c.fillRect(this.position.x, this.position.y, this.width, this.height)
            console.warn('Kunde inte rita boundary', error)
        }
    }
}