import re
import os

app_js_path = "/Users/calro/Desktop/タイ語学習アプリ/app.js"

with open(app_js_path, "r", encoding="utf-8") as f:
    text = f.read()

# adding listening_n2 to courseConfig
if "'JLPT N2 Listening'" not in text:
    text = text.replace(
        "listening_n3: { name: 'JLPT N3 Listening', price: 'Free', points: 0 },",
        "listening_n3: { name: 'JLPT N3 Listening', price: 'Free', points: 0 },\n    listening_n2: { name: 'JLPT N2 Listening', price: 'Free', points: 0 },"
    )

# adding listeningN2UnitInfo
n2_unit_info = """
const listeningN2UnitInfo = {
    1: { title: "差し替える" },
    2: { title: "振り分ける" },
    3: { title: "平易" },
    4: { title: "中断" },
    5: { title: "トーン" },
    6: { title: "膨らむ" },
    7: { title: "効率" },
    8: { title: "概ね" },
    9: { title: "足踏み" },
    10: { title: "挽回" },
    11: { title: "詰め込み" },
    12: { title: "〜割" },
    13: { title: "後回し" },
    14: { title: "滞る" },
    15: { title: "先行研究" },
    16: { title: "引けを取らない" },
    17: { title: "経費で落とす" },
    18: { title: "キーワード (Keyword)" },
    19: { title: "キーワード (Keyword)" },
    20: { title: "キーワード (Keyword)" },
    21: { title: "キーワード (Keyword)" },
    22: { title: "キーワード (Keyword)" },
    23: { title: "キーワード (Keyword)" },
    24: { title: "キーワード (Keyword)" },
    25: { title: "キーワード (Keyword)" },
    26: { title: "キーワード (Keyword)" },
    27: { title: "キーワード (Keyword)" },
    28: { title: "キーワード (Keyword)" },
    29: { title: "キーワード (Keyword)" },
    30: { title: "正念場" }
};
"""
if "listeningN2UnitInfo =" not in text:
    text = text.replace(
        "const listeningN4UnitInfo = {",
        n2_unit_info + "\n\nconst listeningN4UnitInfo = {"
    )

# adding button for N2 in openListeningSelect
if "const n2Info = courseConfig['listening_n2'];" not in text:
    menu_html_addition = """
    const n2Info = courseConfig['listening_n2'];
    const n2PointsStr = n2Info.price === 'Free' ? 'Free' : `${n2Info.price} pts`;
    const n2LockStatus = isCourseUnlocked('listening_n2') ? '' : '<span class="lock-icon">🔒</span>';
"""
    menu_button_html = """
        <button class="menu-button" onclick="selectCourse('listening_n2')">
            <div class="course-info">
                <span class="course-name">🎧 JLPT N2 Listening</span>
                <span class="course-price">${n2LockStatus} ${n2PointsStr}</span>
            </div>
            <div class="progress-container"><div class="progress-bar" style="width: ${calculateCourseProgress('listening_n2')}%"></div></div>
        </button>"""
        
    text = text.replace(
        "const n3Info = courseConfig['listening_n3'];",
        menu_html_addition.strip() + "\n    const n3Info = courseConfig['listening_n3'];"
    )
    
    # insert before openStorySelect('listening_n3') button
    text = text.replace(
        '<button class="menu-button" onclick="selectCourse(\'listening_n3\')">',
        menu_button_html.strip() + "\n        " + '<button class="menu-button" onclick="selectCourse(\'listening_n3\')">'
    )


# array format lists
if "['n5', 'n4', 'n3', 'listening_n5', 'listening_n4', 'listening_n3']" in text:
    text = text.replace(
        "['n5', 'n4', 'n3', 'listening_n5', 'listening_n4', 'listening_n3']",
        "['n5', 'n4', 'n3', 'n2', 'listening_n5', 'listening_n4', 'listening_n3', 'listening_n2']"
    )

# simple patterns
patterns_to_replace = [
    ("level === 'listening_n5' || level === 'listening_n4' || level === 'listening_n3'", 
     "level === 'listening_n5' || level === 'listening_n4' || level === 'listening_n3' || level === 'listening_n2'"),
     
    ("state.selectedLevel === 'listening_n5' || state.selectedLevel === 'listening_n4' || state.selectedLevel === 'listening_n3'",
     "state.selectedLevel === 'listening_n5' || state.selectedLevel === 'listening_n4' || state.selectedLevel === 'listening_n3' || state.selectedLevel === 'listening_n2'"),
     
    ("state.selectedLevel !== 'listening_n5' && state.selectedLevel !== 'listening_n4' && state.selectedLevel !== 'listening_n3'",
     "state.selectedLevel !== 'listening_n5' && state.selectedLevel !== 'listening_n4' && state.selectedLevel !== 'listening_n3' && state.selectedLevel !== 'listening_n2'")
]

for old, new in patterns_to_replace:
    text = text.replace(old, new)


# unitTitle assignment
if "level === 'listening_n2'" not in text:
    text = text.replace(
        "} else if (level === 'listening_n3') {\n            unitTitle = listeningN3UnitInfo[i] ? listeningN3UnitInfo[i].title : `Level ${i}`;",
        "} else if (level === 'listening_n3') {\n            unitTitle = listeningN3UnitInfo[i] ? listeningN3UnitInfo[i].title : `Level ${i}`;\n        } else if (level === 'listening_n2') {\n            unitTitle = listeningN2UnitInfo[i] ? listeningN2UnitInfo[i].title : `Level ${i}`;"
    )

text = text.replace(
    "const levelPrefix = level === 'listening_n3' ? 'n3' : (level === 'listening_n4' ? 'n4' : 'n5');",
    "const levelPrefix = level === 'listening_n2' ? 'n2' : (level === 'listening_n3' ? 'n3' : (level === 'listening_n4' ? 'n4' : 'n5'));"
)

# one more array format check:
text = text.replace(
    "['n5', 'n4', 'n3'].includes(level)",
    "['n5', 'n4', 'n3', 'n2'].includes(level)"
)

# one more
if "['n5', 'n4', 'n3', 'listening_n5', 'listening_n4', 'listening_n3'].includes(level)" in text:
    pass # Already took care of above

with open(app_js_path, "w", encoding="utf-8") as f:
    f.write(text)

print("Patch applied.")
