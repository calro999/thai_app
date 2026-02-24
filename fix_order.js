const fs = require('fs');
let appJs = fs.readFileSync('app.js', 'utf8');

const n1Block = `    
    const n1Info = courseConfig['listening_n1'];
    const n1Btn = document.createElement('button');
    n1Btn.className = 'mode-btn highlight';
    n1Btn.style.background = '#FFEBEE'; // Light Red
    n1Btn.style.borderColor = '#E53935'; // Red
    n1Btn.style.color = '#B71C1C';
    n1Btn.innerHTML = \`🎓 \${n1Info.name}\`;
    n1Btn.onclick = () => {
        selection.style.display = 'none';
        openListeningN1SubMode();
    };
    grid.appendChild(n1Btn);`;

// Let's just use regex to match the n1Block exactly and remove it, then append it after string for n2Btn
const n1ExactMatch = `    const n1Info = courseConfig['listening_n1'];
    const n1Btn = document.createElement('button');
    n1Btn.className = 'mode-btn highlight';
    n1Btn.style.background = '#FFEBEE'; // Light Red
    n1Btn.style.borderColor = '#E53935'; // Red
    n1Btn.style.color = '#B71C1C';
    n1Btn.innerHTML = \`🎓 \${n1Info.name}\`;
    n1Btn.onclick = () => {
        selection.style.display = 'none';
        openListeningN1SubMode();
    };
    grid.appendChild(n1Btn);`;

if (appJs.includes(n1ExactMatch)) {
    appJs = appJs.replace(n1ExactMatch, '');
    appJs = appJs.replace('grid.appendChild(n2Btn);', 'grid.appendChild(n2Btn);\n' + n1ExactMatch);
    fs.writeFileSync('app.js', appJs);
    console.log('Fixed button order.');
} else {
    console.log('Could not find exact block to move.');
}
