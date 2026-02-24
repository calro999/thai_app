import re
import json

with open('app.js', 'r', encoding='utf-8') as f:
    app_js = f.read()

# 1. Add JLPT N5 button in openListeningSelect
n5_btn_code = """
    // JLPT N5 (Listening)
    const n5Info = courseConfig['listening_n5'];
    const n5Btn = document.createElement('button');
    n5Btn.className = 'mode-btn highlight';
    n5Btn.style.background = '#F3E5F5';
    n5Btn.style.borderColor = '#AB47BC';
    n5Btn.style.color = '#6A1B9A';
    n5Btn.innerHTML = `🎓 ${n5Info.name}`;
    n5Btn.onclick = () => {
        selection.style.display = 'none';
        openListeningN5SubMode();
    };
    grid.appendChild(n5Btn);
"""
if "openListeningN5SubMode()" not in app_js:
    app_js = re.sub(r"(grid\.appendChild\(dsBtn\);)", r"\1\n" + n5_btn_code, app_js)

# 2. Add openListeningN5SubMode and _startListeningN5Mode
n5_submode_code = """
function openListeningN5SubMode() {
    const subSel = document.getElementById('sub-selection');
    subSel.style.display = 'flex';
    const grid = document.querySelector('#sub-selection .mode-grid');
    grid.innerHTML = `
        <button class="mode-btn highlight" style="background:#E0F7FA;" onclick="_startListeningN5Mode('learning')">📖 เรียน (Learning)</button>
        <button class="mode-btn highlight" style="background:#FFF9C4;" onclick="_startListeningN5Mode('quiz')">⚔️ ควิซ (Quiz)</button>
        <button class="mode-btn cancel" style="grid-column:span 2;"
            onclick="document.getElementById('sub-selection').style.display='none'; openListeningSelect();">ย้อนกลับ (Back)</button>
    `;
}

function _startListeningN5Mode(mode) {
    state.gameMode = mode;
    document.getElementById('sub-selection').style.display = 'none';
    openStorySelect('listening_n5');
}
"""
if "function openListeningN5SubMode" not in app_js:
    app_js = re.sub(r"(function _startDisasterMode.*?})", r"\1\n" + n5_submode_code, app_js, flags=re.DOTALL)

# 3. generate listeningN5UnitInfo
n5_units = []
for i in range(1, 31):
    try:
        with open(f'listening/jlpt_n5/n5_study_level{i}.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
            title = data['data'][0].get('focus_thai_key', f'Level {i}')
            title = title.replace('`', "'").replace('"', "'")
            n5_units.append(f"    {i}: {{ title: `{title}` }}")
    except Exception as e:
        n5_units.append(f"    {i}: {{ title: `Level {i}` }}")
n5_unit_info_code = "const listeningN5UnitInfo = {\n" + ",\n".join(n5_units) + "\n};\n"
if "const listeningN5UnitInfo = {" not in app_js:
    app_js = re.sub(r"(const disasterUnitInfo = \{.*?\};)", r"\1\n" + n5_unit_info_code, app_js, flags=re.DOTALL)

# 4. openStorySelect updates
if "if (level === 'listening_n5') count = 30;" not in app_js:
    app_js = re.sub(r"(if \(\['n5', 'n4', 'n3'\]\.includes\(level\)\) count = 20;)", r"\1\n    if (level === 'listening_n5') count = 30;", app_js)

if "if (level === 'listening_n5') maxScore = 10;" not in app_js:
    app_js = re.sub(r"(if \(level === 'disaster'\) maxScore = \(state\.gameMode === 'quiz'\) \? 5 : 10;)", r"\1\n        if (level === 'listening_n5') maxScore = 10;", app_js)

if "else if (level === 'listening_n5')" not in app_js:
    app_js = re.sub(r"(} else if \(level === 'disaster'\) \{[\s]+unitTitle = disasterUnitInfo\[i\].*?;[\s]+})", r"\1 else if (level === 'listening_n5') {\n            unitTitle = listeningN5UnitInfo[i] ? listeningN5UnitInfo[i].title : String(i);\n        }", app_js, flags=re.DOTALL)

if "|| level === 'listening_n5'" not in app_js:
    app_js = app_js.replace("|| level === 'disaster' || previewData.length > 0)", "|| level === 'disaster' || level === 'listening_n5' || previewData.length > 0)")


# 5. startUnit updates
if "path = `listening/jlpt_n5/n5_${modeStr}_level${unitNum}.json`;" not in app_js:
    app_js = re.sub(r"(} else if \(level === 'disaster'\) \{[\s]+const modeStr = \(state\.gameMode === 'quiz'\) \? 'quiz' : 'study';[\s]+path = `listening/disaster/disaster_l\$\{unitNum\}_\$\{modeStr\}\.json`;[\s]+})", r"\1 else if (level === 'listening_n5') {\n        const modeStr = (state.gameMode === 'quiz') ? 'quiz' : 'study';\n        path = `listening/jlpt_n5/n5_${modeStr}_level${unitNum}.json`;\n    }", app_js, flags=re.DOTALL)

if "state.storyData = payload" not in app_js:
    app_js = app_js.replace("state.storyData = await res.json();", """const payload = await res.json();
        if (level === 'listening_n5') {
            state.storyData = payload.data || payload.questions || [];
        } else {
            state.storyData = payload;
        }""")

# 6. loadScene Updates
if "if (state.selectedLevel === 'listening_n5')" not in app_js:
    # First modify step normalization
    step_norm_code = """
    // Normalize N5 fields
    if (state.selectedLevel === 'listening_n5') {
        if (state.gameMode === 'learning') {
            step.correct_answer = step.correct_answer || 'เข้าใจแล้ว (Next)';
            step.options = [step.correct_answer];
        } else {
            step.correct_answer = step.correct_answer || step.answer;
        }
    }
"""
    app_js = app_js.replace("const diag = document.getElementById('dialogue-text');", step_norm_code + "\    const diag = document.getElementById('dialogue-text');")

    # Replace render section using regex
    render_regex = r"(const titleStr = `\$\{state.selectedStoryNum\}`;[\s]+const isListening = \(state.gameMode === 'listening'\);[\s]+const qText = isListening \? \"🔊 ฟังอีกครั้ง \(Replay\)\" : \(step\.display_text \|\| ''\);[\s]+diag\.innerHTML = `<b style=\"font-size:1.1rem; color:#888;\">บทที่ \$\{titleStr\} - \$\{state\.gameMode\.toUpperCase\(\)\}<\/b><br>\$\{step\.dialogue \|\| ''\}<br><br>[\s]+<button class=\"mode-btn highlight\" style=\"font-size:1\.3rem; padding:12px 24px; width:auto; border-radius:15px; box-shadow:0 4px 0 #4DD0E1; cursor:pointer;\" onclick=\"replayAudio\(\)\">[\s]+\$\{qText\}[\s]+<\/button>`;)"
    
    listening_n5_render = """$1
        if (state.selectedLevel === 'listening_n5') {
            let n5Content = "";
            if (state.gameMode === 'learning') {
                n5Content = `<span style="color:#00796B;"><b>${step.focus_thai_key || ''}</b></span><br><br><span style="font-size:0.95rem;">${step.thai_explanation || ''}</span>`;
            } else {
                n5Content = `<span style="font-size:1.1rem;">🎧 กรุณาฟังบทสนทนาและเลือกคำตอบที่ถูกต้อง</span>`;
            }
            diag.innerHTML = `<b style="font-size:1.1rem; color:#888;">บทที่ ${titleStr} - N5 ${state.gameMode.toUpperCase()}</b><br><br>${n5Content}<br><br><button class="mode-btn highlight" style="font-size:1.3rem; padding:12px 24px; width:auto; border-radius:15px; box-shadow:0 4px 0 #4DD0E1; cursor:pointer;" onclick="replayAudio()">🔊 ฟัง (Play Audio)</button>`;
        }
"""
    app_js = re.sub(render_regex, listening_n5_render, app_js, flags=re.DOTALL)


# 7. Update audio playing
if "if (state.selectedLevel === 'listening_n5')" not in app_js:
    # Notice this replaces the default behavior locally in loadScene
    audio_trigger_regex = r"(const isJpDialogueCourse = \['business', 'disaster', 'number'\]\.includes\((?:state\.selectedLevel)\);[\s]+if \(!isListening\) \{[\s]+if \(isJpDialogueCourse\) \{[\s]+// dialogue.*?}[\s]+} else \{[\s]+speakJapanese\(audioTarget\);[\s]+}[\s]+// Store target for replay[\s]+state\.currentTargetAudio = audioTarget;)"
    
    audio_n5_code = """const isJpDialogueCourse = ['business', 'disaster', 'number'].includes(state.selectedLevel);
        if (state.selectedLevel === 'listening_n5') {
            const steps = step.audio_steps || step.dialogue || [];
            speakListeningN5Sequence(steps);
            state.currentTargetAudio = steps; // Store array for replay
        } else if (!isListening) {
            if (isJpDialogueCourse) {
                // dialogue・correct_answerが両方日本語のコース
                speakJapanese(step.dialogue || audioTarget);
            } else {
                speakSequence(step.dialogue || null, audioTarget || null);
            }
            state.currentTargetAudio = audioTarget;
        } else {
            speakJapanese(audioTarget);
            state.currentTargetAudio = audioTarget;
        }"""
    app_js = re.sub(audio_trigger_regex, audio_n5_code, app_js, flags=re.DOTALL)

# 8. Add speakListeningN5Sequence and rewrite replayAudio
if "function speakListeningN5Sequence" not in app_js:
    seq_code = """
function speakListeningN5Sequence(steps) {
    if (!steps || steps.length === 0) return;
    stopAllSpeech();
    let currentIdx = 0;
    
    function playNext() {
        if (currentIdx >= steps.length) return;
        const step = steps[currentIdx];
        const text = step.text;
        const role = step.role;

        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'ja-JP';
        
        const rate = parseFloat(state.ttsRate) || 0.8;
        u.rate = rate;
        
        if (role === 'man') {
            u.pitch = 0.8;
        } else if (role === 'woman') {
            u.pitch = 1.6;
        } else {
            u.pitch = 1.0;
        }

        u.onend = () => { currentIdx++; playNext(); };
        u.onerror = () => { currentIdx++; playNext(); };

        _uList.push(u);
        window.speechSynthesis.speak(u);
    }
    playNext();
}

function replayAudio() {
    if (state.currentTargetAudio) {
        if (Array.isArray(state.currentTargetAudio)) {
            speakListeningN5Sequence(state.currentTargetAudio);
        } else {
            speakJapanese(state.currentTargetAudio);
        }
    }
}
"""
    app_js = re.sub(r"function replayAudio\(\) \{.*?\}", "", app_js, flags=re.DOTALL) # remove old replayAudio
    app_js += seq_code

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(app_js)

