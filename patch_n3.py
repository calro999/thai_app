import re

with open('app.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add courseConfig entry
if "'listening_n3'" not in content:
    content = content.replace(
        "listening_n4: { name: 'JLPT N4 Listening', price: 'Free', points: 0 },",
        "listening_n4: { name: 'JLPT N4 Listening', price: 'Free', points: 0 },\n    listening_n3: { name: 'JLPT N3 Listening', price: 'Free', points: 0 },"
    )

# 2. Add listeningN3UnitInfo
with open('n3_titles.js', 'r', encoding='utf-8') as f:
    n3_info = f.read()

# Make sure we don't add it twice
if "const listeningN3UnitInfo" not in content:
    content = content.replace(
        "const listeningN4UnitInfo = {",
        n3_info + "\nconst listeningN4UnitInfo = {"
    )

# 3. Add to the mode-btn creation in openListeningSelect()
n3_btn_code = """
    const n3Info = courseConfig['listening_n3'];
    const n3Btn = document.createElement('button');
    n3Btn.className = 'mode-btn highlight';
    n3Btn.style.background = '#E0F2F1'; // Light Teal
    n3Btn.style.borderColor = '#26A69A'; // Teal
    n3Btn.style.color = '#00695C';
    n3Btn.innerHTML = `🎓 ${n3Info.name}`;
    n3Btn.onclick = () => {
        selection.style.display = 'none';
        openListeningN3SubMode();
    };
    grid.appendChild(n3Btn);
"""

if "const n3Info = courseConfig['listening_n3'];" not in content:
    content = content.replace(
        "    grid.appendChild(n4Btn);",
        "    grid.appendChild(n4Btn);\n" + n3_btn_code
    )

# 4. Add openListeningN3SubMode and _startListeningN3Mode
n3_submode_code = """
function openListeningN3SubMode() {
    const subSel = document.getElementById('sub-selection');
    subSel.style.display = 'flex';
    const grid = document.querySelector('#sub-selection .mode-grid');
    grid.innerHTML = `
        <button class="mode-btn highlight" style="background:#E0F7FA;" onclick="_startListeningN3Mode('learning')">📖 เรียน (Learning)</button>
        <button class="mode-btn highlight" style="background:#FFF9C4;" onclick="_startListeningN3Mode('quiz')">⚔️ ควิซ (Quiz)</button>
        <button class="mode-btn cancel" style="grid-column:span 2;"
            onclick="document.getElementById('sub-selection').style.display='none'; openListeningSelect();">ย้อนกลับ (Back)</button>
    `;
}

function _startListeningN3Mode(mode) {
    state.gameMode = mode;
    document.getElementById('sub-selection').style.display = 'none';
    openStorySelect('listening_n3');
}
"""

if "function openListeningN3SubMode()" not in content:
    content = content.replace(
        "function openListeningN4SubMode() {",
        n3_submode_code + "\nfunction openListeningN4SubMode() {"
    )

# 5. Fix all condition checks
# Look for places where `level === 'listening_n5' || level === 'listening_n4'` is checked
content = content.replace(
    "level === 'listening_n5' || level === 'listening_n4'",
    "level === 'listening_n5' || level === 'listening_n4' || level === 'listening_n3'"
)

# And `state.selectedLevel === 'listening_n5' || state.selectedLevel === 'listening_n4'`
content = content.replace(
    "state.selectedLevel === 'listening_n5' || state.selectedLevel === 'listening_n4'",
    "state.selectedLevel === 'listening_n5' || state.selectedLevel === 'listening_n4' || state.selectedLevel === 'listening_n3'"
)

# Fix maxScore setting
content = content.replace(
    "} else if (level === 'listening_n4') {\n            return listeningN4UnitInfo[storyNum]?.title || `Lesson ${storyNum}`;",
    "} else if (level === 'listening_n4') {\n            return listeningN4UnitInfo[storyNum]?.title || `Lesson ${storyNum}`;\n        } else if (level === 'listening_n3') {\n            return listeningN3UnitInfo[storyNum]?.title || `Lesson ${storyNum}`;"
)

# Fix levelPrefix
content = content.replace(
    "const levelPrefix = level === 'listening_n4' ? 'n4' : 'n5';",
    "const levelPrefix = level === 'listening_n3' ? 'n3' : (level === 'listening_n4' ? 'n4' : 'n5');"
)

# There's also `state.selectedLevel !== 'listening_n5' && state.selectedLevel !== 'listening_n4'`
content = content.replace(
    "state.selectedLevel !== 'listening_n5' && state.selectedLevel !== 'listening_n4'",
    "state.selectedLevel !== 'listening_n5' && state.selectedLevel !== 'listening_n4' && state.selectedLevel !== 'listening_n3'"
)

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Patch applied.")
