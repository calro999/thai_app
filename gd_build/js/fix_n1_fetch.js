const fs = require('fs');

let appJs = fs.readFileSync('app.js', 'utf8');

// The line is: path = `listening/jlpt_${levelPrefix}/${levelPrefix}_${modeStr}_level${unitNum}.json`;
// For N1, it generates `listening/jlpt_n1/n1_quiz_level1.json` but my files are named `n1_listening_quiz_level01.json`
// But wait, N2 files are named `n2_listening_quiz_level01.json` right? Let's check.

appJs = appJs.replace(
    /path = `listening\/jlpt_\$\{levelPrefix\}\/\$\{levelPrefix\}_\$\{modeStr\}_level\$\{unitNum\}\.json`;/g,
    "const padNumForListening = unitNum.toString().padStart(2, '0');\n        path = `listening/jlpt_${levelPrefix}/${levelPrefix}_listening_${modeStr}_level${padNumForListening}.json`;"
);

fs.writeFileSync('app.js', appJs);
console.log('Fixed fetch path in app.js');
