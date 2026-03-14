import os
import re

def clean_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove the pushSocialBar script block
    new_content = re.sub(r'<script>\s*document\.addEventListener\("DOMContentLoaded", function\(\) \{\s*const pushSocialBar = setInterval\([\s\S]*?clearInterval\(pushSocialBar\), 10000\);\s*\}\);\s*</script>', '', content)
    
    # Remove any stray script tags that might contain Adsterra zones (generic check)
    # Adsterra Zone IDs are often 32-char hex strings or numeric
    # Let's search for the logic I found in some files:
    # <script type='text/javascript' src='//...js'></script>
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True
    return False

html_files = [f for f in os.listdir('.') if f.endswith('.html')]
count = 0
for f in html_files:
    if clean_file(f):
        print(f"Cleaned {f}")
        count += 1

print(f"Total files cleaned: {count}")
