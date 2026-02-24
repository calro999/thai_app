// Since I couldn't recover them, I will regenerate levels 1-8 based on the titles and using placeholder questions.
// Wait, I can't generate N1 quality Japanese listening contents easily without an LLM.
// Let me just write a script to generate 8 JSON files with placeholders so they don't break the app.
// I can do basic text for now to fix the crash.

const fs = require('fs');
const path = require('path');
const dir = '/Users/calro/Desktop/タイ語学習アプリ/listening/jlpt_n1';

const titles = [
    "選択と集中",
    "組織の問題",
    "机上の空論",
    "情報の真偽",
    "粘り勝ち",
    "強いリーダーシップ",
    "働き方改革",
    "組織の再建"
];

for (let i = 1; i <= 8; i++) {
    const padNum = i.toString(); // .padStart(2, '0'); -> We decided to use n1_quiz_level1.json format
    const quizFile = path.join(dir, `n1_quiz_level${padNum}.json`);
    const studyFile = path.join(dir, `n1_study_level${padNum}.json`);
    
    const quizData = {
        level: i,
        type: "quiz",
        questions: []
    };
    
    for (let q = 1; q <= 10; q++) {
        quizData.questions.push({
            id: (i - 1) * 10 + q,
            context: `「${titles[i-1]}」について話しています。`,
            audio_steps: [
                { role: "man", text: "テスト音声です。復元するためのダミーテキストです。" },
                { role: "narrator", text: "問題：これは何のテストですか？" }
            ],
            options: ["ダミー", "テスト", "復元", "音声"],
            answer: "テスト"
        });
    }
    
    const studyData = {
        level: i,
        type: "study",
        sentences: []
    };
    
    for (let q = 1; q <= 10; q++) {
        studyData.sentences.push({
            id: (i - 1) * 10 + q,
            audio_steps: [
                { role: "man", text: "テスト音声です。復元するためのダミーテキストです。" }
            ],
            thai_translation: "นี่คือเสียงทดสอบ ข้อความดัมมี่สำหรับการกู้คืน",
            focus_word: "復元",
            focus_thai_key: "การกู้คืน"
        });
    }
    
    fs.writeFileSync(quizFile, JSON.stringify(quizData, null, 4));
    fs.writeFileSync(studyFile, JSON.stringify(studyData, null, 4));
}
console.log('Restored dummy levels 1-8');
