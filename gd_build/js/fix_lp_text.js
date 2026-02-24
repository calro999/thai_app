const fs = require('fs');

let html = fs.readFileSync('lp.html', 'utf8');

// The user said "J-POP" instead of "K-POP". Looking at the LP:
// "ภาษาญี่ปุ่นสำหรับติ่ง (Oshikatsu)" is what I wrote. Wait, they might have inferred "ติ่ง" as K-POP fan. Let's explicitly say "J-POP".
html = html.replace(
    /"ภาษาญี่ปุ่นสำหรับติ่ง \(Oshikatsu\)"/g,
    '"ภาษาญี่ปุ่นสำหรับติ่ง J-POP / อนิเมะ (Oshikatsu)"'
);

// Piano game update: "ひらがなとカタカナを一音ずつ出せる特別なピアノだから、ひらがなやカタカナがわからない人にもオススメって風に誘導して！"
// "It's a special piano that outputs hiragana and katakana one note at a time, so recommend it to people who don't know hiragana or katakana!"
html = html.replace(
    /เรียนเหนื่อยใช่ไหม\? แวะมาผ่อนคลายด้วยมินิเกมเปียโน ที่คุณสามารถเล่นเพลงฮิตต่างๆ ได้ด้วยตัวเอง\n                    พร้อมโน้ตบอกตำแหน่งง่ายๆ \(เช่น ซากุระร่วงโรย เป็นต้น!\)/g,
    'มินิเกมเปียโนสุดพิเศษที่คุณสามารถกดแล้วมีเสียงอ่าน "ฮิรางานะ" และ "คาตาคานะ" ออกมาทีละตัวอักษร! แม้จะยังจำตัวอักษรไม่ได้ ก็สามารถสนุกไปกับการกดเปียโนและซึมซับการออกเสียงภาษาญี่ปุ่นได้ แนะนำมากๆ สำหรับผู้เริ่มต้น!'
);
// Also change the title:
html = html.replace(
    /โหมดเล่นเปียโนเพลงอนิเมะ/g,
    'เปียโนฝึกฮิรางานะ & คาตาคานะ'
);

fs.writeFileSync('lp.html', html);
console.log('Fixed LP texts.');
