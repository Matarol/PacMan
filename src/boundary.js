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
        this.currentFrame = 0
    }

    draw() {
        if (!this.c || !this.image) return

        try {
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
                    40,
                    40
                )
                this.c.restore()
            } else {
                this.c.drawImage(this.image, this.position.x, this.position.y)
            }
        } catch (error) {
            this.c.fillStyle = 'red'
            this.c.fillRect(this.position.x, this.position.y, 40, 40)
            console.warn('Kunde inte rita boundary, error')
        }

    }
}