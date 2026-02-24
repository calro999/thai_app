import json
import re
import os

for prefix in ['n5_study_level', 'n5_quiz_level']:
    for i in range(1, 31):
        file_path = f"listening/jlpt_n5/{prefix}{i}.json"
        
        if not os.path.exists(file_path):
            continue
            
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        data = json.loads(content)
        items = data.get('data', []) if 'study' in prefix else data.get('questions', [])
        
        modified_id = False
        for j, item in enumerate(items):
            actual_id = item.get('id')
            correct_id = (i - 1) * 10 + j + 1
            if actual_id != correct_id:
                item['id'] = correct_id
                modified_id = True
                
        if modified_id:
            # Re-serialize to update IDs
            content = json.dumps(data, ensure_ascii=False, indent=2)

        original_content = content
        
        # Replace occurrences as requested
        content = re.sub(r'のび[た太]社長', '社長', content)
        content = re.sub(r'のび[た太]', '社長', content)
        content = re.sub(r'[ドど]らえもん', '山田さん', content)
        
        if modified_id or content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content + '\n')
            print(f"Fixed {file_path}")
