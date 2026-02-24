import re
with open('app.js', 'r', encoding='utf-8') as f:
    app_js = f.read()

patch = """const diag = document.getElementById('dialogue-text');
    if (state.selectedLevel === 'listening_n5') {
        if (state.gameMode === 'learning') {
            diag.innerHTML = `<b>${isCorrect ? 'เก่งมาก!' : 'เสียดาย...'}</b>`;
        } else {
            diag.innerHTML = `<b>${isCorrect ? 'ถูกต้อง!' : 'เสียดาย...'}</b><br>คำตอบคือ: ${step.answer || step.correct_answer}`;
        }
    } else {
        const mainWord = targetWord.kanji || targetWord.character || targetWord.hiragana;
        const subWord = targetWord.hiragana || targetWord.romaji || '';
        diag.innerHTML = `<b>${isCorrect ? 'ถูกต้อง!' : 'เสียดาย...'}</b><br>คำตอบคือ: ${mainWord} ${subWord ? `(${subWord})` : ''} = ${targetWord.thai}`;
    }"""

# there are two places for this (one for learning one for story/quiz maybe, wait checkAnswer is just one function)
app_js = re.sub(r"const diag = document\.getElementById\('dialogue-text'\);[\s]+const mainWord = targetWord\.kanji \|\| targetWord\.character \|\| targetWord\.hiragana;[\s]+const subWord = targetWord\.hiragana \|\| targetWord\.romaji \|\| '';[\s]+diag\.innerHTML = `<b>\$\{isCorrect \? 'ถูกต้อง!' : 'เสียดาย\.\.\.'\}<\/b><br>คำตอบคือ: \$\{mainWord\} \$\{subWord \? `\(\$\{subWord\}\)` : ''\} = \$\{targetWord\.thai\}`;", patch, app_js, flags=re.DOTALL)

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(app_js)
