/**
 * Kana Piano Engine (Separate Module)
 * Fixed: Explicitly using 'char' (Kana) and restored to single-shot sound.
 */

let currentMode = 'hiragana';
let masterData = [];

window.onload = () => {
    const params = new URLSearchParams(window.location.search);
    const modeParam = params.get('mode');
    
    // 音声エンジンの準備
    if ('speechSynthesis' in window) {
        window.speechSynthesis.getVoices();
        window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
    
    if (modeParam === 'katakana') {
        switchMode('katakana');
    } else {
        switchMode('hiragana');
    }
};

async function switchMode(mode) {
    currentMode = mode;
    const btnHira = document.getElementById('btn-hira');
    const btnKata = document.getElementById('btn-kata');
    if (btnHira) btnHira.classList.toggle('active', mode === 'hiragana');
    if (btnKata) btnKata.classList.toggle('active', mode === 'katakana');

    const fileName = mode === 'hiragana' ? 'hiragana_alphabet.json' : 'katakana_alphabet.json';
    try {
        const res = await fetch(`${fileName}?v=${new Date().getTime()}`);
        const data = await res.json();
        
        masterData = data.map(item => ({
            char: item.char,   // 「あ」「ア」を保持
            reading: item.reading,
            thai: item.thai_reading || ""
        }));

        renderKeys();
    } catch (e) {
        console.error("Data load failed", e);
    }
}

function renderKeys() {
    const grid = document.getElementById('piano-grid');
    if (!grid) return;
    grid.innerHTML = "";

    masterData.forEach(item => {
        const key = document.createElement('div');
        key.className = 'key';
        key.innerHTML = `
            <span class="char">${item.char}</span>
            <span class="th">${item.thai}</span>
        `;
        
        // item.char（ひらがな）を1回だけ読ませる
        key.onclick = () => {
            playJapaneseSingle(item.char);
            key.style.transform = "scale(0.95)";
            setTimeout(() => key.style.transform = "scale(1)", 50);
        };
        
        grid.appendChild(key);
    });
}

/**
 * 1文字だけ、日本語として確実に読ませる
 */
function playJapaneseSingle(kanaText) {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    // 3連続を解除し、1文字だけを渡す
    const uttr = new SpeechSynthesisUtterance(kanaText);
    
    uttr.lang = 'ja-JP';
    
    const voices = window.speechSynthesis.getVoices();
    const jpVoice = voices.find(v => v.name.includes('Kyoko')) || 
                    voices.find(v => v.lang.startsWith('ja'));

    if (jpVoice) uttr.voice = jpVoice;

    uttr.rate = 1.1; // 1回なので少しだけ落ち着いた速度に
    uttr.pitch = 1.0;

    window.speechSynthesis.speak(uttr);
}