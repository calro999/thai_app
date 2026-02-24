const fs = require('fs');
let state = { gameMode: 'quiz' };
let level = 'listening_n5';
let unitNum = 1;

let path = '';
if (level === 'listening_n5' || level === 'listening_n4' || level === 'listening_n3') {
    const modeStr = (state.gameMode === 'quiz') ? 'quiz' : 'study';
    const levelPrefix = level === 'listening_n3' ? 'n3' : (level === 'listening_n4' ? 'n4' : 'n5');
    path = `listening/jlpt_${levelPrefix}/${levelPrefix}_${modeStr}_level${unitNum}.json`;
}
console.log('Path is:', path);

try {
    const raw = fs.readFileSync(path, 'utf8');
    const payload = JSON.parse(raw);
    let storyData = payload.data || payload.questions || [];
    console.log('Loaded storyData items:', storyData.length);
    
    // simulate loadScene first step
    const step = storyData[0];
    if (level === 'listening_n5' || level === 'listening_n4' || level === 'listening_n3') {
        if (state.gameMode === 'learning') {
            step.correct_answer = step.correct_answer || 'เข้าใจแล้ว (Next)';
            step.options = [step.correct_answer];
        } else {
            step.correct_answer = step.correct_answer || step.answer;
        }
    }
    const choices = state.gameMode === 'learning' ? [step.correct_answer] : [...step.options];
    console.log('Choices generated correctly:', choices);
} catch (e) {
    console.error('ERROR:', e.message);
}
