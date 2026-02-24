import re
with open('app.js', 'r', encoding='utf-8') as f:
    app_js = f.read()

bad_patch = """const diag = document.getElementById('dialogue-text');
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

good_patch = """const diag = document.getElementById('dialogue-text');
    const mainWord = targetWord.kanji || targetWord.character || targetWord.hiragana;
    const subWord = targetWord.hiragana || targetWord.romaji || '';
    diag.innerHTML = `<b>${isCorrect ? 'ถูกต้อง!' : 'เสียดาย...'}</b><br>คำตอบคือ: ${mainWord} ${subWord ? `(${subWord})` : ''} = ${targetWord.thai}`;"""

app_js = app_js.replace(bad_patch, good_patch)

check_ans_regex = r"(const diag = document\.getElementById\('dialogue-text'\);[\s]+let fullWord = step\.correct_answer;[\s]+if \(step\.display_text && step\.display_text\.includes\('○'\)\) \{[\s]+fullWord = step\.display_text\.replace\('○', step\.correct_answer\)\.replace\(/\\s\+\/g, ''\);[\s]+}[\s]+if \(step\.explanation\) \{[\s]+diag\.innerHTML = `<b>\$\{isCorrect \? 'ถูกต้อง!' : 'เสียดาย\.\.\.'\}<\/b><br>\$\{step\.explanation\}`;[\s]+} else \{[\s]+diag\.innerHTML = `<b>\$\{isCorrect \? 'ถูกต้อง!' : 'เสียดาย\.\.\.'\}<\/b><br>คำตอบคือ: \$\{fullWord\}`;[\s]+})"

new_check_ans = r"""const diag = document.getElementById('dialogue-text');
    let fullWord = step.correct_answer;
    if (step.display_text && step.display_text.includes('○')) {
        fullWord = step.display_text.replace('○', step.correct_answer).replace(/\s+/g, '');
    }

    if (state.selectedLevel === 'listening_n5') {
        if (state.gameMode === 'learning') {
            diag.innerHTML = `<b>${isCorrect ? 'เก่งมาก!' : 'เสียดาย...'}</b>`;
        } else {
            diag.innerHTML = `<b>${isCorrect ? 'ถูกต้อง!' : 'เสียดาย...'}</b><br>คำตอบคือ: ${step.answer || step.correct_answer}`;
        }
    } else if (step.explanation) {
        diag.innerHTML = `<b>${isCorrect ? 'ถูกต้อง!' : 'เสียดาย...'}</b><br>${step.explanation}`;
    } else {
        diag.innerHTML = `<b>${isCorrect ? 'ถูกต้อง!' : 'เสียดาย...'}</b><br>คำตอบคือ: ${fullWord}`;
    }"""

app_js = re.sub(check_ans_regex, new_check_ans, app_js, flags=re.DOTALL)

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(app_js)
