import json
import glob
import re

# 1. Collect all focus_thai_key from study files
replacements = {
    "うっかり（うっかり）": "うっかり",
    "こそこそ（こそこそ）": "こそこそ",
    "どんより（どんより）": "どんより",
    "到底（とうてい）": "とうてい",
    "反して（はんして）": "はんして",
    "実際に（じっさいに）": "じっさいに",
    "需要（じゅよう）": "じゅよう",
    "有言実行（ゆうげんじっこう）": "ゆうげんじっこう",
    "にこにこ（にこにこ）": "にこにこ",
    "覆す（くつがえす）": "くつがえす",
    "きっぱり（きっぱり）": "きっぱり"
}

files = glob.glob('listening/jlpt_n3/*.json')

for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        data = json.load(file)
        if 'data' in data:
            for item in data['data']:
                key = item.get('focus_thai_key')
                if key:
                    m = re.search(r'（([ぁ-んァ-ンー]+)）', key)
                    if m:
                        replacements[key] = m.group(1)

# 2. Modify json files in place
modified_count = 0
for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        data = json.load(file)
        
    file_modified = False
    
    if 'data' in data:
        for item in data['data']:
            if 'dialogue' in item:
                for step in item['dialogue']:
                    if 'text' in step:
                        original = step['text']
                        for k, v in replacements.items():
                            step['text'] = step['text'].replace(k, v)
                        if original != step['text']:
                            file_modified = True

    if 'questions' in data:
        for item in data['questions']:
            if 'audio_steps' in item:
                for step in item['audio_steps']:
                    if 'text' in step:
                        original = step['text']
                        for k, v in replacements.items():
                            step['text'] = step['text'].replace(k, v)
                        if original != step['text']:
                            file_modified = True
                            
    if file_modified:
        with open(f, 'w', encoding='utf-8') as out:
            json.dump(data, out, ensure_ascii=False, indent=4)
            # Some formatters prefer a trailing newline
            out.write('\n')
        modified_count += 1

print(f"Successfully modified {modified_count} out of {len(files)} files.")
