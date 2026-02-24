const fs = require('fs');
const path = require('path');
const dir = '/Users/calro/Desktop/タイ語学習アプリ/listening/jlpt_n1';
let titles = [];

for (let i = 1; i <= 30; i++) {
    const filename = `n1_listening_quiz_level${i.toString().padStart(2, '0')}.json`;
    const filepath = path.join(dir, filename);
    if (!fs.existsSync(filepath)) continue;
    
    const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    let title = `レベル ${i}`;
    
    if (data.questions && data.questions.length > 0) {
        const firstQ = data.questions[0];
        if (firstQ.context) {
            const match = firstQ.context.match(/「(.+?)」/);
            if (match) {
                title = match[1];
            } else {
                let parts = firstQ.context.split('で、');
                if (parts.length > 1) {
                    title = parts[0];
                } else {
                    title = firstQ.context.substring(0, 8) + '...';
                }
            }
        }
    }
    titles.push(`  { title: "${title}" }`);
}

const outFile = path.join(dir, 'n1_titles.js');
const outContent = `const listeningN1UnitInfo = [\n${titles.join(',\n')}\n];\n`;
fs.writeFileSync(outFile, outContent, 'utf8');
console.log('n1_titles.js created with ' + titles.length + ' entries.');
