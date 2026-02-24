const fs = require('fs');
const path = require('path');

const dir = '/Users/calro/Desktop/タイ語学習アプリ/listening/jlpt_n1';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

let modifiedCount = 0;

for (const file of files) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Replace logic
    // We want to remove phrases like "のび太社長、" entirely.
    content = content.replace(/のび太社長、/g, '');
    content = content.replace(/ドラえもん/g, '');
    content = content.replace(/どらえもん/g, '');
    
    // Remove "残りの問題数" related sentences if they exist.
    // Example: "残りの問題数は..." -> we can just replace the specific phrase or the sentence it's in.
    // To be safe, let's just replace "残りの問題数" with something generic or remove it if it's part of a sentence we can chop.
    // Usually it's like "残りの問題数も少なくなってきましたが、"
    content = content.replace(/残りの問題数[^\s、。]*[、。]/g, '');
    
    // If the text starts with a comma or something weird after removing "のび太社長、", fix it.
    // Actually "のび太社長、" already includes the "、", so taking it out leaves the rest of the sentence intact. e.g. "本日のプロジェクト..."
    
    // Some lines might just be "のび太社長、250問到達です！" -> "250問到達です！"
    
    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        modifiedCount++;
        console.log(`Updated ${file}`);
    }
}

console.log(`Finished. Modified ${modifiedCount} files.`);
