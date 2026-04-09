import os
import re

WORKSPACE_DIR = '/Users/calro/Desktop/jlpt_thai_app'
BASE_URL = 'https://jlpt.yui-yuto.com/'

def apply_canonical_to_all():
    html_files = [f for f in os.listdir(WORKSPACE_DIR) if f.endswith('.html')]
    
    for file_name in html_files:
        if file_name == 'google403c7037defb5219.html': continue
        
        path = os.path.join(WORKSPACE_DIR, file_name)
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 正規化された名前 (拡張子なし、indexはなし)
        clean_name = file_name.replace('.html', '')
        if clean_name == 'index':
            canonical_url = BASE_URL
        else:
            canonical_url = f"{BASE_URL}{clean_name}"
        
        canonical_tag = f'<link rel="canonical" href="{canonical_url}">'
        
        # 既存のCanonicalタグを探して置換、なければ追加
        if 'rel="canonical"' in content:
            updated_content = re.sub(r'<link rel="canonical" href=".*?">', canonical_tag, content)
        else:
            updated_content = content.replace('</head>', f'    {canonical_tag}\n</head>')
            
        if updated_content != content:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(updated_content)
            print(f" Canonical fixed: {file_name}")

if __name__ == "__main__":
    apply_canonical_to_all()
