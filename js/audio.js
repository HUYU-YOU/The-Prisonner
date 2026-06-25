// ============================================================================
// GESTION AUDIO (js/audio.js)
// ============================================================================

const playlist = [
    'assets/audio/track1.mp3', 
    'assets/audio/track2.mp3', 
    'assets/audio/track3.mp3'
];

let currentTrackIndex = 0;
let bgMusic = new Audio();
try { 
    bgMusic.src = playlist[currentTrackIndex]; 
    bgMusic.volume = 0.1; 
} catch(e) {}

let isMuted = false;

bgMusic.addEventListener('ended', () => {
    currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    bgMusic.src = playlist[currentTrackIndex];
    bgMusic.play().catch(e => console.log(e));
});

window.toggleMute = function() {
    isMuted = !isMuted;
    bgMusic.muted = isMuted;
    let btn = document.getElementById('mute-btn');
    if (btn) btn.innerText = isMuted ? '🔇' : '🔊';
};

window.changeVolume = function(val) {
    bgMusic.volume = parseFloat(val);
    let s1 = document.getElementById('volume-slider');
    let s2 = document.getElementById('pause-volume');
    if (s1) s1.value = val;
    if (s2) s2.value = val;
};

window.addEventListener('DOMContentLoaded', () => {
    const audioUi = document.getElementById('audio-ui');
    const volSlider = document.getElementById('volume-slider');
    if (audioUi && volSlider) {
        audioUi.addEventListener('mouseenter', () => volSlider.style.display = 'block');
        audioUi.addEventListener('mouseleave', () => volSlider.style.display = 'none');
    }

    // Connecte automatiquement TOUT bouton contenant le mot "MAP" ou "PAUSE"
    document.querySelectorAll('button').forEach(btn => {
        if (btn.innerText.toUpperCase().includes('MAP') || btn.innerText.toUpperCase().includes('PAUSE')) {
            btn.addEventListener('click', () => {
                if(typeof togglePause === 'function') togglePause();
            });
        }
    });
});

document.body.addEventListener('click', () => {
    if (bgMusic.paused && !isMuted && bgMusic.src) {
        bgMusic.play().catch(e => console.log("Attente action joueur pour l'audio"));
    }
}, { once: true });
