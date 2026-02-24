const fs = require('fs');
const dir = '/Users/calro/Desktop/タイ語学習アプリ/listening/jlpt_n1';
const files = fs.readdirSync(dir);
const jsons = files.filter(f => f.endsWith('.json'));
let missing = [];
for (let i = 1; i <= 30; i++) {
    const qName = `n1_quiz_level${i}.json`;
    const sName = `n1_study_level${i}.json`;
    if (!jsons.includes(qName)) missing.push(qName);
    if (!jsons.includes(sName)) missing.push(sName);
}
console.log('Missing files:', missing);
