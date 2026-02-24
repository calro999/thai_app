const fs = require('fs');
let css = fs.readFileSync('lp.css', 'utf8');

// Replace the old .hero-character styles with new .phone-mockup styles
const newStyles = \`
/* --- Smartphone Mockup --- */
.phone-mockup {
    position: relative;
    width: 100%;
    max-width: 380px;
    height: 600px;
    margin-top: 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
    animation: floatPhone 6s ease-in-out infinite;
    z-index: 2;
}

@keyframes floatPhone {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-20px); }
}

.phone-frame {
    width: 320px;
    height: 580px;
    background: #111;
    border-radius: 40px;
    border: 8px solid #333;
    box-shadow: 0 25px 50px rgba(0,0,0,0.6), 
                inset 0 0 0 2px #555,
                0 0 30px rgba(255, 46, 147, 0.4);
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.phone-notch {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 120px;
    height: 25px;
    background: #111;
    border-bottom-left-radius: 15px;
    border-bottom-right-radius: 15px;
    z-index: 10;
}

.phone-screen {
    flex: 1;
    background: url('images/bg_classroom.jpg') center/cover;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.phone-screen::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.3); /* Darken bg slightly */
}

.mockup-header {
    position: relative;
    margin-top: 35px;
    background: rgba(0,0,0,0.6);
    color: white;
    padding: 5px 15px;
    border-radius: 20px;
    width: fit-content;
    margin-left: auto;
    margin-right: auto;
    font-size: 0.9rem;
    font-weight: bold;
    border: 1px solid var(--secondary);
}

.mockup-character {
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 120%;
    height: 85%;
    display: flex;
    align-items: flex-end;
    justify-content: center;
}

.mockup-character img {
    height: 100%;
    object-fit: contain;
    object-position: bottom;
    filter: drop-shadow(0 5px 15px rgba(0,0,0,0.5));
}

.mockup-dialogue {
    position: relative;
    background: rgba(0,0,0,0.8);
    border-top: 3px solid var(--secondary);
    padding: 15px;
    margin-bottom: 70px; /* Space for btn */
}

.mockup-dialogue p {
    color: white;
    font-size: 0.9rem;
    margin: 0;
    text-shadow: 1px 1px 2px black;
    text-align: left;
}

.mockup-btn {
    position: absolute;
    bottom: 15px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(180deg, var(--secondary), #00ACC1);
    color: white;
    padding: 12px 30px;
    border-radius: 25px;
    font-weight: bold;
    box-shadow: 0 5px 15px rgba(0, 240, 255, 0.4);
    letter-spacing: 1px;
    cursor: pointer;
}

/* Decorative Floating Emojis */
.float-item {
    position: absolute;
    font-size: 2.5rem;
    filter: drop-shadow(0 5px 10px rgba(0,0,0,0.3));
    z-index: 5;
    animation: bounceObj 3s infinite alternate;
}

.float-item-1 { top: 10%; left: -20px; animation-delay: 0s; }
.float-item-2 { bottom: 20%; right: -30px; font-size: 3.5rem; animation-delay: 1s; }
.float-item-3 { top: 40%; right: -20px; animation-delay: 2s; }

@keyframes bounceObj {
    from { transform: translateY(0) rotate(-10deg); }
    to { transform: translateY(-15px) rotate(10deg); }
}

@media (max-width: 768px) {
    .phone-mockup {
        transform: scale(0.85);
        margin-top: 0;
    }
}
\`;

// Remove old .hero-character styles entirely by targeting what we added last time
// Actually, let's just append and let it override if needed, or replace exactly.
css = css.replace(
    /\\.hero-character \\{[\\s\\S]*?\\}\\n\\n\\.hero-character img \\{[\\s\\S]*?\\}\\n\\n@keyframes floatChar \\{[\\s\\S]*?\\}/,
    newStyles
);

// If the regex above fails (because we modified it a bit), let's just append the new styles, 
// since .phone-mockup is a new class and won't conflict. We just need to make sure the hero layout still works.
if (!css.includes('.phone-mockup')) {
    css += '\\n' + newStyles;
}

fs.writeFileSync('lp.css', css);
console.log('Added smartphone mockup CSS.');
