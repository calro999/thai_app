const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

// 1. Add courseConfig
code = code.replace(
    /listening_n5: \{ name: 'JLPT N5 Listening', price: 'Free', points: 0 \},/,
    "listening_n5: { name: 'JLPT N5 Listening', price: 'Free', points: 0 },\n    listening_n4: { name: 'JLPT N4 Listening', price: 'Free', points: 0 },"
);

// 2. Add course rendering
code = code.replace(
    /const n5Info = courseConfig\['listening_n5'\];/,
    "const n5Info = courseConfig['listening_n5'];\n    const n4Info = courseConfig['listening_n4'];"
);

code = code.replace(
    /const btnN5 = document\.createElement\('button'\);\s+btnN5\.className = 'course-btn';\s+btnN5\.innerHTML = `\s+<img src="\${BASE_URL}images\/items\/listening\.png" alt="Listening N5">\s+<span>\${n5Info\.name}<span>Free<\/span><\/span>\s+`;\s+btnN5\.onclick = \(\) => {\s+openStorySelect\('listening_n5'\);\s+};\s+listeningSelectionDiv\.appendChild\(btnN5\);/,
    match => match + "\n\n    const btnN4 = document.createElement('button');\n    btnN4.className = 'course-btn';\n    btnN4.innerHTML = `\n        <img src=\"${BASE_URL}images/items/listening.png\" alt=\"Listening N4\">\n        <span>${n4Info.name}<span>Free</span></span>\n    `;\n    btnN4.onclick = () => {\n        openStorySelect('listening_n4');\n    };\n    listeningSelectionDiv.appendChild(btnN4);"
);

// 3. Update conditions referencing listening_n5
code = code.replace(
    /if \(level === 'listening_n5'\) count = 30;/,
    "if (level === 'listening_n5' || level === 'listening_n4') count = 30;"
);

code = code.replace(
    /if \(level === 'listening_n5'\) maxScore = 10;/,
    "if (level === 'listening_n5' || level === 'listening_n4') maxScore = 10;"
);

code = code.replace(
    /} else if \(level === 'listening_n5'\) \{/g,
    "} else if (level === 'listening_n5' || level === 'listening_n4') {"
);

code = code.replace(
    /level === 'listening_n5' \|\| previewData\.length > 0\)/,
    "level === 'listening_n5' || level === 'listening_n4' || previewData.length > 0)"
);

code = code.replace(
    /if \(level === 'listening_n5'\) \{([^}]*)\}/,
    match => "if (level === 'listening_n5' || level === 'listening_n4') {" + match.substring(match.indexOf('{') + 1)
);

code = code.replace(
    /if \(state\.selectedLevel === 'listening_n5'\) \{([^}]*)\}/g,
    match => "if (state.selectedLevel === 'listening_n5' || state.selectedLevel === 'listening_n4') {" + match.substring(match.indexOf('{') + 1)
);

code = code.replace(
    /if \(state\.selectedLevel === 'listening_n5'\) actualGameMode = 'listening';/,
    "if (state.selectedLevel === 'listening_n5' || state.selectedLevel === 'listening_n4') actualGameMode = 'listening';"
);

// wait there is one "if (state.selectedLevel !== 'listening_n5')"
code = code.replace(
    /if \(state\.selectedLevel !== 'listening_n5'\) \{/,
    "if (state.selectedLevel !== 'listening_n5' && state.selectedLevel !== 'listening_n4') {"
);


fs.writeFileSync('app.js', code);
console.log('Patched application.');
