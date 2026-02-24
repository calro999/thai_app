import json
import glob
import re

for prefix in ['n5_study_level', 'n5_quiz_level']:
    for i in range(1, 31):
        file = f"listening/jlpt_n5/{prefix}{i}.json"
        try:
            with open(file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            data = json.loads(content)
            items = data.get('data', []) if 'study' in prefix else data.get('questions', [])
            
            for j, item in enumerate(items):
                actual_id = item.get('id')
                correct_id = (i - 1) * 10 + j + 1
                if actual_id != correct_id:
                    print(f"ID Mismatch in {file} index {j}: expected {correct_id}, got {actual_id}")
            
            # Check names
            if re.search(r'のび[た太]', content) or re.search(r'[ドど]らえもん', content):
                print(f"Found name in {file}")

        except Exception as e:
            print(f"Error reading {file}: {e}")

