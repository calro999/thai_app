import json
import glob
import re

files = glob.glob('listening/jlpt_n3/*.json')
texts = set()

for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        try:
            data = json.load(file)
            # data has either 'data' or 'questions'
            if 'data' in data:
                for item in data['data']:
                    if 'dialogue' in item:
                        for step in item['dialogue']:
                            if 'text' in step:
                                texts.add(step['text'])
            if 'questions' in data:
                for item in data['questions']:
                    if 'audio_steps' in item:
                        for step in item['audio_steps']:
                            if 'text' in step:
                                texts.add(step['text'])
        except Exception as e:
            print(f"Error parsing {f}: {e}")

# Save to a file to easily read
with open('all_texts.txt', 'w', encoding='utf-8') as out:
    for t in sorted(list(texts)):
        out.write(t + "\n")

print(f"Extracted {len(texts)} unique texts.")
