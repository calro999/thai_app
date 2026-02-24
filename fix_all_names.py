import os
import re

name_replacements = [
    (r'のび[た太](?:社長)?', '社長'),
    (r'[ドど]らえもん', '山田さん')
]

for root, _, files in os.walk('/Users/calro/Desktop/タイ語学習アプリ'):
    # Skip node_modules or similar if they exist, but we assume they don't or we don't care about a few files
    if 'node_modules' in root or '.git' in root:
        continue
    for file in files:
        if file.endswith('.json'):
            file_path = os.path.join(root, file)
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                original_content = content
                for pattern, replacement in name_replacements:
                    content = re.sub(pattern, replacement, content)
                
                if content != original_content:
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"Fixed names in {file_path}")
            except Exception as e:
                print(f"Error processing {file_path}: {e}")
