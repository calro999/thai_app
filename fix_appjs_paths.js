const fs = require('fs');

let appJs = fs.readFileSync('app.js', 'utf8');
appJs = appJs.replace(
    /const padNumForListening = unitNum\.toString\(\)\.padStart\(2, '0'\);\n        path = `listening\/jlpt_\$\{levelPrefix\}\/\$\{levelPrefix\}_listening_\$\{modeStr\}_level\$\{padNumForListening\}\.json`;/,
    "path = `listening/jlpt_${levelPrefix}/${levelPrefix}_${modeStr}_level${unitNum}.json`;"
);
fs.writeFileSync('app.js', appJs);
console.log('Reverted to original fetch paths for listening courses.');
