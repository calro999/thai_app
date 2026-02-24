import os
import re

for root, _, files in os.walk('/Users/calro/Desktop/タイ語学習アプリ'):
    if 'node_modules' in root or '.git' in root:
        continue
    for file in files:
        if file.endswith('.json'):
            file_path = os.path.join(root, file)
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                original_content = content
                # Correctly match katakana 'ラ'
                content = re.sub(r'(ドラえもん|どらえもん|ドラエモン)', '山田さん', content)
                content = re.sub(r'(ドラえもん|どらえもん|ドラエモン)社長', '山田さん', content) # just in case
                
                if content != original_content:
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"Fixed {file_path}")
            except Exception as e:
                pass
