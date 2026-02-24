import re
import os

app_js_path = "/Users/calro/Desktop/タイ語学習アプリ/app.js"
with open(app_js_path, "r", encoding="utf-8") as f:
    text = f.read()

# adding openListeningN2SubMode
submode_code = """
function openListeningN2SubMode() {
    const subSel = document.getElementById('sub-selection');
    subSel.style.display = 'flex';
    const grid = document.querySelector('#sub-selection .mode-grid');
    grid.innerHTML = `
        <button class="mode-btn highlight" style="background:#E0F7FA;" onclick="_startListeningN2Mode('learning')">📖 เรียน (Learning)</button>
        <button class="mode-btn highlight" style="background:#FFF9C4;" onclick="_startListeningN2Mode('quiz')">⚔️ ควิซ (Quiz)</button>
        <button class="mode-btn cancel" style="grid-column:span 2;"
            onclick="document.getElementById('sub-selection').style.display='none'; openListeningSelect();">ย้อนกลับ (Back)</button>
    `;
}

function _startListeningN2Mode(mode) {
    state.gameMode = mode;
    document.getElementById('sub-selection').style.display = 'none';
    openStorySelect('listening_n2');
}
"""

if "openListeningN2SubMode" not in text:
    text = text.replace(
        "function openListeningN3SubMode() {",
        submode_code + "\nfunction openListeningN3SubMode() {"
    )

# Adding the N2 button in openListeningSelect properly
if '<span class="course-name">🎧 JLPT N2 Listening</span>' not in text:
    menu_button_html = """
    const n2Btn = document.createElement('button');
    n2Btn.className = 'mode-btn highlight';
    n2Btn.style.background = '#F3E5F5'; // Light Purple
    n2Btn.style.borderColor = '#AB47BC'; // Purple
    n2Btn.style.color = '#4A148C';
    n2Btn.innerHTML = `🎓 ${n2Info.name}`;
    n2Btn.onclick = () => {
        selection.style.display = 'none';
        openListeningN2SubMode();
    };
    grid.appendChild(n2Btn);
"""
    # Insert it right after n3Btn
    text = text.replace(
        "grid.appendChild(n3Btn);",
        "grid.appendChild(n3Btn);\n" + menu_button_html
    )

with open(app_js_path, "w", encoding="utf-8") as f:
    f.write(text)

print("Button patch applied.")
