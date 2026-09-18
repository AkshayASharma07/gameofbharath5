/* ==========================================================================
   WEB AUDIO API SYNTHESIZER MODULE
   ========================================================================== */
let audioCtx = null;
let audioEnabled = false;

function initAudio() {
    if (!audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playSound(type) {
    if (!audioEnabled || !audioCtx) return;
    const now = audioCtx.currentTime;

    if (type === 'chime' || type === 'success') {
        [216, 432, 864].forEach((freq, idx) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.frequency.setValueAtTime(freq, now);
            gain.gain.setValueAtTime(0.001, now);
            gain.gain.exponentialRampToValueAtTime(0.2 / (idx + 1), now + 0.04);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);
            osc.connect(gain); gain.connect(audioCtx.destination);
            osc.start(now); osc.stop(now + 1.6);
        });
    } else if (type === 'pickup') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(now); osc.stop(now + 0.22);
    } else if (type === 'error') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(110, now);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(now); osc.stop(now + 0.45);
    }
}

// Audio Toggle Button Event Setup
document.addEventListener('DOMContentLoaded', () => {
    const audioToggle = document.getElementById('audioToggle');
    const audioStatusText = document.getElementById('audioStatusText');
    if (audioToggle && audioStatusText) {
        audioToggle.addEventListener('click', () => {
            initAudio();
            audioEnabled = !audioEnabled;
            audioStatusText.textContent = audioEnabled ? 'SOUND ON' : 'SOUND OFF';
            if (audioEnabled) playSound('chime');
        });
    }
});
