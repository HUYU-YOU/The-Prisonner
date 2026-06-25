// ============================================================================
// js/audio.js - GESTION DE LA MUSIQUE ET DU SON
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

document.body.addEventListener('click', () => {
    if (bgMusic.paused && !isMuted && bgMusic.src) {
        bgMusic.play().catch(e => console.log("Attente action joueur pour audio"));
    }
}, { once: true });
