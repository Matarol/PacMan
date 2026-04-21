// 1. Skapa en ljudkontext (motorn)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const soundBuffers = {};

// 2. Funktion för att ladda ljudfiler till minnet
async function loadSound(name, url) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    soundBuffers[name] = audioBuffer;
}

// Ladda in dina ljud
loadSound('eat-pellet', 'assets/sfx/eat-pellet.wav');
loadSound('portal', 'assets/sfx/portal.wav');
loadSound('power-up', 'assets/sfx/power-up.wav');
loadSound('win', 'assets/sfx/win.wav');
loadSound('lose', 'assets/sfx/lose.wav');
loadSound ('eat-ghost', 'assets/sfx/eat-ghost.wav');
loadSound ('damage-by-villain', 'assets/sfx/damage-by-villain.wav');

// 3. Den blixtsnabba play-funktionen
export const playSound = (name) => {
    // Om kontexten är pausad (webbläsarkrav), starta den
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const buffer = soundBuffers[name];
    if (buffer) {
        // Skapa en "källa" (denna är engångs och extremt snabb)
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;

        // Skapa en volymkontroll
        const gainNode = audioCtx.createGain();
        gainNode.gain.value = 0.1; // 10% volym

        // Koppla ihop: Källa -> Volym -> Högtalare
        source.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        source.start(0);
    }
};