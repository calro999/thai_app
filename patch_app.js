const fs = require('fs');

let appJs = fs.readFileSync('app.js', 'utf8');
const n1TitlesContent = fs.readFileSync('listening/jlpt_n1/n1_titles.js', 'utf8');

// The N1 titles extracted in n1_titles.js was an array. I should convert it to an object like listeningN2UnitInfo if app.js expects an object.
// But listening_n3 and listening_n4 use objects. Let's convert the array from n1_titles.js to an object string.
const n1TitlesArrayRaw = n1TitlesContent.match(/\[([\s\S]*?)\]/)[1];
const n1TitlesLines = n1TitlesArrayRaw.split(',\n').filter(l => l.trim() !== '');
let n1ObjectStr = 'const listeningN1UnitInfo = {\n';
n1TitlesLines.forEach((line, index) => {
    // line looks like: `  { title: "..." }`
    n1ObjectStr += `    ${index + 1}: ${line.trim()},\n`;
});
n1ObjectStr += '};\n\n';

// 1. Insert listeningN1UnitInfo above listeningN2UnitInfo
appJs = appJs.replace('const listeningN2UnitInfo = {', n1ObjectStr + 'const listeningN2UnitInfo = {');

// 2. Insert listening_n1 in courseConfig
appJs = appJs.replace(
    /listening_n2:\s*\{\s*name:\s*'JLPT N2 Listening'.*?\},/g, 
    "listening_n1: { name: 'JLPT N1 Listening', price: 'Free', points: 0 },\n    $&"
);

// 3. Update conditionals
const conditionReplaceMap = [
    {
        from: /level === 'listening_n5' \|\| level === 'listening_n4' \|\| level === 'listening_n3' \|\| level === 'listening_n2'/g,
        to: "level === 'listening_n5' || level === 'listening_n4' || level === 'listening_n3' || level === 'listening_n2' || level === 'listening_n1'"
    },
    {
        from: /state\.selectedLevel === 'listening_n5' \|\| state\.selectedLevel === 'listening_n4' \|\| state\.selectedLevel === 'listening_n3' \|\| state\.selectedLevel === 'listening_n2'/g,
        to: "state.selectedLevel === 'listening_n5' || state.selectedLevel === 'listening_n4' || state.selectedLevel === 'listening_n3' || state.selectedLevel === 'listening_n2' || state.selectedLevel === 'listening_n1'"
    },
    {
        from: /state\.selectedLevel !== 'listening_n5' && state\.selectedLevel !== 'listening_n4' && state\.selectedLevel !== 'listening_n3' && state\.selectedLevel !== 'listening_n2'/g,
        to: "state.selectedLevel !== 'listening_n5' && state.selectedLevel !== 'listening_n4' && state.selectedLevel !== 'listening_n3' && state.selectedLevel !== 'listening_n2' && state.selectedLevel !== 'listening_n1'"
    },
    {
        from: /\['n5', 'n4', 'n3', 'n2', 'listening_n5', 'listening_n4', 'listening_n3', 'listening_n2'\]/g,
        to: "['n5', 'n4', 'n3', 'n2', 'n1', 'listening_n5', 'listening_n4', 'listening_n3', 'listening_n2', 'listening_n1']"
    },
    {
        from: /level === 'listening_n2' \? 'n2' : \(level === 'listening_n3' \? 'n3' : \(level === 'listening_n4' \? 'n4' : 'n5'\)\)/g,
        to: "level === 'listening_n1' ? 'n1' : (level === 'listening_n2' ? 'n2' : (level === 'listening_n3' ? 'n3' : (level === 'listening_n4' ? 'n4' : 'n5')))"
    }
];

conditionReplaceMap.forEach(map => {
    appJs = appJs.replace(map.from, map.to);
});

// 4. In openListeningCourseSelect(), add N1 button
const n1BtnBlock = `
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
    grid.appendChild(n1Btn);
`;
appJs = appJs.replace(/const n2Info = courseConfig\['listening_n2'\];/, n1BtnBlock + '\n    const n2Info = courseConfig[\'listening_n2\'];');

// 5. Add openListeningN1SubMode function
const n1SubModeFunctions = `
function openListeningN1SubMode() {
    const subSel = document.getElementById('sub-selection');
    subSel.style.display = 'flex';
    const grid = document.querySelector('#sub-selection .mode-grid');
    grid.innerHTML = \`
        <button class="mode-btn highlight" style="background:#E0F7FA;" onclick="_startListeningN1Mode('learning')">📖 เรียน (Learning)</button>
        <button class="mode-btn highlight" style="background:#FFF9C4;" onclick="_startListeningN1Mode('quiz')">⚔️ ควิซ (Quiz)</button>
        <button class="mode-btn cancel" style="grid-column:span 2;"
            onclick="document.getElementById('sub-selection').style.display='none'; openListeningSelect();">ย้อนกลับ (Back)</button>
    \`;
}

function _startListeningN1Mode(mode) {
    state.gameMode = mode;
    document.getElementById('sub-selection').style.display = 'none';
    openStorySelect('listening_n1');
}
`;
appJs = appJs.replace('function openListeningN2SubMode() {', n1SubModeFunctions + '\nfunction openListeningN2SubMode() {');


// Also handle 'listening_n2' for unitTitle extraction in openStorySelect
appJs = appJs.replace(
    /} else if \(level === 'listening_n2'\) {/g,
    "} else if (level === 'listening_n1') {\n            unitTitle = listeningN1UnitInfo[i] ? listeningN1UnitInfo[i].title : `Level ${i}`;\n        } else if (level === 'listening_n2') {"
);

fs.writeFileSync('app.js', appJs);

console.log('app.js patched successfully');
