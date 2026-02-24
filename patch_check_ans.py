import re
with open('app.js', 'r', encoding='utf-8') as f:
    app_js = f.read()

patch = """setTimeout(() => {
        if (state.selectedLevel === 'listening_n5' && state.gameMode === 'learning') {
            // No speaking Thai placeholder
        } else {
            speakJapanese(step.correct_answer || step.display_text);
        }
    }, 500);"""

app_js = re.sub(r"setTimeout\(\(\) => \{[\s]+speakJapanese\(step\.correct_answer \|\| step\.display_text\);[\s]+\}, 500\);", patch, app_js, flags=re.DOTALL)

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(app_js)
