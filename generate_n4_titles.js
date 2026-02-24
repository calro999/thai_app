const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'listening', 'jlpt_n4');
let output = "const listeningN4UnitInfo = {\n";

for (let i = 1; i <= 30; i++) {
    const studyFile = path.join(dir, `n4_study_level${i}.json`);
    const quizFile = path.join(dir, `n4_quiz_level${i}.json`);
    let titleStr = `Level ${i}`;
    let fileToRead = fs.existsSync(studyFile) ? studyFile : null;
    
    if (fileToRead) {
        try {
            const data = JSON.parse(fs.readFileSync(fileToRead, 'utf8'));
            if (data.data && data.data.length >= 2) {
                const w1 = data.data[0].focus_thai_key || '';
                const w2 = data.data[1].focus_thai_key || '';
                titleStr = `${w1.split('（')[0]} vs ${w2.split('（')[0]}`;
                // Keep the reading part if available, or just the whole string
                if (!w1.includes('（')) {
                    titleStr = `${w1} vs ${w2}`;
                } else {
                    titleStr = `${w1} vs ${w2}`;
                }
            }
        } catch(e) {}
    } else if (fs.existsSync(quizFile)) {
        try {
            const data = JSON.parse(fs.readFileSync(quizFile, 'utf8'));
            if (data.questions && data.questions.length >= 2) {
                const w1 = data.questions[0].focus_thai_key || '';
                const w2 = data.questions[1].focus_thai_key || '';
                titleStr = `${w1} vs ${w2}`;
            }
        } catch(e) {}
    }
    output += `    ${i}: { title: \`${titleStr}\` },\n`;
}
output += "};\n";

console.log(output);
