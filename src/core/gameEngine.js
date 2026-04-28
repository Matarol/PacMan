/**
 * Hanterar spelets huvudloop, systemuppdateringar och rendering.
 */
export class GameEngine {
    constructor({
        canvas,
        c,
        world,
        gameState,
        systems = []
    }) {
        this.canvas = canvas;
        this.c = c;
        this.world = world;
        this.gameState = gameState;

        this.systems = {
            init: systems.init,
            update: systems.update,
            render: systems.render
        };

        this.lastTime = performance.now();
        this.animationId = null;
    };

    /**
     * Initierar alla system och startar spelloopen.
     */
    async start() {
        if (this.systems.init) {
            await this.systems.init();
        };

        this.lastTime = performance.now();
        this.loop(this.lastTime);
    };

    /**
     * Spelloopen som körs varje frame. Beräknar deltaTime och anropar update/render.
     */
    async loop(timestamp = performance.now()) {
        this.animationId = requestAnimationFrame(this.loop.bind(this));

        // Beräkna tidsskillnad i sekunder
        let deltaTime = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        // Säkerhetskontroll för att undvika stora hopp vid t.ex. flikbyte (max ~30 FPS drop)
        if (isNaN(deltaTime) || deltaTime <= 0 || deltaTime > 0.033) {
            deltaTime = 1 / 60;
        };

        if (this.systems.update) {
            await this.systems.update(deltaTime);
        };

        if (this.systems.render) {
            this.systems.render();
        };
    };

    /**
     * Stoppar spelloopen och avbryter nästa planerade rendering.
     */
    stop() {
        cancelAnimationFrame(this.animationId);
    };
};