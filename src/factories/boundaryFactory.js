import { portalImages } from "../classicMap.js";
import { TILE_SIZE } from "../constants/gameConstants.js";

const SPRITE_FRAME_WIDTH = 256
const SPRITE_FRAME_HEIGHT = 256
const ASTEROID_TOTAL_FRAMES = 16
const ASTEROID_COLUMNS= 4

export function createBoundary({ position, image, isBlock = false, canBecomePortal = isBlock, isAsteroid = false }) {    

    return {
        type: 'boundary',

        position,
        width: TILE_SIZE,
        height: TILE_SIZE,

        originalImage: image,
        image,

        isBlock,
        canBecomePortal,
        isAsteroid,

        isPortal: false,
        portalFrame: 0,
        asteroidFrame: 0,
        animationSpeed: 0.3,    

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
                if (this.isAsteroid) {
                    this.asteroidFrame += this.animationSpeed
                    const frameIndex = Math.floor(this.asteroidFrame) % ASTEROID_TOTAL_FRAMES
                    const row = Math.floor(frameIndex / ASTEROID_COLUMNS)
                    const col = frameIndex % ASTEROID_COLUMNS

                    c.save()
                    c.globalCompositeOperation = 'Screen'
                    c.drawImage(
                        this.image,
                        col * SPRITE_FRAME_WIDTH,
                        row * SPRITE_FRAME_HEIGHT,
                        SPRITE_FRAME_WIDTH,
                        SPRITE_FRAME_HEIGHT,
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
}
