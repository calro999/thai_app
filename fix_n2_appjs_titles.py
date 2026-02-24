import json
import os
import re

n2_dir = "/Users/calro/Desktop/タイ語学習アプリ/listening/jlpt_n2"
titles = []

for lvl in range(1, 31):
    study_file = os.path.join(n2_dir, f"n2_study_level{lvl}.json")
    with open(study_file, "r", encoding="utf-8") as f:
        study_data = json.load(f)
        
    titles.append(study_data.get("title", f"Level {lvl}"))

# 1. Update n2_titles.js
with open(os.path.join(n2_dir, "n2_titles.js"), "w", encoding="utf-8") as f:
    f.write("const listeningN2UnitInfo = [\n")
    for t in titles:
        # replace any newlines or quotes that might break JS
        t_clean = t.replace('"', '').replace('\n', '')
        f.write(f'  {{ title: "{t_clean}" }},\n')
    f.write("];\n")

# 2. Patch app.js to replace the old listeningN2UnitInfo array
app_js_path = "/Users/calro/Desktop/タイ語学習アプリ/app.js"
with open(app_js_path, "r", encoding="utf-8") as f:
    text = f.read()

# We need to find the listeningN2UnitInfo dictionary and replace it
# Wait, currently listeningN2UnitInfo in app.js is a dictionary? Yes, it was created as { 1: {title: ...}, 2: ... }
# Let's replace the whole block.
pattern = re.compile(r'const listeningN2UnitInfo = \{.*?\};', re.DOTALL)

new_array_str = "const listeningN2UnitInfo = {\n"
for i, t in enumerate(titles, 1):
    t_clean = t.replace('"', '').replace('\n', '')
    new_array_str += f'    {i}: {{ title: "{t_clean}" }},\n'
new_array_str = new_array_str.rstrip(",\n") + "\n};"

text = pattern.sub(new_array_str, text)

with open(app_js_path, "w", encoding="utf-8") as f:
    f.write(text)

print("Updated app.js with the new titles for N2.")
